# Feature Specification: SmartBazaar V3 — Full Serverless Vercel Architecture

**Feature Branch**: `008-serverless-architecture`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "SmartBazaar V3 — Full Serverless Vercel Architecture. Transform SmartBazaar into a fully serverless application deployable entirely on Vercel. Supabase will become the primary backend platform. Remove: Redis, Background Workers, Docker in production, Native WebSockets, Local PostgreSQL. Replace with Supabase Presence, Realtime, Storage, Auth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure & Seamless Authentication & Sessions (Priority: P1)

Users can register, log in with password or Google, reset passwords, and maintain secure, persistent login sessions across multiple browser tabs and devices.

**Why this priority**: Core security foundation. Users must be authenticated before they can list products, send messages, or view CRM insights.

**Independent Test**: A new user signs up via email/password, logs out, logs in using a third-party identity provider (Google), and verifies that their session is automatically refreshed without requiring manual re-authentication.

**Acceptance Scenarios**:
1. **Given** an unauthenticated visitor on the homepage, **When** they click "Sign Up" and provide valid credentials, **Then** they receive a verification email and are logged in upon verification.
2. **Given** a user with a forgotten password, **When** they request a password reset, **Then** they receive a secure reset link that allows them to establish a new password and log in.
3. **Given** an authenticated user who closes their browser, **When** they return to the application within the session validity window, **Then** they remain logged in without re-entering credentials.

---

### User Story 2 - Real-Time Live Chat & Messaging (Priority: P1)

Buyers and sellers can communicate in real time, viewing live typing indicators, message seen/read receipts, and active user presence status.

**Why this priority**: Standard marketplace communication. Real-time feedback increases user engagement and speeds up deal completions.

**Independent Test**: Two users open the same chat channel on different devices. User A types a message; user B immediately sees a typing indicator. User A sends the message; it appears instantly in User B's viewport. User B reads it; User A sees the read receipt checkmarks update.

**Acceptance Scenarios**:
1. **Given** an active conversation between a buyer and a seller, **When** the buyer starts typing, **Then** a typing indicator is shown to the seller in real time.
2. **Given** an offline seller, **When** a buyer sends them a message, **Then** the message is marked as delivered, and the seller is notified of the unread message when they next log in.
3. **Given** two users in a chat thread, **When** User B opens the message pane, **Then** User A's screen updates to show that the message has been read.

---

### User Story 3 - Media Uploads & File Management (Priority: P2)

Users can upload listing images and seller verification documents through a seamless interface that handles large files gracefully and serves them with optimal load times.

**Why this priority**: Necessary for listing quality and verification. Visual representations of listings and proper verification documents build trust.

**Independent Test**: A seller uploads a high-resolution listing image during creation. The image is processed, uploaded securely, and rendered instantly for public visitors viewing the listing page.

**Acceptance Scenarios**:
1. **Given** a seller creating a new listing, **When** they drag and drop images, **Then** the uploads are validated for size and type, uploaded, and thumbnails are rendered.
2. **Given** a seller submitting verification documents, **When** they upload a PDF scan, **Then** it is stored in a private secure folder accessible only to system administrators.

---

### User Story 4 - Automated, Serverless Scaling & Local-First Development (Priority: P2)

The application scales on-demand to handle traffic spikes without manual resource allocation, while maintaining a fully offline local development environment for engineering teams.

**Why this priority**: Operational efficiency and developer experience. Minimizes paid cloud dependency while ensuring high availability in production.

**Independent Test**: Run a high-load simulation on the production endpoints to verify response times stay low, while spinning up the complete application locally using only Docker containers with no internet connection.

**Acceptance Scenarios**:
1. **Given** a surge in concurrent users, **When** the application receives high request volumes, **Then** serverless functions scale automatically to maintain latency under 2.0 seconds.
2. **Given** a developer starting the workspace locally, **When** they run the start script, **Then** all services (database, auth, local storage, mock real-time) start inside local Docker containers without cloud connections.

---

### Edge Cases

- **Poor Network Conditions during Real-time Sync**:
  - *Scenario*: How does the chat handle a sudden drop in user connectivity?
  - *Requirement*: The system must detect connection drops, show an offline warning badge, cache outgoing messages locally, and re-sync automatically with exponential backoff retry logic when the connection is restored.
- **Account Migration Handling**:
  - *Scenario*: How are existing user passwords handled when migrating to the serverless identity provider?
  - *Requirement*: [NEEDS CLARIFICATION: How do we handle credentials for existing users? E.g., force a password reset link on first login, or perform a batch migration of hashes?]
- **Storage Limits and abuse prevention**:
  - *Scenario*: How does the system handle malicious users uploading massive files or script files?
  - *Requirement*: [NEEDS CLARIFICATION: What are the file type and size limit boundaries for listing attachments and verification documents?]
- **Offline message notifications**:
  - *Scenario*: How do users get notified of incoming chat messages when they are offline?
  - *Requirement*: [NEEDS CLARIFICATION: Do we implement email/push alerts for offline messages, or is displaying them inside the application upon next login sufficient?]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support user authentication via Email/Password and Google OAuth2.
- **FR-002**: System MUST enforce Row-Level Security (RLS) rules on all database tables, preventing unauthorized read or write access to private data.
- **FR-003**: System MUST provide real-time chat sync, presence tracking, and typing indicators without maintaining long-running socket servers in production.
- **FR-004**: System MUST allow sellers to upload up to 5 images per listing, validating that each image does not exceed size limits.
- **FR-005**: System MUST store verification documents in a secure, private bucket restricted to administrator access.
- **FR-006**: System MUST support running the full stack locally with rule-based fallback handlers to avoid cloud service dependencies during development.
- **FR-007**: System MUST validate all incoming parameters against strict schemas before executing database mutations.

### Key Entities

- **User**: Represents a buyer or seller. Key attributes: ID, email, full name, status, role, and created timestamp.
- **Listing**: Represents a marketplace item. Key attributes: ID, title, description, price, category, status, and associated image URLs.
- **Conversation**: Represents a chat thread between two users. Key attributes: ID, participant IDs, associated listing ID, and last message summary.
- **Message**: Represents an individual chat message. Key attributes: ID, conversation ID, sender ID, content, read status, and media URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration and log in in under 90 seconds.
- **SC-002**: Real-time chat messages must be delivered and rendered on the recipient's screen in under 500 milliseconds when both users are online.
- **SC-003**: Listing detail pages, including listing images, must load and display interactive elements in under 1.5 seconds.
- **SC-004**: System must scale dynamically to handle at least 5,000 concurrent requests without server degradation.
- **SC-005**: Real-time presence states and typing indicators must update on screen in under 200 milliseconds.

## Assumptions

- Users have modern browsers with standard JavaScript and WebSocket/real-time connection support.
- Mobile responsiveness remains a core layout requirement.
- Local development will rely on local Docker containers (such as Supabase Local CLI or SQLite fallbacks) to satisfy the "Zero Cloud Dependencies" constraint.
- Email verification links will expire after a configurable period (defaulting to 24 hours).
