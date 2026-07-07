# Feature Specification: SmartBazaar Rental Marketplace

**Feature Branch**: `010-rental-marketplace`

**Created**: July 6, 2026

**Status**: Draft

**Input**: User description: "Transform SmartBazaar into a Buy • Sell • Rent marketplace supporting calendars, deposits, digital contracts, and inspection return workflows."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List Rental Items (Priority: P1)
As a seller, I want to list my items for Rent, Buy, or both (Buy + Rent), specifying category and pricing periods (hourly/daily/monthly), so that I can monetize my assets flexibly.

**Why this priority**: Core functionality needed to establish a rental catalog. Without listing, no rentals can occur.

**Independent Test**: Can be tested by creating a listing, selecting "Rent" or "Buy + Rent", and verifying it appears with correct rental terms in search results.

**Acceptance Scenarios**:
1. **Given** a seller is logged in, **When** they fill the listing form selecting "Rent Only" and setting category to "Vehicles" with daily rate of ₹1,500 and security deposit of ₹5,000, **Then** the listing is successfully saved and displayed with "Rent Only" badge.
2. **Given** a seller is logged in, **When** they fill the listing form selecting "Buy + Rent" with sale price of ₹12,000 and monthly rental rate of ₹1,000, **Then** both buying and renting options are displayed to buyers.

---

### User Story 2 - Calendar Availability & Booking Requests (Priority: P1)
As a buyer, I want to check availability calendars for rental items, select active dates, and request a booking or instantly book if enabled, to secure my reservation.

**Why this priority**: Avoids scheduling conflicts and secures transaction intent between buyer and seller.

**Independent Test**: Can be tested by selecting dates on the product page calendar, initiating checkout, and checking if the calendar blocks conflicting bookings.

**Acceptance Scenarios**:
1. **Given** a buyer views a rental item, **When** they select dates containing a blocked day (e.g. booked or maintenance), **Then** the "Book Now" action is disabled and a conflict warning is shown.
2. **Given** a buyer requests a rental, **When** they submit the dates, **Then** a booking record is created in "Pending" status and the seller receives a notification to approve or reject.

---

### User Story 3 - Digital Agreements & Deposit Management (Priority: P2)
As a buyer and seller, we want a digital contract containing policies (terms, late fees, damage rules) automatically generated and security deposit holds enforced before dispatch.

**Why this priority**: Legal and financial safety layer to minimize asset damage risk.

**Independent Test**: Can be tested by executing a booking approval, checking that a PDF/text contract is generated, and verifying deposit paid/held states.

**Acceptance Scenarios**:
1. **Given** a seller approves a booking request, **When** the buyer completes checkout, **Then** a rental contract is generated and a security deposit transaction record is marked "Held".
2. **Given** the rental is finished without damages, **When** the inspector approves return, **Then** the deposit transaction is updated to "Released" status.

---

### User Story 4 - Returns Inspection & Damage Deductions (Priority: P3)
As a seller or inspector, I want to follow a return workflow (In Transit → Returned → Inspection) and input damage reports to deduct compensation from held deposits.

**Why this priority**: Completes the lifecycle loop, ensuring asset recovery quality control.

**Independent Test**: Can be tested by initiating return, submitting an inspection checklist, and confirming partial deposit release.

**Acceptance Scenarios**:
1. **Given** an item status is "Returned", **When** the seller submits an inspection report listing a ₹1,500 damage fee, **Then** ₹1,500 is deducted from deposit, the rest is refunded, and status changes to "Completed".

---

### Edge Cases
- **Double Booking**: Two buyers submit requests for overlapping dates simultaneously. The availability engine must lock dates during transaction checkouts to prevent double booking.
- **Extreme Late Returns**: The system handles late returns by calculating penalty fees based on daily rates times late duration and auto-debiting held deposits.
- **Damage exceeds security deposit**: If inspection reports list damages higher than deposit values, the system flags the contract as "Disputed" and triggers manual claim workflows.

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST support three listing types: Buy Only, Rent Only, and Buy + Rent.
- **FR-002**: System MUST categorize rentals under Property, Vehicles, Electronics, Furniture, Fashion, Sports, Construction Equipment, Books, Gaming, and Photography.
- **FR-003**: System MUST support pricing metrics: hourly, daily, weekly, monthly, yearly, and configurable custom durations.
- **FR-004**: Listings MUST support security deposits, delivery, cleaning, late return penalties, and insurance fees.
- **FR-005**: Availability calendars MUST display Blocked, Available, Maintenance, Booked, and Seasonal/Holiday markup pricing dates.
- **FR-006**: The booking engine MUST track statuses: Request, Approved, Rejected, Counter-Offer, Instant Book, Pending, Confirmed, Completed, Cancelled, and Refunded.
- **FR-007**: System MUST prevent calendar overlaps by applying real-time check constraints during dates checkouts.
- **FR-008**: System MUST auto-generate digital contracts with start/end dates, deposit counts, damage policies, and cancellation conditions.
- **FR-009**: Deposit management MUST support Paid, Held, Released, and Partial Damage Deductions states.
- **FR-010**: System MUST track return lifecycles: Pickup, In Transit, Returned, Inspection, Approved, and Dispute logs.
- **FR-011**: AI assistant MUST suggest rental rates, security deposits, and calculate seasonal demand indicators with explainability tags (confidence, explanation).
- **FR-012**: Seller dashboard MUST report Rental Revenue, Occupancy Rates, upcoming returns, and pending booking approvals.
- **FR-013**: Buyer dashboard MUST display Current Rentals, Upcoming Rentals, Invoice list, and active deposit statuses.
- **FR-014**: Search engine MUST support filtering by Rental Duration availability, Deposit limits, and Instant Book options.
- **FR-015**: System MUST degrade gracefully and work offline with cached states if AI pricing endpoints are unavailable.

---

### Key Entities
- **RentalListing**: Represents the listed item. Attributes: type (buy/rent/both), rental rates structure, category, location, deposit, and insurance fees.
- **RentalBooking**: Represents reservation events. Attributes: listing_id, buyer_id, start_date, end_date, total_cost, status, and instant_book toggle.
- **RentalCalendar**: Date availability map. Attributes: listing_id, date, status (available/booked/maintenance), and seasonal price override.
- **RentalContract**: Legally binding terms. Attributes: booking_id, terms_text, signature_status, and policy configurations.
- **RentalDeposit**: Financial safety vault. Attributes: booking_id, amount_held, status (held/released/partial), and deduction_amount.
- **RentalReturn**: Return quality validation log. Attributes: booking_id, status (returned/inspecting/completed), damage_cost, and inspection_notes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 100% of overlapping booking attempts must be auto-blocked by the conflict detection engine before payment.
- **SC-002**: Every AI rental recommendation payload must contain a confidence score (0-100%) and a natural language explanation statement.
- **SC-003**: Buyers can locate, select dates, sign contract, and reserve an item in under 3 minutes.
- **SC-004**: Offline mode must trigger within 2 seconds if backend services are offline, preventing page crashes and showing cached list details.

---

## Assumptions
- Rental payments and deposit holds are simulated/mocked internally.
- Existing user profiles and session stores will be shared by the rental engine.
- Users have standard modern screen configurations supporting standard grid layouts.
- Holiday calendars are populated with standard regional holiday patterns.
