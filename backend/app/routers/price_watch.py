from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.price_watch_service import PriceWatchService

router = APIRouter(prefix="/price-watch", tags=["Price Watch"])

class PriceWatchCreate(BaseModel):
    listing_id: int

class PriceWatchResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int
    last_notified_price: float
    created_at: datetime
    listing_title: str | None = None
    listing_price: float | None = None

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            listing_id=obj.listing_id,
            last_notified_price=obj.last_notified_price,
            created_at=obj.created_at,
            listing_title=obj.listing.title if obj.listing else "Deleted Listing",
            listing_price=obj.listing.price if obj.listing else 0.0
        )

@router.get("", response_model=List[PriceWatchResponse])
def get_price_watches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    watches = PriceWatchService.get_user_watches(db, current_user.id)
    return [PriceWatchResponse.from_orm(w) for w in watches]

@router.post("", response_model=PriceWatchResponse, status_code=status.HTTP_201_CREATED)
def watch_listing(payload: PriceWatchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    watch = PriceWatchService.watch_listing(db, current_user.id, payload.listing_id)
    if not watch:
        raise HTTPException(status_code=404, detail="Listing not found")
    return PriceWatchResponse.from_orm(watch)

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def unwatch_listing(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = PriceWatchService.unwatch_listing(db, current_user.id, listing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Watch subscription not found")
    return None
