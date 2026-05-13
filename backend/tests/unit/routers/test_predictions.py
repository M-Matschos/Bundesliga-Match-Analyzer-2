"""Unit tests for predictions router."""

import pytest
from unittest.mock import patch, MagicMock


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
        assert isinstance(data, list)

    def test_get_value_bets_with_min_edge_filter(self, client, auth_headers):
        """Test value bets with minimum edge filter."""
        response = client.get(
            "/api/v1/predictions/value-bets?min_edge=0.05",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_simulate_prediction_success(self, client, auth_headers, db_team):
        """Test prediction simulation."""
        response = client.post(
            "/api/v1/predictions/simulate",
            headers=auth_headers,
            json={
                "home_team_id": str(db_team.id),
                "away_team_id": str(db_team.id),
            },
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
            json={
                "home_team_id": "invalid-id",
                "away_team_id": "invalid-id",
            },
        )
        assert response.status_code == 404

    def test_get_team_strength_success(self, client, auth_headers, db_team):
        """Test team strength endpoint."""
        response = client.get(
            f"/api/v1/predictions/team/{db_team.id}/strength",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "strength_index" in data or "strength" in data

    def test_get_model_comparison_success(self, client, auth_headers):
        """Test model comparison endpoint."""
        response = client.get(
            "/api/v1/predictions/models/comparison",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict) or isinstance(data, list)

    def test_prediction_probabilities_sum_to_one(self, client, auth_headers, db_match):
        """Test that prediction probabilities sum to 1."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        prob_sum = (
            data["home_win_prob"] + data["draw_prob"] + data["away_win_prob"]
        )
        assert 0.99 <= prob_sum <= 1.01  # Allow small float rounding error

    def test_confidence_score_valid_range(self, client, auth_headers, db_match):
        """Test that confidence score is in valid range."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert 0 <= data["confidence"] <= 1

    def test_expected_goals_non_negative(self, client, auth_headers, db_match):
        """Test that expected goals are non-negative."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        if "expected_goals_home" in data:
            assert data["expected_goals_home"] >= 0
        if "expected_goals_away" in data:
            assert data["expected_goals_away"] >= 0
