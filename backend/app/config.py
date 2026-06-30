import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"  # "development", "production", "testing"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres_secure_pass@localhost:5432/smartbazaar"
    JWT_SECRET: str = "supersecretkeychangeinproduction12345!"

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    OPENAI_API_KEY: str = ""
    
    # Production Infrastructure envs
    REDIS_URL: str = ""
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Cloudinary credentials
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Dynamic Port allocation
    PORT: int = 8000

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

