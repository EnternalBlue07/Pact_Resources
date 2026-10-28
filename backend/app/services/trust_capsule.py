"""
PACT Trust Capsule Engine
Tamper-Evident Cryptographic SHA-256 Audit Ledger Chaining & Verification
CodeHack India 2026
"""

import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import TrustCapsuleEntry
from app.schemas import ChainVerificationResult

GENESIS_HASH = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"


def canonical_json(data: Dict[str, Any]) -> str:
    """Serialize JSON with sorted keys and no whitespace to ensure deterministic hashing."""
    return json.dumps(data, sort_keys=True, separators=(",", ":"), default=str)


def compute_entry_hash(prev_hash: str, timestamp_str: str, actor_id: str, event_type: str, canonical_payload: str) -> str:
    """Compute SHA-256 hash across block parameters."""
    raw = f"{prev_hash}:{timestamp_str}:{actor_id}:{event_type}:{canonical_payload}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def append_audit_block(
    db: Session,
    resource_id: str,
    booking_id: Optional[str],
    event_type: str,
    actor_id: str,
    payload: Dict[str, Any],
) -> TrustCapsuleEntry:
    """Append an immutable, cryptographic SHA-256 chained entry to the Trust Capsule."""
    last_entry = (
        db.query(TrustCapsuleEntry)
        .filter(TrustCapsuleEntry.resource_id == resource_id)
        .order_by(TrustCapsuleEntry.entry_id.desc())
        .first()
    )
    prev_hash = last_entry.entry_hash if last_entry else GENESIS_HASH

    now = datetime.now(timezone.utc)
    ts_str = now.isoformat()
    c_payload = canonical_json(payload)
    entry_hash = compute_entry_hash(
        prev_hash=prev_hash,
        timestamp_str=ts_str,
        actor_id=actor_id,
        event_type=event_type,
        canonical_payload=c_payload,
    )

    block = TrustCapsuleEntry(
        resource_id=resource_id,
        booking_id=booking_id,
        event_type=event_type,
        actor_id=actor_id,
        event_timestamp=now,
        payload_json=payload,
        prev_hash=prev_hash,
        entry_hash=entry_hash,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def verify_audit_chain(db: Session) -> ChainVerificationResult:
    """
    Recompute and verify cryptographic hash chaining across all blocks in the database.
    Detects any direct database modification or corrupted links.
    """
    entries: List[TrustCapsuleEntry] = db.query(TrustCapsuleEntry).order_by(TrustCapsuleEntry.entry_id.asc()).all()

    if not entries:
        return ChainVerificationResult(
            status="VALID",
            total_blocks_verified=0,
            tampered_block_ids=[],
            message="Audit chain is empty. No blocks to verify.",
        )

    resource_last_hashes: Dict[str, str] = {}
    tampered_ids = []

    for entry in entries:
        expected_prev = resource_last_hashes.get(entry.resource_id, GENESIS_HASH)

        # 1. Verify prev_hash matches
        if entry.prev_hash != expected_prev:
            tampered_ids.append(entry.entry_id)
            continue

        # 2. Recompute entry_hash
        ts = entry.event_timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        ts_str = ts.isoformat()

        c_payload = canonical_json(entry.payload_json)
        recomputed = compute_entry_hash(
            prev_hash=entry.prev_hash,
            timestamp_str=ts_str,
            actor_id=entry.actor_id,
            event_type=entry.event_type,
            canonical_payload=c_payload,
        )

        if entry.entry_hash != recomputed:
            tampered_ids.append(entry.entry_id)
            continue

        resource_last_hashes[entry.resource_id] = entry.entry_hash

    if tampered_ids:
        return ChainVerificationResult(
            status="INTEGRITY_BREACH_DETECTED",
            total_blocks_verified=len(entries),
            tampered_block_ids=tampered_ids,
            message=f"Cryptographic integrity breach detected in {len(tampered_ids)} block(s): {tampered_ids}.",
        )

    return ChainVerificationResult(
        status="VALID",
        total_blocks_verified=len(entries),
        tampered_block_ids=[],
        message=f"All {len(entries)} cryptographic Trust Capsule blocks successfully verified.",
    )
