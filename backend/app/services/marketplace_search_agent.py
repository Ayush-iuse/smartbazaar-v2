from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.models.listing import Listing
from backend.app.services.trust_service import TrustService

class MarketplaceSearchAgent:
    @staticmethod
    def execute_search(
        db: Session,
        query_string: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        only_verified_sellers: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Executes a database search for listings matching the given constraints,
        omitting listings flagged with high fraud levels to prioritize safe trades.
        """
        db_query = db.query(Listing).filter(Listing.fraud_level != "High", Listing.status == "Active")
        
        if query_string:
            keywords = [kw.strip().lower() for kw in query_string.split() if len(kw.strip()) > 2]
            if keywords:
                conditions = []
                for kw in keywords:
                    conditions.append(Listing.title.ilike(f"%{kw}%"))
                    conditions.append(Listing.description.ilike(f"%{kw}%"))
                db_query = db_query.filter(or_(*conditions))
            else:
                db_query = db_query.filter(Listing.title.ilike(f"%{query_string}%"))
                
        if category:
            db_query = db_query.filter(Listing.category.ilike(category))
            
        if location:
            db_query = db_query.filter(Listing.location.ilike(location))
            
        if min_price is not None:
            db_query = db_query.filter(Listing.price >= min_price)
            
        if max_price is not None:
            db_query = db_query.filter(Listing.price <= max_price)
            
        listings = db_query.order_by(Listing.created_at.desc()).all()
        
        results = []
        for item in listings:
            # Check seller trust details if needed
            trust_details = TrustService.get_seller_score_precalculated(db, item.seller_id)
            seller_badge = trust_details.get("level", "New Seller")
            
            if only_verified_sellers and seller_badge not in ["Trusted Seller", "Verified Seller", "Elite Seller"]:
                continue
                
            results.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "price": item.price,
                "category": item.category,
                "location": item.location,
                "image_urls": item.image_urls,
                "seller_id": item.seller_id,
                "seller_badge": seller_badge,
                "seller_trust_score": trust_details.get("trust_score", 0),
                "fraud_score": item.fraud_score,
                "fraud_level": item.fraud_level,
                "created_at": item.created_at.isoformat() if item.created_at else None
            })
            
        return results
