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

## 9. Contributors & License

- **Ayush** ([GitHub profile](https://github.com/Ayush-iuse))
- **License**: MIT License
