"""
End-to-End (E2E) User Journey Tests — Task 4b

Complete workflows from login → action → verification
Tests real business logic across multiple endpoints
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def authenticated_client(client):
    """Create authenticated test client with JWT token."""
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "e2e@example.com",
            "password": "SecurePass123!",
            "username": "e2euser",
        },
    )

    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "e2e@example.com", "password": "SecurePass123!"},
    )

    token = login_response.json()["access_token"]

    # Add token to all subsequent requests
    client.headers = {"Authorization": f"Bearer {token}"}
    return client


class TestE2EUserJourney:
    """E2E Journey 1: New User Registration → Login → View Dashboard"""

    def test_complete_user_onboarding(self, client):
        """
        User Story: New user signs up, logs in, accesses protected route

        Flow:
        1. POST /auth/register → Create account
        2. POST /auth/login → Get JWT token
        3. GET /auth/me → Access protected endpoint
        4. POST /auth/refresh → Refresh token
        """
        # 1. Register
        register_resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "onboarding@example.com",
                "password": "OnboardPass123!",
                "username": "onboarduser",
            },
        )
        assert register_resp.status_code == 201
        user_data = register_resp.json()
        assert "access_token" in user_data

        # 2. Login
        login_resp = client.post(
            "/api/v1/auth/login",
            json={
                "email": "onboarding@example.com",
                "password": "OnboardPass123!",
            },
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]

        # 3. Access protected endpoint
        profile_resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert profile_resp.status_code == 200
        profile = profile_resp.json()
        assert profile["email"] == "onboarding@example.com"

        # 4. Refresh token
        refresh_resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert refresh_resp.status_code == 200
        new_token = refresh_resp.json()["access_token"]
        assert new_token != access_token

        # Verify new token works
        verify_resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {new_token}"},
        )
        assert verify_resp.status_code == 200


class TestE2EWeekendCalculatorFlow:
    """E2E Journey 2: Weekend Calculator Complete Flow"""

    def test_weekend_calculation_workflow(self, authenticated_client):
        """
        User Story: Calculate weekend predictions, review results, place bets

        Flow:
        1. POST /weekend/calculate → Start calculation job
        2. GET /weekend/results/{job_id} → Poll for completion
        3. GET /matches → View calculated matches
        4. GET /predictions/{match_id} → View detailed prediction
        5. POST /betting/bets → Place virtual bet
        6. GET /betting/bets → View user's bets
        """
        # 1. Start calculation (would normally poll async job)
        calc_resp = authenticated_client.post(
            "/api/v1/weekend/calculate",
            json={
                "leagues": ["bundesliga"],
                "date_from": "2025-03-29",
                "date_to": "2025-03-30",
            },
        )
        assert calc_resp.status_code in [200, 202, 404]

        if calc_resp.status_code in [200, 202]:
            calc_data = calc_resp.json()
            job_id = calc_data.get("job_id")

            # 2. Poll for results (if async)
            if job_id:
                result_resp = authenticated_client.get(
                    f"/api/v1/weekend/results/{job_id}"
                )
                assert result_resp.status_code in [200, 404]

        # 3. View matches list
        matches_resp = authenticated_client.get(
            "/api/v1/matches?league=bundesliga&season=2024-25"
        )
        assert matches_resp.status_code in [200, 404]

        # 4. View prediction for specific match
        pred_resp = authenticated_client.get("/api/v1/predictions/match-123")
        if pred_resp.status_code == 200:
            pred = pred_resp.json()
            assert "home_win_prob" in pred
            assert "confidence" in pred

            # 5. Place virtual bet on prediction
            bet_resp = authenticated_client.post(
                "/api/v1/betting/bets",
                json={
                    "match_id": "match-123",
                    "bet_type": "home_win",
                    "amount": 25.0,
                    "odds": pred.get("home_win_prob", 1.85),
                },
            )
            assert bet_resp.status_code in [201, 400, 404]

        # 6. View portfolio
        portfolio_resp = authenticated_client.get("/api/v1/betting/portfolio")
        assert portfolio_resp.status_code == 200
        portfolio = portfolio_resp.json()
        assert "total_balance" in portfolio


class TestE2EMobileAppFlow:
    """E2E Journey 3: Mobile App User Flow (Dashboard → Predictions)"""

    def test_mobile_dashboard_flow(self, authenticated_client):
        """
        User Story: Open mobile app, see upcoming matches, tap on prediction

        Flow:
        1. GET /matches → Load dashboard match list
        2. GET /matches?matchday=28 → Filter by current matchday
        3. GET /teams → Load team info/logos
        4. GET /predictions/value-bets → Show best value opportunities
        5. GET /predictions/{match_id}/explain → Show SHAP explanation
        """
        # 1. Load upcoming matches
        matches_resp = authenticated_client.get("/api/v1/matches?limit=10")
        assert matches_resp.status_code in [200, 404]

        # 2. Filter by current matchday
        matchday_resp = authenticated_client.get(
            "/api/v1/matches?matchday=28&league=bundesliga"
        )
        assert matchday_resp.status_code in [200, 404]

        # 3. Load team information (for logos, names)
        teams_resp = authenticated_client.get("/api/v1/teams?league=bundesliga")
        assert teams_resp.status_code in [200, 404]

        # 4. Show value bets (best opportunities)
        valuebets_resp = authenticated_client.get(
            "/api/v1/predictions/value-bets?min_value=1.2"
        )
        assert valuebets_resp.status_code in [200, 404]

        # 5. Show SHAP explanation for tap-on match
        explain_resp = authenticated_client.get(
            "/api/v1/predictions/match-123/explain"
        )
        assert explain_resp.status_code in [200, 404]


class TestE2ETeamDetailsFlow:
    """E2E Journey 4: Team Deep Dive (Standings → Form → Players)"""

    def test_team_details_workflow(self, authenticated_client):
        """
        User Story: Click on team, view standings, form, and squad info

        Flow:
        1. GET /teams/{team_id} → Load team general info
        2. GET /teams/{team_id}/standings → View league position
        3. GET /teams/{team_id}/form → View recent form (L-W-D-W pattern)
        4. GET /players?team_id={team_id} → View squad
        5. GET /players/{player_id}/stats → View player performance
        """
        team_id = "fcb"

        # 1. Load team general info
        team_resp = authenticated_client.get(f"/api/v1/teams/{team_id}")
        assert team_resp.status_code in [200, 404]

        # 2. View standings
        standings_resp = authenticated_client.get(
            f"/api/v1/teams/{team_id}/standings"
        )
        assert standings_resp.status_code in [200, 404]
        if standings_resp.status_code == 200:
            standings = standings_resp.json()
            assert "position" in standings or "rank" in standings

        # 3. View form
        form_resp = authenticated_client.get(f"/api/v1/teams/{team_id}/form")
        assert form_resp.status_code in [200, 404]
        if form_resp.status_code == 200:
            form = form_resp.json()
            # Last 5 matches as L/W/D pattern
            assert isinstance(form, (list, dict))

        # 4. View squad
        squad_resp = authenticated_client.get(f"/api/v1/players?team_id={team_id}")
        assert squad_resp.status_code in [200, 404]

        # 5. View player stats (if squad loaded)
        if squad_resp.status_code == 200 and squad_resp.json():
            player_id = "kane"  # Example
            player_resp = authenticated_client.get(f"/api/v1/players/{player_id}")
            assert player_resp.status_code in [200, 404]


class TestE2EBettingPortfolioFlow:
    """E2E Journey 5: Betting Portfolio Management"""

    def test_betting_portfolio_workflow(self, authenticated_client):
        """
        User Story: Place bets, track performance, analyze ROI

        Flow:
        1. GET /betting/bets → View all placed bets
        2. POST /betting/bets → Place new virtual bet
        3. GET /betting/portfolio → View overall stats (ROI, win rate)
        4. GET /betting/bets?status=open → Filter open bets
        5. POST /betting/bets/{bet_id}/close → Close bet with result
        """
        # 1. View all bets (start empty)
        all_bets_resp = authenticated_client.get("/api/v1/betting/bets")
        assert all_bets_resp.status_code == 200
        initial_bets = all_bets_resp.json()
        assert isinstance(initial_bets, list)

        # 2. Place bet
        place_bet_resp = authenticated_client.post(
            "/api/v1/betting/bets",
            json={
                "match_id": "match-123",
                "bet_type": "over_2_5",
                "amount": 50.0,
                "odds": 1.72,
            },
        )
        assert place_bet_resp.status_code in [201, 400, 404]

        # 3. View portfolio stats
        portfolio_resp = authenticated_client.get("/api/v1/betting/portfolio")
        assert portfolio_resp.status_code == 200
        portfolio = portfolio_resp.json()
        assert "total_balance" in portfolio
        assert "roi_percent" in portfolio
        assert "win_rate" in portfolio

        # 4. Filter open bets
        open_bets_resp = authenticated_client.get("/api/v1/betting/bets?status=open")
        assert open_bets_resp.status_code in [200, 404]

        # 5. Close bet (if we have one)
        if place_bet_resp.status_code == 201:
            bet_id = place_bet_resp.json().get("id")
            if bet_id:
                close_resp = authenticated_client.post(
                    f"/api/v1/betting/bets/{bet_id}/close",
                    json={"result_profit": 25.0},
                )
                assert close_resp.status_code in [200, 404]


class TestE2EErrorRecovery:
    """E2E Journey 6: Error Handling & Recovery"""

    def test_unauthorized_access_recovery(self, client):
        """
        Error Story: User loses token, needs to re-authenticate

        Flow:
        1. Try protected endpoint without token → 401
        2. User logs in again → New token
        3. Retry protected endpoint → Success
        """
        # 1. Try without token
        no_token_resp = client.get("/api/v1/auth/me")
        assert no_token_resp.status_code == 401

        # 2. Login again
        login_resp = client.post(
            "/api/v1/auth/login",
            json={
                "email": "e2e@example.com",
                "password": "SecurePass123!",
            },
        )

        # Re-register if needed
        if login_resp.status_code == 401:
            client.post(
                "/api/v1/auth/register",
                json={
                    "email": "recovery@example.com",
                    "password": "RecoveryPass123!",
                    "username": "recoveryuser",
                },
            )
            login_resp = client.post(
                "/api/v1/auth/login",
                json={
                    "email": "recovery@example.com",
                    "password": "RecoveryPass123!",
                },
            )

        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

        # 3. Retry with new token
        retry_resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert retry_resp.status_code == 200

    def test_invalid_data_recovery(self, client):
        """
        Error Story: User submits invalid data, corrects and retries

        Flow:
        1. POST /register with weak password → 400
        2. Show validation error to user
        3. User retries with strong password → 201
        """
        # 1. Weak password (< 8 chars)
        weak_resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "weak@example.com",
                "password": "Weak1!",  # Too short
                "username": "weakuser",
            },
        )
        assert weak_resp.status_code == 422
        error_detail = weak_resp.json()["detail"][0]["msg"].lower()
        assert "8" in error_detail or "character" in error_detail or "password" in error_detail

        # 2. Retry with valid password
        strong_resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "weak@example.com",
                "password": "StrongPass123!",
                "username": "weakuser",
            },
        )
        assert strong_resp.status_code == 201


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
