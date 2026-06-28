# Research Log: Marketplace Intelligence

This document details the architectural research and technical choices made for **SmartBazaar AI V3**.

---

## 1. Local Database & Production Migration
- **Decision**: Use a hybrid SQLite/PostgreSQL configuration. SQLite serves as the in-memory/file-based database for local test runs and rapid development cycles. PostgreSQL orchestrates via Docker Compose for production and analytics processing.
- **Rationale**: SQLite requires zero system installations and runs locally with high read rates. PostgreSQL supports standard analytics aggregations and indexing operations when deploying inside containers.
- **Alternatives Considered**: Raw SQLite only (insufficient for enterprise scaling); PostgreSQL only (adds overhead and dependencies to local pytest runs).

---

## 2. Next.js Standalone Build
- **Decision**: Enable `standalone` compilation targets.
- **Rationale**: Standalone compilation copies only the traced dependencies and compiled code modules into `.next/standalone`, completely decoupling from root-level `node_modules`. This prevents image compilation failures from missing folder hierarchies (e.g. `public/`).
- **Alternatives Considered**: Standard Next.js builds (results in bloated images > 1GB containing unnecessary packages).

---

## 3. Local Rule-Based AI Fallbacks
- **Decision**: Maintain a comprehensive local rules engine as fallback interfaces.
- **Rationale**: Allows the complete suite of features (Pricing, Description, Category, Fraud Risk) to be executed without credentials.
- **Alternatives Considered**: Throwing exceptions on missing OpenAI API keys (unacceptable for offline development and local validation).
