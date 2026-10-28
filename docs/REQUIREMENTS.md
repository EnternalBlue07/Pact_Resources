# PACT: Requirements Specification

This document details the functional and non-functional requirements for the PACT platform, prioritized into **P0 (Essential Hackathon MVP)**, **P1 (Trust & Integrity Features)**, **P2 (Usability & Polish Enhancements)**, and **Out of Scope**.

Every requirement includes a concise, testable acceptance criterion.

---

## 1. P0 Requirements: Essential End-to-End Workflow

P0 requirements constitute the minimum viable product required to demonstrate the complete 10-step resource lifecycle during the hackathon evaluation.

| ID | Feature / Capability | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-P0-01** | **User Role Profiles** | System supports 4 distinct user roles: Requester, Custodian, Administrator, Auditor. | When logged in, the UI and API restrict actions according to the authenticated user's role profile. |
| **REQ-P0-02** | **Resource Catalog & Search** | Custodians can list equipment/spaces with name, category, specs, location, and photos. Users can browse and filter. | Requester can search by keyword, filter by category/availability, and view resource details. |
| **REQ-P0-03** | **Eligibility Check** | System checks user qualifications (training status, department) before allowing booking submission. | If a user lacks the required prerequisite, the booking button is disabled and an explanatory requirement message is shown. |
| **REQ-P0-04** | **Booking Request & Approval** | Requesters submit booking requests for a specific time window. Custodians can Approve or Reject. | Requester submits time window; Custodian sees pending request and clicks Approve; booking state changes to `APPROVED`. |
| **REQ-P0-05** | **Double-Booking Prevention** | System strictly prevents overlapping approved bookings for the same physical resource. | An attempt to approve or book an already-booked time slot returns an HTTP 409 Conflict error. |
| **REQ-P0-06** | **Pre-Use Handover & Check-In** | Custodian initiates check-in; both parties confirm physical transfer and record baseline condition notes. | Handover state changes from `APPROVED` to `ACTIVE_CUSTODY`; initial condition notes and timestamp are recorded. |
| **REQ-P0-07** | **Active Custody Tracking** | System displays the current custodian, checkout timestamp, and scheduled return time. | Both Requester and Custodian dashboards reflect active custody status with time remaining indicator. |
| **REQ-P0-08** | **Check-Out & Return Verification** | Borrower returns item; Custodian conducts return inspection, records condition notes, and completes return. | Booking transitions from `ACTIVE_CUSTODY` to `RETURNED`; return timestamp and final inspection notes are saved. |
| **REQ-P0-09** | **Incident & Damage Reporting** | Custodians or borrowers can flag damaged items, late returns, or missing components during return. | If flagged, booking transitions to `INCIDENT_FLAGGED`, preventing automatic close until reviewed by an Administrator. |

---

## 2. P1 Requirements: Trust, Security & Audit Features

P1 requirements represent PACT's core differentiators that elevate the solution from a standard booking app to a verifiable trust platform.

| ID | Feature / Capability | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-P1-01** | **Dual-Ack Handover Tokens** | Check-in requires a short-lived (15 min), single-use cryptographic token presented by Requester and validated by Custodian. | Expired or reused tokens are rejected; successful validation requires both parties' digital handshake. |
| **REQ-P1-02** | **Trust Capsule (Hash Chaining)** | Every custody event (Request, Approval, Handover, Return, Incident) generates an immutable record chained via SHA-256 hash. | Each event record stores `prev_hash` and `current_hash`. Any manual mutation of historical records breaks the hash verification. |
| **REQ-P1-03** | **Condition Evidence Capture** | Users upload baseline photos at check-in and return photos at check-out for side-by-side visual comparison. | System stores photographic evidence URLs alongside timestamps, viewable in a side-by-side comparison modal. |
| **REQ-P1-04** | **Fair Access Quota Engine** | System limits maximum active bookings per user (e.g., max 2 active bookings, max 10 hours/week) to prevent hoarding. | A requester exceeding active quota cannot submit new requests until active bookings are returned. |
| **REQ-P1-05** | **Automated Waiting List** | If a resource is booked, requesters can join an automated waitlist with transparent position tracking. | Upon cancellation of an approved booking, the #1 waitlisted requester is notified and offered the reservation slot. |
| **REQ-P1-06** | **Trust Replay Audit Timeline** | Read-only interactive timeline rendering the complete lifecycle history of any resource or transaction. | Auditor can select a resource and view chronological, filterable events with actor IDs, timestamps, and hash status. |
| **REQ-P1-07** | **Security Arena Diagnostic Mode** | Built-in test harnesses that simulate security attacks (replay attacks, privilege escalation, double-booking races). | Security dashboard executes attack payloads against the backend API and demonstrates successful defenses. |

---

## 3. P2 Requirements: Usability, Accessibility & Polish

P2 requirements enhance user delight, operational efficiency, and accessibility.

| ID | Feature / Capability | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **REQ-P2-01** | **Accessible UI & Screen Reader Support** | WCAG 2.1 AA compliant contrast ratios, full keyboard navigability, and descriptive ARIA labels. | All forms and buttons are navigable via Tab/Enter keys; color contrast passes standard automated audit. |
| **REQ-P2-02** | **Explainable Decision Banners** | Plain-language explanations whenever an action is blocked (e.g., why eligibility failed or why waitlist is prioritized). | Error states display friendly, actionable advice rather than raw HTTP error codes. |
| **REQ-P2-03** | **Mock QR Code Handover Simulation** | Visual simulation of scanning a mobile QR code on desktop to complete the handover handshake. | Requester displays QR code modal; Custodian clicks "Simulate Scan" to trigger token verification seamlessly. |
| **REQ-P2-04** | **Incident Resolution Workflow** | Administrator interface to review incident evidence, assign blame or waiver, and restore resource to service. | Administrator marks incident as `RESOLVED_WAIVED` or `RESOLVED_PENALTY`, unlocking the resource for new bookings. |
| **REQ-P2-05** | **One-Click Demo Data Seeder** | Setup utility that resets and seeds the platform with realistic students, labs, equipment, and historical bookings. | Clicking "Seed Demo Environment" populates 6+ resources, 4 users, and a pre-existing incident for instant evaluation. |

---

## 4. Explicitly Out of Scope for the 48-Hour Hackathon Build

To guarantee reliable execution, the following features are strictly deferred:
- Physical IoT hardware locks, electromagnetic door controllers, or RFID badge reader integration.
- Public blockchain smart contracts and gas-based token transactions.
- Automated AI computer vision damage detection (simulated via structured human before/after photographic comparison).
- Payment gateways, monetary deposits, or student bank account integration.
- External LDAP / Active Directory institutional SSO sync (simulated with local institutional role accounts).
