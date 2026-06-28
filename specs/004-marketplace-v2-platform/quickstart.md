# Feature Quickstart & Verification Guide: SmartBazaar V2

This document provides step-by-step instructions to verify that the SmartBazaar V2 features are correctly implemented and integrated.

These tests can be run locally using standard command-line tools like `curl`, `wscat` (or `websocat`), and terminal flags.

---

## Prerequisites

1. **Docker services active**:
   ```bash
   docker compose up -d
   ```
2. **Access Token & Refresh Token pair generated**:
   Run a curl request against the login router to obtain a fresh access token (`JWT_ACCESS`) and refresh token (`JWT_REFRESH`).

---

## Scenario 1: Advanced Security & Token Rotation (RTR)

Verify that the authentication token is rotated on access refresh, and that reuse triggers session revocation.

### Step 1: Request token refresh
```bash
curl -X POST http://localhost:8000/api/v2/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "'"$JWT_REFRESH"'"}'
```
* **Expected Outcome**: Returns HTTP `200 OK` with a new `access_token` and a new `refresh_token`.

### Step 2: Test replay protection (Re-using the old refresh token)
Repeat the command in Step 1 using the *same* old `$JWT_REFRESH`.
* **Expected Outcome**: Returns HTTP `401 Unauthorized` with body:
  `{"detail": "Invalid or revoked refresh token. All active sessions terminated."}`
* **Verification Check**: Verify that all active entries for this user in the `refresh_tokens` database table are now set to `is_revoked = true` or deleted, forcing the user to log in again.

---

## Scenario 2: Real-Time WebSockets presence, typing states, and read receipts

Verify real-time communication events.

### Step 1: Open Client Socket connections
Open two terminal windows representing Client A (Buyer, JWT A) and Client B (Seller, JWT B). Use `wscat` to establish connections:
* **Terminal A (Buyer)**:
  ```bash
  wscat -c "ws://localhost:8000/api/v2/chat/ws?token=$JWT_A"
  ```
* **Terminal B (Seller)**:
  ```bash
  wscat -c "ws://localhost:8000/api/v2/chat/ws?token=$JWT_B"
  ```

### Step 2: Verify Presence Broadcast
Upon connecting Terminal B, check Terminal A's output.
* **Expected Outcome**: Terminal A receives a JSON packet:
  ```json
  {"type": "presence_update", "user_id": 34, "is_online": true}
  ```

### Step 3: Verify Typing Indicators
In Terminal A (Buyer), send a typing event packet:
```json
{"type": "typing_status", "conversation_id": 2045, "is_typing": true}
```
* **Expected Outcome**: Terminal B receives:
  ```json
  {"type": "typing_indicator", "conversation_id": 2045, "user_id": 12, "is_typing": true}
  ```

### Step 4: Verify Message Transit & Receipts
In Terminal A (Buyer), send a chat message:
```json
{"type": "send_message", "conversation_id": 2045, "content": "I would like to offer ₹8000"}
```
* **Expected Outcome**:
  1. Terminal B receives the message payload: `{"type": "new_message", ...}`.
  2. Terminal A immediately receives: `{"type": "delivery_receipt", "message_id": 9846, "is_delivered": true}`.
  3. Send a `mark_read` event from Terminal B: `{"type": "mark_read", "conversation_id": 2045}`.
  4. Terminal A receives: `{"type": "read_receipt", "message_id": 9846, "is_read": true}`.

---

## Scenario 3: Seller CRM Pipeline & Lead Funnel

Verify that user chat activities populate the CRM pipeline.

### Step 1: Query initial leads
```bash
curl -X GET http://localhost:8000/api/v2/crm/leads \
  -H "Authorization: Bearer $JWT_SELLER"
```
* **Expected Outcome**: Returns HTTP `200 OK` listing the Buyer as a `lead` or `active` since a message exchange occurred in Scenario 2.

### Step 2: Mutate Lead funnel status
```bash
curl -X PUT http://localhost:8000/api/v2/crm/leads/412/stage \
  -H "Authorization: Bearer $JWT_SELLER" \
  -H "Content-Type: application/json" \
  -d '{"lead_status": "converted"}'
```
* **Expected Outcome**: Returns HTTP `200 OK` confirming the stage is set to `"converted"`.
* **Verification Check**: Verify that fetching CRM analytics shows the completed deal count has incremented.

---

## Scenario 4: AI Copilot Drawer & Offline Fallback

Verify that the Copilot handles natural language queries and fails gracefully when offline.

### Step 1: Execute Query under normal conditions
```bash
curl -X POST http://localhost:8000/api/v2/copilot/query \
  -H "Authorization: Bearer $JWT_BUYER" \
  -H "Content-Type: application/json" \
  -d '{"query": "Find laptops under ₹40000 near me"}'
```
* **Expected Outcome**: Returns HTTP `200 OK` with JSON recommendations, confidence score, and explanation matching active listings.

### Step 2: Test Offline Fallback
1. Block internet access in the server container or delete the API config keys.
2. Re-run the curl query in Step 1.
* **Expected Outcome**: Returns HTTP `200 OK` with `is_offline_fallback: true` in the JSON response, displaying results parsed locally via regular expressions and simple database lookups.

---

## Scenario 5: WebGL 3D Canvas Fallback check

Verify that the frontend handles 3D context failures cleanly.

### Step 1: Trigger WebGL Context Loss in Browser
1. Open the homepage.
2. Open Chrome Developer Console.
3. Force WebGL crash:
   ```javascript
   const canvas = document.querySelector('canvas');
   const gl = canvas.getContext('webgl');
   gl.getExtension('WEBGL_lose_context').loseContext();
   ```
* **Expected Outcome**: The Three.js canvas element is unmounted. Framer Motion fades in the static, responsive 2D SVG/Tailwind illustration without page refreshes or JavaScript console errors.

---

**Version**: 1.0.0 | **Ratified**: Pending | **Last Amended**: 2026-06-23
