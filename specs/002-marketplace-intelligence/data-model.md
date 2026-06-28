# Data Model: Marketplace Intelligence Platform

This document describes the database tables and attributes mapping for **SmartBazaar AI V3**.

---

## 1. Schema Specifications

### `listing_scores`
Stores automated listing health metrics, price scores, and copilot suggestions.
- **`id`**: Integer (Primary Key).
- **`listing_id`**: Integer (Foreign Key -> `listings.id`, CASCADE delete).
- **`listing_score`**: Integer (0-100, validated).
- **`price_score`**: Integer (0-100, validated).
- **`description_score`**: Integer (0-100, validated).
- **`competition_score`**: Integer (0-100, validated).
- **`sale_probability`**: Integer (0-100, validated).
- **`recommendations`**: Text (JSON array of strings).
- **`created_at`**: DateTime (defaults to utcnow).

### `seller_scores`
Stores reputation and trust tiers for user profiles.
- **`id`**: Integer (Primary Key).
- **`seller_id`**: Integer (Foreign Key -> `users.id`, CASCADE delete).
- **`trust_score`**: Integer (0-100, validated).
- **`response_rate`**: Float (0.0 to 1.0, defaults to 1.0).
- **`quality_score`**: Integer (0-100, validated).
- **`fraud_score`**: Integer (0-100, validated).
- **`level`**: String (`"New"`, `"Verified"`, `"Trusted"`, defaults to `"New"`).
- **`created_at`**: DateTime (defaults to utcnow).

### `analytics_snapshots`
Stores aggregated category averages compiled by the background service.
- **`id`**: Integer (Primary Key).
- **`category`**: String (Predefined listing categories).
- **`avg_price`**: Float.
- **`listing_count`**: Integer.
- **`fraud_rate`**: Float (percentage).
- **`snapshot_date`**: Date (defaults to today).

### `recommendations`
Stores computed similar product references.
- **`id`**: Integer (Primary Key).
- **`listing_id`**: Integer (Foreign Key -> `listings.id`, CASCADE delete).
- **`recommended_listing_id`**: Integer (Foreign Key -> `listings.id`, CASCADE delete).
- **`rank`**: Integer (rank sequence weight).
- **`created_at`**: DateTime.

### `search_history`
Stores semantic search query inputs.
- **`id`**: Integer (Primary Key).
- **`user_id`**: Integer (Nullable Foreign Key -> `users.id`, NULL on guests).
- **`query_string`**: Text.
- **`intent`**: String.
- **`resolved_filters`**: Text (JSON string containing structured query values).
- **`created_at`**: DateTime.
