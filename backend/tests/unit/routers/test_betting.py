"""Unit tests for virtual betting router."""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client, db_user):
    """Get JWT auth headers for test user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": db_user.email, "password": "test_password_123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestBettingRouter:
    """Test virtual betting endpoints."""

    def test_place_bet_success(self, client, auth_headers, db_match):
        """Test successful bet placement."""
        response = client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": str(db_match.id),
                "bet_type": "home_win",
                "odds": 1.95,
                "amount": 100.0,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["match_id"] == str(db_match.id)
        assert data["bet_type"] == "home_win"
        assert data["odds"] == 1.95
        assert data["amount"] == 100.0
        assert data["status"] == "pending"

    def test_place_bet_invalid_bet_type(self, client, auth_headers, db_match):
        """Test bet placement with invalid bet type."""
        response = client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": str(db_match.id),
                "bet_type": "invalid_bet",
                "odds": 1.95,
                "amount": 100.0,
            },
        )
        assert response.status_code == 400

    def test_place_bet_match_already_started(self, client, auth_headers):
        """Test bet placement on match that already started."""
        # Create match with status != "scheduled"
        # This test requires a fixture for non-scheduled match
        pass

    def test_place_bet_negative_odds(self, client, auth_headers, db_match):
        """Test bet placement with invalid odds."""
        response = client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": str(db_match.id),
                "bet_type": "home_win",
                "odds": -1.95,
                "amount": 100.0,
            },
        )
        assert response.status_code == 422  # Validation error

    def test_place_bet_unauthorized(self, client, db_match):
        """Test bet placement without auth."""
        response = client.post(
            "/api/v1/virtual-bets",
            params={
                "match_id": str(db_match.id),
                "bet_type": "home_win",
                "odds": 1.95,
                "amount": 100.0,
            },
        )
        assert response.status_code == 401

    def test_get_user_bets_success(self, client, auth_headers, db_user_bet):
        """Test getting user's bets."""
        response = client.get(
            "/api/v1/virtual-bets",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "bets" in data
        assert isinstance(data["bets"], list)

    def test_get_user_bets_filter_pending(self, client, auth_headers):
        """Test getting user's bets filtered by pending status."""
        response = client.get(
            "/api/v1/virtual-bets?status=pending",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        for bet in data.get("bets", []):
            assert bet["status"] == "pending"

    def test_get_user_bets_filter_invalid_status(self, client, auth_headers):
        """Test filtering with invalid status."""
        response = client.get(
            "/api/v1/virtual-bets?status=invalid",
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_get_bet_detail_success(self, client, auth_headers, db_user_bet):
        """Test getting single bet details."""
        response = client.get(
            f"/api/v1/virtual-bets/{db_user_bet.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["bet_id"] == str(db_user_bet.id)
        assert "match" in data
        assert data["odds"] == db_user_bet.odds

    def test_get_bet_detail_not_found(self, client, auth_headers):
        """Test getting non-existent bet."""
        response = client.get(
            "/api/v1/virtual-bets/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_get_bet_detail_other_user(self, client, db_user_bet, db_other_user):
        """Test getting another user's bet (should fail)."""
        # Login as different user
        response = client.post(
            "/api/v1/auth/login",
            json={"email": db_other_user.email, "password": "test_password_123"},
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Try to access first user's bet
        response = client.get(
            f"/api/v1/virtual-bets/{db_user_bet.id}",
            headers=headers,
        )
        assert response.status_code == 404

    def test_get_portfolio_stats_success(self, client, auth_headers):
        """Test portfolio statistics endpoint."""
        response = client.get(
            "/api/v1/virtual-bets/statistics/portfolio",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_bets" in data
        assert "stats" in data
        assert "total_staked" in data["stats"]
        assert "win_rate" in data["stats"]
        assert "roi" in data["stats"]

    def test_portfolio_stats_empty_user(self, client, auth_headers):
        """Test portfolio stats for user with no bets."""
        response = client.get(
            "/api/v1/virtual-bets/statistics/portfolio",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_bets"] >= 0

    def test_cancel_bet_success(self, client, auth_headers, db_user_bet):
        """Test canceling a pending bet."""
        response = client.post(
            f"/api/v1/virtual-bets/{db_user_bet.id}/cancel",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "void"

    def test_cancel_bet_already_settled(self, client, auth_headers, db_settled_bet):
        """Test canceling a settled bet (should fail)."""
        response = client.post(
            f"/api/v1/virtual-bets/{db_settled_bet.id}/cancel",
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_cancel_bet_not_found(self, client, auth_headers):
        """Test canceling non-existent bet."""
        response = client.post(
            "/api/v1/virtual-bets/00000000-0000-0000-0000-000000000000/cancel",
            headers=auth_headers,
        )
        assert response.status_code == 404
