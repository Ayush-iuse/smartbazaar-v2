# Quickstart: SmartBazaar AI Core Validation

This guide explains how to spin up, build, and verify the SmartBazaar AI local environment.

## Prerequisites
- Docker and Docker Compose installed.
- Python 3.11+ (for local backend tests).
- Node.js 20+ (for local frontend build testing).

## Setup & Run

1. Clone or navigate to the repository directory.
2. Initialize the environment configuration file:
   ```bash
   cp .env.example .env
   ```
3. Run the complete application stack using Docker Compose:
   ```bash
   docker compose up --build
   ```
4. Verify the containers are healthy:
   - Next.js Frontend: `http://localhost:3000`
   - FastAPI Backend Swagger API Docs: `http://localhost:8000/docs`

## Automated Test Execution

### Backend Tests
To execute backend verification scripts:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
pytest
```

### Frontend Checks
To execute frontend validations:
```bash
cd frontend
npm install
npm run lint
npm run build
```

## Manual Verification Flows

### Scenario 1: User Onboarding and Auth
1. Access the register route. Create an account with email `test@example.com` and password `Password123!`.
2. Access the login route. Provide these credentials and confirm a successful login redirecting to the user dashboard.

### Scenario 2: AI-Enhanced Listing Creator
1. Click "Create Listing".
2. Type in "iPhone 13 Pro Max" in the title.
3. Observe that the Category field is automatically populated with "Electronics" using AI recommendation.
4. Input "Used" as the condition and check the Recommended Price bounds (INR 45,000 - 52,000).
5. Input keywords "blue, 128GB, unlocked" and click "Generate AI Description". Confirm a 2-3 sentence description appears in the text area.
6. Submit the listing and verify it shows up on the home page feed.
