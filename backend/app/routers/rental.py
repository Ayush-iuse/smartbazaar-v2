from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.rental import RentalListing, RentalBooking, RentalCalendar
from backend.app.models.listing import Listing
from backend.app.schemas.rental import (
    RentalListingCreate, RentalListingUpdate, RentalListingResponse,
    RentalBookingCreate, RentalBookingCounter, RentalBookingExtend, RentalBookingResponse
)
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/rentals", tags=["Rentals Management"])

@router.post("", response_model=RentalListingResponse, status_code=status.HTTP_201_CREATED)
def create_rental_settings(
    req: RentalListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify primary listing exists
    listing = db.query(Listing).filter(Listing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Primary listing not found")

    # Verify user owns listing
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this listing")

    # Check if rental settings already exist
    existing = db.query(RentalListing).filter(RentalListing.listing_id == req.listing_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Rental settings already exist for this listing")

    db_rental = RentalListing(**req.model_dump())
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental

@router.get("", response_model=List[RentalListingResponse])
def list_rental_listings(db: Session = Depends(get_db)):
    return db.query(RentalListing).all()

@router.get("/{id}", response_model=RentalListingResponse)
def get_rental_settings(id: int, db: Session = Depends(get_db)):
    rental = db.query(RentalListing).filter(RentalListing.id == id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental settings not found")
    return rental

@router.patch("/{id}", response_model=RentalListingResponse)
def update_rental_settings(
    id: int,
    req: RentalListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rental = db.query(RentalListing).filter(RentalListing.id == id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental settings not found")

    # Verify ownership
    listing = db.query(Listing).filter(Listing.id == rental.listing_id).first()
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this listing")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rental, key, value)

    db.commit()
    db.refresh(rental)
    return rental

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rental_settings(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rental = db.query(RentalListing).filter(RentalListing.id == id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental settings not found")

    # Verify ownership
    listing = db.query(Listing).filter(Listing.id == rental.listing_id).first()
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this listing")

    db.delete(rental)
    db.commit()
    return None
