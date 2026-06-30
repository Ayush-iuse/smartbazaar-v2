import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.config import settings

def sanitize_db_url(url: str) -> str:
    if not url:
        return url
    if "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    if scheme in ("postgres", "postgresql", "postgresql+psycopg"):
        scheme = "postgresql+psycopg2"
    if "@" not in rest:
        return f"{scheme}://{rest}"
    creds, host_part = rest.rsplit("@", 1)
    if ":" in creds:
        username, password = creds.split(":", 1)
        if "%" not in password:
            password = urllib.parse.quote_plus(password)
        creds = f"{username}:{password}"
    final_url = f"{scheme}://{creds}@{host_part}"
    ssl_mode = os.getenv("DB_SSL_MODE", "require")
    if "localhost" in host_part or "127.0.0.1" in host_part:
        ssl_mode = os.getenv("DB_SSL_MODE", "prefer")
    if "?" in host_part:
        if "sslmode=" not in host_part:
            final_url += f"&sslmode={ssl_mode}"
    else:
        final_url += f"?sslmode={ssl_mode}"
    return final_url

db_url = settings.DATABASE_URL
# Use local PostgreSQL database for testing isolation
if settings.APP_ENV == "testing":
    db_url = os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://postgres:postgres_secure_pass@localhost:5432/smartbazaar"
    )
elif not db_url:
    raise ValueError("DATABASE_URL environment variable is required and cannot be empty.")

db_url = sanitize_db_url(db_url)

is_sqlite = db_url.startswith("sqlite")

connect_args = {}
engine_kwargs = {}

if is_sqlite:
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL configurations
    ssl_mode = os.getenv("DB_SSL_MODE", "require")
    # If local, default to prefer
    if "localhost" in db_url or "127.0.0.1" in db_url:
        ssl_mode = os.getenv("DB_SSL_MODE", "prefer")

    connect_args = {
        "sslmode": ssl_mode,
        "connect_timeout": 10
    }
    engine_kwargs = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 3600,
        "pool_pre_ping": True
    }

engine = create_engine(
    db_url, connect_args=connect_args, **engine_kwargs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

