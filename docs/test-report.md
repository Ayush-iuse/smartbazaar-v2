# Test Report: SmartBazaar AI

This report documents the verification and test suite execution results of the **SmartBazaar AI** backend.

---

## 1. Test Suite Architecture

The backend implements automated integration testing using **pytest**.
- **Isolation Strategy**: Databases tests run against an in-memory SQLite database (`sqlite://`) to ensure zero-footprint test cycles.
- **Fixture Reusability**: [conftest.py](file:///e:/PPT/jio%20internship/cart/tests/conftest.py) manages a transactional lifecycle using `StaticPool`. Every test starts with a clean database instance setup via `Base.metadata.create_all` and is torn down automatically on cleanup via `Base.metadata.drop_all`.
- **API Client**: Overrides dependencies injection (`get_db`) to inject the test database session into FastAPIs TestClient.

---

## 2. Test Cases Overview

The test coverage covers 16 verification cases across 5 major functional modules:

### 1. Authentication (`test_auth.py`)
- **`test_register_user`**: Verifies user registration with valid JSON formats, returning 201 Created and returning user meta fields.
- **`test_login_user`**: Verifies user token generation via OAuth2 urlencoded username/password form submissions, returning a valid access token.
- **`test_get_me`**: Verifies auth profile extraction using a `Bearer <token>` request header.

### 2. Listings (`test_listings.py`)
- **`test_create_listing`**: Verifies creation, price metadata validation, and automatic low-level fraud scan scoring.
- **`test_get_listings_feed`**: Verifies list pagination and chronological query order.
- **`test_listing_detail`**: Verifies detail fetching by database ID.
- **`test_update_listing_owner`**: Verifies listing edits compile and successfully update when the seller is the owner.
- **`test_update_listing_non_owner`**: Asserts non-owner listing modifications fail with a `403 Forbidden` response.
- **`test_delete_listing_owner`**: Verifies listing deletion by listing owner.
- **`test_delete_listing_non_owner`**: Asserts listing deletion by other users fails with `403 Forbidden`.

### 3. Search (`test_search.py`)
- **`test_search_listings`**: Validates search index lookups across query parameters:
  - Text search (`q=iPhone`) matching item titles.
  - Category filtering (`category=Furniture`).
  - Geolocation filtering (`location=Pune`).

### 4. Messages (`test_messages.py`)
- **`test_send_and_get_messages`**: Validates listing chat workflows, asserting message insertions and conversational logs retrieve sorted by time.

### 5. AI Services (`test_ai.py`)
- **`test_ai_description`**: Verifies standard fallback description generator triggers correctly (mocking offline API environment outputs).
- **`test_ai_category`**: Verifies rule-based keyword mapper maps text into standard categories (e.g. mapping "Dining table" to "Furniture").
- **`test_ai_price`**: Verifies fallback price range generators based on item category and conditions.
- **`test_ai_fraud`**: Verifies spam keyword checking catches scam patterns and assigns a High-Risk score (e.g. matching keywords like "Western Union" or "advance payment").

---

## 3. Test Suite Execution Output

```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.1.0, pluggy-1.6.0
rootdir: E:\PPT\jio internship\cart
plugins: anyio-4.13.0, asyncio-1.4.0
asyncio: mode=strict, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collected 16 items

tests\test_ai.py ....                                                    [ 25%]
tests\test_auth.py ...                                                   [ 43%]
tests\test_listings.py .......                                           [ 87%]
tests\test_messages.py .                                                 [ 93%]
tests\test_search.py .                                                   [100%]

============================== warnings summary ===============================
(11 warnings suppressed)
====================== 16 passed, 11 warnings in 39.06s =======================
```

**Status**: `100% Passed (16/16 Test Cases)`
