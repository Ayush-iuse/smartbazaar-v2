# Data Model: Production Deployment Platform

This document describes the configurations, cache layouts, and asset storage metadata models mapped for SmartBazaar V2 production environments.

---

## 1. RUNTIME CONFIGURATION SCHEMAS

### Config Schema: `Settings`
Loads and validates variables at system initialization.

| Attribute | Type | Validation / Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `str` | Mandatory | Postgres or SQLite connection string |
| `DB_SSL_MODE` | `str` | Default: `"require"` | Postgres SSL Mode |
| `REDIS_URL` | `str` | Optional | Connection string for Upstash Redis |
| `REDIS_HOST` | `str` | Optional | Hostname for local Redis container |
| `JWT_SECRET` | `str` | Default: `"supersecret..."` | Token signing secret key |
| `CORS_ORIGINS` | `str` | Default: `"http://localhost:3000"` | Comma-separated allowed CORS origins |
| `CLOUDINARY_CLOUD_NAME` | `str` | Optional | Cloudinary Account Identifier |
| `CLOUDINARY_API_KEY` | `str` | Optional | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `str` | Optional | Cloudinary API Secret Key |
| `PORT` | `int` | Default: `8000` | Dynamic binding port |

---

## 2. RELATIONAL DATA SCHEMA (PERSISTED IN POSTGRESQL)

No new tables are introduced. The media upload routes continue to interact with the standard chat message media tables.

### Table: `messages` (Existing Schema Mapping)
Uploaded media details are stored as secure, persistent URLs:

- **`message_type`**: `VARCHAR(10)` (Value: `'image'` or `'voice'`)
- **`media_url`**: `TEXT` (Contains absolute path `/uploads/chat/...` for local uploads OR `https://res.cloudinary.com/...` for Cloudinary uploads)

### Table: `verification_documents` (Existing Schema Mapping)
Document uploads are mapped as absolute URLs:
- **`document_path`**: `TEXT` (Contains `/uploads/verification/...` or secure cloud storage URL)

---

## 3. IN-MEMORY CACHE SCHEMA (PERSISTED IN REDIS / UPSTASH)

### Key: `presence:{user_id}`
- **Type**: String
- **Value**: `"online"` | `"offline"` | `"typing"`
- **TTL**: None for online/offline, 5 seconds for typing.

### Key: `unread:{user_id}:{conversation_id}`
- **Type**: String (Integer)
- **Value**: Number of unread messages.
- **TTL**: None.

### Key: `rate_limit:{ip_address}:{endpoint}`
- **Type**: String (Integer)
- **Value**: Number of request hits in the active window.
- **TTL**: 10 seconds.
