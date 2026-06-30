# Architectural Research: SmartBazaar V2 Production Deployment

This document records the architectural research and decisions for migrating SmartBazaar V2 to cloud infrastructure platforms (Render, Vercel, Supabase, Upstash, Cloudinary).

---

## 1. CENTRALIZED CONFIGURATION LAYER

- **Decision**: Centralized settings schema implemented via `pydantic-settings` mapping environment variables to attributes with defaults.
- **Rationale**: 
  - Validates variables on application startup.
  - Automatically loads settings from standard `.env` files.
  - Supports default fallbacks ensuring local development operates out-of-the-box.
- **Alternatives Considered**:
  - `os.getenv` key lookups: Lacks validation rules, requires manual type casting for integer ports or list CORS values, and spreads configurations across routers.

---

## 2. DATABASE INTEGRATION & CONNECTION POOLING

- **Decision**: SQLAlchemy connection pooling with connection pre-ping, pool recycle timings, and psycopg2 SSL parameters.
- **Rationale**: 
  - Supabase and Neon PostgreSQL drop idle connections aggressively. Pre-pinging (`pool_pre_ping=True`) verifies connections are alive before dispatching queries.
  - SSL mode (`sslmode=require`) is mandatory to secure database calls over the public internet.
- **Alternatives Considered**:
  - Direct database queries without connection pooling: High network latency on every request due to SSL/TCP handshake overheads.

---

## 3. REDIS INFRASTRUCTURE (UPSTASH MIGRATION)

- **Decision**: Redis connection pooling using `redis-py` with TLS support (`rediss://`), connection timeouts (5 seconds), and automatic `InMemoryRedis` memory fallback.
- **Rationale**: 
  - Upstash Redis runs on edge systems. TLS is mandatory.
  - Socket connect timeouts prevent the backend from hanging indefinitely during cloud service outages.
- **Alternatives Considered**:
  - Throwing exceptions on Redis connection loss: Disables chat, online status indicators, and rate limit validation during minor network blips.

---

## 4. PERSISTENT IMAGE & MEDIA STORAGE

- **Decision**: Cloudinary CDN storage with media transformations applied on upload, generating thumbnails via path updates.
- **Rationale**: 
  - Free cloud asset hosting with excellent CDN caching.
  - Serverless and containerized app runtimes (Vercel, Render) do not have persistent local write directories.
- **Alternatives Considered**:
  - AWS S3: Requires AWS account setup and has paid subscription thresholds.
  - Storing assets as Base64 strings in Postgres: Increases database size and degrades database performance.

---

## 5. WEBSOCKETS RECOVERY FLOW

- **Decision**: Edge clients implement automatic reconnection loops with exponential backoff and connection state ping/pong heartbeats.
- **Rationale**: 
  - Render free tier instances go to sleep or restart occasionally. Auto-reconnecting ensures the frontend reconnects to the WS gateway when the backend wakes up.
- **Alternatives Considered**:
  - Long polling: High database write rates and CPU usage.

---

## 6. OPTIMIZED DOCKER ORCHESTRATION

- **Decision**: Multi-stage docker builds separating compilation toolsets from final runner instances, with a python-native health check probe.
- **Rationale**: 
  - Multi-stage builds reduce final image size from 1.1GB to ~240MB, speeding up Render deployments.
  - Dynamic python health check (`urllib.request`) avoids installing `curl` or `wget` inside python runner containers.
- **Alternatives Considered**:
  - Fat single-stage images: Long build times, high registry transfer bandwidth, and larger vulnerability surface.
