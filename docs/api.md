# API Reference Specification: SmartBazaar V2

This document specifies the REST API endpoints and WebSocket channels for the SmartBazaar AI marketplace platform.

---

## 1. Authentication Endpoints

### User Registration
- **Endpoint**: `POST /api/auth/register`
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "full_name": "Jane Doe"
  }
  ```
- **Responses**:
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Email already registered or invalid fields.

### User Login
- **Endpoint**: `POST /api/auth/login`
- **Format**: `application/x-www-form-urlencoded`
- **Parameters**: `username` (email), `password`
- **Responses**:
  - `200 OK`: Successful authentication.
    ```json
    {
      "access_token": "<JWT_STRING>",
      "token_type": "bearer"
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

---

## 2. Listings Endpoints

### Fetch Listings
- **Endpoint**: `GET /api/listings`
- **Parameters**: `skip` (default 0), `limit` (default 20)
- **Responses**:
  - `200 OK`: Array of active listings.

### Create Listing
- **Endpoint**: `POST /api/listings`
- **Auth Required**: Bearer token
- **Payload**:
  ```json
  {
    "title": "Gaming Laptop Pro",
    "description": "Premium gaming laptop with RTX 4080.",
    "price": 85000.00,
    "category": "Electronics",
    "location": "Mumbai",
    "image_urls": []
  }
  ```
- **Responses**:
  - `201 Created`: Listing initialized.

---

## 3. Trust & Verification Endpoints

### Retrieve Seller Trust Score
- **Endpoint**: `GET /api/auth/seller/trust-score/{seller_id}`
- **Responses**:
  - `200 OK`: Precalculated score details.
    ```json
    {
      "trust_score": 95,
      "response_rate": 98.5,
      "quality_score": 92,
      "fraud_score": 0,
      "level": "Trusted Seller"
    }
    ```

### Request Verification
- **Endpoint**: `POST /api/trust/verify/request`
- **Auth Required**: Bearer token
- **Format**: `multipart/form-data`
- **Parameters**: `document_type`, `file` (binary upload)
- **Responses**:
  - `202 Accepted`: Verification request filed.

---

## 4. Real-time Messaging & WebSockets

- **Connection URL**: `ws://localhost:8000/api/chat/ws/{user_id}`
- **Protocols Supported**:
  - Text-based JSON frame synchronization.
  - Heartbeat status presence reporting.
- **Message Payloads**:
  - **Typing Indicator**:
    ```json
    {
      "type": "typing",
      "sender_id": 1,
      "receiver_id": 2,
      "is_typing": true
    }
    ```
  - **Text Message**:
    ```json
    {
      "type": "message",
      "sender_id": 1,
      "receiver_id": 2,
      "content": "Hi, is this item still available?"
    }
    ```
