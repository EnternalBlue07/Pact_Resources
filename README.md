# PACT

> **Proof, Authorization, Custody & Trust**  
> *Proof Before Access. Evidence After Return.*

[![Status](https://img.shields.io/badge/Status-Initial%20Setup%20Only-orange.svg)](#development-status)
[![Hackathon](https://img.shields.io/badge/Hackathon-CodeHack%20India-blue.svg)](https://codehackindia.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Important Notice: Hackathon Development Status

> [!IMPORTANT]
> **DEVELOPMENT STATUS: INITIAL SETUP & DOCUMENTATION ONLY**  
> This repository contains project governance, architectural specifications, workflow diagrams, test plans, and planning artifacts created prior to the official **CodeHack India** 48-hour build window.  
> **No functional application code, APIs, databases, authentication systems, or UI components have been pre-implemented.**  
> In accordance with hackathon rules, all functional software will be designed and implemented exclusively during the official competition build window.

---

## 1. Problem Being Addressed

Universities, research institutes, and educational organizations house valuable equipment (microscopes, oscilloscopes, 3D printers, testing kits) and specialized spaces (robotics labs, audio booths, clean rooms) that frequently sit idle or underutilized. Meanwhile, students, researchers, and junior staff struggle to access these resources due to:

1. **Fragmented, Opaque Discovery**: No unified catalog of available equipment, capabilities, and real-time status.
2. **Ambiguous Eligibility & Bureaucracy**: Lack of clear prerequisite tracking (training certifications, departmental permissions, supervisor approvals).
3. **The "Custody Void" & Fear of Damage**: Resource owners hesitate to lend expensive assets due to fears of unaccounted damage, disputes over equipment condition, or loss without clear evidence.
4. **Unfair Monopolization**: Powerful labs or senior individuals hoard resources without fair limits, waitlists, or explainable allocation rules.
5. **No Auditable Accountability**: Reliance on paper sign-in sheets or informal emails that leave no verifiable record when disputes, delays, or safety incidents occur.

For complete context, see [docs/PROBLEM_STATEMENT.md](docs/PROBLEM_STATEMENT.md).

---

## 2. Proposed Solution: PACT

**PACT (Proof, Authorization, Custody & Trust)** is an open, security-first resource-sharing platform engineered for institutional campuses. PACT transforms resource lending from an informal risk into a trusted, auditable contract between resource owners and borrowers through a complete 10-step lifecycle:

```
[Listing & Search] ➔ [Eligibility Verification] ➔ [Request & Allocation]
         ➔ [Approval / Waitlist] ➔ [Dual Check-In & Evidence] ➔ [Active Custody]
         ➔ [Check-Out & Return Evidence] ➔ [Incident / Damage Resolution] ➔ [Audit Ledger]
```

---

## 3. Planned Key Differentiators

The following differentiators represent our planned technical innovations for the hackathon build window:

*   **Trust Capsule**: A structured, transaction-level record binding every authorization decision, handover handshake, condition photograph, and return inspection into a tamper-evident hash chain.
*   **Zero-Trust Access Gate**: Resource-specific gatekeeper validating real-time eligibility (prerequisite certifications, departmental roles, safety verifications) before any booking can proceed.
*   **Fair Access Engine**: An explainable, rule-based scheduling engine enforcing usage quotas, cool-down periods, priority scoring, and transparent waitlist progression to prevent resource hoarding.
*   **Trust Replay**: An intuitive, auditable transaction timeline rendering the entire custody history of a resource for owners, department chairs, and compliance auditors.
*   **Security Arena**: A controlled diagnostic testing suite used to simulate and verify defenses against double-booking races, expired token replays, unauthorized privilege escalation, and evidence tampering.

*(Note: These are planned technical capabilities to be built during the 48-hour hackathon, not pre-existing features.)*

---

## 4. Planned Technology Stack (Provisional)

> [!NOTE]
> All technological selections below are **provisional proposals** developed for team alignment. Final adoption will be validated during the initial milestone of the hackathon build window.

| Component | Proposed Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + TypeScript + Tailwind CSS | Rapid prototyping, type safety, responsive design, component modularity |
| **Backend** | Python + FastAPI | High-performance asynchronous execution, automatic OpenAPI documentation, clean data validation |
| **Database** | PostgreSQL (with SQLAlchemy 2.0 / Alembic) | Robust ACID relational integrity for bookings, state transitions, and audit records; SQLite local fallback |
| **Integrity & Security**| Cryptographic Hashing (SHA-256) + JWT | Tamper-evident ledger chaining and single-use, time-bound handover tokens |
| **Testing** | Pytest (Backend) + Vitest / Playwright (Frontend) | Automated verification of positive flows, negative security boundary checks, and race conditions |

---

## 5. Repository Structure

```
pact-resource-trust/
├── README.md                      # Project manifesto, status, and overview
├── LICENSE                        # MIT License
├── .gitignore                     # Git ignore rules for node, python, secrets, databases
├── .editorconfig                  # Formatting and encoding conventions
├── .env.example                   # Environment configuration template (zero secrets)
├── CONTRIBUTING.md                # Collaboration, branching, and pull request guidelines
├── SECURITY.md                    # Vulnerability reporting and security standards
├── CHANGELOG.md                   # Chronological project history
├── docs/                          # Architectural & specification documentation
│   ├── PROJECT_OVERVIEW.md        # Institutional context, personas, and boundary definitions
│   ├── PROBLEM_STATEMENT.md       # Official CodeHack India requirements & lifecycle
│   ├── REQUIREMENTS.md            # Prioritized P0/P1/P2 specifications with acceptance criteria
│   ├── PRODUCT_WORKFLOW.md        # State transitions, normal and exception lifecycles
│   ├── ARCHITECTURE.md            # Proposed system diagrams and component architecture
│   ├── DATA_MODEL.md              # Conceptual database entities and relationships
│   ├── API_CONTRACTS.md           # Draft REST API interfaces for parallel development
│   ├── SECURITY_MODEL.md          # Zero-trust controls, tokens, and audit integrity
│   ├── FAIRNESS_AND_ACCESSIBILITY.md # Quotas, explainable waitlists, and UX accessibility
│   ├── TEST_PLAN.md               # Test matrix of planned positive and negative tests
│   ├── DEPLOYMENT.md              # Hosting strategy and deployment checklist
│   ├── KNOWN_LIMITATIONS.md       # Explicit scope boundaries of the 48-hour prototype
│   ├── FUTURE_SCOPE.md            # Post-hackathon institutional roadmap
│   ├── TEAM_CONTRIBUTIONS.md      # Team member roles, task ledger, and verification
│   ├── TECHNOLOGY_DISCLOSURE.md   # Attribution for tools, libraries, APIs, and AI usage
│   ├── JUDGING_SCORECARD.md       # Mapping of features to the 100-point judging rubric
│   └── SUBMISSION_CHECKLIST.md    # Pre-submission verification checklist
├── planning/                      # Sprint planning and project management
│   ├── TEAM_TASK_BOARD.md         # Prioritized task board across 4 workstreams
│   ├── MILESTONES.md              # 48-hour sprint milestone timeline
│   ├── DECISIONS.md               # Architecture Decision Records (ADRs)
│   └── DEMO_SCRIPT.md             # Judge demonstration narrative and walkthrough
├── frontend/                      # Frontend application package (to be built)
│   └── README.md                  # Frontend setup guide and component standards
├── backend/                       # Backend service package (to be built)
│   └── README.md                  # Backend setup guide and API structure
├── tests/                         # End-to-end and integration test suite (to be built)
│   └── README.md                  # Test running guide and fixture notes
└── .github/                       # GitHub workflow and issue templates
    ├── ISSUE_TEMPLATE/
    │   └── task.md                # Task issue template
    └── pull_request_template.md   # Standard pull request checklist
```

---

## 6. Team Collaboration & Roles

PACT is being developed by a 4-member student team for CodeHack India:

| Member | Provisional Workstream | Primary Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | Frontend & Integration | React UI, state management, handover UX, Trust Replay visualizer |
| **Member 2** | Backend & Database | FastAPI REST APIs, PostgreSQL schema, state machine transitions, booking validation |
| **Member 3** | Security & Audit Integrity | Zero-Trust Access Gate, token signing/verification, Trust Capsule hash chaining |
| **Member 4** | Lifecycle, Incidents & QA | Return inspections, incident workflow, automated test suite, demo orchestration |

*(Individual names and confirmed responsibilities will be recorded in [docs/TEAM_CONTRIBUTIONS.md](docs/TEAM_CONTRIBUTIONS.md) upon team onboarding).*

---

## 7. Next Steps: Hackathon Build Phase

When the official CodeHack India build window commences, implementation will proceed according to [planning/MILESTONES.md](planning/MILESTONES.md):
1. **Hour 0–4**: Team alignment on API contracts ([docs/API_CONTRACTS.md](docs/API_CONTRACTS.md)) and database schema ([docs/DATA_MODEL.md](docs/DATA_MODEL.md)).
2. **Hour 4–24**: Implementation of P0 core end-to-end lifecycle (Listing ➔ Booking ➔ Handover ➔ Return).
3. **Hour 24–36**: Implementation of P1 Trust Capsule hash chains, Fair Access rules, and incident handling.
4. **Hour 36–44**: Automated test execution, security regression testing, and bug fixing.
5. **Hour 44–48**: Deployment, live verification, video demo recording, and submission.
