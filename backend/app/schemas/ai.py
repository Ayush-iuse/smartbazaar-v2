from pydantic import BaseModel, Field
from typing import List

class AIDescriptionRequest(BaseModel):
    title: str = Field(..., min_length=1)
    keywords: List[str] = Field(default=[])

class AIDescriptionResponse(BaseModel):
    description: str
    is_fallback: bool

class AICategoryRequest(BaseModel):
    title: str = Field(..., min_length=1)

class AICategoryResponse(BaseModel):
    category: str
    is_fallback: bool

class AIPriceRequest(BaseModel):
    title: str = Field(..., min_length=1)
    condition: str = Field(..., description="e.g. new, used, refurbished")

class AIPriceResponse(BaseModel):
    suggested_min: float
    suggested_max: float
    currency: str = "INR"
    is_fallback: bool

class AIFraudRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

class AIFraudResponse(BaseModel):
    fraud_score: float
    fraud_level: str
    flagged_phrases: List[str]
    is_fallback: bool

class AICopilotRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    category: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    condition: str = Field(..., min_length=1)
    image_count: int = Field(default=0, ge=0)

class AICopilotResponse(BaseModel):
    listing_score: int
    sale_probability: int
    competition_score: int
    price_score: int
    description_score: int
    trust_impact: int
    expected_sell_time: str
    recommendations: List[str]
    is_fallback: bool

class AIBuyerAgentRequest(BaseModel):
    listing_id: int

class AIBuyerAgentResponse(BaseModel):
    advice: str
    pros: List[str]
    cons: List[str]
    suggested_min: float
    suggested_max: float
    risk_level: str
    explanation: str
    is_fallback: bool
