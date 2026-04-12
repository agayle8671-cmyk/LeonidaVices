import { useState } from "react";
import { X, User, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (tab === "register") {
      if (password !== confirmPw) { setError("Passwords don't match"); return; }
      if (username.length < 3) { setError("Username must be at least 3 characters"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    }
    setLoading(true);
    try {
      if (tab === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, email.trim() || null);
        setSuccess("Welcome to Honest John's Travel Agency! Account created.");
      }
      setTimeout(onClose, 600);
    } catch (e) {
      const detail = e?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-panel p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: "rgba(255,0,127,0.4)", boxShadow: "0 0 40px rgba(255,0,127,0.2)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl text-white">
              {tab === "login" ? "Welcome Back" : "Join the Agency"}
            </h2>
            <p className="font-accent text-[#FFE600] text-sm">
              {tab === "login" ? "Log in to Honest John's" : "Create your explorer account"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1.5 transition-colors" data-testid="auth-modal-close">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              data-testid={`auth-tab-${t}`}
              className={`flex-1 py-2 rounded-md text-sm font-heading transition-all ${tab === t ? "bg-[#FF007F] text-white shadow-[0_0_10px_rgba(255,0,127,0.4)]" : "text-gray-400 hover:text-white"}`}>
              {t === "login" ? "Log In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="font-body text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your explorer handle"
                required
                autoFocus
                data-testid="auth-username-input"
                className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 font-body focus:border-[#FF007F] focus:outline-none focus:ring-1 focus:ring-[#FF007F]/30 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-body text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === "register" ? "At least 6 characters" : "Your password"}
                required
                data-testid="auth-password-input"
                className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 font-body focus:border-[#FF007F] focus:outline-none focus:ring-1 focus:ring-[#FF007F]/30 transition-colors"
              />
            </div>
          </div>

          {/* Confirm password */}
          {tab === "register" && (
            <div>
              <label className="font-body text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat password" required data-testid="auth-confirm-password-input"
                  className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 font-body focus:border-[#FF007F] focus:outline-none transition-colors" />
              </div>
            </div>
          )}

          {/* Email (register only, optional) */}
          {tab === "register" && (
            <div>
              <label className="font-body text-gray-400 text-xs uppercase tracking-wider block mb-1.5">
                Email <span className="text-gray-600 font-normal normal-case">(optional — for pin notifications)</span>
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  data-testid="auth-email-input"
                  className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 font-body focus:border-[#FF007F] focus:outline-none transition-colors placeholder-gray-700" />
              </div>
              <p className="font-body text-gray-700 text-xs mt-1">Get notified when your Leonida pins get upvoted or verified</p>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-[#FF007F] font-body" data-testid="auth-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-[#39FF14] font-body" data-testid="auth-success">
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} data-testid="auth-submit-btn"
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Please wait..." : tab === "login" ? "Log In to Leonida" : "Create Account"}
          </button>
        </form>

        {/* Admin hint */}
        <p className="font-body text-gray-700 text-xs text-center mt-4">
          {tab === "login" ? "Admin login available for moderation panel" : "Min 3 chars username · Min 6 chars password"}
        </p>
      </div>
    </div>
  );
}
