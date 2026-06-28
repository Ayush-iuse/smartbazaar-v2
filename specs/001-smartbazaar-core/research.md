# Research: SmartBazaar AI Core

This document outlines key technical research, decision rationales, and alternatives considered for the SmartBazaar AI MVP.

## Research Areas & Decisions

### 1. AI Integration Model (OpenAI vs. Gemini)
- **Decision**: Integrate the OpenAI API using `gpt-4o-mini` as the primary AI engine, with a local rule-based regex fallback engine.
- **Rationale**: Direct compliance with the user's PRD feature definition. Utilizing a local fallback ensures that the application operates correctly and displays mock data even if the OpenAI API keys are not supplied.
- **Alternatives Considered**: 
  - *Google GenAI (Gemini)*: Considered for better native performance, but rejected to maintain strict conformity with the PRD specification.
  - *Mock Only*: Rejected because having a real LLM endpoint provides high-quality suggestions for presentation.

### 2. Local Database Engine (SQLite vs. PostgreSQL)
- **Decision**: Standardize on SQLite via SQLAlchemy for the local MVP, maintaining standard SQL columns to allow simple migration to PostgreSQL.
- **Rationale**: SQLite requires zero setup and no separate container, allowing instant database initialization upon starting the application. Fits the single-developer 1-week timeline.
- **Alternatives Considered**:
  - *PostgreSQL*: Rejected as a developer requirement due to configuration overhead, but supported via standard SQLAlchemy ORM models for future deployment phases.

### 3. Local Chat Management (Simple REST Storage vs. WebSockets)
- **Decision**: Implement a RESTful endpoint for sending/receiving messages on listings. A FastAPI background worker will trigger mock seller replies after 2 seconds.
- **Rationale**: Simplicity. WebSocket chat is prone to connectivity issues and requires stateful management on the server, which is unnecessary for a dummy chat MVP.
- **Alternatives Considered**:
  - *WebSockets (FastAPI WebSocket)*: Rejected due to additional complexity in frontend synchronization and connection management.
