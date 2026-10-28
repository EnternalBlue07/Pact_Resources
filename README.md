# PACT

> **Proof, Authorization, Custody & Trust**  
> *Proof Before Access. Evidence After Return.*

[![Status](https://img.shields.io/badge/Status-Initial%20Setup%20%26%20Engineering%20Foundation-orange.svg)](#current-implementation-status)
[![Hackathon](https://img.shields.io/badge/Hackathon-CodeHack%20India%202026-blue.svg)](https://codehackindia.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Repository](https://img.shields.io/badge/GitHub-EnternalBlue07%2FPact__Resources-181717.svg?logo=github)](https://github.com/EnternalBlue07/Pact_Resources)

---

## 1. Project Purpose & Problem Statement

Modern educational, research, and technical institutions invest millions in high-value physical assets:
- **Specialized Equipment**: Oscilloscopes, spectrum analyzers, 3D printers, laser cutters, clean-room equipment, digital microscopes.
- **Shared Spaces**: Robotics test enclosures, podcast/sound studios, prototyping bays, clean rooms.

Despite high demand from students and researchers, these assets sit idle up to 80% of the week because:
1. **The Custody Void**: Lab technicians and department heads fear unaccounted damage, component theft, or missing accessories with zero recourse.
2. **Opaque Discovery**: Students cannot view real-time asset availability or technical specifications across departmental silos.
3. **Ambiguous Prerequisite Verification**: No automated gatekeeping to verify if a student holds safety training (e.g. Laser Safety Level 1).
4. **Monopolization**: Well-connected senior researchers hoard equipment without usage quotas or fair waitlists.
5. **No Auditable Traceability**: Paper registers and informal chats leave no tamper-evident proof when equipment breaks.

**PACT transforms resource lending from an informal risk into a verifiable, auditable custody contract.**

---

## 2. Target Users & Stakeholders

- **Requesters (Students / Researchers / Club Leads)**: Discover equipment, verify prerequisite qualifications, book slots, and protect themselves with pre-use baseline photographic evidence.
- **Resource Custodians (Lab Technicians / Faculty)**: Define eligibility rules, approve/reject requests, conduct 15-minute dual-acknowledgement handovers, and inspect returns.
- **Department Administrators (Lab Directors / Deans)**: Review flagged damage incidents, adjudicate student appeals, and manage fair allocation quotas.
- **Compliance Auditors (Campus Inspectors / Safety Officers)**: Inspect the Trust Replay timeline and cryptographically verify the SHA-256 hash ledger.

---

## 3. Core Capabilities & Planned Differentiators

- **10-Step Custody Lifecycle**: Discovery ➔ Eligibility ➔ Request ➔ Approval ➔ Handover ➔ Active Custody ➔ Return ➔ Incident Review ➔ Audit Chaining.
- **Zero-Trust Access Gate**: Server-side verification of prerequisite safety training and active concurrency quotas before booking can proceed.
- **Dual-Ack Handover Handshake**: 15-minute single-use cryptographic tokens ensuring borrower and custodian are physically co-present at checkout.
- **Trust Capsule**: Tamper-evident transaction ledger chaining every lifecycle transition via cryptographic SHA-256 hashes.
- **Trust Replay**: Interactive chronological timeline rendering the verifiable custody history of any physical resource.
- **Fair Access Engine**: Anti-monopolization quota engine (max 2 active bookings/student), cooldown windows, and automated waitlists.
- **Security Arena**: Built-in test harness allowing evaluators to simulate attack vectors (token replay, double booking race, privilege escalation, audit tampering) live in the browser.

---

## 4. Current Implementation Status

> [!IMPORTANT]
> **PHASE: ENGINEERING FOUNDATION & ARCHITECTURAL SPECIFICATION**  
> All architectural patterns, state machines, API contracts, database schemas, test plans, and planning registers have been established.  
> **Functional application components are under active development in Milestone 1.**

| Capability / Module | Implementation Status | Tracking Task |
| :--- | :---: | :--- |
| **Architectural Specifications & ADRs** | **COMPLETE** | [DECISIONS.md](DECISIONS.md), [FLOW.md](FLOW.md) |
| **API Contracts & Data Schemas** | **COMPLETE** | [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Backend Scaffolding & Health API** | **IN PROGRESS** | [TSK-P0-01](IMPLEMENTATION_PLAN.md#1-p0-tasks--mandatory-end-to-end-core-lifecycle) |
| **Catalog CRUD & Search API** | Planned (Milestone 1) | [TSK-P0-03](IMPLEMENTATION_PLAN.md) |
| **Zero-Trust Gate & Eligibility Checks** | Planned (Milestone 1) | [TSK-P0-04](IMPLEMENTATION_PLAN.md) |
| **Booking State Machine & Concurrency Locks** | Planned (Milestone 1) | [TSK-P0-05](IMPLEMENTATION_PLAN.md) |
| **Dual-Ack 15-Min Handover Tokens** | Planned (Milestone 2) | [TSK-P0-07](IMPLEMENTATION_PLAN.md) |
| **Return Inspection & Incident Review** | Planned (Milestone 2) | [TSK-P0-08](IMPLEMENTATION_PLAN.md) |
| **Trust Capsule SHA-256 Hash Chaining** | Planned (Milestone 3) | [TSK-P1-01](IMPLEMENTATION_PLAN.md) |
| **Security Arena Diagnostic Console** | Planned (Milestone 3) | [TSK-P2-01](IMPLEMENTATION_PLAN.md) |

---

## 5. Technology Stack

- **Frontend**: React 18 / 19 + TypeScript (strict mode) + Vite + Tailwind CSS + Lucide Icons.
- **Backend**: Python 3.12 + FastAPI + Uvicorn ASGI + Pydantic V2.
- **Database & Persistence**: PostgreSQL 15+ (Production) / SQLite (Local Dev) via SQLAlchemy 2.0.
- **Security & Integrity**: Stateless JWT Bearer Auth (HMAC-SHA256) + Passlib (Bcrypt) + Cryptographic SHA-256 Chaining.
- **Testing**: Pytest + HTTPX (Async API tests) + Vitest.

---

## 6. Local Setup & Quick Start Instructions

### Prerequisites
- Python 3.11 or 3.12 (`python --version`)
- Node.js 20+ (`node --version`)
- Git (`git --version`)

### 1. Clone & Configure
```bash
git clone https://github.com/EnternalBlue07/Pact_Resources.git
cd Pact_Resources
cp .env.example .env
```

### 2. Backend Setup & Run
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive OpenAPI Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 3. Frontend Setup & Run
```bash
cd ../frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 7. Testing Instructions

```bash
# Run backend unit and integration test suite
pytest -v

# Run with coverage report
pytest --cov=app tests/

# Run security and concurrency tests specifically
pytest -v tests/test_security_arena.py tests/test_booking_state.py
```

---

## 8. Environment Variables Setup

Configure `.env` from [.env.example](.env.example). **Never commit real secrets.**

```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
DATABASE_URL=sqlite:///./pact_dev.db
JWT_SECRET_KEY=change_me_to_a_secure_random_string_for_local_dev_only
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
HANDOVER_TOKEN_EXPIRE_MINUTES=15
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 9. Living Project Documentation Links

- **[DECISIONS.md](DECISIONS.md)** — Architectural Decision Records (ADRs) explaining *why* we chose the design.
- **[FLOW.md](FLOW.md)** — State machine transitions, authority matrix, and visual Mermaid diagrams.
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** — Prioritized task ledger, acceptance criteria, and status.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Detailed subsystem responsibilities, database schemas, and data flow.
- **[SECURITY.md](SECURITY.md)** — Zero-trust access controls, handover tokens, threat matrix, and audit limitations.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Branch naming, commit standards, pull request rules, and team coordination.
- **[docs/PROBLEM_STATEMENT.md](docs/PROBLEM_STATEMENT.md)** — Official CodeHack India requirements & 100-point judging rubric.
- **[docs/API_CONTRACTS.md](docs/API_CONTRACTS.md)** — REST API schemas for parallel frontend/backend development.
- **[docs/TEAM_CONTRIBUTIONS.md](docs/TEAM_CONTRIBUTIONS.md)** — Transparent 4-member contribution tracking ledger.

---

## 10. Current Prototype Limitations

1. **Tamper-Evident vs. Tamper-Proof**: Internal cryptographic hash chaining detects unauthorized data tampering, but does not provide external blockchain consensus immutability against database root administrators.
2. **Simulated Hardware**: Dual-acknowledgement tokens are verified via digital web interfaces rather than physical IoT turnstiles or RFID badge scanners.
3. **Condition Inspection**: Photographically documented with side-by-side human review rather than automated computer vision defect detection.
