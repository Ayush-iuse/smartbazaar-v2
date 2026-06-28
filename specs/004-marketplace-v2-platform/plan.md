# Implementation Plan: SmartBazaar V2 — Production Marketplace Platform

**Branch**: `004-marketplace-v2-platform` | **Date**: 2026-06-23 | **Spec**: [spec.md](file:///e:/PPT/jio%20internship/cart/specs/004-marketplace-v2-platform/spec.md)

**Input**: Feature specification from `/specs/004-marketplace-v2-platform/spec.md`

## Summary
The goal of SmartBazaar V2 is to transition from a CRUD listing directory into a production-grade peer-to-peer (P2P) marketplace. The technical approach centers on building:
1. **Real-time WebSockets Messaging**: Scalable connection manager with presence, typing states, and message receipts.
2. **Seller CRM & Analytics**: Conversion funnel tracking, pipeline management, and user interaction capture.
3. **Trust & Verification Engines**: Scoring jobs calculating metrics asynchronously, with structured user verification flows (Email, Phone, Government ID upload).
4. **AI Marketplace Copilot**: A conversational search drawer powered by OpenAI/Gemini with local deterministic fallbacks for offline execution.
5. **Personalized Feeds**: High-performance recommendations (trending, nearby, content-based recommendations) cached using Redis.
6. **WebGL 3D Visual Experience**: A lightweight 3D landing page featuring a spinning trade globe and category-specific GLTF models, styled with Framer Motion and backed by mobile fallbacks.
7. **Session Security Framework**: Short-lived JWTs, Refresh Token Rotation (RTR), device logs, and brute-force IP rate-limiting.

---

## Technical Context

**Language/Version**: Python 3.10.x (Backend), TypeScript 5.x & Node.js 18+ (Frontend)

**Primary Dependencies**:
* **Backend**: FastAPI, SQLAlchemy 2.x, Pydantic V2, WebSockets, Pytest, PyYAML, Python-Jose (JWT), Bcrypt, Asyncpg.
* **Frontend**: React 18, Next.js 14, Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`), Framer Motion, Zustand (State), TailwindCSS.

**Storage**: PostgreSQL (Primary Relational DB), SQLite (Dev Fallback), Redis (Presence status cache, unread counters, and rate-limiting store).

**Testing**: Pytest, Pytest-Asyncio, Jest, React Testing Library, Playwright (E2E/WebSocket simulation).

**Target Platform**: Linux Server / Dockerized Container (Docker Compose local runtime orchestrations).

**Project Type**: Web Application (Decoupled Frontend + Backend Monolith).

**Performance Goals**:
* WebSocket message transit propagation latency < 150ms.
* Recommendation home feeds query load time < 200ms.
* 3D WebGL scenes render at >= 45 FPS on WebGL-supported devices.

**Constraints**:
* Must compile, build, and run 100% offline locally.
* Zero cloud service dependencies for core execution.
* Short access token lifespans (15 mins) and single-use rotated refresh tokens.

**Scale/Scope**:
* 10 new database tables.
* 15+ REST endpoints + 1 unified WebSocket endpoint.
* Dual buyer/seller workspaces, CRM dashboard, and admin moderation portal.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Details / Compliance Proof |
| :--- | :---: | :--- |
| **Principle 1: Security First** | ✅ Compliant | Short-lived Access Tokens, Refresh Token Rotation (RTR), Bcrypt hashing, Pydantic V2 input validation, SQLAlchemy ORM parameterization, and IP rate-limiting on login routes. |
| **Principle 2: Explainable AI** | ✅ Compliant | The AI Copilot schema returns a structured JSON payload containing the `recommendation`, `confidence` score (0-100), and natural language `explanation`. |
| **Principle 3: AI Transparency**| ✅ Compliant | All AI outputs display an "AI Generated Suggestion" badge. Mutations (such as accepting recommended listings or offers) require explicit user approval. |
| **Principle 4: Agent Mapping** | ✅ Compliant | The implementation task lists will divide components among specified agents (Seller Copilot Agent, Buyer Agent, QA Agent, Search Agent, etc.). |
| **Principle 5: Intelligence** | ✅ Compliant | Calculates Listing Health Scores, Sale Probability rates, Category Competition metrics, and tracks historical demand trends. |
| **Principle 6: User Experience**| ✅ Compliant | Mobile-first layout with Framer Motion transitions, responsive buttons, skeleton loaders, and touch-optimized navigation drawers. |
| **Principle 7: Theme Consistency**| ✅ Compliant | Persists Light, Dark, and System Preferences via `localStorage` to prevent page load flickers. |
| **Principle 8: SDLC Flow** | ✅ Compliant | Follows the required lifecycle: spec.md is finalized -> plan.md is established -> design artifacts are generated -> tasks.md is created -> implementation follows checklist. |
| **Principle 9: Internship Scope**| ✅ Compliant | Relies on local SQLite/Postgres and local model fallbacks. Runs entirely within local Docker containers without cloud licensing. |
| **Principle 10: Working Software**| ✅ Compliant | If API keys are missing or the API is unreachable, the Copilot falls back to a deterministic rules-based search matching engine. |

---

## Project Structure

### Documentation (This Feature)
```text
specs/004-marketplace-v2-platform/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical design research
├── data-model.md        # Relational and Cache data layouts
├── quickstart.md        # Feature validation scenarios
└── contracts/           # API contracts and WebSocket schemas
    ├── rest.md          # REST API contracts
    └── websocket.md     # WebSocket schema payloads
```

### Source Code
```text
backend/
├── app/
│   ├── models/          # SQLAlchemy database models
│   ├── schemas/         # Pydantic schemas (V2 validation bounds)
│   ├── routers/         # FastAPI endpoint routers
│   ├── services/        # Business logic services (chat, CRM, trust, security)
│   ├── repositories/    # Database query abstraction layers
│   ├── core/            # Security, configuration, and middleware
│   └── main.py          # Application gateway and WebSocket server
└── tests/
    ├── unit/            # Backend unit tests
    ├── integration/     # Service and router integration tests
    └── websocket/       # WebSocket concurrency and flow tests

frontend/
├── public/
│   └── assets/          # Static assets (3D GLTF/GLB models: Laptop.glb, Car.glb, etc.)
├── src/
│   ├── components/      # UI components (3D Globe, CRM lead list, Copilot chat)
│   ├── pages/           # Next.js workspace views and layouts
│   ├── services/        # Fetch API clients and WebSocket wrappers
│   ├── stores/          # Zustand states (chat store, theme selector)
│   └── styles/          # TailwindCSS global classes
└── tests/
    ├── components/      # React testing library files
    └── e2e/             # Playwright browser automation tests
```

**Structure Decision**: Monolith setup using standard decoupled directories `backend/` and `frontend/` matching the project standard.

---

## Complexity Tracking

*No current violations. The architecture remains aligned with the Monolith and Local-First constraints defined in the Project Constitution.*

---

**Version**: 1.0.0 | **Ratified**: Pending | **Last Amended**: 2026-06-23
