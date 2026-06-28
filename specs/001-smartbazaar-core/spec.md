# Feature Specification: SmartBazaar AI Core

**Feature Branch**: `001-smartbazaar-core`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "SmartBazaar AI — Product Requirements Document (PRD)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Authentication (Priority: P0)
- **Description**: A user (buyer or seller) wants to register and log in to the marketplace to manage listings and access protected features.
- **Why this priority**: Required to secure user listing modifications and access messages/profile.
- **Independent Test**: Verify that a user can register via the registration endpoint/page, log in to receive a valid JWT, access their dashboard, and log out successfully.
- **Acceptance Scenarios**:
  1. **Given** a new email and password, **When** registered, **Then** the account is successfully created with a secure password hash.
  2. **Given** valid registered credentials, **When** logged in, **Then** a JWT is returned and stored securely.
  3. **Given** no token or an invalid token, **When** accessing a protected route (e.g. create listing), **Then** the request is rejected with a 401 Unauthorized status.

### User Story 2 - Listing Lifecycle Management (Priority: P0)
- **Description**: Sellers want to list items with a title, description, price, category, location, and images, and be able to modify or delete their listings.
- **Why this priority**: Core marketplace capability.
- **Independent Test**: Create a listing, view its details, update the price, and delete it to verify the complete lifecycle.
- **Acceptance Scenarios**:
  1. **Given** a logged-in user, **When** creating a listing with title, description, price, category, location, and up to 4 images, **Then** the listing is successfully created and displayed.
  2. **Given** a listing owner, **When** editing or deleting their listing, **Then** the action succeeds.
  3. **Given** a user who does not own the listing, **When** attempting to edit or delete it, **Then** the action is rejected with a 403 Forbidden status.

### User Story 3 - Listing Search & Filtering (Priority: P0)
- **Description**: Buyers want to search for listings by product title and filter by category or location to discover relevant second-hand goods.
- **Why this priority**: Essential for listing discovery.
- **Independent Test**: Run a text search on the active inventory and filter results by category to verify the correct results are shown, sorted by newest first.
- **Acceptance Scenarios**:
  1. **Given** multiple active listings, **When** searching by product title, **Then** relevant matches are returned.
  2. **Given** filters for category and location, **When** applied, **Then** only matching listings are displayed, ordered by newest first.

### User Story 4 - AI-Powered Listing Enhancements (Priority: P1)
- **Description**: Sellers want AI-assisted tools to automatically write descriptions, predict categories, and recommend fair price ranges.
- **Why this priority**: Main product differentiation feature.
- **Independent Test**: Provide inputs to the description generator, category predictor, and price recommender, and verify suggestions.
- **Acceptance Scenarios**:
  1. **Given** a short title or keyword list, **When** requesting description generation, **Then** a professional 2-3 sentence description is returned within 3 seconds and is clearly labeled "AI Suggested".
  2. **Given** a listing title, **When** input, **Then** the AI predicts the correct category from predefined listings.
  3. **Given** a listing title and condition, **When** input, **Then** an estimated price range in INR (₹) is returned.

### User Story 5 - AI Fraud Detection (Priority: P1)
- **Description**: Buyers want to see a fraud risk score and details to protect themselves against scams.
- **Why this priority**: Core trust feature of the marketplace.
- **Independent Test**: Create a listing containing scam keywords and verify that a risk score, level, and flags are produced.
- **Acceptance Scenarios**:
  1. **Given** a listing containing suspicious phrases (e.g. "urgent transfer", "advance payment only"), **When** published, **Then** the listing is flagged with a high risk level (High), a risk score (0-100), and specific flagged phrases.

### User Story 6 - Seller-Buyer Localized Chat (Priority: P2)
- **Description**: Buyers want to contact sellers directly on the listing page via an in-app chat, and sellers (or mock auto-replies) should respond.
- **Why this priority**: Essential communication channel.
- **Independent Test**: Open a chat on a listing, send a message, and verify that the message is persisted and a canned response is received after 2 seconds.
- **Acceptance Scenarios**:
  1. **Given** a listing, **When** a buyer sends a message, **Then** the message is saved locally and a mock seller response is received after 2 seconds.

### Edge Cases
- **Missing API Keys**: The system must fall back gracefully to template-based description generation, keyword-based category matching, and static price calculation if external AI APIs are unreachable or keys are not set.
- **Large Image Uploads**: Enforce strict size limits (e.g., maximum 5MB per image) and restrict image uploads to a maximum of 4 files.
- **Malformed Inputs**: Validate all listing fields to prevent negative prices, missing titles, or incorrect categories.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: User registration and login using email/password.
- **FR-002**: Password storage must use bcrypt hashing.
- **FR-003**: JWT token authentication must guard all mutating endpoints (listings, profile).
- **FR-004**: Users must be able to create, read, update, and delete listings.
- **FR-005**: User search must support full-text matching on listing titles.
- **FR-006**: Users can filter listings by category and location.
- **FR-007**: AI description generator must return suggestions from OpenAI API (gpt-4o-mini) or a local rule-based template.
- **FR-008**: AI category predictor must suggest a category from a predefined list.
- **FR-009**: AI price recommender must suggest a price range in INR based on title and condition using a local or API recommendation logic.
- **FR-010**: AI fraud detection must scan titles and descriptions, outputting a risk score (0-100), risk level (Low / Medium / High), and flagged phrases.
- **FR-011**: Messaging system must store messages locally and trigger a mock seller response after a 2-second delay.

### Key Entities
- **User**: Represents an account. Fields: `id`, `email`, `password_hash`, `created_at`.
- **Listing**: Represents an item for sale. Fields: `id`, `title`, `description`, `price`, `category`, `location`, `image_urls` (up to 4), `owner_id`, `created_at`.
- **Message**: Represents a chat message. Fields: `id`, `listing_id`, `sender_id`, `receiver_id`, `content`, `created_at`.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Users can register and log in to get a valid authentication token.
- **SC-002**: Users can create a marketplace listing with up to 4 images.
- **SC-003**: Search results load and filter in under 1 second.
- **SC-004**: AI suggestions (description, category, price) are displayed to the user in under 3 seconds.
- **SC-005**: All listings are scanned for fraud, and the risk score is displayed on the listing detail page.
- **SC-006**: Canned chat responses from the mock seller appear exactly 2 seconds after sending a message.

## Assumptions
- The application will run as a local monolith using Docker Compose for simple deployment and evaluation.
- SQLite will be used as the primary database engine.
- AI fallbacks must operate correctly and silently when no external API key is provided.
- Online payments, courier integration, and email notifications are out of scope for the MVP.
