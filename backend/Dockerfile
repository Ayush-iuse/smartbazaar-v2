# =============================================================================
# Stage 1: Build & Dependencies compilation
# =============================================================================
FROM python:3.11-slim AS builder

WORKDIR /workspace

# Install system dependencies needed for compilation (e.g. build tools for some packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install requirements to a localized user directory to copy in Stage 2
COPY requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# =============================================================================
# Stage 2: Final lightweight runner image
# =============================================================================
FROM python:3.11-slim AS runner

WORKDIR /workspace

# Install runtime dependencies for Postgres/psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy installed site-packages dependencies from builder stage
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy backend app source code
COPY . ./backend

# Environment settings
ENV PYTHONPATH=/workspace
ENV PORT=8000

EXPOSE 8000

# Working directory
WORKDIR /workspace/backend

# Production ready healthcheck utilizing built-in python libraries
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request, os; port = os.getenv('PORT', '8000'); urllib.request.urlopen(f'http://localhost:{port}/health')"

# Run production WSGI/ASGI server Uvicorn binding to the dynamic PORT
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
