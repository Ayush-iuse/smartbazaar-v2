from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.listing import Listing
from backend.app.models.listing_score import ListingScore

class RecommendationService:
    @staticmethod
    def get_similar_listings(db: Session, listing_id: int, limit: int = 4) -> list:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return []
            
        # Get listings in the same category, excluding the item itself, ignoring high fraud risks
        similar = db.query(Listing).filter(
            Listing.category == listing.category,
            Listing.id != listing.id,
            Listing.fraud_level != "High"
        ).order_by(desc(Listing.created_at)).limit(limit).all()
        
        # Fallback/fill remaining slots with listings in same location
        if len(similar) < limit:
            additional_limit = limit - len(similar)
            excluded_ids = [listing.id] + [s.id for s in similar]
            additional = db.query(Listing).filter(
                Listing.location == listing.location,
                ~Listing.id.in_(excluded_ids),
                Listing.fraud_level != "High"
            ).order_by(desc(Listing.created_at)).limit(additional_limit).all()
            similar.extend(additional)
            
        return similar

    @staticmethod
    def get_trending_listings(db: Session, limit: int = 4) -> list:
        # Join ListingScore and sort by the highest health/listing score
        trending = db.query(Listing).join(
            ListingScore,
            ListingScore.listing_id == Listing.id
        ).filter(
            Listing.fraud_level != "High"
        ).order_by(
            desc(ListingScore.listing_score)
        ).limit(limit).all()
        
        # Fallback to latest listings if not enough items have score metrics computed
        if len(trending) < limit:
            additional_limit = limit - len(trending)
            excluded_ids = [t.id for t in trending]
            additional = db.query(Listing).filter(
                ~Listing.id.in_(excluded_ids),
                Listing.fraud_level != "High"
            ).order_by(desc(Listing.created_at)).limit(additional_limit).all()
            trending.extend(additional)
            
        return trending

    @staticmethod
    def get_personalized_recommendations(db: Session, user_id: int, limit: int = 6) -> list:
        from backend.app.models.recently_viewed import RecentlyViewed
        from backend.app.models.saved_listing import SavedListing

        # 1. Get user's viewed and saved listings
        viewed_ids = [rv.listing_id for rv in db.query(RecentlyViewed).filter(RecentlyViewed.user_id == user_id).all()]
        saved_ids = [sl.listing_id for sl in db.query(SavedListing).filter(SavedListing.user_id == user_id).all()]
        interacted_ids = list(set(viewed_ids + saved_ids))

        if not interacted_ids:
            return RecommendationService.get_trending_listings(db, limit=limit)

        # 2. Extract categories
        categories = [r[0] for r in db.query(Listing.category).filter(Listing.id.in_(interacted_ids)).distinct().all()]

        # 3. Query active listings in same categories (excluding user's own listings and already interacted ones)
        recs = db.query(Listing).filter(
            Listing.category.in_(categories),
            Listing.seller_id != user_id,
            ~Listing.id.in_(interacted_ids),
            Listing.fraud_level != "High",
            Listing.status == "Active"
        ).order_by(desc(Listing.created_at)).limit(limit).all()

        # 4. Fill remaining slots with trending
        if len(recs) < limit:
            fill_limit = limit - len(recs)
            excluded = interacted_ids + [r.id for r in recs]
            trending = db.query(Listing).filter(
                Listing.seller_id != user_id,
                ~Listing.id.in_(excluded),
                Listing.fraud_level != "High",
                Listing.status == "Active"
            ).order_by(desc(Listing.created_at)).limit(fill_limit).all()
            recs.extend(trending)

        return recs
