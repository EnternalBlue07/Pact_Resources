# Security Policy

## Scope & Purpose

PACT (Proof, Authorization, Custody & Trust) is an academic hackathon prototype created for **CodeHack India**. This repository establishes security controls and standards for institutional resource sharing.

## Reporting a Security Concern or Vulnerability

If you identify a vulnerability, potential data exposure, or credential leak:

1. **Do not create a public issue** disclosing sensitive exploits or credentials.
2. Immediately notify the repository maintainers or team members via private channels.
3. If an API key, database secret, or credential is accidentally committed, immediately revoke/rotate the credential, purge it from Git history, and notify the team.

## Hackathon Security Principles

1. **No Real Secrets in Version Control**: All configuration must use environment variables loaded from `.env` (excluded by `.gitignore`). Use `.env.example` as a template with placeholder values only.
2. **Synthetic Data Only**: All test accounts, equipment records, and user identities used during development, testing, and judging demos must be strictly synthetic. Never use real student ID numbers, phone numbers, or private documents.
3. **Defense in Depth**:
   - All authorization checks must be enforced server-side.
   - Handover tokens must be short-lived, single-use, and cryptographically verified.
   - Audit trail records must be cryptographically hashed to provide tamper evidence.
4. **Human Oversight**: The platform incorporates human review for any dispute, condition mismatch, or incident resolution.
