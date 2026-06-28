# API Contract Validation Report: SmartBazaar AI

This report verifies that all frontend HTTP requests correspond exactly to the FastAPI backend API router schemas and status codes.

---

## 1. Authentication Endpoints

| Endpoint | Method | Request Payload | Response Schema | Status Codes | Result |
|---|---|---|---|---|---|
| `/api/auth/register` | `POST` | `{"email", "password", "full_name"}` | `{"id", "email", "full_name", "created_at"}` | `201 Created` / `400` | **Verified** |
| `/api/auth/login` | `POST` | `username=<email>&password=<pass>` (Urlencoded) | `{"access_token", "token_type"}` | `200 OK` / `401` | **Verified** |
| `/api/auth/me` | `GET` | Headers: `Authorization: Bearer <JWT>` | `{"id", "email", "full_name", "created_at"}` | `200 OK` / `401` | **Verified** |

- **Verification details**: Login endpoint requires `OAuth2PasswordRequestForm` (urlencoded data fields `username` and `password`). The frontend handles this using `URLSearchParams` and headers wrapper override correctly.

---

## 2. Listing Lifecycle Endpoints

| Endpoint | Method | Request Payload | Response Schema | Status Codes | Result |
|---|---|---|---|---|---|
| `/api/listings` | `POST` | `{"title", "description", "price", "category", "location", "image_urls"}` | Complete Listing JSON | `201 Created` / `422` | **Verified** |
| `/api/listings` | `GET` | Query: `page`, `size` | Array of Listing JSON objects | `200 OK` | **Verified** |
| `/api/listings/{id}` | `GET` | URL Parameter: `id` | Listing Detail JSON | `200` / `404` | **Verified** |
| `/api/listings/{id}` | `PUT` | `{"title", "description", "price", "category", "location", "image_urls"}` | Updated Listing JSON | `200` / `403` / `404` | **Verified** |
| `/api/listings/{id}` | `DELETE` | URL Parameter: `id` | Empty response (no content) | `204 No Content` / `403` | **Verified** |

- **Verification details**: Owner authorization checks (`verify_listing_ownership`) are enforced in update and delete services. Non-owner requests correctly yield `403 Forbidden`.

---

## 3. Search & Chat Endpoints

| Endpoint | Method | Request Payload | Response Schema | Status Codes | Result |
|---|---|---|---|---|---|
| `/api/search` | `GET` | Query: `q`, `category`, `location` | Array of Listing JSON objects | `200 OK` | **Verified** |
| `/api/messages/{listing_id}` | `POST` | `{"listing_id", "content"}` | Message Detail JSON | `201 Created` / `404` | **Verified** |
| `/api/messages/{listing_id}` | `GET` | URL Parameter: `listing_id` | Array of Message JSON objects | `200 OK` | **Verified** |

- **Verification details**: Chat queries verify listing existence. Posting a buyer message triggers background worker task `mock_seller_reply` saving auto-responses after 2.0s.

---

## 4. AI Service Endpoints

| Endpoint | Method | Request Payload | Response Schema | Status Codes | Result |
|---|---|---|---|---|---|
| `/api/ai/description` | `POST` | `{"title", "keywords"}` | `{"description", "is_fallback"}` | `200 OK` | **Verified** |
| `/api/ai/category` | `POST` | `{"title"}` | `{"category", "is_fallback"}` | `200 OK` | **Verified** |
| `/api/ai/price` | `POST` | `{"title", "condition"}` | `{"suggested_min", "suggested_max", "currency", "is_fallback"}` | `200 OK` | **Verified** |
| `/api/ai/fraud` | `POST` | `{"title", "description"}` | `{"fraud_score", "fraud_level", "flagged_phrases", "is_fallback"}` | `200 OK` | **Verified** |

- **Verification details**: All endpoints execute OpenAI models or load local rules seamlessly. Responses are marked with `is_fallback` and descriptions carry the `[AI Suggested]` label.
