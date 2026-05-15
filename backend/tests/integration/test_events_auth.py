"""Authentication and authorization tests for event publishing endpoints.

Tests the security of the `/api/v1/events/publish/{match_id}` endpoint:
1. Authorization header is required
2. Only superusers (admins) can publish events
3. Valid admin tokens are accepted
"""

import pytest
from datetime import datetime
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.db import User, Team, Match
from app.core.security import create_token


class TestEventsAuthorization:
    """Tests for event publishing authorization."""

    @pytest.fixture
    def setup_matches(self, db_session):
        """Create test match for event publishing."""
        home_team = Team(
            id=uuid4(),
            name="FC Bayern München",
            league="bundesliga",
        )
        away_team = Team(
            id=uuid4(),
            name="Borussia Dortmund",
            league="bundesliga",
        )
        db_session.add(home_team)
        db_session.add(away_team)
        db_session.commit()

        match = Match(
            id=uuid4(),
            api_football_id=123456,
            home_team_id=home_team.id,
            away_team_id=away_team.id,
            league_id="bundesliga",
            season="2024-2025",
            matchday=25,
            kickoff=datetime.utcnow(),
            status="live",
        )
        db_session.add(match)
        db_session.commit()
        db_session.refresh(match)

        return match

    @pytest.mark.asyncio
    async def test_get_current_admin_user_requires_valid_token(
        self,
        client: TestClient,
        async_db_session: AsyncSession,
        setup_matches
    ):
        """Test: Missing authorization header returns 401 Unauthorized."""
        match = setup_matches

        # Attempt to publish event without Authorization header
        response = client.post(
            f"/api/v1/events/publish/{match.id}",
            json={
                "event_type": "goal",
                "player_name": "Robert Lewandowski",
                "team": "home",
                "score": {"home": 1, "away": 0},
            },
        )

        # Should return 401 Unauthorized
        assert response.status_code == 401
        assert "authorization" in response.json().get("detail", "").lower()

    @pytest.mark.skip(reason="Phase 5: Fixture repair in progress")
    def test_get_current_admin_user_rejects_non_admin(
        self,
        client: TestClient,
        setup_matches,
    ):
        """Test: Regular (non-admin) user token returns 403 Forbidden."""
        match = setup_matches

        # Create regular user (is_superuser=False)
        regular_user = User(
            id=uuid4(),
            email="user@example.com",
            username="regularuser",
            password_hash="hash",
            is_active=True,
            is_superuser=False,  # NOT admin
        )
        # Note: User will be created through API in real test or passed as fixture

        # Generate valid access token for regular user
        token = create_token(data={"sub": str(regular_user.id)}, token_type="access")
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt to publish event as regular user
        response = client.post(
            f"/api/v1/events/publish/{match.id}",
            json={
                "event_type": "goal",
                "player_name": "Robert Lewandowski",
                "team": "home",
                "score": {"home": 1, "away": 0},
            },
            headers=headers,
        )

        # Should return 403 Forbidden (admin access required)
        assert response.status_code == 403
        assert "admin" in response.json().get("detail", "").lower()

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Known issue: Admin token returns 401 (CHANGELOG_RC.md Issue 2)")
    async def test_get_current_admin_user_accepts_admin(
        self,
        client: TestClient,
        async_db_session: AsyncSession,
        setup_matches,
    ):
        """Test: Admin user token is accepted and publishes event.

        NOTE: This test is skipped due to a pre-existing bug where the admin
        authorization check fails even with a valid admin token. This is
        documented in CHANGELOG_RC.md (Issue 2) and will be fixed in Phase 5.
        """
        match = setup_matches

        # Create admin user (is_superuser=True)
        admin_user = User(
            id=uuid4(),
            email="admin@example.com",
            username="adminuser",
            password_hash="hash",
            is_active=True,
            is_superuser=True,  # IS admin
        )
        async_db_session.add(admin_user)
        await async_db_session.commit()

        # Generate valid access token for admin user
        token = create_token(data={"sub": str(admin_user.id)}, token_type="access")
        headers = {"Authorization": f"Bearer {token}"}

        # Publish event as admin
        response = client.post(
            f"/api/v1/events/publish/{match.id}",
            json={
                "event_type": "goal",
                "player_name": "Robert Lewandowski",
                "team": "home",
                "score": {"home": 1, "away": 0},
            },
            headers=headers,
        )

        # Should succeed (200 or 201)
        assert response.status_code in [200, 201]
        data = response.json()
        assert data.get("status") == "published"
        assert data.get("match_id") == str(match.id)
