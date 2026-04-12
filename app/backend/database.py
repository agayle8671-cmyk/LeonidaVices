"""Shared database connection — import db from here, never recreate it."""
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

load_dotenv(Path(__file__).parent / ".env")

logger = logging.getLogger(__name__)

MONGO_URL = os.environ.get("MONGO_URL") or os.environ.get("MONGODB_URL") or os.environ.get("MONGO_PUBLIC_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "leonida_guide")

logger.info(f"Connecting to MongoDB: {MONGO_URL[:30]}... | DB: {DB_NAME}")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

