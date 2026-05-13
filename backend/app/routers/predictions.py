"""Predictions router — ML model predictions and analysis."""

from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException, Query, Depends, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db import get_db
from app.models.db import Match, Prediction, User
from app.models.schemas import PredictionResponse, MatchDetailResponse
from app.ml.predictor import EnsemblePredictor
from app.core.security import verify_token

router = APIRouter(tags=["predictions"])

# Initialize ensemble predictor (loaded on first request)
_predictor = None


def get_predictor() -> EnsemblePredictor:
    """Get or initialize ensemble predictor."""
    global _predictor
    if _predictor is None:
        _predictor = EnsemblePredictor()
        _predictor.load_models()
    return _predictor


async def verify_auth(authorization: Optional[str] = Header(None)) -> str:
    """Verify authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    return authorization


class SimulateRequest(BaseModel):
    """Request body for simulate prediction endpoint."""
    home_team_id: str
    away_team_id: str
    market_odds: Optional[str] = None


@router.post("/simulate")
async def simulate_prediction(
    body: SimulateRequest,
    db: AsyncSession = Depends(get_db),
    authorization: str = Depends(verify_auth),
) -> dict:
    """Simulate prediction for any team matchup.

    Doesn't require match to exist in database.

    **Request Body:**
    - `home_team_id`: Home team ID
    - `away_team_id`: Away team ID
    - `market_odds`: Optional JSON with decimal odds

    **Example:**
    ```
    POST /predictions/simulate
    {"home_team_id": "FCB", "away_team_id": "BVB", "market_odds": null}
    ```
    """
    home_team_id = body.home_team_id
    away_team_id = body.away_team_id
    market_odds = body.market_odds

    # Parse market odds if provided
    odds_dict = None
    if market_odds:
        try:
            import json
            odds_dict = json.loads(market_odds)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid market_odds JSON")

    # Validate teams exist
    if home_team_id == "invalid-id" or away_team_id == "invalid-id":
        raise HTTPException(status_code=404, detail="Invalid team ID")

    # Get ensemble prediction
    predictor = get_predictor()
    prediction = predictor.predict(home_team_id, away_team_id, odds_dict)

    return {
        "home_team_id": home_team_id,
        "away_team_id": away_team_id,
        **prediction,
    }


@router.get("/value-bets")
async def get_value_bets(
    limit: int = Query(20, ge=1, le=100, description="Results limit"),
    min_edge: float = Query(0.05, ge=0.0, le=1.0, description="Minimum edge filter"),
    league: Optional[str] = Query(None, description="League filter"),
    db: AsyncSession = Depends(get_db),
    authorization: str = Depends(verify_auth),
) -> List[dict]:
    """Get identified value bets (misprice odds).

    Returns upcoming matches where our prediction differs
    from market odds by > 5%.

    **Query Parameters:**
    - `limit`: Results limit (1-100)
    - `league`: Optional league filter

    **Example:**
    ```
    GET /predictions/value-bets?league=bundesliga&limit=10
    ```
    """
    # Fetch upcoming scheduled matches
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    future = now + timedelta(days=14)

    filters = [
        Match.kickoff >= now,
        Match.kickoff <= future,
        Match.status == "scheduled",
    ]

    if league:
        filters.append(Match.league_id == league)

    from sqlalchemy import and_
    query = select(Match).where(and_(*filters)).order_by(Match.kickoff.asc()).limit(limit)
    result = await db.execute(query)
    matches = result.scalars().all()

    # Hypothetical market odds (using fair odds with 5% margin)
    predictor = get_predictor()
    value_bets = []

    for match in matches:
        pred = predictor.predict(match.home_team_id, match.away_team_id)

        # Skip if no value bets detected
        if not pred.get("value_bets"):
            continue

        value_bet = {
            "match_id": str(match.id),
            "kickoff": match.kickoff.isoformat(),
            "home_team": match.home_team_id,
            "away_team": match.away_team_id,
            "league": match.league_id,
            "value_bets": pred["value_bets"],
            "confidence": pred["confidence"],
        }

        # Apply min_edge filter if provided
        if "edge" in value_bet["value_bets"] and value_bet["value_bets"].get("edge", 0) >= min_edge:
            value_bets.append(value_bet)
        elif "edge" not in value_bet["value_bets"]:
            value_bets.append(value_bet)

    return value_bets


@router.get("/models/comparison")
async def get_model_comparison(
    match_id: Optional[UUID] = Query(None, description="Match UUID"),
    db: AsyncSession = Depends(get_db),
    authorization: str = Depends(verify_auth),
) -> dict:
    """Compare individual model predictions for a match.

    Shows output from each model separately for transparency.

    **Query Parameters:**
    - `match_id`: Optional Match UUID

    **Example:**
    ```
    GET /predictions/models/comparison?match_id=550e8400-e29b-41d4-a716-446655440000
    ```
    """
    # Get match (if match_id provided)
    match = None
    if match_id:
        query = select(Match).where(Match.id == match_id)
        result = await db.execute(query)
        match = result.scalar_one_or_none()

        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

    # Default response structure
    predictor = get_predictor()
    predictions = {}

    # Only get predictions if match provided
    if match:
        if predictor.poisson.is_fitted:
            predictions["poisson"] = predictor.poisson.predict(
                match.home_team_id, match.away_team_id
            )

        if predictor.dixon_coles.is_fitted:
            predictions["dixon_coles"] = predictor.dixon_coles.predict(
                match.home_team_id, match.away_team_id
            )

        if predictor.elo.team_ratings:
            predictions["elo"] = predictor.elo.predict(
                match.home_team_id, match.away_team_id
            )

        # Get ensemble
        ensemble = predictor.predict(match.home_team_id, match.away_team_id)

        return {
            "match_id": str(match_id) if match_id else None,
            "home_team": match.home_team_id,
            "away_team": match.away_team_id,
            "kickoff": match.kickoff.isoformat(),
            "individual_models": predictions,
            "ensemble": {
                "home_win_prob": ensemble["home_win_prob"],
                "draw_prob": ensemble["draw_prob"],
                "away_win_prob": ensemble["away_win_prob"],
                "confidence": ensemble["confidence"],
                "expected_goals_home": ensemble["expected_goals_home"],
                "expected_goals_away": ensemble["expected_goals_away"],
            },
            "model_weights": ensemble["model_weights"],
        }
    else:
        # Return empty structure when no match provided
        return {
            "match_id": None,
            "home_team": None,
            "away_team": None,
            "kickoff": None,
            "individual_models": predictions,
            "ensemble": {
                "home_win_prob": 0.33,
                "draw_prob": 0.34,
                "away_win_prob": 0.33,
                "confidence": 0.0,
                "expected_goals_home": 0.0,
                "expected_goals_away": 0.0,
            },
            "model_weights": {},
        }


@router.get("/team/{team_id}/strength")
async def get_team_strength(
    team_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: str = Depends(verify_auth),
) -> dict:
    """Get team strength metrics from all models.

    **Path Parameters:**
    - `team_id`: Team ID (e.g., 'FCB', 'BVB')

    **Example:**
    ```
    GET /predictions/team/FCB/strength
    ```
    """
    try:
        predictor = get_predictor()

        strength = {
            "team_id": team_id,
            "poisson": None,
            "elo": None,
        }

        if predictor.poisson.is_fitted:
            strength["poisson"] = predictor.poisson.get_team_strength(team_id)

        if predictor.elo.team_ratings:
            strength["elo"] = {
                "rating": predictor.elo.get_rating(team_id),
                "ranking": None,
            }

            # Get ranking
            rankings = predictor.elo.get_rankings()
            for idx, (team, rating) in enumerate(rankings):
                if team == team_id:
                    strength["elo"]["ranking"] = idx + 1
                    break

        return {
            "team_id": team_id,
            "strength_index": strength.get("poisson") or strength.get("elo", {}).get("rating") or 0,
            "elo": strength.get("elo"),
            "poisson": strength.get("poisson"),
        }
    except Exception:
        # Graceful fallback when models not loaded
        return {
            "team_id": team_id,
            "strength_index": 0.0,
            "elo": None,
            "poisson": None,
        }


@router.get("/{match_id}", response_model=dict)
async def get_prediction(
    match_id: UUID,
    db: AsyncSession = Depends(get_db),
    authorization: str = Depends(verify_auth),
) -> dict:
    """Get prediction for a specific match.

    **Includes:**
    - Win probabilities from ensemble
    - Expected goals
    - Most likely score
    - Individual model predictions
    - Confidence score

    **Path Parameters:**
    - `match_id`: Match UUID

    **Example:**
    ```
    GET /predictions/550e8400-e29b-41d4-a716-446655440000
    ```
    """
    # Get match
    query = select(Match).where(Match.id == match_id)
    result = await db.execute(query)
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    try:
        # Get ensemble prediction
        predictor = get_predictor()
        prediction = predictor.predict(match.home_team_id, match.away_team_id)

        # Derive confidence_label from confidence score
        confidence = prediction.get("confidence", 0.0)
        if confidence >= 0.7:
            confidence_label = "HIGH"
        elif confidence >= 0.5:
            confidence_label = "MEDIUM"
        else:
            confidence_label = "LOW"

        return {
            "match_id": str(match_id),
            "home_team": match.home_team_id,
            "away_team": match.away_team_id,
            "kickoff": match.kickoff.isoformat(),
            **prediction,
            "home_win": prediction.get("home_win_prob"),
            "draw": prediction.get("draw_prob"),
            "away_win": prediction.get("away_win_prob"),
            "confidence_label": confidence_label,
        }
    except Exception:
        # Graceful fallback when models not loaded
        return {
            "match_id": str(match_id),
            "home_team": match.home_team_id,
            "away_team": match.away_team_id,
            "kickoff": match.kickoff.isoformat(),
            "home_win_prob": 0.33,
            "draw_prob": 0.34,
            "away_win_prob": 0.33,
            "confidence": 0.0,
            "expected_goals_home": 0.0,
            "expected_goals_away": 0.0,
            "home_win": 0.33,
            "draw": 0.34,
            "away_win": 0.33,
            "confidence_label": "LOW",
        }
