import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.risk_score import RiskScore
from backend.app.models.copilot import CopilotSession, CopilotMessage, CopilotMemory, CopilotAction
from backend.app.services.intent_parser_service import IntentParserService
from backend.app.services.marketplace_search_agent import MarketplaceSearchAgent
from backend.app.services.fraud_analysis_agent import FraudAnalysisAgent
from backend.app.services.price_advisor_agent import PriceAdvisorAgent
from backend.app.services.comparison_agent import ComparisonAgent
from backend.app.services.copilot_service import CopilotService

# 1. Test Intent Classification Rules Fallback
def test_intent_parsing_rules():
    assert IntentParserService.parse_intent("Show me cycles in Pune under 5000") == "search"
    assert IntentParserService.parse_intent("Compare item 12 and 13") == "compare"
    assert IntentParserService.parse_intent("Is listing #10 safe to transact?") == "safety"
    assert IntentParserService.parse_intent("Is ₹45000 a fair price for this mobile?") == "price"
    assert IntentParserService.parse_intent("How can I negotiate listing #5?") == "negotiate"

# 2. Test MarketplaceSearchAgent DB Queries
def test_search_agent_queries(db_session: Session, test_seller: User):
    listing1 = Listing(
        title="Gaming laptop Asus",
        description="Core i7 16GB",
        price=60000.0,
        category="Electronics",
        location="Pune",
        seller_id=test_seller.id,
        status="Active",
        fraud_level="Low"
    )
    listing2 = Listing(
        title="Wooden Chair brand new",
        description="Solid teak wood chair",
        price=4500.0,
        category="Furniture",
        location="Pune",
        seller_id=test_seller.id,
        status="Active",
        fraud_level="High"  # Flagged scam listing
    )
    db_session.add_all([listing1, listing2])
    db_session.commit()

    # Query search
    res = MarketplaceSearchAgent.execute_search(
        db=db_session,
        query_string="laptop",
        location="Pune"
    )
    assert len(res) == 1
    assert res[0]["title"] == "Gaming laptop Asus"
    assert res[0]["seller_badge"] == "New Seller"

    # Query fraud exclusions (High fraud should be excluded)
    fraud_res = MarketplaceSearchAgent.execute_search(
        db=db_session,
        category="Furniture"
    )
    assert len(fraud_res) == 0

# 3. Test FraudAnalysisAgent Rating
def test_fraud_analysis_agent(db_session: Session, test_seller: User):
    # Setup moderate/high risk listing
    listing = Listing(
        title="Suspicious iPhone deal",
        description="Advance payment only western union",
        price=15000.0,
        category="Electronics",
        location="Mumbai",
        seller_id=test_seller.id,
        status="Active",
        fraud_score=80.0,
        fraud_level="High"
    )
    db_session.add(listing)
    db_session.commit()

    eval_res = FraudAnalysisAgent.evaluate_risk(db_session, listing_id=listing.id)
    assert eval_res["risk_rating"] == "High Risk"
    assert "flagged" in eval_res["reasons"][0] or "High" in eval_res["reasons"][0] or "western union" in eval_res["reasons"][0]

# 4. Test PriceAdvisorAgent Calculations
def test_price_advisor_agent(db_session: Session, test_seller: User):
    listing1 = Listing(
        title="Teak sofa 1",
        price=20000.0,
        category="Furniture",
        location="Pune",
        seller_id=test_seller.id,
        status="Active",
        fraud_level="Low"
    )
    listing2 = Listing(
        title="Teak sofa 2",
        price=30000.0,
        category="Furniture",
        location="Pune",
        seller_id=test_seller.id,
        status="Active",
        fraud_level="Low"
    )
    db_session.add_all([listing1, listing2])
    db_session.commit()

    # Category average of Sofa Furniture should be (20000 + 30000)/2 = 25000
    eval_res = PriceAdvisorAgent.analyze_price(db_session, category="Furniture", input_price=35000.0)
    assert eval_res["category_average"] == 25000.0
    assert eval_res["difference_pct"] == 40.0
    assert eval_res["price_status"] == "Overpriced"

# 5. Test ComparisonAgent Pro/Con Assignment
def test_comparison_agent(db_session: Session, test_seller: User):
    listing1 = Listing(
        title="Acoustic Guitar Yamaha",
        price=8000.0,
        category="Others",
        location="Delhi",
        seller_id=test_seller.id,
        status="Active",
        fraud_level="Low"
    )
    listing2 = Listing(
        title="Electric Guitar Ibanez",
        price=15000.0,
        category="Others",
        location="Delhi",
        seller_id=test_seller.id,
        status="Active",
        fraud_level="Low"
    )
    db_session.add_all([listing1, listing2])
    db_session.commit()

    comparison = ComparisonAgent.compare_listings(db_session, [listing1.id, listing2.id])
    assert len(comparison["listings"]) == 2
    cheapest = next(x for x in comparison["listings"] if x["id"] == listing1.id)
    assert "Lowest price" in cheapest["pros"][0]

# 6. Test CopilotService memory updates & action logs
def test_copilot_service(db_session: Session, test_buyer: User):
    session = CopilotService.create_session(db_session, user_id=test_buyer.id, title="Test Chat")
    
    # Process user query
    msg = CopilotService.process_query(
        db=db_session,
        session_id=session.id,
        user_id=test_buyer.id,
        query="I am looking for a laptop in Mumbai under 12000"
    )
    
    assert msg.sender == "assistant"
    
    # Verify memory update
    memory = CopilotService.get_user_memory(db_session, test_buyer.id)
    assert memory.get("location") == "Mumbai"
    assert memory.get("category") == "Electronics"
    assert memory.get("budget") == "12000.0"

    # Verify action log audit trace
    actions = db_session.query(CopilotAction).filter(CopilotAction.session_id == session.id).all()
    assert len(actions) > 0
    assert actions[0].action_type == "search"

# 7. Test REST Endpoints
def test_copilot_endpoints(client: TestClient, test_buyer: User, buyer_token: str, test_listing: Listing):
    headers = {"Authorization": f"Bearer {buyer_token}"}

    # Verify chat suggestions
    sug_res = client.get("/api/copilot/suggestions")
    assert sug_res.status_code == 200
    assert "suggestions" in sug_res.json()

    # Chat execution
    chat_res = client.post(
        "/api/copilot/chat",
        headers=headers,
        json={"query": f"Is listing #{test_listing.id} safe to buy?"}
    )
    assert chat_res.status_code == 201
    data = chat_res.json()
    assert data["sender"] == "assistant"
    session_id = data["session_id"]

    # History retrieval
    hist_res = client.get(f"/api/copilot/history?session_id={session_id}", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 2  # User message and assistant reply

    # Actions list retrieval
    act_res = client.get(f"/api/copilot/session/{session_id}/actions", headers=headers)
    assert act_res.status_code == 200
    assert len(act_res.json()) > 0
    assert act_res.json()[0]["action_type"] == "fraud_analysis"

    # Memory list retrieval
    mem_res = client.get("/api/copilot/memory", headers=headers)
    assert mem_res.status_code == 200

    # Delete session
    del_res = client.delete(f"/api/copilot/session/{session_id}", headers=headers)
    assert del_res.status_code == 200

    # Clear memory
    clear_res = client.delete("/api/copilot/memory", headers=headers)
    assert clear_res.status_code == 200
