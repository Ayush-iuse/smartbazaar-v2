# Feature Specification: V2 Seller CRM, Buyer Trust Engine & Verification Platform

**Feature Branch**: `005-crm-trust-verification`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "SmartBazaar V2 – Seller CRM, Buyer Trust Engine & Verification Platform"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seller CRM & Lead Dashboard (Priority: P1)

As a seller, I want to view my CRM dashboard with structured leads and conversion metrics so that I can prioritize negotiating with high-intent buyers and manage my sales pipelines.

**Why this priority**: Core value of the CRM platform. Allows sellers to track active buyers and conversion rates, turning a simple listing site into a professional commerce dashboard.

**Independent Test**: Can be tested by creating active chat conversations between separate buyer accounts and a seller's listing, verifying that the CRM lists these buyers as leads, displays correct metrics (Total Buyers, Active Buyers, Unread Buyers), and permits pipeline stage transitions.

**Acceptance Scenarios**:
1. **Given** a seller has 3 active conversations with different buyers, **When** the seller views the CRM dashboard, **Then** the seller sees:
   - Total Buyers count is 3.
   - Lead cards for each buyer showing their respective listings and last active timestamps.
2. **Given** a buyer has sent an offer for a listing, **When** the seller checks the CRM, **Then** the lead's pipeline status shows "Negotiating" or "Offer Sent", and the "Offers Pending" counter is incremented by 1.
3. **Given** a seller is viewing a lead's profile, **When** the seller updates the pipeline stage to "Engaged" or adds a private note "High Intent VIP", **Then** the change is saved and note is displayed only to the seller.

---

### User Story 2 - Buyer Trust Score & Reputation Profile (Priority: P2)

As a seller, I want to check a buyer's trust score and reputation profile before accepting their offer or sharing contact details, to protect myself against fraud and spammers.

**Why this priority**: Solves the security and safety objectives of the marketplace. Ensures that trustworthy buyers are highlighted and suspicious users are flagged.

**Independent Test**: Can be tested by looking up different buyer reputation profiles, verify they compute score points (0-100) from parameters (account age, completed transactions, cancellation rate), and display corresponding trust levels (New, Trusted, Verified, Elite).

**Acceptance Scenarios**:
1. **Given** a buyer has an account age of 1 day and has sent 5 rapid duplicate offers, **When** the system calculates their trust score, **Then** the trust score decreases, and their risk level is classified as "Suspicious" or "High Risk".
2. **Given** a buyer has completed 10 successful transactions and has a 95% response rate, **When** a seller views their profile in the chat pane, **Then** they see the "Elite Buyer" trust badge.

---

### User Story 3 - Seller Verification System (Priority: P3)

As a seller, I want to submit my phone number, email address, and Government ID documents to earn verification badges, showing buyers that my listings are authentic and reputable.

**Why this priority**: Essential to build overall platform safety and increase listing-to-offer conversions by signaling seller credibility.

**Independent Test**: Can be verified by submitting an email OTP, phone OTP, and uploading document files, confirming that verification status changes to "Submitted" or "Approved", and badge shows on the seller's listings.

**Acceptance Scenarios**:
1. **Given** a seller's email is unverified, **When** the seller requests email verification and inputs the correct 6-digit OTP, **Then** the status updates to "Email Verified".
2. **Given** a seller uploads a PDF or PNG document for Government ID verification, **When** a system admin reviews and approves the document, **Then** the seller's profile and all their listings display the "Government ID Verified" badge.

---

## Edge Cases

- **OTP Expiry**: The verification OTP is requested but entered after the 5-minute validity window. System must block verification, display a helpful warning, and allow requesting a new code.
- **File Upload Limits**: A user attempts to upload a 20MB high-resolution document file for verification. System must intercept this on the client side, enforce a 5MB limit, and return a clean validation error.
- **Multiple Concurrent Buyers**: Multiple buyers negotiate for the same listing. The seller CRM must track each buyer as a separate lead pipeline instance associated with the listing, without overlapping notes, pipeline statuses, or timeline events.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute a CRM Lead Score (0-100) for every active buyer based on interaction frequency, offer counts, response speed, listing views, and wishlist activity.
- **FR-002**: System MUST categorize buyer leads into tiers: Cold Lead (0-30), Warm Lead (31-60), Hot Lead (61-80), and Priority Lead (81-100).
- **FR-003**: System MUST allow sellers to save private notes and assign tags/labels (e.g., VIP, High Intent, Suspicious, Repeat Buyer) to buyer leads, ensuring these remain completely invisible to the buyers.
- **FR-004**: System MUST maintain a Buyer Timeline displaying journey events: conversation started, listing views, listing saves, offers sent, offers accepted/rejected, and verification badges earned.
- **FR-005**: System MUST compute a Buyer Trust Score (0-100) mapping to Trust Levels: New Buyer, Trusted Buyer, Verified Buyer, and Elite Buyer.
- **FR-006**: System MUST support an admin document review queue for Government ID verification uploads.
- **FR-007**: System MUST implement automatic fraud and spam filters that calculate a Risk Score (Low, Medium, High, Suspicious) and flag accounts triggering spam keywords or offer spam floods.
- **FR-008**: System MUST support storage of Government ID documents securely by writing uploaded files to a protected local folder under `/uploads/verification` and restricting download access to authorized admin sessions.
- **FR-009**: System MUST automatically compute Lead Scores in the background using a periodic background worker task running every 5 minutes to avoid database lock contention.
- **FR-010**: System MUST track Revenue Potential for active deals computed by summing the prices of all active listings that have ongoing buyer inquiry chat threads.

---

### Key Entities

- **LeadScore**: Maps a buyer's activity to a listing and seller, storing raw inputs, calculated score (0-100), and lead category.
- **BuyerTrustScore**: Holds global trust evaluations for a buyer, tracking account age points, completed transactions, cancellations, and active reports count.
- **SellerVerification**: Tracks verification requests, storing status (Pending, Approved, Rejected), verification levels (Email, Phone, ID), submission date, and reviewer notes.
- **VerificationDocument**: Holds paths to uploaded ID files (securely restricted), content types, and metadata.
- **BuyerNote**: Seller-created private annotations associated with a buyer lead.
- **BuyerLabel**: Seller-assigned tag labels.
- **BuyerTimelineEvent**: Logs individual steps in a buyer's relationship history.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sellers can update a buyer's pipeline stage or add private notes in under 1 second.
- **SC-002**: Lead score calculations and trust score updates must complete within 2 seconds of trigger events.
- **SC-003**: The CRM Dashboard overview aggregates all lead metrics (Total, Active, Unread, Conversion Rate) instantly, handling up to 100 active leads without UI lag.
- **SC-004**: Users are able to verify their email or phone number via OTP within 3 steps.

---

## Assumptions

- **Local Storage / Filesystem**: For this version (V2), document uploads are saved to the local container volume under `/uploads/verification` to comply with the Zero Cloud Dependencies principle.
- **Mock SMS Gateway**: Phone OTP verification utilizes a mock SMS dispatch service that logs the OTP code to standard output/logs, avoiding external SMS gateway fees.
- **Existing User/Offers Table**: The new CRM services will join against the existing `users` and `offers` tables.
- **Moderator Role**: A simple mock admin flag on the `User` model will be used to authorize users to access the verification document review queues.
