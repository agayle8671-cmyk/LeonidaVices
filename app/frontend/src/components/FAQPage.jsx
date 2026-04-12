import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Map, Route, ZoomIn, ArrowLeftRight } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Release & Availability",
    questions: [
      {
        q: "When does GTA 6 come out?",
        a: "GTA 6 (Grand Theft Auto VI) releases on November 19, 2026 for PlayStation 5 and Xbox Series X/S. The PC version is expected in 2027. The game is published by Rockstar Games and is one of the most anticipated video game releases in history.",
      },
      {
        q: "What platforms will GTA 6 be available on?",
        a: "GTA 6 launches first on PlayStation 5 and Xbox Series X/S on November 19, 2026. A PC version is expected to follow in 2027. There is currently no announced version for PlayStation 4, Xbox One, or Nintendo Switch.",
      },
      {
        q: "Will GTA 6 have online multiplayer?",
        a: "Yes. GTA Online is expected to continue as part of GTA 6, introducing new cooperative heists, competitive modes, and persistent world content set in Leonida. The massive map is designed to support new large-scale criminal operations across all regions.",
      },
    ],
  },
  {
    category: "The World of Leonida",
    questions: [
      {
        q: "Is Vice City based on Miami?",
        a: "Yes. Vice City in GTA 6 is Rockstar's fictional version of Miami, Florida. It features recognizable Miami landmarks reimagined: Ocean Drive (art deco hotels), MacArthur Causeway, Venetian Causeway, and South Beach's iconic beach strip. The neon nightlife, luxury excess, and cultural satire are direct references to Miami's identity.",
      },
      {
        q: "How big is the GTA 6 map compared to GTA 5?",
        a: "Leonida in GTA 6 is estimated to be approximately 2.1 times the size of Los Santos and Blaine County from GTA V combined, making it one of the largest open-world maps in gaming history. It spans urban Vice City, tropical wetlands (Grassrivers), agricultural plains (Ambrosia), industrial Gulf Coast (Port Gellhorn), northern wilderness (Mt. Kalaga NP), and an island chain (Leonida Keys).",
      },
      {
        q: "What regions are in Leonida?",
        a: "Leonida has six major regions: (1) Vice City – the Miami-inspired urban metropolis; (2) Grassrivers – the Everglades-inspired wetlands and swamps; (3) Ambrosia – agricultural sugar country based on Clewiston; (4) Port Gellhorn – the Gulf Coast industrial port city; (5) Mt. Kalaga National Park – northern wilderness; (6) Leonida Keys – the Florida Keys-inspired island chain.",
      },
      {
        q: "Where are the Leonida Keys and how do I get there?",
        a: "The Leonida Keys are an island chain extending south from the Leonida mainland, based on the Florida Keys. They're accessible from Vice City via the Honda Bridge (GTA 6's version of the Seven Mile Bridge). The Keys feature coral reefs, fishing communities, and a laid-back tropical atmosphere distinct from Vice City's neon excess.",
      },
      {
        q: "What is Grassrivers in GTA 6?",
        a: "Grassrivers is GTA 6's fictional version of the Florida Everglades. It's a vast wetland ecosystem featuring alligators, invasive pythons, airboat tours, and the infamous Thrillbilly Mud Club (a rural entertainment venue). Grassrivers is one of Leonida's most dangerous regions due to wildlife, criminal activity, and limited law enforcement presence.",
      },
    ],
  },
  {
    category: "Characters & Story",
    questions: [
      {
        q: "Who are the main characters in GTA 6?",
        a: "GTA 6 features two playable protagonists: Jason Rios and Lucia Caminos. Lucia is the first female lead protagonist in the main GTA series since 2001. They are a criminal couple navigating Leonida's underworld together. Lucia starts the game in prison. The dynamic between Jason and Lucia is central to the story's emotional core.",
      },
      {
        q: "What is GTA 6 about?",
        a: "GTA 6 follows Jason Rios and Lucia Caminos as they navigate the criminal underworld of Leonida. The narrative explores themes of wealth inequality, the American Dream's dark underbelly, social media culture, surveillance capitalism, and the contradictions of modern Florida life — all delivered through Rockstar's trademark darkly satirical lens.",
      },
    ],
  },
  {
    category: "PC Version & Hardware",
    questions: [
      {
        q: "What PC specs do you need for GTA 6?",
        a: "GTA 6 PC requirements (estimated): Recommended for 4K max settings — NVIDIA RTX 5090 (24GB VRAM), AMD Ryzen 9800X3D CPU, 64GB DDR5 RAM, NVMe SSD. For 1440p high settings — RTX 4080 Super minimum. For 1080p — RTX 4070 Ti Super. Storage: estimated 150–200GB. The PC version is expected in 2027.",
      },
      {
        q: "Will GTA 6 support ray tracing and DLSS?",
        a: "GTA 6 PC is expected to support hardware ray tracing, NVIDIA DLSS 4, AMD FSR 4, and Intel XeSS. The game's RAGE engine has been significantly upgraded with photorealistic water simulation, advanced NPC AI, and the most detailed open-world environment ever created for a video game.",
      },
    ],
  },
  {
    category: "Honest John's Travel Tips",
    questions: [
      {
        q: "Is Leonida safe to visit?",
        a: "Absolutely! Honest John rates Leonida's six regions from 3/10 danger (Leonida Keys — charming!) to 9/10 danger (Vice City — exhilarating!). Safety is relative and entirely the visitor's responsibility. Honest John's Travel Agency recommends comprehensive travel insurance, situational awareness, and a good running pace. Results may vary. Refunds not available.",
      },
      {
        q: "What is the best way to travel between regions in Leonida?",
        a: "Our A* Route Planner can calculate the optimal path between any two of Leonida's 10 key locations. Vice City to Leonida Keys: 1.5 units via causeway. Vice City to Grassrivers: 2.2 units via swamp highway. Grassrivers to Ambrosia: 1.5 units — shortest inland route. Always factor in police pursuit time when planning travel.",
      },
      {
        q: "What is the Honda Bridge in GTA 6?",
        a: "The Honda Bridge is GTA 6's version of the real-world Seven Mile Bridge connecting the Florida Keys. It spans 42 miles of open ocean between the Leonida mainland and the Keys. Featured prominently in GTA 6 trailers, it's one of Leonida's most iconic landmarks and the only land connection to the Leonida Keys.",
      },
    ],
  },
];

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.flatMap((cat) =>
    cat.questions.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    }))
  ),
};

export default function FAQPage() {
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(SCHEMA);
    s.id = "faq-schema";
    document.head.appendChild(s);
    return () => { const el = document.getElementById("faq-schema"); if (el) el.remove(); };
  }, []);

  return (
    <div className="page-content min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-[#FF007F] text-xl mb-2">The Honest Answers</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-white mb-4">
            GTA 6 Leonida <span className="neon-pink">Travel Guide FAQ</span>
          </h1>
          <p className="font-body text-gray-400 text-base max-w-2xl mx-auto">
            Everything you need to know about Leonida, GTA 6, and Honest John's premium travel packages.
            Answers verified by our proprietary "making it up with confidence" system.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { to: "/map", icon: Map, label: "Explore Map", color: "#FF007F" },
            { to: "/route", icon: Route, label: "Route Planner", color: "#00E5FF" },
            { to: "/forensic", icon: ZoomIn, label: "Forensic Analysis", color: "#39FF14" },
            { to: "/compare", icon: ArrowLeftRight, label: "Real vs. Leonida", color: "#FFE600" },
          ].map((l) => (
            <Link key={l.to} to={l.to}
              className="glass-panel p-3 flex flex-col items-center gap-2 text-center hover:scale-105 transition-transform"
              style={{ borderColor: `${l.color}30` }}>
              <l.icon size={18} style={{ color: l.color }} />
              <span className="font-body text-xs text-gray-300">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* FAQ Sections */}
        {FAQ_DATA.map((cat, ci) => (
          <section key={cat.category} className="mb-10" data-testid={`faq-category-${ci}`}>
            <h2 className="font-heading text-2xl text-[#00E5FF] mb-4 pb-2 border-b border-white/10"
              style={{ textShadow: "0 0 8px rgba(0,229,255,0.4)" }}>
              {cat.category}
            </h2>
            <div className="space-y-4">
              {cat.questions.map((item, qi) => (
                <div key={item.q.slice(0, 50)} className="glass-panel p-5 hover:border-[#FF007F]/30 transition-colors"
                  data-testid={`faq-item-${ci}-${qi}`}>
                  <h3 className="font-heading text-lg text-white mb-2 flex items-start gap-2">
                    <ChevronRight size={18} className="text-[#FF007F] flex-shrink-0 mt-0.5" />
                    {item.q}
                  </h3>
                  <p className="font-body text-gray-300 text-sm leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Footer disclaimer */}
        <div className="glass-panel p-5 text-center mt-8"
          style={{ borderColor: "rgba(255,230,0,0.2)" }}>
          <p className="font-accent text-[#FFE600] text-lg mb-1">Honest John's Guarantee:</p>
          <p className="font-body text-gray-400 text-sm italic">
            "These answers are 94% accurate, 5% speculative, and 1% deliberate misinformation for entertainment purposes.
            Honest John's Travel Agency is not affiliated with Rockstar Games.
            For official GTA 6 information, visit rockstargames.com."
          </p>
        </div>
      </div>
    </div>
  );
}
