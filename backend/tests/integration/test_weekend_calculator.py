"""Integration tests for weekend calculator."""

import pytest
import asyncio
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client, db_user):
    """Get JWT auth headers."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": db_user.email, "password": "test_password_123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestWeekendCalculator:
    """Integration tests for weekend calculation flow."""

    def test_weekend_calculation_e2e(self, client, auth_headers):
        """Test complete weekend calculation flow."""
        # 1. Start calculation
        response = client.post(
            "/api/v1/weekend/calculate",
            headers=auth_headers,
            json={"leagues": ["bundesliga"], "simulations": 100},
        )
        assert response.status_code == 202
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "calculating"
        assert data["total_matches"] > 0
        job_id = data["job_id"]

        # 2. Poll for results (with timeout)
        max_attempts = 60  # 60 seconds with 1 second intervals
        attempt = 0
        results = None
        while attempt < max_attempts:
            response = client.get(
                f"/api/v1/weekend/results/{job_id}",
                headers=auth_headers,
            )
            assert response.status_code == 200
            data = response.json()

            if data["status"] == "completed":
                results = data
                break
            elif data["status"] == "error":
                pytest.fail(f"Calculation error: {data.get('error')}")

            asyncio.run(asyncio.sleep(0.1))
            attempt += 1

        # 3. Verify results
        assert results is not None
        assert results["status"] == "completed"
        assert len(results["matches"]) > 0

        # Verify match structure
        for match in results["matches"]:
            assert "match_id" in match
            assert "home_team" in match
            assert "away_team" in match
            assert "prediction" in match
            prediction = match["prediction"]
            assert "home_win" in prediction
            assert "draw" in prediction
            assert "away_win" in prediction
            assert 0 <= prediction["confidence"] <= 1

        # 4. Verify summary
        assert "summary" in results
        summary = results["summary"]
        assert summary["total_matches"] == len(results["matches"])
        assert summary["high_confidence"] >= 0
        assert summary["value_bets_found"] >= 0

    def test_weekend_calculation_multiple_leagues(self, client, auth_headers):
        """Test calculation with multiple leagues."""
        response = client.post(
            "/api/v1/weekend/calculate",
            headers=auth_headers,
            json={
                "leagues": ["bundesliga", "bundesliga2"],
                "simulations": 50,
            },
        )
        assert response.status_code == 202
        data = response.json()
        job_id = data["job_id"]

        # Wait for completion
        for _ in range(60):
            response = client.get(
                f"/api/v1/weekend/results/{job_id}",
                headers=auth_headers,
            )
            data = response.json()
            if data["status"] == "completed":
                break
            asyncio.run(asyncio.sleep(0.1))

        assert data["status"] == "completed"
        # Should have matches from both leagues
        assert len(data["matches"]) > 0

    def test_weekend_calculation_invalid_league(self, client, auth_headers):
        """Test calculation with invalid league."""
        response = client.post(
            "/api/v1/weekend/calculate",
            headers=auth_headers,
            json={"leagues": ["invalid_league"]},
        )
        # Should either fail validation or return empty results
        assert response.status_code in [400, 202]

    def test_get_next_weekend(self, client, auth_headers):
        """Test getting next weekend's matches."""
        response = client.get(
            "/api/v1/weekend/next",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data or "job_id" in data

    def test_get_matchday(self, client, auth_headers):
        """Test getting specific matchday."""
        response = client.get(
            "/api/v1/weekend/matchday/bundesliga/28",
            headers=auth_headers,
        )
        # Should return results or 404 if matchday doesn't exist
        assert response.status_code in [200, 404]

    def test_calculation_performance(self, client, auth_headers):
        """Test that calculation completes within time limit."""
        import time

        start = time.time()

        response = client.post(
            "/api/v1/weekend/calculate",
            headers=auth_headers,
            json={"leagues": ["bundesliga"], "simulations": 100},
        )
        assert response.status_code == 202
        job_id = response.json()["job_id"]

        # Poll for completion with timeout
        timeout = 30  # 30 second timeout for small calculation
        while time.time() - start < timeout:
            response = client.get(
                f"/api/v1/weekend/results/{job_id}",
                headers=auth_headers,
            )
            data = response.json()

            if data["status"] == "completed":
                duration = time.time() - start
                # Should complete in reasonable time (adjust threshold as needed)
                assert duration < 30, f"Calculation took {duration:.1f}s (timeout: 30s)"
                return

            asyncio.run(asyncio.sleep(0.1))

        pytest.fail(f"Calculation did not complete within {timeout}s")

    def test_calculation_result_consistency(self, client, auth_headers):
        """Test that predictions are reasonable and consistent."""
        response = client.post(
            "/api/v1/weekend/calculate",
            headers=auth_headers,
            json={"leagues": ["bundesliga"], "simulations": 100},
        )
        job_id = response.json()["job_id"]

        # Wait for completion
        for _ in range(60):
            response = client.get(
                f"/api/v1/weekend/results/{job_id}",
                headers=auth_headers,
            )
            data = response.json()
            if data["status"] == "completed":
                break
            asyncio.run(asyncio.sleep(0.1))

        # Verify all matches have valid predictions
        for match in data["matches"]:
            pred = match["prediction"]
            # Probabilities should sum to ~1
            total = pred["home_win"] + pred["draw"] + pred["away_win"]
            assert 0.99 <= total <= 1.01

            # Confidence should be valid
            assert 0 <= pred["confidence"] <= 1

            # Expected goals should be non-negative
            assert pred.get("expected_goals_home", 0) >= 0
            assert pred.get("expected_goals_away", 0) >= 0
