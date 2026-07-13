import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello. I can help categorize issues, explain complaint status, and guide you through the portal.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const askBot = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    const nextMessages = [...messages, { role: "citizen", content: message }];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, { message });
      setMessages([...nextMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: err.response?.data?.reply || "I could not reach the assistant right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[560px] w-[min(94vw,410px)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-sky-200">Groq powered</p>
                <h2 className="mt-1 text-lg font-bold">Smart City Assistant</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                  item.role === "citizen"
                    ? "ml-auto bg-sky-700 text-white"
                    : "mr-auto border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {item.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[88%] rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Assistant is typing...
              </div>
            )}
          </div>

          <form onSubmit={askBot} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                placeholder="Ask how to report an issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-3 text-sm"
              />
              <button className="rounded-md bg-sky-700 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800">
                Send
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-full bg-slate-950 px-5 py-4 font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-sm">AI</span>
        <span>Assistant</span>
      </button>
    </div>
  );
}

export default ChatBot;
