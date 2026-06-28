from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from backend.app.models.listing import Listing
from backend.app.models.listing_score import ListingScore
from backend.app.models.analytics_snapshot import AnalyticsSnapshot
from backend.app.services.ai_service import get_openai_client
import json

class AnalyticsService:
    @staticmethod
    def get_overview(db: Session) -> dict:
        total_listings = db.query(Listing).count()
        
        # Category breakdown
        category_counts = db.query(
            Listing.category,
            func.count(Listing.id).label("count"),
            func.avg(Listing.price).label("avg_price")
        ).group_by(Listing.category).all()
        
        categories_data = []
        for cat, cnt, avg_pr in category_counts:
            # Count high risk fraud listings
            fraud_count = db.query(Listing).filter(
                Listing.category == cat,
                Listing.fraud_level == "High"
            ).count()
            fraud_rate = (fraud_count / cnt * 100) if cnt > 0 else 0.0
            
            categories_data.append({
                "category": cat,
                "count": cnt,
                "avg_price": round(avg_pr, 2) if avg_pr else 0.0,
                "fraud_rate": round(fraud_rate, 2)
            })

        # Location trends
        location_counts = db.query(
            Listing.location,
            func.count(Listing.id).label("count")
        ).group_by(Listing.location).order_by(func.count(Listing.id).desc()).limit(5).all()
        
        locations_data = [{"location": loc, "count": cnt} for loc, cnt in location_counts]

        # Fraud distribution
        fraud_levels = db.query(
            Listing.fraud_level,
            func.count(Listing.id).label("count")
        ).group_by(Listing.fraud_level).all()
        
        fraud_data = {lvl: cnt for lvl, cnt in fraud_levels}

        # Daily listings trend (last 7 days)
        today = date.today()
        daily_trends = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.strftime("%Y-%m-%d")
            # Query count of listings created on date d in SQLite
            cnt = db.query(Listing).filter(
                func.strftime("%Y-%m-%d", Listing.created_at) == d_str
            ).count()
            daily_trends.append({
                "date": d_str,
                "count": cnt
            })

        return {
            "total_listings": total_listings,
            "categories": categories_data,
            "locations": locations_data,
            "fraud_distribution": fraud_data,
            "daily_trends": daily_trends
        }

    @staticmethod
    def generate_ai_insights(db: Session) -> dict:
        overview = AnalyticsService.get_overview(db)
        
        categories_str = ", ".join([f"{c['category']} ({c['count']} listings, avg ₹{c['avg_price']:.0f})" for c in overview["categories"]])
        total = overview["total_listings"]
        
        fallback_summary = (
            f"[AI Native Insights] The P2P marketplace currently hosts {total} active listings. "
            f"Category distribution includes: {categories_str}. "
            f"Geographic hotspots are concentrated in {', '.join([l['location'] for l in overview['locations'][:3]])}. "
            f"Overall listing quality remains stable, with automated fraud detection rules continuously monitoring transactions."
        )

        client = get_openai_client()
        if not client:
            return {
                "summary": fallback_summary,
                "is_fallback": True
            }
            
        try:
            prompt = (
                f"Analyze these marketplace statistics: "
                f"Total Listings: {total}. Categories distribution: {json.dumps(overview['categories'])}. "
                f"Locations hotspots: {json.dumps(overview['locations'])}. "
                f"Fraud distribution levels: {json.dumps(overview['fraud_distribution'])}. "
                f"Write a professional, encouraging 3-sentence summary of marketplace health, highlighting fastest growing category or warning about scam trends."
            )
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a senior analyst assistant. Write a short, highly professional summary."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            summary = response.choices[0].message.content.strip()
            if not summary.startswith("[AI Native Insights]"):
                summary = f"[AI Native Insights] {summary}"
            return {
                "summary": summary,
                "is_fallback": False
            }
        except Exception as e:
            return {
                "summary": fallback_summary,
                "is_fallback": True
            }
