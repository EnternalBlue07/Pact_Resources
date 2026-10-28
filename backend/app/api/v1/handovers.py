"""
PACT Handover & Dual-Ack Check-In Endpoints
Ephemeral Token Verification & Pre-Use Condition Documentation
CodeHack India 2026
"""

import hashlib
import random
import string
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import (
    Booking,
    BookingStatus,
    HandoverToken,
    ConditionReport,
    ConditionReportType,
    Resource,
    ResourceStatus,
)
from app.schemas import TokenGenerateRequest, TokenGenerateResponse, CheckInVerifyRequest, BookingOut
from app.services.trust_capsule import append_audit_block

router = APIRouter(prefix="/handovers", tags=["Handover & Check-In"])


def generate_code() -> str:
    """Generate 6-digit cryptographic handover token."""
    digits = "".join(random.choices(string.digits, k=6))
    return f"PACT-HK-{digits}"


@router.post("/generate-token", response_model=TokenGenerateResponse)
def generate_handover_token(token_req: TokenGenerateRequest, db: Session = Depends(get_db)):
    """
    Borrower requests a short-lived (15-min) handover token for physical checkout.
    """
    booking = db.query(Booking).filter(Booking.id == token_req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.requester_id != token_req.requester_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the borrower can generate this token.")

    if booking.status not in [BookingStatus.APPROVED, BookingStatus.HANDOVER_PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot generate token for booking in '{booking.status.value}' state. Must be APPROVED.",
        )

    # Invalidate / delete any existing token for this booking
    existing_token = db.query(HandoverToken).filter(HandoverToken.booking_id == booking.id).first()
    if existing_token:
        db.delete(existing_token)
        db.commit()

    raw_token = generate_code()
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    token_record = HandoverToken(
        booking_id=booking.id,
        raw_token=raw_token,
        token_hash=token_hash,
        expires_at=expires_at,
        is_spent=False,
    )
    db.add(token_record)

    booking.status = BookingStatus.HANDOVER_PENDING
    db.commit()
    db.refresh(token_record)

    return TokenGenerateResponse(
        booking_id=booking.id,
        handover_token=raw_token,
        expires_at=expires_at,
        validity_minutes=15,
    )


@router.post("/verify-checkin", response_model=BookingOut)
def verify_checkin(verify_req: CheckInVerifyRequest, db: Session = Depends(get_db)):
    """
    Custodian validates the handover token, records pre-use baseline condition,
    and seals the physical custody transfer into the Trust Capsule.
    """
    booking = db.query(Booking).filter(Booking.id == verify_req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.status not in [BookingStatus.APPROVED, BookingStatus.HANDOVER_PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid state for check-in: '{booking.status.value}'. Must be APPROVED or HANDOVER_PENDING.",
        )

    # 1. Fetch token record
    token_record = db.query(HandoverToken).filter(HandoverToken.booking_id == booking.id).first()
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No handover token generated for this booking. Requester must generate token first.",
        )

    # 2. Check token match
    incoming_hash = hashlib.sha256(verify_req.handover_token.strip().encode("utf-8")).hexdigest()
    if token_record.token_hash != incoming_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handover token. Verification failed.",
        )

    now = datetime.now(timezone.utc)

    # 3. Check replay attack
    if token_record.is_spent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Handover token already spent. Token replay attack prevented.",
        )

    # 4. Check token expiry (normalize offset-naive SQLite datetimes)
    expires_at = token_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Handover token has expired. Requester must generate a fresh token.",
        )

    # 5. Mark token spent
    token_record.is_spent = True
    token_record.spent_at = now
    token_record.spent_by_custodian_id = verify_req.custodian_id

    # 6. Record Pre-Use Condition Report
    condition_report = ConditionReport(
        booking_id=booking.id,
        report_type=ConditionReportType.PRE_USE_BASELINE,
        notes=verify_req.baseline_condition_notes,
        photo_evidence_url=verify_req.photo_evidence_url,
        checklist_json=verify_req.checklist or {},
        signed_off_by_user_id=verify_req.custodian_id,
        recorded_at=now,
    )
    db.add(condition_report)

    # 7. Update booking and resource status
    booking.status = BookingStatus.CHECKED_OUT
    booking.updated_at = now

    resource = db.query(Resource).filter(Resource.id == booking.resource_id).first()
    if resource:
        resource.status = ResourceStatus.IN_USE

    db.commit()
    db.refresh(booking)

    # 8. Append Trust Capsule Block
    append_audit_block(
        db=db,
        resource_id=booking.resource_id,
        booking_id=booking.id,
        event_type="CHECK_IN_VERIFIED",
        actor_id=verify_req.custodian_id,
        payload={
            "booking_id": booking.id,
            "status": booking.status.value,
            "custodian_id": verify_req.custodian_id,
            "condition_notes": verify_req.baseline_condition_notes,
            "checklist": verify_req.checklist,
            "photo_url": verify_req.photo_evidence_url,
            "token_spent_at": now.isoformat(),
        },
    )

    return booking
