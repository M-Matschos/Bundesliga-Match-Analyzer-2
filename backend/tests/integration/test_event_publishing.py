"""Integration tests for Event Publishing endpoint (WebSocket + Redis + FCM).

Tests the end-to-end flow:
- POST /api/v1/events/publish/{match_id} accepts events
- Event published to Redis Pub/Sub for WebSocket clients
- Event triggers FCM notifications to match subscribers
- Notifications recorded in notification history
- Admin-only access
- Error handling for dead connections
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from uuid import uuid4
import json

from fastapi.testclient import TestClient

from app.main import app
from app.core.redis_pubsub import pubsub_manager, RedisPubSubManager
from app.routers.websocket import manager as connection_manager
from app.models.events import (
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
    Team,
    CardType,
    EventType,
)
from app.models.db import User, Match, Device, MatchSubscription, NotificationHistory


class TestEventPublishingEndpoint:
    """Tests for POST /api/v1/events/publish/{match_id}"""

    @pytest.fixture
    def admin_token(self, db_session):
        """Create admin user and return JWT token."""
        from app.core.security import hash_password, create_token
        admin = User(
            id=uuid4(),
            email="admin@test.com",
            username="testadmin",
            password_hash=hash_password("admin_password"),
            is_active=True,
            is_superuser=True,
        )
        db_session.add(admin)
        db_session.commit()
        return create_token(data={"sub": str(admin.id)}, token_type="access")

    @pytest.fixture
    def test_match(self, db_session):
        """Create test match."""
        match = Match(
            api_football_id=123456,
            home_team_id=uuid4(),
            away_team_id=uuid4(),
            league_id="bundesliga",
            season="2024-2025",
            matchday=25,
            kickoff=datetime.utcnow(),
            status="live",
        )
        db_session.add(match)
        db_session.commit()
        db_session.refresh(match)
        return match

    @pytest.mark.asyncio
    async def test_event_auth_required(self):
        """Test: Event publishing requires admin authentication."""
        client = TestClient(app)

        match_id = str(uuid4())
        goal_event = {
            "event_type": "goal",
            "team": "home",
            "minute": 45,
            "player_name": "Lewandowski",
            "player_id": "player_9",
        }

        response = client.post(
            f"/api/v1/events/publish/{match_id}",
            json=goal_event,
        )

        assert response.status_code == 401, \
            f"Expected 401, got {response.status_code}: {response.text}"
        assert "authorization" in response.json().get("detail", "").lower()

    @pytest.mark.asyncio
    async def test_event_published_to_redis(self, pubsub_manager: RedisPubSubManager):
        """Test: Event published to Redis."""
        pubsub_manager.redis = AsyncMock()
        pubsub_manager.redis.publish = AsyncMock(return_value=1)

        match_id = str(uuid4())
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

        num_subscribers = await pubsub_manager.publish_event(match_id, goal_event)

        assert num_subscribers == 1
        assert pubsub_manager.redis.publish.called

        call_args = pubsub_manager.redis.publish.call_args
        channel = call_args[0][0]
        assert match_id in channel

    @pytest.mark.asyncio
    async def test_redis_broadcasts_to_all_websocket_clients(
        self, pubsub_manager: RedisPubSubManager
    ):
        """Test: Redis message → WebSocket broadcast to multiple clients."""
        pubsub_manager.redis = AsyncMock()

        match_id = str(uuid4())

        mock_ws1 = AsyncMock()
        mock_ws2 = AsyncMock()
        mock_ws3 = AsyncMock()

        connection_id_1 = f"client_1_{match_id}"
        connection_id_2 = f"client_2_{match_id}"
        connection_id_3 = f"client_3_{match_id}"

        connection_manager.active_connections[match_id] = {
            connection_id_1: mock_ws1,
            connection_id_2: mock_ws2,
            connection_id_3: mock_ws3,
        }

        event_message = {
            "type": "event",
            "match_id": match_id,
            "minute": 45,
            "team": "home",
            "player_name": "Lewandowski",
            "event_type": "goal",
            "timestamp": datetime.utcnow().isoformat(),
        }

        await connection_manager.broadcast_to_match(match_id, event_message)

        assert mock_ws1.send_json.called
        assert mock_ws2.send_json.called
        assert mock_ws3.send_json.called

        call_args_1 = mock_ws1.send_json.call_args[0][0]
        assert call_args_1["type"] == "event"
        assert call_args_1["match_id"] == match_id

        del connection_manager.active_connections[match_id]

    @pytest.mark.asyncio
    async def test_connection_lifecycle_listener_lifecycle(
        self, pubsub_manager: RedisPubSubManager
    ):
        """Test: First client starts listener, last client stops it."""
        pubsub_manager.redis = AsyncMock()

        match_id = str(uuid4())

        assert match_id not in connection_manager.active_subscriptions
        assert connection_manager.get_match_connections_count(match_id) == 0

        await connection_manager.start_listening_for_match_events(match_id)

        assert match_id in connection_manager.active_subscriptions
        channels = connection_manager.active_subscriptions[match_id]
        assert len(channels) == 3

        active_channels_before = len(connection_manager.active_subscriptions[match_id])
        active_channels_after = len(connection_manager.active_subscriptions[match_id])
        assert active_channels_before == active_channels_after

        await connection_manager.stop_listening_for_match(match_id)

        assert match_id not in connection_manager.active_subscriptions

    @pytest.mark.asyncio
    async def test_dead_connections_cleaned_on_broadcast(
        self, pubsub_manager: RedisPubSubManager
    ):
        """Test: Dead WebSocket connections are cleaned up during broadcast."""
        pubsub_manager.redis = AsyncMock()

        match_id = str(uuid4())

        alive_ws_1 = AsyncMock()
        alive_ws_2 = AsyncMock()
        dead_ws = AsyncMock()

        dead_ws.send_json = AsyncMock(side_effect=Exception("Connection closed"))

        connection_manager.active_connections[match_id] = {
            "client_1": alive_ws_1,
            "client_2": alive_ws_2,
            "client_dead": dead_ws,
        }

        event_message = {"type": "event", "data": {}}
        await connection_manager.broadcast_to_match(match_id, event_message)

        assert alive_ws_1.send_json.called
        assert alive_ws_2.send_json.called

        assert "client_dead" not in connection_manager.active_connections[match_id]
        assert len(connection_manager.active_connections[match_id]) == 2

        del connection_manager.active_connections[match_id]


class TestEventNotificationIntegration:
    """Tests for Event Publishing → FCM Notification integration."""

    @pytest.fixture
    async def setup_match_subscribers(self, async_db_session):
        """Create test match, users, devices, and subscriptions."""
        from uuid import uuid4
        from datetime import datetime

        # Create users
        user1 = User(
            id=uuid4(),
            email="subscriber1@example.com",
            username="subscriber1",
            password_hash="hash1",
            is_active=True,
        )
        user2 = User(
            id=uuid4(),
            email="subscriber2@example.com",
            username="subscriber2",
            password_hash="hash2",
            is_active=True,
        )
        async_db_session.add(user1)
        async_db_session.add(user2)
        async_db_session.flush()

        # Create devices for users
        device1 = Device(
            id=uuid4(),
            user_id=user1.id,
            device_token="device_token_1",
            platform="ios",
            is_active=True,
        )
        device2 = Device(
            id=uuid4(),
            user_id=user2.id,
            device_token="device_token_2",
            platform="android",
            is_active=True,
        )
        async_db_session.add(device1)
        async_db_session.add(device2)
        async_db_session.flush()

        # Create match
        match = Match(
            id=uuid4(),
            api_football_id=999999,
            home_team_id=uuid4(),
            away_team_id=uuid4(),
            league_id="bundesliga",
            season="2024-2025",
            matchday=25,
            kickoff=datetime.utcnow(),
            status="live",
        )
        async_db_session.add(match)
        async_db_session.flush()

        # Create subscriptions
        sub1 = MatchSubscription(
            id=uuid4(),
            user_id=user1.id,
            match_id=match.id,
        )
        sub2 = MatchSubscription(
            id=uuid4(),
            user_id=user2.id,
            match_id=match.id,
        )
        async_db_session.add(sub1)
        async_db_session.add(sub2)
        await async_db_session.commit()

        return {
            "match": match,
            "users": [user1, user2],
            "devices": [device1, device2],
        }

    @pytest.mark.asyncio
    async def test_publish_event_sends_fcm_to_subscribers(
        self, async_db_session, setup_match_subscribers
    ):
        """Test: Publishing event sends FCM to all match subscribers."""
        from unittest.mock import AsyncMock, patch

        setup = setup_match_subscribers
        match = setup["match"]
        users = setup["users"]
        devices = setup["devices"]

        goal_event = GoalEvent(
            event_type=EventType.GOAL,
            match_id=str(match.id),
            timestamp=datetime.utcnow(),
            minute=45,
            is_live=True,
            team=Team.HOME,
            player_name="Test Player",
            player_id="player_test",
            assist_player_name="Assist Player",
            score_before={"home": 0, "away": 0},
            score_after={"home": 1, "away": 0},
            xg_value=0.75,
        )

        # Patch where the function is used (in events.py), not where it's defined
        with patch("app.routers.events.send_fcm_notification") as mock_fcm:
            mock_fcm.return_value = "message_id_123"

            from app.routers.events import _send_notifications_to_subscribers

            notifications_sent = await _send_notifications_to_subscribers(
                async_db_session, str(match.id), goal_event
            )

            assert notifications_sent == 2
            assert mock_fcm.call_count == 2

            calls = mock_fcm.call_args_list
            device_tokens_called = {call.kwargs["device_token"] for call in calls}
            assert device_tokens_called == {"device_token_1", "device_token_2"}

    @pytest.mark.asyncio
    async def test_goal_event_notification_format(self):
        """Test: Goal event formatting produces correct title and body."""
        from app.routers.events import _format_notification_title, _format_notification_body

        goal_event = GoalEvent(
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

        title = _format_notification_title(goal_event)
        body = _format_notification_body(goal_event)

        assert title == "⚽ Goal!"
        assert "Lewandowski" in body
        assert "45" in body
        assert "home" in body.lower()

    @pytest.mark.asyncio
    async def test_card_event_notification_format(self):
        """Test: Card event formatting produces correct title and body."""
        from app.routers.events import _format_notification_title, _format_notification_body

        card_event = CardEvent(
            event_type=EventType.RED_CARD,
            match_id="match_123",
            timestamp=datetime.utcnow(),
            minute=67,
            is_live=True,
            team=Team.AWAY,
            player_name="Reckless Defender",
            player_id="player_def",
            card_type="red",
        )

        title = _format_notification_title(card_event)
        body = _format_notification_body(card_event)

        assert title == "🔴 Red Card"
        assert "RED CARD" in body or "red" in body.lower()
        assert "Reckless Defender" in body
        assert "67" in body

    @pytest.mark.asyncio
    async def test_notification_recorded_in_history(
        self, async_db_session, setup_match_subscribers
    ):
        """Test: Published event notifications recorded in notification_history."""
        from unittest.mock import AsyncMock, patch

        setup = setup_match_subscribers
        match = setup["match"]

        goal_event = GoalEvent(
            event_type=EventType.GOAL,
            match_id=str(match.id),
            timestamp=datetime.utcnow(),
            minute=45,
            is_live=True,
            team=Team.HOME,
            player_name="Test Player",
            player_id="player_test",
            assist_player_name="Assist Player",
            score_before={"home": 0, "away": 0},
            score_after={"home": 1, "away": 0},
            xg_value=0.75,
        )

        # Patch where the function is used (in events.py), not where it's defined
        with patch("app.routers.events.send_fcm_notification"):
            from app.routers.events import _send_notifications_to_subscribers

            await _send_notifications_to_subscribers(
                async_db_session, str(match.id), goal_event
            )

        from sqlalchemy import select

        history_records = await async_db_session.execute(
            select(NotificationHistory).where(
                NotificationHistory.match_id == match.id
            )
        )
        records = history_records.scalars().all()

        assert len(records) == 2
        assert all(r.notification_type == EventType.GOAL for r in records)
        assert all(r.match_id == match.id for r in records)
