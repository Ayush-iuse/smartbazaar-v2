# Research Log: Marketplace Role Separation & Real Buyer-Seller Ecosystem

This document details the architectural research and technical choices made for **SmartBazaar AI V3 - Marketplace Role Separation**.

---

## 1. Unified Dashboard Architecture
- **Decision**: Implement a unified, dual-tab Workspace Dashboard under the existing route `frontend/src/app/dashboard/page.tsx`, rather than introducing split folder routes (like `/buyer` and `/seller`).
- **Rationale**: A unified tab-based workspace dashboard prevents code duplication of layout files, simplifies access control rules, and allows sharing the authentication/Zustand user session contexts. It also fits standard design systems like Facebook Marketplace where user workspace navigation is local and instant.
- **Alternatives Considered**: Dedicated routes `/buyer` and `/seller` (rejected because it adds extra navigation latency, layout wrappers, and router complexity).

---

## 2. Conversation & Message Modeling
- **Decision**: Introduce an explicit `conversations` database table representing the unique relationship between a Buyer, Seller, and Listing. Refactor the `messages` table to have a foreign key to `conversations.id`.
- **Rationale**: Currently, messages are queried flatly by `listing_id`, which fails when multiple buyers message a seller about the same item. Explicit conversations group messages cleanly, allow tracking of unread states, and guarantee that a seller can respond to individual buyer streams.
- **Alternatives Considered**: Keep flat messaging and group dynamically by querying distinct senders (rejected because it makes query logic slow, complex, and error-prone, particularly when determining the thread's buyer).

---

## 3. Storage of Saved Listings vs. Recently Viewed Items
- **Decision**: Store Saved Listings in a persistent SQLite table (`saved_listings` or `wishlists` model) and Recently Viewed listings in the browser's LocalStorage.
- **Rationale**: Saving a listing represents strong buyer interest and must persist across devices, requiring backend database support. "Recently Viewed" items, however, are temporary session data. Storing them in LocalStorage is high-performing and eliminates unnecessary DB writes on every product view.
- **Alternatives Considered**: 
  - Store both in database (rejected as it writes to the DB on every single view, risking performance bottlenecks).
  - Store both in LocalStorage (rejected because users expect saved/wishlisted items to persist across device logins).

---

## 4. Offer Status & Listing Locking
- **Decision**: When a seller accepts an offer, the listing status updates to "Sold", the selected offer status changes to "Accepted", and all other pending offers on that listing transition to "Expired".
- **Rationale**: Automatically marking a listing as sold when an offer is accepted reflects realistic marketplace behavior, preventing multiple concurrent purchases. Setting other offers to "Expired" cleans up pending negotiations.
- **Alternatives Considered**: Let listings remain active after offer acceptance (rejected as it breaks role rules and allows selling the same item multiple times).
