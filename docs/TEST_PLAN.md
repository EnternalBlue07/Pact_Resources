# PACT: Comprehensive Test Plan & Verification Matrix

> [!IMPORTANT]
> **TEST SUITE STATUS: NOT RUN**  
> This document specifies the test cases, validation scenarios, and assertion criteria planned for implementation during the hackathon build window.  
> **No tests have been executed yet.** In compliance with hackathon integrity guidelines, test execution will occur when the functional test suite is implemented.

---

## 1. Test Strategy Overview

PACT employs a multi-tiered testing strategy:
- **Unit & Service Tests**: Validates state machine transitions, token hash generation, and SHA-256 block calculation.
- **API Integration Tests**: Evaluates REST endpoints against positive workflows and negative security edge cases.
- **Concurrency & Race Condition Tests**: Simulates concurrent requests to ensure zero double-bookings.
- **Security Arena Diagnostics**: Replays malicious payloads to verify defensive boundary controls.

---

## 2. Test Execution Matrix (Planned)

| Test ID | Category | Scenario / Description | Type | Expected Result | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **TC-CAT-01** | **Discovery** | Custodian creates new resource with valid specs and location. | Positive | Resource created; returns 201; visible in public search. | **NOT RUN** |
| **TC-CAT-02** | **Discovery** | Requester filters catalog by category (`EQUIPMENT`) and available status. | Positive | Only available equipment returned in search results. | **NOT RUN** |
| **TC-ELIG-01**| **Eligibility** | User with required `LASER_SAFETY_1` certification attempts booking. | Positive | Eligibility check passes; booking allowed. | **NOT RUN** |
| **TC-ELIG-02**| **Eligibility** | User lacking prerequisite certification attempts booking. | Negative | Booking blocked; returns 403 with clear prerequisite explanation. | **NOT RUN** |
| **TC-BOOK-01**| **Booking** | Requester submits reservation for valid unoccupied future time window. | Positive | Booking transitions to `PENDING_APPROVAL`; returns 201. | **NOT RUN** |
| **TC-BOOK-02**| **Booking** | Custodian approves pending booking request. | Positive | State transitions from `PENDING_APPROVAL` to `APPROVED`. | **NOT RUN** |
| **TC-BOOK-03**| **Booking** | Custodian rejects pending booking with justification note. | Positive | State transitions to `REJECTED`; justification saved. | **NOT RUN** |
| **TC-CONF-01**| **Conflict** | Two requesters attempt booking the identical time slot concurrently. | Negative | First request succeeds (201); second receives 409 Conflict. | **NOT RUN** |
| **TC-CONF-02**| **Conflict** | Requester requests time slot partially overlapping with an existing approved booking. | Negative | Overlap detected; returns 409 Conflict with option to join waitlist. | **NOT RUN** |
| **TC-HAND-01**| **Handover** | Requester generates handover token within 15-minute validity window. | Positive | Token generated; returns 6-digit code and expiry timestamp. | **NOT RUN** |
| **TC-HAND-02**| **Handover** | Custodian verifies valid token alongside baseline condition checklist. | Positive | Handshake succeeds; booking transitions to `ACTIVE_CUSTODY`. | **NOT RUN** |
| **TC-SEC-01** | **Security** | Attacker attempts check-in using an expired handover token (>15 mins). | Negative | Handover rejected; returns 400 Bad Request (Token Expired). | **NOT RUN** |
| **TC-SEC-02** | **Security** | Attacker attempts to replay an already-spent handover token. | Negative | Handover rejected; returns 400 Bad Request (Token Already Spent). | **NOT RUN** |
| **TC-SEC-03** | **Security** | Requester role attempts calling Custodian approval endpoint directly. | Negative | Request rejected; returns 403 Forbidden. | **NOT RUN** |
| **TC-RET-01** | **Return** | Borrower returns resource in clean condition; custodian confirms. | Positive | State transitions to `COMPLETED`; resource marked `AVAILABLE`. | **NOT RUN** |
| **TC-RET-02** | **Return** | Custodian detects cracked housing during return inspection. | Negative | State transitions to `INCIDENT_FLAGGED`; incident record created. | **NOT RUN** |
| **TC-INC-01** | **Incident** | Administrator reviews flagged damage incident and waives penalty. | Positive | State transitions to `RESOLVED_WAIVED`; resource restored. | **NOT RUN** |
| **TC-INC-02** | **Incident** | Administrator assesses repair penalty for proven negligent misuse. | Positive | State transitions to `RESOLVED_PENALTY`; penalty logged. | **NOT RUN** |
| **TC-AUD-01** | **Audit** | Auditor retrieves Trust Capsule timeline for complete completed booking. | Positive | All lifecycle events rendered in order with valid SHA-256 hashes. | **NOT RUN** |
| **TC-AUD-02** | **Audit** | Direct database tampering simulated on historical condition notes. | Negative | Chain verification function flags mismatch at tampered block. | **NOT RUN** |
| **TC-FAIR-01**| **Fairness** | Requester holding 2 active bookings attempts submitting a 3rd. | Negative | Booking blocked; returns 422 Quota Exceeded. | **NOT RUN** |
| **TC-FAIR-02**| **Fairness** | Approved booking is cancelled; waitlisted user is promoted. | Positive | Waitlist position #1 user promoted to `PENDING_APPROVAL`. | **NOT RUN** |

---

## 3. Test Automation Tooling (Provisional)

- **Backend Integration Suite**: `pytest`, `httpx` (async FastAPI test client), `pytest-asyncio`.
- **Database Test Isolation**: Transactional rollbacks per test using SQLite in-memory or PostgreSQL test instance.
- **Frontend Component Tests**: Vitest + React Testing Library (accessible queries: `getByRole`, `getByLabelText`).
- **Security Arena**: Automated script simulating concurrent requests and tampered payloads.
