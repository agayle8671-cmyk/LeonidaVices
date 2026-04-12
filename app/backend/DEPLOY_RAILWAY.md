# Leonida Backend — Railway Deployment

## Quick Deploy Steps

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub and select your Leonida repo
4. Set the **root directory** to `app/backend`

### 2. Add MongoDB
1. In your Railway project, click **"+ New"** → **"Database"** → **"MongoDB"**
2. Railway will create a MongoDB instance and give you a connection URL
3. Copy the `MONGO_URL` from the MongoDB service's **Variables** tab

### 3. Set Environment Variables
In the backend service's **Variables** tab, add:

```
MONGO_URL=mongodb://mongo:PASSWORD@HOST:PORT/railway    ← from step 2
DB_NAME=leonida_guide
CORS_ORIGINS=*
JWT_SECRET=7f4a3b9c2e5d8f1a6c0b9e3d7a5f2b8c4e1a7d0f9b3c6e2a5d8f4b7c1e9a3d6f
ADMIN_USERNAME=honest_john
ADMIN_PASSWORD=leonida2026
RESEND_API_KEY=re_4wzBJC8B_KvPLRmFbVjNtpEyHrdMfDkz7
SENDER_EMAIL=onboarding@resend.dev
```

> **Note:** `PORT` is set automatically by Railway — do NOT set it manually.

### 4. Deploy
Railway auto-deploys when you push to GitHub. The `railway.json` config tells it to run:
```
uvicorn server:app --host 0.0.0.0 --port $PORT
```

### 5. Update Frontend
Once deployed, get your Railway URL (e.g., `https://leonida-backend-production.up.railway.app`) and update:

**File:** `app/frontend/.env`
```
REACT_APP_BACKEND_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

### What's Running on Railway
- ✅ News scraper (24hr cycle, 6 RSS feeds)
- ✅ Community pins (CRUD, upvotes, flags)
- ✅ Auth system (JWT, registration, login)
- ✅ Leaderboard
- ✅ Route planner API
- ✅ Region data API

### What Runs Locally (no server needed)
- ✅ Honest John chatbot (browser-based)
- ✅ Region map data
- ✅ Knowledge base

### Removed from Backend
- ❌ `emergentintegrations` (Emergent AI proprietary LLM package)
- ❌ LLM-powered KB extraction (was using Claude via Emergent)  
- ❌ Bloated dependencies (numpy, pandas, huggingface, etc.)

Requirements trimmed from 128 packages → ~20 essential packages.
