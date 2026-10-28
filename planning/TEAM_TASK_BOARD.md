# PACT: Team Task Board

> [!IMPORTANT]
> **GOVERNANCE RULE: CONTRACT ALIGNMENT BEFORE PARALLEL IMPLEMENTATION**  
> Before frontend (Member 1) and backend (Members 2, 3, 4) begin independent coding, all four members must formally agree on the shared API contracts defined in [docs/API_CONTRACTS.md](../docs/API_CONTRACTS.md) and the booking state machine transitions in [docs/PRODUCT_WORKFLOW.md](../docs/PRODUCT_WORKFLOW.md).  
> **Initial Status**: All tasks are marked **PLANNED**. No code has been executed.

---

## 1. Sprint Task Board (4-Member Team)

| Task ID | Description | Priority | Owner | Dependencies | Acceptance Criteria | Status |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| **TSK-ARC-01** | **API Contract & Schema Sign-Off** | **P0** | All Members | None | Unanimous agreement on endpoints and JSON payloads in `API_CONTRACTS.md`. | **PLANNED** |
| **TSK-BE-01** | **FastAPI Scaffolding & Config** | **P0** | Member 2 | TSK-ARC-01 | FastAPI app runs locally, loads `.env`, serves interactive Swagger docs at `/docs`. | **PLANNED** |
| **TSK-BE-02** | **PostgreSQL Database Models** | **P0** | Member 2 | TSK-BE-01 | SQLAlchemy models for Users, Resources, Bookings, Tokens, and Incidents created. | **PLANNED** |
| **TSK-BE-03** | **Resource Catalog & Search Endpoints** | **P0** | Member 2 | TSK-BE-02 | `GET /resources` and `POST /resources` functional with category/status filters. | **PLANNED** |
| **TSK-BE-04** | **Booking Lifecycle & Concurrency Lock** | **P0** | Member 2 | TSK-BE-02 | Booking state transitions enforced; double-booking requests return 409 Conflict. | **PLANNED** |
| **TSK-SEC-01** | **JWT Authentication & RBAC Middleware** | **P0** | Member 3 | TSK-BE-01 | Endpoints enforce user authentication and role scopes (`REQUESTER`, `CUSTODIAN`, `ADMIN`). | **PLANNED** |
| **TSK-SEC-02** | **Zero-Trust Access Gate (Eligibility)** | **P0** | Member 3 | TSK-SEC-01 | Server checks user qualifications before accepting booking; returns 403 if missing. | **PLANNED** |
| **TSK-SEC-03** | **Single-Use Handover Token Engine** | **P0** | Member 3 | TSK-BE-04 | 15-min token generation; validation sets `spent=True`; replay attempts rejected. | **PLANNED** |
| **TSK-SEC-04** | **Trust Capsule SHA-256 Hash Chaining** | **P1** | Member 3 | TSK-BE-04 | Lifecycle events chained via `prev_hash` & `entry_hash`; integrity validator built. | **PLANNED** |
| **TSK-LIF-01** | **Check-In & Baseline Condition Capture** | **P0** | Member 4 | TSK-SEC-03 | Custodian records baseline condition notes and photos upon valid token check-in. | **PLANNED** |
| **TSK-LIF-02** | **Return Inspection & Incident Flagging** | **P0** | Member 4 | TSK-LIF-01 | Return inspection completes clean checkout or flags incident with discrepancy photos. | **PLANNED** |
| **TSK-LIF-03** | **Incident Resolution Console Backend** | **P1** | Member 4 | TSK-LIF-02 | Admin endpoint to review incident evidence and resolve as `WAIVED` or `PENALTY`. | **PLANNED** |
| **TSK-LIF-04** | **Automated Pytest Suite (Positive & Negative)** | **P0** | Member 4 | TSK-BE-04, TSK-SEC-03 | Comprehensive automated tests covering all 22 test cases in `TEST_PLAN.md`. | **PLANNED** |
| **TSK-FE-01** | **React + Vite + Tailwind Scaffolding** | **P0** | Member 1 | TSK-ARC-01 | Clean frontend structure, theme tokens, responsive layout, accessible navigation. | **PLANNED** |
| **TSK-FE-02** | **Resource Catalog & Filtering UI** | **P0** | Member 1 | TSK-FE-01, TSK-BE-03 | Search bar, category pills, availability status badges, and resource detail modal. | **PLANNED** |
| **TSK-FE-03** | **Booking Modal & Eligibility Feedback** | **P0** | Member 1 | TSK-FE-02, TSK-SEC-02 | Date-time slot picker; plain-language banner explaining missing qualifications. | **PLANNED** |
| **TSK-FE-04** | **Custodian Management Dashboard** | **P0** | Member 1 | TSK-FE-01, TSK-BE-04 | List of pending booking requests with one-click Approve/Reject actions. | **PLANNED** |
| **TSK-FE-05** | **Handover Handshake Modal (Dual-Ack)** | **P0** | Member 1 | TSK-SEC-03, TSK-LIF-01 | Token display for student; token verification & condition form for custodian. | **PLANNED** |
| **TSK-FE-06** | **Return Inspection & Incident Flagging UI** | **P0** | Member 1 | TSK-LIF-02 | Side-by-side photographic inspection modal and damage reporting inputs. | **PLANNED** |
| **TSK-FE-07** | **Trust Replay Audit Timeline** | **P1** | Member 1 | TSK-SEC-04 | Interactive timeline rendering chronological Trust Capsule blocks with hash badges. | **PLANNED** |
| **TSK-FE-08** | **Security Arena Diagnostic Console** | **P1** | Member 1, 3 | TSK-SEC-03, TSK-SEC-04 | Interactive test harness allowing judges to simulate attacks and verify defenses live. | **PLANNED** |
| **TSK-OPS-01** | **Demo Data Seeding Script** | **P0** | Member 4 | TSK-BE-02 | One-click command or API populating realistic labs, equipment, users, and bookings. | **PLANNED** |
| **TSK-OPS-02** | **Cloud Deployment (Frontend + Backend + DB)** | **P0** | All Members | TSK-FE-01, TSK-BE-01 | Live public HTTPS deployment on Vercel/Render with verified database persistence. | **PLANNED** |
| **TSK-OPS-03** | **Demo Video Recording & Pitch Deck** | **P0** | All Members | TSK-OPS-02 | 3–5 min walkthrough recorded using `DEMO_SCRIPT.md`; final submission compiled. | **PLANNED** |

---

## 2. Priority Definitions
- **P0**: Core end-to-end functionality required to fulfill minimum hackathon judging criteria.
- **P1**: Trust, security, audit, and fairness differentiators that provide competitive excellence.
- **P2**: Polish, UI animations, and UX enhancements completed as time allows.
