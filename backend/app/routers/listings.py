from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse, ListingScoreResponse
from backend.app.services.auth_service import get_current_user, get_current_user_optional
from backend.app.services import listing_service
from backend.app.services.recommendation_service import RecommendationService
from backend.app.services.recently_viewed_service import RecentlyViewedService
from backend.app.models.user import User
from backend.app.models.listing_score import ListingScore

router = APIRouter(prefix="/listings", tags=["Listings"])
recommendations_router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_new_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return listing_service.create_listing(db, listing_in, current_user.id)

@router.get("/my", response_model=List[ListingResponse])
def read_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from backend.app.models.listing import Listing
    return db.query(Listing).filter(Listing.seller_id == current_user.id).order_by(Listing.created_at.desc()).all()

@router.get("", response_model=List[ListingResponse])
def read_listings(
    page: int = 1,
    size: int = 20,
    allow_sale: Optional[bool] = None,
    allow_rental: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    from typing import Optional
    if page < 1:
        page = 1
    if size < 1:
        size = 20
    elif size > 100:
        size = 100
    skip = (page - 1) * size
    return listing_service.get_listings(db, skip=skip, limit=size, allow_sale=allow_sale, allow_rental=allow_rental)

@router.get("/{id}", response_model=ListingResponse)
def read_listing_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User or None = Depends(get_current_user_optional)
):
    db_listing = listing_service.get_listing(db, id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Log listing view and user recently viewed tracking
    try:
        user_id = current_user.id if current_user else None
        RecentlyViewedService.record_listing_view(db, id, user_id)
    except Exception as e:
        print(f"Failed to record listing view logs: {e}")
        
    return db_listing

@router.put("/{id}", response_model=ListingResponse)
def update_existing_listing(
    id: int,
    listing_in: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_listing = listing_service.get_listing(db, id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    listing_service.verify_listing_ownership(db_listing, current_user.id)
    return listing_service.update_listing(db, db_listing, listing_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_listing(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_listing = listing_service.get_listing(db, id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    listing_service.verify_listing_ownership(db_listing, current_user.id)
    listing_service.delete_listing(db, id)
    return None

@router.get("/{id}/score", response_model=ListingScoreResponse)
def read_listing_score(id: int, db: Session = Depends(get_db)):
    db_score = db.query(ListingScore).filter(ListingScore.listing_id == id).first()
    if not db_score:
        raise HTTPException(status_code=404, detail="Score not found for this listing")
    return db_score

@recommendations_router.get("/trending", response_model=List[ListingResponse])
def read_trending_listings(db: Session = Depends(get_db)):
    return RecommendationService.get_trending_listings(db)

@recommendations_router.get("/personal", response_model=List[ListingResponse])
def read_personal_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return RecommendationService.get_personalized_recommendations(db, current_user.id)

@recommendations_router.get("/{listing_id}", response_model=List[ListingResponse])
def read_similar_listings(listing_id: int, db: Session = Depends(get_db)):
    return RecommendationService.get_similar_listings(db, listing_id)
