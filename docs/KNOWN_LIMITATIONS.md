# PACT: Known Limitations & Scope Boundaries

> [!NOTE]
> In the spirit of engineering honesty and academic integrity, this document explicitly outlines the technical limitations and architectural boundaries of the PACT 48-hour hackathon prototype.

---

## 1. Architectural & Cryptographic Scope

### Centralized Relational Ledger vs. Decentralized Blockchain
- **Prototype Reality**: PACT uses a cryptographic SHA-256 hash-chain stored within a relational PostgreSQL database to provide **tamper-evident** audit logging.
- **Limitation**: While any modification to historical blocks breaks the cryptographic hash continuity (making silent tampering impossible), an administrator with direct physical root access to the database server could hypothetically recalculate the hash chain from a modified block forward.
- **Enterprise Resolution**: In production, hash roots would be periodically anchored into an external immutable timestamping authority or distributed consensus network (e.g., OpenTimestamps / Ethereum L2).

---

## 2. Physical Hardware & Sensory Interfacing

### Simulated Physical Handover & QR Scanning
- **Prototype Reality**: The dual-acknowledgement handover token is verified digitally via client forms with a simulated QR code scanning interface.
- **Limitation**: The hackathon prototype does not interface with physical electronic door locks, RFID turnstiles, or automated smart locker hardware.
- **Enterprise Resolution**: Integrating MQTT/WebSockets with IoT smart-lock controllers (e.g., ESP32 or Raspberry Pi badge readers).

### Visual Condition Documentation
- **Prototype Reality**: Condition evidence is captured via photo uploads and structured human condition checklists. Side-by-side visual comparison is provided to human reviewers.
- **Limitation**: The prototype does not include automated computer vision AI to detect scratches, cracks, or component fatigue automatically. Condition discrepancies are judged by human custodians and administrators.
- **Enterprise Resolution**: Training custom YOLO / Vision Transformer models on equipment surface inspections for automated defect flagging.

---

## 3. Identity & Institutional Integration

### Local Mock Authentication vs. Campus SSO
- **Prototype Reality**: PACT uses self-contained JWT authentication with seeded institutional role profiles (Student, Custodian, Administrator, Auditor).
- **Limitation**: The platform does not directly connect to campus LDAP, Active Directory, or SAML/Shibboleth single-sign-on providers.
- **Enterprise Resolution**: Adding OIDC / OAuth2 connectors for university identity providers and student information systems (SIS).

---

## 4. Concurrency & Performance Thresholds

### Scale Constraints
- **Prototype Reality**: Designed and tested for typical campus department loads (~100 concurrent users, hundreds of resources).
- **Limitation**: Has not been benchmarked under massive university-wide concurrent load spikes (>10,000 requests/sec).
- **Enterprise Resolution**: Introducing Redis caching for catalog discovery, database read-replicas, and asynchronous queue workers for hash sealing.
