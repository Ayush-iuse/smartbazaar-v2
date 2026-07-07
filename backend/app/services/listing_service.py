from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
import json
from backend.app.models.listing import Listing
from backend.app.models.listing_score import ListingScore
from backend.app.schemas.listing import ListingCreate, ListingUpdate
from backend.app.services.ai_service import AIService

from backend.app.utils.validation import sanitize_listing_input

def get_listing(db: Session, listing_id: int) -> Optional[Listing]:
    return db.query(Listing).filter(Listing.id == listing_id).first()

def get_listings(db: Session, skip: int = 0, limit: int = 20, allow_sale: Optional[bool] = None, allow_rental: Optional[bool] = None) -> List[Listing]:
    q = db.query(Listing)
    if allow_sale is not None:
        q = q.filter(Listing.allow_sale == allow_sale)
    if allow_rental is not None:
        q = q.filter(Listing.allow_rental == allow_rental)
    return q.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

def count_listings(db: Session) -> int:
    return db.query(Listing).count()

def create_listing(db: Session, listing_in: ListingCreate, seller_id: int) -> Listing:
    # Escape input fields to prevent XSS
    clean_title, clean_description = sanitize_listing_input(listing_in.title, listing_in.description or "")
    
    # Run automatic fraud scan before creation
    fraud_score, fraud_level, _, _ = AIService.detect_fraud(clean_title, clean_description)
    
    db_listing = Listing(
        title=clean_title,
        description=clean_description,
        price=listing_in.price,
        category=listing_in.category,
        location=listing_in.location,
        image_urls=json.dumps(listing_in.image_urls),
        seller_id=seller_id,
        fraud_score=fraud_score,
        fraud_level=fraud_level,
        allow_sale=listing_in.allow_sale,
        allow_rental=listing_in.allow_rental
    )
    db.add(db_listing)
    db.flush()  # flush to get db_listing.id before creating ListingScore
    
    # Run Seller Copilot to score the new listing
    desc_lower = clean_description.lower()
    condition = "New"
    if "like new" in desc_lower or "mint" in desc_lower:
        condition = "Like New"
    elif "good" in desc_lower or "great" in desc_lower:
        condition = "Good"
    elif "used" in desc_lower or "second" in desc_lower:
        condition = "Used"
    elif "fair" in desc_lower:
        condition = "Fair"
    elif "poor" in desc_lower:
        condition = "Poor"

    image_count = len(listing_in.image_urls) if listing_in.image_urls else 0
    
    analysis = AIService.copilot_analyze(
        db=db,
        title=clean_title,
        description=clean_description,
        price=listing_in.price,
        category=listing_in.category,
        location=listing_in.location,
        condition=condition,
        image_count=image_count
    )
    
    db_score = ListingScore(
        listing_id=db_listing.id,
        listing_score=analysis["listing_score"],
        sale_probability=analysis["sale_probability"],
        competition_score=analysis["competition_score"],
        price_score=analysis["price_score"],
        description_score=analysis["description_score"],
        recommendations=json.dumps(analysis["recommendations"])
    )
    db.add(db_score)
    
    db.commit()
    db.refresh(db_listing)
    try:
        from backend.app.services.saved_search_service import SavedSearchService
        SavedSearchService.check_listing_against_saved_searches(db, db_listing)
    except Exception as e:
        print(f"Error checking saved searches: {e}")
    return db_listing

def update_listing(db: Session, db_listing: Listing, listing_in: ListingUpdate) -> Listing:
    update_data = listing_in.dict(exclude_unset=True)
    
    # Escape input fields if they are updated to prevent XSS
    if "title" in update_data or "description" in update_data:
        title = update_data.get("title", db_listing.title)
        desc = update_data.get("description", db_listing.description or "")
        clean_title, clean_desc = sanitize_listing_input(title, desc)
        
        if "title" in update_data:
            update_data["title"] = clean_title
        if "description" in update_data:
            update_data["description"] = clean_desc
            
        fraud_score, fraud_level, _, _ = AIService.detect_fraud(clean_title, clean_desc)
        db_listing.fraud_score = fraud_score
        db_listing.fraud_level = fraud_level
        
    for field in update_data:
        if field == "image_urls":
            db_listing.image_urls = json.dumps(update_data[field])
        else:
            setattr(db_listing, field, update_data[field])
            
    db.commit()
    db.refresh(db_listing)
    
    # Recalculate listing score after save
    db_score = db.query(ListingScore).filter(ListingScore.listing_id == db_listing.id).first()
    
    desc_lower = (db_listing.description or "").lower()
    condition = "New"
    if "like new" in desc_lower or "mint" in desc_lower:
        condition = "Like New"
    elif "good" in desc_lower or "great" in desc_lower:
        condition = "Good"
    elif "used" in desc_lower or "second" in desc_lower:
        condition = "Used"
    elif "fair" in desc_lower:
        condition = "Fair"
    elif "poor" in desc_lower:
        condition = "Poor"

    try:
        images = json.loads(db_listing.image_urls)
    except:
        images = []
    image_count = len(images) if isinstance(images, list) else 0

    analysis = AIService.copilot_analyze(
        db=db,
        title=db_listing.title,
        description=db_listing.description or "",
        price=db_listing.price,
        category=db_listing.category,
        location=db_listing.location,
        condition=condition,
        image_count=image_count
    )
    
    if not db_score:
        db_score = ListingScore(listing_id=db_listing.id)
        db.add(db_score)
        
    db_score.listing_score = analysis["listing_score"]
    db_score.sale_probability = analysis["sale_probability"]
    db_score.competition_score = analysis["competition_score"]
    db_score.price_score = analysis["price_score"]
    db_score.description_score = analysis["description_score"]
    db_score.recommendations = json.dumps(analysis["recommendations"])
    
    db.commit()
    db.refresh(db_listing)
    try:
        if "price" in update_data:
            from backend.app.services.price_watch_service import PriceWatchService
            PriceWatchService.handle_price_change(db, db_listing.id, db_listing.price)
    except Exception as e:
        print(f"Error handling price change for price watch: {e}")
    return db_listing

def delete_listing(db: Session, listing_id: int):
    db_listing = get_listing(db, listing_id)
    if db_listing:
        db.delete(db_listing)
        db.commit()
    return db_listing

def verify_listing_ownership(db_listing: Listing, user_id: int):
    if db_listing.seller_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this listing"
        )
