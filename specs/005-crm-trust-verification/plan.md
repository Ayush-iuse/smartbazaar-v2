# Implementation Plan: SmartBazaar V2 Seller CRM, Buyer Trust Engine & Verification Platform

**Branch**: `005-crm-trust-verification` | **Date**: 2026-06-24 | **Spec**: [/specs/005-crm-trust-verification/spec.md](file:///e:/PPT/jio%20internship/cart/specs/005-crm-trust-verification/spec.md)

**Input**: Feature specification from `/specs/005-crm-trust-verification/spec.md`

---

## Summary

The objective of this phase is to implement a Seller CRM, Buyer Trust Engine, Verification Platform, and associated Risk Detection & Analytics engines for SmartBazaar AI.
- **CRM Engine**: Implements pipeline stages (New, Interested, Engaged, Negotiating, etc.) mapping each buyer conversation to a sales lead.
- **Lead Score Engine**: Computes purchase intent (0-100) based on message frequency, offer count, response speed, listing views, and wishlist activity.
- **Trust Engine**: Measures buyer reliability (0-100) based on completed/cancelled transactions, reports, and response rate.
- **Verification System**: Offers email, phone, and Government ID verification channels to display trust badges platform-wide.
- **Risk Engine**: Monitors duplicate spam floods and blacklist keyword matches (Western Union, Crypto links, etc.).

---

## Technical Context

**Language/Version**: Python 3.10+ (Backend), TypeScript 5.4+ (Frontend)

**Primary Dependencies**: FastAPI 0.110.0, SQLAlchemy 2.0.28, Pydantic V2, Zustand 4.5.2, Next.js 14.2.35, Lucide React

**Storage**: SQLite (SQLAlchemy declarative models, local file `db.sqlite3`), Local file system storage for KYC documents (under `/uploads/verification`), Redis (utilizing `InMemoryRedis` fallback cache locally)

**Testing**: pytest (with pytest-asyncio and HTTPX test client)

**Target Platform**: Local container development (orchestrated by Docker Compose)

**Project Type**: Monolithic web service (FastAPI JSON API + Next.js client-side application)

**Performance Goals**: CRM dashboards aggregate database records in under 200ms; score recalculations run as decoupled operations completing within 2 seconds.

**Constraints**: Must run entirely in offline-compatible environments with zero external paid cloud SaaS subscriptions.

**Scale/Scope**: 11 new database tables, 20+ database indexes, 4 pages, 10 UI components.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **P1: Security First (Rate Limiting & Inputs Checks)**:
  - All incoming payload boundaries (OTP length, lead notes size limits, document sizes up to 5MB) will be validated by Pydantic V2 schemas.
  - Verification OTP routes (requests/resets) will utilize endpoint rate limiting.
  - Document viewing routes will verify session owner and roles (moderator vs. seller).
- **P2: Explainable AI & P3: AI Transparency**:
  - The Lead Score card and Risk assessment modules will display calculation parameters (inputs weight distribution) alongside confidence scores.
- **P9: Internship Scope (Zero paid cloud dependencies)**:
  - Phone verification uses a simulated local OTP service (logs OTP to output).
  - Document storage stores files locally under `/uploads/verification` instead of AWS S3.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-crm-trust-verification/
├── plan.md              # This file (planning output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── api_contracts.md # API endpoint payload schemas
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/          # SQLAlchemy schemas (lead_status, seller_verification, etc.)
│   ├── routers/         # REST API routers (crm, trust, verification, risk, analytics)
│   ├── schemas/         # Pydantic schemas (crm, trust, verification)
│   └── services/        # Service logic (crm_service, trust_score_service, lead_score_service)
└── tests/
    ├── integration/     # Integration tests checking CRM updates & verification flow
    ├── unit/            # Unit tests checking risk rules and score calculations
    └── conftest.py      # Database setup & authentication fixtures

frontend/
├── src/
│   ├── app/
│   │   ├── crm/         # Pages for /crm, /crm/leads, /crm/buyers
│   │   └── verification/# Verification request page
│   ├── components/      # UI components (LeadCard, LeadPipeline, TrustScoreCard, Timeline)
│   └── stores/          # Zustand state store integrations
```

**Structure Decision**: Web application layout containing backend FastAPI project and Next.js frontend pages.

---

## Complexity Tracking

No violations found. The architecture leverages local relational schema structures, simple mock components, and standard state management.
