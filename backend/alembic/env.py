import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Insert the repository root into system paths so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.config import settings
from backend.app.database import Base

# Import all models to ensure they are registered in the Base.metadata
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.offer import Offer
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.online_status import UserPresence
from backend.app.models.buyer_trust_score import BuyerTrustScore
from backend.app.models.buyer_trust_event import BuyerTrustEvent
from backend.app.models.seller_verification import SellerVerification
from backend.app.models.verification_document import VerificationDocument
from backend.app.models.buyer_label import BuyerLabel
from backend.app.models.buyer_note import BuyerNote
from backend.app.models.lead_status import LeadStatus
from backend.app.models.lead_score import LeadScore
from backend.app.models.crm_activity import CRMActivity
from backend.app.models.buyer_timeline import BuyerTimeline
from backend.app.models.risk_score import RiskScore
from backend.app.models.listing_score import ListingScore
from backend.app.models.seller_score import SellerScore
from backend.app.models.listing_view import ListingView
from backend.app.models.recently_viewed import RecentlyViewed
from backend.app.models.recommendation import Recommendation
from backend.app.models.saved_listing import SavedListing
from backend.app.models.search_history import SearchHistory
from backend.app.models.analytics_snapshot import AnalyticsSnapshot
from backend.app.models.copilot import CopilotSession, CopilotMessage, CopilotMemory, CopilotAction
from backend.app.models.enterprise import SystemSetting, Report, Notification, SavedSearch, PriceWatch, AuditLog, BackgroundJob, LoginHistory


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the metadata target for autogenerate detection
target_metadata = Base.metadata

# Override the database URL dynamically using the settings configuration
db_url = settings.DATABASE_URL
if not db_url:
    raise ValueError("DATABASE_URL environment variable is required for migrations.")

import urllib.parse

def sanitize_db_url(url: str) -> str:
    if not url:
        return url
    if "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    if scheme in ("postgres", "postgresql"):
        scheme = "postgresql+psycopg"
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

db_url = sanitize_db_url(db_url)

# Escape % characters for configparser interpolation compatibility
config.set_main_option("sqlalchemy.url", db_url.replace("%", "%%"))


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
