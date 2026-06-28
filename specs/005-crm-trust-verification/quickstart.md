# Quickstart Validation Guide: V2 CRM, Trust Engine & Verification Platform

This document describes how to execute automated verification scenarios and manually check the V2 CRM, Trust Engine, and Verification Platform features.

---

## 1. Prerequisites and Setup

Ensure that the Python backend and React Next.js frontend are running.

### 1.1 Local Database Initialization
Run the database migrations and seed default values:
```bash
cd backend
python -m alembic upgrade head
python -m app.seed
```

### 1.2 Start Services Locally
Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Frontend:
```bash
cd frontend
npm run dev
```

---

## 2. Automated Test Verification

A series of pytest unit and integration test suites are written to test CRM metrics, lead logic, trust score calculations, and document review queues.

To run the backend tests:
```bash
cd backend
$env:PYTHONPATH="E:\PPT\jio internship\cart"
python -m pytest tests/
```

---

## 3. Manual E2E Validation Flow

### 3.1 Scenario A: Lead Score Calculation & Status Transition
1. Log in with a buyer account. View any active listing and tap "Heart" to add to wishlist.
2. Send 3 chat messages to the seller.
3. Log in with the seller account, navigate to `/crm` or `/crm/leads`.
4. **Validation Check**:
   - Verify that the buyer is listed under the "Interested" pipeline column.
   - Verify that their Lead Score is recalculating in real-time (and reflects points from wishlist save + 3 messages).
   - Change their stage to "Negotiating". Verify status updates immediately.

### 3.2 Scenario B: Fraud Risk Flagging & Score Penalty
1. Log in with a buyer account.
2. Send a spam message containing `"Western Union wire transfer"` or `"WhatsApp: +919999999999"`.
3. Check the user's risk score by calling `GET /api/v2/risk-score`.
4. **Validation Check**:
   - Verify that their risk level has updated to `"Suspicious"` or `"High"`.
   - Verify that their Buyer Trust Score has been degraded from the default 50 points.
   - Verify that an alert is recorded in the moderator log.

### 3.3 Scenario C: Government ID Document Review Flow
1. Log in with a seller account. Navigate to `/verification`.
2. Tap "Government ID Verification", choose "Passport", and upload a verification document.
3. Log in with an admin account, open the review queue page.
4. **Validation Check**:
   - Verify the admin can retrieve the document binary.
   - Approve the verification request.
   - Check the seller's public profile page; confirm the `"Government ID Verified"` trust badge is displayed alongside the trust rating.
