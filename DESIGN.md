# Design System: PACT Institutional Trust Architecture

<!-- impeccable:design-schema 1 -->

## Design Philosophy

PACT is built for high-stakes institutional hardware and laboratory resource sharing. The interface embodies **Institutional Authority, Cryptographic Transparency, and Tactical Ergonomics**. It eschews superficial SaaS eye-candy and generic glassmorphic blur in favor of high-contrast readability, precise informational hierarchy, and instant situational awareness.

---

## 1. Color System

### Base & Ground
- **Canvas / Background**: `slate-950` (`#020617`) — deep obsidian ground minimizing eye fatigue in laboratory and dim-light environments.
- **Surface Elevation 1 (Cards, Tables)**: `slate-900` (`#0f172a`) with subtle 1px border `slate-800` (`#1e293b`).
- **Surface Elevation 2 (Modals, Overlays, Active Panels)**: `slate-800` (`#1e293b`) with border `slate-700` (`#334155`).
- **Surface Elevation 3 (Floating Menus, Tooltips)**: `slate-700` (`#334155`).

### Typography & Foreground
- **Primary Text**: `slate-100` (`#f1f5f9`) — 15:1 contrast against base.
- **Secondary / Subtitle Text**: `slate-300` (`#cbd5e1`) — high legibility, never washed-out.
- **Muted / Metadata Text**: `slate-400` (`#94a3b8`) — labels, timestamps, secondary identifiers.
- **Monospace Foreground**: `cyan-300` (`#67e8f9`) for tokens, hashes, and cryptographic keys.

### Brand & Semantic Accents
- **Primary Trust Blue**: `sky-500` (`#0284c7`) / `sky-400` (`#38bdf8`) — primary actions, active navigation, authorization gates.
- **Cryptographic Verification (Success / Intact)**: `emerald-500` (`#10b981`) / `emerald-400` (`#34d399`) — verified prerequisites, valid audit chains, approved bookings, clean returns.
- **Pending / Cautionary (Warning)**: `amber-500` (`#f59e0b`) / `amber-400` (`#fbbf24`) — awaiting approval, 15-minute token expiry countdown, under review.
- **Breach / Damage / Conflict (Destructive)**: `rose-500` (`#f43f5e`) / `rose-400` (`#fb7185`) — tamper alerts, damage incident reports, rejected credentials, race condition blocks.
- **Security Terminal / Raw Logs**: `slate-950` ground with `emerald-400` and `cyan-400` text.

---

## 2. Typography Hierarchy

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Monospace Family**: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace (reserved strictly for cryptographic hashes, token strings, timestamps, and Security Arena terminal commands).
- **Scale**:
  - `Display / Hero Title`: `text-2xl` to `text-3xl font-extrabold tracking-tight text-white`
  - `Section Header`: `text-xl font-bold tracking-tight text-slate-100`
  - `Card Header / Subsection`: `text-base font-semibold text-slate-200`
  - `Body Text`: `text-sm font-normal text-slate-300 leading-relaxed`
  - `Fine Details / Badges`: `text-xs font-medium tracking-wide uppercase`
  - `Cryptographic Code / Monospace`: `text-xs font-mono tracking-tight`

---

## 3. Spatial System & Elevation

- **Grid & Layout**:
  - Container maximum width: `max-w-7xl` (`1280px`) centered with `px-4 sm:px-6 lg:px-8`.
  - Grid rhythm: `gap-6` for main card grids, `gap-4` for compact toolbars and lists.
- **Radius Tokens**:
  - Small elements (Tags, badges, inputs): `rounded-lg` (`8px`)
  - Medium elements (Cards, panels, modal dialogs): `rounded-xl` (`12px`)
  - Large elements (Root modals, security console): `rounded-2xl` (`16px`)
- **Depth & Shadows**:
  - Cards: `shadow-md shadow-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200`
  - Floating Overlays & Modals: `shadow-2xl shadow-black/80 border border-slate-700 backdrop-blur-md bg-slate-900/95`

---

## 4. Component Standards

### 1. Navigation & Persona Switcher
- Fixed top glassmorphic header with subtle border `slate-800/90`.
- Integrated instant Persona Switcher allowing seamless swapping between:
  - 🎓 **Student Researcher** (`Aarav Sharma`)
  - 🔬 **Lab Custodian** (`Prof. Rajesh Rao`)
  - 🏛️ **Institutional Admin** (`Dr. Anita Kapoor`)
  - 🛡️ **Compliance Auditor** (`Inspector Vikram Menon`)
- Live system status pill showing real-time backend connection and database sync.

### 2. Resource Catalog Card
- High-value resource photograph or stylized technical icon.
- Category tag (`High-Value Scientific`, `Advanced Fabrication`, `Specialized Facility`).
- Real-time status indicator (`AVAILABLE`, `IN_USE`, `MAINTENANCE`).
- Prerequisite badge count (e.g. `2 prerequisites required`) with tooltip preview.
- "Request Access" primary action triggering Zero-Trust Gate modal.

### 3. Zero-Trust Access Gate Modal
- Dynamic qualification evaluation for the currently selected persona.
- Green checkmark for satisfied prerequisites, red cross for missing qualifications.
- Active concurrency quota meter (e.g. `1/2 Active Bookings Used`).
- Duration selector (1h to 8h) with datetime calculation.
- Research justification text area.

### 4. Custodian Management Station
- Tabbed workflow (`Pending Requests`, `Active Handovers / Check-ins`, `Return & Inspection`).
- Dual-acknowledgement check-in: Displays the 15-minute single-use secure token with live countdown timer.
- Interactive condition inspection checklist prior to handover.

### 5. Return & Incident Station
- Return condition inspection form (equipment undamaged vs damaged/faulty).
- When clean return is selected: one-click sign-off releasing custody and closing booking.
- When damage/fault is flagged: severity selector (`Minor Wear`, `Component Damage`, `Total Inoperability`), photographic upload simulation, and automatic escalation to `INCIDENT_OPEN`.

### 6. Trust Capsule Verification Ledger
- Interactive visual node chain representing the tamper-evident SHA-256 block ledger.
- Displays `Block #`, `Event Type`, `Actor ID`, `Timestamp`, `Hash`, and `Prev Hash`.
- One-click **"Verify Chain Integrity"** button with animated recalculation of all cryptographic links and instant green checkmark verification banner.

### 7. Security Arena Console
- Interactive attack simulation suite with live terminal feedback:
  - **Attack 1: Token Replay / Expiry Attack** (attempts re-using a consumed or expired 15-min handover token).
  - **Attack 2: Double-Booking Race Condition** (attempts concurrent reservations for the same timeslot).
  - **Attack 3: Database Tampering & Hash Chain Detection** (simulates illicit backend database alteration and verifies instant detection by the Trust Capsule engine).

### 8. Trust Graph View
- SVG interactive topological graph mapping the resource-sharing trust fabric:
  `[Resource] ──► [Zero-Trust Policy] ──► [Booking Request] ──► [Custodian Approval] ──► [Handover Token] ──► [Condition Report] ──► [Trust Capsule Ledger]`

---

## 5. Animation & Motion Design

- **State Transitions**: `transition-all duration-200 ease-out`
- **Verification Pulse**: Subtle emerald pulse on cryptographic integrity check success.
- **Countdown Timer**: High-visibility amber/rose warning threshold when handover tokens reach < 3 minutes remaining.
