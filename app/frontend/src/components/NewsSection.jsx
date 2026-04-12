import { useState, useEffect } from "react";
import axios from "axios";
import { ExternalLink, RefreshCw, Clock, Zap, AlertTriangle, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SOURCE_COLORS = {
  Kotaku: "#FF007F",
  GameSpot: "#00E5FF",
  PCGamer: "#39FF14",
  GamesRadar: "#FFE600",
  IGN: "#FF8C00",
  Eurogamer: "#00BFFF",
  default: "#aaa",
};

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const diff = (new Date() - date) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState(null);

  const loadNews = async () => {
    try {
      const [newsRes, statusRes] = await Promise.all([
        axios.get(`${API}/news?limit=9`),
        axios.get(`${API}/news/status`),
      ]);
      setArticles(newsRes.data);
      setStatus(statusRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNews(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API}/news/refresh`);
      await loadNews();
    } catch { /* ignore */ }
    finally { setRefreshing(false); }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-14" data-testid="news-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-accent text-[#FF007F] text-xl mb-1">Live Intelligence Feed</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-white">
            Latest GTA 6 <span className="neon-pink">News</span>
          </h2>
          <p className="font-body text-gray-500 text-sm mt-1">
            Auto-scraped from gaming sources every 24 hrs · AI-processed into knowledge base
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {status && (
            <div className="flex items-center gap-1.5 text-xs font-body text-gray-500">
              <Clock size={11} />
              <span>{status.total_articles} articles · Last: {timeAgo(status.last_scrape)}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            data-testid="news-refresh-btn"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-heading transition-all disabled:opacity-50"
            style={{ background: "rgba(255,0,127,0.1)", border: "1px solid rgba(255,0,127,0.3)", color: "#FF007F" }}
          >
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            {refreshing ? "Scraping..." : "Refresh Intel"}
          </button>
        </div>
      </div>

      {/* Articles grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="text-[#FF007F] animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <EmptyNews onRefresh={handleRefresh} refreshing={refreshing} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      <p className="text-center font-body text-gray-600 text-xs mt-6">
        News sourced from gaming media · Filtered for GTA 6 relevance · AI-extracted facts added to Honest John's knowledge base
      </p>
    </section>
  );
}

function ArticleCard({ article }) {
  const color = SOURCE_COLORS[article.source] || SOURCE_COLORS.default;
  const truncated = article.summary?.replace(/<[^>]+>/g, "").slice(0, 140) + (article.summary?.length > 140 ? "..." : "");

  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer"
      data-testid={`news-article-${article.id}`}
      className="neon-card p-4 flex flex-col gap-3 group"
      style={{ borderColor: `${color}25`, textDecoration: "none" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${color}25`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-heading px-2 py-0.5 rounded-full"
          style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
          {article.source}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-body text-gray-600">{timeAgo(article.scraped_at)}</span>
          <ExternalLink size={11} className="text-gray-600 group-hover:text-white transition-colors" />
        </div>
      </div>
      <h3 className="font-heading text-white text-base leading-snug line-clamp-2 group-hover:text-[#FF007F] transition-colors">
        {article.title}
      </h3>
      {truncated && (
        <p className="font-body text-gray-500 text-xs leading-relaxed line-clamp-3">{truncated}</p>
      )}
      <div className="flex items-center gap-1 mt-auto">
        <Zap size={10} className="text-[#39FF14]" />
        <span className="text-xs font-body text-[#39FF14]">Relevance: {article.relevance_score || 1}/5</span>
      </div>
    </a>
  );
}

function EmptyNews({ onRefresh, refreshing }) {
  return (
    <div className="glass-panel p-10 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-[#FFE600]" />
        <p className="font-heading text-white text-lg">No Articles Yet</p>
      </div>
      <p className="font-body text-gray-500 text-sm mb-5 max-w-sm mx-auto">
        The news scraper runs every 24 hours. Click "Refresh Intel" to trigger an immediate scrape
        from Kotaku, GameSpot, PCGamer, GamesRadar, IGN, and Eurogamer.
      </p>
      <button onClick={onRefresh} disabled={refreshing}
        className="btn-primary flex items-center gap-2 mx-auto"
        data-testid="news-empty-refresh">
        {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        {refreshing ? "Scraping GTA 6 News..." : "Fetch Latest GTA 6 News"}
      </button>
    </div>
  );
}
