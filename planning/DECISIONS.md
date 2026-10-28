# PACT: Architectural Decision Records (ADRs)

This document captures key architectural and technical decisions made during the design and build of PACT.

---

## ADR Template
```markdown
### ADR-XXX: [Title]
- **Status**: [PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]
- **Date**: [YYYY-MM-DD]
- **Context**: What problem or design challenge prompted this decision?
- **Decision**: What did we choose to do?
- **Consequences**: What are the trade-offs, advantages, and limitations of this choice?
```

---

## Initial Architectural Decisions

### ADR-001: Technology Stack Selection (FastAPI + React + PostgreSQL)
- **Status**: **PROPOSED (Subject to team sign-off at Milestone 0)**
- **Date**: 2026-10-28
- **Context**: For a 48-hour hackathon, we need a technology stack that supports fast development velocity, strict type safety across shared API contracts, and robust ACID relational transactions to eliminate race conditions in resource reservations.
- **Decision**:
  - Frontend: React 18+ with Vite, TypeScript, and Tailwind CSS.
  - Backend: Python 3.11+ with FastAPI, Uvicorn, and Pydantic V2.
  - Database: PostgreSQL (with SQLite fallback for local offline development) managed via SQLAlchemy 2.0.
- **Consequences**:
  - *Advantages*: Rapid scaffolding, auto-generated OpenAPI documentation, strong type validation on requests/responses, and reliable concurrency control.
  - *Trade-offs*: Team must maintain synchronization between Pydantic schemas (Python) and TypeScript interfaces on the frontend.

---

### ADR-002: Tamper-Evident Cryptographic Hash Chaining vs. Public Blockchain
- **Status**: **ACCEPTED**
- **Date**: 2026-10-28
- **Context**: The problem statement requires trust, safety, and auditable history for resource custody. Many teams default to Web3 smart contracts or public blockchains, which introduce gas fees, latency, wallet setup requirements for judges, and complexity that often causes failure during demo evaluations.
- **Decision**:
  - PACT will implement an internal **cryptographic SHA-256 hash-chain ledger (Trust Capsule)** stored within the relational database.
  - Every custody state transition includes the previous block's hash and a cryptographic hash of its own payload.
  - An audit endpoint (`/api/v1/audit/verify-chain`) will dynamically recompute and verify all hashes, immediately detecting any direct database tampering.
- **Consequences**:
  - *Advantages*: Zero gas fees, millisecond transaction confirmation, zero wallet onboarding for judges, and honest, explainable tamper-evident auditing.
  - *Limitations*: As documented in [docs/KNOWN_LIMITATIONS.md](../docs/KNOWN_LIMITATIONS.md), an administrator with direct database root access could theoretically recompute the chain if unanchored. For the hackathon prototype, this is explicitly disclosed as tamper-evident rather than tamper-proof.

---

### ADR-003: Strict Server-Side State Machine for Booking & Custody
- **Status**: **ACCEPTED**
- **Date**: 2026-10-28
- **Context**: Resource lending involves high physical and institutional risk (damage, theft, unauthorized release). Relying on client-side state flags or loosely defined status strings invites illegal state transitions (e.g., an unapproved booking being marked returned, or a user checking out an item without custodian sign-off).
- **Decision**:
  - Implement a formal, server-side finite state machine:
    `DRAFT` ➔ `PENDING_APPROVAL` ➔ `APPROVED` ➔ `ACTIVE_CUSTODY` ➔ `RETURN_INSPECTED` ➔ `COMPLETED` (or `INCIDENT_FLAGGED`).
  - All state transitions must occur through dedicated endpoint actions (`/approve`, `/verify-checkin`, `/inspect-return`) that validate caller roles and prerequisites.
  - Illegal transition attempts return HTTP 400 Bad Request.
- **Consequences**:
  - *Advantages*: Eliminates skipped handshakes, guarantees baseline photos exist before custody begins, and ensures audit blocks are generated at every valid milestone.
  - *Trade-offs*: Frontend must handle fine-grained state representations and contextual action buttons.
