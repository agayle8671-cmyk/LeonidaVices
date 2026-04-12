import { useState, useEffect } from "react";
import { Twitter } from "lucide-react";
import { useLaunch } from "../contexts/LaunchContext";

const LAUNCH = new Date("2026-11-19T00:00:00");
const SHARE_URL = window.location.origin;

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

export default function CountdownTimer() {
  const [t, setT] = useState(calcTime);
  const { isLaunched, triggerLaunch } = useLaunch();

  useEffect(() => {
    const id = setInterval(() => {
      const next = calcTime();
      setT(next);
      // Trigger celebration when countdown reaches zero
      if (!next) triggerLaunch();
    }, 1000);
    return () => clearInterval(id);
  }, [triggerLaunch]);

  // Celebration state — timer hit zero or admin triggered
  if (!t || isLaunched) {
    return (
      <div className="flex flex-col items-center gap-2" data-testid="countdown-timer">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse"
            style={{ boxShadow: "0 0 8px rgba(57,255,20,0.9)" }} />
          <span className="font-heading text-[#39FF14] text-xl sm:text-2xl"
            style={{ textShadow: "0 0 15px rgba(57,255,20,0.9)" }}
            data-testid="countdown-launched">
            LEONIDA IS LIVE — GET IN THERE!
          </span>
        </div>
        <p className="font-accent text-[#FFE600] text-sm">GTA VI · November 19, 2026 · Now available on PS5 &amp; Xbox</p>
      </div>
    );
  }

  const units = [
    { label: "Days", value: t.days },
    { label: "Hrs",  value: t.hours },
    { label: "Min",  value: t.minutes },
    { label: "Sec",  value: t.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-2" data-testid="countdown-timer">
      <p className="font-accent text-[#FFE600] text-base tracking-wide">Countdown to Leonida Launch:</p>
      <div className="flex items-center gap-3">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="text-center">
              <div className="font-heading text-3xl sm:text-4xl text-white tabular-nums"
                style={{ textShadow: "0 0 12px rgba(255,0,127,0.9)", minWidth: "3rem" }}
                data-testid={`countdown-${label.toLowerCase()}`}>
                {String(value).padStart(2, "0")}
              </div>
              <div className="font-body text-gray-500 text-xs uppercase tracking-wider mt-0.5">{label}</div>
            </div>
            {i < units.length - 1 && (
              <span className="font-heading text-2xl text-[#FF007F] mb-4 opacity-60">:</span>
            )}
          </div>
        ))}
      </div>
      <p className="font-body text-gray-600 text-xs">November 19, 2026 · PS5 &amp; Xbox Series X/S</p>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚨 Only ${t.days} days until #GTA6 drops in Leonida! Check out the interactive travel guide — map, route planner, AI advisor & community atlas. #Leonida #GrandTheftAuto6 #RockstarGames`)}&url=${encodeURIComponent(SHARE_URL)}`}
        target="_blank" rel="noopener noreferrer" data-testid="twitter-share-btn"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading transition-all hover:scale-105 mt-1"
        style={{ background: "rgba(29,161,242,0.15)", border: "1px solid rgba(29,161,242,0.5)", color: "#1DA1F2" }}>
        <Twitter size={14} />Share on X/Twitter — {t.days} days to go!
      </a>
    </div>
  );
}
