# PACT: Backend Integrity Audit & Lifecycle Verification Report

> **Repository**: `D:\pact-resource-trust`  
> **Date**: October 28, 2026  
> **Classification**: Engineering Audit & Security Hardening  
> **Scope**: Backend architecture, FastAPI routers, SQLAlchemy data models, Zero-Trust Access Gate, Trust Capsule cryptographic ledger, RBAC enforcement, and lifecycle state transitions.

---

## 1. Executive Summary

PACT (*Proof, Authorization, Custody & Trust*) is designed for CodeHack India 2026 under the challenge: **Unlock Underused Equipment and Spaces**. The system guarantees verifiable custody through pre-use authorization and post-use physical evidence.

This backend integrity audit systematically inspected and verified the complete resource lifecycle, identifying 7 genuine defects ranging from cryptographic ledger crash bugs and missing server-side authorization boundaries to incomplete incident dispute workflows. All 7 defects have been resolved with minimal surgical code changes, accompanied by 9 new regression tests in `tests/test_audit_verification.py`. The complete test suite now passes with 100% success rate (17/17 tests passing).

---

## 2. Audited Architectural Surface

| Component | Files Audited | Responsibilities & Status |
| :--- | :--- | :--- |
| **App Core & Entry** | `backend/app/main.py`, `backend/app/core/` | FastAPI initialization, CORS middleware, metadata endpoints, and database connection. Verified healthy. |
| **Data Models** | `backend/app/models/entities.py` | SQLAlchemy 2.0 ORM schemas for `User`, `Resource`, `Qualification`, `Booking`, `HandoverToken`, `ConditionReport`, `Incident`, and `TrustCapsuleEntry`. |
| **Catalog & Gate** | `backend/app/api/v1/resources.py`, `access_gate.py` | Resource listing, keyword search, prerequisite gate evaluation, qualification matching. |
| **Booking State Engine** | `backend/app/api/v1/bookings.py` | Time interval overlap collision checks, past timestamp prevention, custodian approval/rejection. |
| **Handover Service** | `backend/app/api/v1/handovers.py` | Ephemeral 15-minute token issuance, single-use SHA-256 hash validation, dual-acknowledgement check-in. |
| **Returns & Incidents** | `backend/app/api/v1/returns.py` | Condition inspection, damage flagging, asset maintenance lockout, and administrative incident adjudication. |
| **Trust Capsule Ledger** | `backend/app/services/trust_capsule.py`, `audit.py` | Canonical JSON serialization, SHA-256 forward-hash chaining, tamper detection, and Security Arena red-team endpoints. |

---

## 3. Findings Ranked by Severity & Remediation

### Finding 1: Trust Capsule Verification AttributeError Crash
- **Severity**: **HIGH (Critical)**
- **Component**: `backend/app/api/v1/audit.py` (Line 68)
- **Defect**: During chain verification in `/verify-chain`, code attempted to read `latest.block_hash`. However, the SQLAlchemy model `TrustCapsuleEntry` defines the hash field as `entry_hash`. Calling `/verify-chain` caused an unhandled `AttributeError: 'TrustCapsuleEntry' object has no attribute 'block_hash'`, resulting in an HTTP 500 Internal Server Error.
- **Remediation**: Corrected property access to `latest.entry_hash`.
- **Verification**: Verified via `tests/test_audit_verification.py::test_simulate_tamper_endpoint_success`.

---

### Finding 2: Missing Server-Side Custodian Role Authorization
- **Severity**: **HIGH (Security Bypass)**
- **Components**:
  - `backend/app/api/v1/bookings.py` (`approve_booking`, `reject_booking`)
  - `backend/app/api/v1/handovers.py` (`verify_checkin`)
  - `backend/app/api/v1/returns.py` (`inspect_return`)
  - `backend/app/api/v1/resources.py` (`create_resource`)
- **Defect**: Endpoints accepted `custodian_id` as a client-provided parameter without verifying in the database whether the user exists or holds the `CUSTODIAN` or `ADMINISTRATOR` role. Any arbitrary `u-student-01` ID could be supplied by an attacker to approve bookings or verify check-ins.
- **Remediation**: Added server-side database lookups checking `user.role in [UserRole.CUSTODIAN, UserRole.ADMINISTRATOR]`. Returns `HTTP 403 Forbidden` if missing or unauthorized.
- **Verification**: Tested in `test_student_cannot_act_as_custodian_for_approval` and `test_unauthorized_role_approval_rejected`.

---

### Finding 3: Lack of Dual-Acknowledgement (Self-Custody Transfer)
- **Severity**: **HIGH (Custody Integrity)**
- **Components**: `bookings.py`, `handovers.py`, `returns.py`
- **Defect**: Nothing prevented a requester from passing their own user ID as `custodian_id` during approval, check-in, or return inspection. A user could approve their own reservation, sign out hardware to themselves without counter-signature, or perform a self-return to hide damage.
- **Remediation**: Enforced four-eyes dual-acknowledgement:
  ```python
  if custodian.id == booking.requester_id:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Dual-acknowledgement required: requester cannot approve their own booking",
      )
  ```
- **Verification**: Tested in `test_dual_acknowledgement_self_approval_prevented`, `test_dual_acknowledgement_self_checkin_prevented`, and `test_dual_acknowledgement_self_return_prevented`.

---

### Finding 4: Security Arena Simulation Endpoints Unshielded
- **Severity**: **HIGH (Production Vulnerability)**
- **Component**: `backend/app/api/v1/audit.py` (`/simulate-tamper`, `/repair-ledger`)
- **Defect**: Endpoints designed for judge demonstration directly mutated raw DB entries or repaired hashes without checking execution environment or validating actor privileges. In a production environment, this would allow arbitrary manipulation of the audit ledger.
- **Remediation**:
  1. Gated endpoints behind `settings.ENVIRONMENT != "production"`. Calls in production return `HTTP 403 Forbidden`.
  2. If `actor_id` is supplied, server verifies the actor holds `ADMINISTRATOR` or `AUDITOR` permissions.
- **Verification**: Tested in `test_simulate_tamper_endpoint_success`.

---

### Finding 5: Incomplete Incident Adjudication Lifecycle
- **Severity**: **MEDIUM (Workflow Disruption)**
- **Component**: `backend/app/api/v1/returns.py`, `backend/app/schemas/__init__.py`
- **Defect**: When an asset was returned with damage (`flag_incident=True`), the asset was marked `UNDER_MAINTENANCE` and the booking was marked `INCIDENT_OPEN`. However, no backend endpoints existed for administrators to list incidents or resolve them. Assets remained permanently unusable and bookings were never closed.
- **Remediation**:
  1. Implemented `GET /api/v1/returns/incidents` to list and filter pending damage incidents.
  2. Implemented `POST /api/v1/returns/incidents/{incident_id}/resolve` requiring `ADMINISTRATOR` authority. The admin submits a decision (`RESOLVED_WAIVED` or `RESOLVED_PENALTY`) and resolution notes. The endpoint closes the booking (`CLOSED`), restores the asset (`AVAILABLE`), updates the incident record, and appends an `INCIDENT_RESOLVED` block into the Trust Capsule.
- **Verification**: Tested in `test_incident_resolution_lifecycle`.

---

### Finding 6: Missing Audit Block for Handover Token Generation
- **Severity**: **MEDIUM (Audit Continuity)**
- **Component**: `backend/app/api/v1/handovers.py` (`generate_handover_token`)
- **Defect**: While check-in was logged, the initial generation of an ephemeral handover token was not recorded in the Trust Capsule, creating an audit gap between booking approval and check-in.
- **Remediation**: Added `append_audit_block(..., event_type="HANDOVER_TOKEN_ISSUED", ...)` upon token creation.
- **Verification**: Tested in `test_handover_token_audit_block_logged`.

---

### Finding 7: Unvalidated Past Timestamps in Booking Creation
- **Severity**: **LOW (Data Hygiene)**
- **Component**: `backend/app/api/v1/bookings.py` (`create_booking`)
- **Defect**: Bookings could be created with a `start_time` in the past, leading to erroneous no-show timers and invalid scheduling.
- **Remediation**: Added server-side validation: `if start_time < now - timedelta(minutes=5): raise HTTPException(400, "Booking start_time cannot be in the past")`.
- **Verification**: Tested in `test_booking_past_start_time_rejected`.

---

## 4. Test State Isolation Resolution

- **Issue**: During full-suite execution (`pytest tests/`), `test_audit_security.py::test_return_with_damage_incident` left `res-oscilloscope-01` in status `UNDER_MAINTENANCE`. Subsequent tests in `test_audit_verification.py` attempting to reserve `res-oscilloscope-01` received `HTTP 400 Bad Request: Resource is currently under maintenance`.
- **Fix**: Updated `test_audit_security.py` to exercise the newly implemented incident resolution endpoint (`POST /api/v1/returns/incidents/{id}/resolve`) at the end of the test. This restores `res-oscilloscope-01` to `AVAILABLE`, keeping the in-memory SQLite database clean for all subsequent tests.

---

## 5. Security & Verification Status

| Security Domain | Prior State | Current Audited State | Verified In |
| :--- | :---: | :---: | :--- |
| **Server-Side RBAC** | Unenforced | **Enforced & Gated** | `test_audit_verification.py` |
| **Dual-Acknowledgement** | Missing | **Enforced (403 on self-action)** | `test_audit_verification.py` |
| **15-Min Token Expiry** | Implemented | **Verified & Replay-Protected** | `test_lifecycle.py` |
| **Concurrency Double-Booking** | Implemented | **Verified (409 Conflict)** | `test_lifecycle.py` |
| **Trust Capsule Hash-Chain** | Crashed on verify | **Fixed & Tamper-Evident** | `test_audit_security.py` |
| **Security Arena Safety** | Open | **Environment-Gated** | `test_audit_verification.py` |
| **Incident Adjudication** | Missing | **Complete (End-to-End)** | `test_audit_verification.py` |

---

## 6. Conclusion & Residual Risks

The PACT backend is now fully verified against the documented API contracts, architectural flows, and zero-trust security model.

**Residual Considerations for Future Milestones**:
1. *Production SSO*: Local identity profiles are used for the hackathon demo; production deployment will anchor to institutional OAuth2/SAML identity providers.
2. *External Hash Anchoring*: Hashes are chained within the application database. Future enhancements may anchor Merkle roots to an external public ledger or RFC 3161 timestamping authority for non-repudiation against root database administrators.

