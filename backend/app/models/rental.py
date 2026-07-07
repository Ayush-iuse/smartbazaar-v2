from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class RentalListing(Base):
    __tablename__ = "rental_listings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    rental_hourly_rate = Column(Float, nullable=True)
    rental_daily_rate = Column(Float, nullable=True)
    rental_weekly_rate = Column(Float, nullable=True)
    rental_monthly_rate = Column(Float, nullable=True)
    security_deposit = Column(Float, nullable=False, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    cleaning_fee = Column(Float, default=0.0)
    insurance_fee = Column(Float, default=0.0)
    late_return_fee_rate = Column(Float, default=0.0)
    status = Column(String, default="Active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("Listing", backref="rental_details")

class RentalBooking(Base):
    __tablename__ = "rental_bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="Pending", nullable=False)  # Pending, Confirmed, Completed, Cancelled
    total_cost = Column(Float, nullable=False)
    instant_book = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RentalCalendar(Base):
    __tablename__ = "rental_calendar"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(String, nullable=False)  # Available, Blocked, Maintenance, Booked
    seasonal_price_override = Column(Float, nullable=True)

class RentalContract(Base):
    __tablename__ = "rental_contracts"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("rental_bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    terms_text = Column(Text, nullable=False)
    signature_status = Column(Boolean, default=False)
    signed_at = Column(DateTime, nullable=True)

class RentalDeposit(Base):
    __tablename__ = "rental_deposits"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("rental_bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    amount_held = Column(Float, nullable=False)
    deduction_amount = Column(Float, default=0.0)
    status = Column(String, default="Held", nullable=False)  # Held, Released, Deducted

class RentalReturn(Base):
    __tablename__ = "rental_returns"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("rental_bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    inspector_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="Returned", nullable=False)  # Returned, Inspecting, Approved, Dispute
    damage_cost = Column(Float, default=0.0)
    inspection_notes = Column(Text, nullable=True)
