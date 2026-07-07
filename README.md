# SmartBazaar V3 - Peer-to-Peer Rental & Enterprise Operations OS

SmartBazaar is an AI-first marketplace platform transformed to support **Buy • Sell • Rent** operations with unified schemas, advanced business intelligence dashboards, and conversational AI Concierges.

---

## Technical Architecture Overview

The system is organized as a decoupled multi-tier web application containerized using Docker Compose:

```
                  ┌───────────────────────┐
                  │   Next.js Frontend    │ (Port 3000)
                  └───────────┬───────────┘
                              │
                              ▼ REST APIs / WebSockets
                  ┌───────────────────────┐
                  │    FastAPI Backend    │ (Port 8000)
                  └───────────┬───────────┘
                              │
                              ▼ SQLAlchemy / Alembic
                  ┌───────────────────────┐
                  │ PostgreSQL Database   │ (Port 5432)
                  └───────────────────────┘
```

---

## Production Deploy & Setup Guide

### 1. Environment Configuration

Create a `.env` configuration file in the project root:

```ini
# Database Engine settings
DATABASE_URL=postgresql://postgres:postgres@smartbazaar-db:5432/smartbazaar

# Security Keys
JWT_SECRET=super-secret-security-hardening-key-hash-129031239
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Cloudinary CDN credentials
CLOUDINARY_CLOUD_NAME=smartbazaar-cloud
CLOUDINARY_API_KEY=1234567890
CLOUDINARY_API_SECRET=abcdefg
```

### 2. Docker Execution

Run the stack locally:

```bash
docker compose up --build
```

---

## Core System Modules

### 1. Peer-to-Peer Rental Lifecycles
* **Availability Schedules**: Block maintenance ranges and apply seasonal overrides on interactive grid calendars.
* **Escrow Hold Guards**: Lock security deposits before executing pickups, release balance holds upon completing returned inspection lists.
* **Digital Signatures**: Sign customized rental agreements and damage policies.

### 2. Enterprise BI Dashboards
* **Multi-Store Management**: Own multiple independent storefront profiles.
* **Stock Inventory Tracker**: Trace serial numbers, courier assignments, and warehouse destinations.
* **Access Control Controls**: Assign specific team roles (Owner, Manager, Finance, operator).

### 3. Conversational AI Assistant Concierge
* **Semantic Agent Chat**: Process natural language queries (e.g. "wildlife camera for 3 days").
* **AI Pricing Engine**: Dynamic rates forecasts and confidence calculations.
* **Scam Protection**: Automated fraud score check warnings.
