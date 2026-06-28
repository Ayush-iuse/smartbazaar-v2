# Research: V2 CRM, Trust Engine & Verification Platform

This document outlines the technical research, architectural decisions, and design selections for the SmartBazaar V2 CRM, Trust Engine, and Verification Platform.

---

## 1. CRM Lead Status and Pipeline Updates

### Decision
Event-driven updates for CRM pipeline status mapping, backed by user action logs.

### Rationale
Pipeline stages must reflect real-time buyer behavior (e.g., first message changes stage to "Interested", submitting an offer changes stage to "Negotiating"). Storing these events in a transaction log table (`crm_activities` and `buyer_timeline`) allows calculating response times and rendering a historical timeline.

### Alternatives Considered
- **Strict Manual Transitions**: Rejected because manual drag-and-drop state updates place unnecessary overhead on sellers who want automated behavior.
- **Polling Database Aggregations**: Rejected because scanning all messages and offers on every CRM page load is highly inefficient.

---

## 2. Lead Score Calculation Trigger

### Decision
A hybrid calculation: Event-driven in-memory calculations for instant feedback on critical actions, paired with cached background task updates.

### Rationale
Lead score recalculation (incorporating message frequency, offer count, response speed, listing views, and wishlist activity) must avoid slow, blocking database calls on critical paths like saving a message. We will trigger asynchronous score recalculations on event dispatches and cache the results.

### Alternatives Considered
- **Synchronous Transactional Calculation**: Rejected because it increases database load and API response times during standard chat interactions.
- **Nightly Offline Batch Processing**: Rejected because a seller needs real-time lead updates during active negotiation windows.

---

## 3. Government ID Verification & Document Storage

### Decision
Local disk storage mapped to container volumes, served behind a secure controller route that enforces strict authorization checks.

### Rationale
To comply with the Zero Cloud Dependencies principle, documents cannot be sent to third-party KYC APIs or S3 buckets. Instead, files are saved locally under `/uploads/verification` with unique UUIDs. A dedicated endpoint (`GET /api/verification/document/{id}`) reads the binary and streams it to authorized admin sessions only, blocking unauthorized public access.

### Alternatives Considered
- **Direct Public URL Hosting**: Rejected because hosting government IDs publicly on standard static routes (like `/uploads/...`) exposes sensitive PII.
- **Database BLOB Storage**: Rejected because storing large binary files in SQLite leads to database bloating and severe performance issues.
