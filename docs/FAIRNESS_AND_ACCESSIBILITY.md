# PACT: Fairness, Allocation & Accessibility Specification

> [!NOTE]
> This document specifies the planned rules, algorithms, and design conventions ensuring equitable resource distribution and inclusive access across diverse student and researcher populations.

---

## 1. The Campus Resource Dilemma: Why Fairness Matters

On institutional campuses, resource access often defaults to informal power dynamics:
- Senior researchers or influential lab members monopolize high-demand equipment for weeks.
- Junior students or researchers from non-host departments are turned away or ignored.
- High-demand slots (e.g., final-year capstone submission weeks) trigger cutthroat competition.

PACT replaces arbitrary gatekeeping with an **explainable, transparent, and algorithmic Fair Access Engine**.

---

## 2. Fair Access Engine: Core Allocation Rules

### 2.1. Concurrency Limits (Active Booking Quotas)
- To prevent asset hoarding, each student is assigned an active booking quota (default: **maximum 2 concurrent active/approved bookings**).
- Once a student holds 2 approved or in-custody reservations, further booking requests are locked until one resource is verified returned.
- *Explainable User Feedback*: *"You currently hold 2 active bookings (the maximum allowed). Return a resource before requesting another."*

### 2.2. Duration Caps & Mandatory Cooldown Periods
- Every resource defines a `max_duration_hours` (e.g., maximum 4 hours per session for a 3D printer).
- Following checkout, the same user cannot re-book that specific physical resource within a `cooldown_minutes` window (e.g., 2 hours).
- This ensures another community member has an opportunity to utilize the machine.

### 2.3. Explainable Waiting List Engine
When a high-demand slot is already reserved:
1. Requesters can click **"Join Waitlist"**.
2. Queue priority is calculated deterministically based on:
   - **Queue Timestamp**: First-come, first-served.
   - **Recent Usage History**: Requesters who have used the resource less in the past 14 days receive priority over heavy repeat users.
3. If an approved booking is cancelled or lapses due to a `NO_SHOW` (30-minute grace period expiry), the #1 waitlist candidate is automatically promoted and notified.
4. The user has 60 minutes to confirm the reservation before the slot passes to candidate #2.

---

## 3. Human-Reviewed Exceptions & Appeals

Algorithmic rules must never override genuine academic emergencies:
- **Urgent Project Exceptions**: Students working on time-critical grant deadlines or national competitions can request a quota override from their Department Head.
- **Dispute Appeal**: If an automated incident or late penalty is flagged, the user can submit a one-click appeal accompanied by an explanatory note. All penalties remain pending until a human administrator conducts an in-person review.

---

## 4. Digital Accessibility & Inclusive Design (WCAG 2.1 AA)

PACT is designed to ensure all students, including those with visual, motor, or cognitive impairments, can navigate and reserve campus resources seamlessly.

### 4.1. Visual & Contrast Standards
- Complies with WCAG 2.1 AA contrast requirements (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
- Never relies on color alone to convey status (e.g., state badges combine colored backgrounds, high-contrast text, and unique status icons).

### 4.2. Keyboard Navigation & Assistive Technology
- 100% interactive elements (buttons, inputs, dropdowns, modal dismissals) are operable via standard keyboard controls (`Tab`, `Shift+Tab`, `Enter`, `Escape`).
- Visible focus rings with high contrast outline around all active controls.
- Screen-reader friendly semantic HTML tags (`<main>`, `<header>`, `<nav>`, `<article>`, `<section>`, `<button>`).
- Explicit `aria-label`, `aria-expanded`, and `aria-live` attributes on dynamic components (e.g., countdown timers, waitlist position badges).

### 4.3. Plain-Language, Actionable Error Messages
- Raw technical error messages (e.g., `500 Internal Error`, `409 Conflict`) are translated into clear, empathetic student guidance.
- Examples:
  - *Instead of:* `403 Forbidden: Missing qualification LASER_SAFETY_1`
  - *PACT displays:* **"Certification Required: You need the Laser Safety Level 1 certificate to book this cutter. [Click here to view free campus training schedule]."**
  - *Instead of:* `409 Conflict: Slot overlapping with ID 482`
  - *PACT displays:* **"Slot Unavailable: This equipment is already reserved from 10:00 AM to 2:00 PM. Would you like to join the waitlist or pick another time?"**
