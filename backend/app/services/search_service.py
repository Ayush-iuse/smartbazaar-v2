from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from backend.app.models.listing import Listing
from backend.app.services.ai_service import AIService

def search_listings(
    db: Session,
    query: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None
) -> List[Listing]:
    db_query = db.query(Listing).filter(Listing.fraud_level != "High")
    
    # NLP / Regex smart parser integration
    if query:
        parsed = AIService.parse_search_query(query)
        
        if parsed.get("category"):
            category = parsed["category"]
        if parsed.get("location"):
            location = parsed["location"]
            
        if parsed.get("max_price"):
            db_query = db_query.filter(Listing.price <= parsed["max_price"])
            
        keywords = parsed.get("keywords", [])
        if keywords:
            conditions = []
            for kw in keywords:
                conditions.append(Listing.title.ilike(f"%{kw}%"))
                conditions.append(Listing.description.ilike(f"%{kw}%"))
            db_query = db_query.filter(or_(*conditions))
        else:
            db_query = db_query.filter(Listing.title.ilike(f"%{query}%"))
            
    if category:
        db_query = db_query.filter(Listing.category.ilike(category))
        
    if location:
        db_query = db_query.filter(Listing.location.ilike(location))
        
    results = db_query.order_by(Listing.created_at.desc()).all()
    
    # Fallback to category list if 0 results to prevent blank screen
    if not results and category:
        results = db.query(Listing).filter(
            Listing.category.ilike(category),
            Listing.fraud_level != "High"
        ).order_by(Listing.created_at.desc()).limit(4).all()
        
    return results
