# Implementation Plan: SmartBazaar AI Core

**Branch**: `001-smartbazaar-core` | **Date**: 2026-06-15 | **Spec**: [specs/001-smartbazaar-core/spec.md](file:///E:/PPT/jio%20internship/cart/specs/001-smartbazaar-core/spec.md)

**Input**: Feature specification from `/specs/001-smartbazaar-core/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command.

## Summary
SmartBazaar AI is a local peer-to-peer marketplace with AI-assisted features (description generation, category prediction, price recommendation, and fraud detection). The technical approach uses a monolithic FastAPI backend for data persistence and AI orchestration, and a Next.js 15 (TypeScript, TailwindCSS, ShadCN UI) frontend for a premium, interactive user interface.

## Technical Context

**Language/Version**: Python 3.11+, TypeScript Node 20+

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, PyJWT, passlib, OpenAI, Next.js 15, TailwindCSS, Lucide React, ShadCN UI

**Storage**: SQLite (MVP) with SQLAlchemy ORM

**Testing**: pytest (backend)

**Target Platform**: Local development via Docker Compose (Linux/Windows)

**Project Type**: Web application (Frontend + Backend)

**Performance Goals**: Frontend rendering < 500ms, search responses < 200ms, AI features < 3 seconds

**Constraints**: Single developer, 5–7 days, no paid external hosting (local Docker Compose only), robust fallback engine when OpenAI keys are missing

**Scale/Scope**: Local peer-to-peer listing platform (MVP)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Security First**: Client inputs validated via Pydantic; parameterized queries enforced via SQLAlchemy ORM; passwords hashed with bcrypt; JWT token storage handled securely. (Pass)
- **AI Transparency**: Response payloads for AI features indicate they are recommendations and must be labeled clearly in the UI. (Pass)
- **Privacy**: No user email/personal contact exposed in public endpoints; communication occurs strictly through local dummy chat. (Pass)
- **Simplicity**: Monolithic architecture; no microservices. (Pass)
- **Internship Scope / Working Software**: Simplest SQLite database and dummy chat without websockets; mock fallback engine for AI if API keys are missing. (Pass)

## Project Structure

### Documentation (this feature)

```text
specs/001-smartbazaar-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Quality checklist
└── contracts/
    └── api.md           # API Contracts
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── listing.py
│   │   └── message.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── listings.py
│   │   ├── search.py
│   │   └── ai.py
│   ├── services/
│   │   ├── ai_service.py
│   │   └── auth_service.py
│   └── utils/
│       ├── jwt.py
│       └── validation.py
├── requirements.txt
└── Dockerfile

frontend/
├── pages/ (or app/)
├── components/
├── hooks/
├── lib/
├── styles/
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Structure Decision**: Web application option chosen to cleanly separate FastAPI backend API and Next.js frontend application.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution check violations were identified. The design strictly follows the rules of the SmartBazaar AI Constitution.
