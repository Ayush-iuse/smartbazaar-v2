from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.ai import (
    AIDescriptionRequest,
    AIDescriptionResponse,
    AICategoryRequest,
    AICategoryResponse,
    AIPriceRequest,
    AIPriceResponse,
    AIFraudRequest,
    AIFraudResponse,
    AICopilotRequest,
    AICopilotResponse,
    AIBuyerAgentRequest,
    AIBuyerAgentResponse,
    AIChatAssistantRequest,
    AIChatAssistantResponse,
)
from backend.app.services.ai_service import AIService
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Integration"])

@router.post("/description", response_model=AIDescriptionResponse)
def generate_description(
    req: AIDescriptionRequest,
    current_user: User = Depends(get_current_user)
):
    desc, is_fallback = AIService.generate_description(req.title, req.keywords)
    return {"description": desc, "is_fallback": is_fallback}

@router.post("/category", response_model=AICategoryResponse)
def predict_category(
    req: AICategoryRequest,
    current_user: User = Depends(get_current_user)
):
    cat, is_fallback = AIService.predict_category(req.title)
    return {"category": cat, "is_fallback": is_fallback}

@router.post("/price", response_model=AIPriceResponse)
def recommend_price(
    req: AIPriceRequest,
    current_user: User = Depends(get_current_user)
):
    low, high, is_fallback = AIService.recommend_price(req.title, req.condition)
    return {"suggested_min": low, "suggested_max": high, "currency": "INR", "is_fallback": is_fallback}

@router.post("/fraud", response_model=AIFraudResponse)
def detect_fraud(
    req: AIFraudRequest,
    current_user: User = Depends(get_current_user)
):
    score, level, flagged, is_fallback = AIService.detect_fraud(req.title, req.description)
    return {"fraud_score": score, "fraud_level": level, "flagged_phrases": flagged, "is_fallback": is_fallback}

@router.post("/copilot", response_model=AICopilotResponse)
def copilot_analyze(
    req: AICopilotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AIService.copilot_analyze(
        db=db,
        title=req.title,
        description=req.description,
        price=req.price,
        category=req.category,
        location=req.location,
        condition=req.condition,
        image_count=req.image_count
    )
    return result

@router.post("/buyer-agent", response_model=AIBuyerAgentResponse)
def buyer_agent_analyze(
    req: AIBuyerAgentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AIService.buyer_agent_analyze(
        db=db,
        listing_id=req.listing_id
    )
    return result

@router.post("/chat-assistant", response_model=AIChatAssistantResponse)
def chat_assistant_analyze(
    req: AIChatAssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AIService.chat_assistant_analyze(
        db=db,
        conversation_id=req.conversation_id,
        query=req.query
    )
    return result

@router.get("/buy-vs-rent/{listing_id}")
def buy_vs_rent_advisor(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from backend.app.models.listing import Listing
    from backend.app.models.rental import RentalListing
    from fastapi import HTTPException

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    rental = db.query(RentalListing).filter(RentalListing.listing_id == listing_id).first()
    
    buy_price = listing.price
    daily_rate = rental.rental_daily_rate if (rental and rental.rental_daily_rate) else (buy_price * 0.05)
    if daily_rate <= 0:
        daily_rate = buy_price * 0.05 if buy_price > 0 else 100.0

    break_even_days = int(buy_price / daily_rate) if daily_rate > 0 else 20
    
    recommendation = f"Renting is cheaper if you plan to use this for less than {break_even_days} days. Otherwise, buying is more economical."

    return {
        "buy_price": buy_price,
        "rental_daily_rate": daily_rate,
        "break_even_days": break_even_days,
        "recommendation": recommendation
    }

@router.get("/price-fairness/{listing_id}")
def price_fairness_meter(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from backend.app.models.listing import Listing
    from sqlalchemy import func
    from fastapi import HTTPException

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    avg_price = db.query(func.avg(Listing.price)).filter(
        Listing.category == listing.category,
        Listing.location == listing.location,
        Listing.status == "Active"
    ).scalar() or listing.price

    price = listing.price
    diff_pct = ((price - avg_price) / avg_price * 100) if avg_price > 0 else 0.0

    if diff_pct < -15:
        rating = "Excellent Deal"
    elif diff_pct <= 15:
        rating = "Fair Price"
    else:
        rating = "Expensive"

    return {
        "listing_price": price,
        "average_market_price": round(avg_price, 2),
        "difference_percent": round(diff_pct, 1),
        "rating": rating
    }
