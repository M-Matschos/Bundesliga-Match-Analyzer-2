"""
Redis Pub/Sub infrastructure for real-time event distribution.

Provides channels for:
- Live match events (goals, cards, substitutions)
- Match status updates (possession, stats)
- System notifications (server events)

Architecture:
  Event Producer → Redis Pub/Sub → WebSocket Router → Connected Clients
  (Ingestion Service) (Channel Broker) (Connection Manager) (Browsers)
"""

import json
import logging
from typing import Optional, Callable, Any, Dict, Set
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.core.config import settings
from app.models.events import BaseEvent, WebSocketMessage

logger = logging.getLogger(__name__)


class RedisPubSubManager:
    """
    Manages Redis Pub/Sub channels for real-time event distribution.

    Channels:
    - match:{match_id}:events — Live match events
    - match:{match_id}:stats — Match statistics updates
    - match:{match_id}:notifications — System notifications
    - system:alerts — System-wide alerts
    """

    def __init__(self):
        """Initialize Redis Pub/Sub manager."""
        self.redis: Optional[Redis] = None
        self.subscribers: Dict[str, Set[Callable]] = {}  # channel -> callbacks
        self._subscribed_channels: Set[str] = set()

    async def connect(self) -> None:
        """
        Connect to Redis instance.

        Raises:
            redis.asyncio.RedisError: If connection fails
        """
        try:
            # redis.asyncio.from_url is a synchronous factory (no await needed)
            self.redis = aioredis.from_url(
                settings.redis_url,
                encoding="utf8",
                decode_responses=True,
                max_connections=20,
            )
            logger.info("Connected to Redis for Pub/Sub")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")

    async def is_connected(self) -> bool:
        """Check if Redis is connected."""
        if not self.redis:
            return False
        try:
            await self.redis.ping()
            return True
        except Exception:
            return False

    # ===== CHANNEL MANAGEMENT =====

    @staticmethod
    def get_match_events_channel(match_id: str) -> str:
        """Get channel name for match events."""
        return f"match:{match_id}:events"

    @staticmethod
    def get_match_stats_channel(match_id: str) -> str:
        """Get channel name for match stats."""
        return f"match:{match_id}:stats"

    @staticmethod
    def get_match_notifications_channel(match_id: str) -> str:
        """Get channel name for match notifications."""
        return f"match:{match_id}:notifications"

    @staticmethod
    def get_system_alerts_channel() -> str:
        """Get channel name for system alerts."""
        return "system:alerts"

    # ===== PUBLISH =====

    async def publish_event(self, match_id: str, event: BaseEvent) -> int:
        """
        Publish a live match event.

        Args:
            match_id: Match identifier
            event: Event to publish

        Returns:
            Number of subscribers that received the event

        Raises:
            RuntimeError: If Redis is not connected
        """
        if not self.redis:
            raise RuntimeError("Redis not connected")

        channel = self.get_match_events_channel(match_id)
        event_data = event.dict()
        event_data["timestamp"] = event.timestamp.isoformat()
        message = json.dumps(
            {
                "type": "event",
                "data": event_data,
                "timestamp": event.timestamp.isoformat(),
            }
        )

        try:
            num_subscribers = await self.redis.publish(channel, message)
            logger.info(
                "event_published",
                extra={
                    "match_id": match_id,
                    "event_type": event.event_type,
                    "subscribers": num_subscribers,
                },
            )
            return num_subscribers
        except Exception as e:
            logger.error(f"Failed to publish event: {str(e)}")
            raise

    async def publish_stats_update(self, match_id: str, stats: Dict[str, Any]) -> int:
        """
        Publish match statistics update.

        Args:
            match_id: Match identifier
            stats: Statistics dictionary

        Returns:
            Number of subscribers that received the update
        """
        if not self.redis:
            raise RuntimeError("Redis not connected")

        channel = self.get_match_stats_channel(match_id)
        message = json.dumps({"type": "stats_update", "data": stats})

        try:
            num_subscribers = await self.redis.publish(channel, message)
            logger.info(
                "stats_published",
                extra={"match_id": match_id, "subscribers": num_subscribers},
            )
            return num_subscribers
        except Exception as e:
            logger.error(f"Failed to publish stats: {str(e)}")
            raise

    async def publish_notification(self, match_id: str, notification: str) -> int:
        """
        Publish match notification (e.g., "Match ended").

        Args:
            match_id: Match identifier
            notification: Notification message

        Returns:
            Number of subscribers
        """
        if not self.redis:
            raise RuntimeError("Redis not connected")

        channel = self.get_match_notifications_channel(match_id)
        message = json.dumps({"type": "notification", "data": notification})

        try:
            num_subscribers = await self.redis.publish(channel, message)
            logger.info(
                "notification_published",
                extra={"match_id": match_id, "subscribers": num_subscribers},
            )
            return num_subscribers
        except Exception as e:
            logger.error(f"Failed to publish notification: {str(e)}")
            raise

    async def publish_system_alert(self, alert_message: str) -> int:
        """
        Publish system-wide alert.

        Args:
            alert_message: Alert message

        Returns:
            Number of subscribers
        """
        if not self.redis:
            raise RuntimeError("Redis not connected")

        channel = self.get_system_alerts_channel()
        message = json.dumps({"type": "system_alert", "data": alert_message})

        try:
            num_subscribers = await self.redis.publish(channel, message)
            logger.warning(
                "system_alert_published",
                extra={"subscribers": num_subscribers},
            )
            return num_subscribers
        except Exception as e:
            logger.error(f"Failed to publish system alert: {str(e)}")
            raise

    # ===== SUBSCRIBE =====

    async def subscribe(self, channel: str, callback: Callable[[str], Any]) -> None:
        """
        Subscribe to a channel with a callback.

        Args:
            channel: Channel to subscribe to
            callback: Async callback to call on message

        Raises:
            RuntimeError: If Redis is not connected
        """
        if not self.redis:
            raise RuntimeError("Redis not connected")

        try:
            # Register callback
            if channel not in self.subscribers:
                self.subscribers[channel] = set()
            self.subscribers[channel].add(callback)

            logger.info(f"Subscribed to channel: {channel}")
        except Exception as e:
            logger.error(f"Failed to subscribe to {channel}: {str(e)}")
            raise

    async def unsubscribe(
        self, channel: str, callback: Optional[Callable] = None
    ) -> None:
        """
        Unsubscribe from a channel.

        Args:
            channel: Channel to unsubscribe from
            callback: Specific callback to remove (if None, remove all)
        """
        if channel not in self.subscribers:
            return

        if callback:
            self.subscribers[channel].discard(callback)
        else:
            self.subscribers[channel].clear()

        if not self.subscribers[channel]:
            del self.subscribers[channel]

        logger.info(f"Unsubscribed from channel: {channel}")

    # ===== ASYNC CONTEXT MANAGER =====

    @asynccontextmanager
    async def subscription(self, channel: str, callback: Callable):
        """
        Context manager for channel subscription.

        Usage:
            async with pubsub.subscription('match:123:events', callback):
                # Callback is active
                pass
            # Callback is removed
        """
        await self.subscribe(channel, callback)
        try:
            yield
        finally:
            await self.unsubscribe(channel, callback)

    # ===== UTILITIES =====

    async def get_channel_stats(self, match_id: str) -> Dict[str, int]:
        """
        Get subscription stats for a match.

        Args:
            match_id: Match identifier

        Returns:
            Stats dict with subscriber counts per channel
        """
        stats = {}

        # Count callbacks for each channel
        for channel_name, callbacks in self.subscribers.items():
            if match_id in channel_name:
                stats[channel_name] = len(callbacks)

        return stats

    async def get_global_stats(self) -> Dict[str, Any]:
        """
        Get global Pub/Sub statistics.

        Returns:
            Global stats dict
        """
        total_channels = len(self.subscribers)
        total_callbacks = sum(len(cbs) for cbs in self.subscribers.values())

        return {
            "total_channels": total_channels,
            "total_callbacks": total_callbacks,
            "is_connected": await self.is_connected(),
            "channels": list(self.subscribers.keys()),
        }

    async def clear_match_subscriptions(self, match_id: str) -> int:
        """
        Clear all subscriptions for a match (e.g., when match ends).

        Args:
            match_id: Match identifier

        Returns:
            Number of subscriptions cleared
        """
        channels_to_clear = [ch for ch in self.subscribers if match_id in ch]

        for channel in channels_to_clear:
            del self.subscribers[channel]

        logger.info(f"Cleared {len(channels_to_clear)} channels for match {match_id}")
        return len(channels_to_clear)


# Global instance
pubsub_manager = RedisPubSubManager()


# ===== DEPENDENCY =====


async def get_pubsub_manager() -> RedisPubSubManager:
    """Dependency for FastAPI to get Pub/Sub manager."""
    return pubsub_manager
