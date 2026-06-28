# API Contract: Marketplace Intelligence Services

This document defines the request/response payloads, validation rules, and HTTP status codes for the newly introduced V3 services.

---

## 1. Seller Copilot API

- **Endpoint**: `POST /api/ai/copilot`
- **Authentication**: Yes (`Bearer JWT`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "title": "Vintage Bicycle",
    "description": "Retro road bike, good condition.",
    "price": 4500.0,
    "category": "Vehicles",
    "condition": "used"
  }
  ```
- **Response Codes**:
  - `200 OK`: Analysis successfully generated.
  - `400 Bad Request`: Input validation failed.
- **Response Body (200)**:
  ```json
  {
    "listing_score": 85,
    "sale_probability": 72,
    "competition_score": 40,
    "improvements": [
      "Add detail about gear configuration",
      "Upload at least 2 more photos"
    ]
  }
  ```

---

## 2. Buyer Agent Service API

- **Endpoint**: `POST /api/ai/buyer-agent`
- **Authentication**: Yes (`Bearer JWT`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "listing_id": 10
  }
  ```
- **Response Codes**:
  - `200 OK`: Buying recommendations returned.
  - `404 Not Found`: Listing does not exist.
- **Response Body (200)**:
  ```json
  {
    "recommendation": "NEGOTIATE",
    "confidence": 85,
    "explanation": "The item is authentic and the seller has a high trust score, but the price is 15% above the market average for used Vehicles.",
    "pros": [
      "Excellent condition verified",
      "Seller has 95% response rate"
    ],
    "cons": [
      "Price slightly above market average"
    ],
    "fair_price": 3800.0,
    "risk_level": "Low"
  }
  ```

---

## 3. Smart Search API

- **Endpoint**: `POST /api/ai/search-agent`
- **Authentication**: No
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "query": "Good laptop under 25000 in Mumbai"
  }
  ```
- **Response Codes**:
  - `200 OK`: Search query parsed.
- **Response Body (200)**:
  ```json
  {
    "intent": "purchase_laptop",
    "category": "Electronics",
    "price_min": 0.0,
    "price_max": 25000.0,
    "location": "Mumbai",
    "keywords": ["laptop", "notebook"]
  }
  ```

---

## 4. Marketplace Analytics APIs

### 1. Market Overview Summary
- **Endpoint**: `GET /api/analytics/overview`
- **Authentication**: Yes
- **Response Body (200)**:
  ```json
  {
    "total_listings": 1420,
    "total_categories": 6,
    "ai_trends_summary": "Electronics account for 42% of active listings. Vehicles and Furniture show the fastest velocity, selling in average 5 days.",
    "snapshot_date": "2026-06-17"
  }
  ```

### 2. Category Distributions
- **Endpoint**: `GET /api/analytics/categories`
- **Authentication**: Yes
- **Response Body (200)**:
  ```json
  [
    {
      "category": "Electronics",
      "listings_count": 596,
      "average_price": 14200.0,
      "velocity_days": 8
    }
  ]
  ```
