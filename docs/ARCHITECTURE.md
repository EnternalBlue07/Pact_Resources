# PACT: Proposed System Architecture

> [!NOTE]
> **PROPOSED ARCHITECTURE SPECIFICATION**  
> All technology selections and architectural designs in this document represent the **provisional technical proposal** for the CodeHack India 48-hour build window. These choices will be confirmed by the team during sprint milestone 0 before functional coding commences.

---

## 1. High-Level Architectural Diagram

PACT follows a modern, decoupled client-server architecture designed for high developer velocity, strict type safety, and verifiable data integrity.

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|  React (Vite) + TypeScript + Tailwind CSS                                              |
|                                                                                       |
|  [Requester Portal]    [Custodian Console]    [Admin Suite]    [Trust Replay & Arena]  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTPS / JSON REST API
                                            v
+---------------------------------------------------------------------------------------+
|                                  API GATEWAY TIER                                     |
|  FastAPI (Python 3.11+)                                                               |
|                                                                                       |
|  - CORS & Request Validation (Pydantic V2)                                            |
|  - JWT Bearer Authentication & Institutional Role Verification                         |
|  - Rate Limiting & Audit Middleware                                                   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                 CORE SERVICES TIER                                    |
|                                                                                       |
|  +-----------------------+  +-----------------------+  +---------------------------+  |
|  | Resource & Catalog    |  | Zero-Trust Gate       |  | Booking State Engine      |  |
|  | Service               |  | (Eligibility Rules)   |  | (Transitions & Overlaps)  |  |
|  +-----------------------+  +-----------------------+  +---------------------------+  |
|  +-----------------------+  +-----------------------+  +---------------------------+  |
|  | Dual-Ack Handover     |  | Fair Access Engine    |  | Trust Capsule             |  |
|  | (Token Management)    |  | (Quotas & Waitlists)  |  | (SHA-256 Hash Chain)      |  |
|  +-----------------------+  +-----------------------+  +---------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                              PERSISTENCE & STORAGE TIER                               |
|                                                                                       |
|  +-----------------------------------------+  +------------------------------------+  |
|  | PostgreSQL (Relational Engine)          |  | Local / Cloud Object Storage       |  |
|  | - Users, Roles, Resources, Bookings    |  | - Pre/Post Condition Photographs   |  |
|  | - Waitlists, Incidents, Hash Ledger     |  | - Inspection Document Evidence     |  |
|  +-----------------------------------------+  +------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack Evaluation (Provisional)

| Layer | Proposed Technology | Justification | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React (Vite) + TypeScript** | Instant HMR, robust ecosystem, high type safety across shared API contracts. | Next.js (higher setup overhead for a 48h build), Vue. |
| **Styling** | **Tailwind CSS** | Rapid UI development, accessible component styling, dark mode support. | Vanilla CSS (slower prototyping), CSS Modules. |
| **Backend Framework**| **FastAPI (Python)** | Asynchronous execution, automatic interactive Swagger/OpenAPI docs, built-in Pydantic validation. | Express/Node.js, Django (heavier, slower to customize). |
| **Database** | **PostgreSQL** (via SQLAlchemy 2.0) | Relational constraints prevent double-booking; robust ACID transactions; SQLite fallback for local offline dev. | MongoDB (lacks native transactional ACID isolation for bookings). |
| **Authentication** | **JWT (JSON Web Tokens)** | Stateless authentication with role-based claims (Requester, Custodian, Admin, Auditor). | Session cookies, OAuth2 external providers (complex setup). |
| **Integrity Engine** | **Cryptographic SHA-256 Chaining** | Provides tamper-evident audit logging without external public blockchain costs or latency. | Public Web3/Smart Contracts (unnecessary cost and complexity). |
| **Source Control** | **Git & GitHub** | Distributed collaboration, feature branching, pull request reviews, automated CI checks. | GitLab, Bitbucket. |

---

## 3. Subsystem Breakdown & Component Responsibilities

### 3.1. Frontend Architecture (`frontend/`)
- **`src/components/`**: Reusable atomic UI elements (Buttons, Badges, Modals, Timeline, Forms).
- **`src/pages/`**:
  - `CatalogPage.tsx`: Searchable resource catalog with faceted filters.
  - `ResourceDetailPage.tsx`: Resource specs, availability calendar, and eligibility banner.
  - `BookingRequestModal.tsx`: Slot picker and research justification form.
  - `CustodianDashboard.tsx`: Requests review, handover verification, and return inspection.
  - `HandoverModal.tsx`: Token generator for requester and scanner/entry form for custodian.
  - `IncidentConsole.tsx`: Discrepancy flagging and administrator arbitration view.
  - `TrustReplayTimeline.tsx`: Visual audit explorer rendering the tamper-evident hash ledger.
  - `SecurityArena.tsx`: Interactive test harness running security scenario demonstrations.
- **`src/api/`**: Strongly typed API client mapped directly to backend OpenAPI schema.

### 3.2. Backend Services (`backend/`)
- **`api/v1/endpoints/`**:
  - `/auth`: Login, profile lookup, and role claims.
  - `/resources`: Resource CRUD, eligibility requirements definition, catalog search.
  - `/bookings`: Creation, approval, rejection, state transitions, waitlist management.
  - `/handovers`: Token generation, dual-acknowledgement verification, check-in completion.
  - `/returns`: Return condition inspection, photographic evidence upload, checkout completion.
  - `/incidents`: Discrepancy reporting, photo attachments, administrator resolution.
  - `/audit`: Trust Capsule block exploration and SHA-256 chain verification endpoint.
  - `/security-arena`: Test endpoints for simulating attack vectors and verification.
- **`core/security.py`**: Password hashing, JWT token generation, role verification dependencies.
- **`services/trust_capsule.py`**: Hash calculation, block serialization, and audit ledger integrity verification.
- **`services/fair_access.py`**: Quota calculations, cooldown evaluation, and waitlist prioritization.

---

## 4. Architectural Non-Functional Goals

1. **Deterministic Concurrency**: All booking state updates are wrapped in database transactions using serializable or row-level locking (`SELECT ... FOR UPDATE`) to guarantee zero double-bookings under concurrent requests.
2. **Tamper-Evident Traceability**: Every critical event produces an immutable cryptographic block containing the previous block's SHA-256 hash. If any database record is manipulated directly, the verification endpoint immediately flags the corrupted link.
3. **Responsive & Accessible Design**: Frontend target WCAG 2.1 AA compliance with mobile and desktop support.
4. **Resilience to Network Glitches**: Graceful error banners and optimistic UI locking to prevent duplicate form submissions.
