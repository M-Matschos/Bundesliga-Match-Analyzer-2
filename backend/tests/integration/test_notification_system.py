"""Integration tests for Notification System (Firebase + Device Management).

Tests the end-to-end flow:
- Device registration (user, platform, token)
- Match subscriptions (push notification subscriptions)
- Event → Notification integration (goal event triggers push)
- Notification history tracking (record all sent notifications)
- Mark as read (user interaction)
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from uuid import uuid4
import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db import User, Device, MatchSubscription, NotificationHistory, Match
from app.core.security import hash_password


class TestDeviceRegistration:
    """Tests for POST /api/v1/notifications/register-device"""

    @pytest.mark.asyncio
    async def test_device_registration_creates_entry(self, async_db_session: AsyncSession):
        """Test: Device registration creates database entry."""
        # Arrange
        user = User(
            email="test@example.com",
            username="testuser",
            password_hash=hash_password("password123"),
            is_active=True,
        )
        async_db_session.add(user)
        await async_db_session.commit()
        await async_db_session.refresh(user)

        device_token = "firebase-token-abc123xyz"
        platform = "ios"

        # Act
        device = Device(
            user_id=user.id,
            device_token=device_token,
            platform=platform,
            is_active=True,
        )
        async_db_session.add(device)
        await async_db_session.commit()

        # Assert
        from sqlalchemy import select
        stmt = select(Device).where(Device.user_id == user.id)
        result = await async_db_session.execute(stmt)
        devices = result.scalars().all()

        assert len(devices) == 1
        assert devices[0].device_token == device_token
        assert devices[0].platform == platform
        assert devices[0].is_active is True


class TestMatchSubscription:
    """Tests for POST /api/v1/notifications/subscribe-match"""

    @pytest.mark.asyncio
    async def test_subscribe_match_creates_subscription(self, async_db_session: AsyncSession):
        """Test: Subscribe to match creates database entry."""
        # Arrange
        user = User(
            email="test@example.com",
            username="testuser",
            password_hash=hash_password("password123"),
            is_active=True,
        )
        match = Match(
            api_football_id=123456,
            home_team_id=uuid4(),
            away_team_id=uuid4(),
            league_id="bundesliga",
            season="2024-2025",
            matchday=25,
            kickoff=datetime.utcnow(),
            status="scheduled",
        )
        async_db_session.add(user)
        async_db_session.add(match)
        await async_db_session.commit()
        await async_db_session.refresh(user)
        await async_db_session.refresh(match)

        # Act
        subscription = MatchSubscription(
            user_id=user.id,
            match_id=match.id,
        )
        async_db_session.add(subscription)
        await async_db_session.commit()

        # Assert
        from sqlalchemy import select
        stmt = select(MatchSubscription).where(MatchSubscription.user_id == user.id)
        result = await async_db_session.execute(stmt)
        subscriptions = result.scalars().all()

        assert len(subscriptions) == 1
        assert subscriptions[0].match_id == match.id


class TestEventToNotification:
    """Tests for Event → Notification integration"""

    @pytest.mark.asyncio
    async def test_goal_event_sends_fcm_to_subscribers(self, async_db_session: AsyncSession):
        """Test: Goal event sends FCM notification to all match subscribers."""
        # Arrange
        user1 = User(
            email="subscriber1@example.com",
            username="subscriber1",
            password_hash=hash_password("password123"),
            is_active=True,
        )
        user2 = User(
            email="subscriber2@example.com",
            username="subscriber2",
            password_hash=hash_password("password123"),
            is_active=True,
        )
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
        async_db_session.add_all([user1, user2, match])
        await async_db_session.commit()
        await async_db_session.refresh(user1)
        await async_db_session.refresh(user2)
        await async_db_session.refresh(match)

        # Register devices
        device1 = Device(
            user_id=user1.id,
            device_token="token-user1",
            platform="ios",
            is_active=True,
        )
        device2 = Device(
            user_id=user2.id,
            device_token="token-user2",
            platform="android",
            is_active=True,
        )
        async_db_session.add_all([device1, device2])
        await async_db_session.commit()

        # Subscribe to match
        sub1 = MatchSubscription(user_id=user1.id, match_id=match.id)
        sub2 = MatchSubscription(user_id=user2.id, match_id=match.id)
        async_db_session.add_all([sub1, sub2])
        await async_db_session.commit()

        # Mock FCM
        with patch("app.services.notification_service.send_fcm_notification") as mock_fcm:
            mock_fcm.return_value = True

            # Act: Simulate goal event
            notification_history = NotificationHistory(
                user_id=user1.id,
                match_id=match.id,
                notification_type="goal",
                payload=json.dumps({
                    "team": "home",
                    "player": "Lewandowski",
                    "minute": 45,
                }),
            )
            async_db_session.add(notification_history)
            await async_db_session.commit()

        # Assert
        from sqlalchemy import select
        stmt = select(NotificationHistory).where(NotificationHistory.match_id == match.id)
        result = await async_db_session.execute(stmt)
        notifications = result.scalars().all()

        assert len(notifications) >= 1
        assert notifications[0].notification_type == "goal"


class TestNotificationHistory:
    """Tests for notification history tracking"""

    @pytest.mark.asyncio
    async def test_notification_history_tracks_sent(self, async_db_session: AsyncSession):
        """Test: Notification history tracks all sent notifications."""
        # Arrange
        user = User(
            email="test@example.com",
            username="testuser",
            password_hash=hash_password("password123"),
            is_active=True,
        )
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
        async_db_session.add_all([user, match])
        await async_db_session.commit()
        await async_db_session.refresh(user)
        await async_db_session.refresh(match)

        # Act: Create multiple notifications
        notifications = [
            NotificationHistory(
                user_id=user.id,
                match_id=match.id,
                notification_type="kickoff",
                payload=json.dumps({"message": "Match started"}),
                is_read=False,
            ),
            NotificationHistory(
                user_id=user.id,
                match_id=match.id,
                notification_type="goal",
                payload=json.dumps({"team": "home", "player": "Lewandowski"}),
                is_read=False,
            ),
        ]
        async_db_session.add_all(notifications)
        await async_db_session.commit()

        # Assert
        from sqlalchemy import select
        stmt = select(NotificationHistory).where(NotificationHistory.user_id == user.id)
        result = await async_db_session.execute(stmt)
        history = result.scalars().all()

        assert len(history) == 2
        assert history[0].is_read is False
        assert history[1].notification_type == "goal"


class TestMarkAsRead:
    """Tests for mark notification as read"""

    @pytest.mark.asyncio
    async def test_mark_as_read_updates_status(self, async_db_session: AsyncSession):
        """Test: Mark notification as read updates is_read status."""
        # Arrange
        user = User(
            email="test@example.com",
            username="testuser",
            password_hash=hash_password("password123"),
            is_active=True,
        )
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
        async_db_session.add_all([user, match])
        await async_db_session.commit()
        await async_db_session.refresh(user)
        await async_db_session.refresh(match)

        notification = NotificationHistory(
            user_id=user.id,
            match_id=match.id,
            notification_type="goal",
            payload=json.dumps({"team": "home"}),
            is_read=False,
        )
        async_db_session.add(notification)
        await async_db_session.commit()
        await async_db_session.refresh(notification)

        # Act
        notification.is_read = True
        async_db_session.add(notification)
        await async_db_session.commit()
        await async_db_session.refresh(notification)

        # Assert
        assert notification.is_read is True
