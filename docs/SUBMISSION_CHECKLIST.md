# PACT: Final Submission Checklist

> [!IMPORTANT]
> **CODEHACK INDIA FINAL SUBMISSION VERIFICATION RUNBOOK**  
> Every item in this checklist must be reviewed, verified, and checked off by the team prior to final submission.

---

## 1. Submission Deliverables Checklist

### 1.1. URLs & Public Accessibility
- [ ] **Live Deployed Application URL**: Deployed on public cloud and accessible via HTTPS without authentication barriers or dead links.
  - Production URL: `[To be inserted upon deployment]`
- [ ] **Source-Code Repository URL**: Public or judge-accessible Git repository containing clean history and documentation.
  - Repository URL: `[To be inserted upon push to GitHub]`
- [ ] **Demonstration Video URL**: 3–5 minute video demonstrating the working end-to-end 10-step lifecycle and incident flow.
  - Video Link: `[To be inserted upon recording]`
- [ ] **Comprehensive Project Presentation PDF**: Slide deck or comprehensive PDF summarizing problem, architecture, and results.
  - PDF Link: `[To be inserted upon compilation]`

### 1.2. Core Content & Documentation Requirements
- [ ] **Use Case & Target Users Defined**: Documented in [docs/PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).
- [ ] **Problem Rationale & Lifecycle**: Documented in [docs/PROBLEM_STATEMENT.md](PROBLEM_STATEMENT.md).
- [ ] **Proposed Solution & Workflow**: Complete 10-step flow documented in [docs/PRODUCT_WORKFLOW.md](PRODUCT_WORKFLOW.md).
- [ ] **Implemented Features vs. Unfinished Work**: Transparently itemized in [docs/REQUIREMENTS.md](REQUIREMENTS.md) and [docs/KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).
- [ ] **Technology Stack & Architecture**: Detailed diagrams and choices documented in [docs/ARCHITECTURE.md](ARCHITECTURE.md).
- [ ] **AI, API, Library & Template Disclosure**: Full attestation in [docs/TECHNOLOGY_DISCLOSURE.md](TECHNOLOGY_DISCLOSURE.md).
- [ ] **Privacy, Security & Fairness**: Documented in [docs/SECURITY_MODEL.md](SECURITY_MODEL.md) and [docs/FAIRNESS_AND_ACCESSIBILITY.md](FAIRNESS_AND_ACCESSIBILITY.md).
- [ ] **Known Limitations & Future Scope**: Documented in [docs/KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) and [docs/FUTURE_SCOPE.md](FUTURE_SCOPE.md).

### 1.3. Evaluation & Credentials
- [ ] **Test Instructions & Judge Credentials**: Dedicated accounts pre-seeded for testing:
  - **Requester Account**: `student@pact.local` / `student123`
  - **Custodian Account**: `custodian@pact.local` / `custodian123`
  - **Administrator Account**: `admin@pact.local` / `admin123`
  - **Auditor Account**: `auditor@pact.local` / `auditor123`
- [ ] **One-Click Demo Environment**: Seeding utility verified functional on live production instance.

### 1.4. Team & Governance
- [ ] **Complete Team Details**: All 4 team members' names, emails, and roles verified in [docs/TEAM_CONTRIBUTIONS.md](TEAM_CONTRIBUTIONS.md).
- [ ] **Individual Contribution Ledger**: Specific PRs, components, and tasks attributed to each member.
- [ ] **Individual Submission Forms**: Every individual team member has submitted their respective hackathon form before the portal deadline.

---

## 2. Final Technical Sanity Checks (Hour 46–47)

- [ ] **Zero Secrets in Git**: Run `git log -p` or repository scanning tool to ensure no API keys, private keys, or credentials were committed.
- [ ] **Clean Browser Console**: Verify zero unhandled React warnings or errors during typical user flow.
- [ ] **Mobile Responsiveness**: Test UI on smartphone or simulated mobile viewport (375px width).
- [ ] **Clean Readme & Markdown Links**: All internal relative markdown links in README.md and docs/ resolve correctly.
- [ ] **Incognito Window Test**: Open live URL in an incognito/private browser session to ensure no developer-only cookies or cached tokens are required.
