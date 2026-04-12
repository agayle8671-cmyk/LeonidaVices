import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Flame, MessageSquare, TrendingUp, AlertTriangle, Eye, Clock, RefreshCw, Loader2, ChevronUp } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY CONFIG — How Intel is classified
   ═══════════════════════════════════════════════════════════════════════════ */
const CATEGORY_CONFIG = {
  hot_lead:   { label: "Hot Lead",   color: "#FF007F", icon: "🔴", glow: "rgba(255,0,127,0.3)" },
  confirmed:  { label: "Confirmed",  color: "#39FF14", icon: "🟢", glow: "rgba(57,255,20,0.3)" },
  unverified: { label: "Unverified", color: "#FFE600", icon: "🟡", glow: "rgba(255,230,0,0.3)" },
  debunked:   { label: "Debunked",   color: "#FF2A2A", icon: "💀", glow: "rgba(255,42,42,0.3)" },
  chatter:    { label: "Chatter",    color: "#00E5FF", icon: "💬", glow: "rgba(0,229,255,0.3)" },
};

const CATEGORY_ORDER = ["hot_lead", "confirmed", "unverified", "chatter", "debunked"];

/* ═══════════════════════════════════════════════════════════════════════════
   HEAT BAR — Visual heat indicator per post
   ═══════════════════════════════════════════════════════════════════════════ */
function HeatBar({ heat }) {
  const getColor = (h) => {
    if (h >= 8) return "#FF007F";
    if (h >= 6) return "#FF8C00";
    if (h >= 4) return "#FFE600";
    return "#00E5FF";
  };
  return (
    <div className="flex items-center gap-1.5">
      <Flame size={10} style={{ color: getColor(heat) }} />
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-1.5 h-3 rounded-sm transition-all duration-500"
            style={{
              background: i < heat ? getColor(heat) : "rgba(255,255,255,0.06)",
              boxShadow: i < heat ? `0 0 4px ${getColor(heat)}40` : "none",
              transitionDelay: `${i * 40}ms`,
            }} />
        ))}
      </div>
      <span className="font-heading text-[10px]" style={{ color: getColor(heat) }}>{heat}/10</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HYPE METER — Overall community excitement gauge
   ═══════════════════════════════════════════════════════════════════════════ */
function HypeMeter({ level, totalEngagement }) {
  const getLabel = (l) => {
    if (l >= 9) return "MAXIMUM HYPE";
    if (l >= 7) return "HIGH ALERT";
    if (l >= 5) return "ELEVATED";
    if (l >= 3) return "MODERATE";
    return "QUIET";
  };
  const color = level >= 7 ? "#FF007F" : level >= 5 ? "#FFE600" : "#00E5FF";

  return (
    <div className="glass-panel p-4" style={{ borderColor: `${color}30`, boxShadow: `0 0 20px ${color}10` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
            <TrendingUp size={16} style={{ color }} />
          </div>
          <div>
            <p className="font-heading text-xs text-white">Community Hype</p>
            <p className="font-body text-[10px] text-gray-500">{totalEngagement.toLocaleString()} total engagements</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-heading text-lg" style={{ color }}>{level}/10</p>
          <p className="font-heading text-[10px] tracking-wider" style={{ color }}>{getLabel(level)}</p>
        </div>
      </div>
      {/* Animated bar */}
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${level * 10}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: `0 0 10px ${color}`,
          }}>
          <div className="w-full h-full" style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
            animation: "shimmer 2s infinite",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTEL CARD — Single intelligence report
   ═══════════════════════════════════════════════════════════════════════════ */
function IntelCard({ post, index }) {
  const cat = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.unverified;

  const timeLabel = post.age_hours < 1 ? `${Math.round(post.age_hours * 60)}m ago`
    : post.age_hours < 24 ? `${Math.round(post.age_hours)}h ago`
    : `${Math.round(post.age_hours / 24)}d ago`;

  return (
    <div className="group glass-panel p-4 transition-all duration-200 hover:scale-[1.01]"
      style={{
        borderColor: `${cat.color}15`,
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${cat.color}50`}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${cat.color}15`}
      data-testid={`intel-card-${post.id}`}>

      {/* Top accent line */}
      <div className="h-0.5 w-full -mt-4 mb-3 -mx-4" style={{ width: "calc(100% + 2rem)", background: `linear-gradient(90deg, ${cat.color}60, transparent 70%)` }} />

      <div className="flex items-start gap-3">
        {/* Category badge */}
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-sm">{cat.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-heading text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
              {cat.label}
            </span>
            <span className="font-body text-gray-600 text-[10px] flex items-center gap-1">
              <Clock size={8} />{timeLabel}
            </span>
          </div>

          {/* Title */}
          <p className="font-heading text-sm text-white leading-snug mb-2 group-hover:text-[#FF007F] transition-colors line-clamp-3">
            {post.title}
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-between gap-3">
            <HeatBar heat={post.heat} />
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="flex items-center gap-1 text-[10px] font-body text-gray-500">
                <ChevronUp size={10} className="text-[#39FF14]" />{post.engagement.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-body text-gray-500">
                <MessageSquare size={9} />{post.comments.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT — Intelligence Bureau Section
   ═══════════════════════════════════════════════════════════════════════════ */
export default function IntelBureau() {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/intel`);
      setIntel(data);
    } catch (err) {
      console.error("Intel fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = intel?.posts
    ? filter === "all"
      ? intel.posts
      : intel.posts.filter(p => p.category === filter)
    : [];

  // Count per category
  const categoryCounts = {};
  (intel?.posts || []).forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-14" data-testid="intel-section">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,0,127,0.1)", border: "1px solid rgba(255,0,127,0.3)" }}>
            <Shield size={20} className="text-[#FF007F]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-heading text-2xl sm:text-3xl text-white">Intelligence Bureau</h2>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE600]/15 border border-[#FFE600]/40">
                <Eye size={10} className="text-[#FFE600]" />
                <span className="font-heading text-[10px] text-[#FFE600] uppercase tracking-wider">Monitoring</span>
              </div>
            </div>
            <p className="font-body text-gray-500 text-xs">Honest John's field agents report from the streets · Auto-updated every 15 min</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {intel && (
            <span className="font-body text-gray-600 text-xs flex items-center gap-1">
              <Eye size={10} />{intel.post_count} reports · {intel.sources_checked} sources
            </span>
          )}
          <button onClick={handleRefresh} disabled={refreshing} data-testid="intel-refresh-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all disabled:opacity-50"
            style={{ background: "rgba(255,230,0,0.1)", border: "1px solid rgba(255,230,0,0.3)", color: "#FFE600" }}>
            {refreshing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {refreshing ? "Scanning..." : "Refresh Intel"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <Loader2 size={28} className="text-[#FF007F] animate-spin mx-auto mb-3" />
            <p className="font-heading text-sm text-gray-500">Field agents reporting in...</p>
          </div>
        </div>
      ) : !intel || intel.posts.length === 0 ? (
        <div className="glass-panel p-10 text-center" style={{ borderColor: "rgba(255,230,0,0.2)" }}>
          <Shield size={28} className="text-[#FFE600] mx-auto mb-4 opacity-40" />
          <p className="font-heading text-white text-lg mb-2">Intelligence Network Quiet</p>
          <p className="font-body text-gray-500 text-sm mb-5 max-w-sm mx-auto">
            No field reports available. Honest John's agents are... probably at a bar. Try refreshing.
          </p>
          <button onClick={handleRefresh} disabled={refreshing} className="btn-primary flex items-center gap-2 mx-auto">
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Scan Sources
          </button>
        </div>
      ) : (
        <>
          {/* ── HYPE METER ── */}
          <HypeMeter level={intel.hype_level} totalEngagement={intel.total_engagement} />

          {/* ── CATEGORY FILTER ── */}
          <div className="flex gap-2 flex-wrap py-4 mt-4 mb-4 border-b border-white/5">
            <button onClick={() => setFilter("all")} data-testid="intel-filter-all"
              className="px-3 py-1.5 rounded-lg text-xs font-heading transition-all"
              style={{
                background: filter === "all" ? "rgba(255,0,127,0.2)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === "all" ? "#FF007F" : "rgba(255,255,255,0.08)"}`,
                color: filter === "all" ? "#FF007F" : "#888",
              }}>
              All ({intel.posts.length})
            </button>
            {CATEGORY_ORDER.map(catKey => {
              const cat = CATEGORY_CONFIG[catKey];
              const count = categoryCounts[catKey] || 0;
              if (count === 0) return null;
              return (
                <button key={catKey} onClick={() => setFilter(catKey)} data-testid={`intel-filter-${catKey}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-heading transition-all"
                  style={{
                    background: filter === catKey ? `${cat.color}20` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filter === catKey ? cat.color : "rgba(255,255,255,0.08)"}`,
                    color: filter === catKey ? cat.color : "#888",
                  }}>
                  {cat.icon} {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* ── INTEL GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post, i) => (
              <IntelCard key={post.id} post={post} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="font-body text-gray-500 text-sm">No reports in this category.</p>
            </div>
          )}

          {/* ── DISCLAIMER ── */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-700 font-body">
            <AlertTriangle size={10} className="text-[#FFE600]" />
            <span>Intelligence sourced from Honest John's network of field agents. Accuracy not guaranteed. Honest John not liable for acting on unverified intel.</span>
          </div>
        </>
      )}
    </section>
  );
}
