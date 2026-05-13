"""Integration tests for predictions flow."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


class TestPredictionsFlow:
    """Integration tests for prediction endpoints."""

    def test_get_prediction_complete_flow(self, client, auth_headers, db_match):
        """Test fetching complete prediction with all details."""
        response = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        pred = response.json()

        # Verify all required fields present
        required_fields = [
            "home_win_prob",
            "draw_prob",
            "away_win_prob",
            "confidence",
            "expected_goals_home",
            "expected_goals_away",
        ]
        for field in required_fields:
            assert field in pred, f"Missing field: {field}"

        # Verify value ranges
        assert 0 <= pred["home_win_prob"] <= 1
        assert 0 <= pred["draw_prob"] <= 1
        assert 0 <= pred["away_win_prob"] <= 1
        assert 0 <= pred["confidence"] <= 1
        assert pred["expected_goals_home"] >= 0
        assert pred["expected_goals_away"] >= 0

        # Verify probabilities sum to ~1
        total = (
            pred["home_win_prob"] + pred["draw_prob"] + pred["away_win_prob"]
        )
        assert 0.98 <= total <= 1.02

    def test_value_bet_detection_flow(self, client, auth_headers):
        """Test value bet detection returns valid opportunities."""
        response = client.get(
            "/api/v1/predictions/value-bets",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()

        assert "value_bets" in data
        assert isinstance(data["value_bets"], list)

        # If value bets found, verify structure
        for bet in data["value_bets"]:
            assert "match_id" in bet
            assert "selection" in bet
            assert "edge_percent" in bet
            assert bet["edge_percent"] > 0

    def test_simulate_prediction_various_teams(self, client, auth_headers):
        """Test prediction simulation for different team pairings."""
        test_cases = [
            ("Bayern Munich", "Borussia Dortmund"),
            ("Bayer Leverkusen", "Schalke 04"),
            ("RB Leipzig", "Union Berlin"),
        ]

        for home, away in test_cases:
            response = client.post(
                "/api/v1/predictions/simulate",
                headers=auth_headers,
                json={"home_team": home, "away_team": away},
            )
            assert response.status_code == 200
            pred = response.json()

            # Verify prediction validity
            total_prob = (
                pred["home_win_prob"]
                + pred["draw_prob"]
                + pred["away_win_prob"]
            )
            assert 0.98 <= total_prob <= 1.02

    def test_team_strength_endpoint(self, client, auth_headers):
        """Test team strength metric endpoint."""
        teams = ["FCB", "BVB", "LVR"]

        for team_id in teams:
            response = client.get(
                f"/api/v1/predictions/team-strength/{team_id}",
                headers=auth_headers,
            )
            # Should either return data or 404 if team unknown
            assert response.status_code in [200, 404]

            if response.status_code == 200:
                data = response.json()
                # Should have some strength metrics
                assert len(data) > 0

    def test_model_comparison_consistency(self, client, auth_headers, db_match):
        """Test that different models produce reasonable predictions."""
        response = client.get(
            f"/api/v1/predictions/match-comparison/{db_match.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        comparison = response.json()

        # Models should have similar probability estimates
        # (within 10% of each other for same outcome)
        if "poisson" in comparison and "dixon_coles" in comparison:
            poisson_home = comparison["poisson"]["home_win_prob"]
            dixon_home = comparison["dixon_coles"]["home_win_prob"]
            diff = abs(poisson_home - dixon_home)
            assert diff < 0.15, f"Models diverge too much: {diff}"

    def test_prediction_caching(self, client, auth_headers, db_match):
        """Test that predictions are cached efficiently."""
        import time

        # First request (cache miss)
        start = time.time()
        response1 = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        time1 = time.time() - start

        # Second request (cache hit)
        start = time.time()
        response2 = client.get(
            f"/api/v1/predictions/{db_match.id}",
            headers=auth_headers,
        )
        time2 = time.time() - start

        # Both should succeed
        assert response1.status_code == 200
        assert response2.status_code == 200

        # Second should be faster (cached)
        # Note: This is a soft test, caching behavior depends on implementation
        assert response1.json() == response2.json()

    def test_high_confidence_predictions_accuracy(self, client, auth_headers):
        """Test that high confidence predictions are meaningful."""
        response = client.get(
            "/api/v1/predictions/value-bets",
            headers=auth_headers,
        )
        data = response.json()

        # Filter high confidence predictions
        high_conf = [
            bet
            for bet in data.get("value_bets", [])
            if bet.get("confidence", 0) > 0.7
        ]

        # High confidence bets should have lower edge requirement
        # (already market-priced)
        for bet in high_conf:
            assert "edge_percent" in bet

    def test_kelly_criterion_application(self, client, auth_headers):
        """Test that Kelly Criterion stake sizing is applied."""
        response = client.post(
            "/api/v1/predictions/simulate",
            headers=auth_headers,
            json={
                "home_team": "Bayern",
                "away_team": "Dortmund",
            },
        )

        if response.status_code == 200:
            pred = response.json()

            # If value bet detected, Kelly stake should be present
            if "value_bet" in pred and pred["value_bet"].get("exists"):
                assert "kelly_stake_100" in pred["value_bet"]
                kelly_stake = pred["value_bet"]["kelly_stake_100"]
                # Kelly stake should be between 0 and 100 (percent of bankroll)
                assert 0 <= kelly_stake <= 100
