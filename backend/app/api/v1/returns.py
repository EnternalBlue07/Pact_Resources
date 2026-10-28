"""
PACT Return Inspection & Incident Escalation Endpoints
Post-Use Condition Verification & Dispute Handling
CodeHack India 2026
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import (
    Booking,
    BookingStatus,
    ConditionReport,
    ConditionReportType,
    Resource,
    ResourceStatus,
    Incident,
    IncidentType,
    IncidentSeverity,
    IncidentStatus,
)
from app.schemas import ReturnInspectRequest, BookingOut
from app.services.trust_capsule import append_audit_block

router = APIRouter(prefix="/returns", tags=["Returns & Incidents"])


@router.post("/inspect", response_model=BookingOut)
def inspect_return(inspect_req: ReturnInspectRequest, db: Session = Depends(get_db)):
    """
    Custodian performs physical return inspection.
    Documents post-use condition checklist and closes custody or escalates damage incident.
    """
    booking = db.query(Booking).filter(Booking.id == inspect_req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.status not in [BookingStatus.CHECKED_OUT, BookingStatus.OVERDUE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot inspect return for booking in '{booking.status.value}' state. Must be CHECKED_OUT or OVERDUE.",
        )

    now = datetime.now(timezone.utc)

    # 1. Record Post-Use Condition Report
    condition_report = ConditionReport(
        booking_id=booking.id,
        report_type=ConditionReportType.POST_USE_RETURN,
        notes=inspect_req.return_condition_notes,
        photo_evidence_url=inspect_req.photo_evidence_url,
        checklist_json=inspect_req.checklist or {},
        signed_off_by_user_id=inspect_req.custodian_id,
        recorded_at=now,
    )
    db.add(condition_report)

    resource = db.query(Resource).filter(Resource.id == booking.resource_id).first()

    if inspect_req.flag_incident:
        # 2A. Discrepancy or Damage Detected
        incident_type = inspect_req.incident_type or IncidentType.PHYSICAL_DAMAGE
        incident_desc = inspect_req.incident_description or inspect_req.return_condition_notes

        incident = Incident(
            booking_id=booking.id,
            reported_by_id=inspect_req.custodian_id,
            incident_type=incident_type,
            severity=inspect_req.incident_severity or IncidentSeverity.MEDIUM,
            description=incident_desc,
            photo_evidence_url=inspect_req.photo_evidence_url,
            status=IncidentStatus.OPEN,
        )
        db.add(incident)

        booking.status = BookingStatus.INCIDENT_OPEN
        booking.updated_at = now
        if resource:
            resource.status = ResourceStatus.UNDER_MAINTENANCE

        db.commit()
        db.refresh(booking)

        # Append Trust Capsule Block
        append_audit_block(
            db=db,
            resource_id=booking.resource_id,
            booking_id=booking.id,
            event_type="INCIDENT_FLAGGED",
            actor_id=inspect_req.custodian_id,
            payload={
                "booking_id": booking.id,
                "status": booking.status.value,
                "incident_type": incident_type.value,
                "severity": (inspect_req.incident_severity or IncidentSeverity.MEDIUM).value,
                "description": incident_desc,
                "photo_evidence_url": inspect_req.photo_evidence_url,
            },
        )

    else:
        # 2B. Clean Return — Normal Completion
        booking.status = BookingStatus.CLOSED
        booking.updated_at = now
        if resource:
            resource.status = ResourceStatus.AVAILABLE

        db.commit()
        db.refresh(booking)

        # Append Trust Capsule Block
        append_audit_block(
            db=db,
            resource_id=booking.resource_id,
            booking_id=booking.id,
            event_type="CUSTODY_CLOSED_CLEAN",
            actor_id=inspect_req.custodian_id,
            payload={
                "booking_id": booking.id,
                "status": booking.status.value,
                "condition_notes": inspect_req.return_condition_notes,
                "checklist": inspect_req.checklist,
                "closed_at": now.isoformat(),
            },
        )

    return booking

