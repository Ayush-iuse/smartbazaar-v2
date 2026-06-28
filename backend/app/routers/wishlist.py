from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.schemas.saved_listing import SavedListingCreate, SavedListingResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.wishlist_service import WishlistService
from backend.app.models.user import User

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    wish_in: SavedListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a listing to the user's wishlist (Save).
    Enforces self-save prevention.
    """
    res = WishlistService.toggle_wishlist(db=db, listing_id=wish_in.listing_id, user_id=current_user.id)
    if not res["saved"]:
        # If it was already saved, it was toggled off (unsaved), but since this is POST wishlist,
        # we can toggle it back or return status. Let's ensure it is saved.
        # Wait, toggle_wishlist deletes if exists. Let's toggle it back so it's guaranteed saved!
        res = WishlistService.toggle_wishlist(db=db, listing_id=wish_in.listing_id, user_id=current_user.id)
    return res

@router.delete("")
def remove_from_wishlist(
    listing_id: Optional[int] = Query(None),
    wish_in: Optional[SavedListingCreate] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a listing from the user's wishlist.
    Can be called with query param ?listing_id=N or request body.
    """
    target_listing_id = None
    if listing_id is not None:
        target_listing_id = listing_id
    elif wish_in is not None:
        target_listing_id = wish_in.listing_id
        
    if target_listing_id is None:
        raise HTTPException(status_code=400, detail="listing_id is required")
        
    # Toggle it off if it is currently saved
    res = WishlistService.toggle_wishlist(db=db, listing_id=target_listing_id, user_id=current_user.id)
    if res["saved"]:
        # If it wasn't saved, toggle_wishlist created it. We want it deleted, so toggle it again!
        res = WishlistService.toggle_wishlist(db=db, listing_id=target_listing_id, user_id=current_user.id)
        
    return {"listing_id": target_listing_id, "saved": False}

@router.get("", response_model=List[SavedListingResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the logged-in user's wishlist items.
    """
    return WishlistService.get_wishlist(db=db, user_id=current_user.id)
