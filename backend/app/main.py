import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.database import engine, Base
from backend.app.routers import auth, listings, search, messages, ai, analytics, offers, wishlist, chat, trust, copilot, admin, notifications, saved_searches, price_watch, reports, observability
from backend.app.routers.observability import TelemetryMiddleware
from backend.app.services.job_service import JobService
from backend.app.config import settings

# Import UserPresence model so it is auto-created
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

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("uploads/chat", exist_ok=True)
    os.makedirs("uploads/listings", exist_ok=True)
    os.makedirs("uploads/verification", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    import asyncio
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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TelemetryMiddleware)

# Serve upload files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

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
app.include_router(observability.router)  # top-level ready and metrics

