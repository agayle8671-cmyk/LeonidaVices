import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ExternalLink, RefreshCw, Loader2, Zap, Radio, Clock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SOURCE_STYLE = {
  Kotaku:     { from: "#FF007F", to: "#15000e", accent: "#FF007F" },
  GameSpot:   { from: "#00E5FF", to: "#000f1a", accent: "#00E5FF" },
  PCGamer:    { from: "#FF4500", to: "#150400", accent: "#FF4500" },
  GamesRadar: { from: "#39FF14", to: "#031203", accent: "#39FF14" },
  IGN:        { from: "#FF2222", to: "#120000", accent: "#FF2222" },
  Eurogamer:  { from: "#FFE600", to: "#100e00", accent: "#FFE600" },
};
const DEFAULT_STYLE = { from: "#FF007F", to: "#050510", accent: "#FF007F" };

function getSourceStyle(source) {
  return SOURCE_STYLE[source] || DEFAULT_STYLE;
}

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function stripHtml(str = "") {
  return str.replace(/<[^>]+>/g, "").trim();
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function NewsTicker({ articles }) {
  const text = articles.map(a => `▶  ${a.title}`).join("   ·   ");
  return (
    <div className="overflow-hidden border-b border-white/10 bg-[#0a0005]">
      <div className="flex items-center h-8">
        <div className="flex-shrink-0 flex items-center gap-2 px-3 bg-[#FF007F] h-full">
          <Radio size={11} className="text-white animate-pulse" />
          <span className="font-heading text-white text-[10px] uppercase tracking-wider">BREAKING</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-scroll font-body text-gray-300 text-xs py-2 px-4">
            {text + "   ·   " + text}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Featured Card ─────────────────────────────────────────────────────────────
function FeaturedCard({ article }) {
  const s = getSourceStyle(article.source);
  const summary = stripHtml(article.summary);
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden relative"
      style={{ background: `linear-gradient(135deg, ${s.from}55 0%, ${s.to} 60%)`, border: `1px solid ${s.accent}30`, minHeight: "280px" }}
      data-testid="featured-news-card">
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 20%, ${s.from}20 0%, transparent 60%)` }} />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-heading text-xs px-2 py-1 rounded-full"
            style={{ background: `${s.accent}25`, color: s.accent, border: `1px solid ${s.accent}50` }}>
            {article.source}
          </span>
          <span className="text-xs px-2 py-1 rounded-full font-heading text-white/50 bg-[#FF007F]/20 border border-[#FF007F]/30">
            FEATURED
          </span>
          <span className="font-body text-gray-500 text-xs ml-auto flex items-center gap-1">
            <Clock size={10} />{timeAgo(article.scraped_at)}
          </span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl text-white leading-tight mb-2 group-hover:text-[#FF007F] transition-colors line-clamp-3"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
          {article.title}
        </h2>
        {summary && (
          <p className="font-body text-gray-300 text-sm line-clamp-2 mb-3">{summary.slice(0, 160)}...</p>
        )}
        <div className="flex items-center gap-1" style={{ color: s.accent }}>
          <Zap size={12} />
          <span className="font-body text-xs">Relevance: {article.relevance_score}/5</span>
          <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}

// ── Compact Card ─────────────────────────────────────────────────────────────
function CompactCard({ article }) {
  const s = getSourceStyle(article.source);
  const summary = stripHtml(article.summary);
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
      style={{ background: `linear-gradient(160deg, ${s.from}30 0%, #0a0a14 50%)`, border: `1px solid ${s.accent}20` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = s.accent + "60"}
      onMouseLeave={e => e.currentTarget.style.borderColor = s.accent + "20"}
      data-testid={`news-card-${article.id}`}>
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${s.accent}18`, color: s.accent, border: `1px solid ${s.accent}35` }}>
            {article.source}
          </span>
          <span className="font-body text-gray-600 text-[10px] flex items-center gap-1 flex-shrink-0">
            <Clock size={9} />{timeAgo(article.scraped_at)}
          </span>
        </div>
        <h3 className="font-heading text-sm text-white leading-snug line-clamp-3 group-hover:text-[#FF007F] transition-colors flex-1">
          {article.title}
        </h3>
        {summary && (
          <p className="font-body text-gray-600 text-xs line-clamp-2">{summary.slice(0, 100)}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1" style={{ color: s.accent }}>
            <Zap size={9} />
            <span className="font-body text-[10px]">{article.relevance_score}/5</span>
          </div>
          <ExternalLink size={11} className="text-gray-700 group-hover:text-white transition-colors" />
        </div>
      </div>
    </a>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NewsSectionV2() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [status, setStatus] = useState(null);
  const tickerRef = useRef(null);

  const load = async () => {
    try {
      const [newsRes, statusRes] = await Promise.all([
        axios.get(`${API}/news?limit=16`),
        axios.get(`${API}/news/status`),
      ]);
      setArticles(newsRes.data);
      setStatus(statusRes.data);
    } catch (err) { console.error("Failed to load news:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await axios.post(`${API}/news/refresh`); await load(); }
    catch (err) { console.error("News refresh failed:", err); }
    finally { setRefreshing(false); }
  };

  const sources = ["All", ...Array.from(new Set(articles.map(a => a.source))).sort()];
  const filtered = filter === "All" ? articles : articles.filter(a => a.source === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section className="max-w-7xl mx-auto px-4 py-14" data-testid="news-section">
      {/* ── VCNN HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-heading text-2xl sm:text-3xl text-white">VCNN</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF007F]/20 border border-[#FF007F]/50">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF007F] animate-pulse" />
                <span className="font-heading text-[10px] text-[#FF007F] uppercase tracking-wider">Live</span>
              </div>
            </div>
            <p className="font-body text-gray-500 text-xs">Vice City News Network · GTA 6 Intelligence Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className="font-body text-gray-600 text-xs flex items-center gap-1">
              <Clock size={10} />{status.total_articles} articles · {timeAgo(status.last_scrape)}
            </span>
          )}
          <button onClick={handleRefresh} disabled={refreshing} data-testid="news-refresh-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all disabled:opacity-50"
            style={{ background: "rgba(255,0,127,0.1)", border: "1px solid rgba(255,0,127,0.3)", color: "#FF007F" }}>
            {refreshing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {refreshing ? "Scanning..." : "Refresh Intel"}
          </button>
        </div>
      </div>

      {/* ── TICKER ── */}
      {articles.length > 0 && <NewsTicker articles={articles.slice(0, 8)} />}

      {/* ── SOURCE FILTER ── */}
      <div className="flex gap-2 flex-wrap py-4 border-b border-white/5 mb-6">
        {sources.map(src => {
          const s = src === "All" ? { accent: "#FF007F" } : (SOURCE_STYLE[src] || DEFAULT_STYLE);
          return (
            <button key={src} onClick={() => setFilter(src)} data-testid={`news-filter-${src}`}
              className="px-3 py-1.5 rounded-lg text-xs font-heading transition-all"
              style={{
                background: filter === src ? `${s.accent}25` : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === src ? s.accent : "rgba(255,255,255,0.08)"}`,
                color: filter === src ? s.accent : "#888",
                boxShadow: filter === src ? `0 0 8px ${s.accent}30` : "none",
              }}>
              {src}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="text-[#FF007F] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState onRefresh={handleRefresh} refreshing={refreshing} />
      ) : (
        <>
          {/* Featured + side-articles */}
          {featured && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <FeaturedCard article={featured} />
              </div>
              <div className="flex flex-col gap-4">
                {rest.slice(0, 3).map(a => (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="group glass-panel p-4 hover:border-[#FF007F]/30 transition-all duration-200"
                    data-testid={`side-news-${a.id}`}>
                    <span className="font-heading text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${getSourceStyle(a.source).accent}18`, color: getSourceStyle(a.source).accent }}>
                      {a.source}
                    </span>
                    <p className="font-heading text-sm text-white mt-2 mb-1 line-clamp-3 group-hover:text-[#FF007F] transition-colors leading-snug">
                      {a.title}
                    </p>
                    <p className="font-body text-gray-700 text-xs flex items-center gap-1">
                      <Clock size={9} />{timeAgo(a.scraped_at)}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Article grid */}
          {rest.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.slice(3).map(a => <CompactCard key={a.id} article={a} />)}
            </div>
          )}
        </>
      )}

      <p className="text-center font-body text-gray-700 text-xs mt-8">
        VCNN sources: Kotaku · GameSpot · PCGamer · GamesRadar · IGN · Eurogamer · Filtered for GTA 6 relevance · AI-extracted facts auto-added to knowledge base
      </p>
    </section>
  );
}

function EmptyState({ onRefresh, refreshing }) {
  return (
    <div className="glass-panel p-10 text-center" style={{ borderColor: "rgba(255,0,127,0.2)" }}>
      <Radio size={28} className="text-[#FF007F] mx-auto mb-4 opacity-40" />
      <p className="font-heading text-white text-lg mb-2">VCNN Is Scanning the Airwaves</p>
      <p className="font-body text-gray-500 text-sm mb-5 max-w-sm mx-auto">
        The intelligence network is quiet. Trigger an immediate GTA 6 news scan from all major gaming sources.
      </p>
      <button onClick={onRefresh} disabled={refreshing} className="btn-primary flex items-center gap-2 mx-auto">
        {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        {refreshing ? "Scanning sources..." : "Scan for GTA 6 News"}
      </button>
    </div>
  );
}
