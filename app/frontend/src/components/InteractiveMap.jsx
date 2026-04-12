import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { X, MapPin, AlertTriangle, Star, ChevronRight, Plus, Clock, Check, Trash2, ThumbsUp, Flag, CheckCircle, Lock, ZoomIn, ZoomOut, Maximize, MessageCircle, Ruler, Share2, Eye, Flame, Moon, Link2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import REGIONS_DATA from "../data/regionsData";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════════════════════════════════
   REGION HEADER IMAGES — Unsplash (free, instant, high-quality)
   ═══════════════════════════════════════════════════════════════════════════ */
const REGION_IMAGES = {
  "vice-city": "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
  "grassrivers": "https://images.unsplash.com/photo-1504567961542-e24d9439a724?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
  "ambrosia": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
  "port-gellhorn": "https://images.unsplash.com/photo-1519309621146-2a47d1f7103a?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
  "mt-kalaga": "https://images.unsplash.com/photo-1448375240586-882707db888b?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
  "leonida-keys": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAP GEOMETRY
   ═══════════════════════════════════════════════════════════════════════════ */
const REGION_PATHS = [
  { id: "port-gellhorn", name: "Port Gellhorn", path: "M 30,30 L 185,30 L 190,270 L 110,285 L 30,265 Z", base: "#0d1a28", hover: "#1a3a5a", stroke: "#FF8C00", labelX: 100, labelY: 155 },
  { id: "mt-kalaga", name: "Mt. Kalaga NP", path: "M 185,30 L 615,30 L 635,235 L 425,258 L 260,238 L 190,270 L 185,30 Z", base: "#0d2a14", hover: "#1a5028", stroke: "#39FF14", labelX: 390, labelY: 130 },
  { id: "ambrosia", name: "Ambrosia", path: "M 260,238 L 425,258 L 455,365 L 365,412 L 235,388 L 190,270 L 260,238 Z", base: "#261900", hover: "#4a3200", stroke: "#FFE600", labelX: 335, labelY: 325 },
  { id: "grassrivers", name: "Grassrivers", path: "M 235,388 L 365,412 L 455,365 L 515,450 L 485,540 L 325,560 L 175,530 L 190,410 L 235,388 Z", base: "#0a2010", hover: "#1a4020", stroke: "#00E5FF", labelX: 345, labelY: 468 },
  { id: "vice-city", name: "Vice City", path: "M 515,450 L 605,358 L 715,368 L 768,450 L 738,548 L 612,590 L 485,550 L 515,450 Z", base: "#1a0a2a", hover: "#3a1a5a", stroke: "#FF007F", labelX: 628, labelY: 478 },
  { id: "leonida-keys", name: "Leonida Keys", path: "M 612,590 L 738,548 L 795,570 L 805,640 L 732,665 L 643,650 L 617,622 Z", base: "#001828", hover: "#003050", stroke: "#00BFFF", labelX: 712, labelY: 625 },
];

const CATEGORIES = ["landmark", "hideout", "business", "easter_egg", "scenic", "criminal", "other"];
const CAT_COLORS = { landmark: "#FFE600", hideout: "#FF007F", business: "#00E5FF", easter_egg: "#39FF14", scenic: "#00BFFF", criminal: "#FF2A2A", other: "#aaa" };
const CAT_ICONS = { landmark: "📍", hideout: "🏚️", business: "💼", easter_egg: "🥚", scenic: "📸", criminal: "💀", other: "📌" };
const CAT_LABELS = { landmark: "Landmarks", hideout: "Hideouts", business: "Business", easter_egg: "Easter Eggs", scenic: "Scenic", criminal: "Criminal", other: "Other" };
const LS_X = 130, LS_Y = 95, LS_W = 545, LS_H = 430;

/* ═══════════════════════════════════════════════════════════════════════════
   FIELD EVIDENCE PHOTOS — Honest John's field agents (Unsplash themed)
   ═══════════════════════════════════════════════════════════════════════════ */
const FIELD_EVIDENCE = {
  "vice-city": [
    { url: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=400&q=80", label: "Ocean Drive surveillance", time: "02:47 AM" },
    { url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=400&q=80", label: "Downtown nightlife recon", time: "11:32 PM" },
    { url: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400&q=80", label: "Beach approach vector", time: "06:15 AM" },
  ],
  "grassrivers": [
    { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", label: "Swamp access point", time: "04:20 AM" },
    { url: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?w=400&q=80", label: "Thrillbilly territory", time: "09:51 PM" },
  ],
  "ambrosia": [
    { url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&q=80", label: "Sugar Mill exterior", time: "01:33 PM" },
    { url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400&q=80", label: "Agricultural corridor", time: "10:08 AM" },
  ],
  "port-gellhorn": [
    { url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=400&q=80", label: "Dock smuggler activity", time: "03:12 AM" },
    { url: "https://images.unsplash.com/photo-1559827291-bce5697dcb68?w=400&q=80", label: "Gulf refinery perimeter", time: "07:45 PM" },
  ],
  "mt-kalaga": [
    { url: "https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=80", label: "Summit trail entry", time: "05:30 AM" },
    { url: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80", label: "Deep forest canopy", time: "02:16 PM" },
  ],
  "leonida-keys": [
    { url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=80", label: "Honda Bridge approach", time: "08:27 AM" },
    { url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", label: "Key island anchorage", time: "04:55 PM" },
  ],
};

const RULER_QUOTES = [
  "That's a quick jog if the gators aren't hungry.",
  "Honest John recommends a helicopter. Or running shoes.",
  "You could walk that in... well, don't walk it.",
  "Short enough to sprint, long enough to regret it.",
  "Pack a lunch. And body armor.",
  "The scenic route! Also the only route.",
];

const POIS = [
  { id: "ocean-drive", name: "Ocean Drive", x: 695, y: 445, icon: "🏖️" },
  { id: "macarthur-causeway", name: "MacArthur Causeway", x: 648, y: 432, icon: "🌉" },
  { id: "honda-bridge", name: "Honda Bridge", x: 748, y: 592, icon: "🌉" },
  { id: "thrillbilly", name: "Thrillbilly Mud Club", x: 278, y: 505, icon: "🏎️" },
  { id: "sugar-mill", name: "Sugar Mill", x: 380, y: 350, icon: "🏭" },
  { id: "kalaga-summit", name: "Kalaga Summit", x: 430, y: 100, icon: "⛰️" },
  { id: "gellhorn-port", name: "Gellhorn Port", x: 90, y: 200, icon: "⚓" },
];



/* ═══════════════════════════════════════════════════════════════════════════
   ZOOM / PAN CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.3;
const BASE_VIEWBOX = { x: 0, y: 0, w: 880, h: 660 };

function detectRegion(x, y) {
  if (x > 515 && y > 358 && y < 500) return "vice-city";
  if (x > 612 && y > 500) return "leonida-keys";
  if (y > 388) return "grassrivers";
  if (x < 190) return "port-gellhorn";
  if (y > 238) return "ambrosia";
  return "mt-kalaga";
}

/* ═══════════════════════════════════════════════════════════════════════════
   AMBIENT PARTICLES (ocean sparkle)
   ═══════════════════════════════════════════════════════════════════════════ */
function generateParticles(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: Math.random() * 880,
    cy: Math.random() * 660,
    r: 0.5 + Math.random() * 1.5,
    dur: 2 + Math.random() * 4,
    delay: Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.3,
  }));
}

const PARTICLES = generateParticles(35);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function InteractiveMap() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hoveredPoi, setHoveredPoi] = useState(null);
  const regions = REGIONS_DATA;
  const [viewMode, setViewMode] = useState("leonida");
  const [addPinMode, setAddPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [pinForm, setPinForm] = useState({ name: "", description: "", category: "landmark", submitter_name: "" });
  const [communityPins, setCommunityPins] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { user, getHeaders, openAuth } = useAuth();

  // ── Feature 1: Map Mode ──
  const [mapMode, setMapMode] = useState("normal"); // normal | heatmap | nightvision

  // ── Feature 2: Category Filters ──
  const [activeCategories, setActiveCategories] = useState(new Set(CATEGORIES));
  const toggleCategory = (cat) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // ── Feature 3: Distance Ruler ──
  const [rulerMode, setRulerMode] = useState(false);
  const [rulerPoints, setRulerPoints] = useState([]); // [{x,y}, {x,y}]
  const [rulerQuote, setRulerQuote] = useState("");

  // ── Feature 4: Shareable Links ──
  const [linkCopied, setLinkCopied] = useState(false);

  // ── Zoom / Pan State ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef(null);
  const lastTouchCenter = useRef(null);

  // ── Danger meter animation ──
  const [dangerAnimated, setDangerAnimated] = useState(false);
  useEffect(() => {
    if (selected) {
      setDangerAnimated(false);
      const t = setTimeout(() => setDangerAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [selected]);

  useEffect(() => {
    axios.get(`${API}/community/pois`, { headers: getHeaders() })
      .then(r => setCommunityPins(r.data))
      .catch(() => {});
    // Feature 4: Read URL params for shareable links
    const params = new URLSearchParams(window.location.search);
    const regionParam = params.get("region");
    if (regionParam && REGION_PATHS.find(r => r.id === regionParam)) {
      setSelected(regionParam);
      // Zoom to region
      const region = REGION_PATHS.find(r => r.id === regionParam);
      if (region) {
        setTimeout(() => {
          setZoom(2.2);
          const cx = BASE_VIEWBOX.w / 2;
          const cy = BASE_VIEWBOX.h / 2;
          setPan({ x: (cx - region.labelX) * 0.8, y: (cy - region.labelY) * 0.8 });
        }, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRegionData = (id) => regions.find(r => r.id === id);

  // Feature 4: Share link
  const shareRegionLink = (regionId) => {
    const url = `${window.location.origin}/map?region=${regionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // ── Compute viewBox from zoom + pan ──
  const getViewBox = useCallback(() => {
    const w = BASE_VIEWBOX.w / zoom;
    const h = BASE_VIEWBOX.h / zoom;
    const maxX = BASE_VIEWBOX.w - w;
    const maxY = BASE_VIEWBOX.h - h;
    const x = Math.max(0, Math.min(maxX, (BASE_VIEWBOX.w - w) / 2 - pan.x));
    const y = Math.max(0, Math.min(maxY, (BASE_VIEWBOX.h - h) / 2 - pan.y));
    return `${x} ${y} ${w} ${h}`;
  }, [zoom, pan]);

  // ── SVG coordinate conversion (accounts for zoom/pan) ──
  const svgPoint = useCallback((clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM().inverse();
    const svgPt = pt.matrixTransform(ctm);
    return { x: Math.round(svgPt.x), y: Math.round(svgPt.y) };
  }, []);

  // ── Zoom controls ──
  const handleZoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const handleZoomOut = () => { setZoom(z => { const nz = Math.max(MIN_ZOOM, z - ZOOM_STEP); if (nz <= 1) setPan({ x: 0, y: 0 }); return nz; }); };
  const handleResetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── Scroll wheel zoom ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => {
      const nz = e.deltaY < 0 ? Math.min(MAX_ZOOM, z + ZOOM_STEP * 0.5) : Math.max(MIN_ZOOM, z - ZOOM_STEP * 0.5);
      if (nz <= 1) setPan({ x: 0, y: 0 });
      return nz;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", handleWheel); };
  }, [handleWheel]);

  // ── Mouse pan ──
  const handleMouseDown = useCallback((e) => {
    if (addPinMode || zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  }, [addPinMode, zoom, pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.current.x) / zoom;
    const dy = (e.clientY - panStart.current.y) / zoom;
    setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
  }, [isPanning, zoom]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // ── Touch pinch-zoom + pan ──
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsPanning(true);
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panOrigin.current = { ...pan };
    }
  }, [zoom, pan]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastTouchDist.current) {
        const scale = dist / lastTouchDist.current;
        setZoom(z => {
          const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * scale));
          if (nz <= 1) setPan({ x: 0, y: 0 });
          return nz;
        });
      }
      lastTouchDist.current = dist;
      // Pan with two fingers
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      if (lastTouchCenter.current && zoom > 1) {
        const panDx = (center.x - lastTouchCenter.current.x) / zoom;
        const panDy = (center.y - lastTouchCenter.current.y) / zoom;
        setPan(p => ({ x: p.x + panDx, y: p.y + panDy }));
      }
      lastTouchCenter.current = center;
    } else if (e.touches.length === 1 && isPanning) {
      const dx = (e.touches[0].clientX - panStart.current.x) / zoom;
      const dy = (e.touches[0].clientY - panStart.current.y) / zoom;
      setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
    }
  }, [isPanning, zoom]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    lastTouchCenter.current = null;
    setIsPanning(false);
  }, []);

  // ── Double-click zoom to region ──
  const handleDoubleClickRegion = useCallback((regionId) => {
    const region = REGION_PATHS.find(r => r.id === regionId);
    if (!region) return;
    if (zoom > 1.5) {
      handleResetZoom();
    } else {
      setZoom(2.5);
      const cx = BASE_VIEWBOX.w / 2;
      const cy = BASE_VIEWBOX.h / 2;
      setPan({ x: (cx - region.labelX) * 0.8, y: (cy - region.labelY) * 0.8 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // ── Pin placement / Ruler clicks (with zoom-aware coordinates) ──
  const handleSvgClick = useCallback((e) => {
    if (isPanning) return;
    // Feature 3: Ruler mode
    if (rulerMode && svgRef.current) {
      const { x, y } = svgPoint(e.clientX, e.clientY);
      setRulerPoints(prev => {
        if (prev.length >= 2) return [{ x, y }]; // Reset with new first point
        const next = [...prev, { x, y }];
        if (next.length === 2) {
          setRulerQuote(RULER_QUOTES[Math.floor(Math.random() * RULER_QUOTES.length)]);
        }
        return next;
      });
      return;
    }
    if (!addPinMode || !svgRef.current) return;
    const { x, y } = svgPoint(e.clientX, e.clientY);
    setPendingPin({ x, y });
  }, [addPinMode, isPanning, svgPoint, rulerMode]);

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
      {/* ══════════════ MAP AREA ══════════════ */}
      <div className="flex-1 relative p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="font-accent text-[#FF007F] text-base">Interactive</p>
            <h1 className="font-heading text-2xl sm:text-4xl text-white">Map of Leonida</h1>
            <p className="font-body text-gray-500 text-xs mt-0.5">Click any region · Scroll to zoom · Drag to pan</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* View mode toggle */}
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
            {/* Feature 1: Map Mode Switcher */}
            <div className="flex items-center gap-1 glass-panel p-1 rounded-lg">
              <button onClick={() => setMapMode("normal")} title="Normal"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${mapMode === "normal" ? "bg-[#00E5FF]/20 text-[#00E5FF]" : "text-gray-600"}`}>
                <Eye size={12} />
              </button>
              <button onClick={() => setMapMode("heatmap")} title="Danger Heatmap"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${mapMode === "heatmap" ? "bg-[#FF007F]/20 text-[#FF007F]" : "text-gray-600"}`}>
                <Flame size={12} />
              </button>
              <button onClick={() => setMapMode("nightvision")} title="Night Vision"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${mapMode === "nightvision" ? "bg-[#39FF14]/20 text-[#39FF14]" : "text-gray-600"}`}>
                <Moon size={12} />
              </button>
            </div>
            {/* Feature 3: Ruler Tool */}
            <button onClick={() => { setRulerMode(!rulerMode); setRulerPoints([]); setAddPinMode(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-heading transition-all ${rulerMode ? "bg-[#FFE600]/20 border border-[#FFE600] text-[#FFE600]" : "glass-panel text-gray-400"}`}>
              <Ruler size={12} />{rulerMode ? "Measuring..." : "Ruler"}
            </button>
            {/* Add Pin */}
            {user ? (
              <button onClick={() => { setAddPinMode(!addPinMode); setPendingPin(null); setRulerMode(false); }} data-testid="add-pin-btn"
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

        {/* Feature 2: POI Category Filter Bar */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="font-body text-gray-600 text-[10px] uppercase tracking-wider mr-1">Filter:</span>
          {CATEGORIES.map(cat => {
            const active = activeCategories.has(cat);
            const color = CAT_COLORS[cat];
            const count = communityPins.filter(p => p.category === cat).length;
            return (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-heading transition-all"
                style={{ background: active ? `${color}15` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.06)"}`,
                  color: active ? color : "#555", opacity: active ? 1 : 0.5 }}>
                {CAT_ICONS[cat]} {CAT_LABELS[cat]}
                {count > 0 && <span className="ml-0.5 text-[8px] opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Ruler mode hint */}
        {rulerMode && (
          <div className="mb-2 px-3 py-1.5 rounded-lg text-xs font-body text-[#FFE600] flex items-center gap-2"
            style={{ background: "rgba(255,230,0,0.08)", border: "1px solid rgba(255,230,0,0.2)" }}>
            <Ruler size={11} />Click two points on the map to measure distance
            {rulerPoints.length === 1 && <span className="ml-auto text-[10px] text-gray-500">1st point set — click 2nd</span>}
          </div>
        )}

        {/* ── MAP SVG WITH ZOOM/PAN ── */}
        <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden"
          style={{ paddingBottom: "75%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 60px rgba(255,0,127,0.08), inset 0 0 80px rgba(0,0,0,0.5)" }}>
          <svg ref={svgRef} viewBox={getViewBox()}
            className={`absolute inset-0 w-full h-full ${rulerMode ? "cursor-crosshair" : addPinMode ? "cursor-crosshair" : zoom > 1 ? "cursor-grab" : ""} ${isPanning ? "cursor-grabbing" : ""}`}
            style={{
              background: mapMode === "nightvision"
                ? "radial-gradient(ellipse at 60% 70%, #001a00 0%, #000d00 40%, #000200 100%)"
                : "radial-gradient(ellipse at 60% 70%, #001a33 0%, #000d1f 40%, #000308 100%)",
              touchAction: "none",
              filter: mapMode === "nightvision" ? "saturate(0.3) brightness(0.8)" : "none",
            }}
            onClick={handleSvgClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="leonida-map-svg">

            <defs>
              <radialGradient id="og" cx="60%" cy="70%" r="60%"><stop offset="0%" stopColor="#001f3f" stopOpacity="0.4" /><stop offset="100%" stopColor="#000a15" stopOpacity="0" /></radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="glow-strong"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              {/* Night vision green filter */}
              <filter id="nightvision"><feColorMatrix type="matrix" values="0.2 0.7 0.1 0 0  0.1 0.9 0.1 0 0  0.1 0.3 0.1 0 0  0 0 0 1 0" /></filter>
              {/* Ocean wave pattern */}
              <pattern id="ocean-waves" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
                <path d="M0 15 Q15 5, 30 15 Q45 25, 60 15" fill="none" stroke={mapMode === "nightvision" ? "rgba(57,255,20,0.06)" : "rgba(0,229,255,0.06)"} strokeWidth="0.8">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="8s" repeatCount="indefinite" />
                </path>
                <path d="M0 25 Q15 15, 30 25 Q45 35, 60 25" fill="none" stroke={mapMode === "nightvision" ? "rgba(57,255,20,0.04)" : "rgba(0,100,200,0.04)"} strokeWidth="0.5">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="60 0" dur="12s" repeatCount="indefinite" />
                </path>
              </pattern>
              {/* Terrain patterns */}
              <pattern id="terrain-swamp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="rgba(0,229,255,0.08)" /><circle cx="15" cy="12" r="0.8" fill="rgba(0,180,200,0.06)" />
                <circle cx="10" cy="18" r="0.6" fill="rgba(0,229,255,0.05)" />
              </pattern>
              <pattern id="terrain-urban" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect x="2" y="2" width="5" height="5" fill="none" stroke="rgba(255,0,127,0.06)" strokeWidth="0.3" />
                <rect x="9" y="9" width="5" height="5" fill="none" stroke="rgba(255,0,127,0.04)" strokeWidth="0.3" />
              </pattern>
              <pattern id="terrain-forest" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M12 4 L8 12 L16 12 Z" fill="none" stroke="rgba(57,255,20,0.06)" strokeWidth="0.4" />
                <path d="M4 14 L2 20 L6 20 Z" fill="none" stroke="rgba(57,255,20,0.04)" strokeWidth="0.3" />
              </pattern>
              <pattern id="terrain-industrial" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,140,0,0.05)" strokeWidth="0.3" />
                <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(255,140,0,0.04)" strokeWidth="0.3" />
              </pattern>
              <pattern id="terrain-agriculture" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <line x1="0" y1="4" x2="16" y2="4" stroke="rgba(255,230,0,0.05)" strokeWidth="0.3" />
                <line x1="0" y1="8" x2="16" y2="8" stroke="rgba(255,230,0,0.04)" strokeWidth="0.3" />
                <line x1="0" y1="12" x2="16" y2="12" stroke="rgba(255,230,0,0.03)" strokeWidth="0.3" />
              </pattern>
              {/* Vignette */}
              <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
                <stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
              </radialGradient>
            </defs>

            {/* Ocean background */}
            <rect width="880" height="660" fill="url(#og)" />
            <rect width="880" height="660" fill="url(#ocean-waves)" />

            {/* Ambient particles */}
            {PARTICLES.map(p => (
              <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill="#00E5FF" opacity={0}>
                <animate attributeName="opacity" values={`0;${p.opacity};0`} dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Feature 1: Heatmap overlay rects */}
            {mapMode === "heatmap" && REGION_PATHS.map(r => {
              const rd = regions.find(rr => rr.id === r.id);
              const danger = rd?.danger || 5;
              const heatColor = danger >= 8 ? "rgba(255,0,50,0.25)" : danger >= 6 ? "rgba(255,140,0,0.2)" : danger >= 4 ? "rgba(255,230,0,0.12)" : "rgba(57,255,20,0.1)";
              return <path key={`heat-${r.id}`} d={r.path} fill={heatColor} style={{ pointerEvents: "none" }}>
                <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
              </path>;
            })}

            {/* Night vision green overlay */}
            {mapMode === "nightvision" && (
              <rect width="880" height="660" fill="rgba(57,255,20,0.03)" style={{ pointerEvents: "none" }} />
            )}

            {/* ── REGION FILLS ── */}
            {REGION_PATHS.map((region) => {
              const isH = hovered === region.id, isS = selected === region.id;
              const dimmed = viewMode === "scale" ? 0.4 : 1;
              const terrainId = region.id === "grassrivers" ? "terrain-swamp"
                : region.id === "vice-city" ? "terrain-urban"
                : region.id === "mt-kalaga" ? "terrain-forest"
                : region.id === "port-gellhorn" ? "terrain-industrial"
                : region.id === "ambrosia" ? "terrain-agriculture" : null;
              return (
                <g key={region.id} style={{ opacity: dimmed, transition: "opacity 0.4s" }}>
                  {/* Base fill */}
                  <path d={region.path} fill={isH || isS ? region.hover : region.base}
                    stroke={region.stroke} strokeWidth={isS ? 3 : isH ? 2.5 : 1.2} strokeOpacity={isS ? 1 : isH ? 0.8 : 0.35}
                    style={{ cursor: addPinMode ? "crosshair" : "pointer", transition: "all 0.3s ease",
                      filter: (isS || isH) ? `drop-shadow(0 0 10px ${region.stroke})` : "none" }}
                    onMouseEnter={() => setHovered(region.id)} onMouseLeave={() => setHovered(null)}
                    onClick={(e) => { if (addPinMode || isPanning) return; e.stopPropagation(); setSelected(selected === region.id ? null : region.id); }}
                    onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClickRegion(region.id); }}
                    data-testid={`map-region-${region.id}`} />
                  {/* Terrain texture overlay */}
                  {terrainId && (
                    <path d={region.path} fill={`url(#${terrainId})`} style={{ pointerEvents: "none" }} />
                  )}
                  {/* Breathing glow border */}
                  {(isS || isH) && (
                    <path d={region.path} fill="none" stroke={region.stroke} strokeWidth={1}
                      strokeOpacity={0.3} style={{ pointerEvents: "none" }}>
                      <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                    </path>
                  )}
                  {/* Heatmap danger label */}
                  {mapMode === "heatmap" && (() => {
                    const rd = regions.find(rr => rr.id === region.id);
                    const d = rd?.danger || 5;
                    const dc = d >= 7 ? "#FF007F" : d >= 5 ? "#FFE600" : "#39FF14";
                    return (
                      <text x={region.labelX} y={region.labelY + 16} textAnchor="middle"
                        fill={dc} fontSize={10} fontFamily="Righteous" style={{ pointerEvents: "none" }}>
                        ⚠ {d}/10
                      </text>
                    );
                  })()}
                  {/* Region label */}
                  <text x={region.labelX} y={region.labelY} textAnchor="middle"
                    fill={mapMode === "nightvision" ? "#39FF14" : (isH || isS ? region.stroke : "rgba(255,255,255,0.45)")} fontSize={isH || isS ? 13 : 11}
                    fontFamily="Righteous, cursive" fontWeight={isS ? "bold" : "normal"}
                    style={{ pointerEvents: "none", transition: "all 0.3s",
                      filter: (isS || isH) ? `drop-shadow(0 0 8px ${mapMode === "nightvision" ? "#39FF14" : region.stroke})` : "none" }}>
                    {region.name}
                  </text>
                </g>
              );
            })}

            {/* ── POI MARKERS ── */}
            {viewMode === "leonida" && POIS.map(poi => (
              <g key={poi.id} data-testid={`poi-${poi.id}`}
                onMouseEnter={() => setHoveredPoi(poi.id)} onMouseLeave={() => setHoveredPoi(null)}
                style={{ cursor: "pointer" }}>
                {/* Outer pulse ring */}
                <circle cx={poi.x} cy={poi.y} r={12} fill="none" stroke="#FFE600" strokeWidth={0.8} opacity={0.3}>
                  <animate attributeName="r" values="10;16;10" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Main dot */}
                <circle cx={poi.x} cy={poi.y} r={6} fill="#FFE600" opacity={0.9}
                  style={{ filter: "drop-shadow(0 0 6px #FFE600)" }} />
                <circle cx={poi.x} cy={poi.y} r={3} fill="#000" opacity={0.4} />
                {/* Hover tooltip */}
                {hoveredPoi === poi.id && (
                  <g>
                    <rect x={poi.x - 55} y={poi.y - 28} width={110} height={20} rx={4}
                      fill="rgba(0,0,0,0.9)" stroke="#FFE600" strokeWidth={0.8} />
                    <text x={poi.x} y={poi.y - 15} textAnchor="middle"
                      fill="#FFE600" fontSize={8} fontFamily="Righteous, cursive">
                      {poi.icon} {poi.name}
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* ── COMMUNITY PINS (filtered by active categories) ── */}
            {communityPins.filter(p => activeCategories.has(p.category)).map(pin => {
              const color = CAT_COLORS[pin.category] || "#aaa";
              const icon = CAT_ICONS[pin.category] || "📌";
              return (
                <g key={pin.id} data-testid={`community-pin-${pin.id}`}>
                  <polygon points={`${pin.x},${pin.y-12} ${pin.x+8},${pin.y+3} ${pin.x-8},${pin.y+3}`}
                    fill={color} opacity={0.9} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
                  </polygon>
                  {pin.verified && <circle cx={pin.x} cy={pin.y-3} r={3.5} fill="#39FF14" opacity={0.9}
                    style={{ filter: "drop-shadow(0 0 3px #39FF14)" }} />}
                  <text x={pin.x} y={pin.y - 16} textAnchor="middle" fontSize={8}>{icon}</text>
                </g>
              );
            })}

            {/* ── PENDING PIN ── */}
            {pendingPin && (
              <g>
                <circle cx={pendingPin.x} cy={pendingPin.y} r={10} fill="#39FF14" opacity={0.9}
                  style={{ filter: "drop-shadow(0 0 10px #39FF14)" }} />
                <circle cx={pendingPin.x} cy={pendingPin.y} r={18} fill="none" stroke="#39FF14"
                  strokeWidth={1.5} opacity={0.5} strokeDasharray="4 2">
                  <animateTransform attributeName="transform" type="rotate"
                    from={`0 ${pendingPin.x} ${pendingPin.y}`} to={`360 ${pendingPin.x} ${pendingPin.y}`}
                    dur="4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* ── GTA V SCALE OVERLAY ── */}
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

            {/* ── COMPASS ROSE ── */}
            <g transform="translate(840, 48)">
              <circle cx={0} cy={0} r={20} fill="rgba(5,5,5,0.8)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <line x1={0} y1={-14} x2={0} y2={-7} stroke="#FF007F" strokeWidth={2} />
              <line x1={0} y1={7} x2={0} y2={14} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
              <line x1={-14} y1={0} x2={-7} y2={0} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
              <line x1={7} y1={0} x2={14} y2={0} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
              <text x={0} y={-4} textAnchor="middle" fill="#FF007F" fontSize={9} fontFamily="Righteous" fontWeight="bold">N</text>
              <text x={0} y={15} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={6} fontFamily="Righteous">S</text>
              <text x={13} y={4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={6} fontFamily="Righteous">E</text>
              <text x={-13} y={4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={6} fontFamily="Righteous">W</text>
            </g>

            {/* Feature 3: Ruler line */}
            {rulerPoints.length >= 1 && (
              <g style={{ pointerEvents: "none" }}>
                <circle cx={rulerPoints[0].x} cy={rulerPoints[0].y} r={6} fill="#FFE600" opacity={0.9}
                  style={{ filter: "drop-shadow(0 0 6px #FFE600)" }} />
                <circle cx={rulerPoints[0].x} cy={rulerPoints[0].y} r={12} fill="none" stroke="#FFE600" strokeWidth={1} strokeDasharray="3 3" opacity={0.4}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${rulerPoints[0].x} ${rulerPoints[0].y}`} to={`360 ${rulerPoints[0].x} ${rulerPoints[0].y}`} dur="4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
            {rulerPoints.length === 2 && (() => {
              const [p1, p2] = rulerPoints;
              const dist = Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 50 * 10) / 10;
              const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="#FFE600" strokeWidth={2} strokeDasharray="8 4" opacity={0.8}
                    style={{ filter: "drop-shadow(0 0 4px #FFE600)" }} />
                  <circle cx={p2.x} cy={p2.y} r={6} fill="#FFE600" opacity={0.9}
                    style={{ filter: "drop-shadow(0 0 6px #FFE600)" }} />
                  <rect x={mx - 45} y={my - 24} width={90} height={18} rx={4}
                    fill="rgba(0,0,0,0.92)" stroke="#FFE600" strokeWidth={0.8} />
                  <text x={mx} y={my - 12} textAnchor="middle" fill="#FFE600" fontSize={10} fontFamily="Righteous">
                    {dist} units
                  </text>
                  <rect x={mx - 80} y={my + 2} width={160} height={16} rx={3}
                    fill="rgba(0,0,0,0.85)" />
                  <text x={mx} y={my + 13} textAnchor="middle" fill="#aaa" fontSize={7} fontFamily="Inter, sans-serif" fontStyle="italic">
                    {rulerQuote}
                  </text>
                </g>
              );
            })()}

            {/* Vignette overlay */}
            <rect width="880" height="660" fill="url(#vignette)" style={{ pointerEvents: "none" }} />

            {/* Night vision scanline effect */}
            {mapMode === "nightvision" && (
              <g style={{ pointerEvents: "none" }}>
                {Array.from({ length: 33 }, (_, i) => (
                  <line key={i} x1={0} y1={i * 20} x2={880} y2={i * 20}
                    stroke="rgba(57,255,20,0.04)" strokeWidth={1} />
                ))}
              </g>
            )}

            {/* Watermark */}
            <text x={440} y={648} textAnchor="middle" fill="rgba(255,255,255,0.05)" fontSize={9} fontFamily="Righteous">HONEST JOHN'S TRAVEL AGENCY · LEONIDA MAP · CONFIDENTIAL</text>
          </svg>

          {/* Feature 4: Link copied toast */}
          {linkCopied && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-heading z-20 animate-in fade-in slide-in-from-top-2"
              style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.4)", color: "#39FF14", backdropFilter: "blur(8px)" }}>
              <Link2 size={10} className="inline mr-1.5" />Link copied to clipboard!
            </div>
          )}

          {/* Map mode badge */}
          {mapMode !== "normal" && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-heading z-10 flex items-center gap-1"
              style={{ background: "rgba(5,5,5,0.85)", border: `1px solid ${mapMode === "heatmap" ? "rgba(255,0,127,0.4)" : "rgba(57,255,20,0.4)"}`,
                color: mapMode === "heatmap" ? "#FF007F" : "#39FF14" }}>
              {mapMode === "heatmap" ? <><Flame size={10} />DANGER HEATMAP</> : <><Moon size={10} />NIGHT VISION</>}
            </div>
          )}

          {/* ── ZOOM CONTROLS (overlaid on map) ── */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
            <button onClick={handleZoomIn} data-testid="zoom-in-btn"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(5,5,5,0.85)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <ZoomIn size={14} className="text-white" />
            </button>
            <button onClick={handleZoomOut} data-testid="zoom-out-btn"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(5,5,5,0.85)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <ZoomOut size={14} className="text-white" />
            </button>
            {zoom > 1 && (
              <button onClick={handleResetZoom} data-testid="zoom-reset-btn"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(5,5,5,0.85)", border: "1px solid rgba(255,0,127,0.4)", backdropFilter: "blur(8px)" }}>
                <Maximize size={14} className="text-[#FF007F]" />
              </button>
            )}
          </div>

          {/* Zoom level indicator */}
          {zoom > 1 && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-heading text-[#00E5FF] z-10"
              style={{ background: "rgba(5,5,5,0.85)", border: "1px solid rgba(0,229,255,0.3)" }}>
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* ── REGION QUICK NAV ── */}
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

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="lg:w-[420px] p-3 sm:p-4 lg:p-6 lg:border-l border-t lg:border-t-0 border-white/10 overflow-y-auto max-h-[65vh] lg:max-h-none">
        {pendingPin ? (
          <PinForm form={pinForm} setForm={setPinForm} onSubmit={submitPin} onCancel={cancelPin}
            submitting={submitting} user={user} />
        ) : selected ? (
          <RegionPanel data={getRegionData(selected)} path={REGION_PATHS.find(r => r.id === selected)}
            onClose={() => setSelected(null)} dangerAnimated={dangerAnimated}
            onShare={() => shareRegionLink(selected)} linkCopied={linkCopied} />
        ) : (
          <CommunityPinList pins={communityPins} addPinMode={addPinMode}
            onDelete={deletePin} onUpvote={upvotePin} onFlag={flagPin}
            user={user} onOpenAuth={openAuth} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PIN FORM
   ═══════════════════════════════════════════════════════════════════════════ */
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
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.replace("_", " ")}</option>)}
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

/* ═══════════════════════════════════════════════════════════════════════════
   REGION PANEL — UPGRADED
   ═══════════════════════════════════════════════════════════════════════════ */
function RegionPanel({ data, path, onClose, dangerAnimated, onShare, linkCopied }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  if (!data || !path) return null;
  const dangerColor = data.danger >= 7 ? "#FF007F" : data.danger >= 5 ? "#FFE600" : "#39FF14";
  const dangerWidth = dangerAnimated ? `${data.danger * 10}%` : "0%";
  const img = REGION_IMAGES[data.id];
  const evidence = FIELD_EVIDENCE[data.id] || [];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header image */}
      {img && (
        <div className="relative rounded-xl overflow-hidden mb-4 h-36"
          style={{ boxShadow: `0 0 30px ${data.glow || path.stroke + "40"}` }}>
          <img src={img} alt={data.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #050505, transparent 50%, ${path.stroke}15)` }} />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="font-body text-xs uppercase tracking-widest mb-0.5" style={{ color: path.stroke }}>{data.real_world}</p>
            <h2 className="font-heading text-2xl text-white" style={{ textShadow: `0 0 15px ${path.stroke}` }}>{data.name}</h2>
          </div>
          <button onClick={onClose} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/60 text-gray-400 hover:text-white transition-colors" data-testid="region-panel-close"><X size={14} /></button>
        </div>
      )}

      {!img && (
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: path.stroke }}>{data.real_world}</p>
            <h2 className="font-heading text-2xl text-white">{data.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1" data-testid="region-panel-close"><X size={18} /></button>
        </div>
      )}

      <p className="font-accent text-sm mb-4" style={{ color: path.stroke }}>{data.tagline}</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Danger meter */}
        <div className="glass-panel p-3">
          <p className="font-body text-gray-500 text-xs mb-1.5">Danger Level</p>
          <p className="font-heading text-2xl mb-2" style={{ color: dangerColor }}>{data.danger}/10</p>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: dangerWidth, background: `linear-gradient(90deg, ${dangerColor}80, ${dangerColor})`,
                boxShadow: `0 0 8px ${dangerColor}` }} />
          </div>
        </div>
        {/* Population */}
        <div className="glass-panel p-3">
          <p className="font-body text-gray-500 text-xs mb-1.5">Population</p>
          <p className="font-heading text-lg text-white">{data.population}</p>
          <div className="flex gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-3 rounded-sm" style={{
                background: i < Math.ceil(parseInt(data.population.replace(/[^0-9]/g, "")) / 500000) ? path.stroke : "rgba(255,255,255,0.08)"
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Honest John says */}
      <div className="glass-panel p-4 mb-4" style={{ borderColor: `${path.stroke}30` }}>
        <div className="flex items-center gap-2 mb-2"><Star size={14} style={{ color: path.stroke }} /><p className="font-heading text-sm" style={{ color: path.stroke }}>Honest John Says:</p></div>
        <p className="font-body text-gray-300 text-sm leading-relaxed italic">"{data.satirical}"</p>
      </div>

      {/* Top Attractions */}
      <div className="mb-4">
        <p className="font-heading text-xs uppercase tracking-wider text-gray-500 mb-2">Top Attractions</p>
        <div className="space-y-2">
          {data.highlights?.map((h, i) => (
            <div key={h} className="flex items-center gap-2 text-sm font-body text-gray-300 animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
              <ChevronRight size={12} style={{ color: path.stroke }} />{h}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {data.tags?.map(t => (
          <span key={t} className="text-xs px-2 py-1 rounded-full font-body"
            style={{ background: `${path.stroke}15`, color: path.stroke, border: `1px solid ${path.stroke}30` }}>{t}</span>
        ))}
      </div>

      {/* Ask Honest John button */}
      <button
        onClick={() => {
          const chatBtn = document.querySelector('[data-testid="chat-open-btn"]');
          if (chatBtn) chatBtn.click();
          setTimeout(() => {
            const input = document.querySelector('[data-testid="chat-input"]');
            if (input) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              nativeInputValueSetter.call(input, `Tell me about ${data.name}`);
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 400);
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-heading transition-all hover:scale-[1.02]"
        style={{ background: `${path.stroke}15`, border: `1px solid ${path.stroke}40`, color: path.stroke }}
        data-testid="ask-john-btn">
        <MessageCircle size={14} />Ask Honest John About {data.name}
      </button>

      {/* Feature 4: Share Link */}
      <button onClick={onShare}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-heading transition-all hover:scale-[1.02] mt-2"
        style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF" }}>
        {linkCopied ? <><Check size={12} />Link Copied!</> : <><Share2 size={12} />Share This Region</>}
      </button>

      {/* Feature 5: Field Evidence */}
      {evidence.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setEvidenceOpen(!evidenceOpen)}
            className="w-full flex items-center justify-between text-xs font-heading text-gray-500 uppercase tracking-wider mb-2 hover:text-white transition-colors">
            <span className="flex items-center gap-1.5"><Eye size={10} />Field Evidence ({evidence.length})</span>
            <ChevronRight size={10} className={`transition-transform ${evidenceOpen ? "rotate-90" : ""}`} />
          </button>
          {evidenceOpen && (
            <div className="space-y-2">
              {evidence.map((ev, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxImg(ev)} style={{ border: `1px solid ${path.stroke}20` }}>
                  <img src={ev.url} alt={ev.label} className="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="font-heading text-[9px] text-white">{ev.label}</p>
                    <p className="font-body text-[8px] text-gray-500">FIELD AGENT · {ev.time}</p>
                  </div>
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-heading"
                    style={{ background: "rgba(255,0,0,0.3)", color: "#FF007F" }}>● REC</div>
                </div>
              ))}
              <p className="font-body text-[9px] text-gray-700 italic text-center">Photos by Honest John's field agents. Authenticity unverified.</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-2xl w-full rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg.url} alt={lightboxImg.label} className="w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
              <p className="font-heading text-sm text-white">{lightboxImg.label}</p>
              <p className="font-body text-xs text-gray-400">Captured by field agent · {lightboxImg.time}</p>
            </div>
            <button onClick={() => setLightboxImg(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 font-body">
        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5 text-[#FF007F]" />
        <span>Not liable for consequences of visiting {data.name}.</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMMUNITY PIN LIST
   ═══════════════════════════════════════════════════════════════════════════ */
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
            const icon = CAT_ICONS[pin.category] || "📌";
            const hasVoted = user && (pin.voters || []).includes(user.id);
            const isOwner = user && pin.submitter_user_id === user.id;
            return (
              <div key={pin.id} className="glass-panel p-3 flex items-start gap-3" data-testid={`pin-item-${pin.id}`}>
                <div className="text-sm mt-0.5 flex-shrink-0">{icon}</div>
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
