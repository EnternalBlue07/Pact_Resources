"""
PACT Backend Verification & Regression Test Suite
Phases 2 & 3: Role Authorization, Dual-Acknowledgement, Token Security & Incident Lifecycle
CodeHack India 2026
"""

import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
import pytest

backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_simulate_tamper_endpoint_success():
    """Verify /api/v1/audit/simulate-tamper mutates block and returns valid entry_hash."""
    resp = client.post("/api/v1/audit/simulate-tamper")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ["TAMPER_INJECTED", "ALREADY_TAMPERED"]
    assert "block_hash" in data

    # Verify detection
    resp_check = client.get("/api/v1/audit/verify-chain")
    assert resp_check.status_code == 200
    assert resp_check.json()["status"] == "INTEGRITY_BREACH_DETECTED"

    # Verify repair
    resp_repair = client.post("/api/v1/audit/repair-ledger")
    assert resp_repair.status_code == 200
    assert resp_repair.json()["status"] == "LEDGER_RESTORED"

    # Re-verify clean
    resp_clean = client.get("/api/v1/audit/verify-chain")
    assert resp_clean.status_code == 200
    assert resp_clean.json()["status"] == "VALID"


def test_dual_acknowledgement_self_approval_prevented():
    """Custodian creates a booking for themselves and attempts to approve their own request."""
    now = datetime.now(timezone.utc)
    # Custodian acts as borrower
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-custodian-01",
        "start_time": (now + timedelta(hours=20)).isoformat(),
        "end_time": (now + timedelta(hours=22)).isoformat(),
        "purpose": "Custodian personal research self-approval test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    # Self-approval attempt: custodian tries to approve their own request
    resp_self_approve = client.post(
        f"/api/v1/bookings/{booking_id}/approve",
        params={"custodian_id": "u-custodian-01"},
    )
    assert resp_self_approve.status_code == 403
    assert "Dual-acknowledgement violation" in resp_self_approve.json()["detail"]


def test_student_cannot_act_as_custodian_for_approval():
    """Student cannot approve any booking."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-student-02",
        "start_time": (now + timedelta(hours=23)).isoformat(),
        "end_time": (now + timedelta(hours=25)).isoformat(),
        "purpose": "Student role bypass test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    resp_student_app = client.post(
        f"/api/v1/bookings/{booking_id}/approve",
        params={"custodian_id": "u-student-02"},
    )
    assert resp_student_app.status_code == 403
    assert "Only CUSTODIAN or ADMINISTRATOR" in resp_student_app.json()["detail"]


def test_unauthorized_role_approval_rejected():
    """Non-existent user or invalid role cannot approve bookings."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-student-02",
        "start_time": (now + timedelta(hours=26)).isoformat(),
        "end_time": (now + timedelta(hours=28)).isoformat(),
        "purpose": "Invalid role test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    # Non-existent user
    resp_fake = client.post(
        f"/api/v1/bookings/{booking_id}/approve",
        params={"custodian_id": "user-does-not-exist"},
    )
    assert resp_fake.status_code == 404

    # Auditor (read-only role) attempting custodian approval
    resp_auditor = client.post(
        f"/api/v1/bookings/{booking_id}/approve",
        params={"custodian_id": "u-auditor-01"},
    )
    assert resp_auditor.status_code == 403
    assert "Only CUSTODIAN or ADMINISTRATOR" in resp_auditor.json()["detail"]


def test_booking_past_start_time_rejected():
    """Booking start time in the past must be rejected."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-student-02",
        "start_time": (now - timedelta(hours=10)).isoformat(),
        "end_time": (now - timedelta(hours=8)).isoformat(),
        "purpose": "Backdated booking attempt",
    })
    assert resp_book.status_code == 400
    assert "cannot be in the past" in resp_book.json()["detail"]


def test_dual_acknowledgement_self_checkin_prevented():
    """Custodian borrower cannot verify their own handover token."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-custodian-01",
        "start_time": (now + timedelta(hours=30)).isoformat(),
        "end_time": (now + timedelta(hours=32)).isoformat(),
        "purpose": "Self-checkin dual ack test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    # Administrator approves custodian's booking
    resp_app = client.post(f"/api/v1/bookings/{booking_id}/approve", params={"custodian_id": "u-admin-01"})
    assert resp_app.status_code == 200

    # Custodian generates token
    resp_tok = client.post("/api/v1/handovers/generate-token", json={"booking_id": booking_id, "requester_id": "u-custodian-01"})
    assert resp_tok.status_code == 200
    token = resp_tok.json()["handover_token"]

    # Custodian attempts to verify their own check-in
    resp_self_checkin = client.post("/api/v1/handovers/verify-checkin", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "handover_token": token,
        "baseline_condition_notes": "Self checkout bypass attempt",
    })
    assert resp_self_checkin.status_code == 403
    assert "Dual-acknowledgement violation" in resp_self_checkin.json()["detail"]


def test_dual_acknowledgement_self_return_prevented():
    """Custodian borrower cannot inspect their own returned equipment."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-custodian-01",
        "start_time": (now + timedelta(hours=34)).isoformat(),
        "end_time": (now + timedelta(hours=36)).isoformat(),
        "purpose": "Self-return dual ack test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    client.post(f"/api/v1/bookings/{booking_id}/approve", params={"custodian_id": "u-admin-01"})
    resp_tok = client.post("/api/v1/handovers/generate-token", json={"booking_id": booking_id, "requester_id": "u-custodian-01"})
    token = resp_tok.json()["handover_token"]

    # Administrator verifies check-in
    client.post("/api/v1/handovers/verify-checkin", json={
        "booking_id": booking_id,
        "custodian_id": "u-admin-01",
        "handover_token": token,
        "baseline_condition_notes": "Clean baseline by admin",
    })

    # Custodian borrower attempts to inspect own return
    resp_self_ret = client.post("/api/v1/returns/inspect", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "return_condition_notes": "Self return signoff attempt",
        "flag_incident": False,
    })
    assert resp_self_ret.status_code == 403
    assert "Dual-acknowledgement violation" in resp_self_ret.json()["detail"]


def test_handover_token_audit_block_logged():
    """Generating a handover token must append HANDOVER_TOKEN_ISSUED to the Trust Capsule."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-student-02",
        "start_time": (now + timedelta(hours=40)).isoformat(),
        "end_time": (now + timedelta(hours=42)).isoformat(),
        "purpose": "Token audit block test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    client.post(f"/api/v1/bookings/{booking_id}/approve", params={"custodian_id": "u-custodian-01"})
    client.post("/api/v1/handovers/generate-token", json={"booking_id": booking_id, "requester_id": "u-student-02"})

    # Check timeline for HANDOVER_TOKEN_ISSUED
    resp_timeline = client.get("/api/v1/audit/resources/res-oscilloscope-01/timeline")
    assert resp_timeline.status_code == 200
    events = [b["event_type"] for b in resp_timeline.json()]
    assert "HANDOVER_TOKEN_ISSUED" in events


def test_incident_resolution_lifecycle():
    """Test full incident workflow: Damage flagged -> Incident created -> Admin resolves -> Resource Available."""
    now = datetime.now(timezone.utc)
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-student-02",
        "start_time": (now + timedelta(hours=44)).isoformat(),
        "end_time": (now + timedelta(hours=46)).isoformat(),
        "purpose": "Incident resolution test",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    client.post(f"/api/v1/bookings/{booking_id}/approve", params={"custodian_id": "u-custodian-01"})
    resp_tok = client.post("/api/v1/handovers/generate-token", json={"booking_id": booking_id, "requester_id": "u-student-02"})
    token = resp_tok.json()["handover_token"]

    client.post("/api/v1/handovers/verify-checkin", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "handover_token": token,
        "baseline_condition_notes": "Baseline operational",
    })

    # Custodian flags damage
    resp_damage = client.post("/api/v1/returns/inspect", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "return_condition_notes": "Ch2 ground clip broken off.",
        "flag_incident": True,
        "incident_type": "PHYSICAL_DAMAGE",
        "incident_severity": "MEDIUM",
        "incident_description": "Ground clip sheared off during high-voltage experiment.",
    })
    assert resp_damage.status_code == 200
    assert resp_damage.json()["status"] == "INCIDENT_OPEN"

    # Verify resource under maintenance
    resp_res = client.get("/api/v1/resources/res-oscilloscope-01")
    assert resp_res.json()["status"] == "UNDER_MAINTENANCE"

    # List incidents
    resp_incidents = client.get("/api/v1/returns/incidents?status=OPEN")
    assert resp_incidents.status_code == 200
    incidents = resp_incidents.json()
    target_incident = next((i for i in incidents if i["booking_id"] == booking_id), None)
    assert target_incident is not None

    # Student cannot resolve incident
    resp_student_resolve = client.post(f"/api/v1/returns/incidents/{target_incident['id']}/resolve", json={
        "admin_id": "u-student-02",
        "resolution_notes": "Student trying to forgive own incident",
    })
    assert resp_student_resolve.status_code == 403

    # Admin resolves incident
    resp_admin_resolve = client.post(f"/api/v1/returns/incidents/{target_incident['id']}/resolve", json={
        "admin_id": "u-admin-01",
        "resolution_notes": "Replaced ground clip from spare parts bin. Calibrated.",
        "resolution_status": "RESOLVED_WAIVED",
    })
    assert resp_admin_resolve.status_code == 200
    assert resp_admin_resolve.json()["status"] == "CLOSED"

    # Verify resource restored to AVAILABLE
    resp_res_after = client.get("/api/v1/resources/res-oscilloscope-01")
    assert resp_res_after.json()["status"] == "AVAILABLE"
