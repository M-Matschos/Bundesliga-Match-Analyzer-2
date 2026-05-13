"""
Unit tests for Redis Pub/Sub manager.

Tests channel management, publishing, subscriptions, and utilities.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.core.redis_pubsub import RedisPubSubManager
from app.models.events import (
    BaseEvent,
    EventType,
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
    Team,
    CardType,
)


@pytest.fixture
def pubsub_manager():
    """Create a RedisPubSubManager instance for testing."""
    return RedisPubSubManager()


@pytest.fixture
def sample_goal_event():
    """Create a sample goal event for testing."""
    return GoalEvent(
        event_type=EventType.GOAL,
        match_id="match_123",
        timestamp=datetime.utcnow(),
        minute=45,
        is_live=True,
        team=Team.HOME,
        player_name="Lewandowski",
        player_id="player_9",
        assist_player_name="Müller",
        score_before={"home": 0, "away": 0},
        score_after={"home": 1, "away": 0},
        xg_value=0.78,
    )


@pytest.fixture
def sample_card_event():
    """Create a sample card event for testing."""
    return CardEvent(
        event_type=EventType.YELLOW_CARD,
        match_id="match_123",
        timestamp=datetime.utcnow(),
        minute=30,
        is_live=True,
        team=Team.AWAY,
        player_name="Ramos",
        player_id="player_4",
        card_type=CardType.YELLOW,
        offense="Harsh tackle",
    )


# ===== CONNECTION TESTS =====


@pytest.mark.asyncio
async def test_connect_success(pubsub_manager):
    """Test successful Redis connection."""
    with patch("redis.asyncio.from_url") as mock_redis:
        mock_redis_instance = AsyncMock()
        mock_redis.return_value = mock_redis_instance

        await pubsub_manager.connect()

        assert pubsub_manager.redis is not None
        mock_redis.assert_called_once()


@pytest.mark.asyncio
async def test_connect_failure(pubsub_manager):
    """Test Redis connection failure."""
    with patch("redis.asyncio.from_url") as mock_redis:
        mock_redis.side_effect = Exception("Connection refused")

        with pytest.raises(Exception):
            await pubsub_manager.connect()


@pytest.mark.asyncio
async def test_disconnect_success(pubsub_manager):
    """Test successful Redis disconnection."""
    pubsub_manager.redis = AsyncMock()

    await pubsub_manager.disconnect()

    pubsub_manager.redis.close.assert_called_once()


@pytest.mark.asyncio
async def test_disconnect_no_connection(pubsub_manager):
    """Test disconnect when no connection exists."""
    pubsub_manager.redis = None

    # Should not raise exception
    await pubsub_manager.disconnect()


@pytest.mark.asyncio
async def test_is_connected_true(pubsub_manager):
    """Test is_connected returns True when connected."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.ping = AsyncMock()

    result = await pubsub_manager.is_connected()

    assert result is True
    pubsub_manager.redis.ping.assert_called_once()


@pytest.mark.asyncio
async def test_is_connected_false_no_redis(pubsub_manager):
    """Test is_connected returns False when Redis is None."""
    pubsub_manager.redis = None

    result = await pubsub_manager.is_connected()

    assert result is False


@pytest.mark.asyncio
async def test_is_connected_false_ping_fails(pubsub_manager):
    """Test is_connected returns False when ping fails."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.ping = AsyncMock(side_effect=Exception("Ping failed"))

    result = await pubsub_manager.is_connected()

    assert result is False


# ===== CHANNEL NAMING TESTS =====


def test_get_match_events_channel():
    """Test match events channel naming."""
    channel = RedisPubSubManager.get_match_events_channel("match_123")
    assert channel == "match:match_123:events"


def test_get_match_stats_channel():
    """Test match stats channel naming."""
    channel = RedisPubSubManager.get_match_stats_channel("match_456")
    assert channel == "match:match_456:stats"


def test_get_match_notifications_channel():
    """Test match notifications channel naming."""
    channel = RedisPubSubManager.get_match_notifications_channel("match_789")
    assert channel == "match:match_789:notifications"


def test_get_system_alerts_channel():
    """Test system alerts channel naming."""
    channel = RedisPubSubManager.get_system_alerts_channel()
    assert channel == "system:alerts"


# ===== PUBLISH TESTS =====


@pytest.mark.asyncio
async def test_publish_event_success(pubsub_manager, sample_goal_event):
    """Test successful event publishing."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.publish = AsyncMock(return_value=3)  # 3 subscribers

    num_subscribers = await pubsub_manager.publish_event(
        "match_123", sample_goal_event
    )

    assert num_subscribers == 3
    pubsub_manager.redis.publish.assert_called_once()
    call_args = pubsub_manager.redis.publish.call_args
    assert "match:match_123:events" in str(call_args)


@pytest.mark.asyncio
async def test_publish_event_not_connected(pubsub_manager, sample_goal_event):
    """Test publishing when Redis not connected."""
    pubsub_manager.redis = None

    with pytest.raises(RuntimeError, match="Redis not connected"):
        await pubsub_manager.publish_event("match_123", sample_goal_event)


@pytest.mark.asyncio
async def test_publish_stats_update_success(pubsub_manager):
    """Test successful stats update publishing."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.publish = AsyncMock(return_value=5)

    stats = {
        "home_possession": 55.5,
        "away_possession": 44.5,
        "home_shots": 12,
        "away_shots": 8,
    }

    num_subscribers = await pubsub_manager.publish_stats_update("match_123", stats)

    assert num_subscribers == 5
    pubsub_manager.redis.publish.assert_called_once()


@pytest.mark.asyncio
async def test_publish_notification_success(pubsub_manager):
    """Test successful notification publishing."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.publish = AsyncMock(return_value=2)

    num_subscribers = await pubsub_manager.publish_notification(
        "match_123", "Match ended"
    )

    assert num_subscribers == 2


@pytest.mark.asyncio
async def test_publish_system_alert_success(pubsub_manager):
    """Test successful system alert publishing."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.publish = AsyncMock(return_value=100)

    num_subscribers = await pubsub_manager.publish_system_alert(
        "Server maintenance in 5 minutes"
    )

    assert num_subscribers == 100
    pubsub_manager.redis.publish.assert_called_once()


# ===== SUBSCRIPTION TESTS =====


@pytest.mark.asyncio
async def test_subscribe_new_channel(pubsub_manager):
    """Test subscription to new channel."""
    callback = AsyncMock()

    await pubsub_manager.subscribe("match:123:events", callback)

    assert "match:123:events" in pubsub_manager.subscribers
    assert callback in pubsub_manager.subscribers["match:123:events"]


@pytest.mark.asyncio
async def test_subscribe_multiple_callbacks_same_channel(pubsub_manager):
    """Test multiple callbacks on same channel."""
    callback1 = AsyncMock()
    callback2 = AsyncMock()

    await pubsub_manager.subscribe("match:123:events", callback1)
    await pubsub_manager.subscribe("match:123:events", callback2)

    assert len(pubsub_manager.subscribers["match:123:events"]) == 2
    assert callback1 in pubsub_manager.subscribers["match:123:events"]
    assert callback2 in pubsub_manager.subscribers["match:123:events"]


@pytest.mark.asyncio
async def test_subscribe_not_connected(pubsub_manager):
    """Test subscription when Redis not connected."""
    pubsub_manager.redis = None
    callback = AsyncMock()

    with pytest.raises(RuntimeError, match="Redis not connected"):
        await pubsub_manager.subscribe("match:123:events", callback)


@pytest.mark.asyncio
async def test_unsubscribe_specific_callback(pubsub_manager):
    """Test unsubscribing specific callback."""
    callback1 = AsyncMock()
    callback2 = AsyncMock()

    # Subscribe both
    await pubsub_manager.subscribe("match:123:events", callback1)
    await pubsub_manager.subscribe("match:123:events", callback2)

    # Unsubscribe one
    await pubsub_manager.unsubscribe("match:123:events", callback1)

    assert callback1 not in pubsub_manager.subscribers["match:123:events"]
    assert callback2 in pubsub_manager.subscribers["match:123:events"]


@pytest.mark.asyncio
async def test_unsubscribe_all_callbacks(pubsub_manager):
    """Test unsubscribing all callbacks from channel."""
    callback1 = AsyncMock()
    callback2 = AsyncMock()

    # Subscribe both
    await pubsub_manager.subscribe("match:123:events", callback1)
    await pubsub_manager.subscribe("match:123:events", callback2)

    # Unsubscribe all (callback=None)
    await pubsub_manager.unsubscribe("match:123:events")

    assert "match:123:events" not in pubsub_manager.subscribers


@pytest.mark.asyncio
async def test_unsubscribe_nonexistent_channel(pubsub_manager):
    """Test unsubscribing from nonexistent channel (should not raise)."""
    # Should not raise exception
    await pubsub_manager.unsubscribe("nonexistent:channel")


# ===== CONTEXT MANAGER TESTS =====


@pytest.mark.asyncio
async def test_subscription_context_manager(pubsub_manager):
    """Test subscription context manager."""
    callback = AsyncMock()

    async with pubsub_manager.subscription("match:123:events", callback):
        assert "match:123:events" in pubsub_manager.subscribers
        assert callback in pubsub_manager.subscribers["match:123:events"]

    # After context, subscription should be removed
    assert "match:123:events" not in pubsub_manager.subscribers


@pytest.mark.asyncio
async def test_subscription_context_manager_exception(pubsub_manager):
    """Test subscription context manager cleans up on exception."""
    callback = AsyncMock()

    try:
        async with pubsub_manager.subscription("match:123:events", callback):
            assert callback in pubsub_manager.subscribers["match:123:events"]
            raise ValueError("Test exception")
    except ValueError:
        pass

    # Should still be cleaned up
    assert "match:123:events" not in pubsub_manager.subscribers


# ===== UTILITY TESTS =====


@pytest.mark.asyncio
async def test_get_channel_stats_single_match(pubsub_manager):
    """Test getting channel stats for single match."""
    callback1 = AsyncMock()
    callback2 = AsyncMock()

    await pubsub_manager.subscribe("match:123:events", callback1)
    await pubsub_manager.subscribe("match:123:events", callback2)
    await pubsub_manager.subscribe("match:123:stats", callback1)

    stats = await pubsub_manager.get_channel_stats("123")

    assert len(stats) == 2
    assert stats["match:123:events"] == 2
    assert stats["match:123:stats"] == 1


@pytest.mark.asyncio
async def test_get_channel_stats_no_match(pubsub_manager):
    """Test channel stats for match with no subscriptions."""
    stats = await pubsub_manager.get_channel_stats("nonexistent")

    assert len(stats) == 0


@pytest.mark.asyncio
async def test_get_global_stats(pubsub_manager):
    """Test getting global Pub/Sub statistics."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.ping = AsyncMock()

    callback1 = AsyncMock()
    callback2 = AsyncMock()
    callback3 = AsyncMock()

    await pubsub_manager.subscribe("match:123:events", callback1)
    await pubsub_manager.subscribe("match:123:events", callback2)
    await pubsub_manager.subscribe("match:456:stats", callback3)

    stats = await pubsub_manager.get_global_stats()

    assert stats["total_channels"] == 2
    assert stats["total_callbacks"] == 3
    assert stats["is_connected"] is True
    assert len(stats["channels"]) == 2


@pytest.mark.asyncio
async def test_clear_match_subscriptions(pubsub_manager):
    """Test clearing all subscriptions for a match."""
    callback = AsyncMock()

    await pubsub_manager.subscribe("match:123:events", callback)
    await pubsub_manager.subscribe("match:123:stats", callback)
    await pubsub_manager.subscribe("match:123:notifications", callback)
    await pubsub_manager.subscribe("match:456:events", callback)

    cleared = await pubsub_manager.clear_match_subscriptions("123")

    assert cleared == 3
    assert "match:123:events" not in pubsub_manager.subscribers
    assert "match:123:stats" not in pubsub_manager.subscribers
    assert "match:123:notifications" not in pubsub_manager.subscribers
    assert "match:456:events" in pubsub_manager.subscribers  # Other match untouched


@pytest.mark.asyncio
async def test_clear_match_subscriptions_nonexistent(pubsub_manager):
    """Test clearing subscriptions for nonexistent match."""
    cleared = await pubsub_manager.clear_match_subscriptions("nonexistent")

    assert cleared == 0


# ===== INTEGRATION TESTS =====


@pytest.mark.asyncio
async def test_publish_and_subscribe_workflow(pubsub_manager, sample_goal_event):
    """Test complete publish-subscribe workflow."""
    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.publish = AsyncMock(return_value=2)

    # Subscribe
    callback = AsyncMock()
    await pubsub_manager.subscribe("match:123:events", callback)

    # Publish
    num_subscribers = await pubsub_manager.publish_event(
        "match_123", sample_goal_event
    )

    assert num_subscribers == 2
    assert "match:123:events" in pubsub_manager.subscribers


@pytest.mark.asyncio
async def test_multiple_matches_independent(pubsub_manager):
    """Test multiple matches maintain independent subscriptions."""
    callback1 = AsyncMock()
    callback2 = AsyncMock()

    await pubsub_manager.subscribe("match:123:events", callback1)
    await pubsub_manager.subscribe("match:456:events", callback2)

    stats_123 = await pubsub_manager.get_channel_stats("123")
    stats_456 = await pubsub_manager.get_channel_stats("456")

    assert len(stats_123) == 1
    assert len(stats_456) == 1
    assert stats_123["match:123:events"] == 1
    assert stats_456["match:456:events"] == 1
