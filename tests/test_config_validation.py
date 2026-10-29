"""
PACT Configuration & Production Safeguards Unit Tests
Verifies environment validation, SQLite rejection in production, and CORS normalization.
"""

import pytest
from pydantic import ValidationError
from app.core.config import Settings


def test_sqlite_allowed_in_development():
    """1. SQLite allowed in development environment."""
    cfg = Settings(
        APP_ENV="development",
        DATABASE_URL="sqlite:///./pact_dev.db",
        _env_file=None,
    )
    assert cfg.APP_ENV == "development"
    assert cfg.DATABASE_URL.startswith("sqlite")


def test_sqlite_rejected_in_production():
    """2. SQLite rejected in production with clear ValueError."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            APP_ENV="production",
            DATABASE_URL="sqlite:///./pact_dev.db",
            JWT_SECRET_KEY="a" * 64,
            _env_file=None,
        )
    assert "SQLite database is prohibited in production" in str(exc_info.value)


def test_secure_postgresql_accepted_in_production():
    """3. Secure PostgreSQL URL accepted in production."""
    cfg = Settings(
        APP_ENV="production",
        DATABASE_URL="postgresql://user:pass@ep-host.neon.tech/neondb?sslmode=require",
        JWT_SECRET_KEY="a" * 64,
        _env_file=None,
    )
    assert cfg.APP_ENV == "production"
    assert cfg.DATABASE_URL.startswith("postgresql://")


def test_default_jwt_secret_rejected_in_production():
    """4. The default JWT secret rejected in production."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            APP_ENV="production",
            DATABASE_URL="postgresql://user:pass@ep-host.neon.tech/neondb?sslmode=require",
            JWT_SECRET_KEY="change_me_to_a_secure_random_string_for_local_dev_only",
            _env_file=None,
        )
    assert "JWT_SECRET_KEY must be set to a secure random string" in str(exc_info.value)


def test_cors_origins_normalized_from_comma_string():
    """5A. CORS origins normalized from comma-separated strings."""
    cfg = Settings(
        CORS_ALLOWED_ORIGINS="http://localhost:5173,https://pact.vercel.app",
        _env_file=None,
    )
    assert cfg.CORS_ALLOWED_ORIGINS == [
        "http://localhost:5173",
        "https://pact.vercel.app",
    ]


def test_cors_origins_normalized_from_json_array():
    """5B. CORS origins normalized from JSON arrays."""
    cfg = Settings(
        CORS_ALLOWED_ORIGINS='["http://localhost:5173", "https://pact.vercel.app"]',
        _env_file=None,
    )
    assert cfg.CORS_ALLOWED_ORIGINS == [
        "http://localhost:5173",
        "https://pact.vercel.app",
    ]

