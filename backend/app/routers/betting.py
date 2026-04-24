"""Virtual betting router — place and manage virtual bets."""

from typing import Optional, List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, Depends, Header
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.db import Bet, Match, User
from app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/virtual-bets", tags=["virtual-betting"])


@router.post("")
async def place_bet(
    match_id: UUID,
    bet_type: str = Query(..., description="home_win, draw, away_win"),
    odds: float = Query(..., gt=0, description="Decimal odds"),
    amount: float = Query(..., gt=0, description="Bet amount"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Place a virtual bet on a match.

    **Query Parameters:**
    - `match_id`: Match UUID
    - `bet_type`: home_win, draw, or away_win
    - `odds`: Decimal odds (e.g., 2.0)
    - `amount`: Bet amount (virtual currency)

    **Example:**
    ```
    POST /virtual-bets?match_id=550e8400...&bet_type=home_win&odds=1.95&amount=100
    ```
    """
    # Validate bet_type
    if bet_type not in ["home_win", "draw", "away_win"]:
        raise HTTPException(status_code=400, detail="Invalid bet_type")

    # Get match
    match_query = select(Match).where(Match.id == match_id)
    result = await db.execute(match_query)
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Check if match hasn't started
    if match.status != "scheduled":
        raise HTTPException(status_code=400, detail="Match has already started")

    # Create bet
    from app.models.db import Bet as BetModel
    bet = BetModel(
        user_id=current_user.id,
        match_id=match_id,
        bet_type=bet_type,
        odds=odds,
        amount=amount,
        status="pending",
    )

    db.add(bet)
    await db.commit()
    await db.refresh(bet)

    return {
        "bet_id": str(bet.id),
        "match_id": str(match_id),
        "bet_type": bet_type,
        "odds": odds,
        "amount": amount,
        "status": "pending",
        "created_at": bet.created_at.isoformat(),
    }


@router.get("")
async def get_user_bets(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get user's bets.

    **Query Parameters:**
    - `status`: Filter by status (pending, won, lost, void)
    - `limit`: Results per page
    - `offset`: Pagination offset

    **Example:**
    ```
    GET /virtual-bets?status=pending
    ```
    """
    filters = [Bet.user_id == current_user.id]

    if status:
        if status not in ["pending", "won", "lost", "void"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        filters.append(Bet.status == status)

    query = select(Bet).where(and_(*filters)).limit(limit).offset(offset)
    result = await db.execute(query)
    bets = result.scalars().all()

    return {
        "total": len(bets),
        "limit": limit,
        "offset": offset,
        "bets": [
            {
                "bet_id": str(b.id),
                "match_id": str(b.match_id),
                "bet_type": b.bet_type,
                "odds": b.odds,
                "amount": b.amount,
                "status": b.status,
                "win_amount": b.win_amount,
                "created_at": b.created_at.isoformat(),
            }
            for b in bets
        ],
    }


@router.get("/{bet_id}")
async def get_bet_detail(
    bet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get bet details.

    **Path Parameters:**
    - `bet_id`: Bet UUID

    **Example:**
    ```
    GET /virtual-bets/550e8400-e29b-41d4-a716-446655440000
    ```
    """
    query = select(Bet).where(
        and_(
            Bet.id == bet_id,
            Bet.user_id == current_user.id,
        )
    )
    result = await db.execute(query)
    bet = result.scalar_one_or_none()

    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    # Get match info
    match_query = select(Match).where(Match.id == bet.match_id)
    match_result = await db.execute(match_query)
    match = match_result.scalar_one_or_none()

    return {
        "bet_id": str(bet.id),
        "match_id": str(bet.match_id),
        "match": {
            "home_team": match.home_team_id if match else None,
            "away_team": match.away_team_id if match else None,
            "kickoff": match.kickoff.isoformat() if match else None,
            "status": match.status if match else None,
            "home_score": match.home_score if match else None,
            "away_score": match.away_score if match else None,
        } if match else None,
        "bet_type": bet.bet_type,
        "odds": bet.odds,
        "amount": bet.amount,
        "status": bet.status,
        "win_amount": bet.win_amount,
        "created_at": bet.created_at.isoformat(),
    }


@router.get("/statistics/portfolio")
async def get_portfolio_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get user's betting portfolio statistics.

    **Example:**
    ```
    GET /virtual-bets/statistics/portfolio
    ```
    """
    query = select(Bet).where(Bet.user_id == current_user.id)
    result = await db.execute(query)
    bets = result.scalars().all()

    if not bets:
        return {
            "total_bets": 0,
            "stats": {
                "total_staked": 0,
                "total_winnings": 0,
                "total_losses": 0,
                "roi": 0,
                "win_rate": 0,
            }
        }

    total_staked = sum(b.amount for b in bets)
    total_winnings = sum(b.win_amount or 0 for b in bets if b.status == "won")
    total_losses = sum(b.amount for b in bets if b.status == "lost")

    won_bets = sum(1 for b in bets if b.status == "won")
    lost_bets = sum(1 for b in bets if b.status == "lost")

    return {
        "total_bets": len(bets),
        "stats": {
            "total_staked": total_staked,
            "total_winnings": total_winnings,
            "total_losses": total_losses,
            "net_profit": total_winnings - total_losses,
            "roi": (total_winnings - total_staked) / total_staked if total_staked > 0 else 0,
            "win_rate": won_bets / len(bets) if bets else 0,
            "won_bets": won_bets,
            "lost_bets": lost_bets,
            "pending_bets": sum(1 for b in bets if b.status == "pending"),
        }
    }


@router.post("/{bet_id}/cancel")
async def cancel_bet(
    bet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Cancel a pending bet.

    **Path Parameters:**
    - `bet_id`: Bet UUID

    **Example:**
    ```
    POST /virtual-bets/550e8400-e29b-41d4-a716-446655440000/cancel
    ```
    """
    query = select(Bet).where(
        and_(
            Bet.id == bet_id,
            Bet.user_id == current_user.id,
        )
    )
    result = await db.execute(query)
    bet = result.scalar_one_or_none()

    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    if bet.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending bets can be cancelled")

    # Cancel bet
    bet.status = "void"
    await db.commit()

    return {
        "bet_id": str(bet.id),
        "status": "void",
        "message": "Bet cancelled successfully",
    }
