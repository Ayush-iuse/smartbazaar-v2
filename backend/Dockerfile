FROM python:3.11-slim

WORKDIR /workspace

# Install psycopg2-binary dependencies (debian build tools if compile is needed, but binary uses wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code to /workspace/backend
COPY . ./backend

# Set PYTHONPATH to /workspace so that 'backend.app' resolves correctly
ENV PYTHONPATH=/workspace

EXPOSE 8000

# Set working directory to backend folder and run uvicorn
WORKDIR /workspace/backend
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
