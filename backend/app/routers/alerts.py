"""
Alerts Router — Real-time Breaking News API
Nutzer können Alerts abfragen, abonnieren, filtern
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel

from app.core.security import get_current_user
from app.models.db import get_db, User
from app.models.alerts import (
    NewsAlert,
    UserAlertSubscription,
    AlertType,
    AlertPriority,
    NewsSource,
)
from app.models.schemas import UserResponse

router = APIRouter(tags=["alerts"])


# ─────────────────────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────────────────────


class AlertResponse(BaseModel):
    """Single Alert Response"""

    id: str
    alert_type: str
    priority: str
    title: str
    description: Optional[str]
    relevance_score: float
    confidence: float
    team_id: Optional[str]
    player_id: Optional[str]
    source: str
    source_url: Optional[str]
    published_at: datetime
    detected_at: datetime
    expires_at: Optional[datetime]
    is_verified: bool
    nlp_tags: Optional[str]

    class Config:
        from_attributes = True


class AlertsListResponse(BaseModel):
    """List of alerts with pagination"""

    alerts: List[AlertResponse]
    total: int
    page: int
    limit: int


class AlertSubscriptionRequest(BaseModel):
    """User Alert Subscription Preferences"""

    alert_types: List[str]  # ["injury", "tactical", "odds"]
    min_priority: str  # "critical" | "high" | "medium" | "low"
    enable_push: bool = True
    enable_email: bool = False
    push_on_critical_only: bool = False
    favorite_teams: List[str]  # ["bayern", "bvb"]
    favorite_players: List[str]  # ["lewandowski", "haaland"]


class AlertStatsResponse(BaseModel):
    """Alert statistics for dashboard"""

    total_alerts_24h: int
    critical_alerts: int
    high_priority_alerts: int
    unread_count: int
    most_common_type: str


# ─────────────────────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────────────────────


@router.get("/feed", response_model=AlertsListResponse)
async def get_alerts_feed(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    alert_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    team_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    hours: int = Query(24, ge=1, le=168),
):
    """
    GET /alerts/feed — Personalisierte Alert-Übersicht

    Holt Alerts gefiltert nach:
    - User-Subscriptions (Teams, Types)
    - Priority Level
    - Zeitraum (letzte N Stunden)

    Returns paginated list mit Metadaten
    """

    # Base query: Alerts der letzten N Stunden
    query = select(NewsAlert).where(
        NewsAlert.detected_at >= datetime.utcnow() - timedelta(hours=hours)
    )

    # Filter nach Type
    if alert_type:
        query = query.where(NewsAlert.alert_type == alert_type)

    # Filter nach Priority
    if priority:
        query = query.where(NewsAlert.priority == priority)

    # Filter nach Team
    if team_id:
        query = query.where(NewsAlert.team_id == team_id)

    # Sortiere nach Priorität + Relevanz
    query = query.order_by(desc(NewsAlert.priority), desc(NewsAlert.relevance_score))

    # Pagination
    total = await db.scalar(select(func.count(NewsAlert.id)).where(query.whereclause))
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    alerts = result.scalars().all()

    return AlertsListResponse(
        alerts=[AlertResponse.from_orm(a) for a in alerts],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert_detail(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    GET /alerts/{alert_id} — Details eines einzelnen Alerts
    """
    result = await db.execute(select(NewsAlert).where(NewsAlert.id == alert_id))
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    return AlertResponse.from_orm(alert)


@router.post("/subscription")
async def update_alert_subscription(
    request: AlertSubscriptionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    POST /alerts/subscription — Update user Alert preferences

    Nutzer kann definieren:
    - Welche Alert-Types interessieren dich?
    - Minimum Priority Level?
    - Push/Email Benachrichtigungen?
    - Favorite Teams/Players?
    """

    # Prüfe ob Subscription existiert
    result = await db.execute(
        select(UserAlertSubscription).where(
            UserAlertSubscription.user_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if subscription:
        # Update existing
        subscription.alert_types = str(request.alert_types)
        subscription.min_priority = request.min_priority
        subscription.enable_push = request.enable_push
        subscription.enable_email = request.enable_email
        subscription.push_on_critical_only = request.push_on_critical_only
        subscription.favorite_teams = str(request.favorite_teams)
        subscription.favorite_players = str(request.favorite_players)
        subscription.updated_at = datetime.utcnow()
    else:
        # Create new
        subscription = UserAlertSubscription(
            id=f"sub_{current_user.id[:8]}",
            user_id=current_user.id,
            alert_types=str(request.alert_types),
            min_priority=request.min_priority,
            enable_push=request.enable_push,
            enable_email=request.enable_email,
            push_on_critical_only=request.push_on_critical_only,
            favorite_teams=str(request.favorite_teams),
            favorite_players=str(request.favorite_players),
        )
        db.add(subscription)

    await db.commit()

    return {
        "status": "updated",
        "alert_types": request.alert_types,
        "min_priority": request.min_priority,
    }


@router.get("/subscription", response_model=dict)
async def get_alert_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    GET /alerts/subscription — Get current user alert preferences
    """
    result = await db.execute(
        select(UserAlertSubscription).where(
            UserAlertSubscription.user_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        return {
            "alert_types": [],
            "min_priority": "medium",
            "enable_push": True,
            "enable_email": False,
        }

    import json

    return {
        "alert_types": json.loads(subscription.alert_types)
        if subscription.alert_types
        else [],
        "min_priority": subscription.min_priority,
        "enable_push": subscription.enable_push,
        "enable_email": subscription.enable_email,
        "favorite_teams": json.loads(subscription.favorite_teams)
        if subscription.favorite_teams
        else [],
        "favorite_players": json.loads(subscription.favorite_players)
        if subscription.favorite_players
        else [],
    }


@router.get("/stats", response_model=AlertStatsResponse)
async def get_alert_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    GET /alerts/stats — Alert statistics for dashboard

    Shows:
    - Total alerts in last 24h
    - Critical count
    - High priority count
    - Most common type
    """

    # Alerts in last 24h
    query = select(NewsAlert).where(
        NewsAlert.detected_at >= datetime.utcnow() - timedelta(hours=24)
    )

    total_result = await db.scalar(
        select(func.count(NewsAlert.id)).where(query.whereclause)
    )

    critical_result = await db.scalar(
        select(func.count(NewsAlert.id)).where(
            and_(query.whereclause, NewsAlert.priority == AlertPriority.CRITICAL)
        )
    )

    high_result = await db.scalar(
        select(func.count(NewsAlert.id)).where(
            and_(query.whereclause, NewsAlert.priority == AlertPriority.HIGH)
        )
    )

    # Most common type
    result = await db.execute(
        select(NewsAlert.alert_type, func.count(NewsAlert.id).label("count"))
        .where(query.whereclause)
        .group_by(NewsAlert.alert_type)
        .order_by(desc(func.count(NewsAlert.id)))
        .limit(1)
    )
    most_common = result.first()
    most_common_type = most_common[0].value if most_common else "unknown"

    return AlertStatsResponse(
        total_alerts_24h=total_result or 0,
        critical_alerts=critical_result or 0,
        high_priority_alerts=high_result or 0,
        unread_count=0,  # TODO: Add read/unread tracking
        most_common_type=most_common_type,
    )


@router.post("/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    POST /alerts/{alert_id}/dismiss — User dismissed this alert

    Tracking für relevance Scoring
    """
    result = await db.execute(select(NewsAlert).where(NewsAlert.id == alert_id))
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.user_dismissed_count = (alert.user_dismissed_count or 0) + 1
    await db.commit()

    return {"status": "dismissed", "dismiss_count": alert.user_dismissed_count}


@router.get("/search", response_model=AlertsListResponse)
async def search_alerts(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
):
    """
    GET /alerts/search?q=lewandowski — Volltextsuche in Alerts

    Sucht in:
    - Title
    - Description
    - NLP Tags
    """
    query_text = f"%{q.lower()}%"

    result = await db.execute(
        select(NewsAlert)
        .where(
            (NewsAlert.title.ilike(query_text))
            | (NewsAlert.description.ilike(query_text))
            | (NewsAlert.nlp_tags.ilike(query_text))
        )
        .order_by(desc(NewsAlert.detected_at))
        .limit(limit)
    )

    alerts = result.scalars().all()

    return AlertsListResponse(
        alerts=[AlertResponse.from_orm(a) for a in alerts],
        total=len(alerts),
        page=1,
        limit=limit,
    )


if __name__ == "__main__":
    print("Alerts router loaded ✅")
    print("Endpoints:")
    print("  GET  /api/v1/alerts/feed — User-personalisierte Alert-Feed")
    print("  GET  /api/v1/alerts/{id} — Alert-Details")
    print("  POST /api/v1/alerts/subscription — Update preferences")
    print("  GET  /api/v1/alerts/subscription — Get preferences")
    print("  GET  /api/v1/alerts/stats — Alert statistics")
    print("  POST /api/v1/alerts/{id}/dismiss — Dismiss alert")
    print("  GET  /api/v1/alerts/search — Fulltext search")
