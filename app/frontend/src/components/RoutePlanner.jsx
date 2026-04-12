import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Navigation, MapPin, AlertTriangle, Loader2, ChevronRight,
  Clock, Star, Zap, Route as RouteIcon, History, MousePointer,
  X, GripVertical, ChevronDown, ChevronUp, RotateCcw, Sparkles
} from "lucide-react";
import REGIONS_DATA from "../data/regionsData";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════════════════════════════════
   MAP GEOMETRY
   ═══════════════════════════════════════════════════════════════════════════ */
const REGION_PATHS = [
  { id: "port-gellhorn", name: "Port Gellhorn", path: "M 30,30 L 185,30 L 190,270 L 110,285 L 30,265 Z", base: "#0d1a28", stroke: "#FF8C00", labelX: 100, labelY: 155 },
  { id: "mt-kalaga", name: "Mt. Kalaga NP", path: "M 185,30 L 615,30 L 635,235 L 425,258 L 260,238 L 190,270 L 185,30 Z", base: "#0d2a14", stroke: "#39FF14", labelX: 390, labelY: 130 },
  { id: "ambrosia", name: "Ambrosia", path: "M 260,238 L 425,258 L 455,365 L 365,412 L 235,388 L 190,270 L 260,238 Z", base: "#261900", stroke: "#FFE600", labelX: 335, labelY: 325 },
  { id: "grassrivers", name: "Grassrivers", path: "M 235,388 L 365,412 L 455,365 L 515,450 L 485,540 L 325,560 L 175,530 L 190,410 L 235,388 Z", base: "#0a2010", stroke: "#00E5FF", labelX: 345, labelY: 468 },
  { id: "vice-city", name: "Vice City", path: "M 515,450 L 605,358 L 715,368 L 768,450 L 738,548 L 612,590 L 485,550 L 515,450 Z", base: "#1a0a2a", stroke: "#FF007F", labelX: 628, labelY: 478 },
  { id: "leonida-keys", name: "Leonida Keys", path: "M 612,590 L 738,548 L 795,570 L 805,640 L 732,665 L 643,650 L 617,622 Z", base: "#001828", stroke: "#00BFFF", labelX: 712, labelY: 625 },
];

const LOCATION_META = {
  "Vice City":           { region: "vice-city",     terrain: "Urban",       color: "#FF007F", emoji: "🌆" },
  "Ocean Drive":         { region: "vice-city",     terrain: "Coastal",     color: "#FF007F", emoji: "🏖️" },
  "MacArthur Causeway":  { region: "vice-city",     terrain: "Bridge",      color: "#FF007F", emoji: "🌉" },
  "Leonida Keys":        { region: "leonida-keys",  terrain: "Islands",     color: "#00BFFF", emoji: "🏝️" },
  "Honda Bridge":        { region: "leonida-keys",  terrain: "Bridge",      color: "#00BFFF", emoji: "🌊" },
  "Grassrivers":         { region: "grassrivers",   terrain: "Swamp",       color: "#00E5FF", emoji: "🐊" },
  "Thrillbilly Mud Club":{ region: "grassrivers",   terrain: "Off-road",    color: "#00E5FF", emoji: "🏎️" },
  "Ambrosia":            { region: "ambrosia",       terrain: "Industrial",  color: "#FFE600", emoji: "🏭" },
  "Port Gellhorn":       { region: "port-gellhorn", terrain: "Port",        color: "#FF8C00", emoji: "⚓" },
  "Mt. Kalaga NP":       { region: "mt-kalaga",     terrain: "Forest",      color: "#39FF14", emoji: "⛰️" },
};

const LOCATIONS_LIST = Object.keys(LOCATION_META);

const ROUTE_ADVISORIES = {
  "vice-city": "Keep your wallet in your front pocket.",
  "grassrivers": "Stay on the marked trail. The unmarked ones have... residents.",
  "ambrosia": "Roll up the windows. The 'aroma' is free of charge.",
  "port-gellhorn": "Don't make eye contact with the dockworkers.",
  "mt-kalaga": "Cell service ends here. So does GPS. Good luck.",
  "leonida-keys": "Honda Bridge weight limit is 'theoretical'. Drive fast.",
};

const SUGGESTED_ROUTES = [
  { stops: ["Vice City", "Grassrivers", "Mt. Kalaga NP"], title: "The Grand Tour", desc: "City → Swamp → Mountain", icon: "🗺️" },
  { stops: ["Ocean Drive", "Vice City", "Leonida Keys"], title: "Coastal Cruise", desc: "Beach vibes all the way", icon: "🌴" },
  { stops: ["Port Gellhorn", "Ambrosia", "Grassrivers", "Vice City"], title: "Cross-State Runner", desc: "The full Leonida experience", icon: "🏃" },
  { stops: ["Thrillbilly Mud Club", "Grassrivers", "Vice City", "Leonida Keys", "Honda Bridge"], title: "Outlaw's Path", desc: "Mud to neon to paradise", icon: "💀" },
];

const SEGMENT_COLORS = ["#39FF14", "#00E5FF", "#FFE600", "#FF007F", "#FF8C00", "#00BFFF", "#9D4EDD", "#FF6B6B"];

function getRegionDanger(regionId) {
  const r = REGIONS_DATA.find(rd => rd.id === regionId);
  return r ? r.danger : 5;
}

/* ═══════════════════════════════════════════════════════════════════════════
   VEHICLE DOT
   ═══════════════════════════════════════════════════════════════════════════ */
function VehicleDot({ pathD }) {
  if (!pathD) return null;
  return (
    <g>
      <circle r={5} fill="#FFE600" style={{ filter: "drop-shadow(0 0 8px #FFE600)" }}>
        <animateMotion dur="6s" repeatCount="indefinite" path={pathD} />
      </circle>
      <circle r={10} fill="none" stroke="#FFE600" strokeWidth={1} opacity={0.3}>
        <animateMotion dur="6s" repeatCount="indefinite" path={pathD} />
        <animate attributeName="r" values="6;14;6" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TIMELINE STRIP — OptimoRoute-style horizontal route timeline
   ═══════════════════════════════════════════════════════════════════════════ */
function RouteTimeline({ routeData, stops }) {
  if (!routeData || !routeData.segments) return null;
  const totalDist = routeData.total_distance || 1;

  return (
    <div className="glass-panel p-4 mt-4" style={{ borderColor: "rgba(0,229,255,0.15)" }}>
      <p className="font-body text-gray-500 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <RouteIcon size={10} />Route Timeline · {routeData.total_stops} stops · {routeData.total_distance} units
      </p>
      <div className="relative flex items-center" style={{ minHeight: "60px" }}>
        {/* Background track */}
        <div className="absolute top-[28px] left-4 right-4 h-1 rounded-full bg-white/5" />

        {/* Colored segment tracks */}
        {routeData.segments.map((seg, i) => {
          const prevDist = routeData.segments.slice(0, i).reduce((s, sg) => s + sg.distance, 0);
          const leftPct = (prevDist / totalDist) * 100;
          const widthPct = (seg.distance / totalDist) * 100;
          const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          return (
            <div key={i} className="absolute top-[27px] h-[6px] rounded-full" style={{
              left: `${4 + leftPct * 0.92}%`,
              width: `${widthPct * 0.92}%`,
              background: color, boxShadow: `0 0 8px ${color}50`,
            }} />
          );
        })}

        {/* Stop nodes */}
        {stops.map((stop, i) => {
          const meta = LOCATION_META[stop];
          const isFirst = i === 0;
          const isLast = i === stops.length - 1;
          const leftPct = i === 0 ? 0 : (routeData.segments.slice(0, i).reduce((s, sg) => s + sg.distance, 0) / totalDist) * 100;
          const color = isFirst ? "#39FF14" : isLast ? "#FF007F" : (meta?.color || "#FFE600");

          return (
            <div key={i} className="absolute flex flex-col items-center"
              style={{ left: `${4 + leftPct * 0.92}%`, transform: "translateX(-50%)" }}>
              <span className="text-xs mb-1">{meta?.emoji}</span>
              <div className="w-4 h-4 rounded-full border-2 z-10"
                style={{ background: "#0a0a14", borderColor: color, boxShadow: `0 0 6px ${color}60` }} />
              <span className="font-heading text-[8px] mt-1 whitespace-nowrap max-w-[60px] truncate"
                style={{ color }}>{stop.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STOPS LIST — OptimoRoute-style draggable stop list
   ═══════════════════════════════════════════════════════════════════════════ */
function StopsList({ stops, setStops, onCalculate, loading }) {
  const [dragIndex, setDragIndex] = useState(null);

  const addStop = (name) => {
    if (stops.includes(name)) return;
    setStops([...stops, name]);
  };

  const removeStop = (i) => {
    const ns = [...stops];
    ns.splice(i, 1);
    setStops(ns);
  };

  const moveStop = (from, to) => {
    const ns = [...stops];
    const [item] = ns.splice(from, 1);
    ns.splice(to, 0, item);
    setStops(ns);
  };

  const handleDragStart = (i) => setDragIndex(i);
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    moveStop(dragIndex, i);
    setDragIndex(i);
  };
  const handleDragEnd = () => setDragIndex(null);

  return (
    <div className="glass-panel p-4" style={{ borderColor: "rgba(0,229,255,0.2)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={11} />Journey Stops ({stops.length})
        </p>
        {stops.length >= 2 && (
          <button onClick={onCalculate} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-heading transition-all"
            style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.3)", color: "#39FF14" }}>
            {loading ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />}
            {loading ? "Planning..." : "Plan Route"}
          </button>
        )}
      </div>

      {/* Stop items */}
      <div className="space-y-1.5">
        {stops.map((stop, i) => {
          const meta = LOCATION_META[stop];
          const isFirst = i === 0;
          const isLast = i === stops.length - 1;
          const dotColor = isFirst ? "#39FF14" : isLast ? "#FF007F" : (meta?.color || "#FFE600");
          return (
            <div key={`${stop}-${i}`}
              draggable onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)} onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${dragIndex === i ? "opacity-50 scale-95" : ""}`}
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${dotColor}15` }}>
              {/* Drag handle */}
              <GripVertical size={12} className="text-gray-700 cursor-grab group-hover:text-gray-400 transition-colors flex-shrink-0" />

              {/* Stop number + connector */}
              <div className="flex flex-col items-center flex-shrink-0 relative">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-heading"
                  style={{ background: `${dotColor}20`, border: `1.5px solid ${dotColor}`, color: dotColor }}>
                  {i + 1}
                </div>
                {!isLast && <div className="w-0.5 h-3 mt-0.5" style={{ background: `${dotColor}30` }} />}
              </div>

              {/* Location info */}
              <div className="flex-1 min-w-0">
                <p className="font-heading text-white text-xs truncate">{meta?.emoji} {stop}</p>
                <p className="font-body text-[10px]" style={{ color: dotColor }}>{meta?.terrain} · {isFirst ? "Start" : isLast ? "Destination" : `Stop ${i}`}</p>
              </div>

              {/* Move buttons */}
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button onClick={() => moveStop(i, i - 1)} className="text-gray-600 hover:text-white p-0.5"><ChevronUp size={10} /></button>
                )}
                {i < stops.length - 1 && (
                  <button onClick={() => moveStop(i, i + 1)} className="text-gray-600 hover:text-white p-0.5"><ChevronDown size={10} /></button>
                )}
              </div>

              {/* Remove */}
              <button onClick={() => removeStop(i)} className="text-gray-700 hover:text-[#FF007F] transition-colors p-1 flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add stop dropdown */}
      {stops.length < 10 && (
        <div className="mt-2">
          <select
            value=""
            onChange={(e) => { if (e.target.value) addStop(e.target.value); }}
            className="w-full bg-[#0a0a14] border border-dashed border-white/10 text-gray-500 rounded-lg px-3 py-2 font-body text-xs focus:border-[#00E5FF] focus:outline-none transition-colors"
            data-testid="add-stop-select">
            <option value="">+ Add stop...</option>
            {LOCATIONS_LIST.filter(l => !stops.includes(l)).map(l => (
              <option key={l} value={l}>{LOCATION_META[l].emoji}  {l}</option>
            ))}
          </select>
        </div>
      )}

      {stops.length === 0 && (
        <div className="text-center py-4">
          <p className="font-body text-gray-600 text-xs">Click locations on the map or use the dropdown above to start planning.</p>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function RoutePlanner() {
  const [stops, setStops] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState({});
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [hoveredLoc, setHoveredLoc] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/locations`).then(r => {
      const loc = {};
      r.data.forEach(l => { loc[l.name] = { x: l.x, y: l.y }; });
      setLocations(loc);
    }).catch(() => {});
    try {
      const saved = JSON.parse(localStorage.getItem("leonida_recent_routes_v2") || "[]");
      setRecentRoutes(saved);
    } catch { }
  }, []);

  const calculate = useCallback(async (stopsToRoute) => {
    const s = stopsToRoute || stops;
    if (s.length < 2) return;
    setLoading(true); setError(""); setRouteData(null);
    try {
      const { data } = await axios.post(`${API}/route/multi`, { stops: s });
      setRouteData(data);
      // Save to recent
      const entry = { stops: s, distance: data.total_distance, timestamp: Date.now() };
      const updated = [entry, ...recentRoutes.filter(r => JSON.stringify(r.stops) !== JSON.stringify(s))].slice(0, 5);
      setRecentRoutes(updated);
      localStorage.setItem("leonida_recent_routes_v2", JSON.stringify(updated));
    } catch (err) {
      setError(err.response?.data?.detail || "Route not found. Honest John says try a different path.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, recentRoutes]);

  // Click map location → add to stops
  const handleLocationClick = useCallback((name) => {
    if (stops.includes(name)) return;
    const newStops = [...stops, name];
    setStops(newStops);
    if (newStops.length >= 2) calculate(newStops);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  const clearAll = () => { setStops([]); setRouteData(null); setError(""); };

  const handleSuggested = (r) => { setStops(r.stops); calculate(r.stops); };

  const buildPathD = (waypoints) => {
    if (!waypoints || waypoints.length < 2) return "";
    return waypoints.map((w, i) => `${i === 0 ? "M" : "L"} ${w.x},${w.y}`).join(" ");
  };

  // Route regions for highlighting

  // Stats
  const estTime = routeData ? Math.round(routeData.total_distance * 8.5) : 0;
  const dangerRegions = routeData ? [...new Set(stops.map(s => LOCATION_META[s]?.region).filter(Boolean))] : [];
  const avgDanger = dangerRegions.length > 0 ? Math.round(dangerRegions.reduce((s, r) => s + getRegionDanger(r), 0) / dangerRegions.length) : 0;
  const dangerColor = avgDanger >= 7 ? "#FF007F" : avgDanger >= 5 ? "#FFE600" : "#39FF14";

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* ── HEADER ── */}
        <div className="text-center mb-6">
          <p className="font-accent text-[#00E5FF] text-xl mb-2">Multi-Stop Journey Planner</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white mb-3">
            Leonida <span className="neon-cyan">Route Planner</span>
          </h1>
          <p className="font-body text-gray-400 text-sm max-w-2xl mx-auto">
            Plan multi-stop journeys across Leonida. Click locations on the map, drag to reorder stops, and let our A* algorithm find the optimal path. Just like OptimoRoute — but with more alligators.
          </p>
        </div>

        {/* ── MODE INDICATOR ── */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)" }}>
            <MousePointer size={12} className="text-[#00E5FF]" />
            <span className="font-body text-gray-400 text-xs">
              {stops.length === 0 ? (
                <><span className="text-[#39FF14] font-heading">Click any location</span> on the map to start your journey</>
              ) : (
                <><span className="text-[#00E5FF] font-heading">{stops.length} stop{stops.length !== 1 ? "s" : ""}</span> planned · Click more to add · Drag to reorder</>
              )}
            </span>
          </div>
          {stops.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-heading text-gray-500 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RotateCcw size={10} />Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* ══════════════ MAP (8 cols) ══════════════ */}
          <div className="lg:col-span-8">
            <div className="relative w-full rounded-xl overflow-hidden"
              style={{ paddingBottom: "75%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(0,229,255,0.06)" }}>
              <svg ref={svgRef} viewBox="0 0 880 700"
                className="absolute inset-0 w-full h-full"
                style={{ background: "radial-gradient(ellipse at 60% 70%, #001a33 0%, #000d1f 40%, #000308 100%)" }}
                data-testid="route-map-svg">

                <defs>
                  <filter id="rg"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <filter id="rgs"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <pattern id="rp-oc" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
                    <path d="M0 15 Q15 5, 30 15 Q45 25, 60 15" fill="none" stroke="rgba(0,229,255,0.04)" strokeWidth="0.6">
                      <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="8s" repeatCount="indefinite" />
                    </path>
                  </pattern>
                  <radialGradient id="rp-v" cx="50%" cy="50%" r="60%">
                    <stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                  </radialGradient>
                </defs>

                <rect width="880" height="700" fill="url(#rp-oc)" />

                {/* Region fills */}
                {REGION_PATHS.map((r) => {
                  const isOnRoute = dangerRegions.includes(r.id);
                  return (
                    <g key={r.id}>
                      <path d={r.path} fill={r.base} stroke={r.stroke}
                        strokeWidth={isOnRoute ? 2 : 1} strokeOpacity={isOnRoute ? 0.6 : 0.2}
                        style={{ transition: "all 0.5s", filter: isOnRoute ? `drop-shadow(0 0 6px ${r.stroke})` : "none" }} />
                      {isOnRoute && (
                        <path d={r.path} fill="none" stroke={r.stroke} strokeWidth={1} strokeOpacity={0.15}>
                          <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="2.5s" repeatCount="indefinite" />
                        </path>
                      )}
                      <text x={r.labelX} y={r.labelY} textAnchor="middle"
                        fill={isOnRoute ? r.stroke : "rgba(255,255,255,0.25)"} fontSize={isOnRoute ? 11 : 9}
                        fontFamily="Righteous, cursive"
                        style={{ transition: "all 0.5s", filter: isOnRoute ? `drop-shadow(0 0 4px ${r.stroke})` : "none", pointerEvents: "none" }}>
                        {r.name}
                      </text>
                    </g>
                  );
                })}

                {/* ── ROUTE SEGMENTS — each segment gets its own color ── */}
                {routeData?.segments?.map((seg, i) => {
                  const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
                  const pathD = buildPathD(seg.waypoints);
                  return (
                    <g key={i}>
                      <path d={pathD} fill="none" stroke={color} strokeWidth={6} strokeOpacity={0.15}
                        strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#rgs)", pointerEvents: "none" }} />
                      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray="8 4" style={{ pointerEvents: "none" }}>
                        <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="2s" repeatCount="indefinite" />
                      </path>
                    </g>
                  );
                })}

                {/* Vehicle dot on full path */}
                {routeData?.full_waypoints && <VehicleDot pathD={buildPathD(routeData.full_waypoints)} />}

                {/* ── LOCATION DOTS — always clickable ── */}
                {Object.entries(locations).map(([name, pos]) => {
                  const meta = LOCATION_META[name];
                  const stopIndex = stops.indexOf(name);
                  const isStop = stopIndex !== -1;
                  const isFirst = stopIndex === 0;
                  const isLast = stopIndex === stops.length - 1 && stops.length > 1;
                  const isHovered = hoveredLoc === name;
                  const color = isFirst ? "#39FF14" : isLast ? "#FF007F" : isStop ? "#FFE600" : (meta?.color || "#fff");

                  return (
                    <g key={name}
                      onClick={() => handleLocationClick(name)}
                      onMouseEnter={() => setHoveredLoc(name)}
                      onMouseLeave={() => setHoveredLoc(null)}
                      style={{ cursor: isStop ? "default" : "pointer" }}>

                      {/* Hover ring */}
                      {isHovered && !isStop && (
                        <circle cx={pos.x} cy={pos.y} r={16} fill="none" stroke={color} strokeWidth={1} opacity={0.4} strokeDasharray="4 3">
                          <animateTransform attributeName="transform" type="rotate" from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`} dur="4s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Stop pulse */}
                      {isStop && (
                        <circle cx={pos.x} cy={pos.y} r={12} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4}>
                          <animate attributeName="r" values="10;20;10" dur="2.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Main dot */}
                      <circle cx={pos.x} cy={pos.y} r={isStop ? 10 : isHovered ? 7 : 5}
                        fill={color} opacity={isStop ? 1 : isHovered ? 0.8 : 0.35}
                        style={{ filter: `drop-shadow(0 0 ${isStop ? 8 : 3}px ${color})`, transition: "all 0.2s" }} />

                      {/* Stop number */}
                      {isStop && (
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#000"
                          fontSize={9} fontWeight="bold" fontFamily="Righteous" style={{ pointerEvents: "none" }}>
                          {stopIndex + 1}
                        </text>
                      )}

                      {/* Label */}
                      <text x={pos.x} y={pos.y + (isStop ? 22 : 16)} textAnchor="middle"
                        fill={isStop ? color : isHovered ? "#fff" : "rgba(255,255,255,0.3)"}
                        fontSize={isStop ? 10 : isHovered ? 9 : 8} fontFamily="Righteous, cursive"
                        style={{ filter: isStop ? `drop-shadow(0 0 4px ${color})` : "none", pointerEvents: "none", transition: "all 0.2s" }}>
                        {name}
                      </text>

                      {/* Hover tooltip */}
                      {isHovered && !isStop && (
                        <g>
                          <rect x={pos.x - 50} y={pos.y - 34} width={100} height={20} rx={4}
                            fill="rgba(0,0,0,0.92)" stroke={color} strokeWidth={0.8} />
                          <text x={pos.x} y={pos.y - 21} textAnchor="middle"
                            fill={color} fontSize={8} fontFamily="Righteous, cursive">
                            {meta?.emoji} Click to add stop
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                <rect width="880" height="700" fill="url(#rp-v)" style={{ pointerEvents: "none" }} />
              </svg>
            </div>

            {/* Timeline strip below map */}
            {routeData && <RouteTimeline routeData={routeData} stops={stops} />}
          </div>

          {/* ══════════════ SIDE PANEL (4 cols) ══════════════ */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto max-h-[85vh] lg:max-h-none">

            {/* ── STOPS LIST ── */}
            <StopsList stops={stops} setStops={setStops} onCalculate={() => calculate()} loading={loading} />

            {error && (
              <div className="flex items-center gap-2 text-[#FF007F] font-body text-sm px-2">
                <AlertTriangle size={13} /><span>{error}</span>
              </div>
            )}

            {routeData ? (
              <>
                {/* ── ROUTE SUMMARY ── */}
                <div className="glass-panel p-4" style={{ borderColor: "rgba(0,229,255,0.2)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-gray-500 text-xs uppercase tracking-wider">Route Summary</p>
                    <button onClick={() => setDetailsOpen(!detailsOpen)} className="text-gray-600 hover:text-white p-1">
                      {detailsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="font-heading text-lg text-[#00E5FF]">{routeData.total_distance}</p>
                      <p className="font-body text-gray-600 text-[10px]">total units</p>
                    </div>
                    <div className="text-center">
                      <p className="font-heading text-lg text-[#FFE600]">{estTime}<span className="text-xs">m</span></p>
                      <p className="font-body text-gray-600 text-[10px]">est. time</p>
                    </div>
                    <div className="text-center">
                      <p className="font-heading text-lg" style={{ color: dangerColor }}>{avgDanger}/10</p>
                      <p className="font-body text-gray-600 text-[10px]">danger</p>
                    </div>
                  </div>

                  {/* Danger bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mt-3">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${avgDanger * 10}%`,
                        background: `linear-gradient(90deg, ${dangerColor}60, ${dangerColor})`,
                        boxShadow: `0 0 8px ${dangerColor}` }} />
                  </div>
                </div>

                {/* ── SEGMENT DETAILS ── */}
                {detailsOpen && (
                  <div className="glass-panel p-4">
                    <p className="font-body text-gray-500 text-[10px] uppercase tracking-wider mb-3">Segment Breakdown</p>
                    <div className="space-y-2">
                      {routeData.segments.map((seg, i) => {
                        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
                        const fromMeta = LOCATION_META[seg.from];
                        const toMeta = LOCATION_META[seg.to];
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
                            style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-heading flex-shrink-0"
                              style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading text-white text-xs truncate">
                                {fromMeta?.emoji} {seg.from} → {toMeta?.emoji} {seg.to}
                              </p>
                              <p className="font-body text-gray-600 text-[10px]">
                                {seg.distance} units · {seg.path.length - 1} hops · ~{Math.round(seg.distance * 8.5)}min
                              </p>
                            </div>
                            <div className="w-2 h-full rounded-full" style={{ background: color, minHeight: 24 }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── ROUTE ADVISORY ── */}
                <div className="glass-panel p-4" style={{ borderColor: "rgba(255,230,0,0.15)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={12} className="text-[#FFE600]" />
                    <p className="font-heading text-xs text-[#FFE600]">Honest John's Advisory</p>
                  </div>
                  <div className="space-y-1">
                    {dangerRegions.map(rId => {
                      const rp = REGION_PATHS.find(r => r.id === rId);
                      return rp ? (
                        <p key={rId} className="font-body text-gray-400 text-[11px] italic flex items-start gap-1.5">
                          <AlertTriangle size={9} className="flex-shrink-0 mt-0.5" style={{ color: rp.stroke }} />
                          <span><span style={{ color: rp.stroke }}>{rp.name}:</span> {ROUTE_ADVISORIES[rId]}</span>
                        </p>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* A* badge */}
                <div className="glass-panel p-3 text-center" style={{ borderColor: "rgba(255,0,127,0.1)" }}>
                  <p className="font-heading text-[10px] text-[#FF007F] flex items-center justify-center gap-1"><Zap size={9} />A* Pathfinding · Manhattan Heuristic · {routeData.total_segments} segments optimized</p>
                </div>
              </>
            ) : (
              <>
                {/* ── SUGGESTED ROUTES ── */}
                <div>
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles size={11} />Suggested Journeys
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_ROUTES.map((r, i) => (
                      <button key={i} onClick={() => handleSuggested(r)} data-testid={`suggested-route-${i}`}
                        className="w-full text-left glass-panel p-3 transition-all hover:scale-[1.01] hover:border-[#00E5FF]/30 group">
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-white text-xs group-hover:text-[#00E5FF] transition-colors">{r.title}</p>
                            <p className="font-body text-gray-600 text-[10px]">{r.desc}</p>
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              {r.stops.map((s, j) => (
                                <span key={j} className="flex items-center gap-0.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-body"
                                    style={{ background: `${LOCATION_META[s]?.color}10`, color: LOCATION_META[s]?.color }}>
                                    {LOCATION_META[s]?.emoji} {s.split(" ")[0]}
                                  </span>
                                  {j < r.stops.length - 1 && <ChevronRight size={8} className="text-gray-700" />}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── RECENT ── */}
                {recentRoutes.length > 0 && (
                  <div>
                    <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History size={10} />Recent Journeys
                    </p>
                    <div className="space-y-1.5">
                      {recentRoutes.map((r, i) => (
                        <button key={i} onClick={() => handleSuggested(r)}
                          className="w-full text-left glass-panel p-2.5 transition-all hover:border-[#FF007F]/20 flex items-center gap-2">
                          <Clock size={10} className="text-gray-700 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-white text-[10px] truncate">
                              {r.stops.map(s => LOCATION_META[s]?.emoji).join(" → ")} {r.stops.length} stops
                            </p>
                            <p className="font-body text-gray-700 text-[9px]">{r.distance} units</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                <div className="glass-panel p-6 text-center flex-1 flex flex-col items-center justify-center min-h-[100px]">
                  <Navigation size={24} className="text-[#00E5FF] mb-2 opacity-30" />
                  <p className="font-heading text-white text-sm mb-1">Plan Your Journey</p>
                  <p className="font-body text-gray-600 text-xs max-w-xs">
                    Click locations on the map or try a suggested journey above.
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
