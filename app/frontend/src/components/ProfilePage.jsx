import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { MapPin, ThumbsUp, CheckCircle, Edit2, Save, X, Bell, BellOff, Trophy, Link, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CAT_COLORS = { landmark: "#FFE600", hideout: "#FF007F", business: "#00E5FF", easter_egg: "#39FF14", scenic: "#00BFFF", criminal: "#FF2A2A", other: "#aaa" };

function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} data-testid={`toggle-${label}`}
      className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 focus:outline-none"
      style={{ background: checked ? "#FF007F" : "rgba(255,255,255,0.08)", border: `1px solid ${checked ? "#FF007F" : "rgba(255,255,255,0.15)"}`, boxShadow: checked ? "0 0 10px rgba(255,0,127,0.4)" : "none" }}>
      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-200 shadow-sm"
        style={{ left: checked ? "26px" : "4px" }} />
    </button>
  );
}

export default function ProfilePage() {
  const { user, getHeaders, openAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [emailUpvote, setEmailUpvote] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get(`${API}/auth/me`, { headers: getHeaders() }),
      axios.get(`${API}/users/${user.id}/stats`, { headers: getHeaders() }),
      axios.get(`${API}/users/me/pins`, { headers: getHeaders() }),
    ]).then(([p, s, pi]) => {
      setProfile(p.data);
      setEditName(p.data.display_name || p.data.username);
      setEditEmail(p.data.email || "");
      setEmailUpvote(p.data.prefs?.email_upvote ?? true);
      setEmailVerified(p.data.prefs?.email_verified ?? true);
      setStats(s.data);
      setPins(pi.data);
    }).finally(() => setLoading(false));
  }, [user, getHeaders]);

  const savePrefs = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/auth/me/preferences`, {
        display_name: editName,
        email: editEmail || null,
        email_upvote: emailUpvote,
        email_verified: emailVerified,
      }, { headers: getHeaders() });
      setProfile(data);
      setEditingName(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error("Save preferences failed:", err); }
    finally { setSaving(false); }
  };

  if (!user) return (
    <div className="page-content min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="glass-panel p-10 text-center max-w-md">
        <Trophy size={36} className="text-[#FFE600] mx-auto mb-4 opacity-60" />
        <h2 className="font-heading text-2xl text-white mb-2">Sign In Required</h2>
        <p className="font-body text-gray-400 text-sm mb-5">Log in to view your profile, stats, and pin collection.</p>
        <button onClick={openAuth} className="btn-primary mx-auto" data-testid="profile-login-btn">Join Honest John's</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="page-content min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 size={28} className="text-[#FF007F] animate-spin" />
    </div>
  );

  const badge = stats?.badge;
  const displayName = profile?.display_name || profile?.username || user.username;
  const avatarColor = profile?.avatar_color || user.avatar_color || "#FF007F";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* ── HERO HEADER ── */}
        <div className="glass-panel p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{ borderColor: `${avatarColor}30`, boxShadow: `0 0 40px ${avatarColor}15` }}>
          {/* Big avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-heading text-2xl sm:text-3xl text-white flex-shrink-0"
            style={{ background: `${avatarColor}25`, border: `3px solid ${avatarColor}`, boxShadow: `0 0 20px ${avatarColor}60` }}>
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {/* Name edit inline */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              {editingName ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="bg-[#0a0a14] border border-[#FF007F] text-white text-xl font-heading rounded-lg px-3 py-1 focus:outline-none"
                    style={{ maxWidth: "220px" }} data-testid="edit-display-name" />
                  <button onClick={() => setEditingName(false)} className="text-gray-500 hover:text-white p-1"><X size={16} /></button>
                </>
              ) : (
                <>
                  <h1 className="font-heading text-2xl sm:text-3xl text-white">{displayName}</h1>
                  <button onClick={() => setEditingName(true)} className="text-gray-600 hover:text-[#FF007F] p-1 transition-colors" data-testid="edit-name-btn">
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
            <p className="font-body text-gray-500 text-sm mb-2">@{profile?.username}</p>
            {badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}40` }}>
                <span className="text-sm">{badge.icon}</span>
                <span className="font-heading text-sm" style={{ color: badge.color }}>{badge.name}</span>
              </div>
            )}
            <p className="font-body text-gray-600 text-xs mt-2">Member since {profile?.created_at?.slice(0, 10) || "2026"}</p>
          </div>
          {profile?.role === "admin" && (
            <span className="px-3 py-1 rounded-lg font-heading text-xs bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40 self-start">
              ADMIN
            </span>
          )}
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Pins Submitted", value: stats?.pois_submitted ?? 0, icon: MapPin, color: "#FF007F" },
            { label: "Upvotes Received", value: stats?.total_upvotes ?? 0, icon: ThumbsUp, color: "#00E5FF" },
            { label: "Verified Pins", value: stats?.verified_pois ?? 0, icon: CheckCircle, color: "#39FF14" },
            { label: "Total Score", value: stats?.score ?? 0, icon: Trophy, color: "#FFE600" },
          ].map(s => (
            <div key={s.label} className="glass-panel p-4 text-center" data-testid={`profile-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <s.icon size={18} style={{ color: s.color }} className="mx-auto mb-1.5" />
              <p className="font-heading text-2xl text-white">{s.value}</p>
              <p className="font-body text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── SETTINGS PANEL ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5" data-testid="profile-settings">
              <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-4">Profile Settings</p>

              {/* Display Name */}
              <div className="mb-4">
                <label className="font-body text-gray-400 text-xs block mb-1.5">Display Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg px-3 py-2 font-body focus:border-[#FF007F] focus:outline-none transition-colors"
                  placeholder="Your display name" data-testid="profile-display-name" />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="font-body text-gray-400 text-xs block mb-1.5">Email <span className="text-gray-600 font-normal">(for notifications)</span></label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg px-3 py-2 font-body focus:border-[#FF007F] focus:outline-none transition-colors"
                  placeholder="your@email.com" data-testid="profile-email" />
              </div>

              {/* Email Preferences */}
              <div className="border-t border-white/10 pt-4 mb-5">
                <p className="font-body text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Bell size={11} />Email Notifications
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-white text-sm">Pin Upvotes</p>
                      <p className="font-body text-gray-600 text-xs">Alert when someone upvotes your pin</p>
                    </div>
                    <Toggle checked={emailUpvote} onChange={setEmailUpvote} label="upvote" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-white text-sm">Pin Verified</p>
                      <p className="font-body text-gray-600 text-xs">Alert when your pin reaches 3+ upvotes</p>
                    </div>
                    <Toggle checked={emailVerified} onChange={setEmailVerified} label="verified" />
                  </div>
                  {!emailUpvote && !emailVerified && (
                    <div className="flex items-center gap-2 text-xs text-[#FFE600] font-body">
                      <BellOff size={11} />All notifications disabled
                    </div>
                  )}
                </div>
              </div>

              <button onClick={savePrefs} disabled={saving} data-testid="save-preferences-btn"
                className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 text-sm">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
              {saved && <p className="text-center text-[#39FF14] text-xs font-body mt-2">✓ Profile updated successfully</p>}
            </div>

            {/* Share profile / widget link */}
            <div className="glass-panel p-4 flex items-center gap-3" style={{ borderColor: "rgba(0,229,255,0.2)" }}>
              <Link size={16} className="text-[#00E5FF] flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-body text-white text-sm">Launch Countdown Widget</p>
                <p className="font-body text-gray-500 text-xs">Embed the GTA 6 countdown on any site</p>
              </div>
              <a href="/widget" target="_blank"
                className="text-xs font-heading px-2 py-1 rounded flex-shrink-0 transition-colors"
                style={{ background: "rgba(0,229,255,0.15)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.3)" }}>
                Open
              </a>
            </div>
          </div>

          {/* ── RECENT PINS ── */}
          <div className="lg:col-span-3">
            <div className="glass-panel p-5 h-full">
              <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-4">
                Your Pins · {pins.length} submitted
              </p>
              {pins.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <MapPin size={32} className="text-gray-700 mb-3" />
                  <p className="font-heading text-white text-base mb-1">No pins yet</p>
                  <p className="font-body text-gray-600 text-sm">Head to the map and add your first community pin!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {pins.map(pin => {
                    const color = CAT_COLORS[pin.category] || "#aaa";
                    return (
                      <div key={pin.id} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/3"
                        style={{ border: "1px solid rgba(255,255,255,0.05)" }} data-testid={`profile-pin-${pin.id}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                          <MapPin size={14} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <p className="font-heading text-white text-sm truncate">{pin.name}</p>
                            {pin.verified && <span className="flex items-center gap-0.5 text-[10px] text-[#39FF14]"><CheckCircle size={9} />Verified</span>}
                          </div>
                          {pin.description && <p className="font-body text-gray-600 text-xs line-clamp-1">{pin.description}</p>}
                          <div className="flex items-center gap-3 mt-1 text-xs font-body text-gray-600">
                            <span style={{ color }}>{pin.category}</span>
                            <span className="flex items-center gap-0.5"><ThumbsUp size={9} />{pin.upvote_count || 0}</span>
                            <span>{pin.region}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
