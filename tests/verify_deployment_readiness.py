"""
PACT Deployment & End-to-End Integration Verification Script
Verifies all 9 core operational checks on the running FastAPI application.
"""

import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.scripts.seed_demo import seed_database

# Ensure database is initialized & seeded
seed_database()

client = TestClient(app)

def run_all_checks():
    print("=== 1. Health Endpoints ===")
    r_health = client.get("/health")
    assert r_health.status_code == 200, f"Expected 200, got {r_health.status_code}"
    assert r_health.json()["status"] == "ok"
    r_v1_health = client.get("/api/v1/health")
    assert r_v1_health.status_code == 200
    print("  [PASS] /health and /api/v1/health return ok")

    print("=== 2. Catalog Discovery ===")
    r_res = client.get("/api/v1/resources")
    assert r_res.status_code == 200
    resources = r_res.json()
    assert len(resources) > 0
    print(f"  [PASS] Catalog returns {len(resources)} items")

    print("=== 3. Eligibility Rejection ===")
    r_elig = client.get("/api/v1/resources/res-laser-03/eligibility?user_id=u-student-01")
    assert r_elig.status_code == 200
    data_elig = r_elig.json()
    assert data_elig["is_eligible"] is False
    assert "LASER_SAFETY_1" in data_elig["missing_qualifications"]
    print(f"  [PASS] Ineligible user correctly rejected: {data_elig['explanation']}")

    print("=== 4. Booking and Custodian Approval ===")
    now = datetime.now(timezone.utc)
    r_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-printer3d-02",
        "requester_id": "u-student-01",
        "start_time": (now + timedelta(hours=3)).isoformat(),
        "end_time": (now + timedelta(hours=5)).isoformat(),
        "purpose": "Robotics chassis rapid prototyping test",
    })
    assert r_book.status_code == 201
    booking_id = r_book.json()["id"]
    r_approve = client.post(f"/api/v1/bookings/{booking_id}/approve?custodian_id=u-custodian-01")
    assert r_approve.status_code == 200
    assert r_approve.json()["status"] == "APPROVED"
    print(f"  [PASS] Booking {booking_id} created and approved by custodian")

    print("=== 5. Handover and Acknowledgement ===")
    r_tok = client.post("/api/v1/handovers/generate-token", json={
        "booking_id": booking_id,
        "requester_id": "u-student-01",
    })
    assert r_tok.status_code == 200
    token = r_tok.json()["handover_token"]

    r_checkin = client.post("/api/v1/handovers/verify-checkin", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "handover_token": token,
        "baseline_condition_notes": "Printer nozzle clean, bed leveled.",
    })
    assert r_checkin.status_code == 200
    assert r_checkin.json()["status"] == "CHECKED_OUT"
    print("  [PASS] Token verified and custody transferred to CHECKED_OUT")

    print("=== 6. Return and Condition Reporting (Damage Incident) ===")
    r_return = client.post("/api/v1/returns/inspect", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "return_condition_notes": "Filament feeder jam, minor gear wear.",
        "flag_incident": True,
        "incident_type": "PHYSICAL_DAMAGE",
        "incident_severity": "MEDIUM",
        "incident_description": "Gear stepper motor stalled during print.",
    })
    assert r_return.status_code == 200
    assert r_return.json()["status"] == "INCIDENT_OPEN"
    print("  [PASS] Return inspection flagged incident; status set to INCIDENT_OPEN")

    print("=== 7. Trust Capsule Chain Verification ===")
    r_chain = client.get("/api/v1/audit/verify-chain")
    assert r_chain.status_code == 200
    assert r_chain.json()["status"] == "VALID"
    print(f"  [PASS] Trust Capsule chain valid: {r_chain.json()['total_blocks_verified']} blocks verified")

    print("=== 8. Incident Resolution ===")
    r_incs = client.get("/api/v1/returns/incidents")
    assert r_incs.status_code == 200
    incidents = r_incs.json()
    incident_id = incidents[0]["id"]
    r_resolve = client.post(f"/api/v1/returns/incidents/{incident_id}/resolve", json={
        "admin_id": "u-admin-01",
        "decision": "RESOLVED_WAIVED",
        "resolution_notes": "Jammed filament cleared and tested operational by administrator.",
    })
    assert r_resolve.status_code == 200
    assert r_resolve.json()["status"] == "CLOSED"
    print(f"  [PASS] Incident {incident_id} successfully resolved and booking CLOSED")

    print("=== 9. Production Safeguards for Tamper & Repair Endpoints ===")
    orig_env = settings.APP_ENV
    try:
        settings.APP_ENV = "production"
        r_tamper_prod = client.post("/api/v1/audit/simulate-tamper")
        assert r_tamper_prod.status_code == 403, f"Expected 403, got {r_tamper_prod.status_code}"
        r_repair_prod = client.post("/api/v1/audit/repair-ledger")
        assert r_repair_prod.status_code == 403, f"Expected 403, got {r_repair_prod.status_code}"
        print("  [PASS] Tamper & repair endpoints rejected with 403 in production mode")
    finally:
        settings.APP_ENV = orig_env

    print("\n>>> ALL 9 DEPLOYMENT READINESS CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_all_checks()

