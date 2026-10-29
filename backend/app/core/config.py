import json
from typing import List, Union, Any
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime configuration loaded from environment variables."""

    APP_NAME: str = "PACT - Proof, Authorization, Custody & Trust"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./pact_dev.db"

    # Security & Tokens
    JWT_SECRET_KEY: str = "change_me_to_a_secure_random_string_for_local_dev_only"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    HANDOVER_TOKEN_EXPIRE_MINUTES: int = 15

    # CORS
    CORS_ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ALLOWED_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        """Normalize CORS origins from comma-separated strings, JSON arrays, or lists."""
        if isinstance(v, str):
            v_trimmed = v.strip()
            if v_trimmed.startswith("[") and v_trimmed.endswith("]"):
                try:
                    return json.loads(v_trimmed)
                except Exception:
                    pass
            return [i.strip() for i in v_trimmed.split(",") if i.strip()]
        return list(v)

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        """Enforce production security hygiene."""
        if self.APP_ENV.lower() == "production":
            if self.JWT_SECRET_KEY == "change_me_to_a_secure_random_string_for_local_dev_only":
                raise ValueError("JWT_SECRET_KEY must be set to a secure random string when APP_ENV=production.")
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError(
                    "SQLite database is prohibited in production due to ephemeral container storage. "
                    "Configure a persistent PostgreSQL DATABASE_URL (e.g. from Neon)."
                )
        return self

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env", "../.env.local", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
