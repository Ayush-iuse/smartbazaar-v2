# API Contract: REST Endpoints

This document specifies the contracts, headers, bodies, response schemas, and rate limits for the SmartBazaar V2 REST API.

All endpoints requiring authentication expect the `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.

---

## 1. Chat & Messaging Services

### `POST /api/v2/chat/conversations`
* **Description**: Create or retrieve a unique conversation thread for a listing.
* **Auth Required**: Yes (Buyer role only)
* **Request Body**:
  ```json
  {
    "listing_id": 105
  }
  ```
* **Success Response (200 OK or 201 Created)**:
  ```json
  {
    "conversation_id": 2045,
    "listing_id": 105,
    "buyer_id": 12,
    "seller_id": 34,
    "is_archived": false,
    "is_pinned": false,
    "created_at": "2026-06-23T16:31:00Z"
  }
  ```
* **Error Responses**:
  * `400 Bad Request`: `{"detail": "Self-chats are blocked. You cannot initiate a conversation on your own listing."}`
  * `404 Not Found`: `{"detail": "Listing not found."}`

### `GET /api/v2/chat/conversations`
* **Description**: List all active conversations for the authenticated user (Buyer or Seller).
* **Auth Required**: Yes
* **Query Parameters**:
  * `archived` (Boolean, Optional): Filter by archived chats.
  * `pinned` (Boolean, Optional): Filter by pinned chats.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "conversation_id": 2045,
      "listing": {
        "id": 105,
        "title": "Vintage Mechanical Watch",
        "price": 8500.0,
        "status": "Active"
      },
      "partner": {
        "id": 34,
        "name": "Sameer Sharma",
        "trust_level": "Trusted Seller"
      },
      "unread_count": 2,
      "last_message": {
        "content": "Is the price negotiable?",
        "sender_id": 12,
        "created_at": "2026-06-23T16:35:12Z"
      }
    }
  ]
  ```

### `POST /api/v2/chat/conversations/{id}/media`
* **Description**: Upload a chat attachment (image or voice note).
* **Auth Required**: Yes
* **Request Headers**: `Content-Type: multipart/form-data`
* **Multipart Fields**:
  * `file`: Binary file data (Limit $\le 5$ MB).
  * `message_type`: String (`"image"` or `"voice"`).
* **Success Response (201 Created)**:
  ```json
  {
    "message_id": 9845,
    "conversation_id": 2045,
    "sender_id": 12,
    "message_type": "image",
    "media_url": "/uploads/chat/img_20260623_1640.png",
    "created_at": "2026-06-23T16:40:02Z"
  }
  ```

---

## 2. Seller CRM Workspace

### `GET /api/v2/crm/leads`
* **Description**: Fetch all buyer leads currently in the negotiation funnel.
* **Auth Required**: Yes (Seller role only)
* **Query Parameters**:
  * `status` (String, Optional): Filter by `lead`, `active`, `offer_made`, `converted`, `cold`.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "lead_id": 412,
      "buyer": {
        "id": 12,
        "name": "Divya Patel",
        "trust_score": 88
      },
      "listing": {
        "id": 105,
        "title": "Vintage Mechanical Watch"
      },
      "lead_status": "offer_made",
      "notes": "Interested in buying. Offered ₹8000.",
      "last_contacted_at": "2026-06-23T16:35:12Z"
    }
  ]
  ```

### `PUT /api/v2/crm/leads/{id}/stage`
* **Description**: Update the funnel category stage of a buyer lead.
* **Auth Required**: Yes (Seller role only)
* **Request Body**:
  ```json
  {
    "lead_status": "converted"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "lead_id": 412,
    "lead_status": "converted",
    "updated_at": "2026-06-23T16:45:00Z"
  }
  ```

---

## 3. Trust & Verification Network

### `GET /api/v2/trust/score/{user_id}`
* **Description**: Get the detailed trust score breakdown of a user.
* **Auth Required**: Yes
* **Success Response (200 OK)**:
  ```json
  {
    "user_id": 34,
    "trust_score": 92,
    "verification_level": "Elite Seller",
    "metrics": {
      "completed_deals": 14,
      "cancellation_rate_pct": 2.5,
      "response_rate_pct": 98.2,
      "spam_reports_count": 0,
      "email_verified": true,
      "phone_verified": true,
      "identity_verified": true
    }
  }
  ```

---

## 4. AI Copilot Drawer

### `POST /api/v2/copilot/query`
* **Description**: Post a natural language inquiry to the copilot interface.
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "query": "Find gaming laptops under ₹40000 in Mumbai from trusted sellers"
  }
  ```
* **Success Response (200 OK)**:
  *Complies with explainability guidelines (Principle 2)*
  ```json
  {
    "recommendation": [
      {
        "listing_id": 89,
        "title": "ASUS TUF Gaming Laptop",
        "price": 38000.0,
        "location": "Mumbai",
        "seller_id": 55,
        "seller_trust": "Trusted Seller"
      }
    ],
    "confidence": 95,
    "explanation": "I found 1 listing in Mumbai matching your price threshold. The seller has verified their identity with 92% positive deals completed.",
    "is_offline_fallback": false
  }
  ```

---

## 5. Security & Session API

### `POST /api/v2/auth/refresh`
* **Description**: Rotate refresh token and issue new token pair.
* **Auth Required**: No (Expects JSON payload with refresh token)
* **Request Body**:
  ```json
  {
    "refresh_token": "rt_hash_secret_string"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "access_token": "new_jwt_access_string",
    "refresh_token": "new_jwt_refresh_string",
    "token_type": "bearer",
    "expires_in": 900
  }
  ```
* **Error Response**:
  * `401 Unauthorized`: `{"detail": "Invalid or revoked refresh token. All active sessions terminated."}`

---

## 6. Rate Limiting Matrix

Standard REST rate limiting is executed via sliding window tokens in Redis.

| API Group | Rate Limit Rule | Throttling Action |
| :--- | :--- | :--- |
| **Auth (`/login`, `/register`)** | 5 attempts / 15 minutes / IP | Blocks IP, logs failure, requires 15-minute wait. |
| **Copilot (`/copilot/query`)**| 10 queries / 1 minute / User | Returns `429 Too Many Requests`. |
| **Media (`/chat/media`)** | 20 uploads / 1 hour / User | Returns `429 Too Many Requests`. |
| **Standard REST Endpoint** | 100 requests / 1 minute / User | Returns `429 Too Many Requests`. |

---

**Version**: 1.0.0 | **Ratified**: Pending | **Last Amended**: 2026-06-23
