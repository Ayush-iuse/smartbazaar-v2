from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.offer_service import OfferService
from backend.app.models.user import User

router = APIRouter(prefix="/offers", tags=["Offers"])

@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def place_offer(
    offer_in: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Place a price offer on a listing.
    Enforces self-offer prevention.
    """
    offer = OfferService.create_offer(
        db=db,
        listing_id=offer_in.listing_id,
        buyer_id=current_user.id,
        offer_amount=offer_in.offer_amount
    )
    
    # Fetch details to map back_populates attributes
    user_offs = OfferService.get_user_offers(db, current_user.id)
    for o in user_offs:
        if o["id"] == offer.id:
            return o
            
    return offer

@router.get("", response_model=List[OfferResponse])
def get_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all sent or received offers for the logged-in user.
    """
    return OfferService.get_user_offers(db=db, user_id=current_user.id)

@router.get("/{id}", response_model=OfferResponse)
def get_offer_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get offer details by ID. Only participants allowed.
    """
    offer = OfferService.get_offer_by_id(db=db, offer_id=id, user_id=current_user.id)
    user_offs = OfferService.get_user_offers(db, current_user.id)
    for o in user_offs:
        if o["id"] == offer.id:
            return o
    return offer

@router.patch("/{id}", response_model=OfferResponse)
def update_offer_status(
    id: int,
    offer_in: OfferUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update offer status (Accept/Reject as seller, Cancel/Expire as buyer).
    """
    offer = OfferService.update_offer_status(
        db=db,
        offer_id=id,
        user_id=current_user.id,
        new_status=offer_in.status
    )
    user_offs = OfferService.get_user_offers(db, current_user.id)
    for o in user_offs:
        if o["id"] == offer.id:
            return o
    return offer

@router.delete("/{id}")
def delete_offer(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete/withdraw an offer.
    """
    return OfferService.delete_offer(db=db, offer_id=id, user_id=current_user.id)
