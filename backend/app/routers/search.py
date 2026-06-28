from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.schemas.listing import ListingResponse
from backend.app.services.search_service import search_listings

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=List[ListingResponse])
def execute_search(
    q: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return search_listings(db, query=q, category=category, location=location)
