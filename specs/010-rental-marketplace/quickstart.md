# Quickstart Validation Guide: SmartBazaar Rental Marketplace

Step-by-step verification flows to confirm end-to-end integration of listings, bookings, calendars, and deposits.

## Automated Verification Scenarios

### 1. Test Rental Listing Creation
Run POST request to backend routing services:
```bash
curl -X POST http://localhost:8000/api/v2/rentals \
  -H "Content-Type: application/json" \
  -d '{"listing_id": 1, "rental_daily_rate": 1500, "security_deposit": 5000}'
```
Expected output: HTTP 200 containing `"status": "active"`.

### 2. Test Availability Check conflicts
Submit overlapping dates to confirm transaction blocking:
```bash
curl -X POST http://localhost:8000/api/v2/bookings \
  -H "Content-Type: application/json" \
  -d '{"listing_id": 1, "start_date": "2026-07-10", "end_date": "2026-07-12"}'
```
Expected output: HTTP 400 error message listing scheduling date conflict.

## Manual Verification Flows
1. Login as seller and verify the category select options displays Vehicles, Construction Equipment, Property, and Fashion.
2. Fill listing parameters, toggle daily/weekly rate, set cleaning/late return penalty margins, and select active dates.
3. Login as buyer, locate listing via Search filters, select overlapping dates on product details calendar to verify warning blocks, and trigger booking request.
4. Verify deposit state is Held, sign digital contract terms, approve returns quality check, and confirm deposit holds releases.
