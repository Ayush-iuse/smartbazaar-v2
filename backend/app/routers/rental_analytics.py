from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta
from backend.app.database import get_db
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User
from backend.app.models.rental import RentalBooking, RentalListing, RentalDeposit
from backend.app.models.listing import Listing

router = APIRouter(prefix="/rental-analytics", tags=["Rental Business Intelligence"])

@router.get("/revenue")
def get_revenue_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get listings owned by current user
    user_listing_ids = [r[0] for r in db.query(Listing.id).filter(Listing.seller_id == current_user.id).all()]
    
    if not user_listing_ids:
        return {
            "today_revenue": 0.0,
            "monthly_revenue": 0.0,
            "yearly_revenue": 0.0,
            "pending_deposits": 0.0,
            "late_fees": 0.0,
            "refund_queue": 0.0
        }

    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)
    year_start = datetime(now.year, 1, 1)

    today_rev = db.query(func.sum(RentalBooking.total_cost)).filter(
        RentalBooking.listing_id.in_(user_listing_ids),
        RentalBooking.status != "Cancelled",
        RentalBooking.created_at >= today_start
    ).scalar() or 0.0

    month_rev = db.query(func.sum(RentalBooking.total_cost)).filter(
        RentalBooking.listing_id.in_(user_listing_ids),
        RentalBooking.status != "Cancelled",
        RentalBooking.created_at >= month_start
    ).scalar() or 0.0

    year_rev = db.query(func.sum(RentalBooking.total_cost)).filter(
        RentalBooking.listing_id.in_(user_listing_ids),
        RentalBooking.status != "Cancelled",
        RentalBooking.created_at >= year_start
    ).scalar() or 0.0

    pending_dep = db.query(func.sum(RentalDeposit.amount_held)).join(
        RentalBooking, RentalDeposit.booking_id == RentalBooking.id
    ).filter(
        RentalBooking.listing_id.in_(user_listing_ids),
        RentalDeposit.status == "Held"
    ).scalar() or 0.0

    return {
        "today_revenue": float(today_rev),
        "monthly_revenue": float(month_rev),
        "yearly_revenue": float(year_rev),
        "pending_deposits": float(pending_dep),
        "late_fees": 0.0,
        "refund_queue": 0.0
    }

@router.get("/occupancy")
def get_occupancy_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_listing_ids = [r[0] for r in db.query(Listing.id).filter(Listing.seller_id == current_user.id).all()]
    if not user_listing_ids:
        return {
            "occupancy_rate": 0.0,
            "booked_days": 0,
            "maintenance_days": 0,
            "idle_days": 30,
            "expected_occupancy": 0.0
        }

    # Sum up all booked days in last 30 days
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    bookings = db.query(RentalBooking).filter(
        RentalBooking.listing_id.in_(user_listing_ids),
        RentalBooking.status.in_(["Confirmed", "Active", "Completed"]),
        RentalBooking.end_date >= thirty_days_ago
    ).all()

    total_booked_days = 0
    for b in bookings:
        start = max(b.start_date, thirty_days_ago)
        end = min(b.end_date, now)
        delta = (end - start).days
        if delta > 0:
            total_booked_days += delta

    total_capacity_days = 30 * len(user_listing_ids)
    occupancy_rate = (total_booked_days / total_capacity_days * 100) if total_capacity_days > 0 else 0.0

    return {
        "occupancy_rate": round(occupancy_rate, 1),
        "booked_days": total_booked_days,
        "maintenance_days": 0,
        "idle_days": max(0, total_capacity_days - total_booked_days),
        "expected_occupancy": 80.0
    }

@router.get("/assets")
def get_asset_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Find active rental listings owned by the user
    listings = db.query(Listing).join(RentalListing, Listing.id == RentalListing.listing_id).filter(
        Listing.seller_id == current_user.id
    ).all()

    assets = []
    for listing in listings:
        # Lifetime earnings
        earnings = db.query(func.sum(RentalBooking.total_cost)).filter(
            RentalBooking.listing_id == listing.id,
            RentalBooking.status != "Cancelled"
        ).scalar() or 0.0
        
        assets.append({
            "asset_id": listing.id,
            "title": listing.title,
            "condition": "Good",
            "lifetime_earnings": float(earnings),
            "maintenance_frequency": "Every 30 days"
        })
    return assets

@router.get("/fleet")
def get_fleet_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return user's fleet based on rental listings
    listings = db.query(Listing).join(RentalListing, Listing.id == RentalListing.listing_id).filter(
        Listing.seller_id == current_user.id
    ).all()

    fleet = []
    for l in listings:
        # Determine status based on active booking
        active_booking = db.query(RentalBooking).filter(
            RentalBooking.listing_id == l.id,
            RentalBooking.status == "Active"
        ).first()
        status = "Rented" if active_booking else "Available"
        
        fleet.append({
            "id": l.id,
            "serial_number": f"SN-FLT-{l.id:05d}",
            "status": status,
            "warehouse": "Main Hub",
            "assigned_employee": "Rahul Sharma" if status == "Available" else "Renter Active"
        })
    return fleet

@router.patch("/fleet/{id}")
def update_fleet_status(
    id: int,
    updates: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    listing = db.query(Listing).filter(Listing.id == id, Listing.seller_id == current_user.id).first()
    if not listing:
        raise HTTPException(status_code=403, detail="Not authorized to update this fleet asset")
    return {"id": id, "updated": True, "details": updates}
