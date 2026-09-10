import { env } from '../config/env.js';
import { fail } from '../utils/apiResponse.util.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are the SmartCity Citizen Desk Assistant, a helpful guide embedded in a civic grievance portal.
You help citizens:
- Understand how to report a civic issue (title, category, description, optional photo and location).
- Pick the right category: Road, Water, Garbage, Street Light, or Other.
- Understand grievance statuses: "pending" (received, not yet reviewed), "in_progress" (being worked on), "resolved" (fixed), "rejected" (not actionable).
- Write clearer, more specific grievance descriptions when asked.

You cannot look up a citizen's account data, personal grievance records, or live status yourself — if asked, tell them to check "My Dashboard" and offer to help interpret what they find there.

Keep replies short, friendly, and practical (usually under 120 words) unless the citizen asks for detail. Use plain language, not jargon.

If a question is unrelated to the SmartCity portal, do not answer it. Politely state that you can only help with the SmartCity portal and its grievance services.`;


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


export async function chat(req, res) {
  try {
    if (!env.groqApiKey) {
      return fail(
        res,
        'AI assistant is not configured. Ask the administrator to set GROQ_API_KEY.',
        503
      );
    }

    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return fail(res, 'messages array is required', 422);
    }

    // Guardrail: check only the latest user message
    const latestMessage = messages[messages.length - 1]?.content || '';

    if (!isSmartCityQuery(latestMessage)) {
      return res.json({
        success: true,
        message: 'Success',
        data: {
          reply:
            "I'm here to help with the SmartCity portal and civic grievance services. I can help you submit a grievance, track a complaint, understand categories, location capture, routing, or other SmartCity features.",
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
          { role: 'system', content: SYSTEM_PROMPT },
          ...trimmed,
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!groqRes.ok) {
      const detail = await groqRes.text().catch(() => '');
      console.error('Groq API error:', groqRes.status, detail);

      return fail(
        res,
        'The AI assistant is unavailable right now. Please try again shortly.',
        502
      );
    }

    const data = await groqRes.json();

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return fail(
        res,
        'The AI assistant returned an empty response.',
        502
      );
    }

    return res.json({
      success: true,
      message: 'Success',
      data: { reply },
    });
  } catch (e) {
    console.error('Assistant chat error:', e);

    return fail(
      res,
      'Could not reach the AI assistant.',
      500
    );
  }
}