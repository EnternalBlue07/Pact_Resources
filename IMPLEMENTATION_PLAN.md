# PACT: Implementation Roadmap & Execution Ledger

> **Repository**: https://github.com/EnternalBlue07/Pact_Resources  
> **Rule**: No task is marked Complete until its acceptance criteria have been implemented and verified. Prioritize one demonstrably working transaction over many unfinished modules.

---

## 1. P0 Tasks — Mandatory (End-to-End Core Lifecycle)

The core lifecycle works end-to-end: Owner creates resource ➔ Borrower discovers it ➔ Borrower submits booking ➔ Backend verifies eligibility & availability ➔ Owner approves ➔ Dual-ack check-in ➔ Active custody ➔ Return inspection ➔ Clean close.

| Task ID | Feature & Outcome | Dependencies | Expected Files / Components | Acceptance Criteria | Testing Requirements | Status | Known Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **TSK-P0-01** | **Backend Scaffolding & Health API** | Python 3.12 | `backend/app/main.py`, `backend/app/core/config.py` | FastAPI app starts cleanly; `GET /health` returns `{status: "ok"}` with HTTP 200. | `tests/test_health.py` passes via pytest. | **Complete** | None. |
| **TSK-P0-02** | **Relational Data Models & DB Engine** | TSK-P0-01 | `backend/app/models/`, `backend/app/core/database.py` | SQLAlchemy models for Users, Resources, Qualifications, Bookings, Handovers, ConditionReports. SQLite/Postgres tables initialize without error. | Model instantiation and relationship tests pass. | **Complete** | SQLite foreign key constraint enforcement in dev. |
| **TSK-P0-03** | **Resource Catalog & Filtering API** | TSK-P0-02 | `backend/app/api/v1/resources.py` | `GET /api/v1/resources` returns paginated list filtered by category, status, and search query. `POST /api/v1/resources` creates new asset with custodian association. | `test_catalog_discovery` passes. | **Complete** | Complex multi-parameter search query performance. |
| **TSK-P0-04** | **Zero-Trust Eligibility Gate** | TSK-P0-02 | `backend/app/services/access_gate.py`, `backend/app/api/v1/resources.py` | `GET /api/v1/resources/{id}/eligibility` evaluates user qualifications against resource requirements; returns boolean + plain-language explanation. | `test_zero_trust_eligibility_gate` passes. | **Complete** | Outdated or expired student certification records. |
| **TSK-P0-05** | **Booking Request & Concurrency Lock** | TSK-P0-03, TSK-P0-04 | `backend/app/api/v1/bookings.py` | `POST /api/v1/bookings` validates eligibility and locks time slot. Overlapping requests return `409 Conflict`. Active quota limit (max 2) enforced. | Overlapping booking conflict test passes. | **Complete** | Timezone parsing mismatches between frontend UTC and local time. |
| **TSK-P0-06** | **Custodian Approval & Decision Workflow** | TSK-P0-05 | `backend/app/api/v1/bookings.py` | Custodian can approve, reject (with mandatory note), or request info. Status transitions to `APPROVED` or `REJECTED`. | Approval and rejection workflow tests pass. | **Complete** | Requesters attempting to approve their own requests. |
| **TSK-P0-07** | **Dual-Ack Handover Handshake** | TSK-P0-06 | `backend/app/api/v1/handovers.py` | Borrower generates 15-min token. Custodian enters token + baseline condition notes. Token marked `is_spent=True`. State becomes `CHECKED_OUT`. | Token expiry and replay tests fail with 400. | **Complete** | Clock drift between client and server. |
| **TSK-P0-08** | **Return Inspection & Clean Close** | TSK-P0-07 | `backend/app/api/v1/returns.py` | Custodian conducts physical return inspection, submits return checklist + notes. If clean, state transitions `RETURNED ➔ CLOSED`; resource status set to `AVAILABLE`. | Clean return test verifies resource availability restored. | **Complete** | Unreturned items lingering indefinitely without overdue alert. |
| **TSK-P0-09** | **React Frontend Scaffolding & Theme** | Node.js | `frontend/src/App.tsx`, `frontend/src/index.css` | Vite + React + Tailwind dev server launches cleanly; accessible navigation bar and responsive layout. | `npm run build` exits 0 without TypeScript errors. | **Not Started** | CSS layout shifts on small mobile viewports. |
| **TSK-P0-10** | **Frontend Core Lifecycle Views** | TSK-P0-09, TSK-P0-03..08 | `frontend/src/pages/Catalog.tsx`, `Custodian.tsx`, `Handover.tsx` | Borrower can browse, check eligibility, request booking; Custodian can approve, verify token, inspect return in UI. | Manual end-to-end browser walkthrough succeeds. | **Not Started** | State synchronization lag between separate browser tabs. |

---

## 2. P1 Tasks — High-Value Trust, Security & Audit

| Task ID | Feature & Outcome | Dependencies | Expected Files / Components | Acceptance Criteria | Testing Requirements | Status | Known Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **TSK-P1-01** | **Trust Capsule Cryptographic Hash Chain** | TSK-P0-05..08 | `backend/app/services/trust_capsule.py`, `backend/app/api/v1/audit.py` | Every state transition generates a block with `prev_hash` and SHA-256 entry hash. `GET /api/v1/audit/verify-chain` verifies continuity. | `test_trust_capsule_tamper_detection` flags corrupted blocks. | **Complete** | Non-deterministic JSON key serialization altering hashes. |
| **TSK-P1-02** | **Incident Reporting & Damage Escalation** | TSK-P0-08 | `backend/app/api/v1/incidents.py` | Custodian flags condition discrepancy at return; state transitions to `INCIDENT_OPEN`; resource marked `UNDER_MAINTENANCE`. | `test_return_with_damage_incident` passes. | **Complete** | Unclear photo uploads causing false disputes. |
| **TSK-P1-03** | **Administrator Incident Arbitration** | TSK-P1-02 | `backend/app/api/v1/returns.py` | Admin reviews pre-use vs post-use evidence; resolves as `RESOLVED_WAIVED` or `RESOLVED_PENALTY`; seals block in Trust Capsule; restores asset availability. | `test_incident_resolution_lifecycle` passes. | **Complete** | Biased arbitration without documented rationale. |
| **TSK-P1-04** | **Fair Access Quota & Automated Waitlists** | TSK-P0-05 | `backend/app/services/fair_access.py` | Requesters capped at 2 active bookings; waitlisted candidates automatically promoted upon cancellation. | Unit tests for quota calculation and waitlist promotion. | **Not Started** | Race condition during automated waitlist candidate promotion. |
| **TSK-P1-05** | **Trust Replay Audit Timeline UI** | TSK-P1-01 | `frontend/src/pages/TrustReplay.tsx` | Chronological interactive timeline rendering audit events with actor names, timestamps, and cryptographic seals. | UI renders complete lifecycle blocks for completed booking. | **Not Started** | Large audit timelines causing slow DOM rendering. |

---

## 3. P2 Tasks — Differentiators & Polish

| Task ID | Feature & Outcome | Dependencies | Expected Files / Components | Acceptance Criteria | Testing Requirements | Status | Known Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **TSK-P2-01** | **Security Arena In-App Diagnostic Suite** | TSK-P1-01, TSK-P0-07 | `frontend/src/pages/SecurityArena.tsx`, `backend/app/api/v1/security_arena.py` | Interactive dashboard allowing judges to simulate token replay, double booking race, privilege escalation, and audit tampering live. | One-click simulations demonstrate server-side defensive rejections. | **Not Started** | Diagnostic endpoints executing against production database. |
| **TSK-P2-02** | **Trust Graph Relationship Visualization** | TSK-P1-01 | `frontend/src/components/TrustGraph.tsx` | Visual node-link diagram connecting Resource ➔ Policy ➔ Request ➔ Approval ➔ Handover ➔ Evidence ➔ Capsule. | Node selection highlights connected transaction entities. | **Not Started** | Graph library bundle size overhead. |
| **TSK-P2-03** | **One-Click Demo Environment Seeder** | TSK-P0-02 | `backend/app/scripts/seed_demo.py` | Single command seeds 4 users, 6 resources, 3 bookings across various lifecycle stages, and 1 flagged incident. | `python -m backend.app.scripts.seed_demo` runs without errors. | **Complete** | Duplicate seed executions creating duplicate primary keys. |
