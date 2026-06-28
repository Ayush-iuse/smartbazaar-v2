from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ChatConversationCreate(BaseModel):
    listing_id: int

class ChatMessageCreate(BaseModel):
    content: Optional[str] = None
    message_type: str = "text"  # text, image, voice, offer, system
    media_url: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: Optional[str] = None
    message_type: str
    media_url: Optional[str] = None
    is_delivered: bool
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChatConversationResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    is_archived_buyer: bool
    is_archived_seller: bool
    is_pinned_buyer: bool
    is_pinned_seller: bool
    created_at: datetime
    updated_at: datetime
    other_party_name: Optional[str] = None
    listing_title: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    other_party_online: bool = False

    class Config:
        from_attributes = True

class ChatReactionCreate(BaseModel):
    emoji: str = Field(..., description="Reaction emoji like 👍, ❤️, 🔥, 😂, 👀")

class ToggleArchiveRequest(BaseModel):
    archive: bool

class TogglePinRequest(BaseModel):
    pin: bool
