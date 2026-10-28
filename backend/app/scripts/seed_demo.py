"""
PACT One-Click Demo Environment Seeder
Populates realistic campus users, resources, prerequisite rules, and sample bookings.
CodeHack India 2026
"""

import sys
from pathlib import Path
from datetime import datetime, timezone

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.database import SessionLocal, engine, Base
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


def seed_database():
    """Seed comprehensive demo dataset for judges and evaluation."""
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "student@pact.local").first():
            print("Database already contains demo seed data. Skipping duplicate seed.")
            return

        print("Seeding institutional user accounts...")
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
        print("Seeding student safety certifications...")
        quals = [
            UserQualification(
                user_id="u-student-01",
                qualification_key="BASIC_ELECTRONICS_SAFETY",
            ),
            UserQualification(
                user_id="u-student-01",
                qualification_key="CAD_3D_PRINTING",
            ),
        ]
        db.add_all(quals)
        db.commit()

        # 3. Resources & Requirements
        print("Seeding physical campus assets and prerequisite rules...")
        resources_data = [
            {
                "id": "res-oscilloscope-01",
                "name": "Rigol DS1054Z 50MHz Digital Oscilloscope",
                "category": ResourceCategory.EQUIPMENT,
                "asset_tag": "EQ-EE-042",
                "department": "Electrical Engineering",
                "location": "Lab 302, Signal Processing Wing",
                "custodian_id": "u-custodian-01",
                "status": ResourceStatus.AVAILABLE,
                "max_duration_hours": 4,
                "requirements": [
                    ("BASIC_ELECTRONICS_SAFETY", "Basic Electronics Lab Safety Module"),
                ],
            },
            {
                "id": "res-printer3d-02",
                "name": "Creality Ender 3 S1 Pro 3D Printer",
                "category": ResourceCategory.EQUIPMENT,
                "asset_tag": "EQ-ME-019",
                "department": "Mechanical Engineering",
                "location": "FabLab Prototyping Bay 2",
                "custodian_id": "u-custodian-01",
                "status": ResourceStatus.AVAILABLE,
                "max_duration_hours": 6,
                "requirements": [
                    ("CAD_3D_PRINTING", "Certified 3D Slicing & Filament Handling"),
                ],
            },
            {
                "id": "res-laser-03",
                "name": "Epilog Fusion Edge 80W CO2 Laser Cutter",
                "category": ResourceCategory.EQUIPMENT,
                "asset_tag": "EQ-PR-008",
                "department": "Prototyping FabLab",
                "location": "Makerspace Enclosure A",
                "custodian_id": "u-custodian-01",
                "status": ResourceStatus.AVAILABLE,
                "max_duration_hours": 2,
                "requirements": [
                    ("LASER_SAFETY_1", "High-Power Optical & Fire Safety Level 1"),
                ],
            },
            {
                "id": "res-microscope-04",
                "name": "Olympus BX53 Clinical Biological Microscope",
                "category": ResourceCategory.EQUIPMENT,
                "asset_tag": "EQ-BIO-003",
                "department": "Bioengineering",
                "location": "Cell Culture Wing, Bench 4",
                "custodian_id": "u-custodian-01",
                "status": ResourceStatus.AVAILABLE,
                "max_duration_hours": 3,
                "requirements": [
                    ("BIOSAFETY_LEVEL_1", "Biohazard & Specimen Handling Certification"),
                ],
            },
            {
                "id": "res-robotics-05",
                "name": "Robotics Autonomous Navigation Arena",
                "category": ResourceCategory.SPACE,
                "asset_tag": "SP-ROB-001",
                "department": "Robotics Institute",
                "location": "Innovation Block, Ground Floor",
                "custodian_id": "u-custodian-01",
                "status": ResourceStatus.AVAILABLE,
                "max_duration_hours": 4,
                "requirements": [
                    ("ROBOTICS_SAFETY", "Autonomous Vehicle & Drone Flight Safety"),
                ],
            },
            {
                "id": "res-studio-06",
                "name": "Sound-Treated Podcast & Audio Booth",
                "category": ResourceCategory.SPACE,
                "asset_tag": "SP-MED-004",
                "department": "Media & Creative Arts",
                "location": "Humanities Building, Room 108",
                "custodian_id": "u-custodian-01",
                "status": ResourceStatus.AVAILABLE,
                "max_duration_hours": 3,
                "requirements": [],
            },
        ]

        for item in resources_data:
            res = Resource(
                id=item["id"],
                name=item["name"],
                category=item["category"],
                asset_tag=item["asset_tag"],
                department=item["department"],
                location=item["location"],
                custodian_id=item["custodian_id"],
                status=item["status"],
                max_duration_hours=item["max_duration_hours"],
            )
            db.add(res)
            db.commit()
            db.refresh(res)

            for req_key, req_desc in item["requirements"]:
                req = ResourceRequirement(
                    resource_id=res.id,
                    qualification_key=req_key,
                    description=req_desc,
                )
                db.add(req)
            db.commit()

            # Append Genesis Block to Trust Capsule
            append_audit_block(
                db=db,
                resource_id=res.id,
                booking_id=None,
                event_type="RESOURCE_REGISTERED",
                actor_id=res.custodian_id,
                payload={
                    "name": res.name,
                    "asset_tag": res.asset_tag,
                    "category": res.category.value,
                    "department": res.department,
                    "location": res.location,
                    "seeded": True,
                },
            )

        print("Demo database successfully seeded!")
        print("Judge Accounts:")
        print("  - Requester:     student@pact.local   (ID: u-student-01)")
        print("  - Custodian:     custodian@pact.local (ID: u-custodian-01)")
        print("  - Administrator: admin@pact.local     (ID: u-admin-01)")
        print("  - Auditor:       auditor@pact.local   (ID: u-auditor-01)")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
