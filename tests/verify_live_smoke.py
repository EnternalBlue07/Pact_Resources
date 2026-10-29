"""
PACT Live Deployment Verification & Smoke Test Script
Executes end-to-end integration probes against a live internet-deployed PACT backend.

Usage:
    python tests/verify_live_smoke.py https://pact-backend.onrender.com
    python tests/verify_live_smoke.py http://127.0.0.1:8000
"""

import sys
import json
import httpx
from datetime import datetime, timezone, timedelta

def run_smoke_tests(base_url: str):
    base_url = base_url.rstrip("/")
    print("=" * 65)
    print(f" PACT Live Deployment Smoke Test Suite")
    print(f" Target Host: {base_url}")
    print(f" Timestamp:   {datetime.now(timezone.utc).isoformat()}")
    print("=" * 65)

    passed_count = 0
    total_count = 0

    client = httpx.Client(timeout=60.0) # Render cold-start can take up to 50s

    def log_result(step_num: int, title: str, passed: bool, detail: str = ""):
        nonlocal passed_count, total_count
        total_count += 1
        status_label = "[PASS]" if passed else "[FAIL]"
        if passed:
            passed_count += 1
        print(f"  {status_label} Step {step_num}: {title}")
        if detail:
            print(f"         > {detail}")

    # 1. Root Health Check
    try:
        r = client.get(f"{base_url}/health")
        passed = (r.status_code == 200 and r.json().get("status") == "ok")
        log_result(1, "Root Health Check (/health)", passed, f"HTTP {r.status_code} | Env: {r.json().get('environment', 'unknown')}")
    except Exception as e:
        log_result(1, "Root Health Check (/health)", False, f"Connection error: {e}")
        print("\n[ABORT] Could not reach base URL. Is the server online?")
        return False

    # 2. API v1 Health Check
    try:
        r = client.get(f"{base_url}/api/v1/health")
        passed = (r.status_code == 200 and r.json().get("status") == "ok")
        log_result(2, "API v1 Health Check (/api/v1/health)", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_result(2, "API v1 Health Check (/api/v1/health)", False, str(e))

    # 3. Catalog Discovery
    resource_id = "res-printer3d-02"
    try:
        r = client.get(f"{base_url}/api/v1/resources")
        data = r.json()
        passed = (r.status_code == 200 and isinstance(data, list) and len(data) > 0)
        log_result(3, "Resource Catalog Discovery", passed, f"Found {len(data) if isinstance(data, list) else 0} resources")
        if passed and data:
            resource_id = data[0]["id"]
    except Exception as e:
        log_result(3, "Resource Catalog Discovery", False, str(e))

    # 4. Zero-Trust Eligibility Gate (Negative Test)
    try:
        r = client.get(f"{base_url}/api/v1/resources/res-laser-03/eligibility?user_id=u-student-01")
        data = r.json()
        passed = (r.status_code == 200 and data.get("is_eligible") is False)
        log_result(4, "Zero-Trust Gate Rejection (Safety Rule)", passed, data.get("explanation", ""))
    except Exception as e:
        log_result(4, "Zero-Trust Gate Rejection", False, str(e))

    # 5. Booking Creation
    booking_id = None
    now = datetime.now(timezone.utc)
    try:
        r = client.post(f"{base_url}/api/v1/bookings", json={
            "resource_id": resource_id,
            "requester_id": "u-student-01",
            "start_time": (now + timedelta(hours=4)).isoformat(),
            "end_time": (now + timedelta(hours=6)).isoformat(),
            "purpose": "Automated deployment smoke test verification",
        })
        passed = (r.status_code == 201)
        if passed:
            booking_id = r.json().get("id")
        log_result(5, "Booking Reservation Submission", passed, f"Booking ID: {booking_id}")
    except Exception as e:
        log_result(5, "Booking Reservation Submission", False, str(e))

    # 6. Custodian Booking Approval
    if booking_id:
        try:
            r = client.post(f"{base_url}/api/v1/bookings/{booking_id}/approve?custodian_id=u-custodian-01")
            passed = (r.status_code == 200 and r.json().get("status") == "APPROVED")
            log_result(6, "Custodian Approval Handshake", passed, f"Status: {r.json().get('status')}")
        except Exception as e:
            log_result(6, "Custodian Approval Handshake", False, str(e))

        # 7. Handover Token Generation (15-min ephemeral)
        token = None
        try:
            r = client.post(f"{base_url}/api/v1/handovers/generate-token", json={
                "booking_id": booking_id,
                "requester_id": "u-student-01",
            })
            passed = (r.status_code == 200 and "handover_token" in r.json())
            if passed:
                token = r.json()["handover_token"]
            log_result(7, "Handover Token Generation (15-min)", passed, f"Token: {token}")
        except Exception as e:
            log_result(7, "Handover Token Generation", False, str(e))

        # 8. Dual-Ack Physical Check-In
        if token:
            try:
                r = client.post(f"{base_url}/api/v1/handovers/verify-checkin", json={
                    "booking_id": booking_id,
                    "custodian_id": "u-custodian-01",
                    "handover_token": token,
                    "baseline_condition_notes": "Live smoke test baseline inspection clean.",
                })
                passed = (r.status_code == 200 and r.json().get("status") == "CHECKED_OUT")
                log_result(8, "Dual-Ack Physical Check-In", passed, f"Status: {r.json().get('status')}")
            except Exception as e:
                log_result(8, "Dual-Ack Physical Check-In", False, str(e))

        # 9. Clean Return & Inspection
        try:
            r = client.post(f"{base_url}/api/v1/returns/inspect", json={
                "booking_id": booking_id,
                "custodian_id": "u-custodian-01",
                "return_condition_notes": "Smoke test clean return verified.",
                "flag_incident": False,
            })
            passed = (r.status_code == 200 and r.json().get("status") == "CLOSED")
            log_result(9, "Return Inspection & Clean Custody Close", passed, f"Status: {r.json().get('status')}")
        except Exception as e:
            log_result(9, "Return Inspection & Custody Close", False, str(e))

    # 10. Trust Capsule Cryptographic Chain Verification
    try:
        r = client.get(f"{base_url}/api/v1/audit/verify-chain")
        data = r.json()
        passed = (r.status_code == 200 and data.get("status") == "VALID")
        log_result(10, "Trust Capsule SHA-256 Ledger Verification", passed, f"{data.get('total_blocks_verified')} blocks verified | Status: {data.get('status')}")
    except Exception as e:
        log_result(10, "Trust Capsule Ledger Verification", False, str(e))

    # 11. Production Security Arena Safeguard Probe
    try:
        r = client.post(f"{base_url}/api/v1/audit/simulate-tamper")
        # In production, simulate-tamper must be rejected with 403 Forbidden
        is_prod = (client.get(f"{base_url}/health").json().get("environment") == "production")
        if is_prod:
            passed = (r.status_code == 403)
            log_result(11, "Production Red-Team Safeguard (/simulate-tamper)", passed, f"HTTP {r.status_code} (Properly blocked in production)")
        else:
            passed = (r.status_code == 200)
            log_result(11, "Development Red-Team Check (/simulate-tamper)", passed, f"HTTP {r.status_code} (Active in {r.json().get('status', 'dev')})")
    except Exception as e:
        log_result(11, "Production Safeguard Probe", False, str(e))

    print("=" * 65)
    print(f" Summary: {passed_count} / {total_count} checks passed.")
    if passed_count == total_count:
        print(" RESULT:  LIVE DEPLOYMENT IS FULLY OPERATIONAL AND VERIFIED! [SUCCESS]")
    else:
        print(" RESULT:  SOME CHECKS FAILED. Review output above.")
    print("=" * 65)
    return passed_count == total_count

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
    success = run_smoke_tests(target)
    sys.exit(0 if success else 1)

