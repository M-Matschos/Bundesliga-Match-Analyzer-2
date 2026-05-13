"""
Weekend Calculator Router
POST /api/v1/weekend/calculate  → Alle Spiele des Wochenendes berechnen
GET  /api/v1/weekend/results/{job_id}
GET  /api/v1/weekend/next
GET  /api/v1/weekend/matchday/{league}/{matchday}
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..core.cache import cache
from ..ml.models.monte_carlo import MonteCarloSimulator
from ..ml.features.feature_engineering import build_features
from ..data.collectors.api_football import APIFootballCollector
from ..data.collectors.odds_collector import OddsCollector

router = APIRouter()
simulator = MonteCarloSimulator(n_simulations=100_000)
football_api = APIFootballCollector()
odds_api = OddsCollector()


# ─── Pydantic Schemas ────────────────────────────────────────

class WeekendRequest(BaseModel):
    leagues: List[str] = ["bundesliga", "bundesliga2"]
    date_from: Optional[str] = None   # ISO Format: "2025-03-29"
    date_to:   Optional[str] = None   # ISO Format: "2025-03-30"
    simulations: int = 100_000

    class Config:
        json_schema_extra = {
            "example": {
                "leagues": ["bundesliga", "bundesliga2"],
                "date_from": "2025-03-29",
                "date_to": "2025-03-30",
                "simulations": 100000
            }
        }


# ─── Helper ──────────────────────────────────────────────────

LEAGUE_IDS = {
    "bundesliga":     78,
    "bundesliga2":    79,
    "premier-league": 39,
    "championship":   40,
    "champions-league": 2,
    "dfb-pokal":      81,
}

def get_next_weekend() -> tuple[str, str]:
    """Ermittelt das nächste Spielwochenende (Fr–So)."""
    today = datetime.now()
    days_until_friday = (4 - today.weekday()) % 7
    if days_until_friday == 0 and today.hour > 20:
        days_until_friday = 7
    friday = today + timedelta(days=days_until_friday)
    sunday = friday + timedelta(days=2)
    return friday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")

def build_summary(matches: list) -> dict:
    high = sum(1 for m in matches if m.get("prediction", {}).get("confidence_label") == "HOCH")
    medium = sum(1 for m in matches if m.get("prediction", {}).get("confidence_label") == "MITTEL")
    low = sum(1 for m in matches if m.get("prediction", {}).get("confidence_label") == "NIEDRIG")
    value_bets = sum(1 for m in matches if m.get("prediction", {}).get("value_bet", {}).get("exists"))
    return {
        "total_matches":    len(matches),
        "high_confidence":  high,
        "medium_confidence": medium,
        "low_confidence":   low,
        "value_bets_found": value_bets
    }


# ─── Hintergrund-Task ────────────────────────────────────────

async def run_weekend_calculation(job_id: str, request: WeekendRequest):
    """
    Hintergrund-Task: Berechnet alle Prognosen und cached sie in Redis.
    Wird nach POST /calculate gestartet.
    """
    try:
        # Status: läuft
        if cache:
            await cache.set(f"weekend_job:{job_id}", {"status": "calculating", "progress": 0})

        all_matches = []
        for league in request.leagues:
            league_id = LEAGUE_IDS.get(league)
            if not league_id:
                continue
            matches = await football_api.get_fixtures(
                league_id=league_id,
                date_from=request.date_from,
                date_to=request.date_to
            )
            all_matches.extend(matches)

        results = []
        for i, match in enumerate(all_matches):
            # Fortschritt updaten
            if cache and len(all_matches) > 0:
                progress = int((i / len(all_matches)) * 100)
                await cache.set(f"weekend_job:{job_id}", {
                    "status": "calculating",
                    "progress": progress,
                    "current_match": f"{match['home_team']['name']} vs {match['away_team']['name']}"
                })

            # Features bauen + Prognose berechnen
            features = await build_features(match)
            prediction = simulator.simulate(
                lambda_home=features["lambda_home"],
                lambda_away=features["lambda_away"]
            )
            prediction["shap_top3"] = features.get("shap_top3", [])

            # Value Bet prüfen
            odds = await odds_api.get_odds(match["match_id"])
            if odds:
                prediction["value_bet"] = check_value_bet(prediction, odds)

            results.append({**match, "prediction": prediction})

        # Fertig → in Redis speichern (24h)
        if cache:
            final_result = {
                "status": "completed",
                "calculated_at": datetime.utcnow().isoformat() + "Z",
                "matches": results,
                "summary": build_summary(results)
            }
            await cache.set(f"weekend_result:{job_id}", final_result, ttl=86400)
            await cache.set(f"weekend_job:{job_id}", {"status": "completed", "progress": 100})

    except Exception as e:
        if cache:
            await cache.set(f"weekend_job:{job_id}", {"status": "error", "error": str(e)})
        raise


def check_value_bet(prediction: dict, odds: dict) -> dict:
    """Prüft ob ein Value Bet vorhanden ist (unsere Wk > implizite Bookmaker-Wk)."""
    selections = {
        "home_win": prediction["home_win"],
        "draw":     prediction["draw"],
        "away_win": prediction["away_win"]
    }
    best_value = {"exists": False}

    for selection, our_prob in selections.items():
        if selection not in odds:
            continue
        bookmaker_prob = 1 / odds[selection]["best_odds"]
        edge = our_prob - bookmaker_prob
        if edge > 0.03:  # Mindest-Edge: 3%
            if not best_value["exists"] or edge > best_value.get("edge", 0):
                best_value = {
                    "exists": True,
                    "selection": selection,
                    "our_prob": round(our_prob, 3),
                    "bookmaker_prob": round(bookmaker_prob, 3),
                    "edge": round(edge, 3),
                    "edge_percent": round(edge * 100, 1),
                    "best_odds": odds[selection]["best_odds"],
                    "best_bookmaker": odds[selection]["bookmaker"]
                }
    return best_value


# ─── API Endpunkte ───────────────────────────────────────────

@router.post("/calculate")
async def calculate_weekend(request: WeekendRequest, background_tasks: BackgroundTasks):
    """
    Startet die Berechnung aller Spiele des Wochenendes.
    Gibt sofort eine job_id zurück — Ergebnis per GET /results/{job_id} abfragen.
    """
    # Datum auto-befüllen wenn nicht angegeben
    if not request.date_from or not request.date_to:
        request.date_from, request.date_to = get_next_weekend()

    # Cache prüfen — schon berechnet?
    cache_key = f"weekend_cache:{'_'.join(sorted(request.leagues))}:{request.date_from}"
    cached = None
    if cache:
        cached = await cache.get(cache_key)
    if cached:
        return {**cached, "from_cache": True}

    job_id = f"wknd_{datetime.now().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"

    # Anzahl Spiele für Zeitschätzung
    total_matches = 0
    for league in request.leagues:
        if league in LEAGUE_IDS:
            fixtures = await football_api.get_fixtures(LEAGUE_IDS[league], request.date_from, request.date_to)
            total_matches += len(fixtures)

    # Berechnung im Hintergrund starten
    background_tasks.add_task(run_weekend_calculation, job_id, request)

    return JSONResponse(
        status_code=202,
        content={
            "job_id": job_id,
            "status": "calculating",
            "total_matches": total_matches,
            "estimated_seconds": total_matches * 0.8,
            "date_from": request.date_from,
            "date_to": request.date_to,
            "poll_url": f"/api/v1/weekend/results/{job_id}"
        }
    )


@router.get("/results/{job_id}")
async def get_results(job_id: str):
    """Fragt den Status / das Ergebnis einer Berechnung ab."""
    if not cache:
        raise HTTPException(status_code=503, detail="Cache nicht verfügbar")

    result = await cache.get(f"weekend_result:{job_id}")
    if result:
        return result

    job_status = await cache.get(f"weekend_job:{job_id}")
    if job_status:
        return job_status

    raise HTTPException(status_code=404, detail="Job nicht gefunden")


@router.get("/next")
async def get_next_weekend_matches(leagues: str = "bundesliga,bundesliga2"):
    """Gibt alle Spiele des nächsten Wochenendes zurück (ohne Prognose)."""
    league_list = [l.strip() for l in leagues.split(",")]
    date_from, date_to = get_next_weekend()

    all_matches = []
    for league in league_list:
        league_id = LEAGUE_IDS.get(league)
        if league_id:
            matches = await football_api.get_fixtures(league_id, date_from, date_to)
            all_matches.extend(matches)

    return {
        "date_from": date_from,
        "date_to":   date_to,
        "leagues":   league_list,
        "total":     len(all_matches),
        "matches":   all_matches
    }


@router.get("/matchday/{league}/{matchday}")
async def get_matchday(league: str, matchday: int):
    """
    Berechnet Prognosen für einen bestimmten Spieltag.
    Vergangene Spieltage: zeigt Ergebnis vs. Prognose (Backtest).
    Zukünftige Spieltage: zeigt Prognose.
    """
    league_id = LEAGUE_IDS.get(league)
    if not league_id:
        raise HTTPException(status_code=400, detail=f"Unbekannte Liga: {league}")

    matches = await football_api.get_fixtures_by_matchday(league_id, matchday)
    results = []

    for match in matches:
        features = await build_features(match)
        prediction = simulator.simulate(
            lambda_home=features["lambda_home"],
            lambda_away=features["lambda_away"]
        )

        result_entry = {**match, "prediction": prediction}

        # Wenn Spiel schon gespielt: Backtest-Vergleich
        if match.get("home_goals") is not None:
            actual_outcome = (
                "home_win" if match["home_goals"] > match["away_goals"]
                else "draw" if match["home_goals"] == match["away_goals"]
                else "away_win"
            )
            predicted_outcome = max(
                ["home_win", "draw", "away_win"],
                key=lambda x: prediction[x]
            )
            result_entry["backtest"] = {
                "actual_outcome":    actual_outcome,
                "predicted_outcome": predicted_outcome,
                "correct":           actual_outcome == predicted_outcome,
                "actual_score":      f"{match['home_goals']}:{match['away_goals']}"
            }

        results.append(result_entry)

    correct = sum(1 for r in results if r.get("backtest", {}).get("correct"))
    total_finished = sum(1 for r in results if "backtest" in r)

    return {
        "league":   league,
        "matchday": matchday,
        "matches":  results,
        "accuracy": round(correct / total_finished, 3) if total_finished > 0 else None
    }
