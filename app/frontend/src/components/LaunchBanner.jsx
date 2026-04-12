import { useState } from "react";
import { X, Gamepad2 } from "lucide-react";
import { useLaunch } from "../contexts/LaunchContext";

export default function LaunchBanner() {
  const { isLaunched, showCelebration } = useLaunch();
  const [dismissed, setDismissed] = useState(false);

  if (!isLaunched || showCelebration || dismissed) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 h-9"
      style={{
        background: "linear-gradient(90deg, rgba(57,255,20,0.12) 0%, rgba(0,229,255,0.1) 50%, rgba(57,255,20,0.12) 100%)",
        borderBottom: "1px solid rgba(57,255,20,0.3)",
        boxShadow: "0 2px 20px rgba(57,255,20,0.1)",
      }}
      data-testid="launch-banner"
    >
      {/* Pulsing dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse flex-shrink-0"
        style={{ boxShadow: "0 0 6px rgba(57,255,20,0.8)" }} />

      <Gamepad2 size={13} className="text-[#39FF14] flex-shrink-0" />

      <p className="font-heading text-[#39FF14] text-xs sm:text-sm tracking-wide truncate"
        style={{ textShadow: "0 0 8px rgba(57,255,20,0.7)" }}>
        GTA VI IS LIVE IN LEONIDA! · November 19, 2026 · PS5 &amp; Xbox Series X/S
      </p>

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-gray-600 hover:text-white transition-colors ml-1"
        data-testid="launch-banner-dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
