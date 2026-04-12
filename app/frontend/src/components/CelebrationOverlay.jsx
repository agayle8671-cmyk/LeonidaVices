import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { X, Map, Trophy } from "lucide-react";
import { useLaunch } from "../contexts/LaunchContext";

const CONFETTI_COLORS = ["#FF007F", "#00E5FF", "#FFE600", "#39FF14", "#ffffff", "#FF007F"];
const AUTO_DISMISS_SECS = 14;

function fireConfetti() {
  // Continuous side-cannon for 5 seconds
  const end = Date.now() + 5000;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors: CONFETTI_COLORS, zIndex: 99999 });
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors: CONFETTI_COLORS, zIndex: 99999 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  // Big burst from center on load
  setTimeout(() => confetti({ particleCount: 250, spread: 120, origin: { x: 0.5, y: 0.35 }, colors: CONFETTI_COLORS, ticks: 400, zIndex: 99999 }), 300);
  // Second burst after 1.5s
  setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: CONFETTI_COLORS, ticks: 300, zIndex: 99999 }), 1500);
}

export default function CelebrationOverlay() {
  const { dismissCelebration } = useLaunch();
  const [remaining, setRemaining] = useState(AUTO_DISMISS_SECS);

  useEffect(() => {
    fireConfetti();
  }, []);

  useEffect(() => {
    if (remaining <= 0) { dismissCelebration(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, dismissCelebration]);

  const handleDismiss = useCallback(() => dismissCelebration(), [dismissCelebration]);
  const progress = ((AUTO_DISMISS_SECS - remaining) / AUTO_DISMISS_SECS) * 100;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      data-testid="celebration-overlay"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* Radial neon pulses */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #FF007F 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)", animation: "pulse 2s 0.5s ease-in-out infinite" }} />
      </div>

      {/* Main card */}
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-500"
        style={{ background: "linear-gradient(160deg, #0F0C29 0%, #050505 100%)", border: "1px solid rgba(255,0,127,0.5)", boxShadow: "0 0 80px rgba(255,0,127,0.3), 0 0 160px rgba(0,229,255,0.1)" }}
      >
        {/* Top accent rainbow */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF007F, #FFE600, #39FF14, #00E5FF, #FF007F)" }} />

        <div className="p-8 sm:p-12 text-center">
          {/* Dismiss */}
          <button onClick={handleDismiss} data-testid="celebration-dismiss-btn"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>

          {/* Branding */}
          <p className="font-accent text-[#FFE600] text-lg mb-4 opacity-80">Honest John's Travel Agency™ presents</p>

          {/* GTA VI */}
          <div className="mb-2">
            <p className="font-heading text-[#00E5FF] text-2xl sm:text-3xl tracking-[0.3em] uppercase mb-1"
              style={{ textShadow: "0 0 20px rgba(0,229,255,0.8)" }}>
              Grand Theft Auto VI
            </p>
            <h1
              className="font-heading text-7xl sm:text-9xl text-white leading-none"
              style={{ textShadow: "0 0 30px rgba(255,0,127,0.9), 0 0 60px rgba(255,0,127,0.5), 0 0 100px rgba(255,0,127,0.3)" }}
              data-testid="celebration-title"
            >
              LEONIDA
            </h1>
            <p className="font-heading text-3xl sm:text-5xl mt-2 leading-none"
              style={{ color: "#39FF14", textShadow: "0 0 20px rgba(57,255,20,0.9), 0 0 40px rgba(57,255,20,0.5)" }}>
              IS NOW LIVE!
            </p>
          </div>

          {/* Date badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full my-5"
            style={{ background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.4)" }}>
            <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="font-heading text-[#39FF14] text-sm tracking-wider">NOVEMBER 19, 2026 · AVAILABLE NOW</span>
          </div>

          <p className="font-body text-gray-300 text-base sm:text-lg max-w-lg mx-auto mb-6 leading-relaxed">
            "Welcome to Leonida, the most beautiful, dangerous, and legally questionable state in gaming history.
            Your luxury travel package starts <em>now</em>."
            <span className="block mt-1 text-[#FF007F] text-sm font-accent">— Honest John, weeping tears of profit</span>
          </p>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#FFE600] text-xl">★</span>
            ))}
            <span className="font-body text-gray-400 text-sm ml-2">Game of the Century™ · All 5 stars (mandatory)</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link to="/map" onClick={handleDismiss} data-testid="celebration-explore-btn">
              <button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                <Map size={16} />Explore Leonida Now
              </button>
            </Link>
            <Link to="/leaderboard" onClick={handleDismiss} data-testid="celebration-leaderboard-btn">
              <button className="btn-secondary flex items-center gap-2 w-full sm:w-auto">
                <Trophy size={16} />View Leaderboard
              </button>
            </Link>
          </div>

          {/* Auto-dismiss bar */}
          <div className="space-y-1.5">
            <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FF007F, #00E5FF)" }}
                data-testid="celebration-progress-bar"
              />
            </div>
            <p className="font-body text-gray-600 text-xs">
              Auto-dismissing in {remaining}s · <button onClick={handleDismiss} className="underline hover:text-gray-400">dismiss now</button>
            </p>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #39FF14, #00E5FF, transparent)" }} />
      </div>
    </div>
  );
}
