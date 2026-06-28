# Tasks: Marketplace Role Separation & Real Buyer-Seller Ecosystem

**Input**: Design documents from `/specs/003-marketplace-role-separation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

---

## Phase 1: Setup & Database Models

**Purpose**: Database schema upgrades and baseline migrations for role separation.

- [ ] T201 Create project structure per implementation plan in specs/003-marketplace-role-separation/plan.md
  - **Priority**: High
  - **Dependencies**: None
  - **Estimated Time**: 1h
  - **Agent**: Architect Agent
  - **Acceptance Criteria**: Folders and documents verify configuration setup.
  - **Status**: Todo
- [ ] T202 Create Conversation model in backend/app/models/conversation.py
  - **Priority**: High
  - **Dependencies**: T201
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `Conversation` SQLAlchemy model created with columns `id`, `listing_id`, `buyer_id`, `seller_id`, `created_at`, plus relationships to `Listing`, `User` (buyer/seller), and `Message`.
  - **Status**: Todo
- [ ] T203 Create Offer model in backend/app/models/offer.py
  - **Priority**: High
  - **Dependencies**: T201
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `Offer` SQLAlchemy model created with columns `id`, `listing_id`, `buyer_id`, `seller_id`, `offer_amount`, `status`, `created_at`, `updated_at`, plus unique constraints and indexes.
  - **Status**: Todo
- [ ] T204 Create SavedListing model in backend/app/models/saved_listing.py
  - **Priority**: High
  - **Dependencies**: T201
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `SavedListing` SQLAlchemy model created with columns `id`, `user_id`, `listing_id`, `created_at` and unique index on `(user_id, listing_id)`.
  - **Status**: Todo
- [ ] T205 Create ListingView model in backend/app/models/listing_view.py
  - **Priority**: Medium
  - **Dependencies**: T201
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `ListingView` SQLAlchemy model created with columns `id`, `listing_id`, `viewer_id`, `viewed_at` for view-counter tracking.
  - **Status**: Todo
- [ ] T206 Create RecentlyViewed model in backend/app/models/recently_viewed.py
  - **Priority**: Medium
  - **Dependencies**: T201
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `RecentlyViewed` SQLAlchemy model created with columns `id`, `user_id`, `listing_id`, `viewed_at` with unique index on `(user_id, listing_id)`.
  - **Status**: Todo
- [ ] T207 Update Listing model to support status and metrics in backend/app/models/listing.py
  - **Priority**: High
  - **Dependencies**: T201
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Adds `status` column (default "Active") and metrics caching columns `views_count` and `saves_count`.
  - **Status**: Todo
- [ ] T208 Update Message model in backend/app/models/message.py
  - **Priority**: High
  - **Dependencies**: T202
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Adds foreign key `conversation_id` and relationship to `Conversation`, deprecating listing-wide chat query logic.
  - **Status**: Todo
- [ ] T209 Configure database schemas mapping in backend/app/main.py
  - **Priority**: High
  - **Dependencies**: T202, T203, T204, T205, T206, T207, T208
  - **Estimated Time**: 1h
  - **Agent**: Architect Agent
  - **Acceptance Criteria**: Startup database schema check passes and creates all tables dynamically.
  - **Status**: Todo
- [ ] T210 Update database seeding logic in backend/app/seed.py
  - **Priority**: High
  - **Dependencies**: T209
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Seeding creates conversations, messages, offers, and saves, running cleanly on local SQLite environment.
  - **Status**: Todo

---

## Phase 2: User Story 1 - Real Messaging & Self-Chat Prevention (Priority: P1)

**Goal**: Implement persistent unique conversation threads and security guards to block self-chats.
**Independent Test**: Send a message on other user's listing, check message delivery, and attempt to message own listing.

- [ ] T211 [US1] Create Conversation Service in backend/app/services/conversation_service.py
  - **Priority**: High
  - **Dependencies**: T208, T210
  - **Estimated Time**: 2.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `ConversationService` class initialized with database session injection.
  - **Status**: Todo
- [ ] T212 [P] [US1] Implement Self-Chat prevention guard logic in backend/app/services/conversation_service.py
  - **Priority**: High
  - **Dependencies**: T211
  - **Estimated Time**: 1.5h
  - **Agent**: Security Agent
  - **Acceptance Criteria**: Function checks `listing.seller_id == current_user.id` and raises validation error.
  - **Status**: Todo
- [ ] T213 [US1] Implement conversation fetch/create methods in backend/app/services/conversation_service.py
  - **Priority**: High
  - **Dependencies**: T211
  - **Estimated Time**: 2.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Method queries unique thread by `(listing_id, buyer_id, seller_id)` or creates one if not found.
  - **Status**: Todo
- [ ] T214 [US1] Create Conversations API router in backend/app/routers/conversations.py
  - **Priority**: High
  - **Dependencies**: T213
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Setup FastApi router with authentication dependencies.
  - **Status**: Todo
- [ ] T215 [US1] Expose GET /api/conversations endpoint in backend/app/routers/conversations.py
  - **Priority**: High
  - **Dependencies**: T214
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Returns conversations filtered for the logged-in user with listing data and last message snippets.
  - **Status**: Todo
- [ ] T216 [US1] Expose POST /api/conversations endpoint in backend/app/routers/conversations.py
  - **Priority**: High
  - **Dependencies**: T214, T212
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Validates owner ID, starts thread, and blocks user self-chats.
  - **Status**: Todo
- [ ] T217 [US1] Expose GET /api/conversations/{id}/messages endpoint in backend/app/routers/conversations.py
  - **Priority**: High
  - **Dependencies**: T214
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Returns message list in chronological order; rejects unauthorized users (non-participant) with 403.
  - **Status**: Todo
- [ ] T218 [US1] Expose POST /api/conversations/{id}/messages endpoint in backend/app/routers/conversations.py
  - **Priority**: High
  - **Dependencies**: T214
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Adds a new message to the conversation and updates timestamps.
  - **Status**: Todo
- [ ] T219 [US1] Remove fake/mock auto-reply background tasks in backend/app/routers/conversations.py
  - **Priority**: Medium
  - **Dependencies**: T214
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Canned replies and mock async sleep tasks are removed; conversations contain real messages only.
  - **Status**: Todo
- [ ] T220 [US1] Create Conversation Panel component in frontend/src/components/ConversationPanel.tsx
  - **Priority**: High
  - **Dependencies**: T217, T218
  - **Estimated Time**: 3h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Panel renders message timeline and text input form, scroll-anchored to bottom.
  - **Status**: Todo
- [ ] T221 [US1] Integrate messaging panel layout in frontend/src/app/dashboard/page.tsx
  - **Priority**: High
  - **Dependencies**: T220
  - **Estimated Time**: 2.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Displays message threads selector list in dashboard view.
  - **Status**: Todo
- [ ] T222 [US1] Write automated messaging unit tests in tests/test_messages.py
  - **Priority**: High
  - **Dependencies**: T216, T217
  - **Estimated Time**: 2h
  - **Agent**: QA Agent
  - **Acceptance Criteria**: Pytest validates message retrieval, chat persistence, and 400 guards on self-chat.
  - **Status**: Todo

---

## Phase 3: User Story 2 - Price Negotiation & Offers System (Priority: P1)

**Goal**: Implement price offers lifecycle (Pending, Accepted, Rejected, Expired) and listing status locking.
**Independent Test**: Place a buyer offer, verify pending status, accept offer as seller, and assert listing status locks to "Sold".

- [ ] T223 [US2] Create Offer Service in backend/app/services/offer_service.py
  - **Priority**: High
  - **Dependencies**: T203, T210
  - **Estimated Time**: 2.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `OfferService` class instantiated with ORM logic methods.
  - **Status**: Todo
- [ ] T224 [P] [US2] Implement Self-Offer prevention guard logic in backend/app/services/offer_service.py
  - **Priority**: High
  - **Dependencies**: T223
  - **Estimated Time**: 1.5h
  - **Agent**: Security Agent
  - **Acceptance Criteria**: Functions validate caller is not listing owner, throwing 400 on violations.
  - **Status**: Todo
- [ ] T225 [US2] Implement offer placement methods in backend/app/services/offer_service.py
  - **Priority**: High
  - **Dependencies**: T223
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Adds an offer record with state "Pending" and checks amount is positive.
  - **Status**: Todo
- [ ] T226 [US2] Implement accept offer state transition logic in backend/app/services/offer_service.py
  - **Priority**: High
  - **Dependencies**: T223
  - **Estimated Time**: 2.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Accepting an offer marks listing as "Sold", this offer as "Accepted", and other pending listing offers as "Expired".
  - **Status**: Todo
- [ ] T227 [US2] Implement reject offer state transition logic in backend/app/services/offer_service.py
  - **Priority**: High
  - **Dependencies**: T223
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Updates offer status to "Rejected".
  - **Status**: Todo
- [ ] T228 [US2] Implement cancel/withdraw offer logic in backend/app/services/offer_service.py
  - **Priority**: Medium
  - **Dependencies**: T223
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Buyer cancels active offer, transitioning state to "Expired" or "Cancelled".
  - **Status**: Todo
- [ ] T229 [US2] Create Offers API router in backend/app/routers/offers.py
  - **Priority**: High
  - **Dependencies**: T225, T226, T227, T228
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Router matches REST requirements contracts.
  - **Status**: Todo
- [ ] T230 [US2] Expose POST /api/offers endpoint in backend/app/routers/offers.py
  - **Priority**: High
  - **Dependencies**: T229
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Places and validates buyer offers.
  - **Status**: Todo
- [ ] T231 [US2] Expose GET /api/offers/sent and /api/offers/received endpoints in backend/app/routers/offers.py
  - **Priority**: High
  - **Dependencies**: T229
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Returns array of sent or received offers matching caller JWT session.
  - **Status**: Todo
- [ ] T232 [US2] Expose POST /api/offers/{id}/accept and /api/offers/{id}/reject endpoints in backend/app/routers/offers.py
  - **Priority**: High
  - **Dependencies**: T229
  - **Estimated Time**: 2.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Triggers status mutations and validates caller is the listing seller owner.
  - **Status**: Todo
- [ ] T233 [US2] Create Make Offer Modal overlay in frontend/src/components/OfferModal.tsx
  - **Priority**: High
  - **Dependencies**: T230
  - **Estimated Time**: 3h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Input form pop-up allows entering offer amount, validating input is numeric and positive.
  - **Status**: Todo
- [ ] T234 [US2] Write automated tests for offer flow in tests/test_offers.py
  - **Priority**: High
  - **Dependencies**: T230, T232
  - **Estimated Time**: 2h
  - **Agent**: QA Agent
  - **Acceptance Criteria**: Pytest validates placement, acceptance, listing lock updates, and authorization.
  - **Status**: Todo

---

## Phase 4: User Story 3 - Buyer & Seller Dashboards (Priority: P2)

**Goal**: Implement dual-tab user workspace dashboard aggregating buyer and seller items.
**Independent Test**: Click buyer and seller workspace tabs, verify corresponding lists fetch and display correctly.

- [ ] T235 [US3] Create Dashboard Service in backend/app/services/dashboard_service.py
  - **Priority**: High
  - **Dependencies**: T215, T231
  - **Estimated Time**: 2.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `DashboardService` class instantiated with database queries.
  - **Status**: Todo
- [ ] T236 [US3] Implement buyer summary data queries in backend/app/services/dashboard_service.py
  - **Priority**: High
  - **Dependencies**: T235
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Aggregates saved items, sent offers, and buyer conversation list.
  - **Status**: Todo
- [ ] T237 [US3] Implement seller summary data queries in backend/app/services/dashboard_service.py
  - **Priority**: High
  - **Dependencies**: T235
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Aggregates active listings, views, saves, received offers, and seller conversation threads.
  - **Status**: Todo
- [ ] T240 [US3] Expose GET /api/dashboard/buyer in backend/app/routers/dashboard.py
  - **Priority**: High
  - **Dependencies**: T236
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Returns buyer workspace payload matching auth context.
  - **Status**: Todo
- [ ] T241 [US3] Expose GET /api/dashboard/seller in backend/app/routers/dashboard.py
  - **Priority**: High
  - **Dependencies**: T237
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Returns seller workspace payload matching auth context.
  - **Status**: Todo
- [ ] T242 [US3] Create Buyer Dashboard view component in frontend/src/components/BuyerDashboard.tsx
  - **Priority**: High
  - **Dependencies**: T240
  - **Estimated Time**: 3h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Renders saved listings, sent offers grid, and recent views.
  - **Status**: Todo
- [ ] T243 [US3] Create Seller Dashboard view component in frontend/src/components/SellerDashboard.tsx
  - **Priority**: High
  - **Dependencies**: T241
  - **Estimated Time**: 3h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Renders seller listings, received offers lists, and metrics summaries.
  - **Status**: Todo
- [ ] T244 [US3] Update Dashboard page structure to implement dual-tab switcher in frontend/src/app/dashboard/page.tsx
  - **Priority**: High
  - **Dependencies**: T242, T243
  - **Estimated Time**: 2h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Adds visual tab control selector, rendering active view instantly.
  - **Status**: Todo
- [ ] T245 [US3] Integrate sent/received offers table list in frontend/src/components/BuyerDashboard.tsx and frontend/src/components/SellerDashboard.tsx
  - **Priority**: Medium
  - **Dependencies**: T242, T243
  - **Estimated Time**: 2.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Renders list tables with status tags and Accept/Reject buttons.
  - **Status**: Todo
- [ ] T246 [US3] Implement listing analytics metrics grid in frontend/src/components/SellerDashboard.tsx
  - **Priority**: Medium
  - **Dependencies**: T243
  - **Estimated Time**: 2h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Listing cards show views_count and saves_count metrics tags.
  - **Status**: Todo
- [ ] T247 [US3] Write automated integration tests for dashboard endpoints in tests/test_dashboards.py
  - **Priority**: High
  - **Dependencies**: T240, T241
  - **Estimated Time**: 2h
  - **Agent**: QA Agent
  - **Acceptance Criteria**: Pytest asserts correct structure returned for both buyer and seller dashboard roles.
  - **Status**: Todo

---

## Phase 5: User Story 4 - Saved Listings & Recently Viewed (Priority: P2)

**Goal**: Implement item wishlisting (saving) and LocalStorage session list of recently visited listings.
**Independent Test**: Heart a listing, view another listing, confirm save status and recently viewed list update on Buyer Dashboard.

- [ ] T248 [US4] Create Wishlist Service in backend/app/services/wishlist_service.py
  - **Priority**: High
  - **Dependencies**: T204, T210
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: `WishlistService` implements DB toggle methods, blocking self-saves.
  - **Status**: Todo
- [ ] T249 [US4] Expose save/unsave APIs in backend/app/routers/listings.py
  - **Priority**: High
  - **Dependencies**: T248
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Registers endpoints `POST /api/listings/{id}/save` and `/api/listings/{id}/unsave`.
  - **Status**: Todo
- [ ] T250 [US4] Expose GET /api/listings/saved in backend/app/routers/listings.py
  - **Priority**: High
  - **Dependencies**: T248
  - **Estimated Time**: 1.5h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Returns user saved listings.
  - **Status**: Todo
- [ ] T251 [US4] Implement Save Listing heart toggle button in frontend/src/app/listing/[id]/page.tsx
  - **Priority**: High
  - **Dependencies**: T249
  - **Estimated Time**: 2.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Heart button styled and interactive, syncing toggled state with the backend. Hidden if owner.
  - **Status**: Todo
- [ ] T252 [US4] Implement browser LocalStorage Recently Viewed listings manager in frontend/src/app/listing/[id]/page.tsx
  - **Priority**: Medium
  - **Dependencies**: None
  - **Estimated Time**: 2h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Updates LocalStorage list array (max 5 items, latest first) on product layout loads.
  - **Status**: Todo
- [ ] T253 [US4] Write automated tests for wishlist logic in tests/test_wishlists.py
  - **Priority**: High
  - **Dependencies**: T249, T250
  - **Estimated Time**: 1.5h
  - **Agent**: QA Agent
  - **Acceptance Criteria**: Pytest validates toggling, listings save count increments, and self-save validations.
  - **Status**: Todo

---

## Phase 6: User Story 5 - Seller Profile Credibility Card (Priority: P2)

**Goal**: Render seller profile credentials widget including Trust Score, response rate, and rating badges.
**Independent Test**: Load item page, check Seller Profile Card renders correct trust information.

- [ ] T254 [US5] Expose seller public profile statistics API in backend/app/routers/auth.py
  - **Priority**: High
  - **Dependencies**: T210
  - **Estimated Time**: 2h
  - **Agent**: Backend Agent
  - **Acceptance Criteria**: Registers `GET /api/seller/profile/{seller_id}` returning credentials object.
  - **Status**: Todo
- [ ] T255 [US5] Implement dynamic seller rating calculations based on listings and responses in backend/app/services/trust_service.py
  - **Priority**: Medium
  - **Dependencies**: T254
  - **Estimated Time**: 2h
  - **Agent**: Marketplace Intelligence Agent
  - **Acceptance Criteria**: Resolves listing counts and reply rate frequency dynamically.
  - **Status**: Todo
- [ ] T256 [US5] Create Seller Profile Card component in frontend/src/components/SellerProfileCard.tsx
  - **Priority**: High
  - **Dependencies**: T254
  - **Estimated Time**: 2.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Renders stats: Name, Trust Score, listings count, response rate, member duration.
  - **Status**: Todo
- [ ] T257 [US5] Create Trust Badge and Response Rate visual tags in frontend/src/components/TrustBadge.tsx
  - **Priority**: Medium
  - **Dependencies**: T256
  - **Estimated Time**: 1.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Renders rating level badge (Trusted/Verified/New) with matching theme-tailored colors.
  - **Status**: Todo
- [ ] T258 [US5] Integrate Seller Profile Card on Listing Detail Page in frontend/src/app/listing/[id]/page.tsx
  - **Priority**: High
  - **Dependencies**: T256
  - **Estimated Time**: 2h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Replaces placeholder labels with the new visual component.
  - **Status**: Todo

---

## Phase 7: Theme System Integration (Dark/Light/System)

**Purpose**: Adapt dashboard, chat, card, and modal views for Light and Dark theme selections.

- [ ] T259 [P] Implement theme-aware classes for Dashboard Tabs in frontend/src/app/dashboard/page.tsx
  - **Priority**: High
  - **Dependencies**: T244
  - **Estimated Time**: 1.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Tabs match light border variables and dark text contrast thresholds.
  - **Status**: Todo
- [ ] T260 [P] Implement theme-aware styles for Offer list tables in frontend/src/components/BuyerDashboard.tsx and frontend/src/components/SellerDashboard.tsx
  - **Priority**: Medium
  - **Dependencies**: T245
  - **Estimated Time**: 2h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Tables render borders, zebra striping, and text elements clearly in dark/light modes.
  - **Status**: Todo
- [ ] T261 [P] Implement theme-aware styles for Seller Card in frontend/src/components/SellerProfileCard.tsx
  - **Priority**: Medium
  - **Dependencies**: T256
  - **Estimated Time**: 1.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Card component background and border classes adapt to theme modes.
  - **Status**: Todo
- [ ] T262 [P] Implement theme-aware styles for Chat bubbled views in frontend/src/components/ConversationPanel.tsx
  - **Priority**: High
  - **Dependencies**: T220
  - **Estimated Time**: 2h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Left/Right chat bubble background HSL colors have proper contrast in dark mode.
  - **Status**: Todo
- [ ] T263 [P] Implement theme-aware styles for Offer Modal forms in frontend/src/components/OfferModal.tsx
  - **Priority**: Medium
  - **Dependencies**: T233
  - **Estimated Time**: 1.5h
  - **Agent**: Frontend Agent
  - **Acceptance Criteria**: Text input fields and background overlays adapt to dark themes.
  - **Status**: Todo

---

## Phase 8: Polish & Validation

**Purpose**: Final verification, document updates, and database cleaning.

- [ ] T264 Execute end-to-end user flows verification in specs/003-marketplace-role-separation/quickstart.md
  - **Priority**: High
  - **Dependencies**: All code tasks
  - **Estimated Time**: 2h
  - **Agent**: QA Agent
  - **Acceptance Criteria**: Verification scenarios (guards, offers, conversations) complete with all assertions passing.
  - **Status**: Todo
- [ ] T265 Update root level documentation in README.md and release logs
  - **Priority**: Low
  - **Dependencies**: None
  - **Estimated Time**: 1.5h
  - **Agent**: Product Manager Agent
  - **Acceptance Criteria**: README maps out role separation endpoints and configuration guide.
  - **Status**: Todo
