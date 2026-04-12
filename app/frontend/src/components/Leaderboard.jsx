import { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, Star, MapPin, ThumbsUp, CheckCircle, Loader2, Crown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RANK_STYLES = [
  { bg: "#FFE60020", border: "#FFE600", color: "#FFE600", icon: "🥇" },
  { bg: "#C0C0C020", border: "#C0C0C0", color: "#C0C0C0", icon: "🥈" },
  { bg: "#CD7F3220", border: "#CD7F32", color: "#CD7F32", icon: "🥉" },
];

function Avatar({ username, color, size = 36 }) {
  const initials = (username || "?").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-full flex items-center justify-center font-heading text-white flex-shrink-0"
      style={{ width: size, height: size, background: `${color}30`, border: `2px solid ${color}`,
               boxShadow: `0 0 8px ${color}50`, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);
  const [totalPins, setTotalPins] = useState(0);
  const { user, getHeaders } = useAuth();

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/leaderboard`),
      axios.get(`${API}/community/pois`),
    ]).then(([lb, pois]) => {
      setEntries(lb.data);
      setTotalPins(pois.data.length);
    }).catch(() => {}).finally(() => setLoading(false));
    if (user) {
      axios.get(`${API}/users/${user.id}/stats`, { headers: getHeaders() })
        .then(r => setMyStats(r.data)).catch(() => {});
    }
  }, [user, getHeaders]);

  const myRank = user ? entries.findIndex(e => e.user_id === user.id) + 1 : 0;

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-accent text-[#FFE600] text-xl mb-2">Community Rankings</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white mb-3">
            Who Mapped <span className="neon-yellow">Leonida Best?</span>
          </h1>
          <p className="font-body text-gray-400 text-base max-w-2xl mx-auto">
            The definitive ranking of Leonida's finest cartographers, scouts, and criminal informants.
            Submit community pins to climb the board. Honest John endorses no one (everyone owes him money).
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Mappers", value: entries.length, icon: Star, color: "#FFE600" },
            { label: "Community Pins", value: totalPins, icon: MapPin, color: "#FF007F" },
            { label: "Your Rank", value: myRank > 0 ? `#${myRank}` : user ? "Unranked" : "Login", icon: Trophy, color: "#00E5FF" },
            { label: "Your Score", value: myStats?.score ?? (user ? 0 : "—"), icon: Crown, color: "#39FF14" },
          ].map((s) => (
            <div key={s.label} className="glass-panel p-4 text-center" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g,"-")}`}>
              <s.icon size={18} style={{ color: s.color }} className="mx-auto mb-2" />
              <p className="font-heading text-xl sm:text-2xl text-white">{s.value}</p>
              <p className="font-body text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* My stats card (if logged in and ranked) */}
        {user && myStats && (
          <div className="glass-panel p-4 mb-6 flex items-center gap-4"
            style={{ borderColor: "rgba(255,230,0,0.3)", boxShadow: "0 0 20px rgba(255,230,0,0.08)" }}
            data-testid="my-stats-card">
            <Avatar username={user.display_name || user.username} color={user.avatar_color || "#FFE600"} size={44} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-heading text-white text-lg">{user.display_name || user.username}</p>
                <span className="text-sm">{myStats.badge?.icon}</span>
                <span className="text-xs font-body px-2 py-0.5 rounded-full"
                  style={{ background: `${myStats.badge?.color}20`, color: myStats.badge?.color }}>
                  {myStats.badge?.name}
                </span>
              </div>
              <div className="flex gap-4 text-xs font-body text-gray-400">
                <span>{myStats.pois_submitted} pins</span>
                <span>{myStats.total_upvotes} upvotes</span>
                <span>{myStats.verified_pois} verified</span>
                <span className="text-[#FFE600]">{myStats.score} pts</span>
              </div>
            </div>
            {myRank > 0 && <div className="font-heading text-3xl text-[#FFE600]">#{myRank}</div>}
          </div>
        )}

        {/* Leaderboard table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-[#FF007F] animate-spin" /></div>
        ) : entries.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Trophy size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="font-heading text-white text-xl mb-2">No Rankings Yet</p>
            <p className="font-body text-gray-500 text-sm">Be the first to submit community pins and claim the top spot!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const rankStyle = RANK_STYLES[i] || { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", color: "#aaa", icon: `#${i+1}` };
              const isMe = user && entry.user_id === user.id;
              return (
                <div key={entry.user_id} data-testid={`leaderboard-entry-${i}`}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{ background: isMe ? "rgba(255,230,0,0.06)" : rankStyle.bg,
                           border: `1px solid ${isMe ? "#FFE600" : rankStyle.border}`,
                           boxShadow: isMe ? "0 0 15px rgba(255,230,0,0.1)" : "none" }}>
                  {/* Rank */}
                  <div className="w-8 text-center font-heading text-lg flex-shrink-0" style={{ color: rankStyle.color }}>
                    {typeof rankStyle.icon === "string" && rankStyle.icon.startsWith("#") ? rankStyle.icon : rankStyle.icon}
                  </div>
                  {/* Avatar */}
                  <Avatar username={entry.username} color={entry.avatar_color} size={40} />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading text-white text-base truncate">{entry.username}</p>
                      {isMe && <span className="text-xs font-body px-1.5 py-0.5 rounded bg-[#FFE600]/20 text-[#FFE600]">You</span>}
                      <span className="text-sm">{entry.badge?.icon}</span>
                      <span className="text-xs font-body px-2 py-0.5 rounded-full hidden sm:inline"
                        style={{ background: `${entry.badge?.color}15`, color: entry.badge?.color }}>
                        {entry.badge?.name}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs font-body text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={10} />{entry.pois_submitted}</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={10} />{entry.total_upvotes}</span>
                      <span className="flex items-center gap-1"><CheckCircle size={10} className="text-[#39FF14]" />{entry.verified_pois}</span>
                    </div>
                  </div>
                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading text-lg" style={{ color: rankStyle.color }}>{entry.score}</p>
                    <p className="font-body text-gray-600 text-xs">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scoring legend */}
        <div className="mt-8 glass-panel p-4">
          <p className="font-heading text-gray-500 text-xs uppercase tracking-wider mb-3">Scoring Formula</p>
          <div className="flex flex-wrap gap-4 text-sm font-body text-gray-400">
            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#FF007F]" />Pin submitted = 1 pt</span>
            <span className="flex items-center gap-1.5"><ThumbsUp size={12} className="text-[#00E5FF]" />Upvote received = 3 pts</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-[#39FF14]" />Pin verified (3+ upvotes) = 5 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
