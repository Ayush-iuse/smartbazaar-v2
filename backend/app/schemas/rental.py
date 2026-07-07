from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RentalListingBase(BaseModel):
    rental_hourly_rate: Optional[float] = None
    rental_daily_rate: Optional[float] = None
    rental_weekly_rate: Optional[float] = None
    rental_monthly_rate: Optional[float] = None
    security_deposit: float = Field(default=0.0, ge=0)
    delivery_fee: float = Field(default=0.0, ge=0)
    cleaning_fee: float = Field(default=0.0, ge=0)
    insurance_fee: float = Field(default=0.0, ge=0)
    late_return_fee_rate: float = Field(default=0.0, ge=0)

class RentalListingCreate(RentalListingBase):
    listing_id: int

class RentalListingUpdate(BaseModel):
    rental_hourly_rate: Optional[float] = None
    rental_daily_rate: Optional[float] = None
    rental_weekly_rate: Optional[float] = None
    rental_monthly_rate: Optional[float] = None
    security_deposit: Optional[float] = None
    delivery_fee: Optional[float] = None
    cleaning_fee: Optional[float] = None
    insurance_fee: Optional[float] = None
    late_return_fee_rate: Optional[float] = None

class RentalListingResponse(RentalListingBase):
    id: int
    listing_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RentalBookingCreate(BaseModel):
    listing_id: int
    start_date: datetime
    end_date: datetime

class RentalBookingCounter(BaseModel):
    counter_daily_rate: Optional[float] = None
    counter_start_date: Optional[datetime] = None
    counter_end_date: Optional[datetime] = None

class RentalBookingExtend(BaseModel):
    new_end_date: datetime

class RentalBookingResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    start_date: datetime
    end_date: datetime
    status: str
    total_cost: float
    instant_book: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RentalFeeBreakdown(BaseModel):
    rental_cost: float
    security_deposit: float
    cleaning_fee: float
    delivery_fee: float
    insurance_fee: float
    tax: float
    grand_total: float


