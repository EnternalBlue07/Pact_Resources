"""
Unit tests for PACT backend health endpoints.
CodeHack India 2026
"""

import sys
import os
from pathlib import Path

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.main import app, root_health_check, api_v1_health_check


def test_root_health_check_unit():
    """Verify root health check function returns valid payload."""
    response = root_health_check()
    assert response.status == "ok"
    assert response.service == "pact-backend"
    assert response.version == "0.1.0"
    assert response.timestamp is not None


def test_api_v1_health_check_unit():
    """Verify api v1 health check function returns valid payload."""
    response = api_v1_health_check()
    assert response.status == "ok"
    assert response.service == "pact-backend-v1"
    assert response.version == "0.1.0"
    assert response.timestamp is not None


def test_app_metadata():
    """Verify FastAPI instance metadata adheres to PACT specification."""
    assert app.title == "PACT API"
    assert "Proof, Authorization, Custody & Trust" in app.description
    assert app.version == "0.1.0"

