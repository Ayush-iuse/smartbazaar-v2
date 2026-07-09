import os
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    APP_ENV: str = "development"  # "development", "production", "testing"
    DATABASE_URL: str = "sqlite:///./db.sqlite3"
    JWT_SECRET: str = "supersecretkeychangeinproduction12345!"

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Supabase credentials
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Legacy variables (preserved for V2 compatibility during V3 transition)
    REDIS_URL: str = ""
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    PORT: int = 8000

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_keys(self) -> 'Settings':
        if self.APP_ENV == "production":
            # Database URL validation — SQLite is not allowed in production
            if not self.DATABASE_URL or "sqlite" in self.DATABASE_URL:
                raise ValueError(
                    "DATABASE_URL must point to a production database (non-SQLite) in production mode. "
                    "Set DATABASE_URL in Vercel dashboard → Project Settings → Environment Variables."
                )

            # JWT Secret validation
            if self.JWT_SECRET == "supersecretkeychangeinproduction12345!":
                raise ValueError(
                    "JWT_SECRET must be changed from the default insecure value in production. "
                    "Set JWT_SECRET in Vercel dashboard → Project Settings → Environment Variables."
                )

            # Supabase is optional — the app uses direct PostgreSQL via DATABASE_URL.
            # Warn if keys are missing but don't block startup.
            import logging as _log
            _logger = _log.getLogger("uvicorn")
            missing_supabase = []
            if not self.SUPABASE_URL:
                missing_supabase.append("SUPABASE_URL")
            if not self.SUPABASE_ANON_KEY:
                missing_supabase.append("SUPABASE_ANON_KEY")
            if missing_supabase:
                _logger.warning(
                    f"[Config] Supabase credentials not set: {', '.join(missing_supabase)}. "
                    "Supabase Auth features will be unavailable, but direct DB access will work."
                )

        return self

    class Config:
        env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

