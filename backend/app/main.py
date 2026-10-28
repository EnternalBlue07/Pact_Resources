"""
PACT: Proof, Authorization, Custody & Trust
FastAPI Backend Application Entrypoint
CodeHack India 2026
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_v1_router
# Import models to ensure they register on Base.metadata
import app.models.entities  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context initializing database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


class StandardErrorResponse(BaseModel):
    """Standardized machine-readable error response format."""
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str


class HealthCheckResponse(BaseModel):
    """Health check payload structure."""
    status: str
    service: str
    version: str
    environment: str
    timestamp: str


app = FastAPI(
    title="PACT API",
    description=(
        "Proof, Authorization, Custody & Trust — Security-first resource-sharing platform "
        "for institutional equipment and research spaces."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routes
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["System"],
    summary="Root Service Health Probe",
)
def root_health_check() -> HealthCheckResponse:
    """Returns basic service health status for load balancers and container probes."""
    return HealthCheckResponse(
        status="ok",
        service="pact-backend",
        version="0.1.0",
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.get(
    f"{settings.API_V1_PREFIX}/health",
    response_model=HealthCheckResponse,
    tags=["System"],
    summary="API v1 Health Probe",
)
def api_v1_health_check() -> HealthCheckResponse:
    """Returns API v1 status probe."""
    return HealthCheckResponse(
        status="ok",
        service="pact-backend-v1",
        version="0.1.0",
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global fallback exception handler formatting unhandled errors into standard error schema."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=StandardErrorResponse(
            error_code="INTERNAL_SERVER_ERROR",
            message=str(exc) if settings.APP_DEBUG else "An unexpected server error occurred.",
            details={"path": str(request.url.path)} if settings.APP_DEBUG else None,
            timestamp=datetime.now(timezone.utc).isoformat(),
        ).model_dump(),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_DEBUG,
    )
