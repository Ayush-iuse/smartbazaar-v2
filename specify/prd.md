# SmartBazaar AI — Product Requirements Document (PRD)

> Generated via `/specify` workflow — Spec-Kit v1

---

## 1. Problem Statement

Local buyers and sellers currently rely on fragmented channels (WhatsApp groups, Facebook Marketplace, physical noticeboards) to trade second-hand goods. There is no unified, AI-assisted local marketplace that helps sellers write better listings, price fairly, and stay safe from scams.

**SmartBazaar AI** solves this by providing:
- A clean marketplace for posting and discovering local listings.
- AI-powered helpers that reduce friction for sellers (description, category, pricing).
- An AI fraud detector that protects buyers from scam listings.

---

## 2. Users

| Persona | Description |
|---|---|
| **Seller** | Wants to list items quickly with minimal effort. Values AI assistance for descriptions and pricing. |
| **Buyer** | Wants to browse, search, and contact sellers easily. Values trust signals. |
| **Admin (future)** | Can remove flagged listings. Out of scope for MVP. |

---

## 3. Features

### 3.1 Authentication (P0)
- User registration with email + password.
- Login returns a JWT access token.
- Logout clears token from client.
- Protected routes require valid JWT.

### 3.2 Listings (P0)
- Create a listing with: title, description, price, category, location, up to 4 images.
- Edit own listing.
- Delete own listing.
- View any listing's detail page.
- Listing card shown on home feed and search results.

### 3.3 Search (P0)
- Search by product name (full-text).
- Filter by category.
- Filter by location.
- Results sorted by newest first.

### 3.4 AI Description Generator (P1)
- Input: short product title/keywords.
- Output: 2–3 sentence professional description.
- Powered by OpenAI `gpt-4o-mini`; falls back to rule-based template.
- Output is clearly labelled "AI Suggested".

### 3.5 AI Category Predictor (P1)
- Input: listing title.
- Output: one of the predefined categories.
- Powered by OpenAI; falls back to keyword matching.

### 3.6 AI Price Recommendation (P1)
- Input: title + condition.
- Output: estimated price range in INR (₹).
- Rule-based logic acceptable for MVP.

### 3.7 AI Fraud Detection (P1)
- Input: listing title + description.
- Output: risk score (0–100) + risk level (Low / Medium / High) + flagged phrases.
- Flags keywords: "urgent transfer", "advance payment only", "Western Union", "100% safe guaranteed", etc.

### 3.8 Dummy Seller Chat (P2)
- Chat UI on listing detail page.
- Messages stored locally (no WebSocket required for MVP).
- "Seller" auto-replies with a canned response after 2 seconds.

---

## 4. Success Metrics

| Metric | Target |
|---|---|
| User can register and login | ✅ |
| User can create a listing | ✅ |
| User can browse and search listings | ✅ |
| AI description generated in < 3 s | ✅ |
| AI category suggested on title input | ✅ |
| AI price range shown on create form | ✅ |
| Fraud score shown on listing detail | ✅ |

---

## 5. Out of Scope

- Real payments / escrow.
- Real-time notifications.
- Delivery / logistics.
- Production deployment (demo/local only).
- Admin dashboard.

---

## 6. Constraints

- Single developer, 5–7 days.
- No paid infrastructure (local Docker Compose).
- AI fallback must work without API key.
