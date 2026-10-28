# PACT: Team Contribution Ledger

> [!NOTE]
> **HACKATHON COLLABORATION & TRANSPARENCY LEDGER**  
> In accordance with CodeHack India evaluation rules, this document tracks the individual contributions of all 4 student team members.  
> **Status Note**: At this repository initialization phase, all tasks are marked **PLANNED**. Actual contributions, PR references, and evidence will be updated continuously during the 48-hour build window.

---

## 1. Team Roster & Provisional Workstream Assignment

| Member Placeholder | Name / GitHub Handle | Provisional Workstream | Primary Technical Domain |
| :---: | :--- | :--- | :--- |
| **Member 1** | *[Student Name 1]* (@github-handle-1) | **Frontend & Integration** | React UI, state management, handover UX, Trust Replay visualizer |
| **Member 2** | *[Student Name 2]* (@github-handle-2) | **Backend & Database** | FastAPI REST APIs, PostgreSQL schema, state machine transitions, booking validation |
| **Member 3** | *[Student Name 3]* (@github-handle-3) | **Security & Audit Integrity**| Zero-Trust Access Gate, token signing/verification, Trust Capsule hash chaining |
| **Member 4** | *[Student Name 4]* (@github-handle-4) | **Lifecycle, Incidents & QA** | Return inspections, incident workflow, automated test suite, demo orchestration |

---

## 2. Individual Contribution Tracking Table

| Member | Assigned Task / Component | Deliverable / PR Reference | Verification Evidence | Status |
| :---: | :--- | :--- | :--- | :---: |
| **Member 1** | Setup React + Vite + Tailwind scaffolding | `frontend/` package setup | Clean dev server launch, zero linter errors | **PLANNED** |
| **Member 1** | Resource catalog & search UI with faceted filters | `src/pages/CatalogPage.tsx` | Keyword search and category filtering verified in browser | **PLANNED** |
| **Member 1** | Booking modal & eligibility indicator banners | `src/components/BookingModal.tsx` | Explanatory eligibility UI verified | **PLANNED** |
| **Member 1** | Trust Replay timeline and Security Arena UI | `src/pages/TrustReplay.tsx` | Audit timeline and attack simulations rendered | **PLANNED** |
| **Member 2** | FastAPI project scaffolding and CORS middleware | `backend/` service setup | Clean server startup with OpenAPI docs at `/docs` | **PLANNED** |
| **Member 2** | PostgreSQL schema models and database sessions | `backend/models/`, `backend/db/` | Tables and relations created with migration script | **PLANNED** |
| **Member 2** | Booking lifecycle state machine & concurrency locks | `backend/api/v1/bookings.py` | Overlapping booking requests rejected with 409 | **PLANNED** |
| **Member 2** | Resource CRUD & catalog search endpoints | `backend/api/v1/resources.py` | Query filtering and pagination verified | **PLANNED** |
| **Member 3** | JWT authentication & role-based access dependencies | `backend/core/security.py` | Role scopes enforced server-side | **PLANNED** |
| **Member 3** | Zero-Trust Access Gate prerequisite validator | `backend/services/access_gate.py` | Missing qualification blocks booking request | **PLANNED** |
| **Member 3** | Handover token generator & dual-ack validator | `backend/api/v1/handovers.py` | Expired and replayed tokens rejected with 400 | **PLANNED** |
| **Member 3** | Trust Capsule SHA-256 hash chaining & verification | `backend/services/trust_capsule.py` | Audit chain verification detects tampered blocks | **PLANNED** |
| **Member 4** | Return inspection checklist & condition capture | `backend/api/v1/returns.py` | Side-by-side photographic evidence stored | **PLANNED** |
| **Member 4** | Incident reporting & administrator arbitration flow | `backend/api/v1/incidents.py` | Damage flags prevent auto-close until resolved | **PLANNED** |
| **Member 4** | Automated backend test suite (unit + integration) | `tests/` test runner | Pytest suite passes all positive and negative cases | **PLANNED** |
| **Member 4** | Deployment orchestration, demo data seeding & video | Live URL & Demo recording | Deployed on cloud platform with sample data seeded | **PLANNED** |

---

## 3. Contribution Verification Protocol

To ensure academic and competitive integrity:
1. Every major feature must be merged via an individual Pull Request referencing the author's Git username.
2. Commits should be authored using the member's registered email.
3. At the end of the hackathon, each member must review and confirm their individual log before final project submission.
