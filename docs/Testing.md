# Testing Specifications: SmartBazaar V2

This document describes the testing hierarchy, test runners, execution procedures, and manual verification check-sheets for SmartBazaar.

---

## 1. Test Architecture

SmartBazaar features unit, integration, and WebSocket test suites.

- **Unit Tests (`backend/tests/unit/`)**: Assesses isolated modules (Spam Detection filters, User registration, Trust Rating computations).
- **Integration Tests (`backend/tests/integration/`)**: Evaluates database transactions, user negotiations/offers routing, and CRM logging triggers.
- **WebSocket Tests (`backend/tests/websocket/`)**: Assesses user presence synchronization, typing events, and message transmissions.

---

## 2. Running Automated Tests

Tests are executed inside a local virtual environment with an isolated, clean in-memory SQLite database setup:

1. **Activate local environment**:
   ```bash
   venv\Scripts\activate  # Windows PowerShell
   ```
2. **Execute Pytest Suite**:
   ```bash
   python -m pytest backend/tests/
   ```

To run a specific test suite or get detailed verbose output:
```bash
python -m pytest backend/tests/unit/test_trust_score.py -vv
```

---

## 3. Manual E2E Verification Workflow

Use this checklist to manually verify core buyer-seller features:

### A. Authentication Loop
1. Navigate to register page and sign up a new account.
2. Confirm redirect and login with the new credentials.
3. Access profile settings and verify token authorization.

### B. Negotiation / Offer Loop
1. As Seller: Login and create a listing with title/description/price.
2. As Buyer: Login and locate listing. Click "Message Seller" to start a chat.
3. As Buyer: Enter chat details and send a purchase offer.
4. As Seller: Check notifications, open chat, and accept/counter the offer.
