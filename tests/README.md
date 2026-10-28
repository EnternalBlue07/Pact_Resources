# PACT: Test Suite & Verification Package (`tests/`)

> [!IMPORTANT]
> **TEST SUITE STATUS: NOT RUN**  
> No tests have been executed or pre-built. All test suites described herein represent planned validation specifications to be implemented during the official hackathon build window in Milestone 4.

---

## 1. Test Architecture & Categories

The PACT test suite validates system reliability, data integrity, and security resilience across three complementary tiers:

```
+---------------------------------------------------------------------------------------+
|  1. UNIT & SERVICE TESTS (Fast & Isolated)                                            |
|  - Validates cryptographic SHA-256 hash chaining calculation                          |
|  - Evaluates Zero-Trust qualification gate logic                                      |
|  - Validates Fair Access quota counting and cooldown intervals                        |
+---------------------------------------------------------------------------------------+
|  2. API INTEGRATION TESTS (End-to-End State Machine)                                  |
|  - Tests full 10-step lifecycle across HTTP REST endpoints                            |
|  - Simulates concurrent submissions to verify row-level lock concurrency              |
|  - Tests negative boundary conditions (expired tokens, invalid roles)                 |
+---------------------------------------------------------------------------------------+
|  3. SECURITY ARENA DIAGNOSTICS (Attack Vector Simulations)                            |
|  - Token replay attack simulation (HTTP 400 rejection)                                |
|  - Double-booking race attack simulation (HTTP 409 conflict)                          |
|  - Privilege escalation attack simulation (HTTP 403 forbidden)                        |
|  - Audit ledger payload mutation simulation (Tamper detection alert)                  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Planned Test Directory Structure

```
tests/
├── conftest.py                # Pytest fixtures: mock database, test clients, seeded roles
├── test_catalog.py            # Resource creation, search queries, category filters
├── test_eligibility.py        # Qualification gate checks (positive & negative)
├── test_booking_state.py      # State machine transitions, overlap locks, double-booking
├── test_handovers.py          # Token generation, expiry countdown, replay prevention
├── test_returns_incidents.py  # Return checklists, condition deltas, admin arbitration
├── test_trust_capsule.py      # SHA-256 block chaining, tampered payload detection
└── test_security_arena.py     # Automated simulation of red-team attack vectors
```

---

## 3. Running the Test Suite (Once Implemented)

```bash
# Execute entire test suite
pytest -v

# Run with coverage report
pytest --cov=app tests/

# Execute security and concurrency tests specifically
pytest -v tests/test_security_arena.py tests/test_booking_state.py
```

See [docs/TEST_PLAN.md](../docs/TEST_PLAN.md) for the complete 22-case validation matrix.
