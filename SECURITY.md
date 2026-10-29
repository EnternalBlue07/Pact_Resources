# PACT: Security Model, Trust Boundaries & Vulnerability Policy

> **Repository**: https://github.com/EnternalBlue07/Pact_Resources  
> **Classification**: Security Architecture & Threat Model (CodeHack India 2026)

---

## 1. Security Philosophy: Zero-Trust Institutional Access

Traditional campus equipment reservation systems operate on implicit trust: whoever logs into the web portal can request any item, and checkouts are tracked on paper sign-in sheets.

PACT implements **Zero-Trust Access Gatekeeping**:
1. **Never trust client assertions**: Every permission, certification, and quota check is executed strictly on the backend.
2. **Explicit physical handshakes**: Custody only transfers when borrower and custodian execute a dual-acknowledgement handshake using a single-use, 15-minute token.
3. **Evidence-backed custody**: Every checkout and return requires photographic baseline records and structured condition checklists.
4. **Tamper-evident auditability**: All state transitions produce cryptographic SHA-256 chained blocks.

---

## 2. Role-Based Access Control (RBAC) & Authority Matrix

| Role | Permitted Actions | Prohibited Actions | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **`REQUESTER`** | Browse catalog, check eligibility, submit booking requests, generate handover token, upload return evidence, submit dispute appeal. | Cannot approve own requests. Cannot inspect returns. Cannot resolve damage incidents. | Server-side dependency: `Depends(require_role(["REQUESTER", "ADMINISTRATOR"]))` |
| **`CUSTODIAN`** | Create resources, define prerequisite rules, approve/reject bookings, verify check-in tokens, inspect returns, flag damage incidents. | Cannot approve resources outside their department. Cannot unilaterally delete or rewrite audit records. | Server-side dependency + resource custodial ownership check. |
| **`ADMINISTRATOR`** | Review flagged damage incidents, adjudicate appeals, assess repair penalties or waivers, manage user quotas. | Cannot assess automated penalties without documenting human justification. | Server-side dependency: `Depends(require_role(["ADMINISTRATOR"]))` |
| **`AUDITOR`** | Read-only inspection of Trust Replay timeline, verification of cryptographic hash chains, export audit logs. | Cannot create, modify, or delete operational data. | Server-side dependency: `Depends(require_role(["AUDITOR"]))` |

---

## 3. Defense-in-Depth Mechanisms

### 3.1. Handover Token Expiry & Replay Prevention
- When a borrower arrives at the physical lab, they request a token via `POST /api/v1/handovers/generate-token`.
- The server generates an ephemeral 6-digit code with an exact **15-minute validity window**.
- The token is hashed with SHA-256 before storage; the plaintext token is never stored at rest.
- When the custodian verifies the token (`POST /api/v1/handovers/verify`), the database marks `is_spent = True` within an atomic transaction.
- **Replay Protection**: Any subsequent submission of the same token immediately returns `HTTP 400 Bad Request: Token already spent`.

### 3.2. Concurrency Control & Double-Booking Protection
- Booking submissions acquire a database row-level lock (`SELECT ... FOR UPDATE` in PostgreSQL / serialized transactions in SQLite).
- The query checks for overlapping intervals:
  $$\text{NOT } (\text{existing.end} \le \text{new.start} \lor \text{existing.start} \ge \text{new.end})$$
- Overlapping requests receive `HTTP 409 Conflict: Slot already reserved`.

### 3.3. Audit-Integrity Limitations (Honest Disclosure)
- **Tamper-Evident, NOT Tamper-Proof**: PACT implements cryptographic SHA-256 hash chaining stored within the application database.
- *What it guarantees*: Any unauthorized direct SQL update to an existing condition report, actor ID, or timestamp breaks the hash continuity. Calling `/api/v1/audit/verify-chain` immediately flags the tampered record.
- *What it does NOT guarantee*: A rogue database superuser with direct root SQL access could hypothetically overwrite a record and recompute all forward hashes. True immutability requires anchoring hash roots into an external decentralized ledger or timestamping authority (planned in [docs/FUTURE_SCOPE.md](docs/FUTURE_SCOPE.md)).

### 3.4. Evidence Access & Personal Data Privacy
- **Minimal PII**: The platform only stores institutional email, full name, department, and safety qualification keys.
- **Evidence Storage**: Condition photographs are assigned cryptographically random UUID filenames (`uuid4().hex`) and stored in non-public directories. Access is restricted to authorized booking participants, custodians, and compliance auditors.
- **Zero Real Secrets in Git**: Passwords and secrets are strictly loaded from environment variables (`.env`). `.env` is ignored in `.gitignore`.

### 3.5. Safe Security Arena Execution
- The in-app **Security Arena** allows evaluators to simulate attack vectors (token replay, double booking race, privilege escalation, audit tampering).
- Attack endpoints operate against isolated test sandbox data and **never corrupt production resource records**.

---

## 4. Implemented vs. Intended Security Protections

| Security Control | Implementation Status | Verification Method |
| :--- | :---: | :--- |
| **Server-Side RBAC Enforcement** | **Verified (Tested)** | `tests/test_audit_verification.py` asserts unauthorized roles receive HTTP 403. |
| **15-Min Single-Use Handover Token**| **Verified (Tested)** | `tests/test_lifecycle.py` asserts replayed tokens return HTTP 400. |
| **Double-Booking Database Locks** | **Verified (Tested)** | Overlapping interval query in `bookings.py` returns HTTP 409 Conflict. |
| **Trust Capsule SHA-256 Chaining** | **Verified (Tested)** | `tests/test_audit_security.py` mutates DB and asserts verify-chain alert. |
| **Human Oversight for Incidents** | **Verified (Tested)** | `tests/test_audit_verification.py` verifies admin-only incident resolution. |
| **Campus LDAP / SAML 2.0 SSO** | **Deferred (Future Scope)**| Simulated with local institutional demo roles. |

---

## 5. Vulnerability Disclosure & Reporting

If you identify a security vulnerability, credential leak, or authorization bypass:
1. **Do not open a public GitHub issue** disclosing exploit payloads.
2. Privately notify the repository maintainers or team leads.
3. If an API key or password is accidentally committed, immediately revoke/rotate the secret and purge the commit history.
