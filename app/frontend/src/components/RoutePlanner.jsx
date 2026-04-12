import { useState, useEffect } from "react";
import axios from "axios";
import { Navigation, MapPin, AlertTriangle, Loader2, ChevronRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const REGION_PATHS = [
  { id: "port-gellhorn", path: "M 30,30 L 185,30 L 190,270 L 110,285 L 30,265 Z", stroke: "#FF8C00", base: "#0d1a28" },
  { id: "mt-kalaga", path: "M 185,30 L 615,30 L 635,235 L 425,258 L 260,238 L 190,270 L 185,30 Z", stroke: "#39FF14", base: "#0d2a14" },
  { id: "ambrosia", path: "M 260,238 L 425,258 L 455,365 L 365,412 L 235,388 L 190,270 L 260,238 Z", stroke: "#FFE600", base: "#261900" },
  { id: "grassrivers", path: "M 235,388 L 365,412 L 455,365 L 515,450 L 485,540 L 325,560 L 175,530 L 190,410 L 235,388 Z", stroke: "#00E5FF", base: "#0a2010" },
  { id: "vice-city", path: "M 515,450 L 605,358 L 715,368 L 768,450 L 738,548 L 612,590 L 485,550 L 515,450 Z", stroke: "#FF007F", base: "#1a0a2a" },
  { id: "leonida-keys", path: "M 612,590 L 738,548 L 795,570 L 805,640 L 732,665 L 643,650 L 617,622 Z", stroke: "#00BFFF", base: "#001828" },
];

const LOCATIONS_LIST = [
  "Vice City", "Ocean Drive", "MacArthur Causeway",
  "Leonida Keys", "Honda Bridge",
  "Grassrivers", "Thrillbilly Mud Club",
  "Ambrosia", "Port Gellhorn", "Mt. Kalaga NP",
];

export default function RoutePlanner() {
  const [start, setStart] = useState("Vice City");
  const [end, setEnd] = useState("Mt. Kalaga NP");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState({});

  useEffect(() => {
    axios.get(`${API}/locations`).then(r => {
      const loc = {};
      r.data.forEach(l => { loc[l.name] = { x: l.x, y: l.y }; });
      setLocations(loc);
    }).catch(() => {});
  }, []);

  const calculate = async () => {
    if (start === end) { setError("Pick two different locations, darling."); return; }
    setLoading(true); setError(""); setRoute(null);
    try {
      const { data } = await axios.post(`${API}/route`, { start, end });
      setRoute(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Route not found. Even Honest John can't help you here.");
    } finally {
      setLoading(false);
    }
  };

  const buildPathD = (waypoints) => {
    if (!waypoints || waypoints.length < 2) return "";
    return waypoints.map((w, i) => `${i === 0 ? "M" : "L"} ${w.x},${w.y}`).join(" ");
  };

  const getPathNodeColor = (name) => {
    if (!route) return "#fff";
    if (name === route.path[0]) return "#39FF14";
    if (name === route.path[route.path.length - 1]) return "#FF007F";
    return "#FFE600";
  };

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <p className="font-accent text-[#00E5FF] text-xl mb-2">Get Lost... Professionally</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white mb-3">
            Leonida <span className="neon-cyan">Route Planner</span>
          </h1>
          <p className="font-body text-gray-400 text-base max-w-xl mx-auto">
            Our A* pathfinding algorithm (patent pending, possibly stolen) finds the optimal route
            between any two locations in Leonida. Results are approximate. Honest John not responsible for detours.
          </p>
        </div>

        {/* ── CONTROLS ── */}
        <div className="glass-panel p-5 mb-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
            <div>
              <label className="font-body text-gray-500 text-xs uppercase tracking-wider block mb-2">
                From
              </label>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                data-testid="route-start-select"
                className="w-full bg-[#0a0a14] border border-white/10 text-white rounded-lg px-3 py-2.5 font-body text-sm focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-colors"
              >
                {LOCATIONS_LIST.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-gray-500 text-xs uppercase tracking-wider block mb-2">
                To
              </label>
              <select
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                data-testid="route-end-select"
                className="w-full bg-[#0a0a14] border border-white/10 text-white rounded-lg px-3 py-2.5 font-body text-sm focus:border-[#FF007F] focus:outline-none focus:ring-1 focus:ring-[#FF007F] transition-colors"
              >
                {LOCATIONS_LIST.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button
              onClick={calculate}
              disabled={loading}
              data-testid="route-calculate-btn"
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {loading ? "Calculating..." : "Plan Route"}
            </button>
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-[#FF007F] font-body text-sm">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* ── MAP ── */}
          <div className="lg:col-span-3">
            <div className="relative w-full" style={{ paddingBottom: "82%" }}>
              <svg
                viewBox="0 0 840 680"
                className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
                style={{ background: "radial-gradient(ellipse at 60% 70%, #001525 0%, #000a15 60%, #000308 100%)" }}
                data-testid="route-map-svg"
              >
                <defs>
                  <filter id="glow2">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Region fills */}
                {REGION_PATHS.map((r) => (
                  <path key={r.id} d={r.path} fill={r.base} stroke={r.stroke}
                    strokeWidth={1} strokeOpacity={0.3} />
                ))}

                {/* Route path */}
                {route && route.waypoints?.length > 1 && (
                  <>
                    {/* Glow path */}
                    <path d={buildPathD(route.waypoints)} fill="none"
                      stroke="#FF007F" strokeWidth={6} strokeOpacity={0.3} strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: "url(#glow2)" }} />
                    {/* Main path */}
                    <path d={buildPathD(route.waypoints)} fill="none"
                      stroke="#FF007F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="8 4"
                      data-testid="route-path-line">
                      <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="1.5s" repeatCount="indefinite" />
                    </path>
                    {/* Waypoint dots */}
                    {route.waypoints.map((w, i) => (
                      <g key={i}>
                        <circle cx={w.x} cy={w.y} r={i === 0 || i === route.waypoints.length - 1 ? 7 : 5}
                          fill={getPathNodeColor(w.name)}
                          style={{ filter: `drop-shadow(0 0 5px ${getPathNodeColor(w.name)})` }} />
                        <text x={w.x} y={w.y - 10} textAnchor="middle"
                          fill={getPathNodeColor(w.name)} fontSize={9} fontFamily="Righteous">
                          {w.name}
                        </text>
                      </g>
                    ))}
                  </>
                )}

                {/* Default location dots */}
                {!route && Object.entries(locations).map(([name, pos]) => (
                  <g key={name}>
                    <circle cx={pos.x} cy={pos.y} r={4} fill="rgba(255,255,255,0.3)" />
                    <text x={pos.x} y={pos.y - 7} textAnchor="middle"
                      fill="rgba(255,255,255,0.3)" fontSize={7} fontFamily="Righteous">
                      {name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* ── ROUTE DETAILS ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {route ? (
              <>
                {/* Summary */}
                <div className="glass-panel p-5" style={{ borderColor: "rgba(255,0,127,0.3)" }}>
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3">Route Summary</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-[#39FF14]" />
                    <p className="font-heading text-white">{route.path[0]}</p>
                  </div>
                  <div className="ml-1.5 border-l border-dashed border-[#FF007F]/40 pl-3 my-1">
                    <p className="font-body text-gray-500 text-xs">{route.path.length - 2} waypoints</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF007F]" />
                    <p className="font-heading text-white">{route.path[route.path.length - 1]}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="font-body text-gray-500 text-xs">Total Distance</p>
                    <p className="font-heading text-[#00E5FF] text-2xl">{route.total_distance} <span className="text-sm">units</span></p>
                  </div>
                </div>

                {/* Steps */}
                <div className="glass-panel p-5 flex-1">
                  <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3">Route Steps</p>
                  <div className="space-y-3">
                    {route.steps?.map((step, i) => (
                      <div key={`step-${step.from}-${step.to}`} className="flex items-center gap-3" data-testid={`route-step-${i}`}>
                        <div className="w-6 h-6 rounded-full bg-[#FF007F]/20 border border-[#FF007F]/40 flex items-center justify-center text-xs font-heading text-[#FF007F] flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-white text-sm truncate">{step.from}</p>
                          <p className="font-body text-gray-500 text-xs flex items-center gap-1">
                            <ChevronRight size={10} /> {step.to} · {step.distance} units
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Honest John tip */}
                <div className="glass-panel p-4" style={{ borderColor: "rgba(255,230,0,0.2)" }}>
                  <p className="font-accent text-[#FFE600] text-sm mb-1">Honest John's Travel Tip:</p>
                  <p className="font-body text-gray-400 text-xs italic">
                    "This route was calculated using Manhattan Distance Heuristics — the same algorithm used
                    to avoid paying tolls. Results are optimal. Side effects may include scenic detours through
                    hostile territory. Insurance not included."
                  </p>
                </div>
              </>
            ) : (
              <div className="glass-panel p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <Navigation size={40} className="text-[#00E5FF] mb-4 opacity-40" />
                <p className="font-heading text-white text-lg mb-2">Plan Your Journey</p>
                <p className="font-body text-gray-500 text-sm">
                  Select start and end locations, then hit "Plan Route" to find the optimal path using our A* algorithm.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Algorithm info */}
        <div className="mt-8 glass-panel p-5 max-w-3xl mx-auto text-center">
          <p className="font-heading text-[#FF007F] text-sm mb-1">A* Pathfinding Algorithm</p>
          <p className="font-body text-gray-500 text-xs">
            f(n) = g(n) + h(n) · where g(n) = actual path cost · h(n) = Manhattan Distance heuristic
            · The algorithm explores minimum-cost paths first, guaranteeing the optimal route.
          </p>
        </div>
      </div>
    </div>
  );
}
