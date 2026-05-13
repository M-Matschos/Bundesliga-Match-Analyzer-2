"""Matches router — fixtures, live ticker, statistics."""

from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Depends, Header
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.db import get_db, Match, User, Team
from app.models.schemas import (
    MatchResponse,
    MatchListResponse,
    MatchDetailResponse,
)
from app.core.security import get_current_user

router = APIRouter(tags=["matches"])


def _match_to_dict(match: Match) -> dict:
    """Convert Match ORM object to enriched dict with nested team objects."""
    home = match.home_team
    away = match.away_team
    return {
        "id": str(match.id),
        "match_id": str(match.id),
        "home_team_id": str(match.home_team_id),
        "away_team_id": str(match.away_team_id),
        "home_team": {
            "id": str(home.id),
            "name": home.name,
            "logo_url": home.logo_url,
        } if home else {"id": str(match.home_team_id), "name": str(match.home_team_id), "logo_url": None},
        "away_team": {
            "id": str(away.id),
            "name": away.name,
            "logo_url": away.logo_url,
        } if away else {"id": str(match.away_team_id), "name": str(match.away_team_id), "logo_url": None},
        "league_id": match.league_id,
        "league": match.league_id,
        "season": match.season,
        "matchday": match.matchday,
        "kickoff": match.kickoff.isoformat(),
        "status": match.status,
        "home_score": match.home_score,
        "away_score": match.away_score,
        "home_goals": match.home_score,
        "away_goals": match.away_score,
        "created_at": match.created_at.isoformat(),
        "updated_at": match.updated_at.isoformat(),
    }


@router.get("")
async def list_matches(
    league: Optional[str] = Query(None, description="League ID (e.g., 'bundesliga')"),
    season: Optional[str] = Query(None, description="Season (e.g., '2024-25')"),
    matchday: Optional[int] = Query(None, description="Matchday number"),
    status: Optional[str] = Query(None, description="Match status (scheduled, live, finished)"),
    limit: int = Query(50, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> MatchListResponse:
    """List all matches with optional filtering.

    **Query Parameters:**
    - `league`: Filter by league (bundesliga, bundesliga2, dfb-pokal)
    - `season`: Filter by season (2024-25)
    - `matchday`: Filter by matchday (1-34)
    - `status`: Filter by status (scheduled, live, finished)
    - `limit`: Results per page (1-100)
    - `offset`: Pagination offset

    **Examples:**
    ```
    GET /matches?league=bundesliga&season=2024-25&limit=20
    GET /matches?status=live
    GET /matches?league=bundesliga&matchday=28
    ```
    """
    # Build query with eager team loading
    query = select(Match).options(
        selectinload(Match.home_team),
        selectinload(Match.away_team),
    )
    filters = []

    if league:
        filters.append(Match.league_id == league)
    if season:
        filters.append(Match.season == season)
    if matchday is not None:
        filters.append(Match.matchday == matchday)
    if status:
        filters.append(Match.status == status)

    if filters:
        query = query.where(and_(*filters))

    # Order by kickoff time
    query = query.order_by(Match.kickoff.asc())

    # Execute query with pagination
    result = await db.execute(query.limit(limit).offset(offset))
    matches = result.scalars().all()

    # Count total for pagination
    if filters:
        count_query = select(func.count(Match.id)).where(and_(*filters))
    else:
        count_query = select(func.count(Match.id))
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "matches": [_match_to_dict(m) for m in matches],
    }


@router.get("/live", response_model=MatchListResponse)
async def get_live_matches(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> MatchListResponse:
    """Get all currently live matches.

    Returns matches with status='live'.

    **Example:**
    ```
    GET /matches/live
    ```
    """
    query = (
        select(Match)
        .options(selectinload(Match.home_team), selectinload(Match.away_team))
        .where(Match.status == "live")
        .order_by(Match.kickoff.asc())
    )
    result = await db.execute(query)
    matches = result.scalars().all()

    return {
        "total": len(matches),
        "limit": 100,
        "offset": 0,
        "matches": [_match_to_dict(m) for m in matches],
    }


@router.get("/upcoming", response_model=MatchListResponse)
async def get_upcoming_matches(
    days: int = Query(7, ge=1, le=30, description="Days ahead to fetch"),
    league: Optional[str] = Query(None, description="League filter"),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> MatchListResponse:
    """Get upcoming matches in the next N days.

    **Query Parameters:**
    - `days`: Look-ahead period (1-30 days)
    - `league`: Optional league filter

    **Example:**
    ```
    GET /matches/upcoming?days=7&league=bundesliga
    ```
    """
    now = datetime.utcnow()
    future = now + timedelta(days=days)

    filters = [
        Match.kickoff >= now,
        Match.kickoff <= future,
        Match.status == "scheduled",
    ]

    if league:
        filters.append(Match.league_id == league)

    query = select(Match).where(and_(*filters)).order_by(Match.kickoff.asc())
    result = await db.execute(query)
    matches = result.scalars().all()

    return MatchListResponse(
        total=len(matches),
        limit=100,
        offset=0,
        matches=[MatchResponse.from_orm(m) for m in matches],
    )


@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match_detail(
    match_id: UUID,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> MatchDetailResponse:
    """Get detailed match information.

    **Includes:**
    - Basic match info (teams, league, status)
    - Scores and xG values
    - Match history (if completed)
    - Statistics

    **Path Parameters:**
    - `match_id`: Match UUID

    **Example:**
    ```
    GET /matches/550e8400-e29b-41d4-a716-446655440000
    ```
    """
    query = (
        select(Match)
        .options(selectinload(Match.home_team), selectinload(Match.away_team))
        .where(Match.id == match_id)
    )
    result = await db.execute(query)
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    detail = _match_to_dict(match)
    detail["home_xg"] = match.home_xg
    detail["away_xg"] = match.away_xg
    detail["api_football_id"] = match.api_football_id
    return detail


@router.get("/by-date/{date_str}", response_model=MatchListResponse)
async def get_matches_by_date(
    date_str: str,
    league: Optional[str] = Query(None, description="Filter by league"),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> MatchListResponse:
    """Get matches for a specific date.

    **Path Parameters:**
    - `date_str`: Date in format YYYY-MM-DD

    **Query Parameters:**
    - `league`: Optional league filter

    **Example:**
    ```
    GET /matches/by-date/2025-03-29?league=bundesliga
    ```
    """
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    # Matches on this date (00:00 to 23:59)
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())

    filters = [
        Match.kickoff >= start,
        Match.kickoff <= end,
    ]

    if league:
        filters.append(Match.league_id == league)

    query = select(Match).where(and_(*filters)).order_by(Match.kickoff.asc())
    result = await db.execute(query)
    matches = result.scalars().all()

    return MatchListResponse(
        total=len(matches),
        limit=100,
        offset=0,
        matches=[MatchResponse.from_orm(m) for m in matches],
    )


@router.get("/team/{team_id}", response_model=MatchListResponse)
async def get_team_matches(
    team_id: str,
    season: Optional[str] = Query(None, description="Season filter"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> MatchListResponse:
    """Get all matches for a specific team.

    **Path Parameters:**
    - `team_id`: Team ID (e.g., 'FCB', 'BVB')

    **Query Parameters:**
    - `season`: Optional season filter
    - `limit`: Results limit (1-100)

    **Example:**
    ```
    GET /matches/team/FCB?season=2024-25
    ```
    """
    filters = [
        or_(
            Match.home_team_id == team_id,
            Match.away_team_id == team_id,
        )
    ]

    if season:
        filters.append(Match.season == season)

    query = select(Match).where(and_(*filters)).order_by(Match.kickoff.desc()).limit(limit)
    result = await db.execute(query)
    matches = result.scalars().all()

    return MatchListResponse(
        total=len(matches),
        limit=limit,
        offset=0,
        matches=[MatchResponse.from_orm(m) for m in matches],
    )
