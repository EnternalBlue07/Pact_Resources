# PACT: Permanent Engineering Decision Register (ADR)

> **Repository**: https://github.com/EnternalBlue07/Pact_Resources  
> **Standard**: Every architectural, security, data-model, or workflow decision is recorded here.

---

## Decision Index

| ID | Title | Status | Date | Scope |
| :--- | :--- | :---: | :---: | :--- |
| **DEC-001** | Client-Server Architecture: React + TypeScript Frontend with FastAPI Backend | **Accepted** | 2026-10-28 | Architecture |
| **DEC-002** | Relational Database & Concurrency Lock Strategy for Booking Overlaps | **Accepted** | 2026-10-28 | Data Model & Concurrency |
| **DEC-003** | Stateless JWT Authentication with Server-Enforced RBAC | **Accepted** | 2026-10-28 | Security & Auth |
| **DEC-004** | Cryptographic SHA-256 Hash Chaining (Trust Capsule) vs. Blockchain | **Accepted** | 2026-10-28 | Audit & Integrity |
| **DEC-005** | Single-Use, Ephemeral (15-Minute) Handover Tokens for Custody Check-In | **Accepted** | 2026-10-28 | Security & Custody |
| **DEC-006** | Side-by-Side Photographic Condition Evidence & Mandatory Human Adjudication | **Accepted** | 2026-10-28 | Incident Resolution |
| **DEC-007** | Fair Access Engine: Concurrency Quota Limits & Algorithmic Waitlists | **Accepted** | 2026-10-28 | Anti-Hoarding & Fairness |
| **DEC-008** | Controlled In-App Security Arena for Live Judge Attack Simulation | **Accepted** | 2026-10-28 | Testing & Verification |

---

### DEC-001: Client-Server Architecture (React + TypeScript + FastAPI)
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: CodeHack India is a 48-hour build with a 4-member student team. We need rapid frontend iteration, type safety, auto-generated API contracts, and high async performance.
- **Decision**: Decouple the frontend (React 18+, Vite, TypeScript, Tailwind CSS) from the backend (Python 3.12, FastAPI, Uvicorn, Pydantic V2).
- **Alternatives Considered**:
  - *Next.js full-stack*: Good, but Python has superior native libraries for cryptographic hash handling, image processing, and data verification.
  - *Django*: Slower to configure, heavy ORM overhead, less suited for clean OpenAPI-first JSON micro-endpoints.
- **Rationale**: FastAPI auto-generates interactive Swagger documentation at `/docs`, enabling frontend and backend teammates to work concurrently against frozen API schemas.
- **Consequences & Trade-offs**: Requires running two local servers in development (Vite on port 5173, FastAPI on port 8000). CORS middleware required.
- **Security & Privacy**: Strict separation of concerns; backend validates all client requests independently.
- **Verification**: `curl http://127.0.0.1:8000/health` returns HTTP 200 OK; frontend hot-reloads without TypeScript errors.
- **Reversal Conditions**: If team members are solely experienced in Node/Express and cannot support Python async APIs.

---

### DEC-002: Relational Database & Concurrency Lock Strategy
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: High-demand campus equipment experiences race conditions where multiple students click "Book" simultaneously for the same time window. Naive calendar apps create double-bookings.
- **Decision**: Use a relational database (PostgreSQL for production; SQLite fallback for local development) with database-level isolation. Queries evaluate:
  `WHERE resource_id = :id AND status IN ('APPROVED', 'CHECKED_OUT') AND NOT (end_time <= :new_start OR start_time >= :new_end)`
  Concurrent submissions run with row-level locks (`SELECT ... FOR UPDATE`) or serializable transactions.
- **Alternatives Considered**:
  - *MongoDB*: Document stores lack native relational overlap indexing and transaction isolation without complex multi-document transaction configuration.
- **Rationale**: Guarantees zero double-booking at the database layer; impossible to bypass via API tampering.
- **Consequences & Trade-offs**: Requires structured migration files (SQLAlchemy 2.0 / Alembic).
- **Security & Privacy**: Prevents denial-of-service through resource slot exhaustion.
- **Verification**: Automated concurrent integration test in `tests/test_booking_state.py` attempts simultaneous bookings and verifies exactly one returns 201 and the other returns 409 Conflict.
- **Reversal Conditions**: None; relational ACID guarantees are strictly necessary for physical asset reservations.

---

### DEC-003: Stateless JWT Authentication with Server-Enforced RBAC
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: We need role enforcement across Requesters, Custodians, Administrators, and Auditors without maintaining heavy server-side session stores.
- **Decision**: Issue signed JSON Web Tokens (JWT) containing user ID, institutional email, and role scope claims (`REQUESTER`, `CUSTODIAN`, `ADMINISTRATOR`, `AUDITOR`). All backend routes enforce roles via FastAPI dependency injection (`Depends(require_role(...))`).
- **Alternatives Considered**:
  - *Session cookies with Redis*: Adds operational Redis dependency unnecessary for a 48-hour prototype.
  - *Client-side only role checks*: Catastrophic security vulnerability; users can forge requests.
- **Rationale**: Simple, stateless, cryptographically signed with HMAC-SHA256 (`JWT_SECRET_KEY`).
- **Consequences & Trade-offs**: Tokens cannot be revoked before expiry without a token blacklist. Mitigation: short expiration (60 minutes).
- **Security & Privacy**: Passwords hashed using bcrypt/argon2; tokens transmitted via `Authorization: Bearer` header over HTTPS.
- **Verification**: Pytest test verifies calling custodian approval endpoint with a requester JWT returns `403 Forbidden`.
- **Reversal Conditions**: If institutional campus SAML/OAuth2 SSO is integrated during future phases.

---

### DEC-004: Cryptographic SHA-256 Hash Chaining (Trust Capsule) vs. Blockchain
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: Hackathon problem requires auditable, tamper-evident history. Many teams default to Web3 public blockchains, which introduce gas costs, transaction latency (15–60s), and complex wallet onboarding that frequently breaks during live judging.
- **Decision**: Implement an internal **cryptographic SHA-256 hash chain (Trust Capsule)**. Every state change (Booking, Approval, Handover, Return, Incident) stores `prev_hash` and `entry_hash = SHA256(prev_hash + timestamp + canonical_json(payload))`.
- **Alternatives Considered**:
  - *Ethereum / Polygon Smart Contracts*: Gas fees, wallet setup for judges, latency, brittle RPC nodes.
  - *Plain database logging*: Zero tamper-evidence; anyone with SQL access can silently rewrite history.
- **Rationale**: Instant execution (<2ms), zero cost, zero wallet friction for evaluators, and irrefutable tamper-evidence: any database mutation breaks the verification endpoint (`/api/v1/audit/verify-chain`).
- **Consequences & Trade-offs**: Tamper-evident, NOT absolute tamper-proof. An attacker with full root SQL access could rewrite history and recompute hashes forward. (Disclosed truthfully in [SECURITY.md](SECURITY.md)).
- **Security & Privacy**: Payload JSON is canonicalized (sorted keys) before hashing to ensure deterministic hash generation.
- **Verification**: Dedicated test intentionally mutates a condition report payload in the database and verifies `/audit/verify-chain` reports `INTEGRITY_BREACH_DETECTED`.
- **Reversal Conditions**: If campus consortium requires cross-university decentralized federation across independent nodes.

---

### DEC-005: Single-Use, Ephemeral (15-Minute) Handover Tokens
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: In physical campus labs, requesters and custodians must physically meet to transfer equipment. Reusable check-in codes or static QR codes invite token sharing, theft, and replay attacks.
- **Decision**: Handover tokens are ephemeral 6-digit cryptographic codes generated on-demand by the borrower, valid for exactly 15 minutes. Upon successful custodian verification, `is_spent` is immediately set to `True` in the database.
- **Alternatives Considered**:
  - *Static QR codes*: Vulnerable to screenshots and unauthorized checkouts.
  - *GPS Geofencing*: Inaccurate inside multi-story concrete academic buildings.
- **Rationale**: Eliminates replay attacks; guarantees borrower and custodian are physically present at the handover window.
- **Consequences & Trade-offs**: Requester must regenerate token if they arrive more than 15 minutes late.
- **Security & Privacy**: Plaintext token is only held in memory; database stores hashed token.
- **Verification**: Test attempts submitting the same token twice and asserts the second attempt returns `400 Bad Request: Token already spent`.
- **Reversal Conditions**: If smart IoT NFC locker kiosks are introduced that handle checkouts automatically.

---

### DEC-006: Side-by-Side Photographic Evidence & Human Review
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: Equipment damage disputes degenerate into "he-said-she-said" arguments without verifiable condition records.
- **Decision**: Require baseline photographic uploads and checklist sign-off at pre-use check-in, and return inspection photos at checkout. All damage flags trigger human administrative review rather than automated student penalties.
- **Alternatives Considered**:
  - *Automated AI computer vision damage detection*: High false-positive rate, prone to hallucinations, impossible to train reliably within a 48-hour hackathon.
  - *Text-only checklists*: Easily forged or neglected without visual proof.
- **Rationale**: Empowers human lab directors with concrete before/after visual proof, protecting students from unfair blame for pre-existing scratches.
- **Consequences & Trade-offs**: Requires file storage for photo uploads (local file storage for prototype; S3/GCS in cloud).
- **Security & Privacy**: Photos stored with non-guessable UUIDs; access restricted to booking participants, custodians, and auditors.
- **Verification**: Admin incident console renders pre-use and post-use photos side-by-side with zoom and inspection notes.
- **Reversal Conditions**: Post-hackathon adoption of fine-tuned visual defect detection models as an assistant tool for the human reviewer.

---

### DEC-007: Fair Access Engine (Concurrency Caps & Waitlists)
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: Senior researchers or influential students hoard 3D printers and oscilloscopes, locking out junior students.
- **Decision**: Enforce hard concurrency limits (maximum 2 concurrent active/approved bookings per student) and mandatory cooldown windows. When a resource is booked, requesters can join an automated waitlist that promotes candidate #1 upon cancellation or no-show.
- **Alternatives Considered**:
  - *First-come first-served with no limits*: Results in resource monopolization.
  - *Monetary bidding / rental fees*: Incompatible with public university educational equity goals.
- **Rationale**: Equitable, explainable, and transparent campus resource distribution.
- **Consequences & Trade-offs**: Students with urgent capstone deadlines must request administrative quota overrides for special exemptions.
- **Security & Privacy**: Fair access limits enforced server-side; client UI displays explainable reason banners.
- **Verification**: Attempting a 3rd concurrent booking returns `422 Unprocessable Entity: Booking quota exceeded`.
- **Reversal Conditions**: If an institution defines department-specific custom quota weighting.

---

### DEC-008: Controlled In-App Security Arena for Live Judge Evaluation
- **Status**: Accepted
- **Date**: 2026-10-28
- **Context**: Hackathon judges evaluate security and reliability, but rarely have time to craft complex HTTP attack scripts or inspect raw database tables.
- **Decision**: Build an interactive **Security Arena** tab into the live web UI that allows judges to trigger simulated red-team attacks (Token Replay, Double-Booking Race, Privilege Escalation, Audit Tampering) with one click and observe live server defense responses.
- **Alternatives Considered**:
  - *Terminal-only test logs*: Less compelling and harder to verify during quick demo pitches.
- **Rationale**: Directly addresses Judging Category 4 (Technical Depth) and Category 5 (Trust & Safety), making architectural rigor undeniable.
- **Consequences & Trade-offs**: Requires dedicated mock attack dispatch endpoints protected from abuse in production mode.
- **Security & Privacy**: Attack simulation endpoints run in isolated test sandboxes and cannot corrupt production bookings.
- **Verification**: Navigating to `/security-arena` and clicking "Simulate Replay Attack" triggers an API call and renders the HTTP 400 rejection in real-time.
- **Reversal Conditions**: None; high-value differentiator for competitive evaluation.

