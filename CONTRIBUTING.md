# Contributing to PACT

> **Hackathon**: CodeHack India 2026 (48-hour build)  
> **Repository**: https://github.com/EnternalBlue07/Pact_Resources

Thank you for contributing to **PACT (Proof, Authorization, Custody & Trust)**. These lightweight engineering guidelines ensure seamless parallel collaboration across our 4-member student team during the sprint.

---

## 1. Branch Naming & Git Conventions

All work must occur on descriptive feature branches branched from `main`:

- `feat/<short-description>`: New functionality (e.g. `feat/catalog-search-api`, `feat/handover-token-modal`)
- `fix/<short-description>`: Defect or bug repair (e.g. `fix/timezone-booking-conflict`)
- `docs/<short-description>`: Documentation additions or updates (e.g. `docs/api-contract-freeze`)
- `test/<short-description>`: Unit, integration, or security arena tests (e.g. `test/concurrency-locks`)

### Commit Messages
Write short, imperative commit messages using Conventional Commit prefixes:
- `feat:` New user-facing or API feature
- `fix:` Bug fix
- `docs:` Documentation updates only
- `test:` Adding or modifying tests
- `chore:` Configuration, dependencies, or maintenance

---

## 2. Shared Contract Alignment (Pre-Coding Agreement)

Before starting parallel implementation:
1. **Frontend (Member 1)** and **Backend (Members 2, 3, 4)** must align against the schemas defined in:
   - [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) (Endpoints and JSON payloads)
   - [FLOW.md](FLOW.md) (Booking state machine transitions)
2. **Contract Changes**: If an endpoint parameter or state transition changes during development, the author **must update the relevant markdown file in the exact same pull request**.

---

## 3. Pull Request (PR) Workflow

1. Keep PRs small, focused, and scoped to a single task from [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
2. Use the checklist in `.github/pull_request_template.md`.
3. Before requesting review:
   - Ensure local tests pass: `pytest` exits 0.
   - Ensure linting passes: `ruff check .` exits 0.
   - Verify that **no secrets, API keys, or `.env` files are staged**.
4. At least one peer review is required before merging into `main`.

---

## 4. Local Environment Setup

### Backend Setup (Python 3.12+)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation: `http://127.0.0.1:8000/docs`

### Frontend Setup (Node.js 20+)
```bash
cd frontend
npm install
npm run dev
```
Local dev application: `http://localhost:5173`

---

## 5. Honest Attribution & Team Ledger

Every team member must log their implemented deliverables, PR references, and verification status in [docs/TEAM_CONTRIBUTIONS.md](docs/TEAM_CONTRIBUTIONS.md) to maintain transparent, honest attribution for CodeHack India evaluation.
