import os
import sys

# ── Must be set BEFORE any backend imports so config.py validators run correctly
# and Alembic migrations / SQLite fallback are skipped on Vercel serverless.
os.environ.setdefault("APP_ENV", "production")

# Add repo root to Python path so `backend.*` imports resolve
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app  # noqa: E402  (import after sys.path patch)
