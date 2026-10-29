# PACT: Production Deployment Runbook & Free-Tier Hosting Guide

> **Repository**: `D:\pact-resource-trust`
> **Classification**: Production Deployment & Infrastructure Specification
> **Target Event**: CodeHack India 2026
> **Status**: Production-Ready (Validated)

---

## 1. Free-Tier Cloud Architecture & Provider Evaluation

PACT (*Proof, Authorization, Custody & Trust*) is architected for zero-cost, high-reliability deployment for hackathon demonstrations and judge evaluations.

```
+---------------------------------------------------------------------------------------+
|  FRONTEND HOSTING: Vercel (Hobby Tier — $0/mo)                                        |
|  - Root: frontend/ | Build: npm run build | Output: dist                              |
|  - Global Edge CDN caching with sub-50ms static delivery                              |
|  - Automatic HTTPS / TLS termination                                                  |
|  - Reverse-proxy rewrite option (/api/:path* -> Render) to eliminate CORS preflight   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTPS REST Calls
                                            v
+---------------------------------------------------------------------------------------+
|  BACKEND HOSTING: Render Web Service (Free Tier — $0/mo)                              |
|  - Runtime: Python 3.12+ Native Buildpack                                             |
|  - Specs: 512 MB RAM, 0.1 vCPU, 750 free instance hours/month                         |
|  - Automatic Git-push continuous deployments & rollback support                       |
|  - Cold Start Note: Spins down after 15 min inactivity; wakes up in ~50 seconds       |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | Encrypted TLS Connection (Port 5432)
                                            v
+---------------------------------------------------------------------------------------+
|  DATABASE HOSTING: Neon Serverless PostgreSQL (Free Tier — $0/mo)                     |
|  - Specs: 1 GB storage, autoscaling compute, pooled connections (pgbouncer)           |
|  - Expiration Guarantee: Permanent free tier (NO 30-day auto-delete like Render DB)   |
|  - Wake-up: ~500ms from cold pause; pooled connection string (-pooler endpoint)      |
+---------------------------------------------------------------------------------------+
```

### Critical Storage Disclaimer: SQLite vs. Cloud PostgreSQL
> [!WARNING]
> **Ephemeral Disk Risk**: Free container hosting platforms (Render, Railway, Fly.io, Vercel) operate on **ephemeral file systems**. Any local SQLite database file (`pact_dev.db`) written to container disk is **wiped permanently** whenever the container spins down, restarts, or receives a new deployment.
>
> Therefore, **SQLite is strictly prohibited for production persistence**. A managed cloud PostgreSQL database (such as Neon or Supabase) must be used. SQLite is reserved solely for local offline development and fast in-memory pytest execution.

---

## 2. Free-Tier Provider Trade-Off Matrix

| Provider Layer | Recommended Choice | Runner-Up | Sleeping Behavior & Limitations |
| :--- | :--- | :--- | :--- |
| **FastAPI Backend** | **Render (Web Service)** | **Koyeb (Eco)** | Spins down after 15 minutes of inactivity. First request takes ~50s to wake up. Warm up before demo pitches! |
| **PostgreSQL DB** | **Neon (Serverless)** | **Supabase** | 1 GB storage (Neon current free tier), compute and bandwidth limits apply. Neon does **not** delete data after 30 days (unlike Render Free DB which expires in 30 days). Wakes up in <500ms. |
| **React Frontend** | **Vercel (Hobby)** | **Cloudflare Pages** | Zero sleeping. Instant global edge delivery. 100 GB bandwidth/mo. |

---

## 3. Exact Build & Execution Commands

### Backend Commands

| Stage | Command | Directory |
| :--- | :--- | :--- |
| **Dependency Install** | `pip install -r backend/requirements.txt` | Repository Root |
| **Local Development** | `cd backend && python -m uvicorn app.main:app --reload --port 8000` | Repository Root |
| **Production Start (Render / Docker)** | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` | Repository Root |
| **Production Alternative (Gunicorn)** | `cd backend && gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT` | Repository Root |
| **Database Table Init** | Automatic on FastAPI startup via `lifespan` handler | Automatic |
| **Database Demo Seeding** | `python backend/app/scripts/seed_demo.py` | Repository Root |
| **Run Regression Test Suite** | `python -m pytest tests/ -v` | Repository Root |
| **Run Deployment Readiness Probe**| `python tests/verify_deployment_readiness.py` | Repository Root |

### Frontend Commands

| Stage | Command | Directory |
| :--- | :--- | :--- |
| **Dependency Install** | `npm install` | `frontend/` |
| **Local Development** | `npm run dev` | `frontend/` |
| **Production Build** | `npm run build` | `frontend/` |
| **Local Build Preview** | `npm run preview` | `frontend/` |

---

## 4. Required Environment Variables

### Backend Service Environment Variables (Render Dashboard)

> [!CAUTION]
> Use placeholder values below as templates. Never commit real passwords or production tokens to source control.

```dotenv
# Application Environment
APP_NAME=PACT - Proof, Authorization, Custody & Trust
APP_ENV=production
APP_DEBUG=false
APP_HOST=0.0.0.0
APP_PORT=8000
API_V1_PREFIX=/api/v1

# Production PostgreSQL Database (from Neon dashboard)
# Ensure sslmode=require is appended; pgbouncer connection pooling is recommended
DATABASE_URL=postgresql://<neon_user>:<neon_password>@<neon_endpoint_id>-pooler.eastus2.azure.neon.tech/<neon_dbname>?sslmode=require

# Security Secrets (Generate using: python -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET_KEY=<your-64-character-cryptographically-random-hex-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
HANDOVER_TOKEN_EXPIRE_MINUTES=15

# Cross-Origin Resource Sharing (CORS)
# Supports comma-separated strings or JSON arrays
CORS_ALLOWED_ORIGINS=https://<your-frontend-app>.vercel.app,http://localhost:5173
```

### Frontend Environment Variables (Vercel Dashboard)

```dotenv
# API Base Endpoint (Points to the deployed Render backend)
VITE_API_BASE_URL=https://<your-backend-app>.onrender.com
```

---

## 5. Step-by-Step Deployment Walkthrough

### Phase A: Provision PostgreSQL on Neon ($0 Free Tier)
1. Sign in to [Neon](https://neon.tech) via GitHub.
2. Click **Create Project** -> Name: `pact-resource-trust`, Region: Choose nearest (e.g. `ap-southeast-1` or `us-east-2`).
3. Under **Connection Details**, toggle **Pooled connection** (`pgbouncer`).
4. Copy the connection string. It will look like:
   `postgresql://pact_owner:AbC123xyz@ep-solitary-base-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Phase B: Deploy Backend on Render ($0 Free Tier)
1. Sign in to [Render](https://render.com) via GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your repository: `https://github.com/EnternalBlue07/Pact_Resources`.
4. Configure service parameters:
   - **Name**: `pact-backend`
   - **Region**: Same or closest region as Neon database
   - **Branch**: `main`
   - **Root Directory**: *(leave blank — repository root)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Click **Advanced** -> **Add Environment Variable**:
   - Add all backend variables from Section 4 above (`APP_ENV=production`, `DATABASE_URL=...`, `JWT_SECRET_KEY=...`, etc.).
6. Click **Create Web Service**. Wait ~3 minutes for the build to finish.
7. Once active, note your backend public URL: `https://pact-backend.onrender.com`.

### Phase C: Initialize & Seed Database
1. In the Render Dashboard for `pact-backend`, open the **Shell** tab (or run locally from terminal with production `DATABASE_URL` set in environment).
2. Execute the seed script:
   ```bash
   python backend/app/scripts/seed_demo.py
   ```
3. Output will confirm tables initialized and demo users seeded:
   ```text
   Initializing database tables...
   Seeding institutional user accounts...
   Seeding campus resources...
   Database seeded successfully!
   ```

### Phase D: Deploy Frontend on Vercel ($0 Free Tier)
1. Sign in to [Vercel](https://vercel.app) via GitHub.
2. Click **Add New...** -> **Project** -> Select `Pact_Resources`.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://pact-backend.onrender.com`
5. Click **Deploy**. Vercel will build and deploy the SPA in ~45 seconds.
6. Once deployed, copy your production frontend URL (e.g., `https://pact-resource-trust.vercel.app`).
7. **CORS Update**: Return to Render -> `pact-backend` -> **Environment** -> Update `CORS_ALLOWED_ORIGINS` to include your live Vercel URL. Render will automatically re-deploy with updated CORS headers.

---

## 6. Zero-CORS Alternative via Vercel Rewrites

To completely bypass cross-origin preflight checks and protect the backend domain, add `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://pact-backend.onrender.com/api/:path*"
    }
  ]
}
```
This proxies all `/api/v1/*` requests directly through Vercel's edge network on the same origin.

---

## 7. Rollback & Disaster Recovery Procedures

### Backend Rollback on Render
1. Navigate to **Render Dashboard** -> `pact-backend` -> **Events**.
2. Locate the last known healthy deployment commit.
3. Click the three dots `...` next to the deploy -> **Rollback to this deploy**.
4. Render immediately reinstates the previous container image within 30 seconds.

### Frontend Rollback on Vercel
1. Navigate to **Vercel Dashboard** -> `Pact_Resources` -> **Deployments**.
2. Select the previous working deployment.
3. Click **Instant Rollback** -> Confirm.
4. Traffic instantly shifts to the previous build at edge DNS level with zero downtime.

---

## 8. Post-Deployment Smoke Verification Checklist

Verify these 10 items on the live production deployment before judge presentation:

- [ ] **1. Public Health Check**:
  `curl -i https://pact-backend.onrender.com/health` returns `HTTP 200 OK` with `{"status": "ok", "environment": "production"}`.
- [ ] **2. Swagger Docs Accessible**:
  `https://pact-backend.onrender.com/docs` opens the interactive OpenAPI documentation without console errors.
- [ ] **3. Frontend HTTPS & Rendering**:
  Frontend loads at `https://<app>.vercel.app` with zero SSL warnings and renders the 6 campus resources in the catalog.
- [ ] **4. Zero-Trust Eligibility Gate**:
  Select student profile `u-student-01` -> Click **Check Eligibility** on Laser Cutter -> Verifies red alert: *Missing required qualification: LASER_SAFETY_1*.
- [ ] **5. Booking Creation**:
  Submit a booking for 3D Printer (`res-printer3d-02`) -> Returns `HTTP 201 Created` with booking ID.
- [ ] **6. Custodian Approval**:
  Switch to Custodian profile -> Approve the pending booking -> Status transitions to `APPROVED`.
- [ ] **7. Handover Token & Single-Use Enforcement**:
  Generate 15-minute token -> Custodian verifies check-in -> Status transitions to `CHECKED_OUT`. Re-entering the token returns `HTTP 400 Bad Request`.
- [ ] **8. Return Inspection & Damage Incident**:
  Custodian inspects return and flags damage -> Status transitions to `INCIDENT_OPEN` and asset locks to `UNDER_MAINTENANCE`.
- [ ] **9. Administrative Adjudication**:
  Admin resolves incident -> Booking transitions to `CLOSED` and asset returns to `AVAILABLE`.
- [ ] **10. Tamper-Evident Ledger Integrity**:
  Navigate to `/api/v1/audit/verify-chain` -> Verifies status `VALID` with unbroken SHA-256 forward-hash chain.
