"""
Pytest Configuration & Database Fixtures
CodeHack India 2026
"""

import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.database import Base, get_db
from app.main import app
from app.scripts.seed_demo import seed_database

# Use dedicated test database
TEST_DB_PATH = Path(__file__).resolve().parent / "test_pact.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create and seed clean test database once per test session."""
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()

    Base.metadata.create_all(bind=test_engine)

    # Override get_db in app
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Seed test database with initial data
    from app.models.entities import (
        User,
        UserRole,
        UserQualification,
        Resource,
        ResourceCategory,
        ResourceStatus,
        ResourceRequirement,
    )
    from app.services.trust_capsule import append_audit_block

    db = TestingSessionLocal()
    # 1. Users
    student = User(
        id="u-student-01",
        email="student@pact.local",
        full_name="Aarav Sharma",
        department="Mechanical Engineering",
        role=UserRole.REQUESTER,
        active_booking_quota=2,
    )
    custodian = User(
        id="u-custodian-01",
        email="custodian@pact.local",
        full_name="Prof. Rajesh Rao",
        department="Electrical Engineering",
        role=UserRole.CUSTODIAN,
        active_booking_quota=10,
    )
    admin = User(
        id="u-admin-01",
        email="admin@pact.local",
        full_name="Dr. Anita Kapoor",
        department="Central Research Facilities",
        role=UserRole.ADMINISTRATOR,
        active_booking_quota=10,
    )
    auditor = User(
        id="u-auditor-01",
        email="auditor@pact.local",
        full_name="Inspector Vikram Menon",
        department="Campus Safety & Compliance",
        role=UserRole.AUDITOR,
        active_booking_quota=10,
    )
    db.add_all([student, custodian, admin, auditor])
    db.commit()

    # 2. Student Safety Qualifications
    quals = [
        UserQualification(user_id="u-student-01", qualification_key="BASIC_ELECTRONICS_SAFETY"),
        UserQualification(user_id="u-student-01", qualification_key="CAD_3D_PRINTING"),
    ]
    db.add_all(quals)
    db.commit()

    # 3. Resources
    res1 = Resource(
        id="res-oscilloscope-01",
        name="Rigol DS1054Z 50MHz Digital Oscilloscope",
        category=ResourceCategory.EQUIPMENT,
        asset_tag="EQ-EE-042",
        department="Electrical Engineering",
        location="Lab 302",
        custodian_id="u-custodian-01",
        status=ResourceStatus.AVAILABLE,
        max_duration_hours=4,
    )
    res2 = Resource(
        id="res-printer3d-02",
        name="Creality Ender 3 S1 Pro 3D Printer",
        category=ResourceCategory.EQUIPMENT,
        asset_tag="EQ-ME-019",
        department="Mechanical Engineering",
        location="FabLab Bay 2",
        custodian_id="u-custodian-01",
        status=ResourceStatus.AVAILABLE,
        max_duration_hours=6,
    )
    res3 = Resource(
        id="res-laser-03",
        name="Epilog Fusion Edge 80W CO2 Laser Cutter",
        category=ResourceCategory.EQUIPMENT,
        asset_tag="EQ-PR-008",
        department="Prototyping FabLab",
        location="Makerspace A",
        custodian_id="u-custodian-01",
        status=ResourceStatus.AVAILABLE,
        max_duration_hours=2,
    )
    db.add_all([res1, res2, res3])
    db.commit()

    # Requirements
    req1 = ResourceRequirement(resource_id="res-oscilloscope-01", qualification_key="BASIC_ELECTRONICS_SAFETY", description="Safety Module")
    req2 = ResourceRequirement(resource_id="res-printer3d-02", qualification_key="CAD_3D_PRINTING", description="3D Printing Slicing")
    req3 = ResourceRequirement(resource_id="res-laser-03", qualification_key="LASER_SAFETY_1", description="Laser Optical Safety")
    db.add_all([req1, req2, req3])
    db.commit()

    append_audit_block(
        db=db,
        resource_id="res-printer3d-02",
        booking_id=None,
        event_type="RESOURCE_REGISTERED",
        actor_id="u-custodian-01",
        payload={"name": "Creality Ender 3", "seeded": True},
    )
    db.close()

    yield

    # Teardown
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
        except Exception:
            pass

