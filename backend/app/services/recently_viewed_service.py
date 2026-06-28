from sqlalchemy.orm import Session
from datetime import datetime
import json
from backend.app.models.recently_viewed import RecentlyViewed
from backend.app.models.listing_view import ListingView
from backend.app.models.listing import Listing

class RecentlyViewedService:
    @staticmethod
    def record_listing_view(db: Session, listing_id: int, user_id: int):
        # 1. Log in raw listing_views for metrics tracking
        view_log = ListingView(listing_id=listing_id, viewer_id=user_id)
        db.add(view_log)
        
        # Increment listing's views_count cache
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if listing:
            if not hasattr(listing, "views_count") or listing.views_count is None:
                listing.views_count = 0
            listing.views_count += 1
            
        # 2. Update recently_viewed table if user is logged in
        if user_id is not None:
            existing_view = db.query(RecentlyViewed).filter(
                RecentlyViewed.user_id == user_id,
                RecentlyViewed.listing_id == listing_id
            ).first()
            
            if existing_view:
                existing_view.viewed_at = datetime.utcnow()
            else:
                new_view = RecentlyViewed(user_id=user_id, listing_id=listing_id)
                db.add(new_view)
            
        db.commit()

    @staticmethod
    def get_recently_viewed(db: Session, user_id: int, limit: int = 5):
        views = db.query(RecentlyViewed).filter(
            RecentlyViewed.user_id == user_id
        ).order_by(RecentlyViewed.viewed_at.desc()).limit(limit).all()
        
        results = []
        for v in views:
            listing = v.listing
            if not listing:
                continue
                
            # Parse listing images
            image_url = ""
            try:
                images = json.loads(listing.image_urls or "[]")
                if isinstance(images, list) and len(images) > 0:
                    image_url = images[0]
            except Exception:
                image_url = listing.image_urls or ""
                
            results.append({
                "id": listing.id,
                "title": listing.title,
                "price": listing.price,
                "category": listing.category,
                "location": listing.location,
                "image_url": image_url,
                "viewed_at": v.viewed_at
            })
        return results
