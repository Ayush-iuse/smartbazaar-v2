# Deployment Guide: SmartBazaar V2

This document details the environment configuration, initialization steps, and Docker deployment guidelines for putting the SmartBazaar marketplace platform into production.

---

## 1. Environment Setup

Copy `.env.example` to `.env` at the repository root and fill out the configuration placeholders:

```bash
cp .env.example .env
```

### Production Configuration Parameters
- **`DATABASE_URL`**: Remote PostgreSQL database URL connection string.
- **`JWT_SECRET`**: A strong, cryptographically secure random string used to sign user access tokens.
- **`OPENAI_API_KEY`**: Optional OpenAI token. If omitted, the marketplace copilot gracefully falls back to local NLP rules and regex parsers.

---

## 2. Docker Compose Deployment (Recommended)

SmartBazaar comes fully containerized with Docker, mounting PostgreSQL database and frontend next.js build servers.

### Step A: Build & Start Services
Run Docker Compose in detached daemon mode:
```bash
docker compose up --build -d
```

This commands spins up:
- **`smartbazaar-db`**: PostgreSQL relational database (listening on port 5432).
- **`smartbazaar-backend`**: FastAPI application service (listening on port 8000).
- **`smartbazaar-frontend`**: Next.js client application (listening on port 3000).

### Step B: Database Seeding
To populate initial mockup users, listings, offers, and chat history into PostgreSQL:
```bash
docker exec -it smartbazaar-backend python app/seed.py
```

### Step C: Verify Services
Check logs of backend/frontend services to ensure clean startup:
```bash
docker compose logs -f backend
```

---

## 3. Local Production Deployment (Outside Docker)

If deploying directly on raw VMs or baremetal servers:

### A. Run Database
Ensure PostgreSQL server is running and database schema is created:
```sql
CREATE DATABASE smartbazaar;
```

### B. Launch Python Backend
1. Initialize Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Initialize schemas and populate database:
   ```bash
   python backend/app/seed.py
   ```
4. Run server via Uvicorn:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### C. Launch Frontend Client
1. Enter frontend folder:
   ```bash
   cd frontend
   ```
2. Install Node packages and compile production bundle:
   ```bash
   npm install
   npm run build
   ```
3. Start frontend production server:
   ```bash
   npm run start -- -p 3000
   ```
