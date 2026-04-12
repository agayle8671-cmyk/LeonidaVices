import { useState, useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";
import { ZoomIn, ZoomOut, Maximize2, Info, Lock, MapPin } from "lucide-react";

const LOCATIONS = [
  {
    id: "vice-city",
    name: "Vice City Financial District",
    codename: "OPERATION NEON",
    classification: "DECLASSIFIED",
    classColor: "#39FF14",
    coords: "VC-26.1245°N / 80.1373°W",
    region: "Vice City",
    notes: [
      "High-density urban zone, multiple active criminal organizations",
      "12 luxury hotels along Ocean Drive identified as POIs",
      "MacArthur Causeway: primary vehicle entry vector",
      "Police response time: 45 sec avg (within 2 stars)",
    ],
    imageUrl: "https://images.pexels.com/photos/8684754/pexels-photo-8684754.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920",
    thumb: "https://images.pexels.com/photos/8684754/pexels-photo-8684754.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=300",
  },
  {
    id: "grassrivers",
    name: "Grassrivers Recon Zone",
    codename: "SWAMP SECTOR 7",
    classification: "RESTRICTED",
    classColor: "#FFE600",
    coords: "GR-25.7617°N / 80.7800°W",
    region: "Grassrivers",
    notes: [
      "Active alligator population: estimated 200,000+ individuals",
      "Thrillbilly Mud Club: known criminal rendezvous point",
      "Visibility severely limited by dense sawgrass",
      "Multiple unmarked structures detected via aerial survey",
    ],
    imageUrl: "https://images.unsplash.com/photo-1770672850764-877c18e56ab1?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    thumb: "https://images.unsplash.com/photo-1770672850764-877c18e56ab1?crop=entropy&cs=srgb&fm=jpg&w=300&q=60",
  },
  {
    id: "keys",
    name: "Leonida Keys Reef System",
    codename: "OPERATION CORAL",
    classification: "DECLASSIFIED",
    classColor: "#39FF14",
    coords: "LK-24.5557°N / 81.7826°W",
    region: "Leonida Keys",
    notes: [
      "Honda Bridge spans 42 miles of open ocean",
      "Coral reef extends 12 nautical miles offshore",
      "Multiple unregistered boat launches identified",
      "Strategic maritime smuggling corridor — verified",
    ],
    imageUrl: "https://images.unsplash.com/photo-1745383792762-ccaeb8e972d0?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    thumb: "https://images.unsplash.com/photo-1745383792762-ccaeb8e972d0?crop=entropy&cs=srgb&fm=jpg&w=300&q=60",
  },
  {
    id: "port-gellhorn",
    name: "Port Gellhorn Shipping Lanes",
    codename: "DOCKWATCH ALPHA",
    classification: "TOP SECRET",
    classColor: "#FF007F",
    coords: "PG-30.1588°N / 85.6602°W",
    region: "Port Gellhorn",
    notes: [
      "Container terminal handles 2.1M TEUs annually (undeclared)",
      "Cargo manifest discrepancies: 34% on outbound vessels",
      "Night operations account for 70% of undocumented activity",
      "3 persons of interest identified at Pier 7 (ongoing)",
    ],
    imageUrl: "https://images.unsplash.com/photo-1765206257996-9b4a5d886a2c?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    thumb: "https://images.unsplash.com/photo-1765206257996-9b4a5d886a2c?crop=entropy&cs=srgb&fm=jpg&w=300&q=60",
  },
  {
    id: "keys-bridge",
    name: "MacArthur Causeway",
    codename: "BRIDGE SECTOR",
    classification: "DECLASSIFIED",
    classColor: "#39FF14",
    coords: "MC-25.7750°N / 80.1740°W",
    region: "Vice City",
    notes: [
      "Primary Vice City — island bridge: 1.2 miles span",
      "Average vehicle speed: 89mph during chase scenarios",
      "23 pursuit incidents logged in last quarter alone",
      "Structural integrity: Fine. The insurance is current.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1740989972799-71b5bdd466d0?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    thumb: "https://images.unsplash.com/photo-1740989972799-71b5bdd466d0?crop=entropy&cs=srgb&fm=jpg&w=300&q=60",
  },
];

export default function ForensicViewer() {
  const [selected, setSelected] = useState(LOCATIONS[0]);
  const viewerRef = useRef(null);
  const osdRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) return;
    if (osdRef.current) { osdRef.current.destroy(); osdRef.current = null; }

    osdRef.current = OpenSeadragon({
      element: viewerRef.current,
      tileSources: { type: "image", url: selected.imageUrl, buildPyramid: false },
      showNavigationControl: false,
      showNavigator: false,
      gestureSettingsMouse: { scrollToZoom: true, clickToZoom: false, dblClickToZoom: true },
      gestureSettingsTouch: { pinchToZoom: true, clickToZoom: false },
      minZoomImageRatio: 0.3,
      maxZoomPixelRatio: 8,
      defaultZoomLevel: 0,
      visibilityRatio: 0.3,
      animationTime: 0.4,
      blendTime: 0.1,
      crossOriginPolicy: "Anonymous",
      ajaxWithCredentials: false,
    });

    return () => {
      if (osdRef.current) { osdRef.current.destroy(); osdRef.current = null; }
    };
  }, [selected]);

  const zoom = (factor) => osdRef.current?.viewport.zoomBy(factor);
  const reset = () => osdRef.current?.viewport.goHome(true);

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="font-accent text-[#00E5FF] text-lg mb-0.5">Intelligence Division</p>
            <h1 className="font-heading text-3xl sm:text-4xl text-white">
              Forensic <span className="neon-cyan">Analysis Lab</span>
            </h1>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Lock size={12} className="text-[#FF007F]" />
            <span className="font-body text-gray-400 text-xs">
              Honest John's Geospatial Intelligence Unit · Handle With Extreme Profit
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <p className="font-body text-gray-500 text-xs uppercase tracking-wider mb-3">Select Location</p>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelected(loc)}
                data-testid={`forensic-loc-${loc.id}`}
                className={`flex-shrink-0 lg:w-full text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                  selected.id === loc.id
                    ? "border-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.3)]"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="relative">
                  <img src={loc.thumb} alt={loc.name} className="w-32 lg:w-full h-16 lg:h-20 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-1 left-2 font-heading text-white text-xs leading-tight">{loc.name}</p>
                </div>
                <div className="px-2 py-1.5 bg-[#0a0a14]">
                  <span className="text-xs font-body" style={{ color: loc.classColor }}>{loc.classification}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main viewer */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Viewer container */}
          <div className="relative rounded-xl overflow-hidden"
            style={{ height: "420px", border: "1px solid rgba(0,229,255,0.3)", boxShadow: "0 0 30px rgba(0,229,255,0.1)" }}>
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.5) 2px, rgba(0,229,255,0.5) 4px)" }} />

            {/* OSD viewer */}
            <div ref={viewerRef} className="absolute inset-0" data-testid="forensic-osd-viewer" />

            {/* Classification overlay */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="font-heading text-xs px-2 py-1 rounded"
                style={{ background: "rgba(0,0,0,0.8)", color: selected.classColor, border: `1px solid ${selected.classColor}60` }}>
                {selected.classification}
              </span>
              <span className="font-body text-gray-500 text-xs bg-black/60 px-2 py-1 rounded">
                {selected.codename}
              </span>
            </div>

            {/* Coords */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 text-xs font-body text-gray-500 bg-black/60 px-2 py-1 rounded">
              <MapPin size={10} />
              {selected.coords}
            </div>

            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
              {[
                { icon: ZoomIn, fn: () => zoom(1.5), tip: "Zoom In", testid: "forensic-zoom-in" },
                { icon: ZoomOut, fn: () => zoom(0.67), tip: "Zoom Out", testid: "forensic-zoom-out" },
                { icon: Maximize2, fn: reset, tip: "Reset", testid: "forensic-zoom-reset" },
              ].map(({ icon: Icon, fn, tip, testid }) => (
                <button key={tip} onClick={fn} data-testid={testid} title={tip}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,229,255,0.4)", color: "#00E5FF" }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div className="absolute bottom-3 right-3 z-20 text-xs font-body text-gray-600 bg-black/60 px-2 py-1 rounded">
              Scroll/Pinch to zoom · Drag to pan
            </div>
          </div>

          {/* Intel panel */}
          <div className="glass-panel p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <p className="font-body text-gray-500 text-xs uppercase tracking-wider">{selected.region}</p>
                <h2 className="font-heading text-xl text-white mt-0.5">{selected.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Info size={12} className="text-[#00E5FF]" />
                <span className="font-body text-[#00E5FF] text-xs">Intelligence Report</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selected.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-body text-gray-300 bg-white/3 rounded-lg p-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-[#00E5FF]" />
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
