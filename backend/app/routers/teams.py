"""Teams router — ORM-backed team information and standings."""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db import get_db, Team, Match
from app.models.schemas import TeamCreate, TeamUpdate

router = APIRouter(tags=["teams"])


# ─── Helpers ──────────────────────────────────────────────────


async def _get_team(team_id: str, db: AsyncSession) -> Team:
    """Lookup by UUID first, fall back to name (mobile passes names as IDs)."""
    try:
        parsed = uuid.UUID(team_id)
        stmt = select(Team).where(Team.id == parsed)
    except ValueError:
        stmt = select(Team).where(Team.name == team_id)

    result = await db.execute(stmt)
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_id}")
    return team


# ─── Standings (defined before /{team_id} to avoid routing conflict) ──


@router.get("/standings/{league}")
async def get_standings(
    league: str,
    season: Optional[str] = Query(None, description="Season filter (e.g. 2024-25)"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """League table ordered by points descending."""
    stmt = (
        select(Team)
        .where(Team.league == league)
        .order_by(Team.points.desc(), Team.goals_for.desc())
    )
    result = await db.execute(stmt)
    teams = result.scalars().all()

    if not teams:
        raise HTTPException(status_code=404, detail=f"League not found: {league}")

    standings = []
    for rank, t in enumerate(teams, start=1):
        played = t.wins + t.draws + t.losses
        standings.append(
            {
                "rank": rank,
                "team_id": str(t.id),
                "team_name": t.name,
                "logo_url": t.logo_url,
                "played": played,
                "wins": t.wins,
                "draws": t.draws,
                "losses": t.losses,
                "goals_for": t.goals_for,
                "goals_against": t.goals_against,
                "goal_difference": t.goals_for - t.goals_against,
                "points": t.points,
            }
        )

    return {"league": league, "season": season, "standings": standings}


# ─── List Teams ───────────────────────────────────────────────


@router.get("")
async def list_teams(
    league: Optional[str] = Query(
        None, description="Filter by league (e.g. bundesliga)"
    ),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List all teams, optionally filtered by league."""
    stmt = select(Team).order_by(Team.league, Team.points.desc())
    if league:
        stmt = stmt.where(Team.league == league)

    result = await db.execute(stmt)
    teams = result.scalars().all()

    return {
        "league": league or "all",
        "total": len(teams),
        "teams": [
            {
                "id": str(t.id),
                "name": t.name,
                "logo_url": t.logo_url,
                "league": t.league,
                "position": t.position,
                "points": t.points,
            }
            for t in teams
        ],
    }


# ─── Get Single Team ──────────────────────────────────────────


@router.get("/{team_id}")
async def get_team(
    team_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get team by UUID or name."""
    t = await _get_team(team_id, db)
    played = t.wins + t.draws + t.losses
    return {
        "id": str(t.id),
        "name": t.name,
        "logo_url": t.logo_url,
        "league": t.league,
        "position": t.position,
        "wins": t.wins,
        "draws": t.draws,
        "losses": t.losses,
        "goals_for": t.goals_for,
        "goals_against": t.goals_against,
        "goal_difference": t.goals_for - t.goals_against,
        "points": t.points,
        "matches_played": played,
        "win_percentage": round(t.wins / played * 100, 1) if played else 0.0,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }


# ─── Team Form ────────────────────────────────────────────────


@router.get("/{team_id}/form")
async def get_team_form(
    team_id: str,
    games: int = Query(10, ge=1, le=20, description="Recent matches to return"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Last N finished matches for a team with W/D/L metrics."""
    team = await _get_team(team_id, db)

    stmt = (
        select(Match)
        .where(
            or_(Match.home_team_id == team.id, Match.away_team_id == team.id),
            Match.status == "finished",
        )
        .order_by(Match.kickoff.desc())
        .limit(games)
    )
    result = await db.execute(stmt)
    matches = result.scalars().all()

    recent: list[dict] = []
    wins = draws = losses = goals_for = goals_against = 0

    for m in matches:
        is_home = m.home_team_id == team.id
        ts = m.home_score if is_home else m.away_score
        os_ = m.away_score if is_home else m.home_score

        if ts is not None and os_ is not None:
            if ts > os_:
                result_label = "W"
                wins += 1
            elif ts == os_:
                result_label = "D"
                draws += 1
            else:
                result_label = "L"
                losses += 1
            goals_for += ts
            goals_against += os_
        else:
            result_label = "?"

        recent.append(
            {
                "match_id": str(m.id),
                "kickoff": m.kickoff.isoformat(),
                "home_team_id": str(m.home_team_id),
                "away_team_id": str(m.away_team_id),
                "home_score": m.home_score,
                "away_score": m.away_score,
                "result": result_label,
                "location": "home" if is_home else "away",
            }
        )

    return {
        "team_id": str(team.id),
        "team_name": team.name,
        "recent_matches": len(recent),
        "matches": recent,
        "metrics": {
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goals_for": goals_for,
            "goals_against": goals_against,
        },
    }


# ─── Head-to-Head ─────────────────────────────────────────────


@router.get("/{team_id}/h2h/{opponent_id}")
async def get_head_to_head(
    team_id: str,
    opponent_id: str,
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Head-to-head record between two teams."""
    team = await _get_team(team_id, db)
    opponent = await _get_team(opponent_id, db)

    stmt = (
        select(Match)
        .where(
            or_(
                (Match.home_team_id == team.id) & (Match.away_team_id == opponent.id),
                (Match.home_team_id == opponent.id) & (Match.away_team_id == team.id),
            ),
            Match.status == "finished",
        )
        .order_by(Match.kickoff.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    matches = result.scalars().all()

    team_wins = draws = opp_wins = goals_for = goals_against = 0
    h2h_matches: list[dict] = []

    for m in matches:
        is_home = m.home_team_id == team.id
        ts = m.home_score if is_home else m.away_score
        os_ = m.away_score if is_home else m.home_score

        if ts is not None and os_ is not None:
            if ts > os_:
                team_wins += 1
            elif ts == os_:
                draws += 1
            else:
                opp_wins += 1
            goals_for += ts
            goals_against += os_

        h2h_matches.append(
            {
                "match_id": str(m.id),
                "kickoff": m.kickoff.isoformat(),
                "home_team_id": str(m.home_team_id),
                "away_team_id": str(m.away_team_id),
                "home_score": m.home_score,
                "away_score": m.away_score,
            }
        )

    return {
        "team": {"id": str(team.id), "name": team.name},
        "opponent": {"id": str(opponent.id), "name": opponent.name},
        "matches": h2h_matches,
        "head_to_head": {
            "team_wins": team_wins,
            "draws": draws,
            "opponent_wins": opp_wins,
            "goals_for": goals_for,
            "goals_against": goals_against,
        },
    }


# ─── Extended Stats ───────────────────────────────────────────


@router.get("/{team_id}/extended")
async def get_team_extended(
    team_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Extended team stats: computed averages and home/away split."""
    team = await _get_team(team_id, db)
    played = team.wins + team.draws + team.losses

    home_r = (
        await db.execute(
            select(
                func.count(),
                func.coalesce(func.sum(Match.home_score), 0),
                func.coalesce(func.sum(Match.away_score), 0),
            ).where(Match.home_team_id == team.id, Match.status == "finished")
        )
    ).one()

    away_r = (
        await db.execute(
            select(
                func.count(),
                func.coalesce(func.sum(Match.away_score), 0),
                func.coalesce(func.sum(Match.home_score), 0),
            ).where(Match.away_team_id == team.id, Match.status == "finished")
        )
    ).one()

    home_played, home_gf, home_ga = home_r[0] or 0, home_r[1] or 0, home_r[2] or 0
    away_played, away_gf, away_ga = away_r[0] or 0, away_r[1] or 0, away_r[2] or 0
    total = home_played + away_played

    return {
        "id": str(team.id),
        "name": team.name,
        "league": team.league,
        "position": team.position,
        "table_points": team.points,
        "win_percentage": round(team.wins / played * 100, 1) if played else 0.0,
        "avg_goals_for": round((home_gf + away_gf) / total, 2) if total else 0.0,
        "avg_goals_against": round((home_ga + away_ga) / total, 2) if total else 0.0,
        "home_games": home_played,
        "away_games": away_played,
    }


# ─── Table Position ───────────────────────────────────────────


@router.get("/{team_id}/position")
async def get_team_position(
    team_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Current league table position for a team."""
    t = await _get_team(team_id, db)
    return {
        "team_id": str(t.id),
        "team_name": t.name,
        "league": t.league,
        "position": t.position,
        "points": t.points,
    }


# ─── Create / Update (admin) ──────────────────────────────────


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_team(
    payload: TeamCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a new team entry."""
    existing = (
        await db.execute(select(Team).where(Team.name == payload.name))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409, detail=f"Team already exists: {payload.name}"
        )

    team = Team(
        id=uuid.uuid4(),
        name=payload.name,
        logo_url=payload.logo_url,
        league=payload.league,
        position=payload.position,
        wins=payload.wins,
        draws=payload.draws,
        losses=payload.losses,
        goals_for=payload.goals_for,
        goals_against=payload.goals_against,
        points=payload.points,
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return {"id": str(team.id), "name": team.name, "league": team.league}


@router.put("/{team_id}")
async def update_team(
    team_id: str,
    payload: TeamUpdate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Partial update of team fields."""
    team = await _get_team(team_id, db)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    team.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(team)
    return {"id": str(team.id), "name": team.name, "updated": True}
