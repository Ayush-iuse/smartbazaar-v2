# Feature Specification: Production Deployment Platform (Local Docker + Render + Vercel)

**Feature Branch**: `007-production-deployment`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Convert SmartBazaar into a production-ready marketplace using ONLY FREE cloud services. The project must support BOTH Local Development and Production Deployment without changing any source code. Deploy on Vercel, Render, Supabase PostgreSQL, Upstash Redis, and Cloudinary."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Local Development Orchestration (Priority: P1)

Developers can initialize the complete platform locally using a single commands set, spinning up all backend, frontend, caching, and database structures immediately without configuring third-party accounts.

**Why this priority**: Core developer onboarding path. If local setup is broken, development velocity degrades. Delivers immediate value as a self-contained local MVP.

**Independent Test**: Execute `docker compose up --build` on a clean machine without setting up any cloud keys, and verify the frontend, backend, search, database, and caching systems connect and operate.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repository, **When** the developer runs `docker compose up`, **Then** the Postgres container starts, seeds initial mock data, the Redis container launches, and the Next.js app binds to `http://localhost:3000`.
2. **Given** no external cloud secrets in the environment, **When** the chat interface is used to send image/voice media, **Then** files are saved to the local `/uploads/chat` directory and served locally with zero errors.

---

### User Story 2 - Automated Multi-Provider Production Cloud Migration (Priority: P2)

Administrators can connect the GitHub repository to Render and Vercel, feed in the credentials for Supabase, Upstash, and Cloudinary, and trigger an automated deployment that works immediately without modifying code files.

**Why this priority**: Prepares the project for live investor previews and production traffic, utilizing scalable serverless and edge hosting layers.

**Independent Test**: Connect the branch to Render and Vercel, input cloud environment keys, push changes, and verify all live features (registration, listings, chat WebSockets, AI recommendations) resolve via cloud URLs.

**Acceptance Scenarios**:

1. **Given** valid Supabase `DATABASE_URL` and Upstash `REDIS_URL` in the Render dashboard, **When** the backend starts, **Then** Alembic migrations execute, tables are created on Supabase, and connections to Upstash succeed with TLS enabled.
2. **Given** Cloudinary variables configured, **When** a user uploads chat attachments in production, **Then** files are stored on Cloudinary with optimized scaling, and secure URLs are persisted to the database.

---

### User Story 3 - Robust Outage Tolerance & Telemetry Monitoring (Priority: P3)

The application handles service interruptions (e.g. database down, Redis cache offline, AI provider rate-limited) by degrading services gracefully and logging health alerts without crashing.

**Why this priority**: Keeps the application running during transient errors, ensuring maximum uptime and diagnostic visibility.

**Independent Test**: Simulate an Upstash Redis outage, and verify that chat works (falling back to InMemoryRedis) and logs warnings.

**Acceptance Scenarios**:

1. **Given** Redis server is offline, **When** a user views active chats or status indicators, **Then** data fallbacks are served instantly, and the system continues running normally.
2. **Given** a backend health-check probe, **When** checking the `/health` endpoint, **Then** HTTP 200 is returned along with status details.

---

## Edge Cases

- **PostgreSQL Connection Drops**: If Supabase database terminates connections due to inactive pooling, the SQLAlchemy engine must re-verify connection flags and reconnect automatically using connection pre-ping settings.
- **Vercel Build Cache Headers**: If media assets are fetched from Vercel edge networks, URLs must be bypass-cached or read directly from the Cloudinary CDN to prevent stale images.
- **WebSocket Reconnections**: If the Render server scales down or restarts, WebSocket connections from client browsers must auto-detect the disconnect and run exponential reconnect retries.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support dynamic port binding on the backend to match Render's allocated port.
- **FR-002**: System MUST automatically rewrite incoming PostgreSQL connection URLs starting with `postgres://` to `postgresql://` for SQLAlchemy compatibility.
- **FR-003**: System MUST execute Alembic database migrations automatically upon application startup.
- **FR-004**: System MUST check for Cloudinary credentials on startup and route media uploads to Cloudinary if keys are present.
- **FR-005**: System MUST crop, optimize, and auto-format image files uploaded to Cloudinary to limit CDN loading latency.
- **FR-006**: System MUST generate custom image thumbnails using dynamic URL transformation paths.
- **FR-007**: System MUST parse `CORS_ORIGINS` from environment variables as a list of allowed origins.
- **FR-008**: System MUST support Upstash Redis connection via `REDIS_URL` connection strings with secure TLS protocol.
- **FR-009**: System MUST support connection retries and fall back to `InMemoryRedis` if the Redis connection fails.
- **FR-010**: System MUST configure Next.js domains to allow images loaded from `res.cloudinary.com`.
- **FR-011**: System MUST read WebSocket URL dynamically using `NEXT_PUBLIC_WS_URL` to support production secure endpoints (`wss://`).
- **FR-012**: System MUST provide a dynamic python-based health check probe inside Docker configurations.
- **FR-013**: System MUST prevent raw database credentials or secrets from being hardcoded or committed to git.
- **FR-014**: System MUST automatically throttle login and register endpoints to prevent brute force security attacks.
- **FR-015**: System MUST provide custom environment variable templates for `.env.example`, `.env.development`, `.env.production` (backend/root), `.env.local.example`, and `.env.production.example` (frontend).
- **FR-016**: CI/CD workflows MUST automatically run unit tests, lint checks, and check Docker builds on code pushes.

### Key Entities

- **EnvironmentConfig**: Representation of the dynamic runtime configuration parsed from environment variables (PORT, DB URL, Redis URL, Cloudinary Keys).
- **ConnectionPool**: Data structures representing connection pools for PostgreSQL and Redis to handle connection limits.
- **AssetUpload**: Represents an image or file asset uploaded to Cloudinary, tracking secure URLs, public IDs, and transformation queries.
- **WebSocketSession**: Active real-time WebSocket connection session between a user and the backend gateway.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can compile and boot the local stack using a single command (`docker compose up --build`) in under 5 minutes.
- **SC-002**: Backend database connections handle a minimum of 20 concurrent sessions without connection timeouts or errors.
- **SC-003**: Dynamic media files uploaded to Cloudinary load in under 1.5 seconds due to automated image format compression.
- **SC-004**: Frontend page builds compile cleanly on Vercel without warnings or missing environment variable errors.

---

## Assumptions

- **A-001**: The target platforms (Render, Vercel, Supabase, Upstash, Cloudinary) remain active and offer compatible free tier specifications.
- **A-002**: Mobile devices and browsers support the standard WebSocket protocol for chat.
- **A-003**: The database structure fits within the standard Supabase storage quotas.
- **A-004**: Users have stable internet connections for real-time chat sync.
