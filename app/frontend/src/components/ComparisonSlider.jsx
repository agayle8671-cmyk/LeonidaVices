import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const IMAGE_PAIRS = [
  {
    id: "beaches",
    title: "Vice City Beaches",
    location: "Ocean Beach, Vice City",
    real_label: "REAL MIAMI",
    leo_label: "VICE CITY",
    before: "https://images.unsplash.com/photo-1563664947988-41e72a519155?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    after: "https://images.unsplash.com/photo-1578742903196-42ce22984ec9?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    real_desc: "Peaceful lifeguard towers, family-friendly sands, classic Miami vibes",
    leo_desc: "Premium Risk-Enhanced Shoreline™ — Alligators unavoidable, fee incl.",
    color: "#FF007F",
    icon: "🏖",
  },
  {
    id: "wetlands",
    title: "The Wetlands",
    location: "Grassrivers vs. Florida Everglades",
    real_label: "FLORIDA EVERGLADES",
    leo_label: "GRASSRIVERS",
    before: "https://images.unsplash.com/photo-1770672850764-877c18e56ab1?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    after: "https://images.unsplash.com/photo-1768970855113-c9825ea9afe3?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    real_desc: "Protected ecosystem, ranger-guided eco-tours, cautious alligators",
    leo_desc: "Uncharted Wildlife Experience™ — Rangers 'temporarily unavailable'",
    color: "#00E5FF",
    icon: "🐊",
  },
  {
    id: "islands",
    title: "Island Chain",
    location: "Leonida Keys vs. Florida Keys",
    real_label: "FLORIDA KEYS",
    leo_label: "LEONIDA KEYS",
    before: "https://images.unsplash.com/photo-1740989972799-71b5bdd466d0?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    after: "https://images.unsplash.com/photo-1745383792762-ccaeb8e972d0?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    real_desc: "Tropical paradise, Seven Mile Bridge, sustainable coral reef tourism",
    leo_desc: "Honda Bridge Experience™ — Most guardrails still structurally present",
    color: "#00BFFF",
    icon: "🏝",
  },
  {
    id: "harbor",
    title: "Harbor District",
    location: "Port Gellhorn vs. Gulf Coast Harbor",
    real_label: "GULF HARBOR",
    leo_label: "PORT GELLHORN",
    before: "https://images.unsplash.com/photo-1570613141985-aefb384a573b?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    after: "https://images.unsplash.com/photo-1765206257996-9b4a5d886a2c?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    real_desc: "Regulated commercial port, OSHA-compliant, documented cargo manifests",
    leo_desc: "Premium Unregulated Maritime Hub™ — Manifests 'discretionary'",
    color: "#FF8C00",
    icon: "⚓",
  },
  {
    id: "skyline",
    title: "Downtown Skyline",
    location: "Vice City vs. Miami Downtown Night",
    real_label: "REAL MIAMI NIGHT",
    leo_label: "VICE CITY NIGHT",
    before: "https://images.pexels.com/photos/8684754/pexels-photo-8684754.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    after: "https://images.unsplash.com/photo-1652112428671-fceb3e666710?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    real_desc: "Modern metropolis, financial district, impressive architectural diversity",
    leo_desc: "Vice City: Every building has a criminal backstory, most unsealed",
    color: "#FFE600",
    icon: "🌆",
  },
];

export default function ComparisonSlider() {
  const [pairIdx, setPairIdx] = useState(0);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const pair = IMAGE_PAIRS[pairIdx];

  const updatePos = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onMouseMove = useCallback((e) => { if (isDragging) updatePos(e.clientX); }, [isDragging, updatePos]);
  const onTouchMove = useCallback((e) => { e.preventDefault(); updatePos(e.touches[0].clientX); }, [updatePos]);

  const changePair = (idx) => { setPairIdx(idx); setPosition(50); };
  const prev = () => changePair((pairIdx - 1 + IMAGE_PAIRS.length) % IMAGE_PAIRS.length);
  const next = () => changePair((pairIdx + 1) % IMAGE_PAIRS.length);

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-accent text-[#FF007F] text-xl mb-2">The Honest Truth</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white mb-3">
            Real World vs. <span className="neon-pink">Leonida</span>
          </h1>
          <p className="font-body text-gray-400 text-base max-w-2xl mx-auto">
            "They're basically identical," says Honest John. Drag the neon handle to reveal the difference.
            Use the arrows to browse all 5 location comparisons.
          </p>
        </div>

        {/* ── PAIR SELECTOR ── */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          {IMAGE_PAIRS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => changePair(i)}
              data-testid={`pair-selector-${p.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body transition-all duration-200"
              style={{
                background: i === pairIdx ? `${p.color}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${i === pairIdx ? p.color : "rgba(255,255,255,0.1)"}`,
                color: i === pairIdx ? p.color : "#999",
              }}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.title}</span>
            </button>
          ))}
        </div>

        {/* ── MAIN SLIDER ── */}
        <div className="relative">
          {/* Prev / Next arrows */}
          <button onClick={prev} data-testid="pair-prev-btn"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <ChevronLeft size={18} className="text-white" />
          </button>
          <button onClick={next} data-testid="pair-next-btn"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <ChevronRight size={18} className="text-white" />
          </button>

          {/* Slider container */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-2xl select-none cursor-ew-resize"
            style={{ aspectRatio: "16/9", boxShadow: `0 0 40px ${pair.color}30` }}
            onMouseMove={onMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setIsDragging(false)}
            data-testid="comparison-slider-container"
          >
            {/* BEFORE */}
            <img src={pair.before} alt={pair.real_label} className="absolute inset-0 w-full h-full object-cover" />

            {/* AFTER — clip */}
            <div className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
              <img src={pair.after} alt={pair.leo_label} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${pair.color}18 0%, rgba(0,229,255,0.08) 100%)` }} />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 z-10">
              <span className="font-heading text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.2)" }}>
                {pair.real_label}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span className="font-heading text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.75)", border: `1px solid ${pair.color}60`, color: pair.color }}>
                {pair.leo_label}
              </span>
            </div>

            {/* Divider + Handle */}
            <div className="absolute top-0 bottom-0 z-20"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
              <div className="h-full w-0.5"
                style={{ background: `linear-gradient(180deg, transparent, ${pair.color}, #00E5FF, ${pair.color}, transparent)`, boxShadow: `0 0 8px ${pair.color}` }} />
              <button
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full flex items-center justify-center z-30"
                style={{ background: `radial-gradient(circle, ${pair.color}, ${pair.color}aa)`, boxShadow: `0 0 25px ${pair.color}bb`, border: "2px solid #00E5FF" }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
                data-testid="comparison-slider-handle"
              >
                <ChevronLeft size={11} className="text-white" />
                <ChevronRight size={11} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Current pair info */}
        <div className="mt-6 glass-panel p-4 sm:p-5"
          style={{ borderColor: `${pair.color}30` }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-1">{pair.location}</p>
              <h2 className="font-heading text-xl sm:text-2xl text-white">{pair.title}</h2>
            </div>
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {IMAGE_PAIRS.map((p, i) => (
                <button key={`dot-${i}`} onClick={() => changePair(i)} data-testid={`pair-dot-${i}`}
                  className="rounded-full transition-all duration-200"
                  style={{ width: i === pairIdx ? "24px" : "8px", height: "8px", background: i === pairIdx ? pair.color : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
          </div>
          {/* Desc row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-1">Real World</p>
              <p className="font-body text-gray-300 text-sm">{pair.real_desc}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: `${pair.color}10`, border: `1px solid ${pair.color}30` }}>
              <p className="font-body text-xs uppercase tracking-wider mb-1" style={{ color: pair.color }}>Leonida (Honest John™)</p>
              <p className="font-body text-gray-300 text-sm">{pair.leo_desc}</p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-8 glass-panel p-5 sm:p-6 text-center"
          style={{ borderColor: "rgba(255,0,127,0.3)", boxShadow: "0 0 30px rgba(255,0,127,0.08)" }}>
          <p className="font-accent text-[#FFE600] text-xl sm:text-2xl mb-2">Honest John's Verdict:</p>
          <p className="font-body text-gray-300 text-sm sm:text-base italic max-w-3xl mx-auto">
            "Miami is charming in its own mediocre, law-abiding way. Leonida has{" "}
            <span className="text-[#FF007F]">character</span> — the kind that offers you 'business opportunities'
            at 2am. All five of these comparisons are{" "}
            <span className="text-[#00E5FF]">completely objective</span> and not at all influenced by our affiliate arrangement with the Leonida Tourist Board."
          </p>
        </div>
      </div>
    </div>
  );
}
