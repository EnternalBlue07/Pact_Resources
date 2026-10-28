# PACT: Judge Demonstration Script & Walkthrough

> [!NOTE]
> **DEMONSTRATION RUNBOOK & VIDEO SCRIPT**  
> This script provides a structured 4-minute demonstration narrative designed to showcase all 10 steps of the resource lifecycle, key differentiators, and security mechanisms to CodeHack India evaluators.

---

## Demonstration Setup & Seed State
- Seed environment using the one-click demo seeder.
- Pre-seeded users:
  - **Requester**: Aarav Sharma (`student@pact.local`) — holds `BASIC_ELECTRONICS_SAFETY`, lacks `LASER_SAFETY_1`.
  - **Custodian**: Prof. Rao (`custodian@pact.local`) — in charge of Electronics & Prototyping Lab.
  - **Administrator**: Dr. Kapoor (`admin@pact.local`) — Head of Central Research Facilities.
  - **Auditor**: Inspector Menon (`auditor@pact.local`) — Campus Compliance Auditor.
- Target Resource: *Rigol DS1054Z Digital Oscilloscope* (Asset: `EQ-EE-042`).

---

## 4-Minute Walkthrough Narrative

### Act 1: The Problem & Catalog Discovery (0:00 – 0:45)
1. **Presenter Hook**:
   > *"Across our universities, millions of rupees of precision equipment sits locked in departmental cupboards while students delay their research. Why? Because lab technicians are terrified of unaccounted damage, and students have no transparent way to book or prove custody. We built PACT: Proof Before Access. Evidence After Return."*
2. **Action**: Open the live PACT web portal.
   - Show the searchable catalog of underused equipment and research spaces.
   - Filter by `Category: Equipment` and search for `"Oscilloscope"`.
   - Point out the clear asset metadata, real-time availability indicator, and location badge (*Lab 302*).

### Act 2: Zero-Trust Eligibility Gate & Fair Access (0:45 – 1:30)
1. **Action**: Log in as `student@pact.local`.
   - Click on the *High-Power Laser Cutter*.
   - **Show Defended Edge**: Click "Book". The **Zero-Trust Access Gate** triggers an explainable notice:
     *"Prerequisite Required: You need Laser Safety Level 1 certification before booking this equipment."*
   - Return to the *Digital Oscilloscope* (where the student holds basic safety certification).
   - Select a reservation slot from 2:00 PM to 4:00 PM and enter research justification: *"Capstone robotics signal analysis"*.
   - Submit the booking request. Show status: `PENDING_APPROVAL`.

### Act 3: Custodian Approval & Dual-Ack Handover Handshake (1:30 – 2:30)
1. **Action**: Switch browser to Custodian view (`custodian@pact.local`).
   - Open Custodian Dashboard; view pending booking from Aarav. Click **"Approve"**.
2. **Action**: Switch back to Requester view at physical checkout time.
   - Student clicks **"Generate Handover Token"**.
   - A short-lived token (`PACT-HK-948210`) appears with a 15-minute countdown timer.
3. **Action**: Custodian terminal enters/scans the token.
   - The dual-acknowledgement screen opens.
   - Custodian uploads a baseline condition photo showing clean probe cables and powers-on verification.
   - Custodian clicks **"Confirm Custody Transfer"**.
   - Show state transition: Booking immediately becomes `ACTIVE_CUSTODY`.
   - Point out: *Custody is now legally and digitally established.*

### Act 4: Return Inspection, Incident Handling & Admin Resolution (2:30 – 3:15)
1. **Action**: Simulate the return checkout.
   - Custodian opens return inspection modal.
   - Uploads post-use photo and notices a damaged Channel 2 BNC connector.
   - Custodian checks **"Flag Condition Discrepancy / Incident"** with note: *"Ch2 probe connector cracked"*.
   - Submits return. The booking transitions to `INCIDENT_FLAGGED`. The asset is safely isolated from general booking.
2. **Action**: Switch to Administrator view (`admin@pact.local`).
   - Open **Incident Resolution Console**.
   - Show side-by-side comparison of pre-use baseline photo vs. post-use return photo.
   - Administrator reviews notes and adjudicates: Waives as general wear-and-tear or assesses minor repair fee, restoring the asset to `AVAILABLE`.

### Act 5: Trust Capsule Timeline & Security Arena (3:15 – 4:00)
1. **Action**: Log in as Auditor (`auditor@pact.local`).
   - Open **Trust Replay** for the Oscilloscope.
   - Show the complete chronological timeline: Request ➔ Approval ➔ Handover ➔ Active Custody ➔ Return ➔ Incident Flag ➔ Admin Resolution.
   - Show the verified green cryptographic seal: Every event is chained via SHA-256 hash.
2. **Action**: Open **Security Arena**.
   - Click **"Simulate Replay Attack"**: The system attempts to re-use the spent handover token. The server rejects it live with HTTP 400 Bad Request.
   - Click **"Simulate Double Booking Race"**: Two requests hit the same slot simultaneously; the second is locked out with HTTP 409 Conflict.
3. **Closing Punchline**:
   > *"PACT gives resource owners the proof they need to lend, and gives students the trust they need to build. Proof Before Access. Evidence After Return. Thank you."*
