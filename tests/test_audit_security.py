"""
PACT Security & Trust Capsule Tamper Detection Tests
Verifies:
1. Return with damage discrepancy -> booking becomes INCIDENT_OPEN.
2. Direct database modification breaks the SHA-256 hash chain and is detected by verify-chain.
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
from app.models.entities import TrustCapsuleEntry, BookingStatus
from app.core.database import get_db

client = TestClient(app)


def test_return_with_damage_incident():
    """Verify that returning equipment with damage flags an incident and locks the resource."""
    now = datetime.now(timezone.utc)

    # Create & Approve booking
    resp_book = client.post("/api/v1/bookings", json={
        "resource_id": "res-oscilloscope-01",
        "requester_id": "u-student-01",
        "start_time": (now + timedelta(hours=10)).isoformat(),
        "end_time": (now + timedelta(hours=12)).isoformat(),
        "purpose": "Audio frequency waveform response measurement",
    })
    assert resp_book.status_code == 201
    booking_id = resp_book.json()["id"]

    client.post(f"/api/v1/bookings/{booking_id}/approve", params={"custodian_id": "u-custodian-01"})

    # Check-in
    resp_tok = client.post("/api/v1/handovers/generate-token", json={"booking_id": booking_id, "requester_id": "u-student-01"})
    token = resp_tok.json()["handover_token"]

    client.post("/api/v1/handovers/verify-checkin", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "handover_token": token,
        "baseline_condition_notes": "All probe channels functional and clean.",
    })

    # Return with damage incident flagged
    resp_return = client.post("/api/v1/returns/inspect", json={
        "booking_id": booking_id,
        "custodian_id": "u-custodian-01",
        "return_condition_notes": "Channel 1 BNC connector loose and physically bent.",
        "flag_incident": True,
        "incident_type": "PHYSICAL_DAMAGE",
        "incident_severity": "HIGH",
        "incident_description": "Ch1 BNC connector bent; trace shows signal distortion.",
    })
    assert resp_return.status_code == 200
    assert resp_return.json()["status"] == "INCIDENT_OPEN"

    # Verify resource status became UNDER_MAINTENANCE
    resp_res = client.get("/api/v1/resources/res-oscilloscope-01")
    assert resp_res.status_code == 200
    assert resp_res.json()["status"] == "UNDER_MAINTENANCE"


def test_trust_capsule_tamper_detection():
    """
    Verify that if a malicious actor directly mutates a historical record in the database,
    the /api/v1/audit/verify-chain endpoint immediately detects the cryptographic mismatch.
    """
    # 1. Fetch DB session from app override
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)

    # 2. Get latest block
    latest_block = db.query(TrustCapsuleEntry).order_by(TrustCapsuleEntry.entry_id.desc()).first()
    assert latest_block is not None

    # 3. Simulate unauthorized database payload modification (e.g. altering notes to hide fault)
    tampered_block_id = latest_block.entry_id
    original_payload = dict(latest_block.payload_json)
    latest_block.payload_json = {"tampered": True, "hacked_note": "Covering up damage"}
    db.commit()

    # 4. Verify chain detects the tamper
    resp_verify = client.get("/api/v1/audit/verify-chain")
    assert resp_verify.status_code == 200
    result = resp_verify.json()
    assert result["status"] == "INTEGRITY_BREACH_DETECTED"
    assert tampered_block_id in result["tampered_block_ids"]

    # 5. Restore original payload so subsequent tests stay clean
    latest_block.payload_json = original_payload
    db.commit()
    db.close()

