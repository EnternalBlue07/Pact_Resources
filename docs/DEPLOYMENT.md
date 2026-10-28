# PACT: Deployment Strategy & Environment Guide

> [!NOTE]
> **PROVISIONAL DEPLOYMENT RUNBOOK**  
> This document details the planned hosting architecture, containerization strategy, and pre-deployment validation procedures for the CodeHack India live product submission.

---

## 1. Hosting Architecture (Provisional Targets)

To ensure high availability and fast judge access during evaluation, PACT will be deployed using modern, low-latency cloud platforms:

```
+---------------------------------------------------------------------------------------+
|  FRONTEND HOSTING: Vercel / Render Static Site                                        |
|  - Automatic HTTPS / TLS                                                              |
|  - Global CDN edge caching for static assets                                          |
|  - Environment variable mapping to Backend API                                        |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTPS REST Calls
                                            v
+---------------------------------------------------------------------------------------+
|  BACKEND HOSTING: Render / Fly.io / Railway Web Service                               |
|  - Containerized FastAPI service via Docker or Python 3.11 buildpack                  |
|  - Managed SSL termination                                                            |
|  - CORS whitelisting for frontend domain                                              |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|  DATABASE HOSTING: Supabase / Neon / Render Managed PostgreSQL                         |
|  - High-availability PostgreSQL 15+ instance                                          |
|  - Secure connection pooling                                                          |
|  - Automatic daily backups                                                            |
+---------------------------------------------------------------------------------------+
```

---

## 2. Pre-Deployment Configuration & Environment Variables

### Production Backend Environment Checklist
- `APP_ENV=production`
- `APP_DEBUG=false`
- `CORS_ALLOWED_ORIGINS=https://pact-resource-trust.vercel.app` (or active frontend URL)
- `DATABASE_URL=postgresql://user:secure_password@neon.tech/pact_prod`
- `JWT_SECRET_KEY=<cryptographically-generated-random-32-byte-hex>`
- `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- `HANDOVER_TOKEN_EXPIRE_MINUTES=15`

### Production Frontend Environment Checklist
- `VITE_API_BASE_URL=https://pact-api.onrender.com`

---

## 3. Pre-Flight Verification Checklist (Hour 44–46)

Before submitting the deployed application to the CodeHack India evaluation portal, the team must complete the following smoke tests on the live production URL:

1. [ ] **Public Connectivity**: Verify website loads over HTTPS without SSL warnings on desktop and mobile browsers.
2. [ ] **Cross-Origin Requests (CORS)**: Confirm API requests succeed from the frontend domain without CORS preflight failures.
3. [ ] **Database Connectivity**: Confirm data persists across browser refreshes and container restarts.
4. [ ] **Seeded Demo Accounts**: Verify all 4 pre-configured judge credentials log in cleanly.
5. [ ] **Complete Lifecycle Smoke Test**: Run through Search ➔ Eligibility ➔ Book ➔ Approve ➔ Check-in ➔ Return ➔ Audit Timeline on production.
6. [ ] **Incident Flow Verification**: Confirm an incident can be flagged and resolved by the administrator account.
7. [ ] **Audit Hash Integrity**: Execute `/api/v1/audit/verify-chain` on the live backend and verify green status.
8. [ ] **Console Hygiene**: Open browser DevTools and ensure zero unhandled JavaScript runtime exceptions or red network errors.
