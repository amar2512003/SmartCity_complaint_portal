import { env } from '../config/env.js';
import { fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const BASE_SYSTEM_PROMPT = `You are the SmartCity Citizen Desk Assistant, a helpful guide embedded in a civic grievance portal.
You help citizens:
- Understand how to report a civic issue (title, category, description, optional photo and location).
- Pick the right category: Road, Water, Garbage, Street Light, or Other.
- Understand grievance statuses: "pending" (received, not yet reviewed), "in_progress" (being worked on), "resolved" (fixed), "rejected" (not actionable).
- Write clearer, more specific grievance descriptions when asked.

You cannot look up a citizen's account data, personal grievance records, or live status yourself — if asked, tell them to check "My Dashboard" and offer to help interpret what they find there.

Keep replies short, friendly, and practical (usually under 120 words) unless the citizen asks for detail. Use plain language, not jargon.

If a question is unrelated to the SmartCity portal, do not answer it. Politely state that you can only help with the SmartCity portal and its grievance services.`;

// The off-topic guardrail message and error/unavailable strings bypass the
// LLM entirely (see below), so they're translated via the shared t() helper
// like every other API response. The LLM's own replies are steered by this
// explicit instruction line instead, appended to the system prompt.
const LANGUAGE_INSTRUCTION = {
  en: 'Respond in English.',
  bn: 'Respond in Bengali (বাংলা), using the Bengali script for your entire reply.',
};

function buildSystemPrompt(lang) {
  return `${BASE_SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTION[lang] || LANGUAGE_INSTRUCTION.en}`;
}

// Simple guardrail to allow only SmartCity-related questions
const SMARTCITY_KEYWORDS = [
  'smartcity',
  'smart city',
  'grievance',
  'complaint',
  'dashboard',
  'login',
  'signup',
  'sign up',
  'otp',
  'photo',
  'camera',
  'location',
  'latitude',
  'longitude',
  'google maps',
  'municipal',
  'municipality',
  'district',
  'status',
  'track',
  'tracking',
  'category',
  'road',
  'water',
  'garbage',
  'street light',
];

function isSmartCityQuery(message) {
  const text = message.toLowerCase();
  return SMARTCITY_KEYWORDS.some((keyword) => text.includes(keyword));
}

// `req.body.lang` (sent explicitly by AiAssistant.jsx alongside the chat
// payload) takes priority since it reflects the exact UI language at the
// moment of sending; falls back to req.lang (resolved by locale.middleware.js
// from the X-App-Lang header) if absent or invalid.
function resolveChatLang(req) {
  const bodyLang = (req.body?.lang || '').toLowerCase();
  if (bodyLang === 'en' || bodyLang === 'bn') return bodyLang;
  return req.lang || 'en';
}

export async function chat(req, res) {
  const lang = resolveChatLang(req);

  try {
    if (!env.groqApiKey) {
      return fail(res, t('assistant:not_configured', lang), 503);
    }

    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return fail(res, t('assistant:messages_required', lang), 422);
    }

    // Guardrail: only gate the *first* message of a session with the strict
    // keyword check. Gating every message was rejecting normal conversational
    // follow-ups ("does that make sense?", "how long does it take?") that
    // don't happen to repeat a keyword, even mid-conversation about the
    // portal — which made the assistant look broken. Once a session is
    // underway, the system prompt's own off-topic instruction (line 18)
    // is enough to keep replies on-topic.
    const latestMessage = messages[messages.length - 1]?.content || '';
    const isFirstMessage = messages.length === 1;

    if (isFirstMessage && !isSmartCityQuery(latestMessage)) {
      return res.json({
        success: true,
        message: 'Success',
        data: {
          reply: t('assistant:off_topic_reply', lang),
        },
      });
    }

    // Keep the payload small: system prompt + last 12 turns from the client.
    const trimmed = messages.slice(-12).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }));

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        messages: [
          { role: 'system', content: buildSystemPrompt(lang) },
          ...trimmed,
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!groqRes.ok) {
      const detail = await groqRes.text().catch(() => '');
      console.error('Groq API error:', groqRes.status, detail);

      return fail(res, t('assistant:unavailable', lang), 502);
    }

    const data = await groqRes.json();

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return fail(res, t('assistant:empty_response', lang), 502);
    }

    return res.json({
      success: true,
      message: 'Success',
      data: { reply },
    });
  } catch (e) {
    console.error('Assistant chat error:', e);

    return fail(res, t('assistant:unreachable', lang), 500);
  }
}