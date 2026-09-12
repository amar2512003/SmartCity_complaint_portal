import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendChatMessage } from '../api/assistant.api';
import howrahBridge from '../assets/howrah-bridge.png';

// Turns **bold** markers and line breaks into real React elements.
// Deliberately minimal (no markdown lib) — just enough for the assistant's replies.
function formatMessage(text) {
  const lines = String(text).split('\n');

  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

    return (
      <span key={li}>
        {parts.map((part, pi) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={pi}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={pi}>{part}</span>
          )
        )}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function AiAssistant() {
  const { t, i18n } = useTranslation('citizen');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('assistant.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  // If the conversation is still just the untouched welcome message, keep it
  // in sync when the citizen switches language via the toggle. Once the
  // citizen has actually chatted, we leave prior turns alone rather than
  // rewriting message history underneath them.
  useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].role === 'assistant'
        ? [{ role: 'assistant', content: t('assistant.welcome') }]
        : m
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.resolvedLanguage]);

  const send = async (e) => {
    e.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    const next = [
      ...messages,
      { role: 'user', content: text },
    ];

    setMessages(next);
    setInput('');
    setErr('');
    setLoading(true);

    try {
      const r = await sendChatMessage(next.slice(-12), i18n.resolvedLanguage);

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: r.data.data.reply,
        },
      ]);
    } catch (e) {
      setErr(
        e.response?.data?.message || t('assistant.connectionError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      {open && (
        <div className="ai-panel panel">
          <div className="ai-panel-head">
            <div className="ai-panel-title">

              {/* Howrah Bridge icon shown only when chat is open */}
              <span className="ai-avatar">
                <img
                  src={howrahBridge}
                  alt={t('assistant.howrahBridgeAlt')}
                  className="assistant-icon-image"
                />
              </span>

              <div>
                <strong>{t('assistant.title')}</strong>
                <span>{t('assistant.poweredBy')}</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label={t('assistant.closePanelAria')}
            >
              ✕
            </button>
          </div>

          <div className="ai-body">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`ai-bubble ${m.role}`}
              >
                {formatMessage(m.content)}
              </div>
            ))}

            {loading && (
              <div className="ai-bubble assistant ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            {err && (
              <div
                className="message error"
                style={{ margin: '4px 14px' }}
              >
                {err}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            className="ai-input-row"
            onSubmit={send}
          >
            <input
              placeholder={t('assistant.inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || !input.trim()}
            >
              {t('assistant.send')}
            </button>
          </form>
        </div>
      )}

      {/* Floating button remains the diamond when closed */}
      <button
        type="button"
        className="ai-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          open
            ? t('assistant.closeFabAria')
            : t('assistant.openFabAria')
        }
      >
        {open ? '✕' : '✦'}
      </button>
    </div>
  );
}
