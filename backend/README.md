# PACT: Backend Service Package (`backend/`)

> [!NOTE]
> **DEVELOPMENT STATUS: INITIAL SETUP ONLY**  
> No API endpoints, database models, or security mechanisms have been pre-implemented. All backend service code will be authored during the official CodeHack India build window.

---

## 1. Overview & Technology Stack (Provisional)

The backend provides the asynchronous REST API and security enforcement engine for PACT, managing state transitions, concurrency locks, cryptographic hash chaining, and role-based authorization.

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Server**: Uvicorn ASGI
- **Data Validation & Serialization**: Pydantic V2
- **ORM & Database**: SQLAlchemy 2.0 + Alembic (PostgreSQL, with SQLite local dev fallback)
- **Security & Integrity**: Passlib (Bcrypt), Python-JOSE (JWT), Cryptographic SHA-256

---

## 2. Planned Directory Structure (To Be Implemented in Milestone 1)

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py            # Login, session validation, role verification
│   │       │   ├── resources.py       # Catalog CRUD, search, eligibility check
│   │       │   ├── bookings.py        # Booking state machine, conflict checks
│   │       │   ├── handovers.py       # Single-use handover token generation & check-in
│   │       │   ├── returns.py         # Return inspection, checklist & condition photos
│   │       │   ├── incidents.py       # Discrepancy reporting & admin arbitration
│   │       │   ├── audit.py           # Trust Capsule timeline & SHA-256 verification
│   │       │   └── security_arena.py  # Attack simulation harness endpoints
│   │       └── router.py              # Unified API v1 route aggregator
│   ├── core/
│   │   ├── config.py                  # Pydantic BaseSettings loading from .env
│   │   ├── database.py                # SQLAlchemy engine and session dependency
│   │   └── security.py                # Password hashing, JWT creation & verification
│   ├── models/                        # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── resource.py
│   │   ├── booking.py
│   │   ├── handover.py
│   │   ├── condition_report.py
│   │   ├── incident.py
│   │   └── trust_capsule.py
│   ├── schemas/                       # Pydantic request & response DTOs
│   │   ├── user.py
│   │   ├── resource.py
│   │   ├── booking.py
│   │   ├── handover.py
│   │   └── audit.py
│   ├── services/                      # Core business logic algorithms
│   │   ├── access_gate.py             # Zero-Trust eligibility rules evaluation
│   │   ├── fair_access.py             # Quota caps, cooldowns, waitlist prioritization
│   │   └── trust_capsule.py           # Cryptographic hash chaining & integrity engine
│   └── main.py                        # FastAPI application instance & CORS middleware
├── scripts/
│   └── seed_demo.py                   # One-click demo database populator
├── requirements.txt                   # Python package dependencies (to be created at Hour 4)
└── README.md
```

---

## 3. Local Development Setup (Once Initialized)

When the hackathon coding window opens, the backend will be configured as follows:

```bash
# 1. Create and activate a Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment template
cp ../.env.example .env

# 4. Run local development server with auto-reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive OpenAPI documentation will be accessible at:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`
