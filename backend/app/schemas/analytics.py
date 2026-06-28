from pydantic import BaseModel
from typing import List, Dict

class CategoryMetric(BaseModel):
    category: str
    count: int
    avg_price: float
    fraud_rate: float

class LocationMetric(BaseModel):
    location: str
    count: int

class DailyTrendMetric(BaseModel):
    date: str
    count: int

class AnalyticsOverviewResponse(BaseModel):
    total_listings: int
    categories: List[CategoryMetric]
    locations: List[LocationMetric]
    fraud_distribution: Dict[str, int]
    daily_trends: List[DailyTrendMetric]

class AIInsightResponse(BaseModel):
    summary: str
    is_fallback: bool
