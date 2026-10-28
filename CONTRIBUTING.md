# Contributing to PACT

Thank you for contributing to **PACT (Proof, Authorization, Custody & Trust)** for **CodeHack India**.

## 1. Development Integrity & Hackathon Policy

All implementation must take place during the official CodeHack India build window. Pre-built functional code or third-party solutions that violate competition guidelines are strictly prohibited.

- **Current Repository Phase**: Repository and documentation initialization only.
- **Honest Attribution**: All team contributions must be recorded transparently in [TEAM_CONTRIBUTIONS.md](docs/TEAM_CONTRIBUTIONS.md).

## 2. Branch Naming Conventions

All team members must work on feature branches branched from `main` (or `master`):

- `feat/<short-description>`: New planned feature implementation (e.g., `feat/booking-request-flow`).
- `fix/<short-description>`: Bug or defect correction (e.g., `fix/double-booking-race-condition`).
- `docs/<short-description>`: Documentation additions or revisions (e.g., `docs/update-api-contracts`).
- `test/<short-description>`: Unit, integration, or end-to-end test cases (e.g., `test/token-expiry-tests`).
- `refactor/<short-description>`: Code restructuring without functional changes.

## 3. Commit Guidelines

- Write small, focused, and descriptive commits.
- Use Conventional Commit prefixes:
  - `feat:` New functionality
  - `fix:` Bug fix
  - `docs:` Documentation only
  - `test:` Adding or updating tests
  - `chore:` Maintenance, dependency updates, configuration
  - `refactor:` Code refactoring
- **Never commit secrets**: Check `git status` and diff before committing to ensure `.env` or sensitive credentials are not staged.

## 4. Pull Request (PR) Workflow

1. Before opening a PR, ensure local tests pass and linters report no syntax or formatting errors.
2. PR titles should be concise and reference the relevant task from [TEAM_TASK_BOARD.md](planning/TEAM_TASK_BOARD.md).
3. Use the PR template provided at `.github/pull_request_template.md`.
4. At least one peer review is required before merging into the main branch.
5. If an API contract, data model, or workflow behaviour changes, update the relevant documentation in `docs/` simultaneously in the same PR.

## 5. Development Workflow Agreement

To ensure smooth parallel development across all 4 team members:
1. **Contracts First**: Shared API contracts ([API_CONTRACTS.md](docs/API_CONTRACTS.md)) and state transition rules ([PRODUCT_WORKFLOW.md](docs/PRODUCT_WORKFLOW.md)) must be agreed upon before frontend and backend work streams diverge.
2. **Deterministic Mocking**: During initial phases, frontend and backend will align against identical JSON payload schemas.
3. **Continuous Integration**: Merge frequently to avoid large, breaking merge conflicts near submission deadlines.
