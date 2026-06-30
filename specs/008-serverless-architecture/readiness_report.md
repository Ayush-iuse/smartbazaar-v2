# Deployment Blocker & Readiness Report: SmartBazaar V3

This report lists all infrastructure, dependency, and code blockers preventing serverless deployment on Vercel, along with their resolution paths.

---

## 1. DETECTED BLOCKERS & ARCHITECTURE DEVIATIONS

### Blocker 1: Persistent WebSocket Manager
* **Status**: **BLOCKING SPRINT 2**
* **Finding**: `backend/app/routers/chat.py` maintains a persistent in-memory `ConnectionManager` class to trace active WebSocket state and push messages. In Vercel serverless execution, state is ephemeral; serverless functions spin down after execution, which will drop WebSocket connections.
* **Resolution**: Replace Python WebSockets with client-direct Supabase Realtime Channels.

### Blocker 2: Redis Presence & In-Memory State
* **Status**: **BLOCKING SPRINT 2**
* **Finding**: `backend/app/services/presence_manager.py` queries Redis (or local `InMemoryRedis`) to check active online user status.
* **Resolution**: Use Supabase Presence (broadcast tracking) on the frontend.

### Blocker 3: Long-Running Background Workers
* **Status**: **BLOCKING SPRINT 3**
* **Finding**: The application boots a background worker loop `JobService.run_worker()` on server startup in `backend/app/main.py` to process email digests and saved search triggers.
* **Resolution**: Replace the long-running worker loops with stateless serverless cron jobs (triggered via Vercel Cron jobs) or execute triggers inline.

### Blocker 4: Ephemeral Local Image Uploads
* **Status**: **BLOCKING SPRINT 3**
* **Finding**: The backend mounts a local filesystem static directory `/uploads` to store user-submitted listing images and documents. In serverless functions, files written to disk are deleted instantly on container spin-down.
* **Resolution**: Integrate Supabase Storage client directly from frontend.
