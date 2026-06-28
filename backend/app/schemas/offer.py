from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class OfferCreate(BaseModel):
    listing_id: int
    offer_amount: float = Field(..., gt=0, description="Offer amount must be greater than zero")

class OfferUpdate(BaseModel):
    status: str

class OfferResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    offer_amount: float
    status: str
    created_at: datetime
    updated_at: datetime
    listing_title: Optional[str] = None
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None

    class Config:
        from_attributes = True
