import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Navigation, MapPin, AlertTriangle, Loader2, ChevronRight, ArrowLeftRight, Clock, Shield, Star, Zap, Route as RouteIcon, History } from "lucide-react";
import REGIONS_DATA from "../data/regionsData";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════════════════════════════════
   MAP GEOMETRY (shared with InteractiveMap)
   ═══════════════════════════════════════════════════════════════════════════ */
const REGION_PATHS = [
  { id: "port-gellhorn", name: "Port Gellhorn", path: "M 30,30 L 185,30 L 190,270 L 110,285 L 30,265 Z", base: "#0d1a28", hover: "#1a3a5a", stroke: "#FF8C00", labelX: 100, labelY: 155 },
  { id: "mt-kalaga", name: "Mt. Kalaga NP", path: "M 185,30 L 615,30 L 635,235 L 425,258 L 260,238 L 190,270 L 185,30 Z", base: "#0d2a14", hover: "#1a5028", stroke: "#39FF14", labelX: 390, labelY: 130 },
  { id: "ambrosia", name: "Ambrosia", path: "M 260,238 L 425,258 L 455,365 L 365,412 L 235,388 L 190,270 L 260,238 Z", base: "#261900", hover: "#4a3200", stroke: "#FFE600", labelX: 335, labelY: 325 },
  { id: "grassrivers", name: "Grassrivers", path: "M 235,388 L 365,412 L 455,365 L 515,450 L 485,540 L 325,560 L 175,530 L 190,410 L 235,388 Z", base: "#0a2010", hover: "#1a4020", stroke: "#00E5FF", labelX: 345, labelY: 468 },
  { id: "vice-city", name: "Vice City", path: "M 515,450 L 605,358 L 715,368 L 768,450 L 738,548 L 612,590 L 485,550 L 515,450 Z", base: "#1a0a2a", hover: "#3a1a5a", stroke: "#FF007F", labelX: 628, labelY: 478 },
  { id: "leonida-keys", name: "Leonida Keys", path: "M 612,590 L 738,548 L 795,570 L 805,640 L 732,665 L 643,650 L 617,622 Z", base: "#001828", hover: "#003050", stroke: "#00BFFF", labelX: 712, labelY: 625 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LOCATION METADATA — region + terrain + emoji
   ═══════════════════════════════════════════════════════════════════════════ */
const LOCATION_META = {
  "Vice City":           { region: "vice-city",     terrain: "🏙️ Urban",     color: "#FF007F", speed: 45, emoji: "🌆" },
  "Ocean Drive":         { region: "vice-city",     terrain: "🏖️ Coastal",   color: "#FF007F", speed: 30, emoji: "🏖️" },
  "MacArthur Causeway":  { region: "vice-city",     terrain: "🌉 Bridge",     color: "#FF007F", speed: 55, emoji: "🌉" },
  "Leonida Keys":        { region: "leonida-keys",  terrain: "🏝️ Islands",   color: "#00BFFF", speed: 35, emoji: "🏝️" },
  "Honda Bridge":        { region: "leonida-keys",  terrain: "🌉 Bridge",     color: "#00BFFF", speed: 40, emoji: "🌊" },
  "Grassrivers":         { region: "grassrivers",   terrain: "🌿 Swamp",     color: "#00E5FF", speed: 25, emoji: "🐊" },
  "Thrillbilly Mud Club":{ region: "grassrivers",   terrain: "🏎️ Off-road", color: "#00E5FF", speed: 20, emoji: "🏎️" },
  "Ambrosia":            { region: "ambrosia",       terrain: "🏭 Industrial",color: "#FFE600", speed: 40, emoji: "🏭" },
  "Port Gellhorn":       { region: "port-gellhorn", terrain: "⚓ Port",      color: "#FF8C00", speed: 35, emoji: "⚓" },
  "Mt. Kalaga NP":       { region: "mt-kalaga",     terrain: "🌲 Forest",    color: "#39FF14", speed: 30, emoji: "⛰️" },
};

const LOCATIONS_LIST = Object.keys(LOCATION_META);

/* ═══════════════════════════════════════════════════════════════════════════
   SUGGESTED ROUTES — shown when no route is calculated
   ═══════════════════════════════════════════════════════════════════════════ */
const SUGGESTED_ROUTES = [
  { start: "Vice City", end: "Leonida Keys", title: "The Tourist Express", desc: "Sun, sand, and suspicious fishing boats", icon: "🌴", danger: 6 },
  { start: "Port Gellhorn", end: "Mt. Kalaga NP", title: "The Great Northern Run", desc: "Industrial grit to wilderness serenity", icon: "🏔️", danger: 5 },
  { start: "Grassrivers", end: "Vice City", title: "Swamp to Skyline", desc: "From alligators to nightclubs. Upgrade.", icon: "🐊", danger: 8 },
  { start: "Ocean Drive", end: "Thrillbilly Mud Club", title: "Champagne to Moonshine", desc: "The full Leonida lifestyle spectrum", icon: "🥂", danger: 7 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HONEST JOHN'S ROUTE ADVISORIES — dynamic based on regions crossed
   ═══════════════════════════════════════════════════════════════════════════ */
const ROUTE_ADVISORIES = {
  "vice-city": "Keep your wallet in your front pocket. Or better yet, don't bring one.",
  "grassrivers": "Stay on the marked trail. The unmarked ones have... residents.",
  "ambrosia": "Roll up the windows. The 'aroma' is free of charge.",
  "port-gellhorn": "Don't make eye contact with the dockworkers. Trust me.",
  "mt-kalaga": "Cell service ends here. So does GPS. Good luck, adventurer.",
  "leonida-keys": "Honda Bridge weight limit is 'theoretical'. Drive fast.",
};

function getRegionDanger(regionId) {
  const r = REGIONS_DATA.find(rd => rd.id === regionId);
  return r ? r.danger : 5;
}

function detectRegion(x, y) {
  if (x > 515 && y > 358 && y < 500) return "vice-city";
  if (x > 612 && y > 500) return "leonida-keys";
  if (y > 388) return "grassrivers";
  if (x < 190) return "port-gellhorn";
  if (y > 238) return "ambrosia";
  return "mt-kalaga";
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED VEHICLE DOT — travels along route
   ═══════════════════════════════════════════════════════════════════════════ */
function VehicleDot({ pathD }) {
  if (!pathD) return null;
  return (
    <g>
      <circle r={5} fill="#FFE600" style={{ filter: "drop-shadow(0 0 8px #FFE600)" }}>
        <animateMotion dur="4s" repeatCount="indefinite" path={pathD} />
      </circle>
      <circle r={10} fill="none" stroke="#FFE600" strokeWidth={1} opacity={0.3}>
        <animateMotion dur="4s" repeatCount="indefinite" path={pathD} />
        <animate attributeName="r" values="6;14;6" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AMBIENT PARTICLES (ocean sparkle — same as InteractiveMap)
   ═══════════════════════════════════════════════════════════════════════════ */
function generateParticles(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    id: i, cx: Math.random() * 880, cy: Math.random() * 700,
    r: 0.5 + Math.random() * 1.2, dur: 2 + Math.random() * 4,
    delay: Math.random() * 3, opacity: 0.08 + Math.random() * 0.2,
  }));
}
const PARTICLES = generateParticles(20);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function RoutePlanner() {
  const [start, setStart] = useState("Vice City");
  const [end, setEnd] = useState("Mt. Kalaga NP");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState({});
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [dangerAnimated, setDangerAnimated] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/locations`).then(r => {
      const loc = {};
      r.data.forEach(l => { loc[l.name] = { x: l.x, y: l.y }; });
      setLocations(loc);
    }).catch(() => {});
    // Load recent routes from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("leonida_recent_routes") || "[]");
      setRecentRoutes(saved);
    } catch { }
  }, []);

  useEffect(() => {
    if (route) {
      setDangerAnimated(false);
      const t = setTimeout(() => setDangerAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [route]);

  const calculate = async (s = start, e = end) => {
    if (s === e) { setError("Pick two different locations, darling."); return; }
    setLoading(true); setError(""); setRoute(null);
    try {
      const { data } = await axios.post(`${API}/route`, { start: s, end: e });
      setRoute(data);
      // Save to recent
      const entry = { start: s, end: e, distance: data.total_distance, timestamp: Date.now() };
      const updated = [entry, ...recentRoutes.filter(r => !(r.start === s && r.end === e))].slice(0, 5);
      setRecentRoutes(updated);
      localStorage.setItem("leonida_recent_routes", JSON.stringify(updated));
    } catch (e) {
      setError(e.response?.data?.detail || "Route not found. Even Honest John can't help you here.");
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => { const tmp = start; setStart(end); setEnd(tmp); };

  const handleSuggested = (r) => { setStart(r.start); setEnd(r.end); calculate(r.start, r.end); };

  const buildPathD = (waypoints) => {
    if (!waypoints || waypoints.length < 2) return "";
    return waypoints.map((w, i) => `${i === 0 ? "M" : "L"} ${w.x},${w.y}`).join(" ");
  };

  // ── Calculate route stats ──
  const routeRegions = route ? [...new Set(route.waypoints?.map(w => detectRegion(w.x, w.y)))] : [];
  const avgDanger = routeRegions.length > 0 ? Math.round(routeRegions.reduce((s, r) => s + getRegionDanger(r), 0) / routeRegions.length) : 0;
  const estTime = route ? Math.round(route.total_distance * 8.5) : 0; // ~8.5 min per unit
  const dangerColor = avgDanger >= 7 ? "#FF007F" : avgDanger >= 5 ? "#FFE600" : "#39FF14";

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          <p className="font-accent text-[#00E5FF] text-xl mb-2">Get Lost... Professionally</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white mb-3">
            Leonida <span className="neon-cyan">Route Planner</span>
          </h1>
          <p className="font-body text-gray-400 text-base max-w-xl mx-auto">
            A* pathfinding across Leonida – estimated travel times, terrain intel, and danger warnings included. Honest John not responsible for detours.
          </p>
        </div>

        {/* ── CONTROLS ── */}
        <div className="glass-panel p-5 mb-8 max-w-4xl mx-auto" style={{ borderColor: "rgba(0,229,255,0.2)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
            {/* FROM */}
            <div>
              <label className="font-body text-gray-500 text-xs uppercase tracking-wider block mb-2">From</label>
              <div className="relative">
                <select value={start} onChange={(e) => setStart(e.target.value)} data-testid="route-start-select"
                  className="w-full bg-[#0a0a14] border border-[#39FF14]/30 text-white rounded-lg px-3 py-2.5 font-body text-sm focus:border-[#39FF14] focus:outline-none transition-colors appearance-none">
                  {LOCATIONS_LIST.map(l => <option key={l} value={l}>{LOCATION_META[l].emoji} {l}</option>)}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">{LOCATION_META[start]?.emoji}</div>
              </div>
              <p className="font-body text-[10px] mt-1" style={{ color: LOCATION_META[start]?.color }}>{LOCATION_META[start]?.terrain}</p>
            </div>

            {/* SWAP */}
            <button onClick={swapLocations} data-testid="route-swap-btn"
              className="w-10 h-10 rounded-full flex items-center justify-center self-center mb-4 sm:mb-0 mx-auto transition-all hover:scale-110 hover:rotate-180 duration-300"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <ArrowLeftRight size={14} className="text-gray-400" />
            </button>

            {/* TO */}
            <div>
              <label className="font-body text-gray-500 text-xs uppercase tracking-wider block mb-2">To</label>
              <div className="relative">
                <select value={end} onChange={(e) => setEnd(e.target.value)} data-testid="route-end-select"
                  className="w-full bg-[#0a0a14] border border-[#FF007F]/30 text-white rounded-lg px-3 py-2.5 font-body text-sm focus:border-[#FF007F] focus:outline-none transition-colors appearance-none">
                  {LOCATIONS_LIST.map(l => <option key={l} value={l}>{LOCATION_META[l].emoji} {l}</option>)}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">{LOCATION_META[end]?.emoji}</div>
              </div>
              <p className="font-body text-[10px] mt-1" style={{ color: LOCATION_META[end]?.color }}>{LOCATION_META[end]?.terrain}</p>
            </div>

            {/* CALCULATE */}
            <button onClick={() => calculate()} disabled={loading} data-testid="route-calculate-btn"
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-6 self-center mb-4 sm:mb-0">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {loading ? "Calculating..." : "Plan Route"}
            </button>
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-[#FF007F] font-body text-sm">
              <AlertTriangle size={14} /><span>{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* ══════════════ MAP ══════════════ */}
          <div className="lg:col-span-3">
            <div className="relative w-full rounded-xl overflow-hidden"
              style={{ paddingBottom: "80%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(0,229,255,0.06)" }}>
              <svg ref={svgRef} viewBox="0 0 880 700"
                className="absolute inset-0 w-full h-full"
                style={{ background: "radial-gradient(ellipse at 60% 70%, #001a33 0%, #000d1f 40%, #000308 100%)" }}
                data-testid="route-map-svg">

                <defs>
                  <filter id="route-glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <filter id="route-glow-strong"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#39FF14" /><stop offset="50%" stopColor="#FFE600" /><stop offset="100%" stopColor="#FF007F" />
                  </linearGradient>
                  <pattern id="rp-ocean" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
                    <path d="M0 15 Q15 5, 30 15 Q45 25, 60 15" fill="none" stroke="rgba(0,229,255,0.05)" strokeWidth="0.7">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="8s" repeatCount="indefinite" />
                    </path>
                  </pattern>
                  <pattern id="rp-terrain-swamp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="0.8" fill="rgba(0,229,255,0.06)" /><circle cx="15" cy="12" r="0.6" fill="rgba(0,180,200,0.04)" />
                  </pattern>
                  <pattern id="rp-terrain-urban" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <rect x="2" y="2" width="5" height="5" fill="none" stroke="rgba(255,0,127,0.05)" strokeWidth="0.3" />
                    <rect x="9" y="9" width="5" height="5" fill="none" stroke="rgba(255,0,127,0.03)" strokeWidth="0.3" />
                  </pattern>
                  <pattern id="rp-terrain-forest" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M12 4 L8 12 L16 12 Z" fill="none" stroke="rgba(57,255,20,0.05)" strokeWidth="0.3" />
                  </pattern>
                  <radialGradient id="rp-vignette" cx="50%" cy="50%" r="60%">
                    <stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                  </radialGradient>
                </defs>

                {/* Ocean */}
                <rect width="880" height="700" fill="url(#rp-ocean)" />

                {/* Particles */}
                {PARTICLES.map(p => (
                  <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill="#00E5FF" opacity={0}>
                    <animate attributeName="opacity" values={`0;${p.opacity};0`} dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
                  </circle>
                ))}

                {/* Region fills with terrain */}
                {REGION_PATHS.map((r) => {
                  const isOnRoute = routeRegions.includes(r.id);
                  const terrainId = r.id === "grassrivers" ? "rp-terrain-swamp"
                    : r.id === "vice-city" ? "rp-terrain-urban"
                    : r.id === "mt-kalaga" ? "rp-terrain-forest" : null;
                  return (
                    <g key={r.id}>
                      <path d={r.path} fill={r.base} stroke={r.stroke}
                        strokeWidth={isOnRoute ? 2 : 1} strokeOpacity={isOnRoute ? 0.7 : 0.25}
                        style={{ transition: "all 0.5s", filter: isOnRoute ? `drop-shadow(0 0 8px ${r.stroke})` : "none" }} />
                      {terrainId && <path d={r.path} fill={`url(#${terrainId})`} style={{ pointerEvents: "none" }} />}
                      {isOnRoute && (
                        <path d={r.path} fill="none" stroke={r.stroke} strokeWidth={1} strokeOpacity={0.2}>
                          <animate attributeName="stroke-opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
                        </path>
                      )}
                      <text x={r.labelX} y={r.labelY} textAnchor="middle"
                        fill={isOnRoute ? r.stroke : "rgba(255,255,255,0.3)"} fontSize={isOnRoute ? 12 : 10}
                        fontFamily="Righteous, cursive"
                        style={{ transition: "all 0.5s", filter: isOnRoute ? `drop-shadow(0 0 6px ${r.stroke})` : "none" }}>
                        {r.name}
                      </text>
                    </g>
                  );
                })}

                {/* ── ROUTE PATH ── */}
                {route && route.waypoints?.length > 1 && (
                  <>
                    {/* Wide glow under route */}
                    <path d={buildPathD(route.waypoints)} fill="none"
                      stroke="url(#route-gradient)" strokeWidth={8} strokeOpacity={0.2} strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: "url(#route-glow-strong)" }} />
                    {/* Main gradient path */}
                    <path d={buildPathD(route.waypoints)} fill="none"
                      stroke="url(#route-gradient)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="10 5" data-testid="route-path-line">
                      <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="2s" repeatCount="indefinite" />
                    </path>

                    {/* Animated vehicle dot */}
                    <VehicleDot pathD={buildPathD(route.waypoints)} />

                    {/* Waypoint markers */}
                    {route.waypoints.map((w, i) => {
                      const isStart = i === 0;
                      const isEnd = i === route.waypoints.length - 1;
                      const meta = LOCATION_META[w.name];
                      const color = isStart ? "#39FF14" : isEnd ? "#FF007F" : (meta?.color || "#FFE600");
                      return (
                        <g key={i}>
                          {/* Pulse ring on start/end */}
                          {(isStart || isEnd) && (
                            <circle cx={w.x} cy={w.y} r={12} fill="none" stroke={color} strokeWidth={1} opacity={0.4}>
                              <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
                            </circle>
                          )}
                          {/* Main marker */}
                          <circle cx={w.x} cy={w.y} r={isStart || isEnd ? 8 : 5}
                            fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
                          <circle cx={w.x} cy={w.y} r={isStart || isEnd ? 4 : 2} fill="#000" opacity={0.3} />
                          {/* Flag icon for start/end */}
                          {isStart && <text x={w.x} y={w.y - 14} textAnchor="middle" fontSize={12}>🟢</text>}
                          {isEnd && <text x={w.x} y={w.y - 14} textAnchor="middle" fontSize={12}>🔴</text>}
                          {/* Label */}
                          <text x={w.x} y={w.y + (isStart || isEnd ? 20 : 15)} textAnchor="middle"
                            fill={color} fontSize={isStart || isEnd ? 10 : 8} fontFamily="Righteous, cursive"
                            style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
                            {w.name}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* Default location dots when no route */}
                {!route && Object.entries(locations).map(([name, pos]) => {
                  const meta = LOCATION_META[name];
                  return (
                    <g key={name}>
                      <circle cx={pos.x} cy={pos.y} r={5} fill={meta?.color || "#fff"} opacity={0.5}
                        style={{ filter: `drop-shadow(0 0 4px ${meta?.color || "#fff"})` }}>
                        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <text x={pos.x} y={pos.y - 9} textAnchor="middle"
                        fill={meta?.color || "rgba(255,255,255,0.5)"} fontSize={8} fontFamily="Righteous, cursive">
                        {name}
                      </text>
                    </g>
                  );
                })}

                {/* Vignette */}
                <rect width="880" height="700" fill="url(#rp-vignette)" style={{ pointerEvents: "none" }} />

                {/* Watermark */}
                <text x={440} y={688} textAnchor="middle" fill="rgba(255,255,255,0.04)" fontSize={8} fontFamily="Righteous">
                  HONEST JOHN'S TRAVEL AGENCY · ROUTE INTELLIGENCE · CONFIDENTIAL
                </text>
              </svg>
            </div>
          </div>

          {/* ══════════════ SIDE PANEL ══════════════ */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[70vh] lg:max-h-none">
            {route ? (
              <>
                {/* ── ROUTE SUMMARY ── */}
                <div className="glass-panel p-5" style={{ borderColor: "rgba(0,229,255,0.2)" }}>
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3">Route Summary</p>

                  {/* Start → End */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-[#39FF14]" style={{ boxShadow: "0 0 6px #39FF14" }} />
                    <p className="font-heading text-white text-sm">{route.path[0]}</p>
                    <span className="text-xs" style={{ color: LOCATION_META[route.path[0]]?.color }}>{LOCATION_META[route.path[0]]?.emoji}</span>
                  </div>
                  <div className="ml-1.5 border-l border-dashed border-[#FFE600]/40 pl-3 my-1">
                    <p className="font-body text-gray-500 text-xs">{route.path.length - 2} waypoints · {routeRegions.length} regions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF007F]" style={{ boxShadow: "0 0 6px #FF007F" }} />
                    <p className="font-heading text-white text-sm">{route.path[route.path.length - 1]}</p>
                    <span className="text-xs" style={{ color: LOCATION_META[route.path[route.path.length - 1]]?.color }}>{LOCATION_META[route.path[route.path.length - 1]]?.emoji}</span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="font-body text-gray-500 text-[10px] uppercase">Distance</p>
                      <p className="font-heading text-[#00E5FF] text-lg">{route.total_distance}</p>
                      <p className="font-body text-gray-600 text-[10px]">units</p>
                    </div>
                    <div>
                      <p className="font-body text-gray-500 text-[10px] uppercase">Est. Time</p>
                      <p className="font-heading text-[#FFE600] text-lg">{estTime}</p>
                      <p className="font-body text-gray-600 text-[10px]">minutes</p>
                    </div>
                    <div>
                      <p className="font-body text-gray-500 text-[10px] uppercase">Danger</p>
                      <p className="font-heading text-lg" style={{ color: dangerColor }}>{avgDanger}/10</p>
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden mt-1">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: dangerAnimated ? `${avgDanger * 10}%` : "0%",
                            background: `linear-gradient(90deg, ${dangerColor}60, ${dangerColor})`,
                            boxShadow: `0 0 6px ${dangerColor}` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── TERRAIN BREAKDOWN ── */}
                <div className="glass-panel p-5">
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <RouteIcon size={11} />Route Steps
                  </p>
                  <div className="space-y-3">
                    {route.steps?.map((step, i) => {
                      const fromMeta = LOCATION_META[step.from];
                      const toMeta = LOCATION_META[step.to];
                      const fromRegion = fromMeta?.region;
                      const toRegion = toMeta?.region;
                      const crossingRegions = fromRegion !== toRegion;
                      return (
                        <div key={`step-${step.from}-${step.to}`}
                          className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2"
                          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                          data-testid={`route-step-${i}`}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading flex-shrink-0 mt-0.5"
                            style={{ background: `${fromMeta?.color || "#FF007F"}20`, border: `1px solid ${fromMeta?.color || "#FF007F"}40`, color: fromMeta?.color || "#FF007F" }}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-white text-sm">{step.from}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <ChevronRight size={10} className="text-gray-600" />
                              <span className="font-body text-gray-400 text-xs">{step.to}</span>
                              <span className="font-body text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: `${fromMeta?.color || "#aaa"}15`, color: fromMeta?.color || "#aaa" }}>
                                {fromMeta?.terrain}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-body text-gray-600 text-[10px]">{step.distance} units</span>
                              {crossingRegions && (
                                <span className="text-[10px] font-heading px-1.5 py-0.5 rounded-full"
                                  style={{ background: "rgba(255,230,0,0.1)", color: "#FFE600", border: "1px solid rgba(255,230,0,0.2)" }}>
                                  ⚡ Region crossing
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── HONEST JOHN'S ROUTE ADVISORY ── */}
                <div className="glass-panel p-4" style={{ borderColor: "rgba(255,230,0,0.2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={13} className="text-[#FFE600]" />
                    <p className="font-heading text-sm text-[#FFE600]">Honest John's Route Advisory</p>
                  </div>
                  <div className="space-y-1.5">
                    {routeRegions.map(rId => (
                      <p key={rId} className="font-body text-gray-400 text-xs italic flex items-start gap-1.5">
                        <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" style={{ color: REGION_PATHS.find(r => r.id === rId)?.stroke }} />
                        <span><strong style={{ color: REGION_PATHS.find(r => r.id === rId)?.stroke }}>{REGION_PATHS.find(r => r.id === rId)?.name}:</strong> {ROUTE_ADVISORIES[rId] || "No intel available."}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* ── ALGORITHM INFO ── */}
                <div className="glass-panel p-4 text-center" style={{ borderColor: "rgba(255,0,127,0.15)" }}>
                  <p className="font-heading text-[#FF007F] text-xs mb-1 flex items-center justify-center gap-1.5"><Zap size={10} />A* Pathfinding</p>
                  <p className="font-body text-gray-600 text-[10px]">
                    f(n) = g(n) + h(n) · Manhattan Distance heuristic · Optimal path guaranteed
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* ── SUGGESTED ROUTES ── */}
                <div>
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Navigation size={11} />Popular Routes
                  </p>
                  <div className="space-y-3">
                    {SUGGESTED_ROUTES.map((r, i) => (
                      <button key={i} onClick={() => handleSuggested(r)} data-testid={`suggested-route-${i}`}
                        className="w-full text-left glass-panel p-4 transition-all hover:scale-[1.02] hover:border-[#00E5FF]/40 group">
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-white text-sm group-hover:text-[#00E5FF] transition-colors">{r.title}</p>
                            <p className="font-body text-gray-500 text-xs mt-0.5">{r.desc}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="font-body text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: `${LOCATION_META[r.start]?.color}15`, color: LOCATION_META[r.start]?.color }}>
                                {LOCATION_META[r.start]?.emoji} {r.start}
                              </span>
                              <ChevronRight size={10} className="text-gray-600" />
                              <span className="font-body text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: `${LOCATION_META[r.end]?.color}15`, color: LOCATION_META[r.end]?.color }}>
                                {LOCATION_META[r.end]?.emoji} {r.end}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Shield size={10} style={{ color: r.danger >= 7 ? "#FF007F" : r.danger >= 5 ? "#FFE600" : "#39FF14" }} />
                            <span className="font-heading text-xs" style={{ color: r.danger >= 7 ? "#FF007F" : r.danger >= 5 ? "#FFE600" : "#39FF14" }}>{r.danger}/10</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── RECENT ROUTES ── */}
                {recentRoutes.length > 0 && (
                  <div>
                    <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <History size={11} />Recent Routes
                    </p>
                    <div className="space-y-2">
                      {recentRoutes.map((r, i) => (
                        <button key={i} onClick={() => { setStart(r.start); setEnd(r.end); calculate(r.start, r.end); }}
                          className="w-full text-left glass-panel p-3 transition-all hover:border-[#FF007F]/30 flex items-center gap-3"
                          data-testid={`recent-route-${i}`}>
                          <Clock size={12} className="text-gray-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-white text-xs truncate">
                              {LOCATION_META[r.start]?.emoji} {r.start} → {LOCATION_META[r.end]?.emoji} {r.end}
                            </p>
                            <p className="font-body text-gray-600 text-[10px]">{r.distance} units · {new Date(r.timestamp).toLocaleDateString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── EMPTY STATE ── */}
                <div className="glass-panel p-6 text-center flex-1 flex flex-col items-center justify-center min-h-[120px]">
                  <MapPin size={28} className="text-[#00E5FF] mb-3 opacity-40" />
                  <p className="font-heading text-white text-sm mb-1">Choose Your Journey</p>
                  <p className="font-body text-gray-500 text-xs max-w-xs mx-auto">
                    Select a suggested route above or pick your own start & end locations.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
