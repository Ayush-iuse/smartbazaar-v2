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
