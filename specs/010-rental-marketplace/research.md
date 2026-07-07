# Research: SmartBazaar Rental Marketplace

This research outlines the architectural decisions and technology baselines for integrating rental logic into the existing buy-sell monolith of SmartBazaar.

## Technical Decisions

### 1. Database Schema Extension
- **Decision**: Extend listings by creating a separate set of `rental_listings`, `rental_bookings`, `rental_calendar`, `rental_contracts`, `rental_deposits`, and `rental_returns` tables referencing the primary `listings` table and users.
- **Rationale**: Keeps database clean without polluting the legacy listings attributes, while maintaining 100% backward compatibility for existing active buy/sell items.
- **Alternatives Considered**: Modifying the primary `listings` table to add ~20 new nullable columns. Rejected because it violates table normalization rules and risks regressions in legacy listings logic.

### 2. Availability Locking Engine
- **Decision**: Perform atomic date checks at database query level using PostgreSQL transaction checks before executing booking confirmations.
- **Rationale**: Guarantees zero schedule double-booking overlaps.
- **Alternatives Considered**: In-memory javascript scheduling check on the frontend. Rejected because concurrent buyer requests could bypass validation.

### 3. Graceful AI Pricing Fallbacks
- **Decision**: Local rule-based pricing algorithms (daily rates estimated at 0.5% of buy value; deposit estimated at 30% of buy value) when OpenAI services are down or credentials are empty.
- **Rationale**: Conforms to Principle 10 (Working Software First) and Principle 9 (Zero Cloud Dependencies).
