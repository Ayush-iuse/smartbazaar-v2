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
