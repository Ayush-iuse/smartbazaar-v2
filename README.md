# SmartBazaar V2 – AI-Enhanced P2P Marketplace

SmartBazaar V2 is an investor-demo ready, premium P2P marketplace featuring an intelligent AI Marketplace Copilot, real-time chat, security analysis safeguards, and built-in CRM/moderation analytics.

---

## 1. Project Overview

SmartBazaar V2 bridges the gap between traditional listing platforms and modern interactive agents. The platform empowers users to search, query, compare, and negotiate listings using natural language interfaces guided by real-time safety, spam, and fraud analysis calculations.

---

## 2. Core Features

- **AI Marketplace Copilot**: A Perplexity/Rufus inspired natural language shopping assistant to discover listings, advice budgets, and run specifications comparisons.
- **Precalculated Trust Engine**: Dynamic calculations computed on the fly are cached asynchronously into structured buyer/seller rankings, eliminating N+1 queries.
- **Negotiations and Offers Flow**: Custom offer creation, status changes (Accepted, Countered, Rejected), and interactive real-time offer tracking inside the chat panels.
- **Moderation Queue & Admin Dashboard**: Dedicated `/admin` route providing oversight on users, reports, listings, and verification document approvals.
- **Security & Integrity Controls**: Stringent permission checks preventing admin privilege escalation, composite unique database constraints to prevent duplicate chat threads, and automatic spam/rate-limit tracking.

---

## 3. Technology Stack

- **Backend**: Python FastAPI, SQLAlchemy ORM, Uvicorn, Pydantic, Pytest.
- **Frontend**: React, Next.js, Tailwind CSS, TypeScript, WebSockets.
- **Database**: PostgreSQL (Docker Compose default), SQLite (Local script fallback / in-memory testing).
- **Caching & Limiting**: Redis, InMemoryRedis.

---

## 4. Folder Structure

```text
├── .agents/             # System agent custom configuration
├── backend/             # Python FastAPI backend service
│   ├── app/             # Application source folder
│   │   ├── models/      # SQLAlchemy database schema models
│   │   ├── routers/     # API controllers and routers
│   │   ├── schemas/     # Pydantic validation schemas
│   │   └── services/    # Business services and agents
│   └── tests/           # Integration & unit test suites
├── docs/                # Project API and design documentation
├── frontend/            # React/Next.js frontend application
│   ├── public/          # Static asset files
│   └── src/app/         # Next.js routers and components
├── docker-compose.yml   # Multi-container orchestra docker file
└── README.md            # Main project document
```

---

## 5. Quick Start Guide

### A. Environment Variables Setup
Create a `.env` file at the root directory based on `.env.example`:
```bash
cp .env.example .env
```

| Variable Name | Default Placeholder Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres_secure_pass@db:5432/smartbazaar` | Database connection URL |
| `JWT_SECRET` | `supersecretkeychangeinproduction12345!` | Secret used to sign JWTs |
| `OPENAI_API_KEY` | `your-openai-api-key` | Token to enable GPT marketplace advice |

### B. Docker Compose Startup (All Services)
1. Build and run containers:
   ```bash
   docker compose up --build -d
   ```
2. Re-initialize tables and seed database:
   ```bash
   docker exec -it smartbazaar-backend python app/seed.py
   ```
3. Open `http://localhost:3000` to browse listings!

---

## 6. Running Locally (Development Mode)

If running outside Docker Compose containers:

### Backend Setup
1. Enter backend folder and active virtual env:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run seeding script:
   ```bash
   python app/seed.py
   ```
4. Start dev server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Enter frontend folder:
   ```bash
   cd frontend
   npm install
   ```
2. Build or start development compilation:
   ```bash
   npm run dev
   ```

---

## 7. Testing
Backend testing is executed inside an in-memory SQLite connection to ensure fast and non-locking runs:
```bash
python -m pytest backend/tests/
```

---

## 8. Detailed Documentation

- **[System Architecture Guide](docs/Architecture.md)**
- **[API reference endpoints](docs/API.md)**
- **[Database schemas & relationships](docs/Database.md)**
- **[Deployment procedures](docs/Deployment.md)**
- **[Testing protocols](docs/Testing.md)**

---

## 9. V2 Production Deployment & Cloud Migration Guide

This guide details the end-to-end architecture, environment configuration, database migration, and troubleshooting steps for deploying SmartBazaar V2 to cloud providers.

### A. Production Architecture
The platform is designed to be fully cloud-native, decoupling service layers to run on the following managed platforms:
- **Frontend App**: Vercel (Next.js serverless architecture)
- **API Services**: Railway (FastAPI containerized application)
- **Database Engine**: Neon PostgreSQL (Serverless relational database)
- **Cache & Presence Storage**: Upstash Redis (Serverless TLS-enabled key-value cache)
- **Media Assets Storage**: Cloudinary (Cloud-based optimized file storage)

```mermaid
graph TD
    Client[Next.js Frontend on Vercel] -->|HTTP / JSON| API[FastAPI Backend on Railway]
    Client -->|WebSocket| API
    API -->|SQL Queries| DB[Neon PostgreSQL Database]
    API -->|TLS Caching| Cache[Upstash Redis Cache]
    API -->|File Uploads| Cloudinary[Cloudinary Media CDN]
    Client -->|Media URLs| Cloudinary
```

### B. Production Environment Setup

#### Backend Environment Variables (Railway)
Configure the following environment variables in the Railway service settings:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Dynamic port bound by Railway | `8000` (auto-configured by Railway) |
| `DATABASE_URL` | Cloud Postgres connection string | `postgresql://user:pass@host.neon.tech/dbname` |
| `DB_SSL_MODE` | Postgres SSL connection setting | `require` |
| `REDIS_URL` | Upstash Redis connection string (TLS) | `rediss://:pass@host.upstash.io:6379` |
| `JWT_SECRET` | Cryptographically secure token secret | `generate-random-hex-string` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | `my-cloudinary-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `secret-key-placeholder` |
| `CORS_ORIGINS` | Permitted cross-origin endpoints | `https://your-vercel-domain.vercel.app` |

#### Frontend Environment Variables (Vercel)
Configure the following environment variables in the Vercel project settings:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Absolute URL of the Railway backend | `https://your-backend-railway-app.railway.app` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL of the Railway backend | `wss://your-backend-railway-app.railway.app` |
| `NEXT_PUBLIC_CLOUDINARY_NAME` | Cloudinary Cloud Name | `my-cloudinary-cloud` |

### C. Migration Procedures

#### 1. Database Seeding & Migrations
To migrate and seed the remote production Postgres database:
1. Ensure the `DATABASE_URL` matches your cloud Postgres provider (e.g. Neon).
2. Run database migration tools or execute the seeding script. Locally, you can trigger seeding on the remote DB using your local python environment:
   ```bash
   DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require" py -m backend.app.seed
   ```
3. Alternatively, run the database seed from the Railway backend container terminal:
   ```bash
   python app/seed.py
   ```

#### 2. Media Upload Migration
No file migration is required! Since the application code supports dual storage (local folder vs Cloudinary), all older files will continue to be fetched from their original URL references. New file uploads automatically route to Cloudinary.

### D. Verification & Health Monitoring
- **Backend Health Check**: Railway supports setting up dynamic TCP/HTTP probes. Configure health checks pointing to the `/health` endpoint on port `8000` (or `PORT`).
- **Telemetry Dashboard**: Access the built-in observability features under `/metrics` to view server memory stats, request timing summaries, and error logs.

### E. Rollback Procedure
If a production deployment encounters issues:
1. **Frontend**: Go to the Vercel Dashboard, select the project, view **Deployments**, choose the last stable deployment, and click **Redeploy** > **Promote to Production**.
2. **Backend**: In the Railway interface, select the backend service, view the **Deployments** history, select the last stable container tag, and click **Rollback**.
3. **Database**: If a database schema needs to be rolled back, execute Alembic down-migration scripts or restore the automatic daily backup snapshot via the Neon console.

### F. Troubleshooting Common Issues
- **WebSocket Connection Failure**: Ensure that `NEXT_PUBLIC_WS_URL` starts with `wss://` on production and `ws://` on local development. Check that the backend CORS configuration (`CORS_ORIGINS`) allows the frontend domain.
- **Neon DB Connection Timeout**: Ensure `DB_SSL_MODE` is set to `require` and check connection pooling settings in the environment variables.
- **Upstash Connection Errors**: If Upstash connection fails, the backend will automatically log warnings and fall back to `InMemoryRedis`. Check that the `REDIS_URL` uses the `rediss://` protocol prefix for secure TLS handshake.

---

## 10. Contributors & License

- **Ayush** ([GitHub profile](https://github.com/Ayush-iuse))
- **License**: MIT License

