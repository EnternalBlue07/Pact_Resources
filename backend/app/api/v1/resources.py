"""
PACT Resource Catalog Endpoints
CodeHack India 2026
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Resource, ResourceCategory, ResourceStatus, ResourceRequirement, User, UserRole
from app.schemas import ResourceCreate, ResourceOut, EligibilityResponse
from app.services.access_gate import evaluate_eligibility
from app.services.trust_capsule import append_audit_block

router = APIRouter(prefix="/resources", tags=["Resources & Catalog"])


@router.get("", response_model=List[ResourceOut])
def list_resources(
    category: Optional[ResourceCategory] = None,
    status_filter: Optional[ResourceStatus] = Query(None, alias="status"),
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Browse catalog with faceted category, status, and keyword filtering."""
    query = db.query(Resource)

    if category:
        query = query.filter(Resource.category == category)
    if status_filter:
        query = query.filter(Resource.status == status_filter)
    if department:
        query = query.filter(Resource.department.ilike(f"%{department}%"))
    if search:
        query = query.filter(
            (Resource.name.ilike(f"%{search}%")) |
            (Resource.asset_tag.ilike(f"%{search}%")) |
            (Resource.location.ilike(f"%{search}%"))
        )

    return query.order_by(Resource.name.asc()).all()


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource_in: ResourceCreate,
    db: Session = Depends(get_db),
):
    """Register a new physical asset or research space with eligibility prerequisites."""
    # Verify custodian exists and has proper role
    custodian = db.query(User).filter(User.id == resource_in.custodian_id).first()
    if not custodian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Custodian with ID {resource_in.custodian_id} not found."
        )

    if custodian.role not in [UserRole.CUSTODIAN, UserRole.ADMINISTRATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User '{resource_in.custodian_id}' has role '{custodian.role.value}'. Only CUSTODIAN or ADMINISTRATOR can register resources."
        )

    # Check asset tag uniqueness
    existing = db.query(Resource).filter(Resource.asset_tag == resource_in.asset_tag).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Resource with asset tag '{resource_in.asset_tag}' already exists."
        )

    resource = Resource(
        name=resource_in.name,
        category=resource_in.category,
        asset_tag=resource_in.asset_tag,
        department=resource_in.department,
        location=resource_in.location,
        custodian_id=resource_in.custodian_id,
        status=ResourceStatus.AVAILABLE,
        max_duration_hours=resource_in.max_duration_hours,
        image_url=resource_in.image_url,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    # Add requirements
    for req in resource_in.requirements:
        db_req = ResourceRequirement(
            resource_id=resource.id,
            qualification_key=req.qualification_key,
            description=req.description,
        )
        db.add(db_req)

    db.commit()
    db.refresh(resource)

    # Append Genesis/Registration Block to Trust Capsule
    append_audit_block(
        db=db,
        resource_id=resource.id,
        booking_id=None,
        event_type="RESOURCE_REGISTERED",
        actor_id=resource.custodian_id,
        payload={
            "name": resource.name,
            "asset_tag": resource.asset_tag,
            "category": resource.category.value,
            "department": resource.department,
            "location": resource.location,
            "requirements": [r.qualification_key for r in resource.requirements],
        },
    )

    return resource


@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    """Retrieve full resource specifications and required certifications."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found."
        )
    return resource


@router.get("/{resource_id}/eligibility", response_model=EligibilityResponse)
def check_eligibility(
    resource_id: str,
    user_id: str = Query(..., description="ID of the student/requester"),
    db: Session = Depends(get_db),
):
    """Zero-Trust Access Gate: evaluate whether user meets prerequisite safety certifications."""
    return evaluate_eligibility(db=db, resource_id=resource_id, user_id=user_id)

