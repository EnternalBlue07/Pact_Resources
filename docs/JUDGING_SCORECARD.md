# PACT: Judging Scorecard & Rubric Alignment Matrix

> [!NOTE]
> **EVALUATION ALIGNMENT MATRIX**  
> This document maps each of the **seven official CodeHack India judging categories** to our planned technical deliverables, verifiable artifacts, and live evaluation demonstrations.  
> *Note: This document provides an objective evidence map for reviewers; it does not assign self-awarded scores.*

---

## Evaluation Rubric Overview

| Category # | Judging Category | Weight | Primary Target Deliverable |
| :---: | :--- | :---: | :--- |
| **1** | Understanding of the Problem | **15 pts** | Root-cause analysis of campus custody void & underutilized assets |
| **2** | Strength of the Core Solution | **20 pts** | Complete 10-step lifecycle and dual-custody verification architecture |
| **3** | Working End-to-End Product | **20 pts** | Deployed application showing search, booking, handover, return & incidents |
| **4** | Technical Depth and Reliability | **15 pts** | Concurrency safety, automated pytest suite, clean type-safe architecture |
| **5** | Trust, Safety and Accountability | **10 pts** | Cryptographic Trust Capsule hash chaining, baseline evidence, tokens |
| **6** | Fair Allocation and Accessibility | **10 pts** | Fair Access Engine quotas, explainable waitlists, WCAG 2.1 AA UI |
| **7** | Originality and Real-World Potential | **10 pts** | Security Arena diagnostic suite, scalable institutional deployment roadmap |
| **Total** | **Official Evaluation Weight** | **100 pts** | |

---

## Detailed Category Mapping & Verification Methods

### 1. Understanding of the Problem (15 Points)
- **Official Criteria**: Depth of understanding of underutilized campus equipment/spaces, institutional friction, custody risk, and user pain points.
- **Planned Product Evidence**:
  - Comprehensive problem breakdown documented in [docs/PROBLEM_STATEMENT.md](PROBLEM_STATEMENT.md) and [docs/PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).
  - Explicit distinction between simple calendar booking vs. risk-managed physical custody contracts.
  - Identification of stakeholder personas: Requesters, Custodians, Department Heads, Compliance Auditors.
- **How Judges Can Verify**: Review project overview, problem statement, and presentation narrative illustrating the custody void.

### 2. Strength of the Core Solution (20 Points)
- **Official Criteria**: Coherence, practicality, and structural integrity of the proposed resource-sharing platform.
- **Planned Product Evidence**:
  - Full implementation of the 10-step resource lifecycle ([docs/PRODUCT_WORKFLOW.md](PRODUCT_WORKFLOW.md)).
  - Clean separation between catalog discovery, eligibility verification, state transitions, and audit records.
  - Pragmatic balance between security rigor and fast student checkout workflows.
- **How Judges Can Verify**: Step through the complete lifecycle from catalog creation to final return on the live application.

### 3. Working End-to-End Product (20 Points)
- **Official Criteria**: Live functional application operating without breaking errors across major workflows.
- **Planned Product Evidence**:
  - Publicly accessible deployed web application (Frontend on Vercel/Render, Backend on Render/Fly.io, PostgreSQL on Neon).
  - Pre-seeded realistic demo data (4 users, 6 pieces of equipment/spaces, historical bookings, active incident).
  - Zero broken routes or unhandled API exceptions during live judge walkthrough.
- **How Judges Can Verify**: Log into pre-configured judge accounts and perform live booking, approval, handover handshake, and return.

### 4. Technical Depth and Reliability (15 Points)
- **Official Criteria**: Code quality, architectural patterns, data integrity, error resilience, and automated testing.
- **Planned Product Evidence**:
  - Decoupled FastAPI backend and React TypeScript frontend with strict typing and Pydantic validation.
  - Relational database ACID isolation preventing double-booking races under concurrent submissions.
  - Comprehensive automated test suite ([docs/TEST_PLAN.md](TEST_PLAN.md)) with positive and negative test cases.
- **How Judges Can Verify**: Inspect clean GitHub repository structure and run automated tests via `pytest`.

### 5. Trust, Safety and Accountability (10 Points)
- **Official Criteria**: Strength of custody tracking, before/after evidence capture, tamper-evident logging, and security boundaries.
- **Planned Product Evidence**:
  - **Trust Capsule**: Cryptographic SHA-256 hash chaining linking each state change to the previous block.
  - Short-lived, single-use handover tokens preventing unauthorized equipment release.
  - Side-by-side photographic condition evidence comparison modal.
  - Transparent disclosure of tamper-evident vs. tamper-proof guarantees ([docs/SECURITY_MODEL.md](SECURITY_MODEL.md)).
- **How Judges Can Verify**: View Trust Replay timeline and trigger the `/api/v1/audit/verify-chain` endpoint to observe cryptographic validation.

### 6. Fair Allocation and Accessibility (10 Points)
- **Official Criteria**: Anti-monopolization quotas, transparent waitlists, explainable decisions, and digital accessibility.
- **Planned Product Evidence**:
  - Fair Access Engine enforcing active booking limits and mandatory cooldown periods ([docs/FAIRNESS_AND_ACCESSIBILITY.md](FAIRNESS_AND_ACCESSIBILITY.md)).
  - Automated waitlist with clear queue position tracking.
  - Human-friendly explainable decision banners instead of cryptic error codes.
  - WCAG 2.1 AA compliant color contrast, semantic HTML, and full keyboard navigability.
- **How Judges Can Verify**: Attempt booking a 3rd resource with a student account at maximum quota and observe plain-language quota warning banner.

### 7. Originality and Real-World Potential (10 Points)
- **Official Criteria**: Novelty of approach, feasibility of campus adoption, and clear pathway toward scalable institutional impact.
- **Planned Product Evidence**:
  - **Security Arena**: Innovative diagnostic dashboard allowing judges to execute simulated attacks (token replay, double booking race) and verify defenses live.
  - Pragmatic zero-blockchain design that achieves enterprise tamper-evident integrity without gas costs or delays.
  - Concrete post-hackathon roadmap ([docs/FUTURE_SCOPE.md](FUTURE_SCOPE.md)) for IoT locker integration and campus federation.
- **How Judges Can Verify**: Navigate to the Security Arena tab on the live app and trigger attack simulations.
