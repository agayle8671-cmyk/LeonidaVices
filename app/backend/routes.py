"""All business API routes — map, chat, news, community POIs, admin, leaderboard."""
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import os
import heapq
import uuid
import json
import asyncio
import re
import logging
import feedparser
import httpx as _httpx
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
# NOTE: emergentintegrations removed — chatbot is now fully client-side
# from emergentintegrations.llm.chat import LlmChat, UserMessage

from database import db
from auth import get_current_user, get_current_user_optional, require_admin, get_badge, gen_avatar_color
from emails import notify_upvote, notify_verified

logger = logging.getLogger(__name__)
main_router = APIRouter(prefix="/api")

# ─────────────────────────── NEWS CONFIG ─────────────────────────────────────
RSS_FEEDS = [
    {"name": "Kotaku",     "url": "https://kotaku.com/rss"},
    {"name": "GameSpot",   "url": "https://www.gamespot.com/feeds/news/"},
    {"name": "PCGamer",    "url": "https://www.pcgamer.com/rss/"},
    {"name": "GamesRadar", "url": "https://www.gamesradar.com/rss/"},
    {"name": "IGN",        "url": "https://feeds.feedburner.com/ign/all-articles"},
    {"name": "Eurogamer",  "url": "https://www.eurogamer.net/feed"},
]
GTA6_KEYWORDS = [
    "gta 6", "gta vi", "grand theft auto 6", "grand theft auto vi",
    "gta6", "gta-6", "leonida", "rockstar gta", "vice city gta",
    "lucia gta", "jason gta",
]

# ─────────────────────────── STATIC MAP DATA ─────────────────────────────────
LOCATIONS = {
    "Vice City":           {"x": 640, "y": 480},
    "Ocean Drive":         {"x": 695, "y": 445},
    "MacArthur Causeway":  {"x": 648, "y": 432},
    "Leonida Keys":        {"x": 715, "y": 630},
    "Honda Bridge":        {"x": 748, "y": 592},
    "Grassrivers":         {"x": 345, "y": 470},
    "Thrillbilly Mud Club":{"x": 278, "y": 505},
    "Ambrosia":            {"x": 338, "y": 328},
    "Port Gellhorn":       {"x": 110, "y": 170},
    "Mt. Kalaga NP":       {"x": 392, "y": 128},
}

GRAPH = {
    "Mt. Kalaga NP":       [("Port Gellhorn", 3.0), ("Ambrosia", 2.5)],
    "Port Gellhorn":       [("Mt. Kalaga NP", 3.0), ("Ambrosia", 2.8), ("Grassrivers", 4.2)],
    "Ambrosia":            [("Mt. Kalaga NP", 2.5), ("Port Gellhorn", 2.8), ("Grassrivers", 1.5), ("Vice City", 3.5)],
    "Grassrivers":         [("Ambrosia", 1.5), ("Vice City", 2.2), ("Thrillbilly Mud Club", 0.8), ("Port Gellhorn", 4.2)],
    "Thrillbilly Mud Club":[("Grassrivers", 0.8)],
    "Vice City":           [("Grassrivers", 2.2), ("Ambrosia", 3.5), ("MacArthur Causeway", 0.5), ("Ocean Drive", 0.4), ("Leonida Keys", 1.5)],
    "Ocean Drive":         [("Vice City", 0.4), ("MacArthur Causeway", 0.3)],
    "MacArthur Causeway":  [("Vice City", 0.5), ("Ocean Drive", 0.3)],
    "Leonida Keys":        [("Vice City", 1.5), ("Honda Bridge", 0.6)],
    "Honda Bridge":        [("Leonida Keys", 0.6)],
}

REGIONS_DATA = [
    {"id": "vice-city",     "name": "Vice City",     "tagline": "Where Dreams Come to Die in Style",
     "description": "Vice City is Leonida's crown jewel – neon-soaked metropolis built on excess and overpriced cocktails.",
     "satirical": "Congratulations on choosing Vice City! Your valuables are basically community property here, which we think is beautiful. The water is surprisingly warm. Don't ask why. Five stars, darling.",
     "color": "#FF007F", "glow": "rgba(255,0,127,0.5)", "real_world": "Miami, FL", "danger": 9, "population": "~2.1M",
     "highlights": ["Ocean Drive", "MacArthur Causeway", "Venetian Causeway", "Nightclub Row"],
     "tags": ["urban", "nightlife", "beaches", "crime", "luxury"]},
    {"id": "grassrivers",   "name": "Grassrivers",   "tagline": "Nature's Premium Obstacle Course",
     "description": "Vast wetland ecosystem based on the Florida Everglades. Alligators, pythons, airboats, Thrillbilly Mud Club.",
     "satirical": "Grassrivers: where the wildlife is SMART and you are on the menu! Our swamp tours have a 94% return rate. The other 6% are still 'exploring'. Book NOW!",
     "color": "#00E5FF", "glow": "rgba(0,229,255,0.4)", "real_world": "Florida Everglades", "danger": 7, "population": "~48K",
     "highlights": ["Thrillbilly Mud Club", "Everswamp Airboat Tours", "Gator Crossing Hwy"],
     "tags": ["swamps", "wildlife", "rural", "dangerous", "nature"]},
    {"id": "ambrosia",      "name": "Ambrosia",      "tagline": "Industrial Charm with a Caramel Finish",
     "description": "Agricultural and industrial heartland. Sugar refineries, cane fields, processing plants.",
     "satirical": "Welcome to Ambrosia – a MEAT-PACKING PARADISE! The air quality is 'character-building'. Honest John rates this 3 stars. The missing 2 are investigating.",
     "color": "#FFE600", "glow": "rgba(255,230,0,0.4)", "real_world": "Clewiston / Sugar Land, FL", "danger": 4, "population": "~95K",
     "highlights": ["Sugar Mill Refinery", "Ambrosia Agricultural Fields", "Industrial Canal"],
     "tags": ["agricultural", "industrial", "rural", "sugar"]},
    {"id": "port-gellhorn", "name": "Port Gellhorn", "tagline": "Blue-Collar Soul with Petrochemical Bouquet",
     "description": "Major industrial port city on Leonida's Gulf Coast. Shipping terminals, fishing docks.",
     "satirical": "Port Gellhorn: Where REAL America works! Maritime criminal activity is 'local flavor'. 4 stars!",
     "color": "#FF8C00", "glow": "rgba(255,140,0,0.4)", "real_world": "Panama City / Gulf Coast, FL", "danger": 6, "population": "~180K",
     "highlights": ["Gellhorn Shipping Terminal", "Fisherman's Wharf", "Gulf Refinery Row"],
     "tags": ["industrial", "port", "maritime", "coastal"]},
    {"id": "mt-kalaga",     "name": "Mt. Kalaga NP",  "tagline": "Nature's Version of a Murder Mystery",
     "description": "Northern Leonida's vast wilderness. Dense forests, panthers, bears, diverse wildlife.",
     "satirical": "MT. KALAGA NP – PREMIUM hiking among apex predators! Cell service zero stars. Bears, panthers, and whatever those tracks are. All part of the package!",
     "color": "#39FF14", "glow": "rgba(57,255,20,0.4)", "real_world": "Ocala National Forest / N. FL", "danger": 5, "population": "~12K",
     "highlights": ["Kalaga Summit Trail", "Northern Pine Forests", "Panther Conservation Zone"],
     "tags": ["wilderness", "nature", "national park", "forests"]},
    {"id": "leonida-keys",  "name": "Leonida Keys",  "tagline": "Paradise (Duct-Taped Together)",
     "description": "Island chain based on Florida Keys. Honda Bridge, coral reefs, fishing communities.",
     "satirical": "LEONIDA KEYS! Honda Bridge structurally 'interesting'. Local fishermen EXTREMELY friendly at 3am. Bring cash. No one takes cards.",
     "color": "#00BFFF", "glow": "rgba(0,191,255,0.4)", "real_world": "Florida Keys", "danger": 3, "population": "~78K",
     "highlights": ["Honda Bridge", "Key Largo Reef", "Islamorada Fishing Village"],
     "tags": ["islands", "tropical", "beaches", "fishing"]},
]

KNOWLEDGE_BASE = [
    {"title": "GTA 6 Overview & Release", "category": "general", "tags": ["gta6", "release", "overview"],
     "content": "GTA 6 releases November 19, 2026 on PS5 and Xbox Series X/S. PC version expected 2027. Published by Rockstar Games."},
    {"title": "Protagonists - Jason & Lucia", "category": "characters", "tags": ["jason", "lucia", "protagonist"],
     "content": "GTA 6 features Jason Rios and Lucia Caminos. Lucia is GTA's first female lead since 2001. Criminal couple navigating Leonida's underworld."},
    {"title": "Leonida State Overview", "category": "world", "tags": ["leonida", "state", "map", "florida"],
     "content": "Leonida is GTA 6's fictional Florida. Estimated 2.1x the size of GTA V's Los Santos. Six regions: Vice City, Grassrivers, Ambrosia, Port Gellhorn, Mt. Kalaga NP, Leonida Keys."},
    {"title": "Vice City", "category": "regions", "tags": ["vice city", "miami", "urban"],
     "content": "Vice City is GTA 6's fictional Miami. Neon art deco hotels on Ocean Drive, MacArthur Causeway, vibrant nightlife. Largest Rockstar urban environment ever."},
    {"title": "Map Scale - GTA V vs GTA VI", "category": "world", "tags": ["map size", "scale", "gta v", "comparison"],
     "content": "Leonida is approximately 2.1x the size of GTA V's Los Santos. One of the largest open-world maps in gaming history."},
    {"title": "PC Version & Hardware", "category": "hardware", "tags": ["pc", "hardware", "rtx 5090"],
     "content": "GTA 6 PC expected 2027. RTX 5090 for 4K max, RTX 4080 Super minimum. 32GB RAM min, 64GB recommended. NVMe SSD required."},
    {"title": "Honest John's Travel Agency", "category": "guide", "tags": ["honest john", "travel agency", "guide"],
     "content": "Honest John's Travel Agency — Leonida's premier satirical travel guide. 4.7-star rating (paying clients only). Not liable for alligator incidents."},
    {"title": "GTA 6 Release Date", "category": "general", "tags": ["release", "date", "november", "2026"],
     "content": "Official release: November 19, 2026, PS5 & Xbox Series X/S. Most anticipated game in history."},
]

# ─────────────────────────── MODELS ──────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: str = ""

class RouteRequest(BaseModel):
    start: str
    end: str

class CommunityPOICreate(BaseModel):
    name: str
    description: str = ""
    category: str = "landmark"
    region: str = "unknown"
    x: float
    y: float
    submitter_name: str = "Anonymous"

class FlagRequest(BaseModel):
    reason: str = "inappropriate"

# ─────────────────────────── A* PATHFINDING ──────────────────────────────────
def _manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(start: str, end: str):
    if start not in LOCATIONS or end not in LOCATIONS:
        return None, 0
    end_pos = (LOCATIONS[end]["x"], LOCATIONS[end]["y"])
    open_set = [(0, start)]
    came_from = {}
    g = {n: float("inf") for n in LOCATIONS}
    g[start] = 0
    while open_set:
        _, cur = heapq.heappop(open_set)
        if cur == end:
            path = []
            while cur in came_from:
                path.append(cur)
                cur = came_from[cur]
            path.append(start)
            return path[::-1], round(g[end], 2)
        for nb, cost in GRAPH.get(cur, []):
            tg = g[cur] + cost
            if tg < g[nb]:
                came_from[nb] = cur
                g[nb] = tg
                f = tg + _manhattan((LOCATIONS[nb]["x"], LOCATIONS[nb]["y"]), end_pos) / 100
                heapq.heappush(open_set, (f, nb))
    return None, 0

# ─────────────────────────── KNOWLEDGE SEARCH ────────────────────────────────
def search_kb(query: str, top_k: int = 5):
    stop = {"the", "a", "is", "in", "of", "and", "to", "it", "for", "on", "at"}
    words = set(query.lower().split()) - stop
    scored = []
    for chunk in KNOWLEDGE_BASE:
        s = sum(2 for t in chunk["tags"] if any(w in t for w in words))
        s += sum(1 for w in words if w in chunk["content"].lower())
        s += sum(3 for w in words if w in chunk["title"].lower())
        if s > 0:
            scored.append((s, chunk))
    scored.sort(key=lambda x: -x[0])
    return [c for _, c in scored[:top_k]]

# ─────────────────────────── NEWS SCRAPER ────────────────────────────────────
async def scrape_news_task():
    logger.info("Starting GTA 6 news scrape...")
    new_count = 0
    async with _httpx.AsyncClient(timeout=15, follow_redirects=True,
                                   headers={"User-Agent": "LeonidaNewsBot/1.0"}) as http:
        for feed_info in RSS_FEEDS:
            try:
                resp = await http.get(feed_info["url"])
                feed = feedparser.parse(resp.text)
                for entry in feed.entries[:30]:
                    title = entry.get("title", "")
                    summary = entry.get("summary", "")
                    text = (title + " " + summary).lower()
                    if not any(kw in text for kw in GTA6_KEYWORDS):
                        continue
                    url = entry.get("link", "")
                    if not url or await db.news_articles.find_one({"url": url}):
                        continue
                    clean_sum = re.sub(r"<[^>]+>", "", summary)[:600]
                    relevance = sum(1 for kw in GTA6_KEYWORDS if kw in text)
                    article = {
                        "id": str(uuid.uuid4()), "source": feed_info["name"],
                        "title": title, "summary": clean_sum, "url": url,
                        "published": entry.get("published", ""),
                        "scraped_at": datetime.now(timezone.utc).isoformat(),
                        "relevance_score": relevance,
                    }
                    await db.news_articles.insert_one(article)
                    new_count += 1
                    if relevance >= 3:
                        asyncio.create_task(_extract_kb(article))
            except Exception as e:
                logger.warning(f"Feed {feed_info['name']} failed: {e}")
    logger.info(f"News scrape complete: {new_count} new articles")
    return new_count

async def _extract_kb(article: dict):
    """KB extraction stub — LLM integration removed for Railway deployment.
    Facts are now maintained in the frontend knowledgeBase.js instead."""
    logger.debug(f"KB extraction skipped (no LLM): {article.get('title', '')}")

# ─────────────────────────── CORE ROUTES ─────────────────────────────────────
@main_router.get("/")
async def root():
    return {"message": "Honest John's Travel Agency API — Welcome to Leonida!"}

@main_router.get("/regions")
async def get_regions():
    return REGIONS_DATA

@main_router.get("/locations")
async def get_locations():
    return [{"name": k, **v} for k, v in LOCATIONS.items()]

@main_router.post("/route")
async def find_route(req: RouteRequest):
    if req.start == req.end:
        raise HTTPException(400, "Start and end must be different")
    path, distance = astar(req.start, req.end)
    if not path:
        raise HTTPException(404, f"No route found between {req.start} and {req.end}")
    waypoints = [{"name": n, "x": LOCATIONS[n]["x"], "y": LOCATIONS[n]["y"]} for n in path]
    steps = [{"from": path[i], "to": path[i + 1],
               "distance": round(next((c for nb, c in GRAPH.get(path[i], []) if nb == path[i + 1]), 0), 2)}
             for i in range(len(path) - 1)]
    return {"path": path, "waypoints": waypoints, "total_distance": distance, "steps": steps}

@main_router.post("/chat")
async def chat(req: ChatRequest):
    """Chatbot is now fully client-side. This endpoint returns a redirect notice."""
    return {
        "response": "Honest John now lives directly in the app! The chatbot runs locally in your browser — no server needed. Use the chat widget in the bottom-right corner!",
        "session_id": req.session_id or str(uuid.uuid4()),
        "note": "Chat is now client-side. This endpoint is deprecated."
    }

@main_router.get("/knowledge/search")
async def knowledge_search(q: str = ""):
    return search_kb(q) if q else KNOWLEDGE_BASE[:5]

# ── News ──────────────────────────────────────────────────────────────────────
@main_router.get("/news")
async def get_news(limit: int = 20):
    return await db.news_articles.find({}, {"_id": 0}).sort("scraped_at", -1).to_list(limit)

@main_router.post("/news/refresh")
async def refresh_news():
    count = await scrape_news_task()
    return {"scraped": count, "timestamp": datetime.now(timezone.utc).isoformat()}

@main_router.get("/news/status")
async def news_status():
    total = await db.news_articles.count_documents({})
    latest = await db.news_articles.find(
        {}, {"_id": 0, "scraped_at": 1}
    ).sort("scraped_at", -1).limit(1).to_list(1)
    return {"total_articles": total, "last_scrape": latest[0]["scraped_at"] if latest else None}

# ── Community POIs ─────────────────────────────────────────────────────────────
@main_router.get("/community/pois")
async def get_community_pois(request: Request):
    user = await get_current_user_optional(request)
    query = {} if (user and user.get("role") == "admin") else {"hidden": {"$ne": True}}
    return await db.community_pois.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(500)

@main_router.post("/community/pois")
async def create_community_poi(poi: CommunityPOICreate, request: Request):
    user = await get_current_user_optional(request)
    doc = poi.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "approved": True, "upvote_count": 0, "voters": [],
        "verified": False, "flags": [], "flag_count": 0, "hidden": False,
        "submitter_user_id": user["id"] if user else None,
    })
    if user and (not doc.get("submitter_name") or doc["submitter_name"] == "Anonymous"):
        doc["submitter_name"] = user.get("display_name") or user["username"]
    await db.community_pois.insert_one(doc)
    doc.pop("_id", None)
    return doc

@main_router.post("/community/pois/{poi_id}/upvote")
async def upvote_poi(poi_id: str, request: Request):
    user = await get_current_user(request)
    poi = await db.community_pois.find_one({"id": poi_id})
    if not poi:
        raise HTTPException(404, "POI not found")
    voters = poi.get("voters", [])
    if user["id"] in voters:
        # Toggle off
        await db.community_pois.update_one(
            {"id": poi_id},
            {"$pull": {"voters": user["id"]}, "$inc": {"upvote_count": -1}},
        )
        return {"upvoted": False, "count": max(0, len(voters) - 1)}
    new_count = len(voters) + 1
    just_verified = new_count == 3
    await db.community_pois.update_one(
        {"id": poi_id},
        {"$addToSet": {"voters": user["id"]}, "$inc": {"upvote_count": 1},
         "$set": {"verified": new_count >= 3}},
    )
    # Fire-and-forget email notification
    asyncio.create_task(notify_upvote(poi, new_count))
    if just_verified:
        asyncio.create_task(notify_verified(poi))
    return {"upvoted": True, "count": new_count}

@main_router.post("/community/pois/{poi_id}/flag")
async def flag_poi(poi_id: str, body: FlagRequest, request: Request):
    user = await get_current_user(request)
    poi = await db.community_pois.find_one({"id": poi_id})
    if not poi:
        raise HTTPException(404, "POI not found")
    if any(f.get("user_id") == user["id"] for f in poi.get("flags", [])):
        raise HTTPException(400, "Already flagged by you")
    flag = {"user_id": user["id"], "username": user["username"],
            "reason": body.reason, "created_at": datetime.now(timezone.utc).isoformat()}
    new_flag_count = poi.get("flag_count", 0) + 1
    await db.community_pois.update_one(
        {"id": poi_id},
        {"$push": {"flags": flag}, "$inc": {"flag_count": 1},
         "$set": {"hidden": new_flag_count >= 2}},
    )
    return {"flagged": True, "flag_count": new_flag_count}

@main_router.delete("/community/pois/{poi_id}")
async def delete_poi(poi_id: str, request: Request):
    user = await get_current_user_optional(request)
    poi = await db.community_pois.find_one({"id": poi_id})
    if not poi:
        raise HTTPException(404, "POI not found")
    is_owner = user and poi.get("submitter_user_id") == user["id"]
    is_admin = user and user.get("role") == "admin"
    is_anon = not poi.get("submitter_user_id")
    if not (is_owner or is_admin or is_anon):
        raise HTTPException(403, "Cannot delete someone else's pin")
    await db.community_pois.delete_one({"id": poi_id})
    return {"deleted": poi_id}

# ── Admin ──────────────────────────────────────────────────────────────────────
@main_router.get("/admin/pois")
async def admin_get_pois(request: Request):
    await require_admin(request)
    return await db.community_pois.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(500)

@main_router.put("/admin/pois/{poi_id}/approve")
async def admin_approve_poi(poi_id: str, request: Request):
    await require_admin(request)
    result = await db.community_pois.update_one(
        {"id": poi_id},
        {"$set": {"hidden": False, "flags": [], "flag_count": 0, "approved": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "POI not found")
    return {"approved": poi_id}

@main_router.delete("/admin/pois/{poi_id}/admin")
async def admin_delete_poi(poi_id: str, request: Request):
    await require_admin(request)
    result = await db.community_pois.delete_one({"id": poi_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "POI not found")
    return {"deleted": poi_id}

# ── Leaderboard ────────────────────────────────────────────────────────────────
@main_router.get("/leaderboard")
async def get_leaderboard():
    pipeline = [
        {"$match": {"submitter_user_id": {"$exists": True, "$nin": [None, ""]}}},
        {"$group": {
            "_id": "$submitter_user_id",
            "username": {"$first": "$submitter_name"},
            "pois_submitted": {"$sum": 1},
            "total_upvotes": {"$sum": {"$ifNull": ["$upvote_count", 0]}},
            "verified_pois": {"$sum": {"$cond": {"if": "$verified", "then": 1, "else": 0}}},
        }},
        {"$sort": {"total_upvotes": -1, "pois_submitted": -1}},
        {"$limit": 20},
    ]
    results = await db.community_pois.aggregate(pipeline).to_list(20)
    leaderboard = []
    for i, entry in enumerate(results):
        user_doc = await db.users.find_one({"id": entry["_id"]}, {"_id": 0, "password_hash": 0})
        display = (user_doc.get("display_name") or entry.get("username") or "Anonymous") if user_doc else (entry.get("username") or "Anonymous")
        color = user_doc.get("avatar_color", gen_avatar_color(display)) if user_doc else gen_avatar_color(display)
        pois, up, ver = entry["pois_submitted"], entry["total_upvotes"], entry["verified_pois"]
        leaderboard.append({
            "rank": i + 1, "user_id": entry["_id"], "username": display,
            "avatar_color": color, "pois_submitted": pois, "total_upvotes": up,
            "verified_pois": ver, "score": up * 3 + pois + ver * 5,
            "badge": get_badge(pois, ver),
        })
    return leaderboard

@main_router.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    pois = await db.community_pois.count_documents({"submitter_user_id": user_id})
    agg = await db.community_pois.aggregate([
        {"$match": {"submitter_user_id": user_id}},
        {"$group": {"_id": None,
                    "total": {"$sum": "$upvote_count"},
                    "verified": {"$sum": {"$cond": {"if": "$verified", "then": 1, "else": 0}}}}},
    ]).to_list(1)
    up = agg[0]["total"] if agg else 0
    ver = agg[0]["verified"] if agg else 0
    return {"user_id": user_id, "pois_submitted": pois, "total_upvotes": up,
            "verified_pois": ver, "score": up * 3 + pois + ver * 5, "badge": get_badge(pois, ver)}

@main_router.get("/users/me/pins")
async def get_my_pins(request: Request):
    user = await get_current_user(request)
    pins = await db.community_pois.find(
        {"submitter_user_id": user["id"]}, {"_id": 0}
    ).sort("submitted_at", -1).to_list(50)
    return pins

# ── System / Launch Status ────────────────────────────────────────────────────
class LaunchStatusUpdate(BaseModel):
    launched: bool

@main_router.get("/system/launch-status")
async def get_launch_status():
    now = datetime.now(timezone.utc)
    auto = now >= datetime(2026, 11, 19, tzinfo=timezone.utc)
    override = await db.system_flags.find_one({"key": "gta6_launched"}, {"_id": 0})
    manual = override.get("value", False) if override else False
    return {
        "launched": auto or manual,
        "auto_launched": auto,
        "manual_override": manual,
        "launch_date": "2026-11-19T00:00:00Z",
    }

@main_router.put("/system/launch-status")
async def set_launch_status(body: LaunchStatusUpdate, request: Request):
    await require_admin(request)
    await db.system_flags.update_one(
        {"key": "gta6_launched"},
        {"$set": {"key": "gta6_launched", "value": body.launched}},
        upsert=True,
    )
    return {"launched": body.launched, "manual_override": body.launched}

# ─────────────────────────── REDDIT INTELLIGENCE BUREAU ──────────────────────
REDDIT_SUBS = ["GTA6", "GTA", "rockstar"]
REDDIT_CACHE = {"data": None, "fetched_at": None}
REDDIT_CACHE_TTL = 900  # 15 minutes

FLAIR_CATEGORY_MAP = {
    "news": "confirmed", "official": "confirmed", "confirmed": "confirmed",
    "leak": "hot_lead", "leaks": "hot_lead", "rumor": "hot_lead", "rumour": "hot_lead",
    "theory": "unverified", "speculation": "unverified", "discussion": "unverified",
    "debunked": "debunked", "fake": "debunked", "false": "debunked",
    "meme": "chatter", "humor": "chatter", "shitpost": "chatter",
}

def _classify_flair(flair_text: str) -> str:
    if not flair_text:
        return "unverified"
    fl = flair_text.lower().strip()
    for keyword, category in FLAIR_CATEGORY_MAP.items():
        if keyword in fl:
            return category
    return "unverified"

def _heat_score(ups: int, comments: int, age_hours: float) -> int:
    """Calculate a 1-10 heat score based on engagement velocity."""
    if age_hours < 0.1:
        age_hours = 0.1
    velocity = (ups + comments * 2) / age_hours
    if velocity > 500: return 10
    if velocity > 200: return 9
    if velocity > 100: return 8
    if velocity > 50:  return 7
    if velocity > 25:  return 6
    if velocity > 10:  return 5
    if velocity > 5:   return 4
    if velocity > 2:   return 3
    return 2

@main_router.get("/intel")
async def get_intel():
    now = datetime.now(timezone.utc)

    # Return cache if fresh
    if (REDDIT_CACHE["data"] and REDDIT_CACHE["fetched_at"]
            and (now - REDDIT_CACHE["fetched_at"]).total_seconds() < REDDIT_CACHE_TTL):
        return REDDIT_CACHE["data"]

    all_posts = []
    async with _httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        for sub in REDDIT_SUBS:
            try:
                resp = await client.get(
                    f"https://www.reddit.com/r/{sub}/hot.json?limit=30",
                    headers={"User-Agent": "LeonidaVices/1.0 (VCNN Intelligence Bureau)"}
                )
                if resp.status_code != 200:
                    continue
                data = resp.json()
                for child in data.get("data", {}).get("children", []):
                    post = child.get("data", {})
                    title = post.get("title", "")
                    # Filter: must be GTA 6 related
                    title_lower = title.lower()
                    is_relevant = any(kw in title_lower for kw in GTA6_KEYWORDS)
                    # For r/GTA6 sub, everything is relevant
                    if sub == "GTA6":
                        is_relevant = True
                    if not is_relevant:
                        continue
                    if post.get("stickied"):
                        continue

                    created_utc = post.get("created_utc", now.timestamp())
                    age_hours = max(0.1, (now.timestamp() - created_utc) / 3600)

                    all_posts.append({
                        "id": post.get("id", uuid.uuid4().hex[:8]),
                        "title": title,
                        "category": _classify_flair(post.get("link_flair_text", "")),
                        "heat": _heat_score(post.get("ups", 0), post.get("num_comments", 0), age_hours),
                        "engagement": post.get("ups", 0),
                        "comments": post.get("num_comments", 0),
                        "age_hours": round(age_hours, 1),
                        "flair": post.get("link_flair_text") or None,
                        "sub": sub,
                    })
            except Exception as e:
                logger.warning(f"Reddit scrape failed for r/{sub}: {e}")

    # Sort by heat score descending, then engagement
    all_posts.sort(key=lambda p: (p["heat"], p["engagement"]), reverse=True)
    # Dedupe by title similarity (take first 25)
    seen_titles = set()
    deduplicated = []
    for p in all_posts:
        key = p["title"][:50].lower()
        if key not in seen_titles:
            seen_titles.add(key)
            deduplicated.append(p)
        if len(deduplicated) >= 25:
            break

    # Calculate overall hype meter
    avg_heat = sum(p["heat"] for p in deduplicated) / max(len(deduplicated), 1)
    total_engagement = sum(p["engagement"] for p in deduplicated)

    result = {
        "posts": deduplicated,
        "hype_level": min(10, round(avg_heat)),
        "total_engagement": total_engagement,
        "post_count": len(deduplicated),
        "sources_checked": len(REDDIT_SUBS),
        "last_updated": now.isoformat(),
    }

    REDDIT_CACHE["data"] = result
    REDDIT_CACHE["fetched_at"] = now

    return result

