import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../api/assistant.api';
import howrahBridge from '../assets/howrah-bridge.png';

const WELCOME =
  "Hi! I'm your Citizen Desk assistant. Ask me how to report an issue, which category to pick, or what a status like \"in progress\" means.";

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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
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
      const r = await sendChatMessage(next.slice(-12));

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: r.data.data.reply,
        },
      ]);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Couldn't reach the assistant. Please try again."
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
                  alt="Howrah Bridge"
                  className="assistant-icon-image"
                />
              </span>

              <div>
                <strong>Citizen Desk Assistant</strong>
                <span>Powered by OpenAI</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
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
              placeholder="Ask about reporting an issue…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || !input.trim()}
            >
              Send
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
            ? 'Close AI assistant'
            : 'Open AI assistant'
        }
      >
        {open ? '✕' : '✦'}
      </button>
    </div>
  );
}