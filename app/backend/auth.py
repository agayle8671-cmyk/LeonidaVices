"""Authentication helpers and /api/auth routes."""
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import os
import uuid
import hashlib
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from database import db

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALG = "HS256"

auth_router = APIRouter(prefix="/api/auth")

# ── Crypto helpers ──────────────────────────────────────────────────────────
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False

def create_token(user_id: str, username: str, role: str = "user") -> str:
    payload = {
        "sub": user_id, "username": username, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def gen_avatar_color(username: str) -> str:
    # SHA-256 for deterministic color generation (MD5 replaced — stronger hash)
    h = hashlib.sha256(username.encode()).hexdigest()
    r = int(h[0:2], 16) | 0x80
    g = int(h[2:4], 16) | 0x40
    b = int(h[4:6], 16) | 0x80
    return f"#{r:02x}{g:02x}{b:02x}"

# ── Request helpers ─────────────────────────────────────────────────────────
async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        payload = pyjwt.decode(auth[7:], JWT_SECRET, algorithms=[JWT_ALG])
        return {"id": payload["sub"], "username": payload["username"], "role": payload.get("role", "user")}
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired — please log in again")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def get_current_user_optional(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user

# ── Badge helper ─────────────────────────────────────────────────────────────
def get_badge(pois: int, verified: int) -> dict:
    if pois >= 20 or verified >= 5:
        return {"name": "Community Legend", "color": "#FFE600", "icon": "👑"}
    if pois >= 10:
        return {"name": "Master Mapper", "color": "#FF007F", "icon": "🗺️"}
    if pois >= 5:
        return {"name": "Cartographer", "color": "#00E5FF", "icon": "📍"}
    if pois >= 1:
        return {"name": "Scout", "color": "#39FF14", "icon": "🔭"}
    return {"name": "Rookie", "color": "#888", "icon": "🎮"}

# ── Pydantic models ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# ── Routes ───────────────────────────────────────────────────────────────────
@auth_router.post("/register")
async def register(body: UserRegister):
    uname = body.username.lower().strip()
    if len(uname) < 3:
        raise HTTPException(400, "Username must be at least 3 characters")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if await db.users.find_one({"username": uname}):
        raise HTTPException(400, "Username already taken")
    user_id = str(uuid.uuid4())
    email = body.email.lower().strip() if body.email else None
    doc = {
        "id": user_id, "username": uname,
        "display_name": body.username.strip(),
        "password_hash": hash_password(body.password),
        "role": "user",
        "email": email,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "avatar_color": gen_avatar_color(uname),
        "bio": "",
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, uname)
    safe = {k: v for k, v in doc.items() if k not in ["_id", "password_hash"]}
    return {"token": token, "user": safe}

@auth_router.post("/login")
async def login(body: UserLogin):
    doc = await db.users.find_one({"username": body.username.lower().strip()})
    if not doc or not verify_password(body.password, doc.get("password_hash", "")):
        raise HTTPException(401, "Invalid username or password")
    token = create_token(doc["id"], doc["username"], doc.get("role", "user"))
    safe = {k: v for k, v in doc.items() if k not in ["_id", "password_hash"]}
    return {"token": token, "user": safe}

@auth_router.get("/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(404, "User not found")
    return doc

# ── Preferences ───────────────────────────────────────────────────────────────
class PreferencesUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    email_upvote: Optional[bool] = None
    email_verified: Optional[bool] = None

@auth_router.put("/me/preferences")
async def update_preferences(body: PreferencesUpdate, request: Request):
    user = await get_current_user(request)
    update: dict = {}
    if body.display_name is not None:
        v = body.display_name.strip()[:50]
        if v:
            update["display_name"] = v
    if body.email is not None:
        update["email"] = body.email.lower().strip() if body.email.strip() else None
    if body.email_upvote is not None:
        update["prefs.email_upvote"] = body.email_upvote
    if body.email_verified is not None:
        update["prefs.email_verified"] = body.email_verified
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(404, "User not found")
    return doc
