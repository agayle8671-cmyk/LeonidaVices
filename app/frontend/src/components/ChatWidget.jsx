import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, MessageCircle, ChevronDown } from "lucide-react";
import { generateResponse, resetConversation } from "../lib/chatEngine";

const AVATAR = "https://images.pexels.com/photos/8891417/pexels-photo-8891417.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200";

const STARTERS = [
  "Tell me about Vice City",
  "Is Leonida safe to visit?",
  "What's the best route to the Keys?",
  "Tell me about Grassrivers wildlife",
  "When does GTA 6 come out?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Greetings, valued tourist! I'm Honest John — proprietor of Leonida's most prestigious (and only) travel agency. Where can I direct your vacation dollars today? Ask me anything about Leonida, Vice City, or the upcoming GTA 6 release!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Reset engine state when chat panel is freshly opened
  useEffect(() => {
    if (open && messages.length === 1) {
      resetConversation();
    }
  }, [open, messages.length]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    // Simulate a brief "thinking" delay for natural feel
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 800));

    try {
      const response = generateResponse(msg, messages);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Apologies, I appear to be 'negotiating' with the local authorities at the moment. Try again shortly! — Honest John",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => setOpen(!open)}
        data-testid="chat-open-btn"
        className="fixed bottom-20 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        style={{
          background: open
            ? "linear-gradient(135deg, #333, #111)"
            : "radial-gradient(circle at 30% 30%, #FF007F, #cc0066)",
          boxShadow: open
            ? "0 4px 15px rgba(0,0,0,0.5)"
            : "0 0 25px rgba(255,0,127,0.7), 0 0 50px rgba(255,0,127,0.3)",
        }}
      >
        {open ? <ChevronDown size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {/* ── CHAT PANEL ── */}
      {open && (
        <div
          className="fixed bottom-36 right-6 z-[9999] w-[360px] max-h-[560px] flex flex-col rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ boxShadow: "0 0 40px rgba(255,0,127,0.3), 0 20px 60px rgba(0,0,0,0.8)", border: "1px solid rgba(255,0,127,0.4)" }}
          data-testid="chat-panel"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0F0C29, #1a0a2a)", borderBottom: "1px solid rgba(255,0,127,0.3)" }}>
            <div className="relative flex-shrink-0">
              <img src={AVATAR} alt="Honest John" className="w-10 h-10 rounded-full object-cover"
                style={{ border: "2px solid #FFE600", boxShadow: "0 0 10px rgba(255,230,0,0.5)" }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#39FF14] border-2 border-[#0F0C29]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-white text-sm leading-none">Honest John</p>
              <p className="font-accent text-[#FFE600] text-xs">Travel Advisor™ · Local AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1"
              data-testid="chat-close-btn">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
            style={{ background: "radial-gradient(ellipse at top, #0F0C29, #050505)" }}>
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                data-testid={`chat-message-${msg.role}-${i}`}>
                {msg.role === "assistant" && (
                  <img src={AVATAR} alt="HJ" className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end"
                    style={{ border: "1px solid #FFE600" }} />
                )}
                <div className="max-w-[80%]">
                  <div
                    className="px-3 py-2.5 rounded-2xl text-sm font-body leading-relaxed"
                    style={msg.role === "assistant" ? {
                      background: "rgba(15,12,41,0.9)",
                      border: "1px solid rgba(255,0,127,0.3)",
                      color: "#e5e7eb",
                      borderBottomLeftRadius: "4px",
                    } : {
                      background: "linear-gradient(135deg, #00E5FF20, #00E5FF10)",
                      border: "1px solid rgba(0,229,255,0.4)",
                      color: "#e5e7eb",
                      borderBottomRightRadius: "4px",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <img src={AVATAR} alt="HJ" className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end"
                  style={{ border: "1px solid #FFE600" }} />
                <div className="px-3 py-2.5 rounded-2xl flex items-center gap-2"
                  style={{ background: "rgba(15,12,41,0.9)", border: "1px solid rgba(255,0,127,0.3)" }}>
                  <Loader2 size={14} className="text-[#FF007F] animate-spin" />
                  <span className="text-gray-400 text-xs">Honest John is consulting his files...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter prompts */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide"
              style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-body flex-shrink-0 transition-colors"
                  style={{ background: "rgba(255,0,127,0.1)", border: "1px solid rgba(255,0,127,0.3)", color: "#FF007F" }}
                  data-testid={`starter-${s.slice(0, 15).replace(/\s/g, "-")}`}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 flex gap-2 flex-shrink-0"
            style={{ background: "#0a0a14", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Honest John about Leonida..."
              disabled={loading}
              data-testid="chat-input"
              className="flex-1 bg-[#0F0C29] border border-white/10 text-white text-sm rounded-xl px-3 py-2 font-body placeholder-gray-600 focus:border-[#FF007F] focus:outline-none focus:ring-1 focus:ring-[#FF007F]/30 transition-colors"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              data-testid="chat-send-btn"
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
              style={{ background: "#FF007F", boxShadow: "0 0 10px rgba(255,0,127,0.4)" }}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
