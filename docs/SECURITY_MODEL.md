# PACT: Security Model & Trust Architecture

> [!NOTE]
> **PLANNED SECURITY SPECIFICATION**  
> This document defines the security boundaries, threat model, and defense-in-depth mechanisms designed for PACT.  
> These specifications guide backend and security implementation during the hackathon.

---

## 1. Zero-Trust Access Philosophy

PACT is built on the principle: **"Never trust client assertions; always verify server-side."**

Traditional campus reservation systems trust client inputs or rely on naive calendar reservations. PACT treats physical assets as high-value targets and verifies every transition:
1. **Identity & Role**: Authenticated via signed JWT tokens with claims validated on every API call.
2. **Eligibility Preconditions**: Validated in real-time against verified prerequisite qualifications.
3. **Physical Custody Handshake**: Requester and Custodian must present and verify a time-bound, single-use token in each other's physical presence.
4. **Evidence-Sealed State Changes**: Pre-use and post-use states require photographic or structured checklist attachments.

---

## 2. Core Security Controls

### 2.1. Server-Side Role-Based Access Control (RBAC)
- All endpoint authorization checks are executed server-side using FastAPI dependency injection (`Depends(get_current_active_user)` and `Depends(require_role(...))`).
- Four distinct institutional scopes:
  - `REQUESTER`: Can search catalog, submit bookings, generate handover tokens, and view personal custody history.
  - `CUSTODIAN`: Can manage assigned resources, approve/reject bookings, verify handover tokens, inspect returns, and flag incidents.
  - `ADMINISTRATOR`: Can arbitrate incidents, adjust quotas, manage users, and configure department settings.
  - `AUDITOR`: Read-only access to all resource timelines, audit records, and hash verification consoles.

### 2.2. Resource-Specific Eligibility Gate (Zero-Trust Gate)
- Resources declare explicit qualification keys (e.g., `BIO_HAZARD_LVL2`, `CNC_OPERATOR_1`).
- The booking endpoint queries the user's verified qualification ledger in the database before accepting any booking.
- Client-side checks are provided solely for user experience (disabling buttons and displaying requirements); all server endpoints enforce the check independently.

### 2.3. Short-Lived, Single-Use Handover Tokens
- To prevent unauthorized asset release, custody check-in requires a dynamic Handover Token:
  - **Single-Use**: Once validated, the token is permanently flagged as `spent = True` within an atomic database transaction.
  - **Time-Bound**: Tokens carry an automatic expiry of 15 minutes.
  - **Cryptographically Hashed**: Tokens are stored as one-way SHA-256 hashes in the database; plaintext tokens are never stored at rest.

### 2.4. Double-Booking Prevention & Concurrency Protection
- All booking requests lock the target resource row (`SELECT ... FOR UPDATE`) or execute within a PostgreSQL `SERIALIZABLE` transaction.
- Queries check for overlapping intervals:
  `WHERE resource_id = :id AND status IN ('APPROVED', 'ACTIVE_CUSTODY') AND NOT (end_time <= :new_start OR start_time >= :new_end)`
- Overlapping requests immediately receive `409 Conflict`.

### 2.5. Evidence Protection & Personal Data Handling
- Sensitive personal data (passwords, private contact details) is segregated from operational records.
- Passwords are encrypted using modern Argon2id or bcrypt hashing.
- Uploaded photographic evidence is stored with non-guessable UUID filenames and restricted to authorized booking participants and auditors.

### 2.6. Human Oversight for Consequential Decisions
- No algorithmic or automated system is permitted to assess financial penalties, permanently revoke student access, or close contested damage incidents autonomously.
- All incident flags trigger an administrator review workflow where human lab directors evaluate photographic evidence, listen to student statements, and make the final adjudication.

---

## 3. Tamper-Evident Logging vs. Absolute Tamper-Proof Security

A critical distinction in PACT's architecture is the difference between **tamper-evident** systems and claims of **tamper-proof** security:

```
+---------------------------------------------------------------------------------------+
|                 TAMPER-EVIDENT LOGGING (PACT ARCHITECTURE)                            |
|                                                                                       |
|  [Block N-1: Hash A] <====== chained ======> [Block N: Hash B (contains Hash A)]      |
|                                                                                       |
|  - Any retroactive modification to Block N-1 changes Hash A.                          |
|  - Block N's recorded 'prev_hash' no longer matches Hash A.                           |
|  - The audit integrity verification function immediately flags the broken link.       |
|  - Result: Tampering CANNOT BE CONCEALED.                                             |
+---------------------------------------------------------------------------------------+
```

### Why PACT Uses Tamper-Evident Hash Chaining
1. **Honest Architectural Guarantee**: In centralized institutional databases (PostgreSQL), an administrator with database root access could theoretically overwrite records. However, with cryptographic hash chaining, **any silent alteration breaks the hash continuity**.
2. **Audit Verification**: Anyone with auditor permissions can run `/api/v1/audit/verify-chain`. If a malicious actor edits a booking record or condition report, the audit engine points to the exact block where the hash discrepancy occurred.
3. **No Blockchain Bloat**: Public blockchains introduce gas fees, latency, and unnecessary complexity. Tamper-evident chaining delivers enterprise-grade verifiable auditing without computational waste.

---

## 4. Threat Matrix & Mitigation Strategies

| Threat Vector | Attack Description | PACT Defense Mechanism |
| :--- | :--- | :--- |
| **Token Replay** | Attacker intercepts a used handover token and tries checking out equipment again. | Handover tokens are marked `is_spent=True` in an atomic transaction; subsequent submissions fail with `400 Bad Request`. |
| **Privilege Escalation** | Requester crafts an API request to approve their own booking. | Server-side role dependency rejects requests lacking `CUSTODIAN` or `ADMINISTRATOR` claims with `403 Forbidden`. |
| **Double-Booking Race** | Two users click "Book" simultaneously for the same resource slot. | Row-level database locks ensure sequential evaluation; the second request triggers `409 Conflict`. |
| **Silent Evidence Tampering** | Custodian or student alters condition notes retroactively to blame the other party. | Event payloads are cryptographically hashed into the Trust Capsule upon completion; alterations invalidate the hash chain. |
| **Fake Qualifications** | User sends modified client payload claiming to hold safety certifications. | Server evaluates qualification records stored in `user_qualifications` table, ignoring client-provided claims. |
