"""Event Publishing router for WebSocket + Redis integration."""

import json
import logging
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.db import (
    User,
    Match,
    Device,
    MatchSubscription,
    NotificationHistory,
    get_db,
)
from app.models.events import (
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
    EventType,
)
from app.core.redis_pubsub import pubsub_manager
from app.core.security import verify_token, get_user_id_from_token
from app.services.notification_service import send_fcm_notification

router = APIRouter(tags=["events"])
logger = logging.getLogger(__name__)


async def get_current_admin_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency to get current admin user from JWT token.

    Admin-only access for event publishing.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authentication scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    try:
        payload = verify_token(token)
        user_id = UUID(payload.sub)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user


async def _send_notifications_to_subscribers(
    db: AsyncSession,
    match_id: str,
    event: GoalEvent | CardEvent | SubstitutionEvent,
) -> int:
    """Send FCM notifications to all match subscribers.

    Args:
        db: Database session
        match_id: Match ID (UUID string)
        event: Event object with event_type and data

    Returns:
        Number of notifications sent
    """
    try:
        # Find all subscribers for this match
        stmt = select(MatchSubscription).where(
            MatchSubscription.match_id == UUID(match_id)
        )
        result = await db.execute(stmt)
        subscriptions = result.scalars().all()

        if not subscriptions:
            return 0

        notification_count = 0
        user_ids = [sub.user_id for sub in subscriptions]

        # For each subscriber, send FCM to all their devices
        for user_id in user_ids:
            stmt = select(Device).where(Device.user_id == user_id)
            result = await db.execute(stmt)
            devices = result.scalars().all()

            for device in devices:
                # Format notification title and body based on event type
                title = _format_notification_title(event)
                body = _format_notification_body(event)
                data = {
                    "match_id": match_id,
                    "event_type": event.event_type,
                }

                # Send FCM notification
                try:
                    await send_fcm_notification(
                        device_token=device.device_token,
                        title=title,
                        body=body,
                        data=data,
                    )
                    notification_count += 1

                    # Record in notification history
                    notification = NotificationHistory(
                        user_id=user_id,
                        match_id=UUID(match_id),
                        notification_type=event.event_type,
                        payload=json.dumps(data),
                    )
                    db.add(notification)
                except Exception as e:
                    logger.warning(
                        f"Failed to send FCM to device {device.device_token}: {e}"
                    )

        # Commit all history records
        if notification_count > 0:
            await db.commit()

        return notification_count

    except Exception as e:
        logger.error(f"Error sending notifications to subscribers: {e}")
        await db.rollback()
        return 0


def _format_notification_title(event: GoalEvent | CardEvent | SubstitutionEvent) -> str:
    """Format notification title based on event type."""
    titles = {
        "goal": "⚽ Goal!",
        "own_goal": "⚽ Own Goal!",
        "yellow_card": "🟨 Yellow Card",
        "red_card": "🔴 Red Card",
        "substitution": "🔄 Substitution",
    }
    return titles.get(event.event_type, f"{event.event_type.upper()}")


def _format_notification_body(event: GoalEvent | CardEvent | SubstitutionEvent) -> str:
    """Format notification body based on event type."""
    if isinstance(event, GoalEvent):
        return f"{event.player_name} ({event.team}) {event.minute}'"
    elif isinstance(event, CardEvent):
        return (
            f"{event.card_type.upper()} card for {event.player_name} ({event.minute}')"
        )
    elif isinstance(event, SubstitutionEvent):
        return (
            f"{event.player_in_name} on, {event.player_out_name} off ({event.minute}')"
        )
    return "Match event occurred"


@router.post("/publish/{match_id}")
async def publish_event(
    match_id: str,
    event: GoalEvent | CardEvent | SubstitutionEvent,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Publish event to Redis and broadcast to WebSocket clients.

    Admin-only endpoint. Publishes event to match's Redis channel.
    All connected WebSocket clients receive broadcast.

    Args:
        match_id: Match ID for the event
        event: Event data (GoalEvent, CardEvent, or SubstitutionEvent)
        current_user: Current admin user from JWT
        db: Database session

    Returns:
        {status, match_id, event_type, subscribers, timestamp}

    Raises:
        HTTPException: 401 if not authenticated, 403 if not admin, 404 if match not found
    """
    try:
        # Verify match exists
        stmt = select(Match).where(Match.api_football_id == int(match_id))
        result = await db.execute(stmt)
        match = result.scalar_one_or_none()

        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Match {match_id} not found",
            )

        # Publish to Redis (for WebSocket clients)
        num_subscribers = await pubsub_manager.publish_event(match_id, event)

        # Send FCM notifications to match subscribers
        notifications_sent = await _send_notifications_to_subscribers(
            db, match_id, event
        )

        logger.info(
            f"Event published: match={match_id}, type={event.event_type}, "
            f"websocket_subscribers={num_subscribers}, fcm_notifications_sent={notifications_sent}, "
            f"user={current_user.email}"
        )

        return {
            "status": "published",
            "match_id": match_id,
            "event_type": event.event_type,
            "websocket_subscribers": num_subscribers,
            "fcm_notifications_sent": notifications_sent,
            "timestamp": datetime.utcnow().isoformat(),
        }

    except HTTPException:
        raise
    except RuntimeError as e:
        logger.error(f"Redis error publishing event: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Event publishing service unavailable",
        )
    except Exception as e:
        logger.error(f"Error publishing event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish event",
        )
