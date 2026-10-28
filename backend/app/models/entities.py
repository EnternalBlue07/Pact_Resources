"""
PACT SQLAlchemy Data Models & Entities
CodeHack India 2026
"""

from datetime import datetime, timezone
import enum
import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    """Generate string representation of standard UUID4."""
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    REQUESTER = "REQUESTER"
    CUSTODIAN = "CUSTODIAN"
    ADMINISTRATOR = "ADMINISTRATOR"
    AUDITOR = "AUDITOR"


class ResourceCategory(str, enum.Enum):
    EQUIPMENT = "EQUIPMENT"
    SPACE = "SPACE"


class ResourceStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    IN_USE = "IN_USE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    DECOMMISSIONED = "DECOMMISSIONED"


class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    INFO_NEEDED = "INFO_NEEDED"
    HANDOVER_PENDING = "HANDOVER_PENDING"
    CHECKED_OUT = "CHECKED_OUT"
    RETURNED = "RETURNED"
    CLOSED = "CLOSED"
    OVERDUE = "OVERDUE"
    INCIDENT_OPEN = "INCIDENT_OPEN"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class ConditionReportType(str, enum.Enum):
    PRE_USE_BASELINE = "PRE_USE_BASELINE"
    POST_USE_RETURN = "POST_USE_RETURN"


class IncidentType(str, enum.Enum):
    PHYSICAL_DAMAGE = "PHYSICAL_DAMAGE"
    MALFUNCTION = "MALFUNCTION"
    LATE_RETURN = "LATE_RETURN"
    MISSING_PARTS = "MISSING_PARTS"
    OTHER = "OTHER"


class IncidentSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED_WAIVED = "RESOLVED_WAIVED"
    RESOLVED_PENALTY = "RESOLVED_PENALTY"


# --- MODELS ---

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.REQUESTER)
    is_active = Column(Boolean, default=True, nullable=False)
    active_booking_quota = Column(Integer, default=2, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    qualifications = relationship("UserQualification", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="requester", foreign_keys="Booking.requester_id")
    custody_resources = relationship("Resource", back_populates="custodian", foreign_keys="Resource.custodian_id")


class UserQualification(Base):
    __tablename__ = "user_qualifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    qualification_key = Column(String(100), nullable=False, index=True)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="qualifications")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    category = Column(Enum(ResourceCategory), nullable=False, default=ResourceCategory.EQUIPMENT)
    asset_tag = Column(String(100), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    custodian_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ResourceStatus), nullable=False, default=ResourceStatus.AVAILABLE)
    max_duration_hours = Column(Integer, default=4, nullable=False)
    image_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    custodian = relationship("User", back_populates="custody_resources", foreign_keys=[custodian_id])
    requirements = relationship("ResourceRequirement", back_populates="resource", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="resource")
    audit_entries = relationship("TrustCapsuleEntry", back_populates="resource")


class ResourceRequirement(Base):
    __tablename__ = "resource_requirements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    qualification_key = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)

    resource = relationship("Resource", back_populates="requirements")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resource_id = Column(String(36), ForeignKey("resources.id"), nullable=False, index=True)
    requester_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    purpose = Column(Text, nullable=False)
    status = Column(Enum(BookingStatus), nullable=False, default=BookingStatus.REQUESTED, index=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    resource = relationship("Resource", back_populates="bookings")
    requester = relationship("User", back_populates="bookings", foreign_keys=[requester_id])
    handover_token = relationship("HandoverToken", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    condition_reports = relationship("ConditionReport", back_populates="booking", cascade="all, delete-orphan")
    incident = relationship("Incident", back_populates="booking", uselist=False)
    audit_entries = relationship("TrustCapsuleEntry", back_populates="booking")


class HandoverToken(Base):
    __tablename__ = "handover_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    raw_token = Column(String(16), nullable=False)  # Kept in memory/display for borrower
    token_hash = Column(String(64), nullable=False)  # SHA-256 hash of token
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_spent = Column(Boolean, default=False, nullable=False)
    spent_at = Column(DateTime(timezone=True), nullable=True)
    spent_by_custodian_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    booking = relationship("Booking", back_populates="handover_token")


class ConditionReport(Base):
    __tablename__ = "condition_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(Enum(ConditionReportType), nullable=False)
    notes = Column(Text, nullable=False)
    photo_evidence_url = Column(String(512), nullable=True)
    checklist_json = Column(JSON, nullable=True)
    signed_off_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="condition_reports")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id"), unique=True, nullable=False)
    reported_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    incident_type = Column(Enum(IncidentType), nullable=False)
    severity = Column(Enum(IncidentSeverity), nullable=False, default=IncidentSeverity.MEDIUM)
    description = Column(Text, nullable=False)
    photo_evidence_url = Column(String(512), nullable=True)
    status = Column(Enum(IncidentStatus), nullable=False, default=IncidentStatus.OPEN)
    resolution_notes = Column(Text, nullable=True)
    resolved_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="incident")


class TrustCapsuleEntry(Base):
    __tablename__ = "trust_capsule_entries"

    entry_id = Column(Integer, primary_key=True, autoincrement=True)
    resource_id = Column(String(36), ForeignKey("resources.id"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=True, index=True)
    event_type = Column(String(64), nullable=False)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    event_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    payload_json = Column(JSON, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    entry_hash = Column(String(64), nullable=False)

    resource = relationship("Resource", back_populates="audit_entries")
    booking = relationship("Booking", back_populates="audit_entries")

