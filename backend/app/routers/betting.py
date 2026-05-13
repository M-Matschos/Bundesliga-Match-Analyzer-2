"""Virtual betting router — place and manage virtual bets."""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, Query, Depends, Header, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db import get_db
from app.models.db import Bet, Match, User
from app.core.security import verify_token, get_user_id_from_token, get_current_user

router = APIRouter(tags=["virtual-betting"])
logger = logging.getLogger(__name__)


@router.post("")
async def place_bet(
    match_id: UUID,
    bet_type: str = Query(..., description="home_win, draw, away_win"),
    odds: float = Query(..., gt=0, description="Decimal odds"),
    amount: float = Query(..., gt=0, description="Bet amount"),
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(...),
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
    # Extract token from Authorization header
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except (ValueError, AttributeError):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    # Verify token and get user_id
    try:
        user_id = UUID(get_user_id_from_token(token))
    except (HTTPException, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

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
    bet = Bet(
        user_id=user_id,
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
        "id": str(bet.id),
        "bet_id": str(bet.id),
        "match_id": str(match_id),
        "bet_type": bet_type,
        "odds": float(odds),
        "amount": float(amount),
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
    filters = [Bet.user_id == UUID(current_user.sub)]

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
                "id": str(b.id),
                "bet_id": str(b.id),
                "match_id": str(b.match_id),
                "bet_type": b.bet_type,
                "odds": float(b.odds),
                "amount": float(b.amount),
                "status": b.status,
                "win_amount": float(b.win_amount) if b.win_amount else None,
                "created_at": b.created_at.isoformat(),
            }
            for b in bets
        ],
    }


@router.get("/statistics/portfolio")
async def get_portfolio_stats(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
) -> dict:
    """Get user's betting portfolio statistics.

    **Example:**
    ```
    GET /virtual-bets/statistics/portfolio
    ```
    """
    query = select(Bet).where(Bet.user_id == UUID(current_user.sub))
    result = await db.execute(query)
    bets = result.scalars().all()

    if not bets:
        return {
            "total_bets": 0,
            "total_balance": 0.0,
            "total_staked": 0.0,
            "total_returns": 0.0,
            "roi_percent": 0.0,
            "wins": 0,
            "losses": 0,
            "voids": 0,
            "win_rate_percent": 0.0,
        }

    total_staked = sum(float(b.amount) for b in bets)
    total_returns = sum(float(b.win_amount or 0) for b in bets if b.status == "won")
    total_losses = sum(float(b.amount) for b in bets if b.status == "lost")
    won_bets = sum(1 for b in bets if b.status == "won")
    lost_bets = sum(1 for b in bets if b.status == "lost")
    void_bets = sum(1 for b in bets if b.status == "void")
    net_profit = total_returns - total_losses

    return {
        "total_bets": len(bets),
        "total_balance": round(net_profit, 2),
        "total_staked": round(total_staked, 2),
        "total_returns": round(total_returns, 2),
        "roi_percent": round((net_profit / total_staked * 100) if total_staked > 0 else 0.0, 2),
        "wins": won_bets,
        "losses": lost_bets,
        "voids": void_bets,
        "win_rate_percent": round((won_bets / len(bets) * 100) if bets else 0.0, 2),
        # Legacy nested format kept for backward compat
        "stats": {
            "total_staked": round(total_staked, 2),
            "total_winnings": round(total_returns, 2),
            "total_losses": round(total_losses, 2),
            "net_profit": round(net_profit, 2),
            "roi": round((total_returns - total_staked) / total_staked if total_staked > 0 else 0.0, 4),
            "win_rate": round(won_bets / len(bets) if bets else 0.0, 4),
            "won_bets": won_bets,
            "lost_bets": lost_bets,
            "pending_bets": sum(1 for b in bets if b.status == "pending"),
        },
    }


@router.get("/{bet_id}")
async def get_bet_detail(
    bet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
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
            Bet.user_id == UUID(current_user.sub),
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
        "odds": float(bet.odds),
        "amount": float(bet.amount),
        "status": bet.status,
        "win_amount": float(bet.win_amount) if bet.win_amount else None,
        "created_at": bet.created_at.isoformat(),
    }


@router.post("/{bet_id}/cancel")
async def cancel_bet(
    bet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
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
            Bet.user_id == UUID(current_user.sub),
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


@router.post("/{bet_id}/resolve")
async def resolve_bet(
    bet_id: UUID,
    outcome: str = Query(..., description="won, lost, or void"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
) -> dict:
    """Resolve a pending bet (won, lost, or void).

    **Path Parameters:**
    - `bet_id`: Bet UUID

    **Query Parameters:**
    - `outcome`: "won", "lost", or "void"

    **Example:**
    ```
    POST /virtual-bets/550e8400-e29b-41d4-a716-446655440000/resolve?outcome=won
    ```
    """
    # Validate outcome
    if outcome not in ["won", "lost", "void"]:
        raise HTTPException(status_code=400, detail="Invalid outcome. Must be 'won', 'lost', or 'void'")

    # Get bet
    query = select(Bet).where(
        and_(
            Bet.id == bet_id,
            Bet.user_id == UUID(current_user.sub),
        )
    )
    result = await db.execute(query)
    bet = result.scalar_one_or_none()

    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    # Check if bet is still pending
    if bet.status != "pending":
        raise HTTPException(status_code=400, detail="Bet is already resolved")

    # Calculate win_amount
    if outcome == "won":
        win_amount = bet.amount * bet.odds
    elif outcome == "lost":
        win_amount = 0.0
    else:  # void
        win_amount = 0.0

    # Update bet
    bet.status = outcome
    bet.win_amount = win_amount
    await db.commit()

    logger.info(f"Bet {bet_id} resolved as {outcome} with win_amount={win_amount}")

    return {
        "bet_id": str(bet.id),
        "status": outcome,
        "win_amount": float(win_amount),
        "message": f"Bet resolved as {outcome}",
    }


@router.post("/auto-resolve")
async def auto_resolve_bets(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Auto-resolve pending bets for completed matches (Admin-only).

    Finds all matches with status="completed" that have pending bets,
    determines the winning outcome based on match result,
    and automatically resolves all related bets.

    **Example:**
    ```
    POST /virtual-bets/auto-resolve
    Authorization: Bearer <token>
    ```
    """
    # Check authorization header
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    # Extract and verify token
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
        user_id = get_user_id_from_token(token)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    # Get user and check admin status
    try:
        from sqlalchemy import select
        stmt = select(User).where(User.id == UUID(user_id))
        result = await db.execute(stmt)
        current_user = result.scalar_one_or_none()

        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    try:
        # Find all completed matches with pending bets
        completed_matches_query = select(Match).where(Match.status == "completed")
        matches_result = await db.execute(completed_matches_query)
        completed_matches = matches_result.scalars().all()

        if not completed_matches:
            logger.info("No completed matches found for auto-resolution")
            return {
                "resolved_bets": 0,
                "message": "No completed matches found",
            }

        resolved_count = 0

        for match in completed_matches:
            # Get all pending bets for this match
            pending_bets_query = select(Bet).where(
                and_(
                    Bet.match_id == match.id,
                    Bet.status == "pending",
                )
            )
            bets_result = await db.execute(pending_bets_query)
            pending_bets = bets_result.scalars().all()

            if not pending_bets:
                continue

            # Determine winning outcome based on match result
            home_score = match.home_score or 0
            away_score = match.away_score or 0

            if home_score > away_score:
                winning_bet_type = "home_win"
            elif away_score > home_score:
                winning_bet_type = "away_win"
            else:
                winning_bet_type = "draw"

            # Resolve each bet
            for bet in pending_bets:
                if bet.bet_type == winning_bet_type:
                    bet.status = "won"
                    bet.win_amount = bet.amount * bet.odds
                else:
                    bet.status = "lost"
                    bet.win_amount = 0.0

                resolved_count += 1
                logger.info(f"Auto-resolved bet {bet.id}: {bet.status}, win_amount={bet.win_amount}")

            await db.commit()

        return {
            "resolved_bets": resolved_count,
            "message": f"Auto-resolved {resolved_count} bets for {len(completed_matches)} completed matches",
        }

    except Exception as e:
        logger.error(f"Error in auto-resolve: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during auto-resolution",
        )
