from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ConversationCreate(BaseModel):
    listing_id: int

class MessageResponseMini(BaseModel):
    id: int
    sender_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime
    other_party_name: Optional[str] = None
    listing_title: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConversationDetailResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponseMini] = []

    class Config:
        from_attributes = True
