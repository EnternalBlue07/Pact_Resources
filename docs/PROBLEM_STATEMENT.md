# Official Problem Statement: CodeHack India

## Track / Theme: Unlock Underused Equipment and Spaces

### 1. Problem Background & Target Settings

Modern educational, research, and institutional campuses invest significant capital in high-value physical assets, including:
- **Specialized Equipment**: Oscilloscopes, digital microscopes, 3D printers, laser cutters, testing apparatus, spectrum analyzers, camera kits.
- **Shared Spaces**: Robotics workcells, sound/podcast booths, clean rooms, testing enclosures, seminar halls, dedicated project bays.

Despite high demand from students, researchers, and innovators, these resources frequently sit idle behind locked doors or departmental silos. This occurs because:
1. **Lack of Visibility**: Potential users do not know what assets exist, their real-time availability, or technical specifications.
2. **Ambiguous Custody & Risk**: Resource owners (professors, lab technicians, department managers) worry about asset damage, unreturned items, or untracked faults with no recourse.
3. **Inefficient Scheduling**: Reliance on paper registers, verbal agreements, or fragmented chat messages leads to double-booking and schedule clashes.
4. **Monopolization & Hoarding**: Without transparent quotas and automated waitlists, well-connected or senior users monopolize high-demand resources.
5. **No Auditable Traceability**: When equipment malfunctions or disappears, it is impossible to determine who had custody when the defect occurred.

**Target Institutional Settings**:
- Higher education colleges, universities, and research institutes.
- Shared maker-spaces, university incubation centers, and technical clubs.
- Cross-departmental academic labs and creative media centers.

---

## 2. The Complete Ten-Step Resource-Sharing Lifecycle

The solution must address the full lifecycle of resource sharing:

1. **Resource Listing / Registration**: Owners register resources with metadata, specifications, custody conditions, and location.
2. **Discovery & Search**: Requesters search and filter resources by category, capability, and time availability.
3. **Eligibility Verification**: Requesters are verified against prerequisite qualifications, safety training, or department permissions.
4. **Booking Request & Allocation**: Requesters submit formal booking requests specifying intended usage window and project rationale.
5. **Approval / Rejection & Waiting List**: Resource owners review and approve/reject requests; automated waiting lists manage conflicting schedules.
6. **Pre-Use Check-In & Condition Documentation**: Mutual handover verification where both parties record current item condition, notes, and photos before custody transfers.
7. **Active Custody & Usage**: The requester holds verified custody of the asset during the approved window, with clear countdowns and usage boundaries.
8. **Check-Out & Return Verification**: Item is returned; receiving party inspects condition, records post-use notes/evidence, and confirms custody return.
9. **Damage, Delay & Incident Handling**: Structured reporting for discrepancies, physical damage, late returns, or missed handovers with escalation for human dispute resolution.
10. **Audit History & Feedback**: Immutable or tamper-evident logging of the entire transaction, state changes, and condition reports for institutional auditing and user feedback.

---

## 3. Core Functional Requirements Mandated by Organizers

### A. Resource Listings, Search & Discovery
- Detailed resource catalog with metadata: name, category, asset tags, location, operating guidelines, availability calendars, and owner details.
- Real-time search and multi-parameter filtering (by status, space vs. equipment, eligibility requirements).

### B. Eligibility & Verification
- Clear verification rules (e.g., student level, department, lab safety training certification).
- Immediate, explainable feedback if a user is ineligible to book a specific resource.

### C. Booking Approval, Rejection & Waitlists
- Resource-owner dashboard to approve, reject, or request clarification on pending bookings.
- Automated waitlist mechanism that queues requests when a resource is booked and automatically notifies or promotes waitlisted users upon cancellation.
- Strict prevention of double-booking or overlapping custody intervals.

### D. Check-In, Check-Out & Before/After Condition Documentation
- Dual-acknowledgement check-in process ensuring both borrower and custodian confirm the physical transfer.
- Capture of pre-use condition notes and baseline photographic or checklist evidence.
- Dual-acknowledgement check-out upon return, with side-by-side post-use inspection and condition delta recording.

### E. Damage, Delay, Cancellation & Incident Handling
- Structured incident reporting workflows for damage, malfunction, late returns, or no-shows.
- Escalation path for lab managers or department heads to review flagged discrepancies and resolve disputes.

### F. Fair Allocation & Preventing Monopolization
- Configurable resource limits (e.g., maximum active bookings per student, maximum hours per week, cooldown intervals).
- Transparent allocation logic so users understand queue position and quota limits.

### G. Role-Based Access, Privacy & Human Oversight
- Distinct institutional roles: Requesters (Students/Researchers), Resource Custodians (Lab Technicians/Owners), Department Administrators, and Compliance Auditors.
- Protection of sensitive user data while preserving auditability of operational events.
- Human-in-the-loop oversight for all consequential decisions, penalties, or dispute resolutions.

---

## 4. Required Submission Deliverables

Each team must submit:
1. **Publicly / Judge-Accessible Deployed Application URL**: A functional, accessible live web application.
2. **Accessible Source-Code Repository**: A clean Git repository with clear README, setup instructions, and honest attribution.
3. **Project Presentation / Comprehensive PDF**: Detailed deck/document describing problem, architecture, workflow, evidence of execution, and evaluation.
4. **Use Case & Target User Definition**: Clear institutional use case and user personas.
5. **Technical Architecture & Data Model**: Schemas, workflows, and system design documentation.
6. **Technology Disclosure**: Full accounting of AI coding tools, open-source libraries, APIs, and pre-existing assets used.
7. **Demonstration Video / Walkthrough**: Clear demonstration walking through the end-to-end lifecycle and incident resolution.
8. **Test Instructions & Judge Credentials**: Dedicated test accounts for each role (requester, custodian, administrator) with sample seeded data.
9. **Individual Contribution Ledger**: Verification of each team member's specific contributions to the build.

---

## 5. Official Judging Categories and Weights

The project will be evaluated across seven distinct categories totaling **100 points**:

| # | Judging Category | Weight | Description |
| :---: | :--- | :---: | :--- |
| **1** | **Understanding of the Problem** | **15 pts** | Depth of analysis of underutilized campus equipment/spaces, user pain points, and institutional trust dynamics. |
| **2** | **Strength of the Core Solution** | **20 pts** | Practicality, coherence, and usability of the proposed resource-sharing platform and custody lifecycle. |
| **3** | **Working End-to-End Product** | **20 pts** | Fully functioning software demonstrating discovery, booking, handover, return, and incident handling without broken flows. |
| **4** | **Technical Depth and Reliability** | **15 pts** | Quality of architecture, code structure, data integrity, error handling, performance, and automated test coverage. |
| **5** | **Trust, Safety and Accountability** | **10 pts** | Strength of custody tracking, before/after condition evidence, tamper-evident audit logs, and security controls. |
| **6** | **Fair Allocation and Accessibility** | **10 pts** | Implementation of anti-hoarding rules, transparent waitlists, explainable quotas, and accessible, responsive design. |
| **7** | **Originality and Real-World Potential** | **10 pts** | Novelty of differentiators, feasibility of campus adoption, and clear pathway toward scalable institutional impact. |
| **Total** | **Official Evaluation Total** | **100 pts** | |

---

*Note: All PACT design documents, requirements, and test plans must directly trace back to this official problem statement.*
