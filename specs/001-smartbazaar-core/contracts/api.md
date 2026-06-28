# API Contracts: SmartBazaar AI Core

This document outlines the API endpoints, input payloads, status codes, and JSON response formats.

## Authentication APIs

### 1. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Auth Required**: No
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "full_name": "John Doe"
  }
  ```
- **Response Codes**:
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Validation failure (email format, password strength, email already exists).
- **Response Body (201)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2026-06-15T12:00:00Z"
  }
  ```

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Auth Required**: No
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response Codes**:
  - `200 OK`: Successful authentication, token returned.
  - `401 Unauthorized`: Invalid email or password.
- **Response Body (200)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer"
  }
  ```

### 3. Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Auth Required**: Yes
- **Request Headers**: `Authorization: Bearer <token>`
- **Response Codes**:
  - `200 OK`: Profile details returned.
  - `401 Unauthorized`: Missing or invalid token.
- **Response Body (200)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2026-06-15T12:00:00Z"
  }
  ```

---

## Listings APIs

### 1. Create a Listing
- **Endpoint**: `POST /api/listings`
- **Auth Required**: Yes
- **Request Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Vintage Bicycle",
    "description": "A well-maintained 10-speed vintage road bike.",
    "price": 4500.0,
    "category": "Vehicles",
    "location": "Mumbai",
    "image_urls": ["/uploads/bike1.jpg", "/uploads/bike2.jpg"]
  }
  ```
- **Response Codes**:
  - `201 Created`: Listing successfully created.
  - `400 Bad Request`: Input validation failed.
  - `401 Unauthorized`: Unauthenticated.
- **Response Body (201)**:
  ```json
  {
    "id": 10,
    "title": "Vintage Bicycle",
    "description": "A well-maintained 10-speed vintage road bike.",
    "price": 4500.0,
    "category": "Vehicles",
    "location": "Mumbai",
    "image_urls": ["/uploads/bike1.jpg", "/uploads/bike2.jpg"],
    "seller_id": 1,
    "fraud_score": 12.5,
    "fraud_level": "Low",
    "created_at": "2026-06-15T12:05:00Z"
  }
  ```

### 2. Fetch Listings
- **Endpoint**: `GET /api/listings`
- **Auth Required**: No
- **Query Parameters**:
  - `page` (int, default: 1)
  - `size` (int, default: 20)
- **Response Body (200)**:
  ```json
  {
    "items": [
      {
        "id": 10,
        "title": "Vintage Bicycle",
        "price": 4500.0,
        "category": "Vehicles",
        "location": "Mumbai",
        "image_urls": ["/uploads/bike1.jpg"],
        "seller_id": 1,
        "fraud_score": 12.5,
        "fraud_level": "Low",
        "created_at": "2026-06-15T12:05:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  }
  ```

### 3. Get Listing Detail
- **Endpoint**: `GET /api/listings/{id}`
- **Auth Required**: No
- **Response Codes**:
  - `200 OK`: Details returned.
  - `404 Not Found`: Listing does not exist.

### 4. Update Listing
- **Endpoint**: `PUT /api/listings/{id}`
- **Auth Required**: Yes (Must be Owner)
- **Request Body**: Similar to Create Listing.
- **Response Codes**:
  - `200 OK`: Updates saved.
  - `403 Forbidden`: User is not the owner.
  - `404 Not Found`: Listing does not exist.

### 5. Delete Listing
- **Endpoint**: `DELETE /api/listings/{id}`
- **Auth Required**: Yes (Must be Owner)
- **Response Codes**:
  - `204 No Content`: Successful deletion.
  - `403 Forbidden`: User is not the owner.
  - `404 Not Found`: Listing does not exist.

---

## Search APIs

### 1. Filtered Listing Search
- **Endpoint**: `GET /api/search`
- **Auth Required**: No
- **Query Parameters**:
  - `q` (string, optional): Title keyword search.
  - `category` (string, optional): Filter by category.
  - `location` (string, optional): Filter by location.
- **Response Body (200)**: Array of listing objects.

---

## Chat APIs

### 1. Send Message
- **Endpoint**: `POST /api/chat/messages`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "listing_id": 10,
    "content": "Hi, is this bicycle still available?"
  }
  ```
- **Response Body (201)**:
  ```json
  {
    "id": 45,
    "listing_id": 10,
    "sender_id": 2,
    "content": "Hi, is this bicycle still available?",
    "created_at": "2026-06-15T12:10:00Z"
  }
  ```
- **Note**: Triggers a background process that generates a simulated response from the seller (sender_id: seller_id) after 2 seconds.

### 2. Fetch Conversations
- **Endpoint**: `GET /api/chat/conversations/{listing_id}`
- **Auth Required**: Yes
- **Response Body (200)**: Array of message objects belonging to the listing thread.

---

## AI APIs

### 1. AI Description Generation
- **Endpoint**: `POST /api/ai/describe`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Vintage Bicycle",
    "keywords": ["red", "good condition", "10-speed", "retro"]
  }
  ```
- **Response Body (200)**:
  ```json
  {
    "description": "Fully functional retro red Vintage Bicycle in good condition. Features a smooth 10-speed gear setup ideal for daily commutes.",
    "is_fallback": false
  }
  ```

### 2. AI Category Prediction
- **Endpoint**: `POST /api/ai/predict-category`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "IPhone 13 Pro Max 128GB"
  }
  ```
- **Response Body (200)**:
  ```json
  {
    "category": "Electronics",
    "is_fallback": false
  }
  ```

### 3. AI Price Recommendation
- **Endpoint**: `POST /api/ai/recommend-price`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "iPhone 13 Pro Max 128GB",
    "condition": "used"
  }
  ```
- **Response Body (200)**:
  ```json
  {
    "suggested_min": 45000.0,
    "suggested_max": 52000.0,
    "currency": "INR",
    "is_fallback": false
  }
  ```
