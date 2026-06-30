# Tasks: SmartBazaar V3 — Full Serverless Vercel Architecture

**Input**: Design documents from `/specs/008-serverless-architecture/`

---

## 1. TASK CHECKLIST

### Phase 1: Setup (Shared Infrastructure)
- [ ] V3-001 Complete Architecture Audit in specs/008-serverless-architecture/research.md
- [ ] V3-002 Dependency Audit in package.json and requirements.txt
- [ ] V3-003 [P] Deployment Blocker Report in specs/008-serverless-architecture/readiness_report.md
- [ ] V3-004 Environment Variable Audit in .env.example

### Phase 2: Foundational (Blocking Prerequisites)
- [ ] V3-005 Setup Environment Configuration Layer in backend/app/core/config.py
- [ ] V3-006 [P] Implement Environment Validation in backend/app/main.py
- [ ] V3-007 [P] Create Production Configuration in frontend/.env.production.example
- [ ] V3-008 Create Development Configuration in frontend/.env.local.example
- [ ] V3-009 Configure Supabase Database in backend/app/database.py
- [ ] V3-010 [P] Implement SQLAlchemy Compatibility in backend/app/database.py
- [ ] V3-011 Validate Alembic Migrations in backend/alembic/env.py
- [ ] V3-012 Configure Connection Pooling in backend/app/database.py
- [ ] V3-013 [P] Configure SSL Connections in backend/app/database.py
- [ ] V3-014 Implement Database Health Checks in backend/app/routers/observability.py
- [ ] V3-015 Seed Production Data in supabase/migrations/20260701000000_seed.sql

### Phase 3: User Story 1 - Secure & Seamless Authentication & Sessions (Priority: P1) 🎯 MVP
- [ ] V3-016 [US1] Configure Supabase Auth in frontend/src/lib/supabase.ts
- [ ] V3-017 [US1] Implement Email Login in frontend/src/app/login/page.tsx
- [ ] V3-018 [US1] Implement Registration Flow in frontend/src/app/register/page.tsx
- [ ] V3-019 [US1] Implement Password Reset in frontend/src/app/reset-password/page.tsx
- [ ] V3-020 [P] [US1] Implement JWT Validation Middleware in backend/app/core/security.py
- [ ] V3-021 [US1] Implement Role-Based Access Control in backend/app/routers/auth.py
- [ ] V3-040 [P] [US1] Refactor API Client for token injection in frontend/src/lib/api.ts
- [ ] V3-041 [US1] Integrate Authentication Client state in frontend/src/stores/authStore.ts

### Phase 4: User Story 2 - Real-Time Live Chat & Messaging (Priority: P1)
- [ ] V3-022 [US2] Remove FastAPI WebSockets in backend/app/routers/chat.py
- [ ] V3-023 [US2] Setup Supabase Realtime Channels in frontend/src/stores/chatStore.ts
- [ ] V3-024 [P] [US2] Implement Presence tracking in frontend/src/stores/chatStore.ts
- [ ] V3-025 [P] [US2] Implement Typing Indicators in frontend/src/stores/chatStore.ts
- [ ] V3-026 [US2] Implement Seen Receipts in frontend/src/stores/chatStore.ts
- [ ] V3-027 [US2] Implement Unread Counts in frontend/src/stores/chatStore.ts
- [ ] V3-028 [US2] Implement Conversation Events list sync in frontend/src/stores/chatStore.ts
- [ ] V3-042 [US2] Implement Realtime Client listeners in frontend/src/stores/chatStore.ts

### Phase 5: User Story 3 - Media Uploads & File Management (Priority: P2)
- [ ] V3-029 [US3] Create Supabase Storage Buckets in supabase/config.toml
- [ ] V3-030 [P] [US US3] Implement Image Upload in frontend/src/components/ImageUpload.tsx
- [ ] V3-031 [P] [US3] Implement Image Delete in frontend/src/components/ImageUpload.tsx
- [ ] V3-032 [US3] Configure Signed URLs for private files in backend/app/routers/admin.py
- [ ] V3-033 [US3] Create Storage Policies in supabase/migrations/20260701000001_storage.sql
- [ ] V3-043 [US3] Integrate Storage Client SDK in frontend/src/lib/supabase.ts

### Phase 6: User Story 4 - Automated, Serverless Scaling & Local-First Development (Priority: P2)
- [ ] V3-034 [US4] Convert FastAPI Endpoints to Vercel Functions in api/main.py
- [ ] V3-035 [P] [US4] Implement Request Validation in backend/app/main.py
- [ ] V3-036 [P] [US4] Configure Shared Middleware in backend/app/main.py
- [ ] V3-037 [US4] Setup Central Error Handling in backend/app/main.py
- [ ] V3-038 [US4] Configure Logging in backend/app/core/logging.py
- [ ] V3-039 [US4] Configure Rate Limiting in backend/app/core/rate_limit.py
- [ ] V3-044 [P] [US4] Convert Page components to Server Components in frontend/src/app/page.tsx
- [ ] V3-045 [P] [US4] Implement Client Components hooks in frontend/src/app/buyer/page.tsx
- [ ] V3-046 [US4] Configure Streaming Suspense in frontend/src/app/listing/[id]/page.tsx
- [ ] V3-047 [US4] Setup Caching and ISR in frontend/next.config.js
- [ ] V3-048 [US4] Port Marketplace Copilot services in backend/app/services/copilot_service.py
- [ ] V3-049 [US4] Port Recommendation Engine in backend/app/services/recommendation_service.py
- [ ] V3-050 [US4] Port Fraud Detection scoring in backend/app/services/trust_score_service.py
- [ ] V3-051 [US4] Port Price Prediction engine in backend/app/services/price_watch_service.py
- [ ] V3-052 [US4] Centralize Prompt Library in backend/app/services/prompts.py
- [ ] V3-053 [P] [US4] Implement RLS Policies in supabase/migrations/20260701000002_rls.sql
- [ ] V3-054 [P] [US4] Implement Storage Policies in supabase/migrations/20260701000003_storage_rls.sql
- [ ] V3-055 [US4] Configure Environment Secrets in vercel.json
- [ ] V3-056 [US4] Implement Input Validation schemas in backend/app/schemas/listings.py
- [ ] V3-057 [US4] Setup API Protection headers in vercel.json
- [ ] V3-058 [US4] Setup Vercel Project Configuration in vercel.json
- [ ] V3-059 [US4] Set Environment Variables in vercel.json
- [ ] V3-060 [US4] Configure Preview Deployments in .github/workflows/ci-cd.yml
- [ ] V3-061 [US4] Configure Production Deployments in .github/workflows/ci-cd.yml
- [ ] V3-062 [US4] Setup Domain Configuration in vercel.json

### Phase 7: Testing & Verification
- [ ] V3-063 [P] Implement Authentication Tests in tests/integration/test_auth.py
- [ ] V3-064 [P] Implement Listings Tests in tests/integration/test_listings.py
- [ ] V3-065 [P] Implement Search Tests in tests/integration/test_search.py
- [ ] V3-066 [P] Implement Chat Tests in tests/integration/test_chat.py
- [ ] V3-067 [P] Implement Offers Tests in tests/integration/test_offers.py
- [ ] V3-068 [P] Implement CRM Tests in tests/integration/test_crm.py
- [ ] V3-069 [P] Implement Analytics Tests in tests/integration/test_analytics.py
- [ ] V3-070 [P] Implement Trust Tests in tests/unit/test_trust.py
- [ ] V3-071 [P] Implement Verification Tests in tests/unit/test_verification.py
- [ ] V3-072 [P] Implement Recommendation Tests in tests/unit/test_recommendation.py
- [ ] V3-073 [P] Implement AI Copilot Tests in tests/unit/test_copilot.py

### Phase 8: Polish & Cross-Cutting Concerns
- [ ] V3-074 Run Performance Audit in specs/008-serverless-architecture/performance_report.md
- [ ] V3-075 Verify Lighthouse Scores in specs/008-serverless-architecture/lighthouse_report.md
- [ ] V3-076 Run Security Audit in specs/008-serverless-architecture/security_report.md
- [ ] V3-077 Run Deployment Validation in vercel.json
- [ ] V3-078 Run Rollback Validation in vercel.json
- [ ] V3-079 Generate Production Readiness Report in specs/008-serverless-architecture/readiness_report.md
- [ ] V3-080 Generate Final Release Checklist in specs/008-serverless-architecture/release.md

---

## 2. DETAILED BACKLOG

### SECTION A: PROJECT AUDIT

#### Task V3-001: Complete Architecture Audit
* **Objective**: Evaluate the complete application codebase for serverless transition barriers.
* **Description**: Scan all routes and services to identify stateful parameters.
* **Files to Modify**: `specs/008-serverless-architecture/research.md`
* **Dependencies**: None
* **Acceptance Criteria**: Comprehensive audit detailing code layers that must change is compiled.
* **Verification Steps**: Check file existence.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-002: Dependency Audit
* **Objective**: Audit packages and remove unneeded dependencies.
* **Description**: Audit list of backend and frontend libraries.
* **Files to Modify**: `package.json`, `requirements.txt`
* **Dependencies**: V3-001
* **Acceptance Criteria**: Unused stateful libraries (e.g. `redis`, `websockets`) are marked for removal.
* **Verification Steps**: Verify package configuration lists.
* **Rollback Plan**: Revert files via Git.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-003: Deployment Blocker Report
* **Objective**: Compile blockers before Vercel release.
* **Description**: Identify issues such as file storage paths and connection reuse.
* **Files to Modify**: `specs/008-serverless-architecture/readiness_report.md`
* **Dependencies**: V3-002
* **Acceptance Criteria**: Readiness report exists.
* **Verification Steps**: Check file.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-004: Environment Variable Audit
* **Objective**: List variables requiring update.
* **Description**: Inspect config file variables.
* **Files to Modify**: `.env.example`
* **Dependencies**: V3-003
* **Acceptance Criteria**: Output template contains all Supabase env tokens.
* **Verification Steps**: Verify file content.
* **Rollback Plan**: Revert file.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 1h

---

### SECTION B: CONFIGURATION

#### Task V3-005: Environment Configuration Layer
* **Objective**: Refactor configurations.
* **Description**: Add Supabase config variables.
* **Files to Modify**: `backend/app/core/config.py`
* **Dependencies**: V3-004
* **Acceptance Criteria**: Configuration validates JWT secret, URL, and key.
* **Verification Steps**: Run backend config tests.
* **Rollback Plan**: Revert config file.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-006: Environment Validation
* **Objective**: Validate config startup parameters.
* **Description**: Raise errors on missing keys.
* **Files to Modify**: `backend/app/main.py`
* **Dependencies**: V3-005
* **Acceptance Criteria**: App fails to start if keys are missing.
* **Verification Steps**: Run app without keys.
* **Rollback Plan**: Revert main file.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-007: Production Configuration
* **Objective**: Setup production template.
* **Description**: Add production environment keys.
* **Files to Modify**: `frontend/.env.production.example`
* **Dependencies**: V3-006
* **Acceptance Criteria**: Template contains only Vercel-supported variables.
* **Verification Steps**: Check file.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 1h

#### Task V3-008: Development Configuration
* **Objective**: Setup local configuration.
* **Description**: Add local Supabase CLI fallback variables.
* **Files to Modify**: `frontend/.env.local.example`
* **Dependencies**: V3-006
* **Acceptance Criteria**: Local configuration defaults to mock serverless.
* **Verification Steps**: Start dev server.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 1h

---

### SECTION C: SUPABASE

#### Task V3-009: Supabase Database Configuration
* **Objective**: Map database parameters to Supabase pooling endpoint.
* **Description**: Point database URL configuration to the transaction port.
* **Files to Modify**: `backend/app/database.py`
* **Dependencies**: V3-006
* **Acceptance Criteria**: Database connection succeeds.
* **Verification Steps**: Check connection log.
* **Rollback Plan**: Restore direct port.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-010: SQLAlchemy Compatibility
* **Objective**: Standardize engine parameters.
* **Description**: Adjust connection pool parameters.
* **Files to Modify**: `backend/app/database.py`
* **Dependencies**: V3-009
* **Acceptance Criteria**: Connection handles serverless timeouts.
* **Verification Steps**: Run CRUD tests.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-011: Alembic Migration Validation
* **Objective**: Force schema upgrades.
* **Description**: Verify migration table status.
* **Files to Modify**: `backend/alembic/env.py`
* **Dependencies**: V3-010
* **Acceptance Criteria**: Alembic version matches Supabase head.
* **Verification Steps**: Run alembic current.
* **Rollback Plan**: Downgrade migrations.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-012: Connection Pooling
* **Objective**: Configure pool recycling.
* **Description**: Prevent connection leaks in Vercel functions.
* **Files to Modify**: `backend/app/database.py`
* **Dependencies**: V3-010
* **Acceptance Criteria**: Pools are recycled after 10 minutes.
* **Verification Steps**: Check connection count under load.
* **Rollback Plan**: Revert pooling settings.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-013: SSL Configuration
* **Objective**: Enforce SSL queries.
* **Description**: Force SSL requirements on SQLAlchemy engine.
* **Files to Modify**: `backend/app/database.py`
* **Dependencies**: V3-010
* **Acceptance Criteria**: Connection fails if SSL is disabled.
* **Verification Steps**: Run connection tests.
* **Rollback Plan**: Revert SSL mode.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-014: Database Health Checks
* **Objective**: Expose db health endpoint.
* **Description**: Validate connection in readiness route.
* **Files to Modify**: `backend/app/routers/observability.py`
* **Dependencies**: V3-013
* **Acceptance Criteria**: `/ready` returns database online status.
* **Verification Steps**: Test GET `/ready`.
* **Rollback Plan**: Revert router.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

#### Task V3-015: Seed Production Data
* **Objective**: Initialize production dataset.
* **Description**: Write seed commands to database migrations.
* **Files to Modify**: `supabase/migrations/20260701000000_seed.sql`
* **Dependencies**: V3-011
* **Acceptance Criteria**: Table data is seeded.
* **Verification Steps**: Check table counts.
* **Rollback Plan**: Run database truncate.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

---

### SECTION D: AUTHENTICATION

#### Task V3-016: Supabase Auth Setup
* **Objective**: Initialize authentication credentials.
* **Description**: Set up redirects and client headers.
* **Files to Modify**: `frontend/src/lib/supabase.ts`
* **Dependencies**: V3-008
* **Acceptance Criteria**: Supabase client is initialized.
* **Verification Steps**: Log client instance details.
* **Rollback Plan**: Revert client initialization.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-017: Email Login
* **Objective**: Sign in via Supabase Auth.
* **Description**: Replace custom login endpoint.
* **Files to Modify**: `frontend/src/app/login/page.tsx`
* **Dependencies**: V3-016
* **Acceptance Criteria**: User receives token on login.
* **Verification Steps**: Perform login.
* **Rollback Plan**: Restore local authentication forms.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 5h

#### Task V3-018: Registration
* **Objective**: User registration.
* **Description**: Connect sign up forms.
* **Files to Modify**: `frontend/src/app/register/page.tsx`
* **Dependencies**: V3-017
* **Acceptance Criteria**: New user registers successfully.
* **Verification Steps**: Perform register flow.
* **Rollback Plan**: Revert form updates.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-019: Password Reset
* **Objective**: Recover lost password.
* **Description**: Bind reset request.
* **Files to Modify**: `frontend/src/app/reset-password/page.tsx`
* **Dependencies**: V3-018
* **Acceptance Criteria**: Reset email is sent.
* **Verification Steps**: Trigger password reset.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-020: JWT Validation
* **Objective**: Verify auth token on backend.
* **Description**: Decrypt and validate Supabase JWT signature.
* **Files to Modify**: `backend/app/core/security.py`
* **Dependencies**: V3-005
* **Acceptance Criteria**: Validates bearer token on every request.
* **Verification Steps**: Query endpoint with valid/invalid token.
* **Rollback Plan**: Revert token decoding.
* **Estimated Risk**: High | **Priority**: High | **Estimated Effort**: 6h

#### Task V3-021: Role Management
* **Objective**: Restrict routes by user role.
* **Description**: Check metadata claims for role.
* **Files to Modify**: `backend/app/routers/auth.py`
* **Dependencies**: V3-020
* **Acceptance Criteria**: Restricts admin/seller paths to allowed roles.
* **Verification Steps**: Query `/api/admin` using seller credentials.
* **Rollback Plan**: Revert permissions middleware.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

---

### SECTION E: REALTIME

#### Task V3-022: Remove FastAPI WebSockets
* **Objective**: Deprecate WebSocket managers.
* **Description**: Remove Python WebSocket endpoints.
* **Files to Modify**: `backend/app/routers/chat.py`
* **Dependencies**: V3-002
* **Acceptance Criteria**: WS code paths are removed.
* **Verification Steps**: Verify endpoints.
* **Rollback Plan**: Revert chat routers.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-023: Supabase Realtime Setup
* **Objective**: Connect real-time channels.
* **Description**: Subscribe client to messages table mutations.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-016
* **Acceptance Criteria**: Messages are received in real-time.
* **Verification Steps**: Insert record manually and verify sync.
* **Rollback Plan**: Revert chat store.
* **Estimated Risk**: High | **Priority**: High | **Estimated Effort**: 6h

#### Task V3-024: Presence
* **Objective**: Online tracking.
* **Description**: Track active presence using channels.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-023
* **Acceptance Criteria**: Presence list updates on join/leave.
* **Verification Steps**: Simulate user join.
* **Rollback Plan**: Revert presence listeners.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-025: Typing Indicators
* **Objective**: Broadcast typing status.
* **Description**: Send transient broadcast indicators.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-023
* **Acceptance Criteria**: Sender typing triggers UI state update.
* **Verification Steps**: Simulate typing action.
* **Rollback Plan**: Revert indicator hook.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-026: Seen Receipts
* **Objective**: Read indicators.
* **Description**: Mutate messages database read flag.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-023
* **Acceptance Criteria**: Reading chat updates message status.
* **Verification Steps**: Open conversation pane.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-027: Unread Counts
* **Objective**: Track conversation counts.
* **Description**: Compute counts of non-read messages.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-026
* **Acceptance Criteria**: Displays correct unread count.
* **Verification Steps**: Verify inbox counts.
* **Rollback Plan**: Revert count updates.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-028: Conversation Events
* **Objective**: Update summaries.
* **Description**: Broadcast metadata events on message post.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-023
* **Acceptance Criteria**: Inbox list updates on new incoming messages.
* **Verification Steps**: Send message and inspect list.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

---

### SECTION F: STORAGE

#### Task V3-029: Supabase Storage Buckets
* **Objective**: Configure storage buckets.
* **Description**: Define listings and verification buckets.
* **Files to Modify**: `supabase/config.toml`
* **Dependencies**: None
* **Acceptance Criteria**: Storage buckets exist on Supabase.
* **Verification Steps**: Inspect storage config.
* **Rollback Plan**: Delete buckets.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-030: Image Upload
* **Objective**: Upload files directly.
* **Description**: Replace backend upload endpoint.
* **Files to Modify**: `frontend/src/components/ImageUpload.tsx`
* **Dependencies**: V3-016, V3-029
* **Acceptance Criteria**: Images are saved in storage.
* **Verification Steps**: Perform image upload.
* **Rollback Plan**: Revert upload.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-031: Image Delete
* **Objective**: Remove files from storage.
* **Description**: Call delete file SDK.
* **Files to Modify**: `frontend/src/components/ImageUpload.tsx`
* **Dependencies**: V3-030
* **Acceptance Criteria**: Storage record is deleted.
* **Verification Steps**: Click delete and verify storage.
* **Rollback Plan**: Revert delete calls.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

#### Task V3-032: Signed URLs
* **Objective**: Secure private file downloads.
* **Description**: Generate signed urls for verification files.
* **Files to Modify**: `backend/app/routers/admin.py`
* **Dependencies**: V3-020, V3-029
* **Acceptance Criteria**: Admin accesses file via generated link.
* **Verification Steps**: Generate signed url and download.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-033: Storage Policies
* **Objective**: Apply security policies.
* **Description**: Create storage security policies.
* **Files to Modify**: `supabase/migrations/20260701000001_storage.sql`
* **Dependencies**: V3-029
* **Acceptance Criteria**: Access rules block unauthenticated reads on verification documents.
* **Verification Steps**: Attempt download without auth.
* **Rollback Plan**: Delete policies.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 3h

---

### SECTION G: SERVERLESS API

#### Task V3-034: Convert FastAPI Endpoints
* **Objective**: Re-target endpoint routing.
* **Description**: Set up entry point for Vercel.
* **Files to Modify**: `api/main.py`
* **Dependencies**: V3-006
* **Acceptance Criteria**: Router serves endpoints via api folder.
* **Verification Steps**: Query `/api/listings`.
* **Rollback Plan**: Revert.
* **Estimated Risk**: High | **Priority**: High | **Estimated Effort**: 5h

#### Task V3-035: Request Validation
* **Objective**: Enforce schema constraints.
* **Description**: Check parameter limits on endpoints.
* **Files to Modify**: `backend/app/main.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Invalid formats are blocked.
* **Verification Steps**: Send invalid payloads.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-036: Shared Middleware
* **Objective**: Attach global middlewares.
* **Description**: Bind security and CORS headers.
* **Files to Modify**: `backend/app/main.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Outgoing headers contain correct parameters.
* **Verification Steps**: Verify CORS logs.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-037: Error Handling
* **Objective**: Mask stack traces.
* **Description**: Intercept server errors.
* **Files to Modify**: `backend/app/main.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Outgoing errors contain clean messages.
* **Verification Steps**: Throw test exceptions.
* **Rollback Plan**: Revert handlers.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

#### Task V3-038: Logging
* **Objective**: Configure serverless log outputs.
* **Description**: Stream messages to stdout.
* **Files to Modify**: `backend/app/core/logging.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Logs format correctly.
* **Verification Steps**: View logs.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

#### Task V3-039: Rate Limiting
* **Objective**: Prevent brute-force.
* **Description**: Restrict requests per IP.
* **Files to Modify**: `backend/app/core/rate_limit.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Reaching threshold returns 429.
* **Verification Steps**: Send flood requests.
* **Rollback Plan**: Revert limits.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 3h

---

### SECTION H: NEXT.JS

#### Task V3-040: API Client
* **Objective**: Inject authorization.
* **Description**: Append bearer header to all api calls.
* **Files to Modify**: `frontend/src/lib/api.ts`
* **Dependencies**: V3-016
* **Acceptance Criteria**: Token is attached.
* **Verification Steps**: Check outgoing request headers.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-041: Authentication Client
* **Objective**: Sync auth state.
* **Description**: Manage user states.
* **Files to Modify**: `frontend/src/stores/authStore.ts`
* **Dependencies**: V3-016
* **Acceptance Criteria**: States sync cleanly.
* **Verification Steps**: Perform login and inspect state.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-042: Realtime Client
* **Objective**: Setup presence bindings.
* **Description**: Map database updates to Zustand.
* **Files to Modify**: `frontend/src/stores/chatStore.ts`
* **Dependencies**: V3-023
* **Acceptance Criteria**: UI states react.
* **Verification Steps**: Verify chat UI.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-043: Storage Client
* **Objective**: Map media requests.
* **Description**: Convert upload helper.
* **Files to Modify**: `frontend/src/lib/supabase.ts`
* **Dependencies**: V3-030
* **Acceptance Criteria**: File paths use Supabase.
* **Verification Steps**: Verify listing image loads.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-044: Server Components
* **Objective**: Render server pages.
* **Description**: Fetch static detail server-side.
* **Files to Modify**: `frontend/src/app/page.tsx`
* **Dependencies**: None
* **Acceptance Criteria**: Static markup loads.
* **Verification Steps**: View page source.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-045: Client Components
* **Objective**: Interactive logic.
* **Description**: Add interactive client hooks.
* **Files to Modify**: `frontend/src/app/buyer/page.tsx`
* **Dependencies**: None
* **Acceptance Criteria**: Client operations work.
* **Verification Steps**: Click buttons.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

#### Task V3-046: Streaming
* **Objective**: Progressive loading.
* **Description**: Wrap listing details in Suspense.
* **Files to Modify**: `frontend/src/app/listing/[id]/page.tsx`
* **Dependencies**: V3-044
* **Acceptance Criteria**: Skeletons load first.
* **Verification Steps**: Load page.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-047: Caching
* **Objective**: Setup ISR thresholds.
* **Description**: Cache listing catalog.
* **Files to Modify**: `frontend/next.config.js`
* **Dependencies**: None
* **Acceptance Criteria**: Pages are revalidated every 60s.
* **Verification Steps**: Inspect caching headers.
* **Rollback Plan**: Disable cache.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

---

### SECTION I: AI

#### Task V3-048: Marketplace Copilot
* **Objective**: Migrate Copilot backend.
* **Description**: Port AI text generator.
* **Files to Modify**: `backend/app/services/copilot_service.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Copilot generates suggestions.
* **Verification Steps**: Send prompt.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-049: Recommendation Engine
* **Objective**: Deploy recommendation service.
* **Description**: Port listing matching.
* **Files to Modify**: `backend/app/services/recommendation_service.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Matches return correct formats.
* **Verification Steps**: Verify listings.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Medium | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-050: Fraud Detection
* **Objective**: Compute listing risks.
* **Description**: Port fraud rating service.
* **Files to Modify**: `backend/app/services/trust_score_service.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Computes fraud score.
* **Verification Steps**: Create listing and check score.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-051: Price Prediction
* **Objective**: Retrieve valuation guidelines.
* **Description**: Port pricing prediction.
* **Files to Modify**: `backend/app/services/price_watch_service.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Return average prices.
* **Verification Steps**: Test predictions.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-052: Prompt Library
* **Objective**: Store model prompt layouts.
* **Description**: Set prompt templates.
* **Files to Modify**: `backend/app/services/prompts.py`
* **Dependencies**: V3-048
* **Acceptance Criteria**: Templates render.
* **Verification Steps**: Print formatted prompt.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

---

### SECTION J: SECURITY

#### Task V3-053: RLS Policies
* **Objective**: Establish table restrictions.
* **Description**: Deploy policies.
* **Files to Modify**: `supabase/migrations/20260701000002_rls.sql`
* **Dependencies**: V3-011
* **Acceptance Criteria**: Blocked queries fail.
* **Verification Steps**: Try SELECT without credentials.
* **Rollback Plan**: Drop policies.
* **Estimated Risk**: High | **Priority**: High | **Estimated Effort**: 5h

#### Task V3-054: Storage Policies
* **Objective**: Protect uploads.
* **Description**: Deploy storage policies.
* **Files to Modify**: `supabase/migrations/20260701000003_storage_rls.sql`
* **Dependencies**: V3-029
* **Acceptance Criteria**: Access is restricted.
* **Verification Steps**: Attempt document fetch.
* **Rollback Plan**: Drop.
* **Estimated Risk**: High | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-055: Environment Secrets
* **Objective**: Setup secrets manager.
* **Description**: Link production env vars.
* **Files to Modify**: `vercel.json`
* **Dependencies**: V3-007
* **Acceptance Criteria**: Vars are active in deployment.
* **Verification Steps**: Print process envs.
* **Rollback Plan**: Reset keys.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-056: Input Validation
* **Objective**: Verify inputs.
* **Description**: Validate payload parameters.
* **Files to Modify**: `backend/app/schemas/listings.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Invalid formats are blocked.
* **Verification Steps**: Send bad params.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-057: API Protection
* **Objective**: Link security headers.
* **Description**: Set rate limiting headers.
* **Files to Modify**: `vercel.json`
* **Dependencies**: V3-039
* **Acceptance Criteria**: Client browser respects restrictions.
* **Verification Steps**: Inspect headers.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

---

### SECTION K: VERCEL

#### Task V3-058: Project Configuration
* **Objective**: Configure project rules.
* **Description**: Set up routes and redirects.
* **Files to Modify**: `vercel.json`
* **Dependencies**: None
* **Acceptance Criteria**: Routes map to API.
* **Verification Steps**: Check file schema.
* **Rollback Plan**: Delete vercel config.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-059: Environment Variables
* **Objective**: Set environment parameters.
* **Description**: Map environment keys to builder.
* **Files to Modify**: `vercel.json`
* **Dependencies**: V3-058
* **Acceptance Criteria**: Deployment boots successfully.
* **Verification Steps**: Inspect deployment logs.
* **Rollback Plan**: Revert config.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-060: Preview Deployments
* **Objective**: Setup preview workflow.
* **Description**: Enable pull request validation previews.
* **Files to Modify**: `.github/workflows/ci-cd.yml`
* **Dependencies**: None
* **Acceptance Criteria**: CI boots preview on PR.
* **Verification Steps**: Open test PR.
* **Rollback Plan**: Disable workflow.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-061: Production Deployments
* **Objective**: Setup main branch pipeline.
* **Description**: Deploy to production on merge.
* **Files to Modify**: `.github/workflows/ci-cd.yml`
* **Dependencies**: V3-060
* **Acceptance Criteria**: Deploys to main branch.
* **Verification Steps**: Push commit.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-062: Domain Configuration
* **Objective**: Map domain names.
* **Description**: Set production URL.
* **Files to Modify**: `vercel.json`
* **Dependencies**: V3-058
* **Acceptance Criteria**: Site resolves on production url.
* **Verification Steps**: Ping domain.
* **Rollback Plan**: Restore default Vercel subdomain.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

---

### SECTION L: TESTING

#### Task V3-063: Authentication Testing
* **Objective**: Test authorization.
* **Description**: Verify tokens.
* **Files to Modify**: `tests/integration/test_auth.py`
* **Dependencies**: V3-017
* **Acceptance Criteria**: Integration tests pass.
* **Verification Steps**: Run pytest.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-064: Listings Testing
* **Objective**: Verify listing APIs.
* **Description**: Verify listing CRUD.
* **Files to Modify**: `tests/integration/test_listings.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Tests pass.
* **Verification Steps**: Run pytest.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-065: Search Testing
* **Objective**: Test search filters.
* **Description**: Verify queries.
* **Files to Modify**: `tests/integration/test_search.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Search matches filters.
* **Verification Steps**: Run pytest.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 3h

#### Task V3-066: Chat Testing
* **Objective**: Test chat sync.
* **Description**: Verify real-time message mutations.
* **Files to Modify**: `tests/integration/test_chat.py`
* **Dependencies**: V3-023
* **Acceptance Criteria**: Tests pass.
* **Verification Steps**: Run pytest.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Medium | **Priority**: High | **Estimated Effort**: 4h

#### Task V3-067: Offers Testing
* **Objective**: Test offer creations.
* **Description**: Verify listing offer mutations.
* **Files to Modify**: `tests/integration/test_offers.py`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Tests pass.
* **Verification Steps**: Run pytest.
* **Rollback Plan**: Revert.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 3h

#### Task V3-074: Performance Audit
* **Objective**: Audit application performance.
* **Description**: Measure serverless execution times.
* **Files to Modify**: `specs/008-serverless-architecture/performance_report.md`
* **Dependencies**: V3-034
* **Acceptance Criteria**: Performance report exists.
* **Verification Steps**: Check file.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-075: Lighthouse Audit
* **Objective**: Measure Lighthouse scores.
* **Description**: Run audits.
* **Files to Modify**: `specs/008-serverless-architecture/lighthouse_report.md`
* **Dependencies**: V3-044
* **Acceptance Criteria**: Lighthouse report exists.
* **Verification Steps**: Check file.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-076: Security Audit
* **Objective**: Review database access policies.
* **Description**: Audit storage permissions.
* **Files to Modify**: `specs/008-serverless-architecture/security_report.md`
* **Dependencies**: V3-053
* **Acceptance Criteria**: Security report exists.
* **Verification Steps**: Check file.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-077: Deployment Validation
* **Objective**: Verify vercel.json configurations.
* **Description**: Run deployment validations.
* **Files to Modify**: `vercel.json`
* **Dependencies**: V3-058
* **Acceptance Criteria**: Config passes vercel verification.
* **Verification Steps**: Run vercel build.
* **Rollback Plan**: Revert config.
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-078: Rollback Validation
* **Objective**: Verify rollback actions.
* **Description**: Simulate failure rollback.
* **Files to Modify**: `vercel.json`
* **Dependencies**: V3-058
* **Acceptance Criteria**: Rollback recovers site.
* **Verification Steps**: Trigger manual rollback.
* **Rollback Plan**: Revert simulation.
* **Estimated Risk**: Low | **Priority**: Medium | **Estimated Effort**: 2h

#### Task V3-079: Production Readiness
* **Objective**: Verify checks are completed.
* **Description**: Verify readiness metrics.
* **Files to Modify**: `specs/008-serverless-architecture/readiness_report.md`
* **Dependencies**: V3-074
* **Acceptance Criteria**: Report exists.
* **Verification Steps**: Check file.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

#### Task V3-080: Final Release Checklist
* **Objective**: Verify release checklist.
* **Description**: Check release checklist items.
* **Files to Modify**: `specs/008-serverless-architecture/release.md`
* **Dependencies**: V3-079
* **Acceptance Criteria**: Checklist exists.
* **Verification Steps**: Check file.
* **Rollback Plan**: N/A
* **Estimated Risk**: Low | **Priority**: High | **Estimated Effort**: 2h

*(Note: The other testing tasks V3-068 to V3-073 follow similar structured models and are mapped to tests/ folder validation.)*

---

## 3. DEPENDENCIES & EXECUTION ORDER

- **Phase 1: Setup** has no dependencies.
- **Phase 2: Foundational** depends on Phase 1 setup completion.
- **Phase 3 (User Story 1: Auth)** depends on Phase 2 foundation.
- **Phase 4 (User Story 2: Realtime)** depends on Phase 2 foundation.
- **Phase 5 (User Story 3: Storage)** depends on Phase 2 foundation.
- **Phase 6 (User Story 4: Serverless)** depends on Phase 2 foundation.
- **Phase 7 (Testing)** depends on Phase 3-6 completion.
- **Phase 8 (Polish)** depends on Phase 7.

### Parallel Opportunities
- Setup tasks (V3-001 to V3-004) can be completed in parallel.
- Local configuration variables (V3-007 and V3-008) can be defined in parallel.
- Once Phase 2 foundation is completed, User Story 1 (Auth), User Story 2 (Realtime Chat), and User Story 3 (Storage) can be worked on in parallel.
- All testing validation files (V3-063 to V3-073) can be written in parallel.

---

## 4. IMPLEMENTATION STRATEGY

### MVP First (User Story 1 - Auth Only)
1. Complete Project and Dependency Audits.
2. Setup Supabase database configurations and pooling parameters.
3. Integrate Supabase Auth on Next.js frontend and validate JWT tokens on backend FastAPI functions.
4. Verify authentication works independently (login, register, reset password).
5. Stop and validate before moving to real-time.
