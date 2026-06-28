# Tasks: SmartBazaar AI Core

**Input**: Design documents from `/specs/001-smartbazaar-core/`

**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and base layout

- [ ] T001 Initialize Git repository and project folder structure in repo root
- [x] T002 Configure backend dependencies in backend/requirements.txt
- [x] T003 Configure Next.js dependencies in frontend/package.json
- [x] T004 Setup backend Docker service settings in backend/Dockerfile
- [x] T005 [P] Setup Next.js tailwind.config.js and tsconfig.json configurations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth/database plumbing that MUST be completed before user stories

- [x] T006 Initialize database connection and Session in backend/app/database.py
- [x] T007 [P] Create User database model in backend/app/models/user.py
- [x] T008 [P] Implement password hashing and validation logic in backend/app/services/auth_service.py
- [x] T009 [P] Create JWT encoding and validation utility handlers in backend/app/utils/jwt.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Secure Authentication (Priority: P0)

**Goal**: User sign-up, sign-in, JWT credentials verification, and protected routes.
**Independent Test**: Register and login via Swagger `/docs` and verify registration inputs.

- [x] T010 [US1] Create registration endpoint POST /api/auth/register in backend/app/routes/auth.py
- [x] T011 [US1] Create login endpoint POST /api/auth/login in backend/app/routes/auth.py
- [x] T012 [US1] Create current user profile endpoint GET /api/auth/me in backend/app/routes/auth.py
- [x] T013 [US1] Create react useAuth hook for state session tracking in frontend/hooks/useAuth.tsx
- [x] T014 [US1] Implement registration and login tabs interface on frontend login page in frontend/pages/login.tsx

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Listing Lifecycle Management (Priority: P0)

**Goal**: Complete CRUD listings pipeline for peer trading.
**Independent Test**: Spin up server, create a listing, modify details, delete it, and query via feed.

- [x] T015 [US2] Create Listing database model in backend/app/models/listing.py
- [x] T016 [US2] Create create listing endpoint POST /api/listings in backend/app/routes/listings.py
- [x] T017 [US2] Create details query endpoint GET /api/listings/{id} in backend/app/routes/listings.py
- [x] T018 [US2] Create update listing endpoint PUT /api/listings/{id} in backend/app/routes/listings.py
- [x] T019 [US2] Create delete listing endpoint DELETE /api/listings/{id} in backend/app/routes/listings.py
- [x] T020 [US2] Create listing queries hook in frontend/hooks/useListings.tsx
- [x] T021 [US2] Implement ListingCard component in frontend/components/ListingCard.tsx
- [x] T022 [US2] Implement index listing page listing feed in frontend/pages/index.tsx
- [x] T023 [US2] Implement detail view interface for listing items in frontend/pages/listing/[id].tsx

**Checkpoint**: User Stories 1 and 2 are fully integrated and testable.

---

## Phase 5: User Story 3 - Listing Search & Filtering (Priority: P0)

**Goal**: Product search queries filter by title, category, and location.
**Independent Test**: Input search tags and verify correct listing results.

- [x] T024 [US3] Create filtered search API endpoint GET /api/search in backend/app/routes/search.py
- [x] T025 [US3] Implement SearchBar component on frontend in frontend/components/SearchBar.tsx
- [x] T026 [US3] Build search results page UI layout in frontend/pages/search.tsx

**Checkpoint**: Listings query filtering is fully integrated.

---

## Phase 6: User Story 4 - AI-Powered Listing Enhancements (Priority: P1)

**Goal**: Autocomplete description from keywords, recommend prices, predict categories.
**Independent Test**: Verify autocomplete fields trigger in listings creator panel.

- [x] T027 [US4] Implement OpenAI / fallback integration in backend/app/services/ai_service.py
- [x] T028 [US4] Create AI endpoints POST /api/ai/describe, predict-category, recommend-price in backend/app/routes/ai.py
- [x] T029 [US4] Create listing creator editor form interface in frontend/pages/create-listing.tsx
- [x] T030 [US4] Implement AI assistant recommendation panel component in frontend/pages/create-listing.tsx

**Checkpoint**: AI-assisted listing suggestions are functional.

---

## Phase 7: User Story 5 - AI Fraud Detection (Priority: P1)

**Goal**: Scan listings for trigger scam phrases and display risk metrics.
**Independent Test**: Input listings containing flag phrases and verify score displays.

- [x] T031 [US5] Implement listing validation scanner logic in backend/app/routes/ai.py
- [x] T032 [US5] Implement fraud score badge component on detail page frontend/pages/listing/[id].tsx

**Checkpoint**: Trust and risk indicators are visible to buyers.

---

## Phase 8: User Story 6 - Seller-Buyer Localized Chat (Priority: P2)

**Goal**: Local mock seller chats and auto-replies.
**Independent Test**: Start messaging conversation and confirm seller reply returns after 2 seconds.

- [x] T033 [US6] Create Message database model in backend/app/models/message.py
- [x] T034 [US6] Implement chat messaging API endpoints in backend/app/routes/listings.py
- [x] T035 [US6] Implement message background task for canned auto-reply in backend/app/services/ai_service.py
- [x] T036 [US6] Create ChatBox component on detail page in frontend/pages/listing/[id].tsx

**Checkpoint**: Seller-buyer message loops are fully interactive.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, orchestration, and validation tests.

- [x] T037 Setup multi-container build configuration in docker-compose.yml
- [ ] T038 Create local database seeding scripts in backend/app/seed.py
- [ ] T039 Implement comprehensive developer guidelines inside README.md
- [x] T040 Write backend auth and listings verification test suite in tests/backend/

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: No prerequisites.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion.
- **User Story 1 (Authentication)**: Depends on Phase 2 completion.
- **User Story 2 (Listings)**: Depends on User Story 1 completion.
- **User Story 3 (Search)**: Depends on User Story 2 completion.
- **User Story 4 (AI Enhancements)**: Depends on User Story 2 completion.
- **User Story 5 (AI Fraud)**: Depends on User Story 4 completion.
- **User Story 6 (Chat)**: Depends on User Story 2 completion.
- **Phase 9 (Polish)**: Depends on all user stories being implemented.

---

## Parallel Opportunities

- Setup tasks **T002** through **T005** can run in parallel.
- Database foundation models and validations (**T007**, **T008**, **T009**) can run in parallel within Phase 2.
- Frontend styling and backend API route structures for each user story can be developed in parallel once data models are settled.

---

## Implementation Strategy

### MVP First (Authentication & Listings Lifecycle)
1. Complete **Phase 1 (Setup)** and **Phase 2 (Foundational)**.
2. Complete **Phase 3 (User Story 1 - Auth)**.
3. Complete **Phase 4 (User Story 2 - Listings)**.
4. Run manual validation scenarios for basic posting and discovery.
5. Proceed to implement search, AI helpers, and local chat increments sequentially.
