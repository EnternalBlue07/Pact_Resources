"""
PACT API v1 Route Aggregator
CodeHack India 2026
"""

from fastapi import APIRouter
from app.api.v1.resources import router as resources_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.handovers import router as handovers_router
from app.api.v1.returns import router as returns_router
from app.api.v1.audit import router as audit_router

api_v1_router = APIRouter()

api_v1_router.include_router(resources_router)
api_v1_router.include_router(bookings_router)
api_v1_router.include_router(handovers_router)
api_v1_router.include_router(returns_router)
api_v1_router.include_router(audit_router)
