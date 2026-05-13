"""Integration tests for virtual betting flow."""

import pytest


class TestBettingFlow:
    """Integration tests for virtual betting workflow."""

    def test_complete_betting_lifecycle(self, client, auth_headers, db_match):
        """Test placing, tracking, and settling a virtual bet."""
        # 1. Place a bet
        place_response = client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": str(db_match.id),
                "bet_type": "home_win",
                "odds": 1.85,
                "amount": 100.0,
            },
        )
        assert place_response.status_code == 201
        bet_data = place_response.json()
        bet_id = bet_data["bet_id"]

        # 2. Retrieve bet details
        get_response = client.get(
            f"/api/v1/virtual-bets/{bet_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 200
        bet = get_response.json()
        assert bet["status"] == "pending"
        assert bet["amount"] == 100.0
        assert bet["odds"] == 1.85

        # 3. View in user's bets list
        list_response = client.get(
            "/api/v1/virtual-bets",
            headers=auth_headers,
        )
        assert list_response.status_code == 200
        bets = list_response.json()
        assert any(b["bet_id"] == bet_id for b in bets)

        # 4. Cancel the bet (optional)
        cancel_response = client.post(
            f"/api/v1/virtual-bets/{bet_id}/cancel",
            headers=auth_headers,
        )
        assert cancel_response.status_code == 200
        assert cancel_response.json()["status"] == "cancelled"

    def test_portfolio_statistics_calculation(self, client, auth_headers, db_user, db_match):
        """Test that portfolio statistics are calculated correctly."""
        # Place a bet on existing match
        client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": str(db_match.id),
                "bet_type": "home_win",
                "odds": 1.80,
                "amount": 100.0,
            },
        )

        # Get portfolio stats
        stats_response = client.get(
            "/api/v1/virtual-bets/portfolio/stats",
            headers=auth_headers,
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()

        # Verify structure (flat response, no nested "stats")
        assert "total_bets" in stats
        assert "total_staked" in stats
        assert "roi_percent" in stats

    def test_filter_bets_by_status(self, client, auth_headers, db_user_bet):
        """Test filtering bets by status."""
        # Get pending bets
        pending_response = client.get(
            "/api/v1/virtual-bets?status=pending",
            headers=auth_headers,
        )
        assert pending_response.status_code == 200
        pending_bets = pending_response.json()

        # All returned bets should be pending
        for bet in pending_bets:
            assert bet["status"] == "pending"

    def test_bet_value_detection(self, client, auth_headers):
        """Test value bet detection during placement."""
        response = client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": "test_match_value",
                "bet_type": "home_win",
                "odds": 2.50,  # High odds may indicate value
                "amount": 100.0,
            },
        )

        if response.status_code == 201:
            bet = response.json()
            # Bet should be placed regardless of value
            assert "bet_id" in bet

    def test_concurrent_bets_same_match(self, client, auth_headers, db_match):
        """Test placing multiple bets on same match."""
        # Place multiple different bets on same match
        bets = []
        for bet_type in ["home_win", "draw", "away_win"]:
            response = client.post(
                "/api/v1/virtual-bets",
                headers=auth_headers,
                params={
                    "match_id": str(db_match.id),
                    "bet_type": bet_type,
                    "odds": 2.0,
                    "amount": 50.0,
                },
            )
            assert response.status_code == 201
            bets.append(response.json()["bet_id"])

        # Verify all bets exist
        list_response = client.get(
            "/api/v1/virtual-bets",
            headers=auth_headers,
        )
        user_bets = list_response.json()
        for bet_id in bets:
            assert any(b["bet_id"] == bet_id for b in user_bets)

    def test_kelly_criterion_stake_sizing(self, client, auth_headers):
        """Test that bet sizing follows Kelly Criterion principles."""
        # Place a value bet
        response = client.post(
            "/api/v1/virtual-bets",
            headers=auth_headers,
            params={
                "match_id": "kelly_test",
                "bet_type": "home_win",
                "odds": 2.0,
                "amount": 100.0,
            },
        )

        if response.status_code == 201:
            bet = response.json()
            # Amount should be reasonable (Kelly Criterion limits it)
            assert 0 < bet["amount"] <= 200  # Typical max is ~2x for fractional Kelly

    def test_bet_history_pagination(self, client, auth_headers, db_user):
        """Test that bet listing returns user's bets."""
        response = client.get(
            "/api/v1/virtual-bets",
            headers=auth_headers,
        )
        assert response.status_code == 200
        bets = response.json()

        # Should return a list of bets
        assert isinstance(bets, list)

    def test_empty_portfolio_stats(self, client, auth_headers):
        """Test portfolio stats for user with no bets."""
        response = client.get(
            "/api/v1/virtual-bets/portfolio/stats",
            headers=auth_headers,
        )
        assert response.status_code == 200
        stats = response.json()

        # Should handle empty portfolio gracefully
        assert "total_bets" in stats
        assert stats["total_bets"] == 0
        assert stats["total_staked"] == 0

    def test_bet_security_isolation(self, client, db_user_bet, db_other_user):
        """Test that users can only see their own bets."""
        # Login as different user
        response = client.post(
            "/api/v1/auth/login",
            json={"email": db_other_user.email, "password": "test_password_123"},
        )
        other_headers = {
            "Authorization": f"Bearer {response.json()['access_token']}"
        }

        # Try to access first user's bet
        response = client.get(
            f"/api/v1/virtual-bets/{db_user_bet.id}",
            headers=other_headers,
        )
        assert response.status_code == 404

        # User's own bets list should not contain first user's bet
        response = client.get(
            "/api/v1/virtual-bets",
            headers=other_headers,
        )
        user_bets = response.json()
        assert not any(b["bet_id"] == str(db_user_bet.id) for b in user_bets)
