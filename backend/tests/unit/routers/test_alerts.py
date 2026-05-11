"""Tests for alerts router endpoint URL correctness."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


class TestAlertsRouterPrefix:
    """Verify alerts router endpoints are at correct URL prefix."""

    def test_alerts_endpoint_exists_at_correct_prefix(self):
        """Verify /api/v1/alerts/feed endpoint exists (not /api/v1/alerts/api/v1/alerts/feed)."""
        # This request should reach the alerts router, not 404
        # We expect 401/403 due to auth, not 404 due to wrong path
        response = client.get("/api/v1/alerts/feed")

        # Should NOT be 404 (which would indicate wrong prefix)
        assert response.status_code != 404, \
            f"GET /api/v1/alerts/feed returned 404 - prefix may be duplicated"

        # Expected: 401/403 (auth error) or 200 (if endpoint exists and auth passes)
        assert response.status_code in [200, 401, 403, 422]

    def test_alerts_wrong_prefix_returns_404(self):
        """Verify doubled prefix would return 404."""
        # This verifies that /api/v1/alerts/api/v1/alerts DOESN'T exist
        response = client.get("/api/v1/alerts/api/v1/alerts")
        assert response.status_code == 404, \
            "Doubled prefix endpoint should not exist"

    def test_alerts_single_prefix_correct(self):
        """Verify single /api/v1/alerts prefix works for stats endpoint."""
        # Test a real alerts endpoint
        response = client.get("/api/v1/alerts/stats")
        # Should not be 404 due to prefix mismatch
        assert response.status_code != 404
