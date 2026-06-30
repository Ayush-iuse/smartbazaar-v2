# Deployment Readiness Report: SmartBazaar V2

This report documents the results of the project audit (DEP-001) and highlights deployment blockers, required fixes, environment dependencies, and migration requirements (DEP-002).

---

## 1. AUDIT FINDINGS (DEP-001)

### Hardcoded Localhost References
- **Status**: **RESOLVED**
- **Findings**:
  - Found hardcoded `http://localhost:8000` URLs in the frontend `MessageBubble.tsx` (rendering attachments) and `admin/page.tsx` (viewing seller verification documents).
- **Required Fix**: Replaced with dynamic URL resolution using `process.env.NEXT_PUBLIC_API_URL`.

### Hardcoded Secrets & API Keys
- **Status**: **RESOLVED**
- **Findings**:
  - No active API keys (OpenAI, Cloudinary) or database passwords are hardcoded in the codebase.
- **Required Fix**: Ensure all environment variable templates are populated for production administrators.

### Database & Caching Configurations
- **Status**: **RESOLVED**
- **Findings**:
  - Found `postgres://` connection string incompatibility with SQLAlchemy (common on Supabase and Railway hosts).
  - Lack of database connection pooling and SSL modes which can lead to connection dropouts on cloud hosts.
- **Required Fix**: Configured connection URL mapping (`postgres://` to `postgresql://`) and enabled SSL and pooling parameters inside `database.py`.

### WebSocket Connections
- **Status**: **RESOLVED**
- **Findings**:
  - Frontend chat stores had a hardcoded mapping to the HTTP base URL to parse WebSockets.
- **Required Fix**: Exposed `NEXT_PUBLIC_WS_URL` env variable support and integrated client-side auto-reconnection with exponential backoff timers.

---

## 2. PRODUCTION ENVIRONMENT SCHEMA (DEP-002)

To deploy SmartBazaar V2 to cloud environments successfully, the following infrastructure dependencies and environment variables must be declared:

### Backend Envs (Render Web Service)
- `PORT`: Web server binding port.
- `DATABASE_URL`: Connection string for Supabase PostgreSQL.
- `DB_SSL_MODE`: Connection encryption settings (`require`).
- `REDIS_URL`: Connection string for Upstash Redis.
- `JWT_SECRET`: Secret key for secure token signatures.
- `CORS_ORIGINS`: Allowed host origins (client URLs).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary API tokens.

### Frontend Envs (Vercel App)
- `NEXT_PUBLIC_API_URL`: Backend base API URL.
- `NEXT_PUBLIC_WS_URL`: Backend WebSockets endpoint URL.
- `NEXT_PUBLIC_CLOUDINARY_NAME`: Cloudinary cloud name.

### Migration Requirements
1. **Alembic migrations**: Apply schema changes dynamically via container startup task loops.
2. **Database seeding**: Seed default users and tags utilizing the automated seeding script `python app/seed.py`.
