import { Link } from "react-router-dom";
import { Map, Route, ArrowLeftRight, MessageCircle, ExternalLink, Star, AlertTriangle, ZoomIn, HelpCircle } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import NewsSectionV2 from "./NewsSectionV2";
import { useLaunch } from "../contexts/LaunchContext";

const HERO_BG = "https://images.unsplash.com/photo-1580650897120-0aafc3344a97?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxNaWFtaSUyMGJlYWNoJTIwbmlnaHQlMjBuZW9ufGVufDB8fHx8MTc3NTk3NDM2NHww&ixlib=rb-4.1.0&q=85";
const HARDWARE_BG = "https://images.unsplash.com/photo-1679766900523-d8e1a1393d1f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmclMjBwYyUyMHNldHVwJTIwbmVvbnxlbnwwfHx8fDE3NzU5NzQzNDl8MA&ixlib=rb-4.1.0&q=85";

const FEATURES = [
  { to: "/map", icon: Map, color: "#FF007F", title: "Interactive Map", desc: "Click any region for our satirical travel briefing — 6 regions, zero liability.", tag: "6 Regions", testid: "feature-map" },
  { to: "/route", icon: Route, color: "#00E5FF", title: "A* Route Planner", desc: "Military-grade (stolen) pathfinding between 10 Leonida locations.", tag: "A* Algorithm", testid: "feature-route" },
  { to: "/compare", icon: ArrowLeftRight, color: "#FFE600", title: "Real vs. Leonida", desc: "5 side-by-side comparisons — beaches, wetlands, skylines, keys & harbor.", tag: "5 Comparisons", testid: "feature-compare" },
  { to: "/forensic", icon: ZoomIn, color: "#39FF14", title: "Forensic Analysis", desc: "Deep-zoom intelligence viewer for scrutinizing key Leonida locations.", tag: "Deep Zoom", testid: "feature-forensic" },
  { to: "/faq", icon: HelpCircle, color: "#00BFFF", title: "GTA 6 FAQ", desc: "Every GTA 6 question answered — release date, map size, characters & more.", tag: "SEO Optimized", testid: "feature-faq" },
  { to: "#chat", icon: MessageCircle, color: "#FF8C00", title: "Honest John AI", desc: "Ask Honest John anything about Leonida. GTA 6 knowledge base included.", tag: "AI Chat", testid: "feature-chat" },
];

const HARDWARE = [
  { label: "GPU (Max 4K)", value: "NVIDIA RTX 5090 24GB", href: "https://www.newegg.com/rtx-5090", badge: "RECOMMENDED" },
  { label: "GPU (1440p High)", value: "NVIDIA RTX 4080 Super", href: "https://www.newegg.com/rtx-4080-super", badge: "MIN 4K" },
  { label: "CPU", value: "AMD Ryzen 9800X3D", href: "https://www.newegg.com/ryzen-9800x3d", badge: "BEST CPU" },
  { label: "RAM", value: "64GB DDR5 6000MHz", href: "https://www.newegg.com/64gb-ddr5", badge: "RECOMMENDED" },
];

export default function LandingPage() {
  const { isLaunched } = useLaunch();
  return (
    <div className="page-content bg-[#050505]">
      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-4"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[#050505]" />
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.1) 2px, rgba(0,229,255,0.1) 4px)" }} />

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          {/* LAUNCHED badge */}
          {isLaunched && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.5)" }}>
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span className="font-heading text-[#39FF14] text-sm tracking-widest">LAUNCHED NOVEMBER 19, 2026</span>
            </div>
          )}
          <p className="font-accent text-[#FFE600] text-2xl sm:text-3xl -rotate-2 mb-3 drop-shadow-lg">
            {isLaunched ? "You're now in" : "Welcome to"}
          </p>
          <h1
            className="font-heading text-5xl sm:text-7xl lg:text-8xl text-white mb-3 leading-none glitch-text"
            data-text="LEONIDA"
            style={{ textShadow: "0 0 20px rgba(255,0,127,0.7), 0 0 60px rgba(255,0,127,0.3)" }}
          >
            LEONIDA
          </h1>
          <p className="font-heading text-lg sm:text-2xl mb-2"
            style={{ color: isLaunched ? "#39FF14" : "#00E5FF", textShadow: isLaunched ? "0 0 10px rgba(57,255,20,0.7)" : "0 0 10px rgba(0,229,255,0.7)" }}>
            {isLaunched ? "GTA VI Is HERE — Game On!" : "Honest John's Travel Agency™"}
          </p>
          <p className="font-body text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-3 leading-relaxed">
            {isLaunched
              ? "Leonida is live. Explore the interactive map, plan your routes, and check who mapped the state best on the leaderboard."
              : `"Where Every Destination is a Premium Experience, Every Danger is an Adventure, and Every Lawsuit is Someone Else's Problem."`}
          </p>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="text-[#FFE600] fill-[#FFE600]" />
            ))}
            <span className="text-gray-400 text-xs sm:text-sm ml-2">4.7 stars · 2,841 reviews (paying clients only)</span>
          </div>

          {/* ── COUNTDOWN (or launched state) ── */}
          <div className="glass-panel inline-block px-6 sm:px-8 py-4 sm:py-5 mb-6 w-full sm:w-auto"
            style={{ borderColor: isLaunched ? "rgba(57,255,20,0.4)" : "rgba(255,0,127,0.3)", boxShadow: isLaunched ? "0 0 30px rgba(57,255,20,0.2)" : "0 0 30px rgba(255,0,127,0.15)" }}>
            <CountdownTimer />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/map" data-testid="hero-explore-btn">
              <button className="btn-primary w-full sm:w-auto">{isLaunched ? "Explore Leonida" : "Explore the Map"}</button>
            </Link>
            <Link to="/compare" data-testid="hero-compare-btn">
              <button className="btn-secondary w-full sm:w-auto">Real vs. Leonida</button>
            </Link>
            <Link to="/faq" data-testid="hero-faq-btn">
              <button className="btn-secondary w-full sm:w-auto" style={{ borderColor: "#00BFFF", color: "#00BFFF" }}>GTA 6 FAQ</button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <AlertTriangle size={11} className="text-[#FF007F]" />
            <span>Not liable for alligator incidents, police pursuits, or existential crises.</span>
          </div>
        </div>
      </section>

      <div className="neon-divider" />

      {/* ── FEATURES BENTO ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <p className="font-accent text-[#FF007F] text-xl mb-2">Your Complete Guide</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-white">What Awaits in Leonida</h2>
          <p className="font-body text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Six ways to waste time before GTA 6 drops. No refunds.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} data-testid={f.testid} className="block group">
              <div className="neon-card p-5 h-full"
                style={{ borderColor: `${f.color}30` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = f.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${f.color}30`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}50` }}>
                    <f.icon size={19} style={{ color: f.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-heading text-base sm:text-lg text-white">{f.title}</h3>
                      <span className="text-xs font-body px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}35` }}>
                        {f.tag}
                      </span>
                    </div>
                    <p className="font-body text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* ── REGIONS ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="font-accent text-[#00E5FF] text-xl mb-2">Six Extraordinary Destinations</p>
          <h2 className="font-heading text-3xl sm:text-5xl text-white">The Regions of Leonida</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { name: "Vice City", sub: "Miami, FL", color: "#FF007F", icon: "🌆" },
            { name: "Grassrivers", sub: "The Everglades", color: "#00E5FF", icon: "🐊" },
            { name: "Ambrosia", sub: "Sugar Country", color: "#FFE600", icon: "🏭" },
            { name: "Port Gellhorn", sub: "Gulf Coast", color: "#FF8C00", icon: "⚓" },
            { name: "Mt. Kalaga NP", sub: "N. Florida", color: "#39FF14", icon: "🌲" },
            { name: "Leonida Keys", sub: "Florida Keys", color: "#00BFFF", icon: "🏝" },
          ].map((r) => (
            <Link key={r.name} to="/map" data-testid={`region-card-${r.name.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="glass-panel p-3 sm:p-4 text-center hover:scale-105 transition-transform duration-200 cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-1.5">{r.icon}</div>
                <p className="font-heading text-sm sm:text-base" style={{ color: r.color }}>{r.name}</p>
                <p className="font-body text-gray-500 text-xs mt-0.5">{r.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      <NewsSectionV2 />

      <div className="neon-divider" />

      {/* ── HARDWARE ── */}
      <section
        className="relative py-14 px-4"
        style={{ backgroundImage: `url(${HARDWARE_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
        data-testid="hardware-section"
      >
        <div className="absolute inset-0 bg-[#050505]/90" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="font-accent text-[#FF007F] text-xl mb-2">PC Release: 2027</p>
            <h2 className="font-heading text-3xl sm:text-5xl text-white">
              Prepare Your <span className="neon-cyan">War Machine</span>
            </h2>
            <p className="font-body text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              GTA 6 PC will be demanding. Upgrade NOW on Newegg. (Honest John gets a cut. Just being honest.)
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HARDWARE.map((h) => (
              <a key={h.label} href={h.href} target="_blank" rel="noopener noreferrer"
                data-testid={`hardware-${h.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="glass-panel p-4 sm:p-5 flex items-center justify-between hover:border-[#FF007F]/50 transition-colors group">
                <div>
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-1">{h.label}</p>
                  <p className="font-heading text-white text-base sm:text-lg">{h.value}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[#FF007F]/20 text-[#FF007F] font-body font-semibold">{h.badge}</span>
                  <ExternalLink size={13} className="text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
                </div>
              </a>
            ))}
          </div>
          <p className="text-center font-accent text-[#FFE600] text-base sm:text-lg mt-5">
            Launching November 19, 2026 on PS5 &amp; Xbox Series X/S
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#050505] border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-heading text-[#FF007F] text-base mb-1">Honest John's Travel Agency™</p>
            <p className="font-body text-gray-600 text-xs max-w-sm">
              © 2026 Honest John Enterprises LLC. Not affiliated with Rockstar Games. All 'facts' are satire.
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { to: "/faq", label: "GTA 6 FAQ" },
              { to: "/forensic", label: "Forensic" },
              { to: "/map", label: "Map" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="font-body text-gray-500 text-xs hover:text-[#FF007F] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
