# PACT: Project Overview

> **Full Form**: Proof, Authorization, Custody & Trust  
> **Tagline**: *Proof Before Access. Evidence After Return.*  
> **Event**: CodeHack India (48-hour online hackathon)

---

## 1. Executive Summary

**PACT** is a security-first, auditable resource-sharing platform engineered to unlock underutilized physical assets—such as specialized lab equipment, prototyping tools, testing rigs, and specialized creative/academic spaces—across educational and research institutions.

Rather than treating resource booking as a simple calendar reservation, PACT treats every checkout as a **verifiable custody contract**. It ensures that users provide prerequisite proof before receiving access and that verifiable condition evidence is captured before and after use, eliminating disputes and protecting valuable community assets.

---

## 2. Institutional Context & Target Setting

PACT is designed for modern campus ecosystems where valuable equipment and facilities are owned by individual departments, labs, or faculty members, but could provide massive value to the wider institutional community if shared safely:

- **Engineering & Science Colleges**: University labs holding oscilloscopes, thermal cameras, spectrum analyzers, centrifuges, and CNC mills.
- **Innovation Centers & FabLabs**: Shared maker spaces with 3D printers, laser cutters, PCB milling machines, and AR/VR development gear.
- **Media & Design Schools**: Sound-treated recording studios, broadcast cameras, lighting rigs, and editing workstations.
- **Student Clubs & Project Teams**: Multi-disciplinary teams requiring temporary access to equipment outside their immediate home departments.

---

## 3. User Personas & Stakeholder Roles

PACT defines four primary institutional roles, each with explicit rights, duties, and interfaces:

| Role | Persona | Key Needs & Objectives | PACT Interaction |
| :--- | :--- | :--- | :--- |
| **Requester** | Student, Researcher, Club Lead | Needs easy discovery of high-grade equipment, clear eligibility guidelines, quick booking, and fair queue placement. | Searches catalog, submits eligibility proofs, books slots, participates in dual-handover, uploads return evidence. |
| **Resource Custodian** | Lab Technician, Equipment In-Charge, Faculty | Needs protection against asset damage, proof of condition, automated queue handling, and zero unauthorized access. | Lists assets, defines eligibility requirements, approves/rejects requests, conducts check-in/out handshakes, flags incidents. |
| **Department Administrator** | Lab Director, Department Head | Needs high resource utilization metrics, dispute resolution oversight, anti-hoarding controls, and quota enforcement. | Monitors departmental utilization, reviews flagged damage incidents, arbitrates disputes, adjusts allocation quotas. |
| **Compliance Auditor** | Campus Auditor, Safety Inspector | Needs tamper-evident historical audit records, proof of safety training adherence, and maintenance traceability. | Inspects Trust Replay timeline, exports audit trails, verifies cryptographic integrity hashes across custody records. |

---

## 4. Intended Product Value Proposition

### For Requesters
- **Democratized Access**: Transparent discovery of assets previously hidden behind departmental silos.
- **Protection from Unfair Blame**: Baseline condition documentation ensures borrowers are never blamed for pre-existing defects or wear.
- **Fair Allocation**: Automated waitlists and quota rules ensure access is distributed meritocratically rather than by seniority or personal connections.

### For Resource Owners & Custodians
- **Guaranteed Accountability**: Cryptographic handover handshakes and condition photographs eliminate the "he-said-she-said" of damaged equipment.
- **Automated Gatekeeping**: Only requesters with verified certifications (e.g., safety training) can request sensitive machinery.
- **Reduced Administrative Overhead**: Automated reminders, waitlist promotions, and structured return checklists minimize manual tracking.

### For Institutions
- **Maximized ROI**: Multi-million-rupee lab assets transition from sitting idle 80% of the week to safely serving active campus research.
- **Auditable Safety Compliance**: Clear evidence that operators held proper qualifications, supporting institutional insurance and accreditation requirements.

---

## 5. System Scope & Operational Boundaries

To ensure focus and clarity during the 48-hour hackathon, PACT defines strict operational boundaries:

### In Scope (Intended Product Capabilities)
- Digital resource catalog with structured metadata and filtering.
- Eligibility rules enforcement (checking role, training, and prerequisite status).
- Booking state machine (Pending ➔ Approved ➔ Active Custody ➔ Returned ➔ Completed).
- Dual-acknowledgement handover using short-lived, single-use digital tokens.
- Pre-use and post-use condition reporting with photographic or checklist evidence.
- Incident and discrepancy reporting (damage, late return, missing parts).
- Anti-monopolization quota enforcement and automated waitlists.
- Tamper-evident transaction logging (hash-chained custody records).

### Explicitly Out of Scope
- **Physical Hardware Interfacing**: No direct physical electronic integration with hardware interlocks or RFID card turnstiles (simulated via digital handshake tokens).
- **Financial Processing / Payment Gateways**: PACT operates on institutional access quotas, credits, and permissions; financial rental transactions are not part of the core model.
- **Biometric Identity Hardware**: PACT relies on institutional authentication tokens and session credentials rather than physical fingerprint scanners.
- **Decentralized Public Blockchain**: PACT achieves high performance and zero transaction costs using an internal cryptographic hash-chain ledger rather than an external gas-intensive blockchain.
