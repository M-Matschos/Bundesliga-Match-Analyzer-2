from datetime import datetime

from fastapi import APIRouter
from sqlalchemy import text

from app.models.db import engine
from app.core.redis_pubsub import pubsub_manager

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    """Fast liveness probe — used by load balancers."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@router.get("/health/detailed", tags=["Health"])
async def health_check_detailed():
    """Readiness probe — checks DB and Redis connectivity."""
    checks = {}
    overall = "ok"

    # Database check
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = {"status": "ok"}
    except Exception as e:
        checks["database"] = {"status": "error", "detail": str(e)}
        overall = "degraded"

    # Redis check
    try:
        is_connected = await pubsub_manager.is_connected()
        checks["redis"] = {"status": "ok" if is_connected else "unavailable"}
        if not is_connected:
            overall = "degraded"
    except Exception as e:
        checks["redis"] = {"status": "error", "detail": str(e)}
        overall = "degraded"

    return {
        "status": overall,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks,
    }
