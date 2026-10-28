"""
PACT Zero-Trust Access Gate Service
Evaluates prerequisite safety certifications and quota limits server-side.
CodeHack India 2026
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.entities import User, Resource, UserQualification, ResourceRequirement, Booking, BookingStatus
from app.schemas import EligibilityResponse


def evaluate_eligibility(db: Session, resource_id: str, user_id: str) -> EligibilityResponse:
    """Evaluate whether user is authorized and eligible to book the resource."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )

    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found."
        )

    # 1. Check prerequisite safety qualifications
    required_quals = db.query(ResourceRequirement).filter(ResourceRequirement.resource_id == resource_id).all()
    user_quals = {q.qualification_key for q in db.query(UserQualification).filter(UserQualification.user_id == user_id).all()}

    missing = []
    for req in required_quals:
        if req.qualification_key not in user_quals:
            missing.append(req.qualification_key)

    # 2. Check active concurrency quota
    active_statuses = [
        BookingStatus.REQUESTED,
        BookingStatus.APPROVED,
        BookingStatus.HANDOVER_PENDING,
        BookingStatus.CHECKED_OUT,
    ]
    active_count = db.query(Booking).filter(
        Booking.requester_id == user_id,
        Booking.status.in_(active_statuses)
    ).count()

    quota_available = active_count < user.active_booking_quota

    # 3. Formulate explainable feedback
    if missing:
        is_eligible = False
        explanation = f"Ineligible: Missing required qualification(s): {', '.join(missing)}."
    elif not quota_available:
        is_eligible = False
        explanation = f"Quota Exceeded: You currently have {active_count} active bookings (maximum allowed: {user.active_booking_quota})."
    else:
        is_eligible = True
        explanation = "Eligible: All prerequisite safety requirements met and booking quota available."

    return EligibilityResponse(
        resource_id=resource_id,
        user_id=user_id,
        is_eligible=is_eligible,
        missing_qualifications=missing,
        active_bookings_count=active_count,
        max_quota=user.active_booking_quota,
        quota_available=quota_available,
        explanation=explanation,
    )

