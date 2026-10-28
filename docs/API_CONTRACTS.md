# PACT: Draft API Contracts Specification

> [!NOTE]
> **API SPECIFICATION FOR PARALLEL DEVELOPMENT**  
> This document specifies the planned REST API contracts between the frontend and backend teams.  
> Following the rule established in [CONTRIBUTING.md](CONTRIBUTING.md), shared API schemas must be agreed upon prior to parallel coding during the hackathon. These endpoints are **not yet implemented**.

---

## Base Configuration
- **Base URL**: `http://localhost:8000/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Authentication & Profiles (`/auth`)

### `POST /auth/login`
Authenticate an institutional user and return an access token.
- **Request Body**:
  ```json
  {
    "email": "student@institution.edu",
    "password": "local_dev_password"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "u-101",
      "email": "student@institution.edu",
      "full_name": "Aarav Sharma",
      "department": "Mechanical Engineering",
      "role": "REQUESTER"
    }
  }
  ```

### `GET /auth/me`
Retrieve currently logged-in user profile with active qualifications and quota status.
- **Response `200 OK`**:
  ```json
  {
    "id": "u-101",
    "full_name": "Aarav Sharma",
    "role": "REQUESTER",
    "qualifications": ["LASER_SAFETY_1", "CAD_3D_PRINTING"],
    "active_bookings_count": 1,
    "max_allowed_bookings": 2
  }
  ```

---

## 2. Resources Catalog & Eligibility (`/resources`)

### `GET /resources`
Browse and search available equipment and spaces.
- **Query Parameters**:
  - `query`: string (optional search term)
  - `category`: `EQUIPMENT` | `SPACE` (optional)
  - `department`: string (optional)
  - `status`: `AVAILABLE` | `IN_USE` | `UNDER_MAINTENANCE` (optional)
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "res-501",
        "name": "Rigol DS1054Z Digital Oscilloscope",
        "category": "EQUIPMENT",
        "asset_tag": "EQ-EE-042",
        "department": "Electrical Engineering",
        "location": "Lab 302, Signal Processing Wing",
        "status": "AVAILABLE",
        "max_duration_hours": 4,
        "required_qualifications": ["BASIC_ELECTRONICS_SAFETY"]
      }
    ],
    "total": 1
  }
  ```

### `GET /resources/{resource_id}/eligibility`
Check whether the authenticated requester is eligible to book this specific resource.
- **Response `200 OK` (Eligible)**:
  ```json
  {
    "is_eligible": true,
    "missing_qualifications": [],
    "quota_available": true,
    "explanation": "User meets all safety requirements and has available booking quota."
  }
  ```
- **Response `200 OK` (Ineligible)**:
  ```json
  {
    "is_eligible": false,
    "missing_qualifications": ["LASER_SAFETY_1"],
    "quota_available": true,
    "explanation": "Resource requires Laser Safety Module Level 1 certification before booking."
  }
  ```

---

## 3. Bookings & Lifecycle Management (`/bookings`)

### `POST /bookings`
Submit a new booking reservation.
- **Request Body**:
  ```json
  {
    "resource_id": "res-501",
    "start_time": "2026-10-29T10:00:00Z",
    "end_time": "2026-10-29T14:00:00Z",
    "purpose": "Sensor waveform measurement for robotics capstone project"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "book-901",
    "resource_id": "res-501",
    "requester_id": "u-101",
    "status": "PENDING_APPROVAL",
    "start_time": "2026-10-29T10:00:00Z",
    "end_time": "2026-10-29T14:00:00Z"
  }
  ```
- **Response `409 Conflict`**:
  ```json
  {
    "detail": "Requested time window overlaps with an existing approved booking.",
    "conflict_booking_id": "book-882",
    "waitlist_eligible": true
  }
  ```

### `POST /bookings/{booking_id}/approve`
Custodian approves a pending booking.
- **Response `200 OK`**:
  ```json
  {
    "id": "book-901",
    "status": "APPROVED",
    "approved_at": "2026-10-28T16:00:00Z"
  }
  ```

### `POST /bookings/{booking_id}/reject`
Custodian rejects a pending booking with a reason.
- **Request Body**:
  ```json
  {
    "rejection_reason": "Resource scheduled for routine departmental calibration."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "id": "book-901",
    "status": "REJECTED"
  }
  ```

---

## 4. Handover & Check-In (`/handovers`)

### `POST /handovers/generate-token`
Requester generates a short-lived token for physical checkout.
- **Request Body**:
  ```json
  {
    "booking_id": "book-901"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "handover_token": "PACT-HK-948210",
    "expires_at": "2026-10-29T10:15:00Z",
    "validity_seconds": 900
  }
  ```

### `POST /handovers/verify-checkin`
Custodian verifies token, reviews baseline condition, and confirms custody transfer.
- **Request Body**:
  ```json
  {
    "booking_id": "book-901",
    "handover_token": "PACT-HK-948210",
    "baseline_condition_notes": "All probe cables present. Power switch operates smoothly.",
    "photo_evidence_url": "/evidence/baseline_book_901.jpg",
    "checklist": {
      "cables_present": true,
      "screen_intact": true,
      "calibration_sticker_valid": true
    }
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "booking_id": "book-901",
    "status": "ACTIVE_CUSTODY",
    "custody_started_at": "2026-10-29T10:05:12Z",
    "trust_capsule_hash": "a5d89f..."
  }
  ```

---

## 5. Return & Incident Handling (`/returns` & `/incidents`)

### `POST /returns/inspect`
Custodian records return inspection, uploads post-use evidence, and closes clean custody.
- **Request Body**:
  ```json
  {
    "booking_id": "book-901",
    "return_condition_notes": "Equipment returned in clean operational condition.",
    "photo_evidence_url": "/evidence/return_book_901.jpg",
    "checklist": {
      "cables_returned": true,
      "screen_intact": true,
      "no_visible_burns": true
    },
    "flag_incident": false
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "booking_id": "book-901",
    "status": "COMPLETED",
    "completed_at": "2026-10-29T13:45:00Z"
  }
  ```

### `POST /incidents`
Custodian flags a damage or late discrepancy during return.
- **Request Body**:
  ```json
  {
    "booking_id": "book-901",
    "incident_type": "PHYSICAL_DAMAGE",
    "severity": "MEDIUM",
    "description": "Ch1 BNC connector loose and signal distorted.",
    "photo_evidence_url": "/evidence/incident_book_901.jpg"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "incident_id": "inc-301",
    "booking_id": "book-901",
    "status": "OPEN",
    "booking_status": "INCIDENT_FLAGGED"
  }
  ```

### `POST /incidents/{incident_id}/resolve`
Administrator reviews evidence and adjudicates the incident.
- **Request Body**:
  ```json
  {
    "resolution_type": "RESOLVED_WAIVED",
    "notes": "Determined to be connector fatigue from age, not student misuse."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "incident_id": "inc-301",
    "status": "RESOLVED_WAIVED",
    "resolved_at": "2026-10-29T15:00:00Z"
  }
  ```

---

## 6. Trust Capsule & Audit Integrity (`/audit`)

### `GET /audit/resources/{resource_id}/timeline`
Retrieve the complete chronological Trust Capsule timeline for a resource.
- **Response `200 OK`**:
  ```json
  {
    "resource_id": "res-501",
    "total_events": 5,
    "chain_integrity_verified": true,
    "timeline": [
      {
        "entry_id": 101,
        "event_type": "HANDOVER_VERIFIED",
        "actor": "Prof. Rao (Custodian)",
        "timestamp": "2026-10-29T10:05:12Z",
        "prev_hash": "0000000000000000000000000000000000000000000000000000000000000000",
        "entry_hash": "a5d89f138c2084c8a29a0094b8e219..."
      }
    ]
  }
  ```

### `POST /audit/verify-chain`
Recompute and verify SHA-256 hash chaining across all blocks.
- **Response `200 OK`**:
  ```json
  {
    "status": "VALID",
    "verified_blocks": 48,
    "tampered_blocks": [],
    "message": "All cryptographic hash links verified intact."
  }
  ```

---

## 7. Security Arena Diagnostic Simulation (`/security-arena`)

Endpoints used to demonstrate resilience against attack vectors for judging:
- `POST /security-arena/simulate/replay-token`: Attempts reusing an already-spent token (Expects `400 Bad Request`).
- `POST /security-arena/simulate/double-booking`: Dispatches concurrent booking requests for the same slot (Expects `409 Conflict`).
- `POST /security-arena/simulate/privilege-escalation`: Normal user attempts custodian approval (Expects `403 Forbidden`).
- `POST /security-arena/simulate/tamper-ledger`: Artificially mutates a payload to demonstrate immediate hash detection (Expects integrity alert).
