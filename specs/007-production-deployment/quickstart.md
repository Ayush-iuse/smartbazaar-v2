# Quickstart & Verification Guide: SmartBazaar V2 Production Deployment

This guide outlines runnable scenarios to validate that the SmartBazaar V2 configuration operates successfully across local development and production environments.

---

## 1. PRE-REQUISITES

- Docker Desktop installed and running.
- Python 3.10+ installed globally (for running tests/scripts outside Docker).

---

## 2. SCENARIO A: LOCAL DEVELOPMENT LAUNCH

Verify that the local environment boots using container configurations and operates without cloud dependencies.

1. Clean existing images and containers:
   ```bash
   docker compose down -v
   ```
2. Build and start services:
   ```bash
   docker compose up --build -d
   ```
3. Run database seed to populate SQLite/PostgreSQL:
   ```bash
   docker exec -it smartbazaar-backend python app/seed.py
   ```
4. Verify backend health check returns `status: healthy`:
   ```bash
   curl http://localhost:8000/health
   ```
5. Open `http://localhost:3000` in the browser and verify the listing and chat interfaces load.

---

## 3. SCENARIO B: PRODUCTION ENVIRONMENT SIMULATION

Validate connection pooling and Cloudinary fallbacks using a simulated `.env` setup.

1. Create a local `.env` file containing fake Cloudinary and cloud Redis credentials:
   ```bash
   CLOUDINARY_CLOUD_NAME=fake_name
   CLOUDINARY_API_KEY=fake_key
   CLOUDINARY_API_SECRET=fake_secret
   REDIS_URL=rediss://default:fake_password@upstash-redis.com:6379
   ```
2. Start the FastAPI server locally:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --port 8000
   ```
3. Send a request to upload media. Verify that the backend logs show:
   `Cloudinary credentials are not set. Media uploads will fall back to local disk storage.` (if keys are invalid/empty) OR `Failed uploading to Cloudinary... Falling back to local storage.` (if network/handshake fails).
4. Verify that the upload succeeds and saves to the local storage, preserving service availability.

---

## 4. SCENARIO C: AUTOMATED TEST VERIFICATION

Verify the test suite runs correctly.

1. Run the test suite:
   ```bash
   python -m pytest backend/tests/ -v
   ```
2. Check that all **25 tests pass** successfully.
