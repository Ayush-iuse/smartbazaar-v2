from pydantic import BaseModel, Field
from datetime import datetime

class MessageCreate(BaseModel):
    conversation_id: int
    content: str = Field(..., min_length=1, description="Message content cannot be empty")

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
