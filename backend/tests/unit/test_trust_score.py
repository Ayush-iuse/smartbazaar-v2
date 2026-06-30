import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.offer import Offer
from backend.app.models.lead_status import LeadStatus
from backend.app.models.risk_score import RiskScore
from backend.app.models.buyer_trust_score import BuyerTrustScore
from backend.app.models.buyer_trust_event import BuyerTrustEvent
from backend.app.services.trust_score_service import TrustScoreService

def get_auth_headers(client, email="buyer@example.com", password="Password123!", name="Test User"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": name},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_scoring_weights_and_calculations(db_session: Session):
    # Setup test users
    buyer = User(email="scoring_buyer@example.com", hashed_password="hashed_password", created_at=datetime.utcnow() - timedelta(days=45))
    seller = User(email="scoring_seller@example.com", hashed_password="hashed_password")
    db_session.add(buyer)
    db_session.add(seller)
    db_session.commit()

    # Setup test listing
    from backend.app.models.listing import Listing
    listing = Listing(
        title="Test Item",
        price=100.0,
        category="Electronics",
        location="Delhi",
        seller_id=seller.id
    )
    db_session.add(listing)
    db_session.commit()

    # Verify completed deals scoring
    assert TrustScoreService.calculate_completed_deal_score(0) == 0
    assert TrustScoreService.calculate_completed_deal_score(1) == 10
    assert TrustScoreService.calculate_completed_deal_score(3) == 20
    assert TrustScoreService.calculate_completed_deal_score(6) == 30

    # Verify offer reliability scoring
    assert TrustScoreService.calculate_offer_reliability_score(db_session, buyer.id) == 20  # 20 default
    
    # Add offers
    offer1 = Offer(listing_id=listing.id, buyer_id=buyer.id, seller_id=seller.id, offer_amount=100.0, status="Accepted")
    offer2 = Offer(listing_id=listing.id, buyer_id=buyer.id, seller_id=seller.id, offer_amount=100.0, status="Rejected")
    db_session.add_all([offer1, offer2])
    db_session.commit()
    # reliability = 1/2 = 50% -> should be 12 points
    assert TrustScoreService.calculate_offer_reliability_score(db_session, buyer.id) == 12

    # Verify response rate scoring
    assert TrustScoreService.calculate_response_score(0.8) == 12
    assert TrustScoreService.calculate_response_score(1.0) == 15

    # Verify account age scoring
    assert TrustScoreService.calculate_account_age_score(datetime.utcnow() - timedelta(days=95)) == 10
    assert TrustScoreService.calculate_account_age_score(datetime.utcnow() - timedelta(days=45)) == 7
    assert TrustScoreService.calculate_account_age_score(datetime.utcnow() - timedelta(days=10)) == 4
    assert TrustScoreService.calculate_account_age_score(datetime.utcnow() - timedelta(days=2)) == 1

    # Verify penalties calculation
    # Spam Reports: -10 to -30 (spam_reports * 15, capped at 30)
    # Cancelled Deals: -5 to -20 (cancelled_deals * 10, capped at 20)
    # Blocks: -10 each
    penalty1 = TrustScoreService.calculate_penalties(db_session, buyer.id, spam_reports=1, cancelled_deals=1)
    assert penalty1 == 15 + 10 + 0  # 25

    # Add block
    block = LeadStatus(seller_id=seller.id, buyer_id=buyer.id, status="BLOCKED")
    db_session.add(block)
    db_session.commit()
    penalty2 = TrustScoreService.calculate_penalties(db_session, buyer.id, spam_reports=2, cancelled_deals=2)
    assert penalty2 == 30 + 20 + 10  # 60 (30 spam, 20 cancel, 10 block)

def test_risk_score_integration_and_trust_level(db_session: Session):
    # Setup buyer
    buyer = User(email="risk_buyer@example.com", hashed_password="hashed_password", created_at=datetime.utcnow() - timedelta(days=100))
    db_session.add(buyer)
    db_session.commit()

    # Recalculate base trust (should have default BuyerTrustScore created)
    trust_rec = TrustScoreService.calculate_trust_score(db_session, buyer.id)
    # Completed Deals: 0 (0 pts)
    # Offer Reliability: 20 pts (default)
    # Response Rate: 1.0 (15 pts)
    # Account Age: 100 days (10 pts)
    # Conv Quality: 10 pts
    # Total = 55 -> Verified Buyer
    assert trust_rec.trust_score == 55
    assert trust_rec.trust_level == "VERIFIED BUYER"

    # Add risk score level HIGH -> -15 points penalty
    risk = RiskScore(user_id=buyer.id, risk_score=70, risk_level="HIGH")
    db_session.add(risk)
    db_session.commit()

    trust_rec = TrustScoreService.calculate_trust_score(db_session, buyer.id)
    # 55 - 15 = 40 -> Trusted Buyer
    assert trust_rec.trust_score == 40
    assert trust_rec.trust_level == "TRUSTED BUYER"

    # Set risk level to CRITICAL -> -30 points penalty
    risk.risk_level = "CRITICAL"
    db_session.commit()

    trust_rec = TrustScoreService.calculate_trust_score(db_session, buyer.id)
    # 55 - 30 = 25 -> New Buyer
    assert trust_rec.trust_score == 25
    assert trust_rec.trust_level == "NEW BUYER"

def test_anti_gaming_rules(db_session: Session):
    buyer = User(email="gaming_buyer@example.com", hashed_password="hashed_password")
    db_session.add(buyer)
    db_session.commit()

    # Log trust events in rapid succession
    TrustScoreService.log_trust_event(db_session, buyer.id, "Deal Completed", 50, 60, "First deal")
    TrustScoreService.log_trust_event(db_session, buyer.id, "Deal Completed", 60, 70, "Second deal spam")
    db_session.commit()

    # The second one should be ignored due to the 30-second window anti-gaming rule
    events = db_session.query(BuyerTrustEvent).filter(BuyerTrustEvent.buyer_id == buyer.id).all()
    assert len(events) == 1
    assert events[0].new_score == 60

def test_trust_endpoints(client: TestClient, db_session: Session):
    # Register and login admin
    admin_headers = get_auth_headers(client, email="admin@smartbazaar.ai", password="AdminPassword123!", name="Admin")
    # Mark user as admin in DB
    admin_user = db_session.query(User).filter(User.email == "admin@smartbazaar.ai").first()
    if admin_user:
        admin_user.is_admin = True
        db_session.commit()

    # Register and login regular buyer
    buyer_headers = get_auth_headers(client, email="regular_buyer@example.com", password="BuyerPassword123!", name="Buyer")

    # Fetch buyer ID
    buyer = db_session.query(User).filter(User.email == "regular_buyer@example.com").first()
    assert buyer is not None

    # Test GET /api/trust-score/{buyer_id}
    res = client.get(f"/api/trust-score/{buyer.id}", headers=buyer_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["buyer_id"] == buyer.id
    assert "trust_score" in data
    assert "trust_level" in data

    # Test GET /api/trust-history/{buyer_id}
    res_hist = client.get(f"/api/trust-history/{buyer.id}", headers=buyer_headers)
    assert res_hist.status_code == 200
    assert isinstance(res_hist.json(), list)

    # Test POST /api/trust/recalculate/{buyer_id} by non-admin -> 403 Forbidden
    res_recalc_fail = client.post(f"/api/trust/recalculate/{buyer.id}", headers=buyer_headers)
    assert res_recalc_fail.status_code == 403

    # Test POST /api/trust/recalculate/{buyer_id} by admin -> 200 OK
    res_recalc_ok = client.post(f"/api/trust/recalculate/{buyer.id}", headers=admin_headers)
    assert res_recalc_ok.status_code == 200
    assert res_recalc_ok.json()["buyer_id"] == buyer.id
