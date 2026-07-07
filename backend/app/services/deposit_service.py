from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.models.rental import RentalDeposit, RentalBooking, RentalListing

class DepositService:
    @staticmethod
    def hold_deposit(db: Session, booking_id: int, amount: float) -> RentalDeposit:
        deposit = RentalDeposit(
            booking_id=booking_id,
            amount_held=amount,
            deduction_amount=0.0,
            status="Held"
        )
        db.add(deposit)
        db.commit()
        db.refresh(deposit)
        return deposit

    @staticmethod
    def release_deposit(db: Session, booking_id: int, deduction: float = 0.0) -> RentalDeposit:
        deposit = db.query(RentalDeposit).filter(RentalDeposit.booking_id == booking_id).first()
        if not deposit:
            # Fallback creation if not explicitly held previously
            deposit = RentalDeposit(booking_id=booking_id, amount_held=0.0, status="Released")
            db.add(deposit)
            db.commit()
            return deposit
        
        deposit.deduction_amount = deduction
        deposit.status = "Released"
        db.commit()
        db.refresh(deposit)
        return deposit

    @staticmethod
    def calculate_late_penalty(db: Session, booking_id: int, return_time: datetime) -> float:
        booking = db.query(RentalBooking).filter(RentalBooking.id == booking_id).first()
        if not booking or return_time <= booking.end_date:
            return 0.0
            
        rental = db.query(RentalListing).filter(RentalListing.listing_id == booking.listing_id).first()
        late_hours = (return_time - booking.end_date).total_seconds() / 3600.0
        
        rate = rental.late_return_fee_rate if rental and rental.late_return_fee_rate else 50.0
        return round(late_hours * rate, 2)
