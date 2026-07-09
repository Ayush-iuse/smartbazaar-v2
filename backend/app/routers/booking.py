from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.database import get_db
from backend.app.models.rental import (
    RentalListing, RentalBooking, RentalCalendar,
    RentalContract, RentalDeposit, RentalReturn
)
from backend.app.models.listing import Listing
from backend.app.schemas.rental import (
    RentalBookingCreate, RentalBookingCounter, RentalBookingExtend, RentalBookingResponse,
    RentalContractCreate, RentalContractResponse,
    InspectionCreate, InspectionResponse,
    CalendarBlockRequest, SeasonalPricingRequest,
)
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings Management"])

# ── Booking CRUD ──────────────────────────────────────────────────────────────

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

# ── Calendar ──────────────────────────────────────────────────────────────────

@router.post("/calendar/block")
def block_calendar_dates(
    req: CalendarBlockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import timedelta
    start = datetime.strptime(req.start_date, "%Y-%m-%d").date()
    end = datetime.strptime(req.end_date, "%Y-%m-%d").date()

    current = start
    while current <= end:
        existing = db.query(RentalCalendar).filter(
            RentalCalendar.listing_id == req.listing_id,
            RentalCalendar.date == current
        ).first()
        if existing:
            existing.status = req.status
        else:
            db_cal = RentalCalendar(listing_id=req.listing_id, date=current, status=req.status)
            db.add(db_cal)
        current += timedelta(days=1)

    db.commit()
    return {"detail": "Calendar dates updated successfully"}

@router.post("/calendar/pricing")
def set_seasonal_pricing(
    req: SeasonalPricingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = datetime.strptime(req.date, "%Y-%m-%d").date()
    existing = db.query(RentalCalendar).filter(
        RentalCalendar.listing_id == req.listing_id,
        RentalCalendar.date == target_date
    ).first()
    if existing:
        existing.seasonal_price_override = req.price_override
    else:
        db_cal = RentalCalendar(
            listing_id=req.listing_id,
            date=target_date,
            status="Available",
            seasonal_price_override=req.price_override
        )
        db.add(db_cal)
    db.commit()
    return {"detail": "Seasonal price override saved"}

@router.get("/calendar/availability/{listing_id}")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    rows = db.query(RentalCalendar).filter(RentalCalendar.listing_id == listing_id).all()
    return [
        {
            "date": str(r.date),
            "status": r.status,
            "seasonal_price_override": r.seasonal_price_override
        }
        for r in rows
    ]

# ── Contracts ─────────────────────────────────────────────────────────────────

@router.post("/contracts", response_model=RentalContractResponse, status_code=status.HTTP_201_CREATED)
def create_rental_contract(
    req: RentalContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify booking exists and belongs to user
    booking = db.query(RentalBooking).filter(RentalBooking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create contract for this booking")

    # Check if contract already exists
    existing = db.query(RentalContract).filter(RentalContract.booking_id == req.booking_id).first()
    if existing:
        # Update and mark as signed
        existing.signature_status = True
        existing.signed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    db_contract = RentalContract(
        booking_id=req.booking_id,
        terms_text=req.terms_text,
        signature_status=True,
        signed_at=datetime.utcnow()
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.get("/contracts/{booking_id}", response_model=RentalContractResponse)
def get_contract_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(RentalContract).filter(RentalContract.booking_id == booking_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

# ── Lifecycle ─────────────────────────────────────────────────────────────────

@router.post("/pickup")
def complete_pickup(
    booking_id: int = Body(...),
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
    booking_id: int = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(RentalBooking).filter(RentalBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "Returned"
    db.commit()
    return {"status": "Returned", "detail": "Return registered successfully"}

@router.post("/inspection", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def submit_inspection(
    req: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_return = RentalReturn(
        booking_id=req.booking_id,
        inspector_id=current_user.id,
        status="Approved",
        damage_cost=req.damage_cost,
        inspection_notes=req.inspection_notes
    )
    db.add(db_return)

    # Update booking status
    booking = db.query(RentalBooking).filter(RentalBooking.id == req.booking_id).first()
    if booking:
        booking.status = "Completed"

    # Process deposit release
    from backend.app.services.deposit_service import DepositService
    DepositService.release_deposit(db, req.booking_id, deduction=req.damage_cost)

    db.commit()
    db.refresh(db_return)
    return db_return
