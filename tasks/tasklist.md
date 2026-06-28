# SmartBazaar AI — Task List

> Generated via `/tasks` workflow — Spec-Kit v1  
> Agent: Task Planner  
> Total Tasks: 40

---

## Phase 1 — Setup (Shared Infrastructure)

| ID | Task | File Path |
|---|---|---|
| T001 | Initialize Git repository and project folder structure | Repo Root |
| T002 | Configure backend dependencies | `backend/requirements.txt` |
| T003 | Configure Next.js dependencies | `frontend/package.json` |
| T004 | Setup backend Docker service settings | `backend/Dockerfile` |
| T005 | Configure Next.js tailwind.config.js and tsconfig.json configurations | `frontend/tailwind.config.js` |

---

## Phase 2 — Foundational (Blocking Prerequisites)

| ID | Task | File Path |
|---|---|---|
| T006 | Initialize database connection and Session | `backend/app/database.py` |
| T007 | Create User database model | `backend/app/models/user.py` |
| T008 | Implement password hashing and validation logic | `backend/app/services/auth_service.py` |
| T009 | Create JWT encoding and validation utility handlers | `backend/app/utils/jwt.py` |

---

## Phase 3 — User Story 1 (Secure Authentication)

| ID | Task | File Path |
|---|---|---|
| T010 | Create registration endpoint `POST /api/auth/register` | `backend/app/routes/auth.py` |
| T011 | Create login endpoint `POST /api/auth/login` | `backend/app/routes/auth.py` |
| T012 | Create current user profile endpoint `GET /api/auth/me` | `backend/app/routes/auth.py` |
| T013 | Create react useAuth hook for state session tracking | `frontend/hooks/useAuth.tsx` |
| T014 | Implement registration and login tabs interface | `frontend/pages/login.tsx` |

---

## Phase 4 — User Story 2 (Listing Lifecycle Management)

| ID | Task | File Path |
|---|---|---|
| T015 | Create Listing database model | `backend/app/models/listing.py` |
| T016 | Create create listing endpoint `POST /api/listings` | `backend/app/routes/listings.py` |
| T017 | Create details query endpoint `GET /api/listings/{id}` | `backend/app/routes/listings.py` |
| T018 | Create update listing endpoint `PUT /api/listings/{id}` | `backend/app/routes/listings.py` |
| T019 | Create delete listing endpoint `DELETE /api/listings/{id}` | `backend/app/routes/listings.py` |
| T020 | Create listing queries hook | `frontend/hooks/useListings.tsx` |
| T021 | Implement ListingCard component | `frontend/components/ListingCard.tsx` |
| T022 | Implement index listing page listing feed | `frontend/pages/index.tsx` |
| T023 | Implement detail view interface for listing items | `frontend/pages/listing/[id].tsx` |

---

## Phase 5 — User Story 3 (Listing Search & Filtering)

| ID | Task | File Path |
|---|---|---|
| T024 | Create filtered search API endpoint `GET /api/search` | `backend/app/routes/search.py` |
| T025 | Implement SearchBar component on frontend | `frontend/components/SearchBar.tsx` |
| T026 | Build search results page UI layout | `frontend/pages/search.tsx` |

---

## Phase 6 — User Story 4 (AI-Powered Listing Enhancements)

| ID | Task | File Path |
|---|---|---|
| T027 | Implement OpenAI / fallback integration | `backend/app/services/ai_service.py` |
| T028 | Create AI endpoints `POST /api/ai/describe`, `predict-category`, `recommend-price` | `backend/app/routes/ai.py` |
| T029 | Create listing creator editor form interface | `frontend/pages/create-listing.tsx` |
| T030 | Implement AI assistant recommendation panel component | `frontend/pages/create-listing.tsx` |

---

## Phase 7 — User Story 5 (AI Fraud Detection)

| ID | Task | File Path |
|---|---|---|
| T031 | Implement listing validation scanner logic | `backend/app/routes/ai.py` |
| T032 | Implement fraud score badge component on detail page | `frontend/pages/listing/[id].tsx` |

---

## Phase 8 — User Story 6 (Seller-Buyer Localized Chat)

| ID | Task | File Path |
|---|---|---|
| T033 | Create Message database model | `backend/app/models/message.py` |
| T034 | Implement chat messaging API endpoints | `backend/app/routes/listings.py` |
| T035 | Implement message background task for canned auto-reply | `backend/app/services/ai_service.py` |
| T036 | Create ChatBox component on detail page | `frontend/pages/listing/[id].tsx` |

---

## Phase 9 — Polish & Cross-Cutting Concerns

| ID | Task | File Path |
|---|---|---|
| T037 | Setup multi-container build configuration | `docker-compose.yml` |
| T038 | Create local database seeding scripts | `backend/app/seed.py` |
| T039 | Implement comprehensive developer guidelines | `README.md` |
| T040 | Write backend auth and listings verification test suite | `tests/backend/` |
