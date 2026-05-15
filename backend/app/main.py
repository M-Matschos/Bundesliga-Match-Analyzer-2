"""
Match Oracle — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
import asyncio
import json
import logging

from app.routers import (
    matches,
    predictions,
    teams,
    players,
    betting,
    auth,
    websocket,
    health,
    alerts,
    notifications,
    weekend,
    metrics,
    events,
)
from app.core.config import settings
from app.core.redis_pubsub import pubsub_manager
from app.core.cache import init_cache, close_cache, _InMemoryCache
from app.models.db import Base, engine
from app.core import cache as cache_module

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Match Oracle API",
    description="Bundesliga Match Predictor & Wettanalyse",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


def _cors_list(value) -> list:
    """Parse CORS setting — handles both str and list from config validators."""
    if isinstance(value, list):
        return value
    return [v.strip() for v in str(value).split(",")]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_list(settings.cors_origins),
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=_cors_list(settings.cors_allow_methods),
    allow_headers=_cors_list(settings.cors_allow_headers),
)

# Routen einbinden
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(matches.router, prefix="/api/v1/matches", tags=["Matches"])
app.include_router(
    predictions.router, prefix="/api/v1/predictions", tags=["Predictions"]
)
app.include_router(teams.router, prefix="/api/v1/teams", tags=["Teams"])
app.include_router(players.router, prefix="/api/v1/players", tags=["Players"])
app.include_router(
    betting.router, prefix="/api/v1/virtual-bets", tags=["Virtual Betting"]
)
app.include_router(websocket.router, prefix="/api/v1/ws", tags=["WebSocket"])
app.include_router(health.router, tags=["Health"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(
    notifications.router, prefix="/api/v1/notifications", tags=["Notifications"]
)
app.include_router(weekend.router, prefix="/api/v1/weekend", tags=["Weekend"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["Metrics"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])


@app.on_event("startup")
async def startup():
    """Initialize database tables and Redis connection on startup."""
    try:
        # 1. Initialize database tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("[OK] Database tables initialized")

        # 2. Initialize cache
        if cache_module.cache is None:
            try:
                await init_cache()
                logger.info("[OK] Cache initialized (Redis)")
            except Exception as e:
                logger.warning(
                    f"[WARN] Cache init failed ({type(e).__name__}), using in-memory fallback"
                )
                cache_module.cache = _InMemoryCache()

        # 3. Connect to Redis Pub/Sub
        await pubsub_manager.connect()
        is_connected = await pubsub_manager.is_connected()
        if is_connected:
            logger.info("[OK] Redis Pub/Sub connected successfully")
        else:
            logger.warning("[WARN] Redis Pub/Sub connection failed")
    except Exception as e:
        logger.error(f"[ERROR] Startup initialization failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown():
    """Cleanup connections on shutdown."""
    try:
        # Close cache
        await close_cache()
        logger.info("[OK] Cache closed")

        # Disconnect from Redis
        await pubsub_manager.disconnect()
        logger.info("[OK] Redis Pub/Sub disconnected")
    except Exception as e:
        logger.error(f"[ERROR] Shutdown failed: {str(e)}")
