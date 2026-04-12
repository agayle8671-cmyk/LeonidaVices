import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { X, MapPin, AlertTriangle, Star, ChevronRight, Plus, Clock, Check, Trash2, ThumbsUp, Flag, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import REGIONS_DATA from "../data/regionsData";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const REGION_PATHS = [
  { id: "port-gellhorn", name: "Port Gellhorn", path: "M 30,30 L 185,30 L 190,270 L 110,285 L 30,265 Z", base: "#0d1a28", hover: "#1a3a5a", stroke: "#FF8C00", labelX: 100, labelY: 155 },
  { id: "mt-kalaga", name: "Mt. Kalaga NP", path: "M 185,30 L 615,30 L 635,235 L 425,258 L 260,238 L 190,270 L 185,30 Z", base: "#0d2a14", hover: "#1a5028", stroke: "#39FF14", labelX: 390, labelY: 130 },
  { id: "ambrosia", name: "Ambrosia", path: "M 260,238 L 425,258 L 455,365 L 365,412 L 235,388 L 190,270 L 260,238 Z", base: "#261900", hover: "#4a3200", stroke: "#FFE600", labelX: 335, labelY: 325 },
  { id: "grassrivers", name: "Grassrivers", path: "M 235,388 L 365,412 L 455,365 L 515,450 L 485,540 L 325,560 L 175,530 L 190,410 L 235,388 Z", base: "#0a2010", hover: "#1a4020", stroke: "#00E5FF", labelX: 345, labelY: 468 },
  { id: "vice-city", name: "Vice City", path: "M 515,450 L 605,358 L 715,368 L 768,450 L 738,548 L 612,590 L 485,550 L 515,450 Z", base: "#1a0a2a", hover: "#3a1a5a", stroke: "#FF007F", labelX: 628, labelY: 478 },
  { id: "leonida-keys", name: "Leonida Keys", path: "M 612,590 L 738,548 L 795,570 L 805,640 L 732,665 L 643,650 L 617,622 Z", base: "#001828", hover: "#003050", stroke: "#00BFFF", labelX: 712, labelY: 625 },
];

const POIS = [
  { id: "ocean-drive", name: "Ocean Drive", x: 695, y: 445 },
  { id: "macarthur-causeway", name: "MacArthur Causeway", x: 648, y: 432 },
  { id: "honda-bridge", name: "Honda Bridge", x: 748, y: 592 },
  { id: "thrillbilly", name: "Thrillbilly Mud Club", x: 278, y: 505 },
  { id: "sugar-mill", name: "Sugar Mill", x: 380, y: 350 },
  { id: "kalaga-summit", name: "Kalaga Summit", x: 430, y: 100 },
  { id: "gellhorn-port", name: "Gellhorn Port", x: 90, y: 200 },
];

const CATEGORIES = ["landmark", "hideout", "business", "easter_egg", "scenic", "criminal", "other"];
const CAT_COLORS = { landmark: "#FFE600", hideout: "#FF007F", business: "#00E5FF", easter_egg: "#39FF14", scenic: "#00BFFF", criminal: "#FF2A2A", other: "#aaa" };
const LS_X = 130, LS_Y = 95, LS_W = 545, LS_H = 430;

function detectRegion(x, y) {
  if (x > 515 && y > 358 && y < 500) return "vice-city";
  if (x > 612 && y > 500) return "leonida-keys";
  if (y > 388) return "grassrivers";
  if (x < 190) return "port-gellhorn";
  if (y > 238) return "ambrosia";
  return "mt-kalaga";
}

export default function InteractiveMap() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const regions = REGIONS_DATA;
  const [viewMode, setViewMode] = useState("leonida");
  const [addPinMode, setAddPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [pinForm, setPinForm] = useState({ name: "", description: "", category: "landmark", submitter_name: "" });
  const [communityPins, setCommunityPins] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const svgRef = useRef(null);
  const { user, getHeaders, openAuth } = useAuth();

  useEffect(() => {
    // Regions are loaded locally — no API call needed
    // Community pins still try the backend (graceful failure if offline)
    axios.get(`${API}/community/pois`, { headers: getHeaders() })
      .then(r => setCommunityPins(r.data))
      .catch(() => {}); // Silently fail if backend is offline
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRegionData = (id) => regions.find(r => r.id === id);

  const handleSvgClick = useCallback((e) => {
    if (!addPinMode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setPendingPin({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 880),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 660),
    });
  }, [addPinMode]);

  const submitPin = async () => {
    if (!pendingPin || !pinForm.name.trim()) return;
    setSubmitting(true);
    try {
      const displayName = user ? (user.display_name || user.username) : pinForm.submitter_name;
      const { data } = await axios.post(`${API}/community/pois`, {
        ...pinForm, x: pendingPin.x, y: pendingPin.y,
        region: detectRegion(pendingPin.x, pendingPin.y),
        submitter_name: displayName || "Anonymous",
      }, { headers: getHeaders() });
      setCommunityPins(prev => [data, ...prev]);
      setPendingPin(null);
      setPinForm({ name: "", description: "", category: "landmark", submitter_name: "" });
      setAddPinMode(false);
    } catch (err) { console.error("Pin submission failed:", err); }
    finally { setSubmitting(false); }
  };

  const deletePin = async (id) => {
    await axios.delete(`${API}/community/pois/${id}`, { headers: getHeaders() }).catch(() => {});
    setCommunityPins(prev => prev.filter(p => p.id !== id));
  };

  const upvotePin = async (pin) => {
    if (!user) { openAuth(); return; }
    try {
      const { data } = await axios.post(`${API}/community/pois/${pin.id}/upvote`, {}, { headers: getHeaders() });
      setCommunityPins(prev => prev.map(p => {
        if (p.id !== pin.id) return p;
        const voters = data.upvoted
          ? [...(p.voters || []), user.id]
          : (p.voters || []).filter(v => v !== user.id);
        return { ...p, upvote_count: data.count, voters, verified: data.count >= 3 };
      }));
    } catch (err) { console.error("Upvote failed:", err); }
  };

  const flagPin = async (pin) => {
    if (!user) { openAuth(); return; }
    if (window.confirm("Flag this pin as inappropriate?")) {
      try {
        await axios.post(`${API}/community/pois/${pin.id}/flag`, { reason: "inappropriate" }, { headers: getHeaders() });
        setCommunityPins(prev => prev.map(p => p.id === pin.id ? { ...p, flag_count: (p.flag_count || 0) + 1 } : p));
      } catch (err) { console.error("Flag failed:", err); }
    }
  };

  const cancelPin = () => { setPendingPin(null); setAddPinMode(false); };

  return (
    <div className="page-content min-h-screen bg-[#050505] flex flex-col lg:flex-row">
      {/* MAP */}
      <div className="flex-1 relative p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="font-accent text-[#FF007F] text-base">Interactive</p>
            <h1 className="font-heading text-2xl sm:text-4xl text-white">Map of Leonida</h1>
            <p className="font-body text-gray-500 text-xs mt-0.5">Click any region for Honest John's travel briefing</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Time-Travel toggle */}
            <div className="flex items-center gap-1 glass-panel p-1 rounded-lg">
              <button onClick={() => setViewMode("leonida")} data-testid="view-mode-leonida"
                className={`px-2.5 py-1.5 rounded-md text-xs font-heading transition-all ${viewMode === "leonida" ? "bg-[#FF007F] text-white" : "text-gray-400"}`}>
                Leonida 2026
              </button>
              <button onClick={() => setViewMode("scale")} data-testid="view-mode-scale"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-heading transition-all ${viewMode === "scale" ? "bg-[#00E5FF] text-black" : "text-gray-400"}`}>
                <Clock size={10} />GTA V Scale
              </button>
            </div>
            {/* Add Pin */}
            {user ? (
              <button onClick={() => { setAddPinMode(!addPinMode); setPendingPin(null); }} data-testid="add-pin-btn"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-heading transition-all ${addPinMode ? "bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14]" : "glass-panel text-gray-300"}`}>
                <Plus size={12} />{addPinMode ? "Cancel" : "Add Pin"}
              </button>
            ) : (
              <button onClick={openAuth} data-testid="add-pin-login-prompt"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-heading glass-panel text-gray-400">
                <Lock size={11} />Login to Pin
              </button>
            )}
          </div>
        </div>

        {addPinMode && !pendingPin && (
          <div className="mb-3 px-3 py-2 rounded-lg text-xs font-body text-[#39FF14] flex items-center gap-2"
            style={{ background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.3)" }}>
            <MapPin size={11} />Click anywhere on the map to place your community pin
          </div>
        )}

        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          <svg ref={svgRef} viewBox="0 0 880 660"
            className={`absolute inset-0 w-full h-full rounded-xl overflow-hidden ${addPinMode ? "cursor-crosshair" : ""}`}
            style={{ background: "radial-gradient(ellipse at 60% 70%, #001525 0%, #000a15 60%, #000308 100%)" }}
            onClick={handleSvgClick} data-testid="leonida-map-svg">
            <defs>
              <radialGradient id="og" cx="60%" cy="70%" r="60%"><stop offset="0%" stopColor="#001f3f" stopOpacity="0.4" /><stop offset="100%" stopColor="#000a15" stopOpacity="0" /></radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="880" height="660" fill="url(#og)" />

            {REGION_PATHS.map((region) => {
              const isH = hovered === region.id, isS = selected === region.id;
              const dimmed = viewMode === "scale" ? 0.4 : 1;
              return (
                <g key={region.id} style={{ opacity: dimmed, transition: "opacity 0.4s" }}>
                  <path d={region.path} fill={isH || isS ? region.hover : region.base}
                    stroke={region.stroke} strokeWidth={isS ? 2.5 : isH ? 2 : 1} strokeOpacity={isS ? 1 : isH ? 0.8 : 0.4}
                    style={{ cursor: addPinMode ? "crosshair" : "pointer", transition: "all 0.2s",
                      filter: (isS || isH) ? `drop-shadow(0 0 6px ${region.stroke})` : "none" }}
                    onMouseEnter={() => setHovered(region.id)} onMouseLeave={() => setHovered(null)}
                    onClick={(e) => { if (addPinMode) return; e.stopPropagation(); setSelected(selected === region.id ? null : region.id); }}
                    data-testid={`map-region-${region.id}`} />
                  <text x={region.labelX} y={region.labelY} textAnchor="middle"
                    fill={isH || isS ? region.stroke : "rgba(255,255,255,0.5)"} fontSize={isH || isS ? 12 : 10}
                    fontFamily="Righteous, cursive" style={{ pointerEvents: "none", transition: "all 0.2s" }}>
                    {region.name}
                  </text>
                </g>
              );
            })}

            {viewMode === "leonida" && POIS.map(poi => (
              <g key={poi.id} data-testid={`poi-${poi.id}`}>
                <circle cx={poi.x} cy={poi.y} r={5} fill="#FFE600" opacity={0.9} style={{ filter: "drop-shadow(0 0 4px #FFE600)" }} />
                <circle cx={poi.x} cy={poi.y} r={10} fill="none" stroke="#FFE600" strokeWidth={1} opacity={0.3} />
              </g>
            ))}

            {communityPins.map(pin => {
              const color = CAT_COLORS[pin.category] || "#aaa";
              return (
                <g key={pin.id} data-testid={`community-pin-${pin.id}`}>
                  <polygon points={`${pin.x},${pin.y-9} ${pin.x+7},${pin.y+4} ${pin.x-7},${pin.y+4}`}
                    fill={color} opacity={0.9} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
                  {pin.verified && <circle cx={pin.x} cy={pin.y-2} r={3} fill="#39FF14" opacity={0.9} />}
                </g>
              );
            })}

            {pendingPin && (
              <g>
                <circle cx={pendingPin.x} cy={pendingPin.y} r={9} fill="#39FF14" opacity={0.9} style={{ filter: "drop-shadow(0 0 8px #39FF14)" }} />
                <circle cx={pendingPin.x} cy={pendingPin.y} r={16} fill="none" stroke="#39FF14" strokeWidth={1.5} opacity={0.5} strokeDasharray="4 2" />
              </g>
            )}

            {viewMode === "scale" && (
              <g>
                <rect x={LS_X} y={LS_Y} width={LS_W} height={LS_H} rx={12} fill="rgba(255,165,0,0.08)"
                  stroke="#FF8C00" strokeWidth={2} strokeDasharray="12 6" opacity={0.85}
                  style={{ filter: "drop-shadow(0 0 10px rgba(255,140,0,0.5))" }} />
                <rect x={LS_X + LS_W/2 - 110} y={LS_Y + 12} width={220} height={26} rx={5} fill="rgba(0,0,0,0.75)" />
                <text x={LS_X + LS_W/2} y={LS_Y + 30} textAnchor="middle" fill="#FF8C00" fontSize={11} fontFamily="Righteous, cursive">LOS SANTOS (GTA V) — Full map</text>
                <circle cx={LS_X + LS_W * 0.65} cy={LS_Y + LS_H * 0.75} r={12} fill="rgba(255,140,0,0.2)" stroke="#FF8C00" strokeWidth={1.5} />
                <text x={LS_X + LS_W * 0.65} y={LS_Y + LS_H * 0.78} textAnchor="middle" fill="#FF8C00" fontSize={8} fontFamily="Righteous">Los Santos</text>
                <circle cx={LS_X + LS_W * 0.45} cy={LS_Y + LS_H * 0.2} r={10} fill="rgba(255,140,0,0.15)" stroke="#FF8C00" strokeWidth={1} strokeDasharray="3 2" />
                <text x={LS_X + LS_W * 0.45} y={LS_Y + LS_H * 0.22} textAnchor="middle" fill="#FF8C00" fontSize={7} fontFamily="Righteous">Blaine County</text>
                <rect x={LS_X + LS_W + 8} y={LS_Y + LS_H/2 - 30} width={145} height={60} rx={6} fill="rgba(0,0,0,0.8)" />
                <text x={LS_X + LS_W + 80} y={LS_Y + LS_H/2 - 12} textAnchor="middle" fill="#00E5FF" fontSize={11} fontFamily="Righteous">Leonida is</text>
                <text x={LS_X + LS_W + 80} y={LS_Y + LS_H/2 + 8} textAnchor="middle" fill="#FFE600" fontSize={18} fontFamily="Righteous">2.1×</text>
                <text x={LS_X + LS_W + 80} y={LS_Y + LS_H/2 + 24} textAnchor="middle" fill="#00E5FF" fontSize={11} fontFamily="Righteous">bigger</text>
              </g>
            )}

            <g transform="translate(840, 48)">
              <circle cx={0} cy={0} r={18} fill="rgba(15,12,41,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              <text x={0} y={-5} textAnchor="middle" fill="white" fontSize={8} fontFamily="Righteous">N</text>
              <text x={0} y={14} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={6} fontFamily="Righteous">S</text>
              <text x={12} y={5} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={6} fontFamily="Righteous">E</text>
              <text x={-12} y={5} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={6} fontFamily="Righteous">W</text>
            </g>
            <text x={440} y={648} textAnchor="middle" fill="rgba(255,255,255,0.07)" fontSize={9} fontFamily="Righteous">HONEST JOHN'S TRAVEL AGENCY · LEONIDA MAP · CONFIDENTIAL</text>
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {REGION_PATHS.map(r => (
            <button key={r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}
              className="flex items-center gap-1.5 text-xs font-body px-2 py-1 rounded-full transition-all"
              style={{ background: selected === r.id ? `${r.stroke}25` : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected === r.id ? r.stroke : "rgba(255,255,255,0.08)"}`, color: selected === r.id ? r.stroke : "#888" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.stroke }} />{r.name}
            </button>
          ))}
          {communityPins.length > 0 && (
            <span className="text-xs font-body px-2 py-1 rounded-full ml-auto"
              style={{ background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.3)", color: "#39FF14" }}>
              {communityPins.length} community pins
            </span>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:w-96 p-3 sm:p-4 lg:p-6 lg:border-l border-t lg:border-t-0 border-white/10 overflow-y-auto max-h-[65vh] lg:max-h-none">
        {pendingPin ? (
          <PinForm form={pinForm} setForm={setPinForm} onSubmit={submitPin} onCancel={cancelPin}
            submitting={submitting} user={user} />
        ) : selected ? (
          <RegionPanel data={getRegionData(selected)} path={REGION_PATHS.find(r => r.id === selected)}
            onClose={() => setSelected(null)} />
        ) : (
          <CommunityPinList pins={communityPins} addPinMode={addPinMode}
            onDelete={deletePin} onUpvote={upvotePin} onFlag={flagPin}
            user={user} onOpenAuth={openAuth} />
        )}
      </div>
    </div>
  );
}

function PinForm({ form, setForm, onSubmit, onCancel, submitting, user }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-body text-[#39FF14] text-xs uppercase tracking-wider">Community Pin</p>
          <h3 className="font-heading text-white text-lg">Add Location</h3>
          {user && <p className="font-body text-gray-500 text-xs">Posting as <span className="text-[#39FF14]">{user.display_name || user.username}</span></p>}
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white"><X size={16} /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="font-body text-gray-400 text-xs block mb-1">Location Name *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg px-3 py-2 font-body focus:border-[#39FF14] focus:outline-none"
            placeholder="e.g. Secret stash near Grassrivers..." data-testid="pin-name-input" />
        </div>
        <div>
          <label className="font-body text-gray-400 text-xs block mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2} className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg px-3 py-2 font-body focus:border-[#39FF14] focus:outline-none resize-none"
            placeholder="What's special about this location?" data-testid="pin-description-input" />
        </div>
        <div>
          <label className="font-body text-gray-400 text-xs block mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg px-3 py-2 font-body focus:border-[#39FF14] focus:outline-none"
            data-testid="pin-category-select">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
          </select>
        </div>
        {!user && (
          <div>
            <label className="font-body text-gray-400 text-xs block mb-1">Your Name (optional)</label>
            <input value={form.submitter_name} onChange={e => setForm(p => ({ ...p, submitter_name: e.target.value }))}
              className="w-full bg-[#0a0a14] border border-white/10 text-white text-sm rounded-lg px-3 py-2 font-body focus:border-[#39FF14] focus:outline-none"
              placeholder="Anonymous" data-testid="pin-submitter-input" />
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onSubmit} disabled={submitting || !form.name.trim()} data-testid="pin-submit-btn"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-heading transition-all disabled:opacity-40"
            style={{ background: "#39FF14", color: "#000" }}>
            {submitting ? "Submitting..." : <><Check size={14} />Submit Pin</>}
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-heading text-gray-400 glass-panel">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function RegionPanel({ data, path, onClose }) {
  if (!data || !path) return null;
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: path.stroke }}>{data.real_world}</p>
          <h2 className="font-heading text-2xl text-white">{data.name}</h2>
          <p className="font-accent text-sm mt-0.5" style={{ color: path.stroke }}>{data.tagline}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white p-1" data-testid="region-panel-close"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-panel p-3 text-center">
          <p className="font-body text-gray-500 text-xs">Danger</p>
          <p className="font-heading text-2xl" style={{ color: data.danger >= 7 ? "#FF007F" : data.danger >= 5 ? "#FFE600" : "#39FF14" }}>{data.danger}/10</p>
        </div>
        <div className="glass-panel p-3 text-center">
          <p className="font-body text-gray-500 text-xs">Population</p>
          <p className="font-heading text-lg text-white">{data.population}</p>
        </div>
      </div>
      <div className="glass-panel p-4 mb-4" style={{ borderColor: `${path.stroke}30` }}>
        <div className="flex items-center gap-2 mb-2"><Star size={14} style={{ color: path.stroke }} /><p className="font-heading text-sm" style={{ color: path.stroke }}>Honest John Says:</p></div>
        <p className="font-body text-gray-300 text-sm leading-relaxed italic">"{data.satirical}"</p>
      </div>
      <div className="mb-4">
        <p className="font-heading text-xs uppercase tracking-wider text-gray-500 mb-2">Top Attractions</p>
        <div className="space-y-2">
          {data.highlights?.map(h => (
            <div key={h} className="flex items-center gap-2 text-sm font-body text-gray-300">
              <ChevronRight size={12} style={{ color: path.stroke }} />{h}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.tags?.map(t => (
          <span key={t} className="text-xs px-2 py-1 rounded-full font-body"
            style={{ background: `${path.stroke}15`, color: path.stroke, border: `1px solid ${path.stroke}30` }}>{t}</span>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 font-body">
        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5 text-[#FF007F]" />
        <span>Not liable for consequences of visiting {data.name}.</span>
      </div>
    </div>
  );
}

function CommunityPinList({ pins, addPinMode, onDelete, onUpvote, onFlag, user, onOpenAuth }) {
  if (addPinMode) return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <MapPin size={32} className="text-[#39FF14] mb-3 opacity-60" />
      <p className="font-heading text-white text-base mb-1">Pin Placement Mode</p>
      <p className="font-body text-gray-500 text-sm">Click anywhere on the map to drop your community pin</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-body text-gray-500 text-xs uppercase tracking-wider">Community Atlas</p>
          <h3 className="font-heading text-white text-lg">{pins.length} Pins Submitted</h3>
        </div>
        {!user && (
          <button onClick={onOpenAuth} className="text-xs font-body text-[#FF007F] flex items-center gap-1 hover:underline">
            <Lock size={10} />Login to upvote
          </button>
        )}
      </div>
      {pins.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <MapPin size={30} className="text-gray-600 mb-3" />
          <p className="font-body text-gray-500 text-sm">No community pins yet.</p>
          <p className="font-body text-gray-600 text-xs mt-1">Be the first to mark a location!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {pins.map(pin => {
            const color = CAT_COLORS[pin.category] || "#aaa";
            const hasVoted = user && (pin.voters || []).includes(user.id);
            const isOwner = user && pin.submitter_user_id === user.id;
            return (
              <div key={pin.id} className="glass-panel p-3 flex items-start gap-3" data-testid={`pin-item-${pin.id}`}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <p className="font-heading text-white text-sm">{pin.name}</p>
                    {pin.verified && <span className="flex items-center gap-0.5 text-[10px] text-[#39FF14]"><CheckCircle size={9} />Verified</span>}
                  </div>
                  {pin.description && <p className="font-body text-gray-500 text-xs line-clamp-2 mb-1">{pin.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-body px-1.5 py-0.5 rounded"
                      style={{ background: `${color}18`, color }}>{pin.category}</span>
                    <span className="text-xs text-gray-600 font-body truncate">{pin.submitter_name || "Anonymous"}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => onUpvote(pin)} data-testid={`upvote-pin-${pin.id}`}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all"
                    style={{ background: hasVoted ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${hasVoted ? "#00E5FF" : "rgba(255,255,255,0.1)"}`,
                      color: hasVoted ? "#00E5FF" : "#888" }}>
                    <ThumbsUp size={10} />{pin.upvote_count || 0}
                  </button>
                  {isOwner ? (
                    <button onClick={() => onDelete(pin.id)} data-testid={`delete-pin-${pin.id}`}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all text-gray-600 hover:text-[#FF007F]">
                      <Trash2 size={10} />
                    </button>
                  ) : (
                    <button onClick={() => onFlag(pin)} data-testid={`flag-pin-${pin.id}`}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all text-gray-700 hover:text-[#FFE600]">
                      <Flag size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
