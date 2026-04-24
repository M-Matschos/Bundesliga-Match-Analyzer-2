"""
Match Oracle — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json

from app.routers import matches, predictions, teams, players, betting, auth
from app.core.config import settings
from ml.weekend_calculator import WeekendCalculator

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


@app.post("/api/v1/calculate/weekend")
async def calculate_weekend_endpoint(
    leagues: list[str] = ["BL1", "BL2"],
    date_from: str = None,
    date_to:   str = None,
):
    """
    HAUPTENDPOINT: Berechnet alle Wochenend-Spiele.
    Gibt Server-Sent Events für Live-Fortschritt zurück.
    """
    calculator = WeekendCalculator()

    async def event_generator():
        progress_messages = []

        async def progress_callback(message: str, percent: int):
            event = json.dumps({"status": "loading", "message": message, "progress": percent})
            progress_messages.append(f"data: {event}\n\n")

        results = await calculator.calculate_weekend(
            leagues=leagues,
            progress_callback=progress_callback,
        )

        for msg in progress_messages:
            yield msg

        done_event = json.dumps({"status": "done", **results})
        yield f"data: {done_event}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/v1/calculate/match/{match_id}")
async def calculate_single_match(match_id: str):
    """Berechnet eine einzelne Begegnung (~500ms)."""
    calculator = WeekendCalculator()
    result = await calculator.calculate_single_by_id(match_id)
    return {"status": "success", "data": result}


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
