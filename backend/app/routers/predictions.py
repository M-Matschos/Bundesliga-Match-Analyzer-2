"""Predictions router — ML model predictions and analysis."""

from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db import get_db
from app.models.db import Match, Prediction, User
from app.models.schemas import PredictionResponse, MatchDetailResponse
from app.ml.predictor import EnsemblePredictor

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


@router.get("/{match_id}", response_model=dict)
async def get_prediction(
    match_id: UUID,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
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

    # Get ensemble prediction
    predictor = get_predictor()
    prediction = predictor.predict(match.home_team_id, match.away_team_id)

    return {
        "match_id": str(match_id),
        "home_team": match.home_team_id,
        "away_team": match.away_team_id,
        "kickoff": match.kickoff.isoformat(),
        **prediction,
    }


@router.post("/simulate")
async def simulate_prediction(
    home_team: str = Query(..., description="Home team ID"),
    away_team: str = Query(..., description="Away team ID"),
    market_odds: Optional[str] = Query(
        None,
        description='JSON string with keys "home_win", "draw", "away_win"'
    ),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Simulate prediction for any team matchup.

    Doesn't require match to exist in database.

    **Query Parameters:**
    - `home_team`: Home team ID
    - `away_team`: Away team ID
    - `market_odds`: Optional JSON with decimal odds

    **Example:**
    ```
    POST /predictions/simulate?home_team=FCB&away_team=BVB&market_odds={"home_win":2.0,"draw":3.2,"away_win":3.5}
    ```
    """
    # Parse market odds if provided
    odds_dict = None
    if market_odds:
        try:
            import json
            odds_dict = json.loads(market_odds)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid market_odds JSON")

    # Get ensemble prediction
    predictor = get_predictor()
    prediction = predictor.predict(home_team, away_team, odds_dict)

    return {
        "home_team": home_team,
        "away_team": away_team,
        **prediction,
    }


@router.get("/value-bets")
async def get_value_bets(
    limit: int = Query(20, ge=1, le=100, description="Results limit"),
    league: Optional[str] = Query(None, description="League filter"),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> dict:
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

        value_bets.append({
            "match_id": str(match.id),
            "kickoff": match.kickoff.isoformat(),
            "home_team": match.home_team_id,
            "away_team": match.away_team_id,
            "league": match.league_id,
            "value_bets": pred["value_bets"],
            "confidence": pred["confidence"],
        })

    return {
        "total": len(value_bets),
        "limit": limit,
        "value_bets": value_bets,
    }


@router.get("/match-comparison")
async def compare_models(
    match_id: UUID,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Compare individual model predictions for a match.

    Shows output from each model separately for transparency.

    **Path Parameters:**
    - `match_id`: Match UUID

    **Example:**
    ```
    GET /predictions/match-comparison?match_id=550e8400-e29b-41d4-a716-446655440000
    ```
    """
    # Get match
    query = select(Match).where(Match.id == match_id)
    result = await db.execute(query)
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Get individual predictions
    predictor = get_predictor()
    predictions = {}

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
        "match_id": str(match_id),
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


@router.get("/team-strength/{team_id}")
async def get_team_strength(
    team_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Get team strength metrics from all models.

    **Path Parameters:**
    - `team_id`: Team ID (e.g., 'FCB', 'BVB')

    **Example:**
    ```
    GET /predictions/team-strength/FCB
    ```
    """
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
            "ranking": None,  # Will add rankings in next request
        }

        # Get ranking
        rankings = predictor.elo.get_rankings()
        for idx, (team, rating) in enumerate(rankings):
            if team == team_id:
                strength["elo"]["ranking"] = idx + 1
                break

    return strength
