# PACT: 48-Hour Hackathon Milestones & Schedule

> [!NOTE]
> **COMPETITION SPRINT SCHEDULE**  
> This timeline maps our 48-hour build execution plan for CodeHack India, establishing strict checkpoints to prevent scope creep and guarantee a polished, deployed submission.

---

## Sprint Roadmap (Hour 0 to Hour 48)

```
[Hour 0-4]     Milestone 0: Alignment & Contract Freeze
    │
[Hour 4-16]    Milestone 1: Foundations & Catalog Discovery
    │
[Hour 16-28]   Milestone 2: Core P0 End-to-End Custody Lifecycle
    │
[Hour 28-38]   Milestone 3: P1 Trust Capsule, Fair Access & Incidents
    │
[Hour 38-44]   Milestone 4: Test Suite, Bug Bashing & Demo Polish
    │
[Hour 44-48]   Milestone 5: Deployment, Video Demo & Submission
```

---

## Detailed Milestone Objectives & Deliverables

### Milestone 0: Alignment, Tooling & Contract Freeze (Hour 0 – 4)
- **Objective**: Ensure all 4 team members have active local development environments, agree on shared contracts, and freeze API schemas.
- **Key Deliverables**:
  - Review and sign off on [docs/API_CONTRACTS.md](../docs/API_CONTRACTS.md) and [docs/DATA_MODEL.md](../docs/DATA_MODEL.md).
  - Initialize local `.env` from `.env.example`.
  - Establish Git branch protection and PR review rules.
- **Go/No-Go Gate**: All team members can run mock API client and backend server locally.

### Milestone 1: Foundations & Catalog Discovery (Hour 4 – 16)
- **Objective**: Build foundational database tables, backend CRUD endpoints, and frontend catalog views.
- **Key Deliverables**:
  - Database schema generated via SQLAlchemy models (Users, Resources, Qualifications).
  - Seed initial catalog data (6+ items across Equipment and Spaces).
  - Frontend: Responsive navigation bar, Catalog page with search input and category filtering.
  - Zero-Trust Gate backend check for qualification evaluation.

### Milestone 2: Core P0 End-to-End Custody Lifecycle (Hour 16 – 28)
- **Objective**: Achieve working end-to-end booking and custody handover flow.
- **Key Deliverables**:
  - Booking request modal with date-time slot selection and conflict detection (HTTP 409).
  - Custodian approval/rejection dashboard.
  - Dual-acknowledgement check-in: 15-minute token generation, validation, and baseline condition notes.
  - Active custody dashboard display with return countdown.
  - Clean return inspection and completion.
- **Go/No-Go Gate**: Complete end-to-end manual walkthrough from student search to returned asset.

### Milestone 3: P1 Trust Capsule, Fair Access & Incidents (Hour 28 – 38)
- **Objective**: Implement competitive differentiators: cryptographic audit chaining, quota rules, and incident handling.
- **Key Deliverables**:
  - **Trust Capsule**: SHA-256 hash chaining on all booking state events and condition evidence.
  - **Trust Replay**: Frontend interactive timeline showing chronological audit blocks and cryptographic seal.
  - **Fair Access Engine**: Maximum 2 active bookings quota enforcement and automated waitlists.
  - **Incident Console**: Damage discrepancy reporting, return photo comparison, and administrator arbitration.
  - **Security Arena**: Interactive test console for simulating attack vectors (replay, double-booking).

### Milestone 4: Test Suite, Bug Bashing & Demo Polish (Hour 38 – 44)
- **Objective**: Automate test verification, eliminate edge-case bugs, and polish UI interactions.
- **Key Deliverables**:
  - Automated `pytest` suite executing all 22 test scenarios from [docs/TEST_PLAN.md](../docs/TEST_PLAN.md).
  - One-click demo seeder script populating pre-set scenarios for judge evaluation.
  - Accessibility audit (contrast check, keyboard navigation, clear error banners).
  - Responsive layout validation across mobile and desktop breakpoints.

### Milestone 5: Deployment, Video Demo & Submission (Hour 44 – 48)
- **Objective**: Deploy live cloud applications, record judge walkthrough video, and submit all deliverables.
- **Key Deliverables**:
  - Deploy frontend to Vercel/Render and backend to Render/Fly.io.
  - Verify live database connection (Neon/Supabase) and execute live smoke tests.
  - Record 3–5 minute demonstration video following [planning/DEMO_SCRIPT.md](DEMO_SCRIPT.md).
  - Complete all items in [docs/SUBMISSION_CHECKLIST.md](../docs/SUBMISSION_CHECKLIST.md).
  - Confirm every team member has submitted their individual hackathon portal entry.
