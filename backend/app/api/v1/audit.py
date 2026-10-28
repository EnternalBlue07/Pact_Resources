"""
PACT Trust Capsule Audit & Verification Endpoints
Cryptographic SHA-256 Timeline & Integrity Validator
CodeHack India 2026
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import TrustCapsuleEntry, Resource
from app.schemas import TrustCapsuleBlockOut, ChainVerificationResult
from app.services.trust_capsule import verify_audit_chain

router = APIRouter(prefix="/audit", tags=["Trust Capsule & Audit"])


@router.get("/resources/{resource_id}/timeline", response_model=List[TrustCapsuleBlockOut])
def get_resource_audit_timeline(resource_id: str, db: Session = Depends(get_db)):
    """
    Retrieve the chronological, cryptographic Trust Capsule timeline for a resource.
    Displays every state transition, actor ID, and hash chaining link.
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    entries = (
        db.query(TrustCapsuleEntry)
        .filter(TrustCapsuleEntry.resource_id == resource_id)
        .order_by(TrustCapsuleEntry.entry_id.asc())
        .all()
    )
    return entries


@router.get("/verify-chain", response_model=ChainVerificationResult)
def verify_audit_ledger(db: Session = Depends(get_db)):
    """
    Recompute and verify SHA-256 cryptographic hash links across all historical blocks.
    Returns 200 OK with detailed validation breakdown. Detects unauthorized direct SQL tampering.
    """
    return verify_audit_chain(db)


@router.post("/simulate-tamper")
def simulate_audit_tampering(db: Session = Depends(get_db)):
    """
    SECURITY ARENA DEMO: Deliberately mutates the payload of the most recent audit block
    to demonstrate live cryptographic tamper detection.
    """
    latest = db.query(TrustCapsuleEntry).order_by(TrustCapsuleEntry.entry_id.desc()).first()
    if not latest:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No audit blocks found to tamper.")

    # Save original if not already saved
    if "_original_payload" not in latest.payload_json:
        tampered_data = dict(latest.payload_json)
        tampered_data["_original_payload"] = dict(latest.payload_json)
        tampered_data["tamper_injected_by"] = "SECURITY_ARENA_ATTACK_SIMULATOR"
        tampered_data["condition_forgery"] = "All damages erased by unauthorized SQL injection"
        latest.payload_json = tampered_data
        db.commit()
        db.refresh(latest)
        return {
            "status": "TAMPER_INJECTED",
            "tampered_block_id": latest.entry_id,
            "block_hash": latest.block_hash,
            "message": f"Block #{latest.entry_id} payload altered directly in SQL database. Run chain verification to test detection.",
        }
    else:
        return {
            "status": "ALREADY_TAMPERED",
            "tampered_block_id": latest.entry_id,
            "message": f"Block #{latest.entry_id} is already in a tampered state.",
        }


@router.post("/repair-ledger")
def repair_audit_ledger(db: Session = Depends(get_db)):
    """
    SECURITY ARENA DEMO: Restores tampered blocks back to their original state.
    """
    all_blocks = db.query(TrustCapsuleEntry).all()
    count = 0
    for block in all_blocks:
        payload = dict(block.payload_json or {})
        if "_original_payload" in payload:
            block.payload_json = payload["_original_payload"]
            count += 1
    if count > 0:
        db.commit()
    return {
        "status": "LEDGER_RESTORED",
        "repaired_blocks": count,
        "message": f"Restored {count} tampered blocks to original valid state.",
    }


