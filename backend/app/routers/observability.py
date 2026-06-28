import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware
from backend.app.database import get_db

router = APIRouter(tags=["Observability"])

# In-memory metrics storage
metrics_store = {
    "total_requests": 0,
    "total_latency": 0.0,
    "error_count": 0,
    "status_codes": {}
}

class TelemetryMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip static assets or file uploads from telemetry tracking if needed
        if request.url.path.startswith("/uploads"):
            return await call_next(request)

        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            metrics_store["total_requests"] += 1
            metrics_store["total_latency"] += process_time
            
            status_str = str(response.status_code)
            metrics_store["status_codes"][status_str] = metrics_store["status_codes"].get(status_str, 0) + 1
            if response.status_code >= 400:
                metrics_store["error_count"] += 1
                
            response.headers["X-Response-Time"] = f"{process_time:.4f}s"
            return response
        except Exception as e:
            process_time = time.time() - start_time
            metrics_store["total_requests"] += 1
            metrics_store["total_latency"] += process_time
            metrics_store["error_count"] += 1
            metrics_store["status_codes"]["500"] = metrics_store["status_codes"].get("500", 0) + 1
            raise e

@router.get("/ready")
def ready_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection error: {str(e)}")

@router.get("/metrics")
def metrics_endpoint():
    avg_latency = 0.0
    if metrics_store["total_requests"] > 0:
        avg_latency = metrics_store["total_latency"] / metrics_store["total_requests"]
        
    return {
        "total_requests": metrics_store["total_requests"],
        "average_latency_seconds": avg_latency,
        "error_count": metrics_store["error_count"],
        "status_code_distribution": metrics_store["status_codes"]
    }
