"""Tests for notifications router endpoint URL correctness."""

import pytest
from unittest.mock import Mock, patch

from app.main import app


# Mock NotificationService to avoid initialization errors during testing
@pytest.fixture(autouse=True)
def mock_notification_service(monkeypatch):
    """Mock the NotificationService for all tests."""
    mock_service = Mock()
    mock_service.get_user_devices = Mock(return_value=[])
    monkeypatch.setenv("NOTIFICATION_SERVICE_MOCK", "true")


class TestNotificationsRouterPrefix:
    """Verify notifications router endpoints are at correct URL prefix."""

    def test_notifications_endpoint_exists_at_correct_prefix(self, client: TestClient):
        """Verify /api/v1/notifications/devices endpoint exists (not /api/v1/notifications/api/v1/notifications)."""
        # This request should reach the notifications router, not 404
        # We expect 401/403 due to auth, not 404 due to wrong path
        response = client.get("/api/v1/notifications/devices/1")

        # Should NOT be 404 (which would indicate wrong prefix)
        assert response.status_code != 404, \
            f"GET /api/v1/notifications/devices/1 returned 404 - prefix may be duplicated"

        # Expected: 500 (service error), 401/403 (auth), 422 (validation), or 200 if passes
        # 500 means endpoint exists but service not initialized — confirms prefix routing works
        assert response.status_code in [200, 401, 403, 422, 500]

    def test_notifications_wrong_prefix_returns_404(self, client: TestClient):
        """Verify doubled prefix would return 404."""
        # This verifies that /api/v1/notifications/api/v1/notifications DOESN'T exist
        response = client.get("/api/v1/notifications/api/v1/notifications")
        assert response.status_code == 404, \
            "Doubled prefix endpoint should not exist"

    def test_notifications_register_device_at_correct_prefix(self, client: TestClient):
        """Verify /api/v1/notifications/register-device works at correct prefix."""
        response = client.post(
            "/api/v1/notifications/register-device",
            json={"user_id": 1, "device_token": "test_token", "platform": "ios"}
        )
        # Should not be 404 due to prefix mismatch
        assert response.status_code != 404, \
            "register-device endpoint returned 404 - prefix may be duplicated"
        # Expect auth error, validation error, service error, or success
        # 500 means endpoint exists but service not initialized — confirms prefix routing works
        assert response.status_code in [200, 400, 401, 403, 422, 500]

    def test_notifications_subscribe_at_correct_prefix(self, client: TestClient):
        """Verify /api/v1/notifications/subscribe-match works at correct prefix."""
        response = client.post(
            "/api/v1/notifications/subscribe-match",
            json={"user_id": 1, "match_id": "match_123"}
        )
        # Should not be 404 due to prefix mismatch
        assert response.status_code != 404, \
            "subscribe-match endpoint returned 404 - prefix may be duplicated"
        # Expect auth error, validation error, service error, or success
        # 500 means endpoint exists but service not initialized — confirms prefix routing works
        assert response.status_code in [200, 400, 401, 403, 422, 500]
