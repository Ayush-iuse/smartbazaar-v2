from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.app.database import get_db
from backend.app.models.rental import RentalListing, RentalBooking, RentalCalendar
from backend.app.models.listing import Listing
from backend.app.schemas.rental import (
    RentalBookingCreate, RentalBookingCounter, RentalBookingExtend, RentalBookingResponse
)
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings Management"])

@router.post("", response_model=RentalBookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    req: RentalBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify rental settings exist
    rental = db.query(RentalListing).filter(RentalListing.listing_id == req.listing_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental listing configurations not found")

    # Conflict check
    overlapping = db.query(RentalBooking).filter(
        RentalBooking.listing_id == req.listing_id,
        RentalBooking.status.in_(["Pending", "Confirmed"]),
        RentalBooking.start_date < req.end_date,
        RentalBooking.end_date > req.start_date
    ).first()
    if overlapping:
        raise HTTPException(status_code=400, detail="Overlapping booking exists for selected dates")

    # Calculate total duration daily rate
    days = (req.end_date - req.start_date).days
    if days <= 0:
        days = 1  # Minimum 1 day calculation
    
    daily_rate = rental.rental_daily_rate or 1000.0
    total_cost = (daily_rate * days) + rental.delivery_fee + rental.cleaning_fee + rental.insurance_fee

    db_booking = RentalBooking(
        listing_id=req.listing_id,
        buyer_id=current_user.id,
        start_date=req.start_date,
        end_date=req.end_date,
        status="Pending",
        total_cost=total_cost,
        instant_book=False
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("", response_model=List[RentalBookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(RentalBooking).join(Listing, RentalBooking.listing_id == Listing.id).filter(
        (RentalBooking.buyer_id == current_user.id) | (Listing.seller_id == current_user.id)
    ).order_by(RentalBooking.created_at.desc()).all()

@router.get("/{id}", response_model=RentalBookingResponse)
def get_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Verify ownership
    listing = db.query(Listing).filter(Listing.id == booking.listing_id).first()
    if booking.buyer_id != current_user.id and (not listing or listing.seller_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this booking details")
        
    return booking

@router.patch("/{id}/approve", response_model=RentalBookingResponse)
def approve_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify current user owns listing
    listing = db.query(Listing).filter(Listing.id == booking.listing_id).first()
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this booking")

    booking.status = "Confirmed"
    db.commit()
    db.refresh(booking)
    return booking

@router.patch("/{id}/reject", response_model=RentalBookingResponse)
def reject_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    listing = db.query(Listing).filter(Listing.id == booking.listing_id).first()
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reject this booking")

    booking.status = "Rejected"
    db.commit()
    db.refresh(booking)
    return booking

@router.patch("/{id}/counter", response_model=RentalBookingResponse)
def counter_booking(
    id: int,
    req: RentalBookingCounter,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    listing = db.query(Listing).filter(Listing.id == booking.listing_id).first()
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to counter this booking")

    if req.counter_start_date:
        booking.start_date = req.counter_start_date
    if req.counter_end_date:
        booking.end_date = req.counter_end_date
    
    booking.status = "Countered"
    db.commit()
    db.refresh(booking)
    return booking

@router.patch("/{id}/cancel", response_model=RentalBookingResponse)
def cancel_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    booking.status = "Cancelled"
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/calendar/block")
def block_calendar_dates(
    listing_id: int,
    start_date: str,
    end_date: str,
    status: str = "Blocked",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime, timedelta
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    current = start
    while current <= end:
        # Check if exists
        existing = db.query(RentalCalendar).filter(
            RentalCalendar.listing_id == listing_id,
            RentalCalendar.date == current
        ).first()
        if existing:
            existing.status = status
        else:
            db_cal = RentalCalendar(listing_id=listing_id, date=current, status=status)
            db.add(db_cal)
        current += timedelta(days=1)
    
    db.commit()
    return {"detail": "Calendar dates updated successfully"}

@router.post("/calendar/pricing")
def set_seasonal_pricing(
    listing_id: int,
    date: str,
    price_override: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    target_date = datetime.strptime(date, "%Y-%m-%d").date()
    existing = db.query(RentalCalendar).filter(
        RentalCalendar.listing_id == listing_id,
        RentalCalendar.date == target_date
    ).first()
    if existing:
        existing.seasonal_price_override = price_override
    else:
        db_cal = RentalCalendar(listing_id=listing_id, date=target_date, status="Available", seasonal_price_override=price_override)
        db.add(db_cal)
    db.commit()
    return {"detail": "Seasonal price override saved"}

@router.get("/calendar/availability/{listing_id}")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    return db.query(RentalCalendar).filter(RentalCalendar.listing_id == listing_id).all()

@router.post("/contracts")
def create_rental_contract(
    booking_id: int,
    terms_text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from backend.app.models.rental import RentalContract
    db_contract = RentalContract(
        booking_id=booking_id,
        terms_text=terms_text,
        signature_status=False
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.post("/pickup")
def complete_pickup(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "Active"
    db.commit()
    return {"status": "Active", "detail": "Pickup completed, rental is now active"}

@router.post("/return")
def schedule_return(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "Returned"
    db.commit()
    return {"status": "Returned", "detail": "Return registered successfully"}

@router.post("/inspection")
def submit_inspection(
    booking_id: int,
    damage_cost: float,
    inspection_notes: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from backend.app.models.rental import RentalReturn
    db_return = RentalReturn(
        booking_id=booking_id,
        inspector_id=current_user.id,
        status="Approved",
        damage_cost=damage_cost,
        inspection_notes=inspection_notes
    )
    db.add(db_return)
    
    # Update booking status
    booking = db.query(RentalBooking).filter(RentalBooking.id == booking_id).first()
    if booking:
        booking.status = "Completed"
    
    # Process settlement release
    from backend.app.services.deposit_service import DepositService
    DepositService.release_deposit(db, booking_id, deduction=damage_cost)
    
    db.commit()
    return {"status": "Completed", "detail": "Inspection report registered and deposit released"}


