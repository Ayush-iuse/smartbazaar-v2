# Architectural Research: SmartBazaar V3 — Full Serverless Vercel Architecture

This document resolves the unknowns, evaluates alternative architectures, and details the technology design decisions for the serverless migration.

---

## 1. TECHNICAL DECISIONS & RATIONALE

### Decision 1: Stateless FastAPI Backend on Vercel Python Functions
* **Approach**: Move from a persistent running backend container to a stateless Python execution environment on Vercel.
* **Architecture**: Create an entry point file at `api/main.py` which exposes the FastAPI application instance. In `vercel.json`, configure a wildcard rewrite to route all requests matching `/api/(.*)` to `api/main.py`.
* **Rationale**: Allows the backend to scale dynamically with zero server management costs and leverages Vercel's Edge/Serverless infrastructure.
* **Alternatives Considered**: 
  - *Next.js Route Handlers*: Rejected for the entire backend since rewriting the extensive AI Copilot, trust calculation scoring engines, and CRM utilities in TypeScript would violate the "Do NOT modify business logic" and "Time Boxing" constraints.
  - *FastAPI on Render*: Rejected as the objective explicitly forbids Render.

### Decision 2: Authentication Migration (Custom JWT to Supabase Auth)
* **Approach**: Replace the custom SQLAlchemy user table login/register endpoints with Supabase Auth (GoTrue).
* **Architecture**: The frontend interfaces with `@supabase/supabase-js` to handle email signups, logins, Google OAuth2, and token refreshes. The FastAPI backend serves as a stateless resource server, validating incoming `Authorization: Bearer <JWT>` tokens using Supabase's JWKs (JSON Web Key Sets) or HMAC verification with the Supabase JWT secret.
* **Rationale**: Eliminates the risk of credential leaks, simplifies token refresh lifecycles, and provides built-in multi-factor and OAuth integrations.
* **Clarification Choice (Account Migration)**:
  - *Chosen*: **Force Password Reset on First Login**. Existing user records (excluding passwords) will be migrated to the Supabase database. Upon first sign-in attempt, the user is prompted to reset their password using their email to create their credentials in Supabase Auth.
  - *Why*: Simplest, most secure approach that avoids handling raw credentials or maintaining dual-authentication state tables.

### Decision 3: Real-Time Chat & State (WebSockets to Supabase Realtime)
* **Approach**: Replace the local WebSocket manager and Redis pub/sub channel in FastAPI with Supabase Realtime channels.
* **Architecture**: The frontend utilizes Supabase Realtime Channels (`supabase.channel('room-id')`) to listen to Postgres CDC events (insertions in the `messages` table), broadcast typing indicators, and track presence state (online/offline status) directly from the client.
* **Rationale**: Eliminates the need for persistent WebSocket connections to FastAPI, removing stateful server constraints.
* **Clarification Choice (Offline Notifications)**:
  - *Chosen*: **Application-Only Inbox Notification**. If a message is sent to an offline user, it is stored in the database. The recipient sees the unread counts update in the conversation list upon logging into the application.
  - *Why*: Simple, reliable, and keeps the initial serverless release self-contained without requiring third-party push alert APIs.

### Decision 4: Media Assets (Local Uploads to Supabase Storage)
* **Approach**: Deprecate local directory mounting (`/uploads`) and use Supabase Storage Buckets.
* **Architecture**: Define two buckets: `listings` (publicly readable, write-restricted to authenticated sellers) and `verifications` (private, read/write restricted to owners and administrators).
* **Rationale**: Fits stateless serverless design; local disk storage is ephemeral in serverless functions and cannot persist uploads.
* **Clarification Choice (Storage Limits)**:
  - *Chosen*: **Marketplace Standard Rules** (Max 5 listing images, max 5MB each, JPEG/PNG; max 2 verification scans, max 10MB each, PDF/JPEG).
  - *Why*: Balances storage consumption with document scan legibility.

---

## 2. RISK ANALYSIS & MITIGATION MATRIX

| Risk | Impact | Likelihood | Mitigation |
| :--- | :--- | :--- | :--- |
| **Serverless Cold Starts** | Medium | High | Keep runtime package weights small. Reuse database connection pools outside the serverless function handler to persist connections across invocations. |
| **Supabase Realtime Rate Limits** | High | Low | Implement client-side debounce logic for typing indicators (e.g. broadcast once every 2 seconds) and limit concurrent channels. |
| **Data Migration Downtime** | Medium | Medium | Stamp schema versioning clearly, run data copy tasks, and execute verification checks before pointing frontend DNS to the new Vercel production URL. |
| **Credential Loss during Auth Switch** | High | Medium | Execute clear email alerts to existing users directing them to reset passwords upon Vercel system activation. |
