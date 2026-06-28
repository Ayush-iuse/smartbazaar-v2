import pytest
from backend.app.services.trust_service import TrustService
from backend.app.models.seller_score import SellerScore

def test_trust_service_score_calculation(db_session, test_seller):
    # Calculate score for a brand new seller
    score_data = TrustService.calculate_trust_score(db_session, test_seller.id)
    
    # Verify defaults
    assert score_data["trust_score"] >= 0
    assert score_data["trust_score"] <= 100
    assert "level" in score_data
    assert score_data["response_rate"] == 1.0

    # Retrieve from db
    seller_score = db_session.query(SellerScore).filter(SellerScore.seller_id == test_seller.id).first()
    assert seller_score is not None
    assert seller_score.trust_score == score_data["trust_score"]
    assert seller_score.level == score_data["level"]
