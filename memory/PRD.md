# Honest John's Travel Agency - Leonida Interactive Guide
## Project PRD

**Last Updated:** Feb 2026
**Status:** MVP Complete

---

## Problem Statement
Build an interactive travel guide for Leonida (GTA 6's fictional Florida-based state) with satirical "Honest John's Travel Agency" branding. Features: interactive map, A* route planner, before/after comparison slider, and AI chatbot with GTA 6 knowledge base.

## Architecture
- **Frontend:** React + Tailwind CSS + Custom SVG Map
- **Backend:** FastAPI + MongoDB
- **AI:** Claude Haiku (claude-haiku-4-5-20251001) via Emergent LLM Key
- **Map:** Custom SVG with 6 clickable regions (no external tile server)

## User Personas
- GTA 6 fans curious about Leonida's regions
- Gamers wanting to plan routes and explore the map
- Users seeking GTA 6 information (release, specs, story)

## Core Requirements (Static)
1. Dark/neon GTA-style theme (Vice City vibes + retro travel poster)
2. Interactive SVG map with 6 clickable regions
3. A* pathfinding route planner between 10 locations
4. Before/After comparison slider (Real Miami vs Leonida)
5. AI chatbot "Honest John" with local GTA 6 knowledge base
6. Satirical "Honest John's Travel Agency" tone throughout

## What's Been Implemented (Feb 2026)

### Backend (/app/backend/server.py)
- GET /api/regions - All 6 Leonida regions with satirical descriptions
- GET /api/locations - All 10 map locations with coordinates
- POST /api/route - A* pathfinding between any two locations
- POST /api/chat - Claude Haiku AI with GTA 6 knowledge base context injection
- GET /api/chat/history/{session_id} - Persistent chat history
- GET /api/knowledge/search - Search 25 GTA 6 knowledge chunks

### Frontend Components
- Navbar - Sticky nav with neon styling, active route highlighting
- LandingPage - Hero with neon Miami bg, bento feature grid, hardware affiliate section
- InteractiveMap - Custom SVG map with 6 clickable regions + region detail panel
- ComparisonSlider - Custom CSS draggable before/after slider
- RoutePlanner - Dropdown location select + A* result visualization on map
- ChatWidget - Floating Honest John AI chatbot with avatar + history

### Knowledge Base (25 chunks)
- GTA 6 general info & release date (Nov 19, 2026)
- All 6 Leonida regions
- Key POIs (Honda Bridge, MacArthur Causeway, Thrillbilly Mud Club, etc.)
- GTA 6 protagonists (Jason Rios, Lucia Caminos)
- Trailers, gameplay, vehicles, hardware requirements
- PC specs & Newegg hardware affiliate links

## Map Regions
| Region | Real World Analog | Danger | Color |
|--------|------------------|--------|-------|
| Vice City | Miami, FL | 9/10 | #FF007F |
| Grassrivers | Florida Everglades | 7/10 | #00E5FF |
| Ambrosia | Clewiston/Sugar Land | 4/10 | #FFE600 |
| Port Gellhorn | Panama City/Gulf Coast | 6/10 | #FF8C00 |
| Mt. Kalaga NP | Ocala/N. Florida | 5/10 | #39FF14 |
| Leonida Keys | Florida Keys | 3/10 | #00BFFF |

## A* Route Locations (10 nodes)
Vice City, Ocean Drive, MacArthur Causeway, Leonida Keys, Honda Bridge,
Grassrivers, Thrillbilly Mud Club, Ambrosia, Port Gellhorn, Mt. Kalaga NP

## Design System
- Colors: #050505 (bg), #FF007F (neon pink), #00E5FF (cyan), #FFE600 (yellow)
- Fonts: Righteous (headings), Outfit (body), Caveat (accent/handwritten)
- Theme: Dark neon + retro travel poster aesthetic

## Prioritized Backlog

### P0 (Critical - Done)
- [x] Interactive SVG map
- [x] A* route planner
- [x] Comparison slider
- [x] Honest John AI chatbot

### P1 (Next Phase - Done Feb 2026)
- [x] GTA 6 Launch Countdown Timer (Nov 19, 2026) — live on hero
- [x] OpenSeadragon Deep Zoom Forensic Analysis Lab — 5 intelligence locations
- [x] SEO Q&A FAQ Page — 20 questions, schema.org FAQ JSON-LD markup
- [x] Comparison Slider upgraded — 5 image pairs (beaches, wetlands, islands, harbor, skyline)
- [x] Mobile layout polish — responsive improvements across all pages
- [x] Navbar updated — 6 links (Home, Map, Routes, Compare, Forensic, FAQ)

### P2 (Future)
- [ ] Community map submission portal
- [ ] GTA 6 launch countdown timer
- [ ] Share route functionality
- [ ] Animated map transitions between regions
- [ ] Dark/light mode toggle (keep dark as default)

## Next Tasks
1. Add more POI detail modals with images
2. Add SEO structured Q&A content page
3. Add GTA 6 launch countdown on landing page
4. Improve mobile responsiveness
5. Add loading skeletons for better UX

## Update - Feb 2026 Phase 2 Complete
- Twitter/X share countdown button added  
- GTA V Scale Time-Travel toggle on map (LOS SANTOS overlay + 2.1x annotation)
- Community POI pins (submit/view/delete on interactive map)
- Daily GTA 6 news scraper: feedparser + httpx + APScheduler (24hr) + Claude Haiku KB extraction
- 6 real GTA6 articles scraped on first run (Kotaku, GameSpot, PCGamer)
- All 14/14 backend & frontend tests pass


## Update - Phase 4 Complete (Feb 2026)
- DB Cleanup: 8 TEST_ pins + 2 test users removed from MongoDB  
- Admin password auto-update: startup now calls verify_password and updates hash if .env changed
- server.py split: database.py (15L) + auth.py (130L) + emails.py (100L) + routes.py (380L) + server.py (80L)
- Resend email notifications: notify_upvote() + notify_verified() fire-and-forget on upvote events
- Register form: optional email field for pin upvote/verified notifications
- 13/13 tests pass


## Phase 5 Complete (Feb 2026)
- Email preferences (unsubscribe toggles) in user profile settings
- User profile page at /profile with stats, settings, pins list
- Countdown Widget at /widget (standalone iframe-ready, no navbar)  
- VCNN (Vice City News Network) news redesign with ticker + featured + source filters
- All 11/11 tests pass


## Phase 6 Complete (Feb 2026) — Launch Day Celebration Mode
- CelebrationOverlay: full-screen confetti blast + LEONIDA IS NOW LIVE! + 14s auto-dismiss
- LaunchBanner: persistent green 'GTA VI IS LIVE!' bar below navbar  
- Landing page hero transforms to launched state
- Navbar shows NOW LIVE! pulsing badge when launched
- Admin launch toggle in Moderation Panel
- ?celebrate=1 URL param for preview/testing
- GET/PUT /api/system/launch-status backend endpoints
- LaunchContext.jsx manages global state (URL param > localStorage > backend)
- 7/7 backend + 100% frontend tests pass

