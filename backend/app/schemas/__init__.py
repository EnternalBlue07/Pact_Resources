"""
PACT Pydantic Request & Response Schemas
CodeHack India 2026
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.entities import (
    UserRole,
    ResourceCategory,
    ResourceStatus,
    BookingStatus,
    ConditionReportType,
    IncidentType,
    IncidentSeverity,
    IncidentStatus,
)


# --- USER SCHEMAS ---

class UserBase(BaseModel):
    email: str
    full_name: str
    department: str
    role: UserRole = UserRole.REQUESTER


class UserOut(UserBase):
    id: str
    is_active: bool
    active_booking_quota: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- RESOURCE SCHEMAS ---

class RequirementCreate(BaseModel):
    qualification_key: str
    description: str


class RequirementOut(RequirementCreate):
    id: str
    model_config = ConfigDict(from_attributes=True)


class ResourceCreate(BaseModel):
    name: str
    category: ResourceCategory = ResourceCategory.EQUIPMENT
    asset_tag: str
    department: str
    location: str
    custodian_id: str
    max_duration_hours: int = 4
    image_url: Optional[str] = None
    requirements: List[RequirementCreate] = []


class ResourceOut(BaseModel):
    id: str
    name: str
    category: ResourceCategory
    asset_tag: str
    department: str
    location: str
    custodian_id: str
    status: ResourceStatus
    max_duration_hours: int
    image_url: Optional[str] = None
    requirements: List[RequirementOut] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- ELIGIBILITY SCHEMAS ---

class EligibilityResponse(BaseModel):
    resource_id: str
    user_id: str
    is_eligible: bool
    missing_qualifications: List[str]
    active_bookings_count: int
    max_quota: int
    quota_available: bool
    explanation: str


# --- BOOKING SCHEMAS ---

class BookingCreate(BaseModel):
    resource_id: str
    requester_id: str
    start_time: datetime
    end_time: datetime
    purpose: str


class BookingDecision(BaseModel):
    decision: str  # "APPROVE", "REJECT", "INFO_NEEDED"
    rejection_reason: Optional[str] = None


class BookingOut(BaseModel):
    id: str
    resource_id: str
    requester_id: str
    start_time: datetime
    end_time: datetime
    purpose: str
    status: BookingStatus
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- HANDOVER & RETURN SCHEMAS ---

class TokenGenerateRequest(BaseModel):
    booking_id: str
    requester_id: str


class TokenGenerateResponse(BaseModel):
    booking_id: str
    handover_token: str
    expires_at: datetime
    validity_minutes: int = 15


class CheckInVerifyRequest(BaseModel):
    booking_id: str
    custodian_id: str
    handover_token: str
    baseline_condition_notes: str
    photo_evidence_url: Optional[str] = None
    checklist: Optional[Dict[str, bool]] = None


class ReturnInspectRequest(BaseModel):
    booking_id: str
    custodian_id: str
    return_condition_notes: str
    photo_evidence_url: Optional[str] = None
    checklist: Optional[Dict[str, bool]] = None
    flag_incident: bool = False
    incident_type: Optional[IncidentType] = None
    incident_severity: Optional[IncidentSeverity] = IncidentSeverity.MEDIUM
    incident_description: Optional[str] = None


class IncidentResolveRequest(BaseModel):
    admin_id: str
    resolution_notes: str
    resolution_status: IncidentStatus = IncidentStatus.RESOLVED_WAIVED


class IncidentOut(BaseModel):
    id: str
    booking_id: str
    reported_by_id: str
    incident_type: IncidentType
    severity: IncidentSeverity
    description: str
    photo_evidence_url: Optional[str] = None
    status: IncidentStatus
    resolution_notes: Optional[str] = None
    resolved_by_id: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)



# --- AUDIT SCHEMAS ---

class TrustCapsuleBlockOut(BaseModel):
    entry_id: int
    resource_id: str
    booking_id: Optional[str]
    event_type: str
    actor_id: str
    event_timestamp: datetime
    payload_json: Dict[str, Any]
    prev_hash: str
    entry_hash: str
    model_config = ConfigDict(from_attributes=True)


class ChainVerificationResult(BaseModel):
    status: str  # "VALID" or "INTEGRITY_BREACH_DETECTED"
    total_blocks_verified: int
    tampered_block_ids: List[int] = []
    message: str

