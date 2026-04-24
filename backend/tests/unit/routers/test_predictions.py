"""Unit tests for predictions router."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from app.models.schemas import PredictionResponse


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


class TestPredictionsRouter:
    """Test predictions endpoints."""

    def test_get_prediction_success(self, client, auth_headers, db_match):
        """Test successful prediction fetch."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "home_win_prob" in data
        assert "draw_prob" in data
        assert "away_win_prob" in data
        assert "confidence" in data
        assert 0 <= data["home_win_prob"] <= 1
        assert 0 <= data["draw_prob"] <= 1
        assert 0 <= data["away_win_prob"] <= 1

    def test_get_prediction_match_not_found(self, client, auth_headers):
        """Test prediction fetch for non-existent match."""
        response = client.get(
            "/api/v1/predictions/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_get_prediction_unauthorized(self, client, db_match):
        """Test prediction fetch without auth."""
        response = client.get(f"/api/v1/predictions/{db_match.id}")
        assert response.status_code == 401

    def test_get_value_bets_success(self, client, auth_headers):
        """Test value bets endpoint returns array."""
        response = client.get(
            "/api/v1/predictions/value-bets",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data.get("value_bets"), list)

    def test_get_value_bets_with_min_edge_filter(self, client, auth_headers):
        """Test value bets endpoint with edge filter."""
        response = client.get(
            "/api/v1/predictions/value-bets?min_edge=10",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        for bet in data.get("value_bets", []):
            assert bet["edge_percent"] >= 10

    def test_simulate_prediction_success(self, client, auth_headers):
        """Test prediction simulation."""
        response = client.post(
            "/api/v1/predictions/simulate",
            headers=auth_headers,
            json={"home_team": "Bayern Munich", "away_team": "Borussia Dortmund"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "home_win_prob" in data
        assert "draw_prob" in data
        assert "away_win_prob" in data

    def test_simulate_prediction_invalid_teams(self, client, auth_headers):
        """Test prediction simulation with invalid teams."""
        response = client.post(
            "/api/v1/predictions/simulate",
            headers=auth_headers,
            json={"home_team": "", "away_team": ""},
        )
        assert response.status_code == 400

    def test_get_team_strength_success(self, client, auth_headers):
        """Test team strength endpoint."""
        response = client.get(
            "/api/v1/predictions/team-strength/FCB",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "attack_rating" in data or "elo_rating" in data

    def test_get_model_comparison_success(self, client, auth_headers, db_match):
        """Test model comparison endpoint."""
        response = client.get(
            f"/api/v1/predictions/match-comparison/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "poisson" in data or "ensemble" in data

    def test_prediction_probabilities_sum_to_one(self, client, auth_headers, db_match):
        """Test that probabilities sum to approximately 1."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        total_prob = (
            data["home_win_prob"] + data["draw_prob"] + data["away_win_prob"]
        )
        assert 0.99 <= total_prob <= 1.01  # Allow small rounding error

    def test_confidence_score_valid_range(self, client, auth_headers, db_match):
        """Test confidence score is between 0 and 1."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert 0 <= data["confidence"] <= 1

    def test_expected_goals_non_negative(self, client, auth_headers, db_match):
        """Test expected goals are non-negative."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("expected_goals_home", 0) >= 0
        assert data.get("expected_goals_away", 0) >= 0
