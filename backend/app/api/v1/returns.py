"""
PACT Return Inspection & Incident Escalation Endpoints
Post-Use Condition Verification & Dispute Handling
CodeHack India 2026
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    User,
    UserRole,
)
from app.schemas import ReturnInspectRequest, IncidentResolveRequest, IncidentOut, BookingOut
from app.services.trust_capsule import append_audit_block

router = APIRouter(prefix="/returns", tags=["Returns & Incidents"])


@router.post("/inspect", response_model=BookingOut)
def inspect_return(inspect_req: ReturnInspectRequest, db: Session = Depends(get_db)):
    """
    Custodian performs physical return inspection.
    Documents post-use condition checklist and closes custody or escalates damage incident.
    """
    # 1. Verify custodian exists and has CUSTODIAN or ADMINISTRATOR role
    custodian = db.query(User).filter(User.id == inspect_req.custodian_id).first()
    if not custodian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Custodian with ID '{inspect_req.custodian_id}' not found.",
        )

    if custodian.role not in [UserRole.CUSTODIAN, UserRole.ADMINISTRATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User '{inspect_req.custodian_id}' has role '{custodian.role.value}'. Only CUSTODIAN or ADMINISTRATOR can inspect returns.",
        )

    booking = db.query(Booking).filter(Booking.id == inspect_req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    # 2. Dual-acknowledgement check: Borrower cannot inspect their own return
    if inspect_req.custodian_id == booking.requester_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dual-acknowledgement violation: Custodian inspecting return cannot be the borrower.",
        )

    if booking.status not in [BookingStatus.CHECKED_OUT, BookingStatus.OVERDUE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot inspect return for booking in '{booking.status.value}' state. Must be CHECKED_OUT or OVERDUE.",
        )

    now = datetime.now(timezone.utc)

    # 3. Record Post-Use Condition Report
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
        # 4A. Discrepancy or Damage Detected
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
        # 4B. Clean Return — Normal Completion
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


@router.get("/incidents", response_model=List[IncidentOut])
def list_incidents(
    status_filter: Optional[IncidentStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """List recorded damage and discrepancy incidents for administrative adjudication."""
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    return query.order_by(Incident.created_at.desc()).all()


@router.post("/incidents/{incident_id}/resolve", response_model=BookingOut)
def resolve_incident(
    incident_id: str,
    resolve_req: IncidentResolveRequest,
    db: Session = Depends(get_db),
):
    """
    Administrator reviews and adjudicates an open incident.
    Closes the incident, returns resource to AVAILABLE status, and records adjudication in Trust Capsule.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    # Verify admin role
    admin = db.query(User).filter(User.id == resolve_req.admin_id).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found.")

    if admin.role != UserRole.ADMINISTRATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User '{admin.id}' has role '{admin.role.value}'. Only ADMINISTRATOR can adjudicate incidents.",
        )

    now = datetime.now(timezone.utc)
    incident.status = resolve_req.resolution_status
    incident.resolution_notes = resolve_req.resolution_notes
    incident.resolved_by_id = admin.id
    incident.resolved_at = now

    booking = db.query(Booking).filter(Booking.id == incident.booking_id).first()
    if booking:
        booking.status = BookingStatus.CLOSED
        booking.updated_at = now

        resource = db.query(Resource).filter(Resource.id == booking.resource_id).first()
        if resource:
            resource.status = ResourceStatus.AVAILABLE

    db.commit()
    if booking:
        db.refresh(booking)

    # Append Trust Capsule Block
    if booking:
        append_audit_block(
            db=db,
            resource_id=booking.resource_id,
            booking_id=booking.id,
            event_type="INCIDENT_RESOLVED",
            actor_id=admin.id,
            payload={
                "incident_id": incident.id,
                "booking_id": booking.id,
                "resolved_by": admin.id,
                "resolution_notes": resolve_req.resolution_notes,
                "resolution_status": incident.status.value,
            },
        )

    return booking

