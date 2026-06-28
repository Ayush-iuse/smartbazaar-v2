# Feature Specification: Marketplace Role Separation & Real Buyer-Seller Ecosystem

**Feature Branch**: `003-marketplace-role-separation`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Evolve SmartBazaar AI from a listing board with self-interactions into a real marketplace with role separation, real messaging, offers system, and dedicated buyer/seller dashboards."

---

## 1. Problem Statement & Vision

### Problem Statement
The current SmartBazaar AI system acts as a static listing board where users can interact with their own listings. A user can chat with themselves, buy their own listings, save their own items, and make offers on their own listings. There is no structural distinction between buyers, sellers, and listing owners. This breaks the peer-to-peer (P2P) marketplace logic, creating unrealistic user journeys and lacking clear status tracking for offers and real negotiations.

### Product Vision
Transform SmartBazaar AI into a real P2P marketplace by introducing explicit role separation and preventing self-interactions. The application will restrict actions based on ownership, build a real buyer-seller messaging channel, and add a comprehensive price-negotiation (Offer) system. Furthermore, users will benefit from tailored workspaces: a Seller Dashboard to manage inventory, incoming offers, and conversations; and a Buyer Dashboard to track saved items, sent offers, and recent negotiations.

---

## 2. Target Personas

### 1. Casual Buyer ("Divya")
- **Needs**: Wants to search and browse listings, save interesting items, negotiate prices, and communicate with sellers directly to finalize local meetups.
- **Pain Points**: Hates seeing buy/offer controls on items she owns; finds it hard to track all sent offers and ongoing chats across different listings.

### 2. Private Seller ("Sameer")
- **Needs**: Wants to list items, display credibility (Trust Score, response rate), receive and respond to buyer inquiries, and manage price negotiations (accept/reject offers).
- **Pain Points**: Receives duplicate self-chats and self-buys on listing pages; lacks a single control panel to accept/reject active offers from buyers.

---

## 3. User Scenarios & Testing (User Stories)

### User Story 1 — Real Messaging & Self-Chat Prevention (Priority: P1)
- **Description**: As a buyer, I want to send messages to listing sellers, and as a seller, I want to reply, while preventing users from messaging themselves, so that communications represent real buyer-seller negotiations.
- **Why this priority**: Communication is the core driver of P2P transactions.
- **Independent Test**: Log in as User A. Go to a listing owned by User B. Click "Chat Seller" and send a message. Verify the chat displays in User A's messages. Log in as User B, view the message in the dashboard, and send a reply. Verify User B cannot chat on their own listing.
- **Acceptance Scenarios**:
  1. **Given** a listing owned by another seller, **When** the buyer sends a message, **Then** a persistent conversation is established between the buyer, the seller, and the listing.
  2. **Given** a listing owned by the logged-in user, **When** viewing the listing page, **Then** the "Chat Seller" option is disabled or hidden, and backend requests to chat with oneself return a permission error.
  3. **Given** a conversation, **When** any participant sends a message, **Then** it persists in the database and is rendered in chronological order.

---

### User Story 2 — Price Negotiation & Offers System (Priority: P1)
- **Description**: As a buyer, I want to make custom monetary offers on items, and as a seller, I want to accept or reject them, so that we can negotiate prices.
- **Why this priority**: Pricing flexibility is key to closing P2P deals.
- **Independent Test**: Buyer makes an offer of ₹40,000 on a listing priced at ₹42,000. Seller views the offer on their dashboard and clicks "Accept". The listing state is updated to "Sold", the offer changes to "Accepted", and other active offers on the listing are marked "Expired".
- **Acceptance Scenarios**:
  1. **Given** a listing, **When** a buyer submits a custom price offer, **Then** an offer is recorded in state `Pending`.
  2. **Given** a pending offer, **When** the seller clicks "Accept", **Then** the offer status changes to `Accepted`, the listing is marked as `Sold`, and all other pending offers for that listing change to `Expired`.
  3. **Given** a pending offer, **When** the seller clicks "Reject", **Then** the offer status changes to `Rejected` and is locked from further actions.
  4. **Given** a pending offer, **When** the buyer clicks "Cancel", **Then** the offer status changes to `Expired` (or `Cancelled`).

---

### User Story 3 — Buyer & Seller Dashboards (Priority: P2)
- **Description**: As a user, I want a dual-mode dashboard layout so that I can separately manage my buying activities (saved items, sent offers, messages) and selling activities (my listings, received offers, messages, analytics).
- **Why this priority**: Organizes user workflows and reduces context switching.
- **Independent Test**: Open the dashboard, switch between "Buyer" and "Seller" tabs, and verify the correct listings, messages, and offers load corresponding to the selected role.
- **Acceptance Scenarios**:
  1. **Given** a logged-in user, **When** accessing the Dashboard, **Then** the system displays two tabs: "Buyer Dashboard" and "Seller Dashboard".
  2. **Given** the Buyer Dashboard tab, **When** loaded, **Then** it displays: Saved Listings, Offers Sent, Buyer Messages, and Recently Viewed items.
  3. **Given** the Seller Dashboard tab, **When** loaded, **Then** it displays: My Listings, Offers Received, Seller Messages, and Store Analytics.

---

### User Story 4 — Saved Listings & Recently Viewed (Priority: P2)
- **Description**: As a buyer, I want to save listings (using a heart icon) and view my recently visited items so that I can quickly return to items I like.
- **Why this priority**: Essential for buyer convenience and navigation.
- **Independent Test**: Click the heart icon on a listing. Navigate to the Buyer Dashboard and check that the item appears in the "Saved Listings" list. View three different listings, then check that they appear in the "Recently Viewed" list in reverse-chronological order.
- **Acceptance Scenarios**:
  1. **Given** a listing page, **When** a buyer clicks the heart icon, **Then** the listing is saved to their profile and the heart icon changes to a filled state.
  2. **Given** a saved listing, **When** the buyer clicks the heart icon again, **Then** it is removed from their saved list.
  3. **Given** a listing is owned by the current user, **When** viewed, **Then** the heart icon is hidden or disabled to prevent saving one's own item.

---

### User Story 5 — Seller Profile Credibility Card (Priority: P2)
- **Description**: As a buyer viewing a listing, I want to see the seller's profile summary containing their name, trust score, listings count, response rate, and member duration, so that I can evaluate their credibility.
- **Why this priority**: Builds system-wide safety and transparency.
- **Independent Test**: Open a listing page, locate the Seller Card, and verify it renders the seller's trust stats without placeholder or empty labels.
- **Acceptance Scenarios**:
  1. **Given** any listing detail page, **When** rendered, **Then** a "Seller Profile Card" is shown.
  2. **Given** the Seller Profile Card, **When** loaded, **Then** it displays: Full Name, Trust Score (0-100), Active Listings Count, Response Rate (%), and Member Since date.

---

## 4. Edge Cases

- **Self-Interaction Backend Bypass**: If a user attempts to bypass the UI and make an API request to chat, offer, or save their own listing, the backend must block the request and return an HTTP `400 Bad Request` or `403 Forbidden` error.
- **Listing Deleted with Active Offers**: If a seller deletes a listing, all associated pending offers must automatically update to `Expired` and the associated conversations must remain read-only.
- **Double Offer Creation**: If a buyer already has a pending offer on a listing, attempting to make another offer must update the existing pending offer amount rather than creating a duplicate record.
- **Listing Marked Sold**: Once a listing's status becomes "Sold", all buyer buttons ("Buy Now", "Make Offer", "Save Listing") must be replaced by a prominent "SOLD" badge.

---

## 5. Requirements

### Functional Requirements

- **FR-001 (Self-Interaction Prevention)**: The system MUST validate that the current user ID is not equal to the listing's seller ID for any buyer-specific action (Save, Chat, Offer, Buy Now).
- **FR-002 (Buy Now Action)**: Clicking the "Buy Now" button MUST present a confirmation modal. On confirmation, the system MUST create an auto-accepted offer, mark the listing status as "Sold", expire other pending offers, and automatically post an system message to the chat: "I would like to buy this item now!".
- **FR-003 (Offers State Machine)**: The system MUST enforce valid state transitions for offers:
  - `Pending` -> `Accepted` (updates listing to "Sold", updates other pending offers on the listing to `Expired`)
  - `Pending` -> `Rejected`
  - `Pending` -> `Expired` (or `Cancelled` by buyer)
- **FR-004 (Saved Listings)**: The system MUST allow users to toggle the "Saved" status of other users' listings and persist the state.
- **FR-005 (Recently Viewed)**: The system MUST record recently visited listings for the buyer (maximum 5 items) and store them in the browser's session/local storage to optimize loading speed.
- **FR-006 (Unified Dashboard)**: The dashboard MUST render distinct sections for Buyer and Seller activities via a dual-tab component, showing data specific to that role.
- **FR-007 (Real Messaging)**: The system MUST remove all automated/mock seller replies and ensure all chat messages represent real user interactions.

---

### Non-Functional Requirements

- **NFR-001 (Performance)**: Dashboard role-based tab switching must render updated listing/offer records in under 300ms.
- **NFR-002 (Security)**: All endpoints mutating listings or offers must verify permissions against the active JWT user session context on the backend.
- **NFR-003 (Theme)**: Dashboard modifications and new seller card components must follow the existing Light/Dark theme styles seamlessly without UI blinking.

---

### Business Rules

- **BR-001**: A user cannot save, offer on, chat on, or buy their own listings.
- **BR-002**: Accepting an offer locks the listing from all future purchases, changes its status to "Sold", and sets all other active offers on that listing to "Expired".
- **BR-003**: Message threads are unique per `(Listing, Buyer, Seller)` combination. A buyer and a seller can only have one message thread per listing.

---

### Security Rules

- **SR-001**: Mutating listing files or deleting items is restricted to the seller who owns the listing.
- **SR-002**: Message retrieval queries must restrict records to conversations where the caller's user ID matches either the buyer_id or the seller_id.
- **SR-003**: Only the listing owner can accept/reject offers, and only the offer creator can cancel/withdraw their pending offers.

---

### Permission Matrix

| Action | Seller (Owner) | Buyer (Non-Owner) | Guest (Unauthenticated) |
| :--- | :---: | :---: | :---: |
| **View Listing Detail** | Yes | Yes | Yes |
| **Save Listing (Heart)** | No | Yes | Redirect to Login |
| **Chat Seller** | No | Yes | Redirect to Login |
| **Make Offer** | No | Yes | Redirect to Login |
| **Buy Now** | No | Yes | Redirect to Login |
| **Accept/Reject Offer** | Yes | No | No |
| **Cancel Offer** | No | Yes | No |
| **Edit/Delete Listing** | Yes | No | No |

---

### API Requirements

#### Conversations & Messages
- `POST /api/conversations`: Initiate/fetch a conversation.
  - Body: `{"listing_id": int}`
  - Rule: Seller cannot initiate conversation on own listing.
- `GET /api/conversations`: List all conversations of the current user.
  - Query Params: `role` (`buyer` or `seller` filter)
- `GET /api/conversations/{conversation_id}/messages`: Get message history.
  - Rule: User must be a participant.
- `POST /api/conversations/{conversation_id}/messages`: Send message in thread.
  - Body: `{"content": string}`
  - Rule: User must be a participant.

#### Offers
- `POST /api/offers`: Place a price offer.
  - Body: `{"listing_id": int, "offer_amount": float}`
  - Rule: Buyer only. Cannot offer on own listing.
- `GET /api/offers/sent`: Retrieve offers made by the user.
- `GET /api/offers/received`: Retrieve offers received on user's listings.
- `POST /api/offers/{offer_id}/accept`: Accept a pending offer.
  - Rule: Seller (listing owner) only.
- `POST /api/offers/{offer_id}/reject`: Reject a pending offer.
  - Rule: Seller (listing owner) only.
- `POST /api/offers/{offer_id}/cancel`: Cancel/withdraw a pending offer.
  - Rule: Buyer (offer maker) only.

#### Saved Listings
- `POST /api/listings/{listing_id}/save`: Save listing to favorites.
  - Rule: Buyer only. Cannot save own listing.
- `POST /api/listings/{listing_id}/unsave`: Unsave a listing.
- `GET /api/listings/saved`: Retrieve saved listings.

---

### Database Requirements (Logical Model)

#### 1. Entity: `Conversation`
- `id` (Primary Key, Integer)
- `listing_id` (ForeignKey -> Listing.id, Cascade Delete)
- `buyer_id` (ForeignKey -> User.id, Cascade Delete)
- `seller_id` (ForeignKey -> User.id, Cascade Delete)
- `created_at` (DateTime, Default: UTC Now)

#### 2. Entity: `Message` (Updated)
- `id` (Primary Key, Integer)
- `conversation_id` (ForeignKey -> Conversation.id, Cascade Delete)
- `sender_id` (ForeignKey -> User.id, Cascade Delete)
- `content` (Text, Nullable: False)
- `created_at` (DateTime, Default: UTC Now)

#### 3. Entity: `Offer`
- `id` (Primary Key, Integer)
- `listing_id` (ForeignKey -> Listing.id, Cascade Delete)
- `buyer_id` (ForeignKey -> User.id, Cascade Delete)
- `seller_id` (ForeignKey -> User.id, Cascade Delete)
- `offer_amount` (Float, Nullable: False)
- `status` (String, Default: "Pending" - options: "Pending", "Accepted", "Rejected", "Expired")
- `created_at` (DateTime, Default: UTC Now)

#### 4. Entity: `SavedListing` (Favorites)
- `id` (Primary Key, Integer)
- `user_id` (ForeignKey -> User.id, Cascade Delete)
- `listing_id` (ForeignKey -> Listing.id, Cascade Delete)
- `created_at` (DateTime, Default: UTC Now)

#### 5. Entity: `Listing` (Updated Fields)
- `status` (String, Default: "Active" - options: "Active", "Sold")

---

### Frontend Requirements

- **Listing Details Page**:
  - Render "Buy Now" and "Make Offer" buttons + "Save Listing" heart icon for buyers.
  - Hide or display disabled state if current user is the listing owner.
  - Render the **Seller Profile Card** with name, trust score, listings count, response rate, and membership duration.
  - Show "SOLD" badge if listing status is "Sold".
- **Unified Dashboard**:
  - Implement a clean tabs bar: "Buy Workspace" vs "Sell Workspace".
  - **Buy Workspace**: Saved Listings grid, Sent Offers list (with status tags), Messages list, and Recently Viewed slider.
  - **Sell Workspace**: My Listings grid (with delete/edit actions), Received Offers list (with Accept/Reject buttons), Messages list, and Analytics stats cards.
- **Offer Interaction**:
  - Modal overlay for making an offer, validating input is positive and numeric.
  - Actions on received offers: immediate state changes on clicking Accept/Reject, reflecting updated state dynamically without full page reloads.

---

## 6. Success Criteria (Measurable Outcomes)

- **SC-001**: 100% of self-interaction attempts (chat, offer, buy, save) are blocked by the backend, returning validation status codes.
- **SC-002**: Users can toggle between the Buyer and Seller Dashboard workspaces in under 150ms.
- **SC-003**: Accepting an offer updates the listing status to "Sold" and changes related pending offers to "Expired" in under 1.5 seconds.
- **SC-004**: Real messaging threads load history in under 200ms when a conversation is selected.
- **SC-005**: All UI changes adapt to Dark and Light modes correctly according to tailwind theme selectors.

---

## 7. Assumptions

- **Mock Data Alignment**: Seeding script (`seed.py`) will be updated to include initial conversations, messages, offers, and saved listings.
- **No Escrow / Shipping**: Buy/Purchase and Offers are strictly status-based and chat-notified; no actual payments or delivery integration will be built.
- **Session-Based Authentication**: The system will fetch the logged-in user profile from the existing JWT cookie/header session context.

---

**Version**: 1.0.0 | **Ratified**: 2026-06-19 | **Last Amended**: 2026-06-19
