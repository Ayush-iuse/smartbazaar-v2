# Implementation Plan: SmartBazaar Rental Marketplace

**Branch**: `010-rental-marketplace` | **Date**: July 6, 2026 | **Spec**: [spec.md](file:///e:/PPT/jio%20internship/cart/specs/010-rental-marketplace/spec.md)

**Input**: Feature specification from `/specs/010-rental-marketplace/spec.md`

---

## Summary

Expand the peer-to-peer buy-sell marketplace of SmartBazaar into a unified Buy, Sell, and Rent ecosystem modeled after Turo and Airbnb. This will be achieved by introducing dedicated rental listings relational models, PostgreSQL date overlap constraint checks, digital contract generators, deposit held ledger stores, and interactive availability calendars on the buyer/seller frontends.

---

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript 5.2 / Next.js 14 (Frontend)

**Primary Dependencies**: FastAPI, Pydantic V2, SQLAlchemy, Zustand, Framer Motion, Tailwind CSS

**Storage**: PostgreSQL (DB container)

**Testing**: Pytest (Backend API checks), Jest (Frontend components checks)

**Target Platform**: Dockerized container runtime deployment

**Project Type**: Web service / Web application

**Performance Goals**: Calendar availability queries under 100ms; booking overlap checks under 50ms at database check constraints.

**Constraints**: Local execution with zero cloud subscription dependencies; offline resilience using client-side caching.

**Scale/Scope**: 10+ rental categories, digital agreement generators, deposit hold managers, return inspection checklists.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Security First**: Input validations applied via strict Pydantic models. Zero raw SQL used; parameterized SQLAlchemy queries enforce type safety.
2. **Explainable AI**: The AI Rental Assistant returns a structured JSON payload containing the suggested pricing/deposit, a confidence score, and a natural language explanation statement.
3. **AI Transparency**: UI elements displaying AI suggestions carry explicit badge styling: `"AI Generated Suggestion"`. The user maintains final control to manually edit suggestions.
4. **Offline Capability**: Local static rules handle calculations if external OpenAI API integrations fail or are disconnected.

---

## Project Structure

The project conforms to the standard Next.js + FastAPI split repository layout:

```text
backend/
├── app/
│   ├── models/
│   │   └── rental.py        # NEW: SQLAlchemy schemas for rentals, bookings, contracts
│   ├── schemas/
│   │   └── rental.py        # NEW: Pydantic validators for requests
│   └── routers/
│       └── rental.py        # NEW: API routes for bookings, deposits, returns
└── tests/
    └── test_rentals.py      # NEW: Integration tests for overlapping booking conflicts

frontend/
├── src/
│   ├── components/
│   │   ├── RentalCalendar.tsx     # NEW: Interactive product page availability display
│   │   ├── ContractViewer.tsx     # NEW: Contract signature overlays
│   │   └── ReturnTracker.tsx      # NEW: Returns quality checklist tracking
│   └── app/
│       ├── buyer/
│       │   └── page.tsx           # MODIFY: Add Active Rentals tab list
│       ├── seller/
│       │   └── page.tsx           # MODIFY: Add Occupancy widgets & approvals
│       └── search/
│           └── page.tsx           # MODIFY: Add Rental duration filters
```

**Structure Decision**: Conforms to the standard single project multi-folder workspace (`backend/` + `frontend/`) monolith configuration.

---

## Sprint Breakdown & Timeline

### Sprint 1: Data Model, Migration & REST APIs
- Define PostgreSQL models for rental listings, calendars, bookings, and deposits.
- Generate and run Alembic migrations.
- Write FastAPI route endpoints for listing creation and booking reservations.

### Sprint 2: Availability Calendar & Locking Engine
- Implement atomic date intersection check constraints in PostgreSQL.
- Create `/rentals/{id}/calendar` routes.
- Build the Next.js `RentalCalendar` grid dashboard displaying available/blocked/seasonal dates.

### Sprint 3: Contracts, Deposit Ledger & Inspection Returns
- Generate Digital Contracts terms files.
- Track deposit transaction holds/releases.
- Build return inspector walkthrough lists.

### Sprint 4: AI Assistant, Dashboards & Micro-Interactions
- Add AI Price recommendations services with explainability tags.
- Refactor Buyer/Seller dashboard screens to display Active rentals.
- Apply 60 FPS transitions using Framer Motion.

---

## Rollback & Migration Plan

1. **Database Migration**:
   - Backward-compatible Alembic migration scripts.
   - All newly added columns are nullable or have defaults to avoid breaking existing listings rows.
2. **Rollback steps**:
   - Revert backend and frontend codebase commits.
   - Revert DB state: `alembic downgrade -1` to clean up the newly added tables.
