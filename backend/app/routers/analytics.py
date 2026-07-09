from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, date, timedelta
from typing import Optional
from backend.app.database import get_db
from backend.app.schemas.analytics import AnalyticsOverviewResponse, AIInsightResponse
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.offer import Offer
from backend.app.models.listing_view import ListingView

router = APIRouter(prefix="/analytics", tags=["Marketplace Analytics"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def read_analytics_overview(db: Session = Depends(get_db)):
    """Global marketplace analytics — all listings."""
    return AnalyticsService.get_overview(db)

@router.get("/insights", response_model=AIInsightResponse)
def read_ai_insights(db: Session = Depends(get_db)):
    """AI-generated marketplace insights."""
    return AnalyticsService.generate_ai_insights(db)

@router.get("/my")
def read_my_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Per-user analytics — only shows data for the authenticated user's listings."""
    user_id = current_user.id

    # My listings
    my_listings = db.query(Listing).filter(Listing.seller_id == user_id).all()
    total_listings = len(my_listings)
    listing_ids = [l.id for l in my_listings]

    # Total views on my listings
    total_views = 0
    if listing_ids:
        total_views = db.query(ListingView).filter(ListingView.listing_id.in_(listing_ids)).count()

    # Offers received on my listings
    offers_received = 0
    accepted_offers = 0
    total_revenue = 0.0
    if listing_ids:
        all_offers = db.query(Offer).filter(Offer.listing_id.in_(listing_ids)).all()
        offers_received = len(all_offers)
        accepted = [o for o in all_offers if o.status == "Accepted"]
        accepted_offers = len(accepted)
        total_revenue = sum(o.offer_amount for o in accepted)

    # Conversion rate
    conversion_rate = (accepted_offers / offers_received * 100) if offers_received > 0 else 0.0

    # Daily listing views (last 7 days)
    today = date.today()
    daily_views = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        cnt = 0
        if listing_ids:
            cnt = db.query(ListingView).filter(
                ListingView.listing_id.in_(listing_ids),
                cast(ListingView.viewed_at, Date) == d
            ).count()
        daily_views.append({"date": d_str, "views": cnt})

    # Category breakdown of my listings
    from collections import Counter
    category_counts = Counter(l.category for l in my_listings)
    categories = [{"category": cat, "count": cnt} for cat, cnt in category_counts.most_common()]

    # Active vs sold
    active_count = sum(1 for l in my_listings if l.status == "Active")
    sold_count = sum(1 for l in my_listings if l.status == "Sold")

    return {
        "total_listings": total_listings,
        "active_listings": active_count,
        "sold_listings": sold_count,
        "total_views": total_views,
        "offers_received": offers_received,
        "accepted_offers": accepted_offers,
        "conversion_rate": round(conversion_rate, 2),
        "total_revenue": round(total_revenue, 2),
        "daily_views": daily_views,
        "categories": categories,
    }
