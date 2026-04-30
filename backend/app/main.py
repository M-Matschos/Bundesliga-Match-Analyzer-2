"""
Match Oracle — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import logging

from app.routers import matches, predictions, teams, players, betting, auth, websocket
from app.core.config import settings
from app.core.redis_pubsub import pubsub_manager
from app.models.db import Base, engine

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Match Oracle API",
    description="Bundesliga Match Predictor & Wettanalyse",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routen einbinden
app.include_router(auth.router,        prefix="/api/v1/auth",         tags=["Auth"])
app.include_router(matches.router,     prefix="/api/v1/matches",      tags=["Matches"])
app.include_router(predictions.router, prefix="/api/v1/predictions",  tags=["Predictions"])
app.include_router(teams.router,       prefix="/api/v1/teams",        tags=["Teams"])
app.include_router(players.router,     prefix="/api/v1/players",      tags=["Players"])
app.include_router(betting.router,     prefix="/api/v1/virtual-bets", tags=["Virtual Betting"])
app.include_router(websocket.router,   prefix="/api/v1/ws",           tags=["WebSocket"])


@app.on_event("startup")
async def startup():
    """Initialize database tables and Redis connection on startup."""
    try:
        # 1. Initialize database tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("[OK] Database tables initialized")

        # 2. Connect to Redis Pub/Sub
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
        # Disconnect from Redis
        await pubsub_manager.disconnect()
        logger.info("[OK] Redis Pub/Sub disconnected")
    except Exception as e:
        logger.error(f"[ERROR] Shutdown failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint with Redis status."""
    redis_connected = await pubsub_manager.is_connected()
    return {
        "status": "ok",
        "version": "1.0.0",
        "redis": "connected" if redis_connected else "disconnected"
    }
