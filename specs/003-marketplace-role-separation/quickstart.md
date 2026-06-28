# Validation Guide: Marketplace Role Separation & Real Buyer-Seller Ecosystem

This guide provides verification inputs, endpoints, and expected outcomes to test the Marketplace Role Separation functionality.

---

## 1. Local Environment Setup

### 1. Database Migrations & Seed Data
Initialize the database models and load the seeded conversations, offers, and saved listings:
```bash
# Set Python path to repository root
$env:PYTHONPATH="."

# Run seed script to recreate tables and load updated seed data
python backend/app/seed.py
```

### 2. Start Application Services
Launch backend:
```bash
cd backend
uvicorn app.main:app --reload
```
Launch frontend:
```bash
cd frontend
npm run dev
```

---

## 2. Test Verification Scenarios

### Scenario A: Prevent Self-Interactions (Backend Guardrails)
1. **Action**: Attempt to save one's own listing.
   - Endpoint: `POST /api/listings/{listing_id}/save`
   - Header: `Authorization: Bearer [JWT Token for Owner of listing_id]`
2. **Expected Outcome**:
   - HTTP Status `400 Bad Request`.
   - Error detail message containing `"Cannot save own listing"`.

3. **Action**: Attempt to send a message on one's own listing.
   - Endpoint: `POST /api/conversations`
   - Body: `{"listing_id": [listing_id owned by current user]}`
4. **Expected Outcome**:
   - HTTP Status `400 Bad Request`.
   - Error detail message containing `"Cannot chat on own listing"`.

---

### Scenario B: Create and Accept a Negotiation Offer
1. **Action**: Buyer User submits a price offer.
   - Endpoint: `POST /api/offers`
   - Header: `Authorization: Bearer [JWT Token for Buyer]`
   - Body:
     ```json
     {
       "listing_id": 1,
       "offer_amount": 40000.0
     }
     ```
2. **Expected Outcome**:
   - HTTP Status `201 Created`.
   - Response contains offer ID, status `Pending`, and correct listing, buyer, and seller IDs.

3. **Action**: Seller User accepts the offer.
   - Endpoint: `POST /api/offers/{offer_id}/accept`
   - Header: `Authorization: Bearer [JWT Token for Seller]`
4. **Expected Outcome**:
   - HTTP Status `200 OK`.
   - Response status `Accepted` and listing status updated to `Sold`.
   - Other pending offers on listing 1 automatically transition to `Expired`.

---

### Scenario C: Unified Dashboard Workspaces
1. **Action**: Access the Buyer Dashboard.
   - Endpoint: `GET /api/dashboard/buyer`
   - Header: `Authorization: Bearer [JWT Token for User]`
2. **Expected Outcome**:
   - HTTP Status `200 OK`.
   - Response lists the user's saved items, sent offers (with active status labels), and message threads.

3. **Action**: Access the Seller Dashboard.
   - Endpoint: `GET /api/dashboard/seller`
   - Header: `Authorization: Bearer [JWT Token for User]`
4. **Expected Outcome**:
   - HTTP Status `200 OK`.
   - Response lists the user's published listings (with views and saves metrics) and received offers.
