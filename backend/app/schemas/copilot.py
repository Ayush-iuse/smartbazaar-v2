from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CopilotChatRequest(BaseModel):
    session_id: Optional[int] = Field(default=None, description="Active session ID or null to create a new session")
    query: str = Field(..., min_length=1, description="User's query / natural language prompt")

class CopilotMessageResponse(BaseModel):
    id: int
    session_id: int
    sender: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class CopilotSessionResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CopilotMemoryResponse(BaseModel):
    key: str
    value: str
    updated_at: datetime

    class Config:
        from_attributes = True

class CopilotActionResponse(BaseModel):
    id: int
    session_id: int
    action_type: str
    action_data: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CopilotSuggestionsResponse(BaseModel):
    suggestions: List[str]
