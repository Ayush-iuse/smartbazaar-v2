# Tasks: V2 CRM, Trust Engine & Verification Platform

**Input**: Design documents from `/specs/005-crm-trust-verification/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are written first for each phase as requested by the test requirements.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create specs folders structure and verify files presence in specs/005-crm-trust-verification/
- [ ] T002 Verify local python packages installation in backend/requirements.txt

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database tables, indexes, and migrations that must be complete before any user story can be implemented

- [ ] T003 [P] Create SQLAlchemy models for lead status and score in backend/app/models/crm.py
- [ ] T004 [P] Create SQLAlchemy models for trust score and events in backend/app/models/trust.py
- [ ] T005 [P] Create SQLAlchemy models for seller verification and documents in backend/app/models/verification.py
- [ ] T006 [P] Create SQLAlchemy models for crm activities, timeline, and risk in backend/app/models/crm_analytics.py
- [ ] T007 [P] Create database migration script using Alembic in backend/alembic/versions/v2_crm_trust_verification_tables.py
- [ ] T008 [P] Update seeding script to include CRM activities and default user trust records in backend/app/seed.py

**Checkpoint**: Foundation ready - database layer is fully migrated and seeded.

---

## Phase 3: User Story 1 - Seller CRM & Lead Dashboard (Priority: P1) 🎯 MVP

**Goal**: Implement the core CRM pipeline, dashboard endpoints, buyer notes, and lead score calculations.

**Independent Test**: Create active chat buyer threads, verify the seller CRM loads leads list, calculates intent lead scores, and handles private annotations correctly.

### Tests for User Story 1
- [ ] T009 [P] [US1] Write integration tests checking CRM dashboard data aggregation and notes API in backend/tests/integration/test_crm_flow.py

### Implementation for User Story 1
- [ ] T010 [P] [US1] Implement LeadScoreService and calculation rules (wishlist, messages, account age) in backend/app/services/lead_score_service.py
- [ ] T011 [P] [US1] Create Pydantic validation schemas for crm dashboard in backend/app/schemas/crm.py
- [ ] T012 [P] [US1] Implement CRMService logic (leads querying, stage transitions, notes management) in backend/app/services/crm_service.py
- [ ] T013 [US1] Create CRM API router endpoints in backend/app/routers/crm.py
- [ ] T014 [US1] Register CRM routers in main routes mapping file backend/app/main.py
- [ ] T015 [P] [US1] Create Next.js Zustand CRM store for state synchronization in frontend/src/stores/crmStore.ts
- [ ] T016 [P] [US1] Build LeadCard and LeadPipeline UI components in frontend/src/components/LeadPipeline.tsx
- [ ] T017 [P] [US1] Build LeadDetailsDrawer and private notes/labels panels in frontend/src/components/LeadDetailsDrawer.tsx
- [ ] T018 [US1] Build main CRM workspace dashboard page in frontend/src/app/crm/page.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Buyer Trust Score & Reputation Profile (Priority: P2)

**Goal**: Measure buyer transaction history and reliability tiers, presenting trust indicators during chats.

**Independent Test**: Verify trust scores degrade on cancellations/spam flags and display correct Elite/Trusted badges on frontend headers.

### Tests for User Story 2
- [ ] T019 [P] [US2] Write unit tests checking completed/cancelled deals scoring rules in backend/tests/unit/test_trust_score.py

### Implementation for User Story 2
- [ ] T020 [P] [US2] Implement TrustScoreService (completed/cancelled transactions, reports, response rate) in backend/app/services/trust_score_service.py
- [ ] T021 [P] [US2] Create Pydantic validation schemas for trust scores in backend/app/schemas/trust.py
- [ ] T022 [US2] Create Trust API router endpoints in backend/app/routers/trust.py
- [ ] T023 [P] [US2] Create TrustScoreCard and TrustBadge frontend components in frontend/src/components/TrustScoreCard.tsx
- [ ] T024 [US2] Integrate Trust badges into chat headers and info cards in frontend/src/components/ChatHeader.tsx

**Checkpoint**: User Story 2 is fully complete and displays trust badges.

---

## Phase 5: User Story 3 - Seller Verification System (Priority: P3)

**Goal**: Provide verification flows (email/phone OTPs and document uploads) with visual verification badge representation.

**Independent Test**: Verify OTP validation works, and admin queues can retrieve uploaded documents securely to grant badges.

### Tests for User Story 3
- [ ] T025 [P] [US3] Write integration tests checking document upload and admin approval in backend/tests/integration/test_verification.py

### Implementation for User Story 3
- [ ] T026 [P] [US3] Implement VerificationService (email OTP check, simulated local SMS OTP logs) in backend/app/services/verification_service.py
- [ ] T027 [P] [US3] Create Pydantic schemas for OTPs and uploaded documents in backend/app/schemas/verification.py
- [ ] T028 [US3] Create Verification API endpoints supporting document uploads in backend/app/routers/verification.py
- [ ] T029 [P] [US3] Create VerificationStatusCard and VerificationBadge components in frontend/src/components/VerificationStatusCard.tsx
- [ ] T030 [US3] Implement Verification request and upload pages in frontend/src/app/verification/page.tsx

**Checkpoint**: User Story 3 is complete and badges show on seller profiles.

---

## Phase 6: Risk & Fraud Engine (Cross-cutting)

**Purpose**: Automatically identify suspicious buyer actions and spammers.

- [ ] T031 [P] Write unit tests checking keyword spam block rules in backend/tests/unit/test_risk_engine.py
- [ ] T032 [P] Implement RiskEngineService (risk scores, blocked chat events) in backend/app/services/risk_engine_service.py
- [ ] T033 [P] Create risk assessment API endpoints under backend/app/routers/risk.py
- [ ] T034 Build RiskIndicator widget and timeline warning cards in frontend/src/components/RiskIndicator.tsx

---

## Phase 7: Analytics & Conversion Dashboard (Cross-cutting)

**Purpose**: Deliver conversion analysis metrics to marketplace sellers.

- [ ] T035 [P] Write tests checking conversion analytics pipeline in backend/tests/integration/test_analytics.py
- [ ] T036 [P] Implement AnalyticsService (funnel rate, response time, potential revenue) in backend/app/services/analytics_service.py
- [ ] T037 [P] Create analytics reporting API endpoints under backend/app/routers/crm_analytics.py
- [ ] T038 Build CRMAnalytics dashboards page in frontend/src/app/crm/analytics/page.tsx

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Global quality validation, responsiveness, and theme check validations

- [ ] T039 [P] Support Dark/Light themes consistency checks across all new CRM layouts in frontend/src/styles/globals.css
- [ ] T040 [P] Verify Next.js compilation runs cleanly using npm run build command
- [ ] T041 Run quickstart.md validation guide end-to-end scenarios checks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phases 3, 4, 5)**: Depend on Foundational phase completion. Can run in parallel.
- **Risk & Analytics Engines (Phases 6, 7)**: Depend on User Stories completion.
- **Polish (Phase 8)**: Depends on all implementation phases.

### User Story Dependencies

- **US1 (CRM Dashboard)**: Core MVP. Requires database tables.
- **US2 (Trust Score)**: Can start after foundation. Connects into chat headers in US1.
- **US3 (Verification)**: Can start after foundation. Displays badges in listings.

---

## Parallel Example: User Story 1

```bash
# Launch models creation in parallel:
Task T003: "Create SQLAlchemy models for lead status and score in backend/app/models/crm.py"
Task T004: "Create SQLAlchemy models for trust score and events in backend/app/models/trust.py"

# Build services in parallel:
Task T010: "Implement LeadScoreService in backend/app/services/lead_score_service.py"
Task T011: "Create Pydantic validation schemas in backend/app/schemas/crm.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Database tables & Alembic migrations)
3. Complete Phase 3: User Story 1 (CRM Dashboard APIs + Next.js Workspace UI)
4. **STOP and VALIDATE**: Run manual E2E validation Scenario A.

### Incremental Delivery

1. Complete Setup + Foundational -> Backend DB layer ready.
2. Complete User Story 1 -> Deliver CRM pipeline (MVP!).
3. Complete User Story 2 -> Add trust scoring badges.
4. Complete User Story 3 -> Add Verification request pages.
5. Complete Risk & Analytics -> Polish performance and cross-cutting layouts.

---

## Notes

- [P] tasks = different files, no dependencies.
- Commit code after completing each task checklist item.
- Ensure all tests run and pass locally before deployment updates.
