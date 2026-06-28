# API Contracts: V2 CRM, Trust Engine & Verification Platform

This document describes the request/response payloads, authentication, and HTTP status codes for the CRM, Trust, Verification, Analytics, and Risk APIs.

All endpoints require a valid JWT token passed in the `Authorization: Bearer <token>` header.

---

## 1. CRM Endpoints

### 1.1 `GET /api/v2/crm/dashboard`
Fetch the overall metrics and summary data for the seller's dashboard.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "total_buyers": 12,
    "active_buyers": 5,
    "unread_buyers": 2,
    "offers_pending": 3,
    "offers_accepted": 8,
    "offers_rejected": 4,
    "conversion_rate": 0.45,
    "average_response_time_seconds": 1250,
    "revenue_potential": 85000.0
  }
  ```

---

### 1.2 `GET /api/v2/crm/leads`
Retrieve the seller's active buyer leads mapped to listings.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Query Params:
    - `stage` (optional, filter by pipeline stage)
    - `listing_id` (optional, filter by specific listing)
- **Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "listing_id": 4,
      "listing_title": "Test iPhone 13 Pro",
      "buyer_id": 2,
      "buyer_name": "John Doe",
      "stage": "Negotiating",
      "lead_score": 75,
      "lead_category": "Hot",
      "unread_count": 0,
      "last_activity_at": "2026-06-24T12:00:00Z"
    }
  ]
  ```

---

### 1.3 `PATCH /api/v2/crm/status`
Manually update a lead's pipeline stage.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "listing_id": 4,
      "buyer_id": 2,
      "stage": "Offer Sent"
    }
    ```
- **Response** (200 OK):
  ```json
  {
    "status": "success",
    "listing_id": 4,
    "buyer_id": 2,
    "stage": "Offer Sent",
    "updated_at": "2026-06-24T13:00:00Z"
  }
  ```

---

### 1.4 `POST /api/v2/crm/notes`
Add a private note for a buyer.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "buyer_id": 2,
      "content": "Requested a 10% discount, budget seems constrained."
    }
    ```
- **Response** (201 Created):
  ```json
  {
    "id": 45,
    "buyer_id": 2,
    "seller_id": 1,
    "content": "Requested a 10% discount, budget seems constrained.",
    "created_at": "2026-06-24T13:05:00Z"
  }
  ```

---

### 1.5 `POST /api/v2/crm/labels`
Add or update seller-defined labels for a buyer.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "buyer_id": 2,
      "labels": ["VIP", "High Intent"]
    }
    ```
- **Response** (200 OK):
  ```json
  {
    "buyer_id": 2,
    "labels": ["VIP", "High Intent"]
  }
  ```

---

## 2. Trust Endpoints

### 2.1 `GET /api/v2/trust-score`
Fetch the active trust score for a user.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Query Params:
    - `user_id` (optional, if omitted fetches current user's score)
- **Response** (200 OK):
  ```json
  {
    "user_id": 2,
    "trust_score": 88,
    "trust_level": "Trusted Buyer",
    "completed_deals": 5,
    "cancelled_deals": 0,
    "response_rate": 0.95
  }
  ```

---

### 2.2 `GET /api/v2/trust-history`
Fetch the trust score change history logs.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Query Params:
    - `user_id` (optional)
- **Response** (200 OK):
  ```json
  [
    {
      "id": 101,
      "user_id": 2,
      "previous_score": 75,
      "new_score": 88,
      "event_type": "Deal Completed",
      "description": "Completed transaction with Seller #1",
      "created_at": "2026-06-24T10:00:00Z"
    }
  ]
  ```

---

## 3. Verification Endpoints

### 3.1 `POST /api/v2/verification/request`
Initiate verification for email or phone.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "type": "email" // or "phone"
    }
    ```
- **Response** (200 OK):
  ```json
  {
    "status": "otp_sent",
    "message": "OTP code has been generated."
  }
  ```

---

### 3.2 `POST /api/v2/verification/document`
Upload document verification image or pdf.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Content-Type: `multipart/form-data`
  - Form Fields:
    - `document_type` ("Passport", "Driving License", "National ID")
    - `file` (Binary file content, max 5MB)
- **Response** (201 Created):
  ```json
  {
    "status": "Pending Review",
    "document_id": 12,
    "uploaded_at": "2026-06-24T13:10:00Z"
  }
  ```

---

## 4. Analytics Endpoints

### 4.1 `GET /api/v2/analytics/crm`
Get metrics of lead lifecycle pipelines.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "stages_breakdown": {
      "New": 2,
      "Interested": 3,
      "Engaged": 4,
      "Negotiating": 2,
      "Offer Sent": 1,
      "Offer Accepted": 1
    },
    "conversion_funnel_percentage": {
      "lead_to_negotiation": 0.65,
      "negotiation_to_deal": 0.40
    }
  }
  ```
