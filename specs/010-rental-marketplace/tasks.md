# V6 Enterprise Task Tracker

## Phase 1: Demo Mode Fix (CRITICAL)
- [x] DEMO-001 Fix api.ts — remove auto-offline on individual request errors
- [x] DEMO-002 Enhance SessionProvider — retry logic + periodic re-check
- [x] DEMO-003 Add recovery toast when backend reconnects

## Phase 2: Real Backend Connections
- [x] BACK-001 Homepage — fetch categories dynamically from analytics API
- [x] BACK-002 Homepage — remove hardcoded category counts
- [x] BACK-003 Listing detail — add allow_sale/allow_rental to interface
- [x] BACK-004 Listing detail — conditional Buy Now / Rent Now / Both buttons
- [x] BACK-005 Listing detail — remove fake price history bars
- [x] BACK-006 Analytics page — add user-specific /api/analytics/my endpoint
- [ ] BACK-007 Remove localStorage recently viewed — use DB endpoint

## Phase 3: Sell/Rent/Hybrid Model
- [x] RENT-001 Verify listing model has allow_sale, allow_rental, rental_price_per_day
- [x] RENT-002 Expose rental fields in listing response schema
- [x] RENT-003 ListingCard — add FOR SALE / FOR RENT / BUY & RENT badges
- [x] RENT-004 Create listing page — verify sell/rent toggle saves correctly

## Phase 4: Rental Marketplace Page
- [ ] MKTPL-001 Redesign /rent page as dedicated rental marketplace

## Phase 5: User Ownership Filters
- [x] OWN-001 Backend — add /api/analytics/my (user-specific)

- [ ] OWN-002 Verify notifications are per-user
- [ ] OWN-003 Verify dashboards only show own data

## Phase 6: Internationalization
- [x] I18N-001 Create /i18n/ directory with 10 language JSON files
- [x] I18N-002 Create useTranslation() hook
- [x] I18N-003 Add preferred_language to user model/profile
- [ ] I18N-004 Apply i18n to Navbar
- [ ] I18N-005 Apply i18n to Homepage
- [ ] I18N-006 Apply i18n to Listing Detail
- [x] I18N-007 Language switcher in Navbar


---

## Phase 4: User Story 2 - Calendar Availability & Booking Engine (Priority: P1)

**Story Goal**: Manage dates availability calendars and reject double-bookings.

**Independent Test**: Book overlapping dates for the same item and verify a validation conflict triggers.

- [x] RNT-017 [US2] Create date overlap conflict check constraint logic in `backend/app/services/booking_service.py`
- [x] RNT-018 [P] [US2] Implement booking request creation routes in `backend/app/routers/rental.py`
- [x] RNT-019 [US2] Build owner approval state handlers in `backend/app/routers/rental.py`
- [x] RNT-020 [US2] Support counter offer workflows in `backend/app/routers/rental.py`
- [x] RNT-023 [P] [US2] Support instant booking flags toggles in `backend/app/routers/rental.py`
- [x] RNT-024 [P] [US2] Render RentalCalendar layout components in `frontend/src/components/RentalCalendar.tsx`
- [x] RNT-025 [US2] Support manual dates blocking configurations in `frontend/src/components/RentalCalendar.tsx`
- [x] RNT-026 [US2] Implement maintenance date flags in `frontend/src/components/RentalCalendar.tsx`
- [x] RNT-027 [US2] Configure recurring calendar schedules in `frontend/src/components/RentalCalendar.tsx`
- [x] RNT-028 [US2] Apply seasonal pricing calendar adjustments in `backend/app/services/rental_service.py`
- [x] RNT-054 [P] [US2] Implement AI rental demand prediction algorithm in `backend/app/services/ai_service.py`
- [x] RNT-056 [P] [US2] Implement AI occupancy forecast reports in `backend/app/services/ai_service.py`

---

## Phase 5: User Story 3 - Digital Contracts & Deposit Holds (Priority: P2)

**Story Goal**: Enforce security deposit checks and display digital rental contracts.

**Independent Test**: Complete checkout payment simulation, sign contract, and confirm status is "Held".

- [x] RNT-021 [US3] Create cancellation request paths in `backend/app/routers/rental.py`
- [x] RNT-022 [US3] Create extension request paths in `backend/app/routers/rental.py`
- [x] RNT-029 [P] [US3] Implement pricing fee breakdown schema in `backend/app/schemas/rental.py`
- [x] RNT-030 [US3] Create security deposit held ledger logic in `backend/app/services/deposit_service.py`
- [x] RNT-031 [P] [US3] Calculate late return multiplier penalties in `backend/app/services/rental_service.py`
- [x] RNT-032 [P] [US3] Support cleaning fee parameter logic in `backend/app/schemas/rental.py`
- [x] RNT-033 [P] [US3] Support insurance surcharge validation logic in `backend/app/schemas/rental.py`
- [x] RNT-034 [P] [US3] Render Invoice transaction panels in `frontend/src/components/InvoiceCard.tsx`
- [x] RNT-035 [P] [US3] Render ContractViewer signature interface in `frontend/src/components/ContractViewer.tsx`
- [x] RNT-036 [US3] Implement custom terms details viewport in `frontend/src/components/ContractViewer.tsx`
- [x] RNT-037 [US3] Build damage policy checklists in `frontend/src/components/ContractViewer.tsx`
- [x] RNT-038 [US3] Build cancellation policy guidelines inside `frontend/src/components/ContractViewer.tsx`

---

## Phase 6: User Story 4 - Returns Inspection & Refunds (Priority: P3)

**Story Goal**: Track returns quality checklist and complete refunds or partial deductions.

**Independent Test**: Inspector submits damage report, confirm deductions from deposit.

- [x] RNT-039 [US4] Create returns tracker workflows timelines in `frontend/src/components/ReturnTracker.tsx`
- [x] RNT-040 [P] [US4] Implement inspection items checklist in `frontend/src/components/ReturnTracker.tsx`
- [x] RNT-041 [US4] Support photo uploads for damage reports in `frontend/src/components/ReturnTracker.tsx`
- [x] RNT-042 [US4] Implement deposit releases or partial refunds calculations in `backend/app/services/deposit_service.py`

---

## Phase 7: Buyer & Seller Experience Integrations

- [x] RNT-043 Render Active Rentals tabs panel in `frontend/src/components/BuyerDashboard.tsx`
- [x] RNT-044 Display reservation logs in `frontend/src/components/BuyerDashboard.tsx`
- [x] RNT-045 Display current rentals details inside `frontend/src/components/BuyerDashboard.tsx`
- [x] RNT-046 Show deposit refund progress indicators in `frontend/src/components/BuyerDashboard.tsx`
- [x] RNT-047 Render downloadable invoices lists in `frontend/src/components/BuyerDashboard.tsx`
- [x] RNT-048 Render Rental Revenue metrics analytics in `frontend/src/components/SellerDashboard.tsx`
- [x] RNT-049 Render occupancy speed tracking chart widgets in `frontend/src/components/SellerDashboard.tsx`
- [x] RNT-050 Show returns due schedule timelines inside `frontend/src/components/SellerDashboard.tsx`
- [x] RNT-051 Embed booking analytics requests metrics inside `frontend/src/components/SellerDashboard.tsx`
- [x] RNT-052 Render calendars management views in `frontend/src/components/SellerDashboard.tsx`
- [x] RNT-055 [P] Add AI rental earnings analytics forecast calculations in `backend/app/services/ai_service.py`
- [x] RNT-058 [P] Integrate security fraud scoring algorithms in `backend/app/services/ai_service.py`
- [x] RNT-059 Add Rent toggles and duration selectors in `frontend/src/app/search/page.tsx`
- [x] RNT-060 Optimize calendar date queries in search routes in `backend/app/routers/listings.py`
- [x] RNT-061 Filter listings by coordinate bounding location boxes in `backend/app/routers/listings.py`
- [x] RNT-062 Calculate distances for proximity sorting in `backend/app/routers/listings.py`
- [x] RNT-063 Trigger notification alerts on booking actions in `backend/app/services/notification_service.py`
- [x] RNT-064 Dispatch automatic return reminders alerts in `backend/app/services/notification_service.py`
- [x] RNT-065 Alert users on deposit release status updates in `backend/app/services/notification_service.py`
- [x] RNT-066 Alert users on approaching rental expiration markers in `backend/app/services/notification_service.py`
- [x] RNT-067 Integrate profile verification locks during rent checkouts in `backend/app/routers/rental.py`
- [x] RNT-068 Verify listing quality scores before publication in `backend/app/services/ai_service.py`
- [x] RNT-069 Apply deposit lock guarantees limits checks in `backend/app/services/deposit_service.py`
- [x] RNT-070 Implement security audit alerts for suspicious booking patterns in `backend/app/services/ai_service.py`
