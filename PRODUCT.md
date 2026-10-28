# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Student Researcher** (`Aarav Sharma` - `u-student-01`): Needs rapid, transparent booking of specialized research apparatus (Electron Microscopes, CNC Milling machines, RF Chambers) for academic projects without bureaucratic delays, with clear feedback on required safety prerequisites and active quotas.
2. **Lab Custodian / Faculty In-Charge** (`Prof. Rajesh Rao` - `u-custodian-01`): Responsible for multimillion-rupee laboratory equipment. Must review research justifications, approve requests, perform physical dual-acknowledgement handovers via time-limited digital tokens, record pre-existing equipment conditions, and inspect returns.
3. **Institutional Administrator** (`Dr. Anita Kapoor` - `u-admin-01`): Department head managing facility utilization, safety compliance rules, dispute resolutions, and policy governance across shared campus resources.
4. **Compliance Auditor / Hackathon Judge** (`Inspector Vikram Menon` - `u-auditor-01`): Inspects tamper-evident audit logs, independently verifies cryptographic block hashes of custody transitions, and stress-tests system security boundaries.

## Product Purpose

Universities and research institutions own crores worth of advanced equipment and specialized facilities that sit idle up to 70% of the time because lab custodians fear damage, unauthorized access, and lack of accountability. PACT (**Proof, Authorization, Custody & Trust**) replaces broken manual logbooks and opaque email chains with a zero-trust resource-sharing lifecycle:
- **Proof Before Access**: Strict cryptographic and credential gating before any booking is confirmed.
- **Evidence After Return**: Mandatory condition logging and photographic audit trails at checkout and return.
- **Tamper-Evident History**: Chained SHA-256 Trust Capsules that guarantee full auditability for every state transition.

## Positioning

Unlike generic room schedulers (Google Calendar, Calendly) or heavy ERPs (SAP, Oracle) that treat equipment as generic calendar slots, PACT is a **cryptographic custody and zero-trust authorization platform**. PACT models the physical reality of shared high-value hardware:
- Eligibility rules are enforced server-side before booking creation.
- Physical custody transfers require a 15-minute, single-use cryptographically signed handover token.
- Returns require condition attestation; damage or anomalies automatically fork into an immutable incident record.
- Every state transition appends to a Merkle/hash-chained Trust Capsule verifiable at any moment.

## Operating Context

- Used in academic labs, maker-spaces, cleanrooms, and testing facilities under both desktop management stations and mobile handheld devices during physical handovers.
- Demands high-contrast, fast-scanning ergonomics with immediate visual feedback on approval status, token countdowns, condition checklists, and audit chain verification.

## Capabilities and Constraints

- **Live Resource Catalog**: Search and filter by category (High-Value Scientific, Advanced Fabrication, Specialized Facility), location, and availability state (`AVAILABLE`, `IN_USE`, `MAINTENANCE`).
- **Zero-Trust Eligibility Gate**: Real-time evaluation of user qualifications against resource requirements, plus concurrency quota enforcement (maximum 2 active bookings per user).
- **Dual-Acknowledgement Handover**: Generation of 15-minute single-use secure tokens; custodian confirms checkout with pre-condition checklist.
- **Return & Incident Escalation**: Custodian verifies post-use condition; clean returns immediately close the custody cycle, while damaged/faulty returns automatically transition to `INCIDENT_OPEN` with damage severity documentation.
- **Trust Capsule Audit Ledger**: Every lifecycle event (Created, Approved, Handover Token Generated, Checked Out, Returned, Incident Logged) is canonically serialized, hashed with SHA-256, and chained with `prev_hash`. A live verification engine recalculates the entire chain on demand.
- **Trust Graph**: Interactive graphical visualization linking Resources, Policies, Bookings, Handovers, Evidence, and Capsule blocks.
- **Security Arena**: Live exploit simulation console allowing operators to trigger and observe real-time defense against Token Replay Attacks, Double-Booking Race Conditions, and Database Audit Tampering.

## Brand Commitments

- **Tone**: Rigorous, institutional, trustworthy, high-craft, and authoritative.
- **Motto**: *"Proof Before Access. Evidence After Return."*
- **Aesthetic**: Deep obsidian/slate ground with high-clarity typography, electric cyan and precision blue accents, emerald cryptographic verification indicators, and crisp crimson alert states.

## Product Principles

1. **Proof Before Access**: Trust is never assumed; every reservation verifies credentials and system quotas before granting state change.
2. **Evidence After Return**: Custody is never resolved without documented proof of equipment condition.
3. **Tamper-Evident by Construction**: Audit events are mathematically chained; any unauthorized alteration in the persistence layer is immediately detectable.
4. **Honest Engineering**: Zero fake mock data; all UI controls interact directly with authoritative FastAPI endpoints, with honest explanations of security models and threat boundaries.
