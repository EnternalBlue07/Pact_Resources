# PACT: Frontend Package (`frontend/`)

> [!NOTE]
> **DEVELOPMENT STATUS: INITIAL SETUP ONLY**  
> No UI components, state management, or functional pages have been pre-implemented. All frontend application code will be authored during the official CodeHack India build window.

---

## 1. Overview & Technology Stack (Provisional)

The frontend application provides the user interfaces for Requesters (students/researchers), Resource Custodians (lab technicians/professors), Department Administrators, and Compliance Auditors.

- **Framework**: React 18 / 19 with [Vite](https://vitejs.dev/)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS
- **Iconography**: Lucide React
- **State & Networking**: Native React Hooks / Fetch API mapped directly to [docs/API_CONTRACTS.md](../docs/API_CONTRACTS.md)

---

## 2. Planned Directory Structure (To Be Implemented in Milestone 1)

```
frontend/
├── public/                 # Static public assets, favicon, campus logos
├── src/
│   ├── api/                # Strongly-typed API clients and fetch helpers
│   ├── assets/             # Images, sample equipment photos
│   ├── components/         # Reusable atomic UI components
│   │   ├── Navbar.tsx      # Navigation header with role badge & profile
│   │   ├── Badge.tsx       # Status badges (AVAILABLE, ACTIVE_CUSTODY, etc.)
│   │   ├── Modal.tsx       # Accessible dialog modal wrapper
│   │   ├── Button.tsx      # High-contrast buttons with loading spinners
│   │   └── Card.tsx        # Resource catalog card
│   ├── context/            # AuthContext (JWT session, current user role)
│   ├── pages/              # Primary route views
│   │   ├── CatalogPage.tsx          # Search & faceted catalog browsing
│   │   ├── ResourceDetailPage.tsx   # Asset specifications & calendar view
│   │   ├── CustodianDashboard.tsx   # Pending approvals & handover check-in
│   │   ├── HandoverModal.tsx        # Dual-ack token display & condition checklist
│   │   ├── IncidentConsole.tsx      # Side-by-side photographic return inspection
│   │   ├── TrustReplayTimeline.tsx  # Chronological cryptographic hash timeline
│   │   └── SecurityArena.tsx        # Interactive attack vector simulation console
│   ├── types/              # TypeScript interface definitions matching backend schemas
│   ├── App.tsx             # Root component and client-side view router
│   ├── main.tsx            # Application entrypoint
│   └── index.css           # Tailwind CSS directives & global typography styles
├── index.html              # HTML5 entry with meta tags
├── package.json            # Node package dependencies (to be created at Hour 4)
├── tsconfig.json           # TypeScript compiler configuration
└── vite.config.ts          # Vite configuration with proxy settings
```

---

## 3. Development Workflow & Commands (Once Initialized)

When the hackathon coding window opens, the frontend will be initialized using:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server with Hot Module Replacement (HMR)
npm run dev

# 3. Type check and build production bundle
npm run build
```

---

## 4. Accessibility & UI Guidelines
- All form inputs must have associated `<label>` tags with descriptive text.
- Focus rings must be visible on all keyboard-navigable elements.
- Color alone must never convey state: always pair colors with icons and explicit text badges.
