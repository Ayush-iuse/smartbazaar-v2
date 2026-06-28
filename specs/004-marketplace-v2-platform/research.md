# Design Research: SmartBazaar V2 Architecture

This document outlines the architectural decisions, rationales, and alternatives considered for the SmartBazaar V2 Marketplace Platform.

---

## 1. WebSocket Presence & Messaging Architecture

### Decision
Implement a WebSocket gateway router in FastAPI managed by an in-memory `WebSocketConnectionManager`.
* **State Sync**: Track active connections mapping `user_id -> List[WebSocket]`.
* **Pub/Sub Integration**: For multi-container scaling, use Redis Pub/Sub channels (`chat_messages`, `user_status`).
* **Delivery Loop**: Broadcast typing state changes, presence, and receipt updates asynchronously.
* **Message Lifecycle**:
  1. Message Sent (Socket -> Server): Persisted in DB as `is_delivered = False, is_read = False`.
  2. Message Delivered (Server -> Recipient Socket): Dispatch receipt update to Sender, flag `is_delivered = True` in DB.
  3. Message Read (Recipient open event -> Server): Flag `is_read = True` in DB, dispatch read receipt to Sender.

### Rationale
* FastAPI’s native WebSocket implementation is extremely lightweight and integrates seamlessly with JWT authentication during the initial handshake protocol.
* Redis Pub/Sub allows horizontal scaling to multiple backend containers (e.g. under Kubernetes or Docker swarm) without losing socket sync.
* Separating delivery from read receipts keeps message state tracking robust and mirroring major chat apps (WhatsApp, Messenger).

### Alternatives Considered
* **Socket.io / Socket.io-client**: Rejected because it introduces a heavy, non-native dependency on both client and server, increasing the JavaScript bundle size and python layer complexity.
* **HTTP Long Polling**: Rejected due to high database query overhead and latency, violating the `<150ms` real-time requirement.

---

## 2. Seller CRM Lead Scoring (Heat Score)

### Decision
Implement a deterministic mathematical formula on the backend to categorize active buyer inquiries into leads (`Hot`, `Active`, `Cold`).
* **Lead Score Formula**:
  $$\text{Lead Score} = (w_1 \times \text{Offer Premium}) + (w_2 \times \text{Buyer Trust}) - (w_3 \times \text{Last Activity Hours})$$
  Where:
  * `Offer Premium` = Ratio of highest offer to listing price (scaled 0-100).
  * `Buyer Trust` = Buyer's Trust Score (0-100).
  * `Last Activity Hours` = Hours elapsed since last buyer message.
* **Classification Tiers**:
  * Score >= 75: **Hot Lead**
  * Score 40-74: **Active Lead**
  * Score < 40: **Cold Lead**
* **Analytics**: Aggregate metrics asynchronously using SQL query grouping to render the funnel pipeline charts.

### Rationale
* Simple, predictable, fully testable, and consumes minimal CPU cycles.
* Provides clear insights to sellers without requiring external data pipelines.

### Alternatives Considered
* **Machine Learning Classifier (Random Forest / Logistic Regression)**: Rejected because it requires large-scale transactional training datasets, adds massive cold-start latency, and increases resource overhead in local environments.

---

## 3. Buyer Trust Engine

### Decision
Implement an asynchronous trust calculation engine triggered on event changes (e.g. deals completed, offers cancelled, reports filed) or running as a daily background task.
* **Trust Score Formula**:
  $$\text{Trust Score} = 50 + (\text{Deals} \times 5) + (\text{Response Rate} \times 0.2) - (\text{Cancellations} \times 10) - (\text{Spam Reports} \times 15)$$
  *Bounded between 0 and 100.*
* **Verification Levels**:
  * Email Verified (+10 points)
  * Phone Verified (+15 points)
  * Government ID Verified (+25 points)
* **Tier Tiers**:
  * Trust Score >= 90 + ID Verified: **Elite Buyer**
  * Trust Score 75-89 + Phone Verified: **Trusted Buyer**
  * Trust Score 50-74: **Verified Buyer**
  * Trust Score < 50: **New Buyer**

### Rationale
* Decoupling the scoring engine into event-driven updates or periodic jobs prevents database query lag during browse/search operations.
* Directly saving the computed score in a `UserTrustScore` table allows indexing and fast lookup.

### Alternatives Considered
* **Real-time Query Aggregation (SQL Joins on read)**: Rejected because running multiple aggregations across history logs, listing, message, and offer tables on every listing load breaks performance budgets.

---

## 4. Recommendation Feed Engine

### Decision
Develop a hybrid content-based and collaborative filtering recommender.
* **Algorithmic Weighting**:
  $$\text{Match Score} = (w_{\text{category}} \times C) + (w_{\text{location}} \times L) + (w_{\text{interaction}} \times I)$$
  * Category $C$: 1.0 if category matches user’s historically clicked/wished categories, 0.0 otherwise.
  * Location $L$: Inverse geographic distance between item location and user’s location.
  * Interaction $I$: Frequency of user interactions (Views: 0.1, Saves: 0.3, Chats: 0.6).
* **Caching**: Recommendations are pre-computed on interaction events and stored in Redis under `rec:{user_id}` with a 1-hour expiration TTL.

### Rationale
* Keeps the homepage response time below 200ms by fetching keys from Redis.
* Simple vector dot-products can be run locally using SQLite/PostgreSQL math functions.

### Alternatives Considered
* **Graph Databases (e.g., Neo4j)**: Rejected due to significant container size and memory footprints, violating the local-first simplicity principle.
* **Elasticsearch / vector database (e.g. pgvector)**: Rejected to avoid adding complex infrastructure dependencies for a local development build. Standard SQL and indexing are sufficient for the V2 MVP.

---

## 5. AI Copilot Fallback Rules Engine

### Decision
The AI Copilot Router acts as a gateway wrapper:
* **Primary Path**: Sends the natural language query to an external API (Gemini-1.5-Flash or OpenAI GPT-4o-mini) using system prompts that enforce structured JSON output.
* **Secondary Fallback Path (Offline/Key Absent)**: Triggers a local deterministic parsing pipeline using regular expression text tokenizers.
  * *Intent Parsing*: Extract price tags (`under \d+`), categories (lookup matches), location tags (`near \w+`), and trust flags (`trusted`, `verified`).
  * *Query Construction*: Maps extracted tokens to standard SQL filter calls.

### Rationale
* Complies with Constitution Principle 10 (graceful degradation) and local execution requirements.
* Using regex parsing provides instant offline search matches without breaking the UI.

### Alternatives Considered
* **Local lightweight LLM container (e.g., Ollama/Llama3-8B)**: Rejected because running an 8B model container locally consumes 4.5GB+ RAM and slows down search operations to 5-15 seconds per query on normal development environments.

---

## 6. WebGL 3D Performance & Fallback

### Decision
Render the 3D trade globe and product cards using React Three Fiber (R3F) and React Three Drei.
* **Asset Optimization**: Load `.glb` assets asynchronously using `@react-three/drei`'s `useGLTF.preload`. Models must use low-polygon structures, basic textures, and no dynamic lighting/real-time shadow mapping.
* **Dynamic Performance Check**:
  * Monitor rendering FPS in the canvas requestAnimationFrame loop.
  * If FPS drops below 30 for 3 consecutive seconds, trigger a State dispatch.
  * The State updates to disable the canvas element, mounting a highly stylized 2D SVG/CSS alternative in its place.
  * A React ErrorBoundary catches WebGL context losses and triggers the same 2D fallback.

### Rationale
* Guarantees smooth page loads, preventing app hangs on low-end devices.
* Low-poly static glb models keep bundle sizes small (under 500KB per asset).

### Alternatives Considered
* **Pure Three.js without React wrapper**: Rejected as it is harder to maintain and integrate with React state/Zustand workflows.
* **Lottie Animations**: Rejected because it is static and does not support interactive product rotations in 3D space.

---

## 7. Advanced Session Security (Refresh Token Rotation)

### Decision
Implement standard Refresh Token Rotation (RTR) on the backend.
* **Token Structure**: Access tokens expire in 15 minutes. Refresh tokens expire in 7 days.
* **Token Hashing**: Store refresh tokens in the database as a SHA-256 hash alongside `device_id` and `ip_address` to prevent leakage exposure.
* **Rotation Protocol**:
  1. Client sends `/refresh` request with Refresh Token.
  2. Backend verifies token, checks if it is revoked or has been used.
  3. If valid, backend generates a new Access Token and a new Refresh Token, marks the old Refresh Token as used/revoked, and returns both to the client.
  4. If the presented Refresh Token has already been used, it indicates a replay attack. The backend instantly revokes *all* refresh tokens associated with that user session to block the attacker.

### Rationale
* Best practice for securing single-page apps (SPAs) against Cross-Site Scripting (XSS) and token theft.
* Enables granular device management (users can view and revoke sessions for specific devices).

### Alternatives Considered
* **Short-lived access tokens without refresh tokens**: Rejected because users would be forced to log in again every 15 minutes, which destroys the user experience.
* **Static refresh tokens**: Rejected because if a refresh token is stolen, the attacker has permanent access until the token naturally expires.

---

**Version**: 1.0.0 | **Ratified**: Pending | **Last Amended**: 2026-06-23
