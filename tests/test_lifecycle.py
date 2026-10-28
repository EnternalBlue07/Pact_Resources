"""
PACT End-to-End Core Lifecycle Integration Tests
Tests: Discovery -> Eligibility -> Booking -> Conflict Check -> Handover -> Return -> Trust Capsule
CodeHack India 2026
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

client = TestClient(app)


def test_catalog_discovery():
    """Verify resources can be discovered and filtered."""
    response = client.get("/api/v1/resources")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 3

    # Filter by category
    resp_equip = client.get("/api/v1/resources?category=EQUIPMENT")
    assert resp_equip.status_code == 200
    assert all(r["category"] == "EQUIPMENT" for r in resp_equip.json())

    # Search keyword
    resp_search = client.get("/api/v1/resources?search=Oscilloscope")
    assert resp_search.status_code == 200
    assert len(resp_search.json()) >= 1
    assert "Oscilloscope" in resp_search.json()[0]["name"]


def test_zero_trust_eligibility_gate():
    """
    Verify Zero-Trust gate:
    1. Student holds BASIC_ELECTRONICS_SAFETY -> eligible for Oscilloscope.
    2. Student lacks LASER_SAFETY_1 -> ineligible for Laser Cutter.
    """
    # Oscilloscope check (Should pass)
    resp_eligible = client.get(
        "/api/v1/resources/res-oscilloscope-01/eligibility",
        params={"user_id": "u-student-01"},
    )
    assert resp_eligible.status_code == 200
    data_el = resp_eligible.json()
    assert data_el["is_eligible"] is True
    assert len(data_el["missing_qualifications"]) == 0

    # Laser cutter check (Should fail due to missing certification)
    resp_ineligible = client.get(
        "/api/v1/resources/res-laser-03/eligibility",
        params={"user_id": "u-student-01"},
    )
    assert resp_ineligible.status_code == 200
    data_inel = resp_ineligible.json()
    assert data_inel["is_eligible"] is False
    assert "LASER_SAFETY_1" in data_inel["missing_qualifications"]


def test_complete_happy_path_lifecycle():
    """
    Test Complete 10-Step Lifecycle:
    Booking Request -> Approval -> Concurrency Conflict Lock -> Handover Token -> Check-in -> Clean Return -> Audit Verify.
    """
    now = datetime.now(timezone.utc)
    start_time = (now + timedelta(hours=2)).isoformat()
    end_time = (now + timedelta(hours=4)).isoformat()

    # Step 1: Submit Booking Request
    booking_payload = {
        "resource_id": "res-printer3d-02",
        "requester_id": "u-student-01",
        "start_time": start_time,
        "end_time": end_time,
        "purpose": "Prototyping drone chassis components for aerospace competition",
    }
    resp_book = client.post("/api/v1/bookings", json=booking_payload)
    assert resp_book.status_code == 201
    booking = resp_book.json()
    booking_id = booking["id"]
    assert booking["status"] == "REQUESTED"

    # Step 2: Custodian Approves Booking
    resp_approve = client.post(
        f"/api/v1/bookings/{booking_id}/approve",
        params={"custodian_id": "u-custodian-01"},
    )
    assert resp_approve.status_code == 200
    assert resp_approve.json()["status"] == "APPROVED"

    # Step 3: Concurrency Protection - Attempt Overlapping Booking
    conflict_payload = {
        "resource_id": "res-printer3d-02",
        "requester_id": "u-student-01",
        "start_time": (now + timedelta(hours=3)).isoformat(),  # Overlaps!
        "end_time": (now + timedelta(hours=5)).isoformat(),
        "purpose": "Conflicting attempt for same time slot",
    }
    resp_conflict = client.post("/api/v1/bookings", json=conflict_payload)
    assert resp_conflict.status_code == 409  # Conflict!
    assert "conflicts with an existing approved reservation" in resp_conflict.json()["detail"]

    # Step 4: Borrower Generates Handover Token
    resp_token = client.post(
        "/api/v1/handovers/generate-token",
        json={"booking_id": booking_id, "requester_id": "u-student-01"},
    )
    assert resp_token.status_code == 200
    token_data = resp_token.json()
    token = token_data["handover_token"]
    assert token.startswith("PACT-HK-")

    # Step 5: Custodian Verifies Check-In (Dual-Ack)
    checkin_payload = {
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "handover_token": token,
        "baseline_condition_notes": "Print bed level, extruder clean, PLA spool attached.",
        "checklist": {"bed_clean": True, "powers_on": True, "nozzle_clear": True},
    }
    resp_checkin = client.post("/api/v1/handovers/verify-checkin", json=checkin_payload)
    assert resp_checkin.status_code == 200
    assert resp_checkin.json()["status"] == "CHECKED_OUT"

    # Step 6: Token Replay / Resubmission Attack (Rejected with HTTP 400)
    resp_replay = client.post("/api/v1/handovers/verify-checkin", json=checkin_payload)
    assert resp_replay.status_code == 400

    # Step 7: Custodian Inspects Clean Return
    return_payload = {
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "return_condition_notes": "Returned clean, test print completed, machine powered off.",
        "checklist": {"bed_clean": True, "powers_off": True, "tools_returned": True},
        "flag_incident": False,
    }
    resp_return = client.post("/api/v1/returns/inspect", json=return_payload)
    assert resp_return.status_code == 200
    assert resp_return.json()["status"] == "CLOSED"

    # Step 8: Verify Trust Capsule Hash Chain Integrity
    resp_audit = client.get("/api/v1/audit/verify-chain")
    assert resp_audit.status_code == 200
    audit_result = resp_audit.json()
    assert audit_result["status"] == "VALID"
    assert audit_result["total_blocks_verified"] >= 4
    assert len(audit_result["tampered_block_ids"]) == 0
