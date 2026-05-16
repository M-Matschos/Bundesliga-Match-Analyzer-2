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
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from typing import AsyncGenerator

from app.main import app
from app.models.db import User, Team, Match, get_db
from app.core.security import create_token


class TestEventsAuthorization:
    """Tests for event publishing authorization."""

    @pytest.fixture
    def setup_matches(self, db_session: Session):
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
        self, client: TestClient, async_db_session: AsyncSession, setup_matches
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

    def test_get_current_admin_user_rejects_non_admin(
        self,
        client: TestClient,
        db_session,
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
        db_session.add(regular_user)
        db_session.commit()

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
    async def test_get_current_admin_user_accepts_admin(
        self,
        async_db_session: AsyncSession,
        mocker,
    ):
        """Test: Admin user token is accepted and publishes event.

        Uses httpx.AsyncClient + async_db_session dependency override so that
        both the test setup and the router share the same in-memory database.
        This eliminates the sync/async session mismatch that caused the xfail.
        """
        from unittest.mock import AsyncMock
        from app.core.redis_pubsub import RedisPubSubManager

        # --- Setup: create Teams, Match, and admin User in the async session ---
        home_team = Team(id=uuid4(), name="FC Bayern München", league="bundesliga")
        away_team = Team(id=uuid4(), name="Borussia Dortmund", league="bundesliga")
        async_db_session.add(home_team)
        async_db_session.add(away_team)
        await async_db_session.commit()

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
        async_db_session.add(match)
        await async_db_session.commit()
        await async_db_session.refresh(match)

        admin_user = User(
            id=uuid4(),
            email="admin@example.com",
            username="adminuser",
            password_hash="hash",
            is_active=True,
            is_superuser=True,
        )
        async_db_session.add(admin_user)
        await async_db_session.commit()

        # --- Override get_db so the router uses the same session as setup ---
        async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
            yield async_db_session

        app.dependency_overrides[get_db] = override_get_db

        # --- Mock pubsub_manager so no real Redis connection is needed ---
        manager = RedisPubSubManager()
        manager.redis = AsyncMock()
        manager.is_connected = AsyncMock(return_value=True)
        manager.publish_event = AsyncMock(return_value=1)
        mocker.patch("app.routers.events.pubsub_manager", manager)

        # --- Mock notification helper: api_football_id is not a UUID, so
        #     _send_notifications_to_subscribers would raise a ValueError when
        #     calling UUID(match_id). That code path is tested separately;
        #     here we only care about the auth + publish flow. ---
        mocker.patch(
            "app.routers.events._send_notifications_to_subscribers",
            new=AsyncMock(return_value=0),
        )

        # --- Generate token and call the endpoint via httpx.AsyncClient ---
        token = create_token(data={"sub": str(admin_user.id)}, token_type="access")
        headers = {"Authorization": f"Bearer {token}"}

        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.post(
                    f"/api/v1/events/publish/{match.api_football_id}",
                    json={
                        "event_type": "goal",
                        "match_id": str(match.api_football_id),
                        "timestamp": datetime.utcnow().isoformat(),
                        "minute": 45,
                        "team": "home",
                        "player_name": "Robert Lewandowski",
                        "score_before": {"home": 0, "away": 0},
                        "score_after": {"home": 1, "away": 0},
                    },
                    headers=headers,
                )
        finally:
            app.dependency_overrides.clear()

        # Should succeed (200 or 201)
        assert response.status_code in [200, 201]
        data = response.json()
        assert data.get("status") == "published"
        assert data.get("event_type") == "goal"
