# Feature Specification: SmartBazaar V2 — Production Marketplace Platform

**Feature Branch**: `004-marketplace-v2-platform`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "SmartBazaar V2 — Production Marketplace Platform. VISION: Transform SmartBazaar AI from a marketplace demo into a production-grade marketplace platform inspired by OLX, Facebook Marketplace, OfferUp, Carousell, WhatsApp Business, LinkedIn Trust System, Amazon Recommendations..."

---

## 1. Problem Statement & Vision

### Problem Statement
Currently, SmartBazaar AI operates primarily as a simplified CRUD listing application. Buyer and seller interactions are basic: the chat lacks real-time states (typing indicators, delivery receipts, presence), there is no structured way for sellers to organize prospective buyers (no CRM/lead pipeline), there is a lack of advanced multi-tier trust systems to prevent scamming, listing discovery relies entirely on basic searches without personalized recommendation feeds or interactive conversational helpers, and session security is basic (lacks refresh tokens, device tracking, and rotation). To feel like a real production marketplace startup, the platform must bridge these operational gaps.

### Product Vision
Evolve SmartBazaar AI V2 into a production-grade, secure peer-to-peer (P2P) marketplace platform. The vision is to combine real-time transactional messaging (WebSockets with delivery/read receipts, typing states, and media sharing) with a comprehensive Seller CRM Workspace (lead pipelines, funnel analytics, seller notes) and an objective user trust network (multi-tier verification, activity trust scoring). Discoverability will be boosted by Amazon-style recommendation feeds (location, views, category interests) and an interactive AI Marketplace Copilot. Finally, the landing experience will be wrapped in a high-performing 3D WebGL showcase (Three.js marketplace globe, animated stats) backed by enterprise-level session security policies.

---

## 2. Target Personas

### 1. The Power Seller ("Sameer")
* **Needs**: Wants to list items, quickly determine buyer reliability via trust levels, communicate in real-time to finalize sales, and manage buyer inquiries as structured leads through a CRM dashboard to increase conversion rates.
* **Pain Points**: Lacks insights into who is a serious buyer vs. a casual window shopper; spends too much time manually organizing chat threads and offers across multiple active listings.

### 2. The Apprehensive Buyer ("Divya")
* **Needs**: Wants a personalized homepage feed, a conversational copilot helper to discover listings, real-time messaging indicating when a seller is online/typing, and visible trust verifications to avoid scams.
* **Pain Points**: Fears getting defrauded by unverified sellers; finds standard keyword filtering tedious and time-consuming.

### 3. The Platform Administrator ("Manish")
* **Needs**: Wants an administrative moderation workspace containing user/listing report logs, automatic scam/spam keyword flagging, and control mechanisms to ban or approve listings.
* **Pain Points**: Manual content filtering is slow and unscalable; lacks structured tools to track reported items and security events.

---

## 3. User Scenarios & Testing (User Stories)

### User Story 1 — Real-Time Transactional Messaging & Chat Inbox (Priority: P1)
* **Description**: As a buyer or seller, I want to communicate using a rich WebSocket-enabled chat that provides typing indicators, online presence status, delivery/read receipts, voice notes, and listing image/offer sharing so that conversations feel responsive and professional.
* **Why this priority**: Core interaction channel of a P2P marketplace.
* **Independent Test**: Log in as Buyer. Open a listing and send a message. Log in as Seller in another browser, open the chat inbox, see the message marked as "delivered". Seller types (Buyer sees a typing indicator), opens the thread (Buyer sees the status update to "read"), and seller replies.
* **Acceptance Scenarios**:
  1. **Given** a buyer and seller in a chat thread, **When** one user is actively typing, **Then** the other user sees a typing indicator in real-time.
  2. **Given** a sent message, **When** it reaches the server, **Then** its status updates to "Delivered"; when opened by the recipient, it updates to "Read".
  3. **Given** a chat thread, **When** a user uploads a voice note or image, **Then** the file is processed and rendered inline within the chat bubble.

---

### User Story 2 — Seller CRM Workspace & Deal Pipeline (Priority: P1)
* **Description**: As a seller, I want to view my buyer inquiries inside a dedicated CRM pipeline, categorizing leads, editing notes, viewing buyer trust ratings, and analyzing lead conversions so I can focus on hot deals.
* **Why this priority**: Crucial differentiator that empowers P2P sellers to organize negotiations efficiently.
* **Independent Test**: Navigate to the Seller Dashboard. Click "CRM Workspace". View the list of buyers sorted by last activity. Toggle a buyer's state from "Active" to "Hot Lead", write a private notes log, and view the buyer's Trust Score.
* **Acceptance Scenarios**:
  1. **Given** a seller's workspace, **When** buyers message or offer on listings, **Then** the seller sees them listed in the CRM panel with their trust score, active offers, and last activity.
  2. **Given** a CRM lead card, **When** the seller updates the lead status (e.g. Hot, Cold, Closed) or adds text notes, **Then** the changes persist in the CRM storage.
  3. **Given** the CRM dashboard, **When** loaded, **Then** it renders a conversion funnel chart displaying: Inquiries -> Offers -> Accepted -> Deals Closed.

---

### User Story 3 — Buyer Trust & Seller Verification Networks (Priority: P2)
* **Description**: As a user, I want my trust score to be calculated from activity metrics (account age, completed deals, cancellation rate, response speed, spam reports) and display trust badges (Elite, Trusted, Verified, New) based on email, phone, and ID verifications so that safety is transparent.
* **Why this priority**: Crucial for building safety checkpoints and reducing fraud.
* **Independent Test**: View a user's public profile page. Verify that their Verification Tiers (Email, Phone, Government ID) and overall Trust Score are displayed as specific visual badges.
* **Acceptance Scenarios**:
  1. **Given** a seller's profile details, **When** the user uploads their phone number and government ID, **Then** the system marks those fields as verified and updates their tier to "Elite Seller".
  2. **Given** a user's transaction history, **When** their offer cancellation rate exceeds 30% or they receive spam reports, **Then** the system dynamically lowers their overall Trust Score.

---

### User Story 4 — Personalization Engine & Discovery Feeds (Priority: P2)
* **Description**: As a buyer, I want my homepage to display personalized listings feeds ("For You", "Nearby", "Trending", "Recently Viewed", "Similar Items") based on my history, wishlist, and location so I can discover relevant items faster.
* **Why this priority**: Maximizes buyer engagement and click-through rates.
* **Independent Test**: Browse three gaming laptop listings. Go back to the homepage. Verify the "Recently Viewed" slider lists the laptops in order, and the "For You" feed updates to recommend electronics.
* **Acceptance Scenarios**:
  1. **Given** a logged-in user with browsing history, **When** viewing the home screen, **Then** the system presents tailored sections matching their category interests.
  2. **Given** user location permissions, **When** loading the "Nearby Listings" feed, **Then** items are sorted and filtered by geographic proximity.

---

### User Story 5 — Interactive AI Marketplace Copilot (Priority: P2)
* **Description**: As a buyer, I want to talk to an AI Copilot drawer using natural language to search listings, recommend safety checks, compare prices, and identify fraud risk so that I can shop intelligently.
* **Why this priority**: Lowers search friction by providing interactive search and safety advice.
* **Independent Test**: Click the Copilot icon. Type "Find me gaming laptops under ₹40,000 near me from verified sellers". The Copilot replies, lists the matching items, highlights their safety level, and displays a price comparison.
* **Acceptance Scenarios**:
  1. **Given** a natural language query, **When** processed by the Copilot, **Then** it extracts search parameters (keywords, price, location, seller trust) and renders matching listing cards.
  2. **Given** a user query requesting listing safety, **When** the Copilot analyzes a listing, **Then** it returns a fraud risk score and notes any flagged scam triggers.

---

### User Story 6 — Advanced Security & Device Tracking (Priority: P3)
* **Description**: As a user, I want my account secured with refresh tokens, session management, device logs, and brute force protection so that my account cannot be easily hijacked.
* **Why this priority**: Required for production-grade authentication security.
* **Independent Test**: Log in on a browser. Go to Security Settings. Verify that the current device, browser type, IP address, and login history are displayed, with options to revoke active sessions.
* **Acceptance Scenarios**:
  1. **Given** an expired JWT access token, **When** making a request with a valid refresh token, **Then** the backend automatically rotates the refresh token and issues a new access token.
  2. **Given** five consecutive failed login attempts from an IP address, **When** a sixth attempt is made, **Then** the system throttles the IP and blocks login for 15 minutes.

---

### User Story 7 — Content Moderation & Abuse Reporting (Priority: P3)
* **Description**: As a buyer, I want to report scam listings or abusive users, and as an admin, I want to review these flags inside a moderation queue to keep the platform safe.
* **Why this priority**: Protects the platform from legal risks and bad actors.
* **Independent Test**: Open a listing. Click "Report". Select "Fraud/Scam" and submit details. Log in as Admin, open the Moderation Queue, see the reported listing, and click "Flag for Deletion".
* **Acceptance Scenarios**:
  1. **Given** a reported listing, **When** an administrator resolves the report by flagging it as "Fraud", **Then** the listing is hidden from search and public feeds immediately.
  2. **Given** a listing creation request, **When** description content contains blacklisted keywords, **Then** the listing is auto-saved to "Pending Moderation" and hidden until approved by an admin.

---

### User Story 8 — Premium UI & 3D WebGL Landing Experience (Priority: P3)
* **Description**: As a guest or user, I want to browse a visually stunning interface with custom animations, skeleton loaders, and a performant 3D marketplace globe and product showcase that falls back to a 2D layout on older devices.
* **Why this priority**: Branding differentiation that makes the app feel premium.
* **Independent Test**: Open the homepage. Verify that a 3D spinning globe representing global trade renders and spins smoothly. Turn off WebGL in the browser settings and verify that the page displays a clean, responsive static SVG/CSS mockup.
* **Acceptance Scenarios**:
  1. **Given** WebGL support, **When** landing on the home page, **Then** the 3D globe and interactive product showcase cards render at a minimum of 45 FPS.
  2. **Given** a mobile device or browser without WebGL support, **When** loaded, **Then** the system renders a high-quality 2D CSS-animated fallback without crashing.

---

### Edge Cases

1. **Simultaneous WebSocket Sessions**: A user logged in on multiple devices should see typing indicators and messages sync in real-time across all active tabs.
2. **AI Copilot API Downtime**: If the external AI service is unreachable, the Copilot should display an offline mode advisory and process queries using localized keywords/regex.
3. **Government ID Verification Privacy**: If a user uploads an ID, the raw file must be processed securely and not stored permanently in public directories.
4. **3D Render Crash / Performance Throttling**: If page frames per second (FPS) drops below 30, the 3D component must switch dynamically to low-poly rendering or a static fallback image to keep the interface fluid.

---

## 4. Requirements

### Functional Requirements

#### Real-Time Chat System (Module 1)
* **FR-001 (Chat Isolation)**: The system MUST maintain independent conversations mapped to unique `(Listing, Buyer, Seller)` triads.
* **FR-002 (WebSockets)**: The system MUST use a WebSocket connection pool to push and pull message events, online status indicators, and typing states in real-time.
* **FR-003 (Chat State Persistence)**: Messages, unread counts, archived states, and pinned states MUST be persisted in the database.
* **FR-004 (Media Handling)**: The system MUST support uploading and rendering image attachments and audio files (voice notes) up to 5MB.
* **FR-005 (Self-Chat Prevention)**: The system MUST validate and block any buyer attempts to chat with themselves or initiate chats on their own listings.

#### Seller CRM Workspace (Module 2)
* **FR-006 (Lead Pipeline)**: The system MUST categorize buyer inquires into a pipeline showing active offers, message status, buyer trust score, and last activity.
* **FR-007 (Notes and Stages)**: Sellers MUST be able to change buyer pipeline stages (`Lead`, `Active`, `Offer Made`, `Closed`, `Cold`) and save text logs.
* **FR-008 (Analytics)**: The workspace MUST render conversion analytics (e.g. click-throughs, offer acceptances) in interactive visual charts.

#### Trust & Verification (Modules 3 & 4)
* **FR-009 (Trust Score Algorithm)**: The system MUST compute a user Trust Score (0-100) dynamically using account age, completed deals, response rate, cancellation frequency, and reports.
* **FR-010 (Verification Tiers)**: The system MUST support multiple verification tiers: Email, Phone, and Government ID, display matching badges (`Verified Seller`, `Elite Seller`), and track ratings.

#### Recommendations & Discovery (Module 5)
* **FR-011 (Recommendation Algorithms)**: The system MUST generate personalized feeds ("For You", "Trending", "Nearby", "Similar Items") using viewing history, category clicks, wishlist items, and geographical distance.

#### AI Marketplace Copilot (Module 6)
* **FR-012 (Intent Parser)**: The system MUST parse natural language text to extract parameters: keywords, price bounds, category, location, and seller tier.
* **FR-013 (AI Risk Advisor)**: The Copilot MUST estimate fraud risk and compare competitor pricing when requested in dialogue.

#### Moderation System (Module 7)
* **FR-014 (Report Interface)**: Users MUST be able to flag listings and users. Flagged items MUST enter an admin Moderation Queue.
* **FR-015 (Auto-Moderator)**: The system MUST automatically flag listings containing blacklisted text patterns and temporarily suspend them from public search.

#### Advanced Security (Module 8)
* **FR-016 (Token Rotation)**: The auth backend MUST issue access tokens with short lifespans (e.g. 15 minutes) and implement Refresh Token Rotation (RTR) on every refresh request.
* **FR-017 (Session & Device Tracking)**: The system MUST record login history, including timestamp, IP address, user-agent, and allow users to revoke active sessions.
* **FR-018 (Rate Limiting)**: Authentication endpoints MUST throttle requests to block brute-force attacks.

#### Premium & 3D UI (Modules 9 & 10)
* **FR-019 (Premium Dashboards)**: Dashboards MUST include layout loaders, skeleton loaders, framer-motion micro-interactions, and empty states.
* **FR-020 (3D Scenes)**: The frontend MUST render a 3D hero globe and interactive product showcases using Three.js / React Three Fiber, falling back to 2D styles when WebGL is unavailable.

---

### Non-Functional Requirements

* **NFR-001 (Chat Latency)**: WebSocket message delivery and status changes must propagate to active sessions in under 150ms.
* **NFR-002 (3D FPS Target)**: The 3D scene must render at a minimum of 45 FPS on standard desktop and mobile browsers.
* **NFR-003 (Personalization Performance)**: Home page recommendation feeds must compile and return results in under 200ms.
* **NFR-004 (Explainability Requirement)**: Every AI-generated search suggestion or price comparison must include a confidence score (0-100%) and a natural language explanation, in accordance with the project constitution.
* **NFR-005 (Local Running / Zero Cloud)**: The entire V2 feature set must run locally via Docker Compose, utilizing local model mocks/stubs if API keys are absent.

---

### Business Rules

* **BR-001**: A user cannot save, offer, chat, or buy their own listings.
* **BR-002**: Accepting an offer locks the listing status to "Sold", cancels other pending offers, and generates an automated system message in the chat thread.
* **BR-003**: Message thread history is accessible only by the conversation buyer, seller, and system administrators.
* **BR-004**: Government ID verification updates the user verification badge instantly but requires admin review for permanent verification levels.

---

### Security Rules

* **SR-001**: WebSocket connections must validate the JWT token in the query string or subprotocol during the handshake.
* **SR-002**: API inputs for Voice Notes or Images must restrict size to 5MB and validate MIME types (audio/mp3, audio/wav, image/png, image/jpeg) to prevent malicious execution uploads.
* **SR-003**: Any suspicious login from an unfamiliar IP address/User-Agent must mark the session as "Unverified" and prompt for email/phone OTP confirmation.

---

### Permission Matrix

| Action | Guest | Registered Buyer | Registered Seller | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Listings** | Yes | Yes | Yes | Yes |
| **Send Chat Message** | No | Yes (Non-Owner) | Yes (Inbound thread) | Yes |
| **Manage CRM Lead** | No | No | Yes (Owner) | Yes |
| **Submit Verification ID**| No | Yes | Yes | Yes |
| **Submit Listing Report** | No | Yes | Yes | Yes |
| **Moderation Queue Admin**| No | No | No | Yes |
| **Revoke Active Sessions**| No | Yes | Yes | Yes |

---

### API Requirements

#### 1. Chat & Messaging (WebSockets)
* `WS /api/v2/chat/ws`: Real-time WebSocket gateway.
  * Query parameters: `token` (JWT token for verification).
  * Payload types: `typing`, `message_sent`, `message_delivered`, `message_read`.
* `POST /api/v2/chat/conversations`: Initiate/Retrieve a listing conversation.
* `GET /api/v2/chat/conversations`: Fetch conversation list (filterable by `archived`, `pinned`).
* `POST /api/v2/chat/conversations/{id}/media`: Upload audio voice note or image.

#### 2. Seller CRM Workspace
* `GET /api/v2/crm/leads`: Fetch pipeline leads with stage filtering.
* `PUT /api/v2/crm/leads/{id}/stage`: Update buyer lead stage.
* `POST /api/v2/crm/leads/{id}/notes`: Add private CRM note for a buyer.
* `GET /api/v2/crm/analytics`: Retrieve conversion charts metrics.

#### 3. Verification & Trust
* `GET /api/v2/trust/score/{user_id}`: Retrieve a user's trust metrics breakdown.
* `POST /api/v2/trust/verify/phone`: Submit phone code.
* `POST /api/v2/trust/verify/identity`: Upload government ID document.

#### 4. Recommendation Feeds
* `GET /api/v2/recommendations/home`: Retrieve lists for For You, Trending, Nearby, and Recently Viewed.
* `GET /api/v2/recommendations/similar/{listing_id}`: Fetch similar items.

#### 5. AI Copilot Drawer
* `POST /api/v2/copilot/query`: Send a natural language query to the Copilot. Returns list of matches, price advisory, and trust assessment.

#### 6. Moderation Queue
* `POST /api/v2/moderation/report`: Submit report on listing or user.
* `GET /api/v2/moderation/queue`: Fetch active reports list (Admin only).
* `POST /api/v2/moderation/resolve/{report_id}`: Resolve report with action (Admin only).

#### 7. Session Security
* `POST /api/v2/auth/refresh`: Rotate refresh token and issue new access token.
* `GET /api/v2/auth/sessions`: List active device sessions.
* `DELETE /api/v2/auth/sessions/{session_id}`: Terminate a session.

---

### Database Requirements (Logical Model)

#### 1. Entity: `ChatConversation`
* `id` (Primary Key, Integer)
* `listing_id` (ForeignKey -> Listing.id)
* `buyer_id` (ForeignKey -> User.id)
* `seller_id` (ForeignKey -> User.id)
* `is_archived_buyer` (Boolean, Default: False)
* `is_archived_seller` (Boolean, Default: False)
* `is_pinned_buyer` (Boolean, Default: False)
* `is_pinned_seller` (Boolean, Default: False)
* `created_at` (DateTime)

#### 2. Entity: `ChatMessage`
* `id` (Primary Key, Integer)
* `conversation_id` (ForeignKey -> ChatConversation.id)
* `sender_id` (ForeignKey -> User.id)
* `content` (Text, Nullable: True)
* `message_type` (String, Default: "text" - text, image, voice, offer, system)
* `media_url` (String, Nullable: True)
* `is_delivered` (Boolean, Default: False)
* `is_read` (Boolean, Default: False)
* `created_at` (DateTime)

#### 3. Entity: `SellerCRMLead`
* `id` (Primary Key, Integer)
* `seller_id` (ForeignKey -> User.id)
* `buyer_id` (ForeignKey -> User.id)
* `listing_id` (ForeignKey -> Listing.id)
* `lead_status` (String - hot, cold, active, converted)
* `notes` (Text, Nullable: True)
* `last_contacted_at` (DateTime)
* `created_at` (DateTime)

#### 4. Entity: `UserTrustScore`
* `id` (Primary Key, Integer)
* `user_id` (ForeignKey -> User.id)
* `trust_score` (Integer, Default: 50)
* `completed_deals_count` (Integer, Default: 0)
* `cancellation_rate` (Float, Default: 0.0)
* `response_rate` (Float, Default: 100.0)
* `spam_reports_count` (Integer, Default: 0)
* `last_calculated_at` (DateTime)

#### 5. Entity: `UserVerification`
* `id` (Primary Key, Integer)
* `user_id` (ForeignKey -> User.id)
* `email_verified` (Boolean, Default: False)
* `phone_verified` (Boolean, Default: False)
* `id_verified` (Boolean, Default: False)
* `verification_level` (String, Default: "New" - New, Verified, Trusted, Elite)
* `id_document_url` (String, Nullable: True)

#### 6. Entity: `ListingRecommendationInput`
* `id` (Primary Key, Integer)
* `user_id` (ForeignKey -> User.id)
* `listing_id` (ForeignKey -> Listing.id)
* `action_type` (String - view, save, offer, chat)
* `weight` (Float)
* `created_at` (DateTime)

#### 7. Entity: `ModerationReport`
* `id` (Primary Key, Integer)
* `reporter_id` (ForeignKey -> User.id)
* `listing_id` (ForeignKey -> Listing.id, Nullable: True)
* `reported_user_id` (ForeignKey -> User.id, Nullable: True)
* `report_type` (String - spam, scam, abuse, inappropriate)
* `description` (Text)
* `status` (String - pending, resolved, dismissed)
* `action_taken` (String, Nullable: True)
* `created_at` (DateTime)

#### 8. Entity: `LoginHistory`
* `id` (Primary Key, Integer)
* `user_id` (ForeignKey -> User.id)
* `ip_address` (String)
* `user_agent` (String)
* `status` (String - success, failed)
* `created_at` (DateTime)

#### 9. Entity: `RefreshToken`
* `id` (Primary Key, Integer)
* `user_id` (ForeignKey -> User.id)
* `token_hash` (String, Indexed)
* `device_id` (String)
* `expires_at` (DateTime)
* `is_revoked` (Boolean, Default: False)
* `created_at` (DateTime)

---

## 5. Resolved Design Clarifications

### Chat Storage and Media Policy
* **Decision**: Uploaded chat media (voice notes, images) and verification files are stored locally in Docker-mounted volumes.
* **Volume Paths**:
  * Chat Media: `/uploads/chat`
  * Listing Media: `/uploads/listings`
  * User Verification: `/uploads/verification`
* **Architectural Constraint**: The file storage interface MUST remain abstracted (e.g., via a storage interface/service layer) so that future migration to S3-compatible cloud storage can be performed without changing core business logic.

### AI Copilot Integration Model
* **Decision**: Primary NLP parsing and analytics will run on external developer-keyed APIs (OpenAI / Gemini).
* **Fallback Policy**: A local, deterministic rules engine MUST be used if the external API is unavailable or keys are missing.
* **Fallback Scope**: The local fallback engine will support:
  * Intent search parsing
  * Listing category prediction
  * Text-based fraud scans (keyword blacklist)
  * Rule-based price recommendations (category averages)

### 3D Landing Page Interactive Scope
* **Decision**: The 3D experience will render static, pre-packaged category-specific `.glb` assets stored in public assets folders.
* **Mapped Categories**:
  * Electronics → `Laptop.glb`
  * Vehicles → `Car.glb`
  * Books → `Book.glb`
  * Furniture → `Chair.glb`
* **Architectural Constraint**: Seller-uploaded `.gltf`/`.glb` files are explicitly out of scope for V2. The 3D system focuses entirely on client-side loading performance, device reliability, and responsive mobile-first fallback.

---

## 6. Architecture Considerations

* **WebSocket Architecture**: FastAPI WebSocket endpoint managed via an in-memory `ConnectionManager`. It will track active user sockets and publish real-time messages and state events. A background heartbeat process will prune stale sockets.
* **Refresh Token Rotation (RTR)**: The security engine will generate a paired JWT token set. Every time `POST /api/v2/auth/refresh` is called, the old refresh token is marked as used, and a new refresh token is issued. If a revoked or used refresh token is presented, the system immediately invalidates all active sessions for that user to block hijackers.
* **3D Performance Pipeline**: React Three Fiber components will use instanced mesh rendering to compile the marketplace globe. Textures and geometry will be kept simple to prevent GPU/CPU freezes. If browser performance drops (< 30 FPS) or the browser fails to allocate WebGL context, a React ErrorBoundary will catch the crash and render a static 2D Tailwind alternative.

---

## 7. Risk Analysis

| Risk ID | Description | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **RSK-001** | High GPU memory usage from 3D Three.js components crashing mobile devices. | High | Medium | Implement automatic frame-rate checks. Switch to low-polygon procedural models or disable WebGL rendering entirely if FPS falls below target. |
| **RSK-002** | WebSocket connections dropping due to network changes or container reboots. | Medium | High | Implement automatic exponential reconnection logic in the frontend Zustand chat store. |
| **RSK-003** | Unauthorized access if a refresh token is stolen. | High | Low | Enforce Refresh Token Rotation (RTR). Storing token hashes in database allows revoking single devices instantly. |

---

## 8. Implementation Roadmap

### Phase 1: Real-time Communication & Session Security (Days 1-2)
* Build WebSocket infrastructure for message transfers, presence, typing indicators, and receipts.
* Implement JWT Refresh Token Rotation, Device Tracking, and Login History.

### Phase 2: CRM Workspace & Trust System (Days 3-4)
* Build the Seller CRM Workspace pages and pipeline endpoints.
* Develop Trust Score algorithm and Verification status routes (email, phone, ID submission).

### Phase 3: AI Copilot & Personalization Engine (Days 5-6)
* Create Recommendation Engines algorithms (For You, Nearby feeds).
* Build AI Copilot endpoint drawer and report Moderation Queue panels.

### Phase 4: Premium UI & 3D WebGL Landing Experience (Days 7-8)
* Implement Three.js 3D Globe, interactive product showcase, and Framer Motion transitions.
* Set up 2D CSS responsive fallbacks and run final integration test suite.

---

**Version**: 1.0.0 | **Ratified**: Pending | **Last Amended**: 2026-06-23
