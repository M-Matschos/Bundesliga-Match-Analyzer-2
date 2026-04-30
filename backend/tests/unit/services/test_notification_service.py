"""
Unit Tests für Notification Service
Testet Firebase Cloud Messaging Integration und Notification-Verwaltung
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.services.notification_service import NotificationService
from app.models.notification import (
    DeviceToken,
    NotificationHistory,
    PushNotificationRequest,
)


@pytest.fixture
def mock_db():
    """Mock Database Connection Pool"""
    return AsyncMock()


@pytest.fixture
def notification_service(mock_db):
    """Erstelle NotificationService für Tests (ohne Firebase)"""
    service = NotificationService(db=mock_db, firebase_credentials_path=None)
    return service


class TestNotificationServiceDeviceManagement:
    """Tests für Device-Registrierung und -Verwaltung"""

    @pytest.mark.asyncio
    async def test_register_device(self, notification_service, mock_db):
        """Test Device-Registrierung"""
        user_id = 42
        device_token = "token_test_abc123xyz"
        platform = "ios"

        mock_db.execute = AsyncMock()

        await notification_service.register_device(
            user_id=user_id,
            device_token=device_token,
            platform=platform,
        )

        mock_db.execute.assert_called_once()
        call_args = mock_db.execute.call_args
        assert "device_tokens" in call_args[0][0].lower()
        assert user_id in call_args[0]
        assert device_token in call_args[0]
        assert platform in call_args[0]

    @pytest.mark.asyncio
    async def test_register_device_duplicate(self, notification_service, mock_db):
        """Test Gerät-Registrierung mit ON CONFLICT (Update)"""
        user_id = 42
        device_token = "token_existing"
        platform = "android"

        mock_db.execute = AsyncMock()

        await notification_service.register_device(
            user_id=user_id,
            device_token=device_token,
            platform=platform,
        )

        call_sql = mock_db.execute.call_args[0][0]
        assert "ON CONFLICT" in call_sql.upper()
        assert "UPDATE" in call_sql.upper()

    @pytest.mark.asyncio
    async def test_unregister_device(self, notification_service, mock_db):
        """Test Device-Deregistrierung"""
        device_token = "token_to_remove"

        mock_db.execute = AsyncMock()

        await notification_service.unregister_device(device_token=device_token)

        mock_db.execute.assert_called_once()
        call_args = mock_db.execute.call_args
        assert "DELETE" in call_args[0][0].upper()
        assert "device_tokens" in call_args[0][0].lower()
        assert device_token in call_args[0]

    @pytest.mark.asyncio
    async def test_get_user_devices(self, notification_service, mock_db):
        """Test Abrufen von Benutzer-Geräten"""
        user_id = 42
        mock_devices = [
            {
                "user_id": 42,
                "device_token": "token_ios_1",
                "platform": "ios",
                "created_at": "2026-04-28T10:00:00+00:00",
                "updated_at": "2026-04-28T10:00:00+00:00",
            },
            {
                "user_id": 42,
                "device_token": "token_android_1",
                "platform": "android",
                "created_at": "2026-04-27T10:00:00+00:00",
                "updated_at": "2026-04-28T09:00:00+00:00",
            },
        ]

        mock_db.fetch = AsyncMock(return_value=mock_devices)

        result = await notification_service.get_user_devices(user_id=user_id)

        assert len(result) == 2
        assert result[0].platform == "ios"
        assert result[1].platform == "android"
        mock_db.fetch.assert_called_once()


class TestNotificationServiceSubscriptions:
    """Tests für Match-Subscriptions"""

    @pytest.mark.asyncio
    async def test_subscribe_to_match(self, notification_service, mock_db):
        """Test Match-Abonnement"""
        user_id = 42
        match_id = 1

        mock_db.execute = AsyncMock()

        await notification_service.subscribe_to_match(
            user_id=user_id,
            match_id=match_id,
        )

        mock_db.execute.assert_called_once()
        call_args = mock_db.execute.call_args
        assert "notification_subscriptions" in call_args[0][0].lower()
        assert "INSERT" in call_args[0][0].upper()
        assert user_id in call_args[0]
        assert match_id in call_args[0]

    @pytest.mark.asyncio
    async def test_unsubscribe_from_match(self, notification_service, mock_db):
        """Test Match-Abmeldung"""
        user_id = 42
        match_id = 1

        mock_db.execute = AsyncMock()

        await notification_service.unsubscribe_from_match(
            user_id=user_id,
            match_id=match_id,
        )

        mock_db.execute.assert_called_once()
        call_args = mock_db.execute.call_args
        assert "DELETE" in call_args[0][0].upper()
        assert user_id in call_args[0]
        assert match_id in call_args[0]


class TestNotificationServiceHistory:
    """Tests für Notification-Verlauf"""

    @pytest.mark.asyncio
    async def test_get_notification_history(self, notification_service, mock_db):
        """Test Abrufen von Benachrichtigungs-Verlauf"""
        user_id = 42
        limit = 50
        mock_records = [
            {
                "id": 1,
                "user_id": 42,
                "match_id": 1,
                "event_type": "goal",
                "title": "⚽ GOAL",
                "body": "Bayern goal by Lewandowski (45')",
                "sent_at": "2026-04-28T14:30:00+00:00",
                "read_at": None,
            },
            {
                "id": 2,
                "user_id": 42,
                "match_id": 1,
                "event_type": "yellow_card",
                "title": "🟨 YELLOW CARD",
                "body": "Yellow card for Goretzka (67')",
                "sent_at": "2026-04-28T14:42:00+00:00",
                "read_at": "2026-04-28T14:43:00+00:00",
            },
        ]

        mock_db.fetch = AsyncMock(return_value=mock_records)

        result = await notification_service.get_notification_history(
            user_id=user_id,
            limit=limit,
        )

        assert len(result) == 2
        assert result[0].title == "⚽ GOAL"
        assert result[1].read_at is not None
        assert result[0].read_at is None

    @pytest.mark.asyncio
    async def test_mark_notification_as_read(self, notification_service, mock_db):
        """Test Markieren von Benachrichtigung als gelesen"""
        notification_id = 1

        mock_db.execute = AsyncMock()

        await notification_service.mark_notification_as_read(
            notification_id=notification_id
        )

        mock_db.execute.assert_called_once()
        call_args = mock_db.execute.call_args
        assert "UPDATE" in call_args[0][0].upper()
        assert "read_at" in call_args[0][0].lower()
        assert notification_id in call_args[0]


class TestNotificationServicePushNotifications:
    """Tests für Push-Benachrichtigungen"""

    @pytest.mark.asyncio
    async def test_send_push_notification_without_firebase(
        self, notification_service
    ):
        """Test Push-Benachrichtigung ohne Firebase (Test-Mode)"""
        device_token = "test_token"
        title = "⚽ GOAL"
        body = "Test goal notification"

        result = await notification_service.send_push_notification(
            device_token=device_token,
            title=title,
            body=body,
        )

        assert result is None  # Firebase nicht initialisiert

    @pytest.mark.asyncio
    async def test_send_match_event_notification(self, notification_service, mock_db):
        """Test Match-Event-Benachrichtigung an mehrere Abonnenten"""
        match_id = 1
        event_type = "goal"
        event_data = {
            "match_id": 1,
            "player_name": "Lewandowski",
            "team_name": "Bayern Munich",
            "minute": "45",
        }

        mock_subscriptions = [
            {
                "user_id": 42,
                "device_token": "token_ios_1",
                "platform": "ios",
            },
            {
                "user_id": 43,
                "device_token": "token_android_1",
                "platform": "android",
            },
        ]

        mock_db.fetch = AsyncMock(return_value=mock_subscriptions)
        mock_db.execute = AsyncMock()

        result = await notification_service.send_match_event_notification(
            match_id=match_id,
            event_type=event_type,
            event_data=event_data,
        )

        assert mock_db.fetch.called
        # Mit Circuit-Breaker: Firebase-Fehler → Fallback zu Queue → 2 queued
        assert result == 2  # 2 Abonnenten, beide in Queue (Firebase nicht initialisiert)


class TestNotificationServiceEventFormatting:
    """Tests für Event-Formatierung"""

    def test_format_event_title_goal(self, notification_service):
        """Test Titel-Formatierung für Goal"""
        event_data = {"match_id": 1}
        title = notification_service._format_event_title("goal", event_data)
        assert "⚽" in title
        assert "GOAL" in title
        assert "1" in title

    def test_format_event_title_yellow_card(self, notification_service):
        """Test Titel-Formatierung für Yellow Card"""
        event_data = {"match_id": 2}
        title = notification_service._format_event_title("yellow_card", event_data)
        assert "🟨" in title
        assert "YELLOW" in title

    def test_format_event_body_goal(self, notification_service):
        """Test Body-Formatierung für Goal"""
        event_data = {
            "player_name": "Lewandowski",
            "team_name": "Bayern Munich",
            "minute": "45",
        }
        body = notification_service._format_event_body("goal", event_data)
        assert "Bayern Munich" in body
        assert "Lewandowski" in body
        assert "45" in body

    def test_format_event_body_unknown_type(self, notification_service):
        """Test Body-Formatierung für unbekannten Typ"""
        event_data = {}
        body = notification_service._format_event_body("custom_event", event_data)
        assert "Custom Event" in body


class TestNotificationServiceErrorHandling:
    """Tests für Fehlerbehandlung"""

    @pytest.mark.asyncio
    async def test_register_device_database_error(self, notification_service, mock_db):
        """Test Fehlerbehandlung bei DB-Fehler"""
        mock_db.execute = AsyncMock(side_effect=Exception("DB Error"))

        with pytest.raises(Exception):
            await notification_service.register_device(
                user_id=42,
                device_token="token",
                platform="ios",
            )

    @pytest.mark.asyncio
    async def test_get_notification_history_database_error(
        self, notification_service, mock_db
    ):
        """Test Fehlerbehandlung beim Abrufen der Historie"""
        mock_db.fetch = AsyncMock(side_effect=Exception("DB Error"))

        with pytest.raises(Exception):
            await notification_service.get_notification_history(user_id=42)
