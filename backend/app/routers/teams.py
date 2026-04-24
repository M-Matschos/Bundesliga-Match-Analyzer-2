"""Teams router — team information and standings."""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Header
from sqlalchemy import select, func, and_

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])


# Static team data (normally from database)
TEAMS_DATA = {
    "bundesliga": [
        {"id": "FCB", "name": "Bayern Munich", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/40.png"},
        {"id": "BVB", "name": "Borussia Dortmund", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/34.png"},
        {"id": "LVR", "name": "Bayer Leverkusen", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/36.png"},
        {"id": "S04", "name": "Schalke 04", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/33.png"},
        {"id": "HAM", "name": "Hamburger SV", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/32.png"},
        {"id": "KÖL", "name": "1. FC Köln", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/31.png"},
    ],
    "bundesliga2": [
        {"id": "HSV", "name": "Hamburger SV", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/161.png"},
        {"id": "KAS", "name": "Karlsruher SC", "logo": "https://api-football-v1.p.rapidapi.com/v3/teams/logo/162.png"},
    ],
}


@router.get("")
async def list_teams(
    league: Optional[str] = Query("bundesliga", description="League ID"),
    authorization: Optional[str] = Header(None),
) -> dict:
    """List all teams in a league.

    **Query Parameters:**
    - `league`: League ID (bundesliga, bundesliga2)

    **Example:**
    ```
    GET /teams?league=bundesliga
    ```
    """
    if league not in TEAMS_DATA:
        raise HTTPException(status_code=400, detail=f"Unknown league: {league}")

    teams = TEAMS_DATA[league]

    return {
        "league": league,
        "total": len(teams),
        "teams": teams,
    }


@router.get("/{team_id}")
async def get_team_detail(
    team_id: str,
    league: Optional[str] = Query(None, description="League filter"),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Get team details.

    **Path Parameters:**
    - `team_id`: Team ID (e.g., 'FCB')

    **Query Parameters:**
    - `league`: Optional league filter

    **Example:**
    ```
    GET /teams/FCB
    ```
    """
    # Search across all leagues or specific league
    leagues_to_search = [league] if league else TEAMS_DATA.keys()

    for lg in leagues_to_search:
        for team in TEAMS_DATA.get(lg, []):
            if team["id"] == team_id:
                return {
                    "team_id": team_id,
                    "league": lg,
                    **team,
                }

    raise HTTPException(status_code=404, detail=f"Team not found: {team_id}")


@router.get("/{team_id}/form")
async def get_team_form(
    team_id: str,
    limit: int = Query(10, ge=1, le=20, description="Recent matches"),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Get team recent form (last N matches).

    Would fetch from database in production.

    **Path Parameters:**
    - `team_id`: Team ID

    **Query Parameters:**
    - `limit`: Recent matches to show (1-20)

    **Example:**
    ```
    GET /teams/FCB/form?limit=10
    ```
    """
    # Placeholder — would query database for actual matches
    return {
        "team_id": team_id,
        "recent_matches": limit,
        "matches": [],  # Would be populated from database
        "metrics": {
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_for": 0,
            "goals_against": 0,
        }
    }


@router.get("/{team_id}/head-to-head/{opponent_id}")
async def get_head_to_head(
    team_id: str,
    opponent_id: str,
    limit: int = Query(10, ge=1, le=20),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Get head-to-head record between two teams.

    **Path Parameters:**
    - `team_id`: Team 1 ID
    - `opponent_id`: Team 2 ID

    **Query Parameters:**
    - `limit`: Recent matches (1-20)

    **Example:**
    ```
    GET /teams/FCB/head-to-head/BVB?limit=10
    ```
    """
    return {
        "team_1": team_id,
        "team_2": opponent_id,
        "recent_matches": limit,
        "matches": [],  # Would be populated from database
        "head_to_head": {
            f"{team_id}_wins": 0,
            "draws": 0,
            f"{opponent_id}_wins": 0,
            "goals_for": 0,
            "goals_against": 0,
        }
    }


@router.get("/standings/{league}")
async def get_standings(
    league: str,
    season: Optional[str] = Query("2024-25", description="Season"),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Get league standings.

    **Path Parameters:**
    - `league`: League ID

    **Query Parameters:**
    - `season`: Season (e.g., '2024-25')

    **Example:**
    ```
    GET /teams/standings/bundesliga?season=2024-25
    ```
    """
    if league not in TEAMS_DATA:
        raise HTTPException(status_code=400, detail=f"Unknown league: {league}")

    # Placeholder — would calculate from matches database
    teams = TEAMS_DATA[league]

    standings = []
    for idx, team in enumerate(teams):
        standings.append({
            "rank": idx + 1,
            "team_id": team["id"],
            "team_name": team["name"],
            "played": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_for": 0,
            "goals_against": 0,
            "goal_difference": 0,
            "points": 0,
        })

    return {
        "league": league,
        "season": season,
        "standings": standings,
    }
