# Validation Guide: Marketplace Intelligence Services

This guide provides the quickstart run scripts, verification inputs, and expected outcomes to test the Marketplace Intelligence platform.

---

## 1. Local Environment Setup

### 1. Database Migrations & Seed Data
Initialize the database models and load analytics metadata snapshot data:
```bash
# Set Python path
$env:PYTHONPATH="."

# Run seed scripts to populate users, listings, and category average prices
python backend/app/utils/seed_analytics.py
```

### 2. Verify FastAPI swagger UI
Launch the backend application:
```bash
cd backend
uvicorn app.main:app --reload
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser and confirm that the new routers are available:
- `/api/ai/copilot`
- `/api/ai/buyer-agent`
- `/api/ai/search-agent`
- `/api/analytics/overview`

---

## 2. Test Verification Scenarios

### Scenario A: Verify Seller Copilot
1. **Action**: Submit details for a listing with an inflated price.
   - Endpoint: `POST /api/ai/copilot`
   - Payload:
     ```json
     {
       "title": "Old Chair",
       "description": "Just a basic wooden chair.",
       "price": 99999.0,
       "category": "Furniture",
       "condition": "used"
     }
     ```
2. **Expected Outcome**:
   - `listing_score` <= 50.
   - `sale_probability` <= 10.
   - `competition_score` >= 80.
   - `improvements` list contains suggestion: `"Adjust pricing closer to category average of ₹1500"`.

### Scenario B: Verify Buyer Agent
1. **Action**: Trigger buy evaluation on a safe, reasonably priced listing.
   - Endpoint: `POST /api/ai/buyer-agent`
   - Payload:
     ```json
     {
       "listing_id": 1
     }
     ```
2. **Expected Outcome**:
   - `recommendation` equals `"BUY"` or `"NEGOTIATE"`.
   - `risk_level` equals `"Low"`.
   - `confidence` >= 70.
