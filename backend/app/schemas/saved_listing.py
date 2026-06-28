from pydantic import BaseModel
from datetime import datetime

class SavedListingCreate(BaseModel):
    listing_id: int

class SavedListingResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int
    created_at: datetime
    listing_title: str
    listing_price: float
    listing_image: str

    class Config:
        from_attributes = True
