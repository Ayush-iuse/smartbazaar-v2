# Data Model Design: SmartBazaar AI Core

This document details the database tables, field data types, relationships, validation constraints, and state flows for the SQLite MVP.

## Entities

### 1. User
Represents an authenticated account.
- **Fields**:
  - `id` (Integer, Primary Key, Auto-increment): Unique ID.
  - `email` (String, Unique, Indexed, Max Length: 255): User email address. Must match email format.
  - `full_name` (String, Max Length: 100): Display name.
  - `hashed_password` (String, Max Length: 255): bcrypt password hash.
  - `created_at` (DateTime, Default: UTC Now): Timestamp of registration.
- **Relationships**:
  - `listings`: Has many `Listing` (one-to-many).
  - `messages_sent`: Has many `Message` (one-to-many).

### 2. Listing
Represents a second-hand item posted for sale.
- **Fields**:
  - `id` (Integer, Primary Key, Auto-increment): Unique ID.
  - `title` (String, Indexed, Max Length: 100): Product title. Cannot be empty.
  - `description` (Text): Detailed description.
  - `price` (Float): Item price in INR (₹). Must be greater than or equal to 0.
  - `category` (String, Max Length: 50): One of the predefined categories: `Electronics`, `Furniture`, `Fashion`, `Books`, `Vehicles`, `Others`.
  - `location` (String, Max Length: 100): Geographic/Trading location. Cannot be empty.
  - `image_urls` (Text): Stringified JSON list of up to 4 image URL strings.
  - `seller_id` (Integer, Foreign Key to `users.id`): Creator/Seller of the listing.
  - `fraud_score` (Float, Default: 0.0): Risk score (0 to 100).
  - `fraud_level` (String, Default: "Low"): Risk level (`Low`, `Medium`, `High`).
  - `created_at` (DateTime, Default: UTC Now): Timestamp of listing creation.
- **Relationships**:
  - `seller`: Belongs to `User` (many-to-one).
  - `messages`: Has many `Message` (one-to-many).

### 3. Message
Represents a message sent within a listing's chat thread.
- **Fields**:
  - `id` (Integer, Primary Key, Auto-increment): Unique ID.
  - `listing_id` (Integer, Foreign Key to `listings.id`): Parent listing context.
  - `sender_id` (Integer, Foreign Key to `users.id`): The message author.
  - `content` (Text): Message contents. Cannot be empty.
  - `created_at` (DateTime, Default: UTC Now): Timestamp of the message.
- **Relationships**:
  - `listing`: Belongs to `Listing` (many-to-one).
  - `sender`: Belongs to `User` (many-to-one).

## Relationships Overview

```text
  +-------------+                  +-----------------+
  |    User     | 1            0..*|     Listing     |
  |             +----------------->|                 |
  +------+------+                  +--------+--------+
         |                                  |
         | 1                                | 1
         |                                  |
         | 0..*                             | 0..*
  +------v------+                           |
  |   Message   |<--------------------------+
  |             |
  +-------------+
```
