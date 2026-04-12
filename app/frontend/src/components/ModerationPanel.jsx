import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, CheckCircle, Trash2, Flag, AlertTriangle, Loader2, Eye, EyeOff, RefreshCw, Rocket, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLaunch } from "../contexts/LaunchContext";
import { Link } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CAT_COLORS = { landmark: "#FFE600", hideout: "#FF007F", business: "#00E5FF", easter_egg: "#39FF14", scenic: "#00BFFF", criminal: "#FF2A2A", other: "#aaa" };

export default function ModerationPanel() {
  const { user, getHeaders, openAuth } = useAuth();
  const { isLaunched, activateCelebration, resetForTesting } = useLaunch();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [launchStatus, setLaunchStatus] = useState(null);
  const [launchToggling, setLaunchToggling] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadPois = async () => {
    if (!isAdmin) return;
    try {
      const [poisRes, statusRes] = await Promise.all([
        axios.get(`${API}/admin/pois`, { headers: getHeaders() }),
        axios.get(`${API}/system/launch-status`),
      ]);
      setPois(poisRes.data);
      setLaunchStatus(statusRes.data);
    } catch (err) { console.error("Failed to load admin data:", err); }
    finally { setLoading(false); }
  };

  const toggleLaunch = async () => {
    const newState = !launchStatus?.manual_override;
    setLaunchToggling(true);
    try {
      await axios.put(`${API}/system/launch-status`, { launched: newState }, { headers: getHeaders() });
      setLaunchStatus(prev => ({ ...prev, manual_override: newState, launched: prev?.auto_launched || newState }));
      if (newState) activateCelebration();
      else resetForTesting();
    } catch (err) { console.error("Launch toggle failed:", err); }
    finally { setLaunchToggling(false); }
  };

  useEffect(() => { loadPois(); }, [isAdmin]);

  const handleApprove = async (poi_id) => {
    setActionLoading(poi_id + "_approve");
    try {
      await axios.put(`${API}/admin/pois/${poi_id}/approve`, {}, { headers: getHeaders() });
      setPois(prev => prev.map(p => p.id === poi_id ? { ...p, hidden: false, flags: [], flag_count: 0, approved: true } : p));
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (poi_id) => {
    if (!window.confirm("Delete this pin permanently?")) return;
    setActionLoading(poi_id + "_delete");
    try {
      await axios.delete(`${API}/admin/pois/${poi_id}/admin`, { headers: getHeaders() });
      setPois(prev => prev.filter(p => p.id !== poi_id));
    } finally { setActionLoading(null); }
  };

  const filtered = pois.filter(p => {
    if (filter === "flagged") return p.flag_count > 0;
    if (filter === "hidden") return p.hidden;
    if (filter === "verified") return p.verified;
    return true;
  });

  const stats = {
    total: pois.length,
    flagged: pois.filter(p => p.flag_count > 0).length,
    hidden: pois.filter(p => p.hidden).length,
    verified: pois.filter(p => p.verified).length,
  };

  if (!user) {
    return (
      <div className="page-content min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="glass-panel p-10 text-center max-w-md">
          <Shield size={40} className="text-[#FF007F] mx-auto mb-4 opacity-50" />
          <h2 className="font-heading text-2xl text-white mb-2">Authentication Required</h2>
          <p className="font-body text-gray-400 text-sm mb-5">Log in as admin to access the moderation panel.</p>
          <button onClick={openAuth} className="btn-primary mx-auto" data-testid="mod-login-btn">Login</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-content min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="glass-panel p-10 text-center max-w-md">
          <AlertTriangle size={40} className="text-[#FFE600] mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-white mb-2">Access Denied</h2>
          <p className="font-body text-gray-400 text-sm mb-5">This panel requires admin privileges. You are logged in as <span className="text-[#FF007F]">{user.username}</span>.</p>
          <Link to="/map"><button className="btn-secondary">Back to Map</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="font-accent text-[#FF007F] text-base">Admin Access</p>
            <h1 className="font-heading text-3xl sm:text-4xl text-white">Moderation Panel</h1>
            <p className="font-body text-gray-500 text-sm mt-1">Logged in as <span className="text-[#FFE600]">{user.username}</span> (Admin)</p>
          </div>
          <button onClick={loadPois} data-testid="mod-refresh-btn"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-heading glass-panel text-gray-300 hover:text-white transition-colors">
            <RefreshCw size={13} />Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: "all", label: "All Pins", value: stats.total, color: "#00E5FF" },
            { key: "flagged", label: "Flagged", value: stats.flagged, color: "#FFE600" },
            { key: "hidden", label: "Hidden", value: stats.hidden, color: "#FF007F" },
            { key: "verified", label: "Verified", value: stats.verified, color: "#39FF14" },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} data-testid={`mod-filter-${s.key}`}
              className="glass-panel p-3 text-center transition-all"
              style={{ borderColor: filter === s.key ? s.color : "rgba(255,255,255,0.05)" }}>
              <p className="font-heading text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="font-body text-gray-500 text-xs">{s.label}</p>
            </button>
          ))}
        </div>

        {/* ── LAUNCH CONTROLS ── */}
        <div className="glass-panel p-4 mb-6"
          style={{ borderColor: launchStatus?.launched ? "rgba(57,255,20,0.4)" : "rgba(255,165,0,0.25)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Rocket size={14} className="text-[#FFE600]" />
                <p className="font-heading text-white text-sm">GTA 6 Launch Day Controls</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-body text-gray-500">
                <span>Auto: <span className={launchStatus?.auto_launched ? "text-[#39FF14]" : "text-gray-600"}>{launchStatus?.auto_launched ? "LIVE" : "Not yet"}</span></span>
                <span>Manual: <span className={launchStatus?.manual_override ? "text-[#39FF14]" : "text-gray-600"}>{launchStatus?.manual_override ? "ON" : "OFF"}</span></span>
                <span>State: <strong className={launchStatus?.launched ? "text-[#39FF14]" : "text-gray-400"}>{launchStatus?.launched ? "LAUNCHED" : "Pre-launch"}</strong></span>
              </div>
            </div>
            <button onClick={toggleLaunch} disabled={launchToggling} data-testid="launch-toggle-btn"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-heading transition-all disabled:opacity-50 flex-shrink-0"
              style={{
                background: launchStatus?.manual_override ? "rgba(255,0,127,0.15)" : "rgba(57,255,20,0.15)",
                border: `1px solid ${launchStatus?.manual_override ? "rgba(255,0,127,0.5)" : "rgba(57,255,20,0.5)"}`,
                color: launchStatus?.manual_override ? "#FF007F" : "#39FF14",
              }}>
              {launchToggling ? <Loader2 size={12} className="animate-spin" /> : launchStatus?.manual_override ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              {launchStatus?.manual_override ? "Disable Launch" : "Trigger Launch!"}
            </button>
          </div>
          <p className="font-body text-gray-700 text-xs mt-2">
            Activating fires the celebration overlay + LIVE banner sitewide. Use <code className="text-gray-600 text-[10px]">?celebrate=1</code> URL param to preview without saving.
          </p>
        </div>

        {/* Pins list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-[#FF007F] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-10 text-center">
            <CheckCircle size={32} className="text-[#39FF14] mx-auto mb-3" />
            <p className="font-heading text-white text-lg">All Clear</p>
            <p className="font-body text-gray-500 text-sm">No pins match this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(poi => (
              <div key={poi.id} data-testid={`mod-pin-${poi.id}`}
                className="glass-panel p-4"
                style={{ borderColor: poi.hidden ? "rgba(255,0,127,0.3)" : poi.flag_count > 0 ? "rgba(255,230,0,0.3)" : "rgba(255,255,255,0.05)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ background: CAT_COLORS[poi.category] || "#aaa" }} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-heading text-white text-base">{poi.name}</p>
                        <span className="text-xs font-body px-1.5 py-0.5 rounded"
                          style={{ background: `${CAT_COLORS[poi.category] || "#aaa"}20`, color: CAT_COLORS[poi.category] || "#aaa" }}>
                          {poi.category}
                        </span>
                        {poi.hidden && <span className="text-xs px-1.5 py-0.5 rounded bg-[#FF007F]/20 text-[#FF007F] flex items-center gap-1"><EyeOff size={9} />Hidden</span>}
                        {poi.verified && <span className="text-xs px-1.5 py-0.5 rounded bg-[#39FF14]/20 text-[#39FF14] flex items-center gap-1"><CheckCircle size={9} />Verified</span>}
                        {poi.flag_count > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-[#FFE600]/20 text-[#FFE600] flex items-center gap-1"><Flag size={9} />{poi.flag_count} flags</span>}
                      </div>
                      {poi.description && <p className="font-body text-gray-500 text-xs mb-1 line-clamp-2">{poi.description}</p>}
                      <div className="flex flex-wrap gap-3 text-xs font-body text-gray-600">
                        <span>By: {poi.submitter_name || "Anonymous"}</span>
                        <span>Region: {poi.region}</span>
                        <span>Upvotes: {poi.upvote_count || 0}</span>
                        <span>SVG: ({Math.round(poi.x)}, {Math.round(poi.y)})</span>
                      </div>
                      {poi.flags && poi.flags.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {poi.flags.map((f, i) => (
                            <div key={i} className="text-xs font-body text-[#FFE600] flex items-center gap-1">
                              <Flag size={9} />{f.username}: "{f.reason}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {poi.hidden && (
                      <button onClick={() => handleApprove(poi.id)}
                        disabled={actionLoading === poi.id + "_approve"}
                        data-testid={`mod-approve-${poi.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all"
                        style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.4)", color: "#39FF14" }}>
                        {actionLoading === poi.id + "_approve" ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(poi.id)}
                      disabled={actionLoading === poi.id + "_delete"}
                      data-testid={`mod-delete-${poi.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all"
                      style={{ background: "rgba(255,0,127,0.12)", border: "1px solid rgba(255,0,127,0.3)", color: "#FF007F" }}>
                      {actionLoading === poi.id + "_delete" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
