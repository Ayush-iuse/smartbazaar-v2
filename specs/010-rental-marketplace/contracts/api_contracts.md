# API Contracts: SmartBazaar Rental Marketplace

Web Service endpoints exposing the rental and booking mechanics.

## HTTP Endpoints Specification

### 1. `POST /api/v2/rentals`
- **Description**: Add rental capabilities to an existing or new listing.
- **Request Body**:
  ```json
  {
    "listing_id": 42,
    "rental_daily_rate": 1500.0,
    "security_deposit": 5000.0,
    "delivery_fee": 150.0,
    "cleaning_fee": 200.0,
    "insurance_fee": 100.0,
    "late_return_fee_rate": 2.0
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "listing_id": 42,
    "rental_daily_rate": 1500.0,
    "security_deposit": 5000.0,
    "status": "active"
  }
  ```

### 2. `POST /api/v2/bookings`
- **Description**: Initiate a rental booking reservation.
- **Request Body**:
  ```json
  {
    "listing_id": 42,
    "start_date": "2026-07-10T10:00:00Z",
    "end_date": "2026-07-15T10:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "id": 101,
    "listing_id": 42,
    "total_cost": 7500.0,
    "status": "Pending"
  }
  ```

### 3. `PATCH /api/v2/bookings/{booking_id}`
- **Description**: Approve, reject, or request a counter-offer on a rental booking.
- **Request Body**:
  ```json
  {
    "status": "Approved"
  }
  ```
- **Response**:
  ```json
  {
    "id": 101,
    "status": "Approved"
  }
  ```

### 4. `POST /api/v2/bookings/{booking_id}/deposit`
- **Description**: Post payment/hold for the security deposit.
- **Response**:
  ```json
  {
    "booking_id": 101,
    "amount_held": 5000.0,
    "status": "Held"
  }
  ```

### 5. `POST /api/v2/bookings/{booking_id}/return`
- **Description**: Submit inspections and complete returns.
- **Request Body**:
  ```json
  {
    "damage_cost": 1500.0,
    "inspection_notes": "Scratches on vehicle body bumper."
  }
  ```
- **Response**:
  ```json
  {
    "booking_id": 101,
    "refund_amount": 3500.0,
    "status": "Completed"
  }
  ```

### 6. `GET /api/v2/rentals/{listing_id}/calendar`
- **Description**: Retrieve booking availability calendars.
- **Response**:
  ```json
  [
    { "date": "2026-07-10", "status": "Booked" },
    { "date": "2026-07-11", "status": "Booked" },
    { "date": "2026-07-12", "status": "Maintenance" }
  ]
  ```
