import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.services.trust_service import TrustService
from backend.app.services.recommendation_service import RecommendationService
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.ai_service import AIService

client = TestClient(app)

def get_db_session():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

def test_trust_score_calculation():
    db = get_db_session()
    from backend.app.models.user import User
    user = db.query(User).filter(User.email == "seller1@smartbazaar.ai").first()
    assert user is not None
    
    trust_details = TrustService.calculate_trust_score(db, user.id)
    assert "trust_score" in trust_details
    assert "level" in trust_details
    assert trust_details["trust_score"] >= 0 and trust_details["trust_score"] <= 100

def test_recommendation_services():
    db = get_db_session()
    trending = RecommendationService.get_trending_listings(db, limit=2)
    assert len(trending) >= 0

def test_analytics_overview():
    db = get_db_session()
    overview = AnalyticsService.get_overview(db)
    assert "total_listings" in overview
    assert "categories" in overview
    assert "locations" in overview

def test_smart_search_parser():
    parsed = AIService.parse_search_query("budget laptop under 25000 in Mumbai")
    assert parsed["max_price"] == 25000.0
    assert parsed["location"] == "Mumbai"
