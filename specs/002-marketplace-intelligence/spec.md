# Feature Specification: SmartBazaar AI V3 (Marketplace Intelligence Platform)

**Feature Branch**: `002-marketplace-intelligence`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Transform SmartBazaar AI from a marketplace clone into an AI-Powered Marketplace Intelligence Platform."

---

## 1. Problem Statement & Vision

### Problem Statement
Traditional peer-to-peer (P2P) marketplaces suffer from high friction, search fatigue, and trust deficits. Sellers struggle to write quality descriptions, evaluate fair pricing, and predict sale times. Buyers waste hours typing exact search keywords, fear purchasing fraudulent items, and lack objective data to negotiate pricing. Platform administrators lack tools to detect marketplace trends and systemic fraud.

### Product Vision
Transform SmartBazaar AI from a static listing directory into a dynamic, AI-Powered Marketplace Intelligence Platform. By introducing intelligent co-pilots, real-time analytics, explainable trust scores, and natural language search filters, the platform reduces transaction friction, maximizes listing quality, and ensures safe local trading.

---

## 2. Target Personas

### 1. Casual Seller ("Quick-List Sameer")
- **Needs**: Wants to sell household items (e.g. old phones, furniture) quickly at fair market value with minimal writing and research effort.
- **Pain Points**: Doesn't know how to write keyword-rich descriptions or set optimal prices; hates waiting weeks for items to sell.

### 2. Value Buyer ("Deal-Finder Divya")
- **Needs**: Wants to buy second-hand goods locally, verify if a price is fair, evaluate seller credibility, and confirm item safety.
- **Pain Points**: Fears getting scammed; hates negotiating blindly without pricing data; finds keyword search too restrictive.

### 3. Marketplace Administrator ("Monitor Manish")
- **Needs**: Wants a macro view of category distributions, transaction velocity, pricing trends, and fraud hot-spots.
- **Pain Points**: Manual listing moderation is slow; cannot easily spot systemic scam campaigns.

---

## 3. User Scenarios & Testing (User Stories)

### User Story 1 — AI-Enhanced Seller Copilot (Priority: P1)
- **Description**: As a seller creating a new listing, I want the system to automatically analyze my title, description, and price to show a Listing Score, Sale Probability, and price adjustments, so I can optimize my listing immediately.
- **Why this priority**: Core driver for listing quality improvements.
- **Independent Test**: Create a listing with missing description details and a high price, verify that the Seller Copilot returns a score < 70, low sale probability, and lists recommendations to add details and lower price.
- **Acceptance Scenarios**:
  1. **Given** a logged-in seller, **When** entering listing details, **Then** the Seller Copilot displays a Listing Score (0-100), Sale Probability (%), Competition level (Low/Medium/High), Expected Sale Time (days), and a list of specific improvement suggestions.
  2. **Given** the Copilot output, **When** the seller applies a suggestion (e.g., reduces price by 5%), **Then** the Listing Score and Sale Probability update dynamically on the page.

### User Story 2 — "Should I Buy This?" Buyer Advisor (Priority: P1)
- **Description**: As a buyer viewing a listing detail page, I want to click a "Should I Buy This?" button to receive an automated pros/cons checklist, fair pricing evaluation, and a clear transaction recommendation.
- **Why this priority**: Essential to build buyer trust and reduce purchasing anxiety.
- **Independent Test**: Navigate to an active listing, click "Should I Buy This?", and check that a card renders listing Pros, Cons, Fair Price estimate, Risk Level, and a final advice badge (BUY, NEGOTIATE, or AVOID).
- **Acceptance Scenarios**:
  1. **Given** an active listing, **When** the buyer triggers the advisor, **Then** the system presents an explainable summary with pros (e.g., "Good price for condition"), cons (e.g., "Short description"), Fair Price range, and a recommendation.
  2. **Given** a listing flagged as high-risk by the fraud engine, **When** the buyer triggers the advisor, **Then** the advisor defaults to an "AVOID" recommendation with the fraud risk explanation highlighted in red.

### User Story 3 — Semantic Smart Search (Priority: P1)
- **Description**: As a buyer, I want to type natural language queries (e.g. "Good laptop under ₹25000") and have the search engine automatically resolve my intent into structured category, price, location, and keyword filters.
- **Why this priority**: Eliminates search query formulation friction.
- **Independent Test**: Type "Gaming chair for college student Pune" in the search box, verify that the results page returns Furniture listings filtered for location "Pune" and matching chair keywords.
- **Acceptance Scenarios**:
  1. **Given** a natural language query, **When** searched, **Then** the search input is parsed into: Search Intent, Category, Price Range, Location, and Keywords, displaying the active filters to the user.
  2. **Given** a query that contains no location, **When** searched, **Then** the search defaults to the user's current profile location without breaking other criteria.

### User Story 4 — Marketplace Intelligence Dashboard (Priority: P2)
- **Description**: As an administrator or seller, I want to view a dashboard with charts detailing category distributions, average pricing, and velocity statistics, coupled with a natural-language summary of market trends.
- **Why this priority**: Provides macro-level insights for business monitoring.
- **Independent Test**: Open the dashboard page, verify charts load correctly, and confirm the AI Summary displays updated textual insights (e.g. "Electronics account for 42% of listings").
- **Acceptance Scenarios**:
  1. **Given** active listings in the database, **When** viewing the dashboard, **Then** the app renders: Top Categories, Fastest Selling Categories, Fraud Distribution, Average Prices, Location Trends, and Daily Listing counts.
  2. **Given** the dashboard state, **When** listings are added/deleted, **Then** the natural-language AI Summary updates its statistics dynamically.

### User Story 5 — Theme Selector Persistence (Priority: P2)
- **Description**: As a user, I want to switch between Light, Dark, and System themes, and have my preference persist between browser reloads.
- **Why this priority**: Essential for UX personalization.
- **Independent Test**: Switch to Dark mode, refresh the page, and verify the app remains in Dark mode.
- **Acceptance Scenarios**:
  1. **Given** any page in the application, **When** the theme selector is toggled, **Then** the layout switches color themes instantly.
  2. **Given** a selected theme (e.g., Dark), **When** a new page is loaded or the browser is restarted, **Then** the preference is recovered from localStorage with zero transition flash.

### User Story 6 — Seller Trust Score & Badge (Priority: P2)
- **Description**: As a buyer, I want to see a trust score (0-100) and user tier (Verified/Trusted/New) next to the seller's name to evaluate their credibility.
- **Why this priority**: Protects users against bad actors and fraud.
- **Independent Test**: Open a listing, check the seller profile card, verify that a Trust Score and a rating badge (e.g. Trusted Seller) is displayed.
- **Acceptance Scenarios**:
  1. **Given** a seller's profile, **When** accessed or viewed on a listing, **Then** a Trust Score (0-100) is rendered based on: Listing Quality, Fraud History, Response Rate, and Profile Completion.
  2. **Given** a Trust Score, **When** score is >= 85, **Then** display "Trusted Seller"; if < 85 and verified, display "Verified Seller"; otherwise display "New Seller".

### User Story 7 — Listing Health Engine (Priority: P3)
- **Description**: As a seller, I want to see a health dashboard for my listings showing sub-scores (Visibility, Price, Description, Trust) and an Overall Health Score so I can see which listings need optimization.
- **Why this priority**: Encourages proactive seller maintenance.
- **Independent Test**: Navigate to the Seller Dashboard, view listings health, and check for the score breakdowns.
- **Acceptance Scenarios**:
  1. **Given** a seller's active listings, **When** viewing the dashboard list, **Then** each listing displays sub-scores (Visibility, Price, Description, Trust) and an Overall Health Score.

### User Story 8 — Smart Recommendation Engine (Priority: P3)
- **Description**: As a buyer browsing the homepage, I want to see product recommendations categorized by Similar Products, Related Listings, and Trending Categories.
- **Why this priority**: Enhances listing discovery and user engagement.
- **Independent Test**: Open the homepage, verify recommendation sliders render listings matching my browsing categories.
- **Acceptance Scenarios**:
  1. **Given** active listings, **When** loading the home feed, **Then** rule-based recommenders render: "Similar Products", "Related Listings", and "Trending Categories" sections.

---

## 4. Edge Cases

- **Empty Database/Search Results**: If the smart search yields 0 results, the system must show similar category items instead of an empty screen and suggest alternative search parameters.
- **OpenAI Key Unreachable**: If API keys are missing, the search engine must fall back to basic text parsing and the advisor must default to a rule-based checklist with safety warnings.
- **Negative/Zero Pricing Values**: The Listing Health and Copilot engines must flag listings with ₹0 or negative values as High-Risk/Malformed and reject persistence.

---

## 5. Functional Requirements

- **FR-001 (Copilot)**: The system MUST calculate a Listing Score (0-100) based on title length (> 10 chars), description length (> 30 chars), price deviation from category averages, and presence of images.
- **FR-002 (Copilot)**: The system MUST estimate Sale Probability (%) using a weighted formula combining category average velocity, item condition, and pricing deviations.
- **FR-003 (Buyer Advisor)**: The system MUST generate a transaction advice recommendation:
  - `BUY` if fraud risk is Low, price is below average, and seller is Verified/Trusted.
  - `NEGOTIATE` if fraud risk is Low but price exceeds category averages.
  - `AVOID` if fraud risk score is >= 50 or seller trust score is < 30.
- **FR-004 (Smart Search)**: The system MUST parse free-text search queries using regex or NLP endpoints to extract: search term, location, category, maximum price, and conditions.
- **FR-005 (Marketplace Stats)**: The backend MUST aggregate listing tables to compute: top categories by listing count, category velocity, average listing price, and daily insertion trends.
- **FR-006 (Themes)**: The frontend MUST support Light, Dark, and System CSS media query overrides, persisting selection in localStorage.
- **FR-007 (Trust Score)**: The system MUST compute trust scores dynamically:
  - Profile completed: +25 points.
  - Average listing quality >= 80: +25 points.
  - Zero fraud listings flagged: +30 points.
  - Response rate >= 90%: +20 points.

---

## 6. Key Entities

- **User / Seller Profile**:
  - `id`: Unique user key.
  - `email`: Hashed identifier.
  - `trust_score`: Calculated integer (0-100).
  - `trust_level`: Tier label (`New`, `Verified`, `Trusted`).
  - `response_rate`: Float representing user reply frequency.
- **Listing**:
  - `id`: Unique key.
  - `title`, `description`, `price`, `category`, `location`, `image_urls`.
  - `health_score`: Calculated overall listing health integer (0-100).
  - `visibility_score`, `price_score`, `description_score`.
- **Market Analytics Cache**:
  - `id`: Unique analytical log key.
  - `category_name`: Predefined string.
  - `average_price`: Category average price float.
  - `velocity_days`: Expected days to sell.
  - `listings_count`: Active listings in the category.

---

## 7. Success Criteria (Measurable Outcomes)

- **SC-001**: Sellers can create and submit a listing (with AI suggestions active) in under 2 minutes.
- **SC-002**: The "Should I Buy This?" recommendation card is generated and displayed on screen in under 3.0 seconds.
- **SC-003**: 95% of smart search queries return correct listings within 250ms.
- **SC-004**: The administrator dashboard loads statistics charts and the natural-language summary within 1.5 seconds.
- **SC-005**: All seller profile cards render a Trust Score and trust badge without empty layouts.

---

## 8. Assumptions

- **Local Running**: The application will run entirely locally via Docker Compose using SQLite, with mock models for analytics.
- **No Native Payments**: All checkouts and negotiations occur via chat; shipping and financial transactions are out of scope.
- **Authentication**: Existing JWT authentication architecture will be used.

---

## 9. Agent Definitions

### 1. Seller Copilot Agent
- **Responsibilities**: Generates quality metrics, pricing comparisons, and sale probability calculations on listing creation/update.
- **Inputs**: Title, description, price, category, condition.
- **Outputs**: Listing Score, Sale Probability, expected days to sell, improvement recommendations.
- **Success Metrics**: Suggestion accuracy aligns with category statistics; generates calculations in under 2 seconds.

### 2. Buyer Agent
- **Responsibilities**: Analyzes listing metadata and user reviews to generate buying advice cards (pros, cons, price evaluation, action recommendation).
- **Inputs**: Listing detail object, seller trust profile.
- **Outputs**: Advisories (BUY, NEGOTIATE, AVOID), list of Pros and Cons.
- **Success Metrics**: Recommendations match fraud and pricing rules; advice displays in under 3 seconds.

### 3. Marketplace Intelligence Agent
- **Responsibilities**: Aggregates site-wide listing data to compute category statistics, average pricing, location counts, and outputs natural-language trends reports.
- **Inputs**: Site listings, history records.
- **Outputs**: Trend logs, demand metrics, natural-language insights.
- **Success Metrics**: Dashboard queries complete without query lockups; trend paragraphs contain valid counts.

### 4. Search Agent
- **Responsibilities**: Deconstructs free-text search bars into structured filter objects and runs search queries against index records.
- **Inputs**: Raw string query input.
- **Outputs**: Category filter, price bounds, keywords array, location filter.
- **Success Metrics**: Query translations yield matching items within 250ms.

### 5. Fraud Agent
- **Responsibilities**: Checks listing titles/descriptions against scam keywords and outputs risk ratings.
- **Inputs**: Listing title, description text.
- **Outputs**: Fraud Score (0-100), Fraud Level (Low, Medium, High), flagged phrases.
- **Success Metrics**: Correctly identifies 100% of test mock scam keywords.

### 6. Price Agent
- **Responsibilities**: Compares item details with historical database pricing averages to recommend valuation bounds.
- **Inputs**: Category, condition, title.
- **Outputs**: Recommended price range minimum and maximum.
- **Success Metrics**: Suggests reasonable valuation ranges based on condition guidelines.

---

**Version**: 3.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
