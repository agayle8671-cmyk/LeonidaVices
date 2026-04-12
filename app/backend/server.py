"""Lean app entry-point: wires modules, CORS, scheduler, startup/shutdown."""
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import os
import uuid
import logging
import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from database import client as db_client, db
from auth import auth_router, hash_password, verify_password
from routes import main_router, scrape_news_task

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Honest John's Travel Agency API")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(main_router)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Scheduler ─────────────────────────────────────────────────────────────────
_scheduler = AsyncIOScheduler(timezone="UTC")


# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("Honest John's Travel Agency API is OPEN FOR BUSINESS.")

    # ── Idempotent admin seed (updates password if .env changed) ──────────────
    admin_uname = os.environ.get("ADMIN_USERNAME", "honest_john").lower()
    admin_pw    = os.environ.get("ADMIN_PASSWORD", "leonida2026")
    existing = await db.users.find_one({"username": admin_uname})
    if not existing:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id, "username": admin_uname, "display_name": "Honest John",
            "password_hash": hash_password(admin_pw), "role": "admin",
            "email": None, "bio": "Proprietor of Leonida's finest travel agency.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "avatar_color": "#FFE600",
        })
        logger.info(f"Admin seeded: {admin_uname}")
    elif not verify_password(admin_pw, existing.get("password_hash", "")):
        # Password in .env changed — update the stored hash
        await db.users.update_one(
            {"username": admin_uname},
            {"$set": {"password_hash": hash_password(admin_pw)}},
        )
        logger.info(f"Admin password updated for: {admin_uname}")

    # ── News scraper scheduler (24 h cycle) ───────────────────────────────────
    if not _scheduler.running:
        _scheduler.add_job(
            scrape_news_task, "interval", hours=24, id="news_scrape", coalesce=True
        )
        _scheduler.start()
        logger.info("News scraper scheduler started (24-hr cycle)")

    # Always scrape on startup — fresh news on every deploy/restart
    asyncio.create_task(scrape_news_task())
    logger.info("Startup news scrape triggered")


@app.on_event("shutdown")
async def shutdown():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
    db_client.close()
