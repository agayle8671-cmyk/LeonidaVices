import { useState, useEffect } from "react";
import { Twitter, Copy, Check, ExternalLink } from "lucide-react";

const LAUNCH = new Date("2026-11-19T00:00:00");
const APP_URL = window.location.origin;

function calcTime() {
  const diff = LAUNCH - new Date();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const EMBED_CODE = `<iframe src="${APP_URL}/widget" width="520" height="300" frameborder="0" style="border-radius:16px;border:1px solid rgba(255,0,127,0.4);background:#050505;" title="GTA 6 Leonida Countdown" allow="autoplay"></iframe>`;

export default function CountdownWidget() {
  const [t, setT] = useState(calcTime);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "GTA 6 Launch Countdown | Honest John's Leonida";
    const id = setInterval(() => setT(calcTime()), 1000);
    return () => clearInterval(id);
  }, []);

  const copyEmbed = () => {
    navigator.clipboard.writeText(EMBED_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const tweetText = t
    ? `🚨 Only ${t.days} days until #GTA6 drops in Leonida! Check out the interactive map, route planner & AI travel guide → ${APP_URL} #Leonida #RockstarGames`
    : "GTA 6 is LIVE! Leonida awaits! 🎮";

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 30%, rgba(255,0,127,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,229,255,0.08) 0%, transparent 50%)" }}>

      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.3) 2px, rgba(0,229,255,0.3) 4px)" }} />

      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Branding */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF007F] to-[#00E5FF] flex items-center justify-center text-xs font-heading font-bold shadow-[0_0_10px_rgba(255,0,127,0.6)]">
              HJ
            </div>
            <span className="font-accent text-[#FFE600] text-lg">Honest John's Travel Agency™</span>
          </div>
          <p className="font-body text-gray-500 text-sm">Official Leonida Launch Intelligence</p>
        </div>

        <p className="font-body text-gray-400 text-sm uppercase tracking-[0.3em] mb-4">
          GTA VI · Leonida · Launches In
        </p>

        {t ? (
          <>
            {/* Countdown digits */}
            <div className="flex items-start justify-center gap-2 sm:gap-4 mb-6" data-testid="widget-countdown">
              {[
                { label: "DAYS",    value: t.days },
                { label: "HOURS",   value: t.hours },
                { label: "MINUTES", value: t.minutes },
                { label: "SECONDS", value: t.seconds },
              ].map(({ label, value }, i) => (
                <div key={label} className="flex items-start gap-2 sm:gap-4">
                  <div className="text-center">
                    <div
                      className="font-heading tabular-nums text-5xl sm:text-7xl text-white leading-none px-3 sm:px-5 py-3 sm:py-4 rounded-2xl"
                      style={{
                        background: "rgba(15,12,41,0.9)",
                        border: "1px solid rgba(255,0,127,0.3)",
                        boxShadow: "0 0 20px rgba(255,0,127,0.15), inset 0 0 20px rgba(0,0,0,0.5)",
                        textShadow: "0 0 20px rgba(255,0,127,0.8)",
                        minWidth: label === "DAYS" ? "90px" : "72px",
                      }}
                      data-testid={`widget-${label.toLowerCase()}`}
                    >
                      {String(value).padStart(label === "DAYS" ? 3 : 2, "0")}
                    </div>
                    <p className="font-heading text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-2">{label}</p>
                  </div>
                  {i < 3 && (
                    <span className="font-heading text-4xl sm:text-6xl text-[#FF007F] mt-2 opacity-60 leading-none select-none">:</span>
                  )}
                </div>
              ))}
            </div>

            <p className="font-accent text-[#FFE600] text-xl mb-1">November 19, 2026</p>
            <p className="font-body text-gray-500 text-sm mb-8">PlayStation 5 &amp; Xbox Series X/S · PC in 2027</p>
          </>
        ) : (
          <div className="mb-8">
            <p className="font-heading text-5xl neon-pink mb-3">LEONIDA IS LIVE!</p>
            <p className="font-accent text-[#FFE600] text-2xl">Welcome to GTA 6, traveller. Honest John awaits.</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
            target="_blank" rel="noopener noreferrer"
            data-testid="widget-share-twitter"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm transition-all hover:scale-105"
            style={{ background: "rgba(29,161,242,0.15)", border: "1px solid rgba(29,161,242,0.5)", color: "#1DA1F2" }}>
            <Twitter size={16} />Share on X/Twitter
          </a>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer"
            data-testid="widget-visit-guide"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm transition-all hover:scale-105"
            style={{ background: "rgba(255,0,127,0.15)", border: "1px solid rgba(255,0,127,0.4)", color: "#FF007F" }}>
            <ExternalLink size={14} />Explore Leonida Guide
          </a>
        </div>

        {/* Embed code section */}
        <div className="glass-panel p-4 sm:p-5 text-left" style={{ borderColor: "rgba(0,229,255,0.2)" }}>
          <p className="font-body text-[#00E5FF] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Copy size={11} />Embed this countdown on your site
          </p>
          <div className="relative">
            <pre className="bg-[#0a0a14] rounded-lg p-3 text-xs font-body text-gray-400 overflow-x-auto whitespace-pre-wrap break-all border border-white/5"
              data-testid="widget-embed-code">
              {EMBED_CODE}
            </pre>
            <button onClick={copyEmbed} data-testid="widget-copy-btn"
              className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
              style={{ background: copied ? "rgba(57,255,20,0.2)" : "rgba(0,229,255,0.15)", color: copied ? "#39FF14" : "#00E5FF", border: `1px solid ${copied ? "rgba(57,255,20,0.4)" : "rgba(0,229,255,0.3)"}` }}>
              {copied ? <><Check size={11} />Copied!</> : <><Copy size={11} />Copy</>}
            </button>
          </div>
          <p className="font-body text-gray-700 text-xs mt-2">Paste this &lt;iframe&gt; anywhere — blog posts, YouTube descriptions, Discord bios, or websites.</p>
        </div>

        <p className="font-body text-gray-800 text-xs text-center mt-5">
          © 2026 Honest John's Travel Agency™ · Not affiliated with Rockstar Games
        </p>
      </div>
    </div>
  );
}
