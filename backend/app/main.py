import sys
import os

# ── Vercel Monorepo Backend Path Bootstrap ─────────────────────────────────────
# Vercel serverless runs from "/var/task" (renaming backend/). To make
# "from backend.app..." imports resolve without changing any files, we create
# a virtual "backend" folder in the writable "/tmp" directory and symlink "app".
if os.getenv("VERCEL") == "1":
    import os
    import sys
    try:
        os.makedirs("/tmp/backend", exist_ok=True)
        if not os.path.exists("/tmp/backend/app"):
            os.symlink("/var/task/app", "/tmp/backend/app")
        if "/tmp" not in sys.path:
            sys.path.insert(0, "/tmp")
    except Exception as _symlink_err:
        print(f"Vercel path bootstrap warning: {_symlink_err}")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
# Import all models first to ensure they are registered in Base.metadata before mappers compile
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
from backend.app.models.copilot import CopilotSession, CopilotMessage, CopilotMemory, CopilotAction
from backend.app.models.enterprise import SystemSetting, Report, Notification, SavedSearch, PriceWatch, AuditLog, BackgroundJob, LoginHistory
from backend.app.models.rental import RentalListing, RentalBooking, RentalCalendar, RentalContract, RentalDeposit, RentalReturn

from backend.app.database import engine, Base
from backend.app.routers import auth, listings, search, messages, ai, analytics, offers, wishlist, chat, trust, copilot, admin, notifications, saved_searches, price_watch, reports, observability, rental, booking, rental_analytics, ai_commerce, business
from backend.app.routers.observability import TelemetryMiddleware
from backend.app.services.job_service import JobService
from backend.app.config import settings

from contextlib import asynccontextmanager
import logging
from sqlalchemy import text

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        os.makedirs("uploads/chat", exist_ok=True)
        os.makedirs("uploads/listings", exist_ok=True)
        os.makedirs("uploads/verification", exist_ok=True)
    except Exception as _dir_err:
        logger.warning(f"Skipped directory creation: {_dir_err}")
    
    # Verify database connection on startup with retry logic
    db_reachable = False
    max_retries = 3
    retry_delay = 2
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_reachable = True
            logger.info("Database connection validated successfully.")
            break
        except Exception as e:
            logger.warning(
                f"Database connection attempt {attempt} failed: {e}. Retrying in {retry_delay}s..."
            )
            import time
            time.sleep(retry_delay)
            
    if not db_reachable:
        logger.critical(
            "CRITICAL: Database is unreachable. Booting application in degraded mode."
        )
    else:
        try:
            logger.info("Running database migrations via Alembic...")
            from alembic.config import Config
            from alembic import command
            alembic_ini_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../alembic.ini"))
            alembic_cfg = Config(alembic_ini_path)
            command.upgrade(alembic_cfg, "head")
            logger.info("Database migrations applied successfully.")
            
            logger.info("Checking and seeding database if empty...")
            from backend.app.seed import seed_database
            seed_database()
        except Exception as e:
            logger.critical(f"Failed to run database migrations/seeding: {e}")

    import asyncio
    if not os.getenv("VERCEL") and settings.APP_ENV != "production":
        asyncio.create_task(JobService.run_worker())
    yield

app = FastAPI(
    title="SmartBazaar AI API",
    description="Backend API services for SmartBazaar P2P AI-enhanced marketplace.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    # Covers main domain, preview deployments, and any team/branch suffixes
    allow_origin_regex=r"https://[a-zA-Z0-9_-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TelemetryMiddleware)


# Serve upload files — safe mount: Vercel serverless has a read-only FS
# so we skip mounting if the directory doesn't exist (images go via Cloudinary in prod)
try:
    if os.path.isdir("uploads"):
        app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
except Exception as _mount_err:
    logger.warning(f"StaticFiles /uploads mount skipped: {_mount_err}")



# Register route modules under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(auth.seller_router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(listings.recommendations_router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(offers.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(trust.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")

# Sprint 13 New Routers
app.include_router(admin.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(saved_searches.router, prefix="/api")
app.include_router(price_watch.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(rental.router, prefix="/api")
app.include_router(booking.router, prefix="/api")
app.include_router(rental_analytics.router, prefix="/api")
app.include_router(ai_commerce.router, prefix="/api")
app.include_router(business.router, prefix="/api")
app.include_router(observability.router, prefix="/api")  # /api/health and metrics

