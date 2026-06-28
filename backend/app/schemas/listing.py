from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional
import json

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., ge=0, description="Price must be non-negative")
    category: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    image_urls: List[str] = Field(default=[], max_items=4, description="Up to 4 image URLs")

class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    category: Optional[str] = None
    location: Optional[str] = None
    image_urls: Optional[List[str]] = Field(None, max_items=4)

class ListingResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    category: str
    location: str
    image_urls: List[str] = []
    seller_id: int
    fraud_score: float = 0.0
    fraud_level: str = "Low"
    status: str = "Active"
    views_count: int = 0
    saves_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

    # Pre-parse stringified list from db to json
    @field_validator("image_urls", mode="before")
    @classmethod
    def parse_image_urls(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v

class ListingScoreResponse(BaseModel):
    listing_id: int
    listing_score: int
    sale_probability: int
    competition_score: int
    price_score: int
    description_score: int
    recommendations: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

    @field_validator("recommendations", mode="before")
    @classmethod
    def parse_recommendations(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v
