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
