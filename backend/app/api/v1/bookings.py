"""
PACT Booking & Reservation Endpoints
State Machine Transitions & Concurrency Conflict Protection
CodeHack India 2026
"""

from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Booking, BookingStatus, Resource, User, UserRole, ResourceStatus
from app.schemas import BookingCreate, BookingDecision, BookingOut
from app.services.access_gate import evaluate_eligibility
from app.services.trust_capsule import append_audit_block

router = APIRouter(prefix="/bookings", tags=["Bookings & Lifecycle"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(booking_in: BookingCreate, db: Session = Depends(get_db)):
    """
    Submit a formal booking request.
    Validates Zero-Trust eligibility and enforces concurrency overlap checks.
    """
    # 1. Basic time sanity check
    if booking_in.start_time >= booking_in.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time window: start_time must be earlier than end_time."
        )

    now = datetime.now(timezone.utc)
    req_start = booking_in.start_time if booking_in.start_time.tzinfo else booking_in.start_time.replace(tzinfo=timezone.utc)
    if req_start < now - timedelta(minutes=5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid start_time: Booking start time cannot be in the past."
        )

    # 2. Verify resource exists and is available
    resource = db.query(Resource).filter(Resource.id == booking_in.resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {booking_in.resource_id} not found."
        )

    if resource.status == ResourceStatus.UNDER_MAINTENANCE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource is currently under maintenance and cannot be reserved."
        )

    # 3. Zero-Trust Access Gate check
    eligibility = evaluate_eligibility(db=db, resource_id=booking_in.resource_id, user_id=booking_in.requester_id)
    if not eligibility.is_eligible:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=eligibility.explanation,
        )

    # 4. Check duration cap
    duration_hours = (booking_in.end_time - booking_in.start_time).total_seconds() / 3600.0
    if duration_hours > resource.max_duration_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested duration ({duration_hours:.1f}h) exceeds resource limit ({resource.max_duration_hours}h)."
        )

    # 5. Concurrency Overlap Protection (Prevent Double-Booking)
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.resource_id == booking_in.resource_id,
            Booking.status.in_([
                BookingStatus.APPROVED,
                BookingStatus.HANDOVER_PENDING,
                BookingStatus.CHECKED_OUT,
            ]),
            # Overlap condition: NOT (end <= new_start OR start >= new_end)
            Booking.start_time < booking_in.end_time,
            Booking.end_time > booking_in.start_time,
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested time slot conflicts with an existing approved reservation. Please select another slot or join the waitlist.",
        )

    # 6. Create Booking
    booking = Booking(
        resource_id=booking_in.resource_id,
        requester_id=booking_in.requester_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        purpose=booking_in.purpose,
        status=BookingStatus.REQUESTED,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 7. Append Trust Capsule Block
    append_audit_block(
        db=db,
        resource_id=booking.resource_id,
        booking_id=booking.id,
        event_type="BOOKING_REQUESTED",
        actor_id=booking.requester_id,
        payload={
            "booking_id": booking.id,
            "start_time": booking.start_time.isoformat(),
            "end_time": booking.end_time.isoformat(),
            "purpose": booking.purpose,
            "status": booking.status.value,
        },
    )

    return booking


@router.get("", response_model=List[BookingOut])
def list_bookings(
    resource_id: Optional[str] = None,
    requester_id: Optional[str] = None,
    status_filter: Optional[BookingStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """Retrieve filtered list of bookings."""
    query = db.query(Booking)
    if resource_id:
        query = query.filter(Booking.resource_id == resource_id)
    if requester_id:
        query = query.filter(Booking.requester_id == requester_id)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    return query.order_by(Booking.start_time.desc()).all()


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Retrieve single booking details."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    return booking


@router.post("/{booking_id}/approve", response_model=BookingOut)
def approve_booking(
    booking_id: str,
    custodian_id: str = Query(..., description="ID of custodian performing approval"),
    db: Session = Depends(get_db),
):
    """Custodian approves a pending booking request."""
    # 1. Verify custodian exists and has CUSTODIAN or ADMINISTRATOR role
    custodian = db.query(User).filter(User.id == custodian_id).first()
    if not custodian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Custodian with ID '{custodian_id}' not found.")

    if custodian.role not in [UserRole.CUSTODIAN, UserRole.ADMINISTRATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User '{custodian_id}' has role '{custodian.role.value}'. Only CUSTODIAN or ADMINISTRATOR can approve bookings.",
        )

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    # 2. Dual-acknowledgement check: Borrower cannot approve their own booking
    if custodian.id == booking.requester_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dual-acknowledgement violation: Requester cannot approve their own booking.",
        )

    if booking.status != BookingStatus.REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve booking in '{booking.status.value}' state. Must be 'REQUESTED'.",
        )

    # Re-verify no overlap emerged while pending
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.id != booking.id,
            Booking.resource_id == booking.resource_id,
            Booking.status.in_([
                BookingStatus.APPROVED,
                BookingStatus.HANDOVER_PENDING,
                BookingStatus.CHECKED_OUT,
            ]),
            Booking.start_time < booking.end_time,
            Booking.end_time > booking.start_time,
        )
        .first()
    )
    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict: Another booking was approved for this time slot.",
        )

    booking.status = BookingStatus.APPROVED
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)

    # Append Trust Capsule Block
    append_audit_block(
        db=db,
        resource_id=booking.resource_id,
        booking_id=booking.id,
        event_type="BOOKING_APPROVED",
        actor_id=custodian_id,
        payload={
            "booking_id": booking.id,
            "status": booking.status.value,
            "approved_by": custodian_id,
        },
    )

    return booking


@router.post("/{booking_id}/reject", response_model=BookingOut)
def reject_booking(
    booking_id: str,
    decision_in: BookingDecision,
    custodian_id: str = Query(..., description="ID of custodian performing rejection"),
    db: Session = Depends(get_db),
):
    """Custodian rejects a pending booking request with required reason."""
    # 1. Verify custodian exists and has CUSTODIAN or ADMINISTRATOR role
    custodian = db.query(User).filter(User.id == custodian_id).first()
    if not custodian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Custodian with ID '{custodian_id}' not found.")

    if custodian.role not in [UserRole.CUSTODIAN, UserRole.ADMINISTRATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User '{custodian_id}' has role '{custodian.role.value}'. Only CUSTODIAN or ADMINISTRATOR can reject bookings.",
        )

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.status != BookingStatus.REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject booking in '{booking.status.value}' state. Must be 'REQUESTED'.",
        )

    if not decision_in.rejection_reason or not decision_in.rejection_reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection requires a documented reason.",
        )

    booking.status = BookingStatus.REJECTED
    booking.rejection_reason = decision_in.rejection_reason
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)

    # Append Trust Capsule Block
    append_audit_block(
        db=db,
        resource_id=booking.resource_id,
        booking_id=booking.id,
        event_type="BOOKING_REJECTED",
        actor_id=custodian_id,
        payload={
            "booking_id": booking.id,
            "status": booking.status.value,
            "rejection_reason": booking.rejection_reason,
            "rejected_by": custodian_id,
        },
    )

    return booking

