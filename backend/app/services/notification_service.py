"""
Push Notification Service für Phase C: Firebase Cloud Messaging Integration
Verwaltet Push-Benachrichtigungen, Device-Registrierungen und Subscriptions
Mit Circuit-Breaker für Fehlertoleranz und Fallback-Queue
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
except ImportError:
    firebase_admin = None
    credentials = None
    messaging = None

from app.models.notification import (
    DeviceToken,
    NotificationSubscription,
    NotificationHistory,
    PushNotificationRequest,
)
from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerConfig
from app.services.local_notification_queue import LocalNotificationQueue

logger = logging.getLogger(__name__)


class NotificationService:
    """Firebase Cloud Messaging Service für Push-Benachrichtigungen"""

    def __init__(self, db, firebase_credentials_path: Optional[str] = None):
        """
        Initialize Firebase Messaging Service with Circuit-Breaker.

        Args:
            db: Database connection pool
            firebase_credentials_path: Path to Firebase credentials JSON file (optional for testing)
        """
        self.db = db
        self.firebase_initialized = False

        # Initialize Circuit-Breaker für Firebase-Toleranz
        self.circuit_breaker = CircuitBreaker(
            name="firebase_messaging",
            config=CircuitBreakerConfig(
                failure_threshold=5,
                recovery_timeout=60,
                success_threshold=2,
                timeout=10,
            ),
            on_open=self._on_circuit_open,
        )

        # Initialize lokale Queue für Fallback
        self.notification_queue = LocalNotificationQueue(max_queue_size=1000)

        try:
            if firebase_credentials_path:
                cred = credentials.Certificate(firebase_credentials_path)
                firebase_admin.initialize_app(cred)
                self.messaging_client = messaging.client()
                self.firebase_initialized = True
                logger.info("Firebase Messaging initialized successfully")
        except Exception as e:
            logger.warning(f"Firebase initialization skipped: {str(e)}")

    def _on_circuit_open(self) -> None:
        """Circuit-Breaker öffnet sich - Fallback aktivieren"""
        logger.warning("🔴 Circuit-Breaker OPEN - Firebase Fallback aktiviert")

    async def _send_firebase_notification(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        image_url: Optional[str] = None,
        **kwargs,  # Akzeptiere zusätzliche Parameter wie user_id vom Circuit-Breaker
    ) -> Optional[str]:
        """Sende Firebase-Notification (wird vom Circuit-Breaker aufgerufen)"""
        if not self.firebase_initialized:
            raise Exception("Firebase not initialized")

        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
                image_url=image_url
            ),
            data=data or {},
            token=device_token,
        )

        message_id = self.messaging_client.send(message)
        logger.info(f"✓ Push notification sent: {message_id}")
        return message_id

    async def _queue_notification_fallback(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        **kwargs,
    ) -> Optional[str]:
        """Fallback: Speichere Notification in lokaler Queue"""
        user_id = kwargs.get("user_id", 0)
        queued_id = self.notification_queue.enqueue(
            device_token=device_token,
            user_id=user_id,
            title=title,
            body=body,
            data=data or {},
        )
        return None  # Kein Firebase-ID, aber queued

    async def send_push_notification(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        image_url: Optional[str] = None,
        user_id: int = 0,
    ) -> Optional[str]:
        """
        Send push notification with Circuit-Breaker + Fallback.

        Args:
            device_token: Firebase device token
            title: Notification title
            body: Notification body
            data: Optional data payload
            image_url: Optional image URL
            user_id: User ID für Queue-Fallback

        Returns:
            Firebase message ID or None (queued) if Firebase unavailable
        """
        try:
            return await self.circuit_breaker.call(
                func=self._send_firebase_notification,
                device_token=device_token,
                title=title,
                body=body,
                data=data,
                image_url=image_url,
                fallback=self._queue_notification_fallback,
                user_id=user_id,
            )
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            # Letzte Rettung: Queue fallback auch bei Exception
            queued_id = self.notification_queue.enqueue(
                device_token=device_token,
                user_id=user_id,
                title=title,
                body=body,
                data=data or {},
            )
            return None

    async def send_match_event_notification(
        self,
        match_id: int,
        event_type: str,
        event_data: Dict,
        title: Optional[str] = None,
        body: Optional[str] = None,
    ) -> int:
        """
        Send notification to all subscribers of a match with Circuit-Breaker.

        Args:
            match_id: Match ID
            event_type: Type of event (e.g., 'goal', 'yellow_card')
            event_data: Event data dict
            title: Custom notification title
            body: Custom notification body

        Returns:
            Number of notifications sent (Firebase + Queued)
        """
        try:
            subscriptions = await self.db.fetch(
                """
                SELECT ds.user_id, ds.device_token, ds.platform
                FROM notification_subscriptions ns
                JOIN device_tokens ds ON ns.user_id = ds.user_id
                WHERE ns.match_id = $1
                """,
                match_id
            )

            if not subscriptions:
                logger.info(f"No subscribers found for match {match_id}")
                return 0

            # Format notification
            notification_title = title or self._format_event_title(event_type, event_data)
            notification_body = body or self._format_event_body(event_type, event_data)

            # Prepare data payload
            notification_data = {
                "match_id": str(match_id),
                "event_type": event_type,
            }
            notification_data.update({
                k: str(v) for k, v in event_data.items()
                if k not in ["match_id", "event_type"]
            })

            # Send to all subscribers
            sent_count = 0
            for subscription in subscriptions:
                try:
                    message_id = await self.send_push_notification(
                        device_token=subscription["device_token"],
                        title=notification_title,
                        body=notification_body,
                        data=notification_data,
                        user_id=subscription["user_id"],
                    )

                    # Log notification in history (auch wenn queued)
                    await self.db.execute(
                        """
                        INSERT INTO notification_history
                        (user_id, match_id, event_type, title, body, sent_at)
                        VALUES ($1, $2, $3, $4, $5, NOW())
                        """,
                        subscription["user_id"],
                        match_id,
                        event_type,
                        notification_title,
                        notification_body,
                    )
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Failed to send notification to user {subscription['user_id']}: {str(e)}")

            return sent_count
        except Exception as e:
            logger.error(f"Error sending match event notifications: {str(e)}")
            raise

    async def retry_queued_notifications(self) -> int:
        """
        Versuche, ausstehende Notifications aus der Queue zu versenden.
        Wird periodisch aufgerufen wenn Circuit versucht sich zu erholen.
        """
        batch = self.notification_queue.dequeue_batch(batch_size=50)
        if not batch:
            return 0

        logger.info(f"📤 Versuche {len(batch)} Notifications aus Queue zu versenden")
        retry_count = 0

        for queued in batch:
            try:
                message_id = await self._send_firebase_notification(
                    device_token=queued.device_token,
                    title=queued.title,
                    body=queued.body,
                    data=queued.data,
                )
                retry_count += 1
            except Exception as e:
                logger.warning(f"Retry fehlgeschlagen für {queued.id}: {str(e)}")
                self.notification_queue.mark_failed(queued)

        logger.info(f"✓ {retry_count}/{len(batch)} Notifications erfolgreich versendet")
        return retry_count

    def get_circuit_status(self) -> Dict:
        """Hole Status des Circuit-Breaker und Queue"""
        return {
            "circuit": self.circuit_breaker.get_state(),
            "queue": self.notification_queue.get_queue_status(),
        }

    async def register_device(
        self,
        user_id: int,
        device_token: str,
        platform: str,
    ) -> None:
        """
        Register or update a device token for a user.

        Args:
            user_id: User ID
            device_token: Firebase device token
            platform: Device platform ('ios', 'android', 'web')
        """
        try:
            await self.db.execute(
                """
                INSERT INTO device_tokens (user_id, device_token, platform, created_at, updated_at)
                VALUES ($1, $2, $3, NOW(), NOW())
                ON CONFLICT (device_token) DO UPDATE SET
                    user_id = $1,
                    platform = $3,
                    updated_at = NOW()
                """,
                user_id,
                device_token,
                platform,
            )
            logger.info(f"Device registered: user_id={user_id}, platform={platform}")
        except Exception as e:
            logger.error(f"Failed to register device: {str(e)}")
            raise

    async def unregister_device(self, device_token: str) -> None:
        """
        Unregister a device token.

        Args:
            device_token: Firebase device token to remove
        """
        try:
            await self.db.execute(
                "DELETE FROM device_tokens WHERE device_token = $1",
                device_token,
            )
            logger.info(f"Device unregistered: {device_token[:20]}...")
        except Exception as e:
            logger.error(f"Failed to unregister device: {str(e)}")
            raise

    async def subscribe_to_match(self, user_id: int, match_id: int) -> None:
        """
        Subscribe a user to match notifications.

        Args:
            user_id: User ID
            match_id: Match ID
        """
        try:
            await self.db.execute(
                """
                INSERT INTO notification_subscriptions (user_id, match_id, subscribed_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (user_id, match_id) DO NOTHING
                """,
                user_id,
                match_id,
            )
            logger.info(f"User {user_id} subscribed to match {match_id}")
        except Exception as e:
            logger.error(f"Failed to subscribe to match: {str(e)}")
            raise

    async def unsubscribe_from_match(self, user_id: int, match_id: int) -> None:
        """
        Unsubscribe a user from match notifications.

        Args:
            user_id: User ID
            match_id: Match ID
        """
        try:
            await self.db.execute(
                """
                DELETE FROM notification_subscriptions
                WHERE user_id = $1 AND match_id = $2
                """,
                user_id,
                match_id,
            )
            logger.info(f"User {user_id} unsubscribed from match {match_id}")
        except Exception as e:
            logger.error(f"Failed to unsubscribe from match: {str(e)}")
            raise

    async def get_notification_history(
        self,
        user_id: int,
        limit: int = 50,
    ) -> List[NotificationHistory]:
        """
        Get notification history for a user.

        Args:
            user_id: User ID
            limit: Maximum number of notifications to return

        Returns:
            List of NotificationHistory objects
        """
        try:
            records = await self.db.fetch(
                """
                SELECT id, user_id, match_id, event_type, title, body, sent_at, read_at
                FROM notification_history
                WHERE user_id = $1
                ORDER BY sent_at DESC
                LIMIT $2
                """,
                user_id,
                limit,
            )

            return [NotificationHistory(**record) for record in records]
        except Exception as e:
            logger.error(f"Failed to get notification history: {str(e)}")
            raise

    async def mark_notification_as_read(self, notification_id: int) -> None:
        """
        Mark a notification as read.

        Args:
            notification_id: Notification ID
        """
        try:
            await self.db.execute(
                """
                UPDATE notification_history
                SET read_at = NOW()
                WHERE id = $1 AND read_at IS NULL
                """,
                notification_id,
            )
            logger.info(f"Notification {notification_id} marked as read")
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {str(e)}")
            raise

    async def get_user_devices(self, user_id: int) -> List[DeviceToken]:
        """
        Get all registered devices for a user.

        Args:
            user_id: User ID

        Returns:
            List of DeviceToken objects
        """
        try:
            records = await self.db.fetch(
                """
                SELECT user_id, device_token, platform, created_at, updated_at
                FROM device_tokens
                WHERE user_id = $1
                ORDER BY updated_at DESC
                """,
                user_id,
            )

            return [DeviceToken(**record) for record in records]
        except Exception as e:
            logger.error(f"Failed to get user devices: {str(e)}")
            raise

    def _format_event_title(self, event_type: str, event_data: Dict) -> str:
        """Format notification title based on event type"""
        match_id = event_data.get("match_id", "")

        titles = {
            "goal": f"⚽ Match {match_id} - GOAL",
            "own_goal": f"⚽ Match {match_id} - OWN GOAL",
            "yellow_card": f"🟨 Match {match_id} - YELLOW CARD",
            "red_card": f"🔴 Match {match_id} - RED CARD",
            "substitution": f"🔄 Match {match_id} - SUBSTITUTION",
            "match_start": f"🏟️ Match {match_id} - STARTED",
            "match_end": f"🏁 Match {match_id} - ENDED",
        }

        return titles.get(event_type, f"Match {match_id} - {event_type.upper()}")

    def _format_event_body(self, event_type: str, event_data: Dict) -> str:
        """Format notification body based on event type"""
        player = event_data.get("player_name", "Player")
        minute = event_data.get("minute", "")
        team = event_data.get("team_name", "Team")

        bodies = {
            "goal": f"{team} goal by {player} ({minute}')",
            "own_goal": f"Own goal by {player} ({minute}')",
            "yellow_card": f"Yellow card for {player} ({minute}')",
            "red_card": f"Red card for {player} ({minute}')",
            "substitution": f"{player} substituted ({minute}')",
            "match_start": "Match has started",
            "match_end": "Match has ended",
        }

        return bodies.get(event_type, f"{event_type.replace('_', ' ').title()}")


# Global notification service instance
_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    """Get the global notification service instance"""
    global _notification_service
    if _notification_service is None:
        raise RuntimeError("Notification service not initialized")
    return _notification_service


def initialize_notification_service(
    db,
    firebase_credentials_path: Optional[str] = None,
) -> NotificationService:
    """Initialize the global notification service"""
    global _notification_service
    _notification_service = NotificationService(db, firebase_credentials_path)
    return _notification_service


# Module-level function for testing and simple FCM sends
async def send_fcm_notification(
    device_token: str,
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None,
    image_url: Optional[str] = None,
) -> bool:
    """
    Send FCM notification via global service instance.

    Args:
        device_token: Firebase device token
        title: Notification title
        body: Notification body
        data: Optional data payload
        image_url: Optional image URL

    Returns:
        True if sent successfully, False otherwise
    """
    try:
        service = get_notification_service()
        message_id = await service.send_push_notification(
            device_token=device_token,
            title=title,
            body=body,
            data=data,
            image_url=image_url,
        )
        return message_id is not None
    except Exception as e:
        logger.error(f"Failed to send FCM notification: {str(e)}")
        return False
