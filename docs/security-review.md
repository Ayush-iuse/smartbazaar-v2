# Security Review Report: SmartBazaar AI

This report assesses the security posture of the SmartBazaar AI application, verifying compliance with the project's **Constitution** (specifically the *Security First* and *Privacy* principles).

---

## 1. Security Baseline & Architecture

SmartBazaar AI enforces a layered defense architecture across both the FastAPI backend and Next.js frontend to protect system integrity and user privacy.

---

## 2. Security Controls Assessment

### Input Validation
- **Status**: `Pass`
- **Details**: All backend entry points enforce input schema constraints using **Pydantic V2**. Types, string lengths, and structural models are validated before database insertion:
  - Auth registration (`UserCreate`) validates email formats and password requirements.
  - Listings (`ListingCreate`, `ListingUpdate`) enforce maximum sizes on fields like `image_urls` (max 4 images) and non-empty parameters.
  - AI services schemas validate title lengths and item condition schemas.

### SQL Injection Prevention
- **Status**: `Pass`
- **Details**: The backend uses **SQLAlchemy ORM** exclusively for database interactions (`db.query()`). 
  - All query filters utilize SQLAlchemy's parameterized queries under the hood.
  - A project-wide code audit confirmed that no raw string formatting or string interpolation is used to execute queries (zero occurrences of `.execute()` on raw strings).

### XSS Prevention (HTML Escaping)
- **Status**: `Pass`
- **Details**: Input fields that render dynamically on the frontend (specifically listing titles and descriptions) are sanitized in [validation.py](file:///e:/PPT/jio%20internship/cart/backend/app/utils/validation.py) before write-back to the database using Python's `html.escape`.
  - Listing creation escapes input fields via `sanitize_listing_input`.
  - Listing edits escape updated titles/descriptions dynamically.
  - This guarantees that malicious JavaScript injected by buyers/sellers is safely stored as literal HTML entities and cannot execute in target client browsers.

### Password Hashing
- **Status**: `Pass`
- **Details**: User password authentication utilizes a pure-python `bcrypt` context in [jwt.py](file:///e:/PPT/jio%20internship/cart/backend/app/utils/jwt.py).
  - Passwords are salted dynamically (`bcrypt.gensalt()`) and hashed using `bcrypt.hashpw` before database insertion.
  - Plaintext passwords are never saved.
  - The API schemas (`UserResponse`) exclude the `hashed_password` field entirely, ensuring hashes are never sent over HTTP responses.

### JWT Validation & Secret Management
- **Status**: `Pass`
- **Details**: Stateless auth tokens are signed and parsed via the PyJWT library:
  - Signed tokens use the cryptographically secure `HS256` hashing algorithm.
  - Token lifetimes default to 24 hours (`ACCESS_TOKEN_EXPIRE_MINUTES = 1440`).
  - Secret keys and algorithms are loaded dynamically from environment variables (`JWT_SECRET`, `JWT_ALGORITHM`) via `pydantic-settings` BaseSettings, with safe fallbacks for development. Secrets are never hard-coded in the source code.

### CORS Origin Restriction
- **Status**: `Pass`
- **Details**: CORS configurations in [main.py](file:///e:/PPT/jio%20internship/cart/backend/app/main.py) restrict traffic exclusively to trusted localhost web environments:
  - Allowed origins: `http://localhost:3000` and `http://127.0.0.1:3000`.
  - Credentials are fully supported, but origin access is bounded, preventing unauthorized cross-origin data extraction.

### Data Privacy & Exposure Risks
- **Status**: `Pass`
- **Details**:
  - The `ListingResponse` schema returns only necessary listing information and the seller ID. It does not surface any personal seller details (e.g. emails, full names).
  - In-app chat messaging ([messages.py](file:///e:/PPT/jio%20internship/cart/backend/app/routers/messages.py)) provides a private conversation interface. Seller contact details (phone, email) are kept hidden to prevent harassment and spam.

---

## 3. Recommendations & Future Enhancements
1. **JWT Expiration**: Consider reducing JWT token expiration from 24 hours to 15-30 minutes and implementing standard refresh token patterns for production deployments.
2. **Password Strength Validation**: Integrate robust password strength libraries (e.g., `zxcvbn`) to reject common/weak passwords during registration.
3. **Database Constraints**: Add a database level foreign-key check or indexing on `sender_id` and `listing_id` inside messages tables to prevent orphaned records.
