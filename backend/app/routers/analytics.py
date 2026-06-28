from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.analytics import AnalyticsOverviewResponse, AIInsightResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Marketplace Analytics"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def read_analytics_overview(db: Session = Depends(get_db)):
    return AnalyticsService.get_overview(db)

@router.get("/insights", response_model=AIInsightResponse)
def read_ai_insights(db: Session = Depends(get_db)):
    return AnalyticsService.generate_ai_insights(db)
