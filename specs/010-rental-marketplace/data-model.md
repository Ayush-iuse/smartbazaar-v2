# Data Model: SmartBazaar Rental Marketplace

Detailed layout of database entities and validations for the rental marketplace system.

## Schema Declarations

### 1. `RentalListing` (Table: `rental_listings`)
- `id`: Integer (Primary Key)
- `listing_id`: Integer (Foreign Key -> `listings.id`, nullable=False, unique=True, cascade on delete)
- `rental_hourly_rate`: Float (nullable=True)
- `rental_daily_rate`: Float (nullable=True)
- `rental_weekly_rate`: Float (nullable=True)
- `rental_monthly_rate`: Float (nullable=True)
- `security_deposit`: Float (nullable=False, default=0.0)
- `delivery_fee`: Float (default=0.0)
- `cleaning_fee`: Float (default=0.0)
- `insurance_fee`: Float (default=0.0)
- `late_return_fee_rate`: Float (default=0.0, description="Multiplier penalty fee per hour/day")

### 2. `RentalBooking` (Table: `rental_bookings`)
- `id`: Integer (Primary Key)
- `listing_id`: Integer (Foreign Key -> `listings.id`, nullable=False)
- `buyer_id`: Integer (Foreign Key -> `users.id`, nullable=False)
- `start_date`: DateTime (nullable=False)
- `end_date`: DateTime (nullable=False)
- `status`: String (default="Pending", description="Pending | Confirmed | Active | Returned | Completed | Cancelled | Refunded")
- `total_cost`: Float (nullable=False)
- `instant_book`: Boolean (default=False)

### 3. `RentalCalendar` (Table: `rental_calendar`)
- `id`: Integer (Primary Key)
- `listing_id`: Integer (Foreign Key -> `listings.id`, nullable=False)
- `date`: Date (nullable=False)
- `status`: String (nullable=False, description="Available | Blocked | Maintenance | Booked")
- `seasonal_price_override`: Float (nullable=True)

### 4. `RentalContract` (Table: `rental_contracts`)
- `id`: Integer (Primary Key)
- `booking_id`: Integer (Foreign Key -> `rental_bookings.id`, nullable=False)
- `terms_text`: Text (nullable=False)
- `signature_status`: Boolean (default=False)
- `signed_at`: DateTime (nullable=True)

### 5. `RentalDeposit` (Table: `rental_deposits`)
- `id`: Integer (Primary Key)
- `booking_id`: Integer (Foreign Key -> `rental_bookings.id`, nullable=False)
- `amount_held`: Float (nullable=False)
- `deduction_amount`: Float (default=0.0)
- `status`: String (default="Held", description="Held | Released | Deducted | Partial_Refunded")

### 6. `RentalReturn` (Table: `rental_returns`)
- `id`: Integer (Primary Key)
- `booking_id`: Integer (Foreign Key -> `rental_bookings.id`, nullable=False)
- `inspector_id`: Integer (Foreign Key -> `users.id`, nullable=False)
- `status`: String (default="Returned", description="Returned | Inspecting | Approved | Dispute")
- `damage_cost`: Float (default=0.0)
- `inspection_notes`: Text (nullable=True)
