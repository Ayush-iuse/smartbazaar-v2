from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas.trust import BuyerTrustScoreResponse, BuyerTrustEventResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.trust_score_service import TrustScoreService
from backend.app.models.user import User
from backend.app.models.buyer_trust_score import BuyerTrustScore
from backend.app.models.buyer_trust_event import BuyerTrustEvent

router = APIRouter(tags=["Buyer Trust"])

def check_admin(user: User):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can perform this action"
        )

@router.get("/trust-score/{buyer_id}", response_model=BuyerTrustScoreResponse)
def get_buyer_trust_score(
    buyer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the trust score and level for a buyer.
    If the trust score record does not exist, it calculates it on the fly.
    """
    try:
        trust_record = TrustScoreService.calculate_trust_score(db, buyer_id)
        return trust_record
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get("/trust-history/{buyer_id}", response_model=List[BuyerTrustEventResponse])
def get_buyer_trust_history(
    buyer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the trust score timeline/events history for a buyer.
    """
    # Enforce check that buyer exists
    buyer = db.query(User).filter(User.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail=f"Buyer not found: {buyer_id}")
        
    events = db.query(BuyerTrustEvent).filter(
        BuyerTrustEvent.buyer_id == buyer_id
    ).order_by(BuyerTrustEvent.created_at.desc()).all()
    return events

@router.post("/trust/recalculate/{buyer_id}", response_model=BuyerTrustScoreResponse)
def recalculate_buyer_trust_score(
    buyer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Forces recalculation of the trust score for a buyer. Admin only.
    """
    check_admin(current_user)
    try:
        trust_record = TrustScoreService.calculate_trust_score(db, buyer_id)
        return trust_record
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
