# API Contract: Marketplace Role Separation Services

This document defines the REST endpoints, authentication rules, parameters, validation payloads, and status codes for the **SmartBazaar AI V3 - Marketplace Role Separation** feature.

---

## 1. Conversation and Messaging APIs

### 1. Initiate or Get Conversation
- **Endpoint**: `POST /api/conversations`
- **Authentication**: Yes (`Bearer JWT`)
- **Request Body**:
  ```json
  {
    "listing_id": 1
  }
  ```
- **Response Codes**:
  - `200 OK`: Conversation exists or is created successfully.
  - `400 Bad Request`: User attempts to start chat on own listing.
  - `404 Not Found`: Listing does not exist.
- **Response Body (200)**:
  ```json
  {
    "id": 15,
    "listing_id": 1,
    "buyer_id": 4,
    "seller_id": 2,
    "created_at": "2026-06-19T10:00:00Z"
  }
  ```

### 2. List Conversations
- **Endpoint**: `GET /api/conversations`
- **Authentication**: Yes (`Bearer JWT`)
- **Query Parameters**:
  - `role`: Optional string (`"buyer"` or `"seller"`). Filters threads where user is buyer or seller.
- **Response Body (200)**:
  ```json
  [
    {
      "id": 15,
      "listing_id": 1,
      "listing_title": "iPhone 13 Pro",
      "listing_image": "https://...",
      "other_party_name": "Sameer Sen",
      "last_message": "Is this still available?",
      "last_message_time": "2026-06-19T10:05:00Z",
      "role": "buyer"
    }
  ]
  ```

### 3. Get Messages in Conversation
- **Endpoint**: `GET /api/conversations/{conversation_id}/messages`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Codes**:
  - `200 OK`: Success.
  - `403 Forbidden`: User is not a participant in the conversation.
  - `404 Not Found`: Conversation does not exist.
- **Response Body (200)**:
  ```json
  [
    {
      "id": 101,
      "conversation_id": 15,
      "sender_id": 4,
      "sender_name": "Divya Sharma",
      "content": "Hello! Is this iPhone 13 Pro still available?",
      "created_at": "2026-06-19T10:00:00Z"
    }
  ]
  ```

### 4. Send Message in Conversation
- **Endpoint**: `POST /api/conversations/{conversation_id}/messages`
- **Authentication**: Yes (`Bearer JWT`)
- **Request Body**:
  ```json
  {
    "content": "Yes, I can meet in Connaught Place."
  }
  ```
- **Response Codes**:
  - `201 Created`: Message sent.
  - `403 Forbidden`: User is not a participant.
  - `400 Bad Request`: Empty content.
- **Response Body (201)**:
  ```json
  {
    "id": 102,
    "conversation_id": 15,
    "sender_id": 2,
    "content": "Yes, I can meet in Connaught Place.",
    "created_at": "2026-06-19T10:05:00Z"
  }
  ```

---

## 2. Offers Management APIs

### 1. Place a Price Offer
- **Endpoint**: `POST /api/offers`
- **Authentication**: Yes (`Bearer JWT`)
- **Request Body**:
  ```json
  {
    "listing_id": 1,
    "offer_amount": 40000.0
  }
  ```
- **Response Codes**:
  - `201 Created`: Offer submitted.
  - `400 Bad Request`: Self-offer, non-positive value, or listing already sold.
- **Response Body (201)**:
  ```json
  {
    "id": 5,
    "listing_id": 1,
    "buyer_id": 4,
    "seller_id": 2,
    "offer_amount": 40000.0,
    "status": "Pending",
    "created_at": "2026-06-19T10:10:00Z"
  }
  ```

### 2. Accept a Pending Offer
- **Endpoint**: `POST /api/offers/{offer_id}/accept`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Codes**:
  - `200 OK`: Offer accepted, listing marked "Sold".
  - `403 Forbidden`: User is not the seller of this listing.
  - `400 Bad Request`: Offer is not in pending status.
- **Response Body (200)**:
  ```json
  {
    "id": 5,
    "status": "Accepted",
    "listing_status": "Sold"
  }
  ```

### 3. Reject a Pending Offer
- **Endpoint**: `POST /api/offers/{offer_id}/reject`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Codes**:
  - `200 OK`: Offer rejected.
  - `403 Forbidden`: User is not the seller.
- **Response Body (200)**:
  ```json
  {
    "id": 5,
    "status": "Rejected"
  }
  ```

### 4. Cancel a Pending Offer
- **Endpoint**: `POST /api/offers/{offer_id}/cancel`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Codes**:
  - `200 OK`: Offer cancelled/expired.
  - `403 Forbidden`: User is not the buyer who placed the offer.
- **Response Body (200)**:
  ```json
  {
    "id": 5,
    "status": "Expired"
  }
  ```

---

## 3. Saved Listings APIs

### 1. Toggle Save Listing
- **Endpoint**: `POST /api/listings/{listing_id}/save`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Codes**:
  - `200 OK`: Listing saved (or unsaved if toggled, or returns save status).
  - `400 Bad Request`: Attempting to save own listing.
- **Response Body (200)**:
  ```json
  {
    "listing_id": 1,
    "saved": true
  }
  ```

### 2. Unsave Listing
- **Endpoint**: `POST /api/listings/{listing_id}/unsave`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Body (200)**:
  ```json
  {
    "listing_id": 1,
    "saved": false
  }
  ```

---

## 4. Dashboard APIs

### 1. Get Buyer Dashboard Data
- **Endpoint**: `GET /api/dashboard/buyer`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Body (200)**:
  ```json
  {
    "saved_listings": [
      {
        "id": 3,
        "title": "Solid Wood Dining Table",
        "price": 14500.0,
        "location": "Mumbai",
        "image_url": "https://..."
      }
    ],
    "offers_sent": [
      {
        "id": 5,
        "listing_title": "iPhone 13 Pro",
        "offer_amount": 40000.0,
        "status": "Pending",
        "created_at": "2026-06-19T10:10:00Z"
      }
    ],
    "conversations": [
      {
        "id": 15,
        "listing_title": "iPhone 13 Pro",
        "other_party_name": "Sameer Sen",
        "last_message": "Is this still available?"
      }
    ]
  }
  ```

### 2. Get Seller Dashboard Data
- **Endpoint**: `GET /api/dashboard/seller`
- **Authentication**: Yes (`Bearer JWT`)
- **Response Body (200)**:
  ```json
  {
    "my_listings": [
      {
        "id": 1,
        "title": "iPhone 13 Pro",
        "price": 42000.0,
        "status": "Active",
        "views_count": 48,
        "saves_count": 3
      }
    ],
    "offers_received": [
      {
        "id": 5,
        "buyer_name": "Divya Sharma",
        "listing_title": "iPhone 13 Pro",
        "offer_amount": 40000.0,
        "status": "Pending"
      }
    ],
    "conversations": [
      {
        "id": 15,
        "listing_title": "iPhone 13 Pro",
        "other_party_name": "Divya Sharma",
        "last_message": "Is this still available?"
      }
    ]
  }
  ```
