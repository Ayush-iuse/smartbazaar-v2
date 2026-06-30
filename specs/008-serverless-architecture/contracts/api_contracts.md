# Interface Contracts: SmartBazaar V3 — Full Serverless Vercel Architecture

This document defines the REST API endpoints, real-time message payloads, and authentication headers for the Vercel-deployed application.

---

## 1. AUTHENTICATION HEADER CONTRACT

All authenticated REST API endpoints require a bearer authorization header containing the Supabase JWT token:

```http
Authorization: Bearer <supabase_jwt_token>
```

The serverless FastAPI backend validates the token using Supabase's JSON Web Key Set (JWKS) endpoints or verifies the signature directly using `HMAC-SHA256` with the `SUPABASE_JWT_SECRET`.

---

## 2. REAL-TIME CHAT MESSAGE CONTRACTS

Real-time interactions are broadcast via Supabase Realtime Channels.

### Presence Tracking Channel
* **Channel Name**: `presence:chat:<conversation_id>`
* **Join Event Payload**:
```json
{
  "event": "join",
  "payload": {
    "user_id": "9a38f322-2615-4ba8-9b88-5188ef77a881",
    "is_online": true,
    "last_active_at": "2026-07-01T00:40:00Z"
  }
}
```

### Typing Indicator Broadcast Channel
* **Channel Name**: `typing:chat:<conversation_id>`
* **Event**: `typing`
* **Payload**:
```json
{
  "event": "typing",
  "payload": {
    "user_id": "9a38f322-2615-4ba8-9b88-5188ef77a881",
    "is_typing": true
  }
}
```

### Database Message Mutation Listener
* **Channel Name**: `realtime:public:messages:conversation_id=eq.<conversation_id>`
* **Event**: `INSERT`
* **Payload**:
```json
{
  "event": "INSERT",
  "schema": "public",
  "table": "messages",
  "record": {
    "id": 88472,
    "conversation_id": 482,
    "sender_id": "9a38f322-2615-4ba8-9b88-5188ef77a881",
    "content": "Is the laptop still available?",
    "message_type": "text",
    "media_url": null,
    "is_read": false,
    "created_at": "2026-07-01T00:40:05Z"
  }
}
```

---

## 3. STATELSS REST API ENDPOINTS (FASTAPI)

| Method | Endpoint | Description | Request Body | Response Payload (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Service health status check | None | `{"status": "healthy", "version": "3.0.0"}` |
| **GET** | `/api/ready` | Readiness status check | None | `{"status": "ready", "database": "connected", "storage": "connected"}` |
| **POST** | `/api/listings` | Create a new listing | `{ "title": "String", "price": 12000.0, "category": "Electronics" }` | `{"id": 109, "title": "String", "status": "Active"}` |
| **POST** | `/api/offers` | Create a listing offer | `{ "listing_id": 109, "amount": 11500.0 }` | `{"id": 4452, "listing_id": 109, "status": "Pending"}` |
