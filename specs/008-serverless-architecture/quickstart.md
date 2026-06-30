# Verification Quickstart Guide: SmartBazaar V3 — Full Serverless Vercel Architecture

This guide describes how to run and validate the serverless application locally in development, emulating the production Vercel + Supabase stack.

---

## 1. LOCAL DEVELOPMENT SETUP

To run Vercel serverless functions and Supabase services locally without cloud dependencies:

### Prerequisites
1. **Node.js** (v20+)
2. **Vercel CLI**: Install globally via `npm install -g vercel`
3. **Docker**: Required for local Supabase emulator CLI (optional fallback to SQLite exists).

### Run Command
Start the local serverless development environment by running:
```bash
# From the root directory, start the Vercel emulator
vercel dev
```
This runs Next.js on port 3000 and emulates the stateless FastAPI backend Python functions on port 3000 under the `/api` route prefix.

---

## 2. VALIDATION SCENARIOS

### Scenario 1: Authentication & Token Generation
Validate that the Supabase Auth client registers users and retrieves JWT session tokens.
1. Open the browser and navigate to `http://localhost:3000/login`.
2. Enter email credentials and click **Sign Up**.
3. Verify that a user profile record is created in the database and a session token is saved in the browser's `localStorage` as `sb_auth_token`.

### Scenario 2: Real-time Messaging & Seen Status
Validate message delivery over Supabase Realtime Channels.
1. Open two browser sessions side-by-side: `Session A` logged in as Buyer, `Session B` logged in as Seller.
2. Select the same active conversation in both panels.
3. Type in `Session A` and verify that `Session B` displays the typing indicator in real time.
4. Send a text in `Session A` and verify that the message is instantly rendered in `Session B` using client-direct subscriptions.

### Scenario 3: Secure Asset Storage Uploads
Validate file uploads directly to the `listings` Supabase storage bucket.
1. Go to `http://localhost:3000/create-listing`.
2. Select a JPEG image file under 5MB.
3. Click **Upload** and verify in the console that:
   - The file is uploaded to the `listings` bucket.
   - The serverless function retrieves the public URL.
   - The preview renders correctly on-screen.

---

## 3. AUTOMATED VERIFICATION SCHEMAS
The validation of interface rules is executed by the test suite:
```bash
# Verify all endpoint specifications and schemas
npm run test:e2e
```
All tests must pass successfully to certify deployment readiness.
