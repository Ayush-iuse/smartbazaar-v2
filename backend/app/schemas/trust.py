from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class BuyerTrustScoreResponse(BaseModel):
    buyer_id: int
    trust_score: int
    trust_level: str
    completed_deals: int
    cancelled_deals: int
    spam_reports: int
    response_rate: float
    updated_at: datetime

    class Config:
        from_attributes = True

class BuyerTrustEventResponse(BaseModel):
    id: int
    buyer_id: int
    event_type: str
    old_score: int
    new_score: int
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
