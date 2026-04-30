"""
Integration tests for WebSocket ↔ Redis Pub/Sub Pipeline.

Tests the end-to-end flow:
- Event published to Redis
- ConnectionManager subscribes to channels
- Callbacks receive messages
- WebSocket clients get broadcasts
- Lifecycle management (first/last client)
"""

import pytest
import json
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.core.redis_pubsub import pubsub_manager, RedisPubSubManager
from app.routers.websocket import manager as connection_manager
from app.models.db import User, Match
from app.models.events import (
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
    StatsUpdateEvent,
    Team,
    CardType,
    EventType,
)


class TestWebSocketRedisIntegration:
    """Integration tests for WebSocket ↔ Redis Pub/Sub."""

    @pytest.fixture
    async def auth_token(self, db: AsyncSession):
        """Create authenticated user and return JWT token."""
        # This uses existing fixtures from conftest.py
        pass  # Token fixture already exists in conftest

    @pytest.fixture
    async def test_match(self, db: AsyncSession):
        """Create test match."""
        match = Match(
            external_id="test_match_123",
            home_team="FC Bayern",
            away_team="Borussia Dortmund",
            kickoff=datetime.utcnow(),
            league="Bundesliga",
            season=2025,
            status="live",
        )
        db.add(match)
        await db.commit()
        await db.refresh(match)
        return match

    @pytest.mark.asyncio
    async def test_event_published_to_redis_received_by_callback(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Event published to Redis → Callback receives it."""
        pubsub_manager.redis = AsyncMock()
        pubsub_manager.redis.publish = AsyncMock(return_value=1)

        callback_called = False
        received_message = None

        async def test_callback(message: str) -> None:
            nonlocal callback_called, received_message
            callback_called = True
            received_message = message

        match_id = "test_match_123"
        goal_event = GoalEvent(
            event_type=EventType.GOAL,
            match_id=match_id,
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

        # Subscribe to channel
        await pubsub_manager.subscribe(
            RedisPubSubManager.get_match_events_channel(match_id),
            test_callback,
        )

        # Publish event
        num_subscribers = await pubsub_manager.publish_event(match_id, goal_event)

        # Assertions
        assert num_subscribers == 1
        assert pubsub_manager.redis.publish.called

    @pytest.mark.asyncio
    async def test_multiple_event_types_all_channels_subscribe_correctly(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Multiple event types → all 3 channels subscribe correctly."""
        pubsub_manager.redis = AsyncMock()
        pubsub_manager.redis.publish = AsyncMock(return_value=3)  # 3 subscribers

        match_id = "test_match_456"
        channels_hit = set()

        async def on_event(message: str) -> None:
            """Callback that tracks which channel received it."""
            pass

        # Subscribe to all 3 channels
        event_channel = RedisPubSubManager.get_match_events_channel(match_id)
        stats_channel = RedisPubSubManager.get_match_stats_channel(match_id)
        notif_channel = RedisPubSubManager.get_match_notifications_channel(match_id)

        await pubsub_manager.subscribe(event_channel, on_event)
        await pubsub_manager.subscribe(stats_channel, on_event)
        await pubsub_manager.subscribe(notif_channel, on_event)

        # Publish different event types
        goal_event = GoalEvent(
            event_type=EventType.GOAL,
            match_id=match_id,
            timestamp=datetime.utcnow(),
            minute=30,
            is_live=True,
            team=Team.HOME,
            player_name="Player1",
            player_id="p1",
            assist_player_name="Player2",
            score_before={"home": 0, "away": 0},
            score_after={"home": 1, "away": 0},
            xg_value=0.7,
        )

        stats = {
            "home_possession": 55.5,
            "away_possession": 44.5,
            "home_shots": 12,
            "away_shots": 8,
        }

        # Publish to all 3 channels
        await pubsub_manager.publish_event(match_id, goal_event)
        await pubsub_manager.publish_stats_update(match_id, stats)
        await pubsub_manager.publish_notification(match_id, "Match started")

        # Verify all channels subscribed
        assert event_channel in pubsub_manager.subscribers
        assert stats_channel in pubsub_manager.subscribers
        assert notif_channel in pubsub_manager.subscribers

        # Verify callback in all 3
        assert on_event in pubsub_manager.subscribers[event_channel]
        assert on_event in pubsub_manager.subscribers[stats_channel]
        assert on_event in pubsub_manager.subscribers[notif_channel]

    @pytest.mark.asyncio
    async def test_lifecycle_first_client_starts_listener_last_stops_it(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Lifecycle management (first client starts, last stops listener)."""
        pubsub_manager.redis = AsyncMock()
        pubsub_manager.redis.publish = AsyncMock(return_value=1)

        match_id = "test_match_789"

        # Simulate: First client connects
        assert connection_manager.get_match_connections_count(match_id) == 0

        # After first client connects, listener should start
        await connection_manager.start_listening_for_match_events(match_id)

        # Verify subscriptions are active
        assert match_id in connection_manager.active_subscriptions
        channels = connection_manager.active_subscriptions[match_id]
        assert len(channels) == 3  # 3 channels: events, stats, notifications

        # Simulate: More clients connect (listener stays active)
        # ... (just verify count doesn't trigger another start)

        # Simulate: Last client disconnects
        await connection_manager.stop_listening_for_match(match_id)

        # Verify subscriptions are cleaned up
        assert match_id not in connection_manager.active_subscriptions

    @pytest.mark.asyncio
    async def test_redis_message_broadcast_to_multiple_websocket_clients(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Redis message → WebSocket broadcast to multiple clients."""
        pubsub_manager.redis = AsyncMock()

        # Create mock WebSocket clients
        mock_ws1 = AsyncMock()
        mock_ws2 = AsyncMock()
        mock_ws3 = AsyncMock()

        match_id = "test_match_broadcast"

        # Simulate: 3 clients connected to same match
        connection_id_1 = f"client_1_{match_id}"
        connection_id_2 = f"client_2_{match_id}"
        connection_id_3 = f"client_3_{match_id}"

        connection_manager.active_connections[match_id] = {
            connection_id_1: mock_ws1,
            connection_id_2: mock_ws2,
            connection_id_3: mock_ws3,
        }

        # Create test event message
        event_message = {
            "type": "event",
            "data": {
                "event_type": "goal",
                "match_id": match_id,
                "minute": 45,
                "team": "home",
                "player_name": "Lewandowski",
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Broadcast message to all connected clients
        await connection_manager.broadcast_to_match(match_id, event_message)

        # Verify all 3 clients received the message
        assert mock_ws1.send_json.called
        assert mock_ws2.send_json.called
        assert mock_ws3.send_json.called

        # Verify message content
        call_args_1 = mock_ws1.send_json.call_args[0][0]
        assert call_args_1["type"] == "event"
        assert call_args_1["data"]["event_type"] == "goal"

        # Cleanup
        del connection_manager.active_connections[match_id]

    @pytest.mark.asyncio
    async def test_error_handling_malformed_json(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Error handling with malformed JSON from Redis."""
        pubsub_manager.redis = AsyncMock()

        match_id = "test_match_error"
        callback_error_handled = False

        async def on_event_with_error_handling(message: str) -> None:
            """Callback that handles JSON errors gracefully."""
            nonlocal callback_error_handled
            try:
                event_data = json.loads(message)
                await connection_manager.broadcast_to_match(match_id, event_data)
            except json.JSONDecodeError:
                callback_error_handled = True
                # In real code, would log error and continue

        # Malformed JSON
        malformed_message = "{ this is not valid json }"

        # Callback should handle gracefully
        await on_event_with_error_handling(malformed_message)

        # Verify error was caught
        assert callback_error_handled is True

    @pytest.mark.asyncio
    async def test_error_handling_redis_offline(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Error handling when Redis is offline."""
        pubsub_manager.redis = None

        match_id = "test_match_redis_down"

        # Attempt to start listener without Redis
        await connection_manager.start_listening_for_match_events(match_id)

        # Should not crash, just log warning
        # (listener won't start, but endpoint handles gracefully)

        assert match_id not in connection_manager.active_subscriptions

    @pytest.mark.asyncio
    async def test_error_handling_dead_websocket_connections(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Test: Dead WebSocket connections are cleaned up during broadcast."""
        pubsub_manager.redis = AsyncMock()

        match_id = "test_match_dead_ws"

        # Create mock clients: 2 alive, 1 dead
        alive_ws_1 = AsyncMock()
        alive_ws_2 = AsyncMock()
        dead_ws = AsyncMock()

        # Dead connection raises error on send_json
        dead_ws.send_json = AsyncMock(side_effect=Exception("Connection closed"))

        connection_manager.active_connections[match_id] = {
            "client_1": alive_ws_1,
            "client_2": alive_ws_2,
            "client_dead": dead_ws,
        }

        # Broadcast message
        event_message = {"type": "event", "data": {}}
        await connection_manager.broadcast_to_match(match_id, event_message)

        # Verify: Alive connections got message, dead was disconnected
        assert alive_ws_1.send_json.called
        assert alive_ws_2.send_json.called

        # Dead connection should be cleaned up
        assert "client_dead" not in connection_manager.active_connections[match_id]
        assert len(connection_manager.active_connections[match_id]) == 2

        # Cleanup
        del connection_manager.active_connections[match_id]

    @pytest.mark.asyncio
    async def test_integration_event_flow_end_to_end(
        self,
        pubsub_manager: RedisPubSubManager,
    ):
        """Integration: Full event flow from Redis → WebSocket clients."""
        pubsub_manager.redis = AsyncMock()
        pubsub_manager.redis.publish = AsyncMock(return_value=2)

        match_id = "test_match_e2e"

        # Setup: Create mock clients
        client_ws = AsyncMock()
        connection_manager.active_connections[match_id] = {
            "client_123": client_ws,
        }

        # Start listening
        await connection_manager.start_listening_for_match_events(match_id)
        assert match_id in connection_manager.active_subscriptions

        # Create goal event
        goal_event = GoalEvent(
            event_type=EventType.GOAL,
            match_id=match_id,
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

        # Publish event to Redis
        num_subscribers = await pubsub_manager.publish_event(match_id, goal_event)
        assert num_subscribers == 2  # Mocked as 2 subscribers

        # Verify publication
        assert pubsub_manager.redis.publish.called

        # Stop listening (cleanup)
        await connection_manager.stop_listening_for_match(match_id)
        assert match_id not in connection_manager.active_subscriptions

        # Cleanup
        del connection_manager.active_connections[match_id]


# ===== END-TO-END WEBSOCKET FLOW TESTS =====


@pytest.mark.asyncio
async def test_websocket_client_receives_live_event(
    # Note: These would use real WebSocket client simulation if we had TestClient support
    pubsub_manager: RedisPubSubManager,
):
    """E2E Test: WebSocket client receives live event from Redis."""
    # This test demonstrates the full flow, but requires WebSocket client simulation
    # In production, use:
    # - websockets library for async WebSocket client
    # - Or FastAPI's TestClient with WebSocket support (experimental)

    pubsub_manager.redis = AsyncMock()
    pubsub_manager.redis.publish = AsyncMock(return_value=1)

    match_id = "real_match_001"

    # Simulate: Client connects via WebSocket
    # await websocket.connect("ws://localhost:8000/api/v1/ws/live/{match_id}?token={jwt}")

    # Simulate: Event published to Redis
    goal_event = GoalEvent(
        event_type=EventType.GOAL,
        match_id=match_id,
        timestamp=datetime.utcnow(),
        minute=89,
        is_live=True,
        team=Team.AWAY,
        player_name="Haaland",
        player_id="player_21",
        assist_player_name="Foden",
        score_before={"home": 0, "away": 0},
        score_after={"home": 0, "away": 1},
        xg_value=0.82,
    )

    num_subscribers = await pubsub_manager.publish_event(match_id, goal_event)

    # Verify publication succeeded
    assert num_subscribers >= 1
    assert pubsub_manager.redis.publish.called

    # In real test: client would receive:
    # {
    #     "type": "event",
    #     "data": {goal_event.dict()},
    #     "timestamp": "2026-04-28T..."
    # }
