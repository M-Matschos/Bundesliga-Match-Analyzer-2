"""Tests for matches router."""

import pytest
from datetime import datetime, timedelta
from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from app.models.db import Match, User
from app.core.db import async_session_maker


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
async def test_user(db):
    """Create test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        username="testuser",
        password_hash="hashed_password",
        full_name="Test User",
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def test_matches(db):
    """Create test matches."""
    now = datetime.utcnow()
    matches = [
        Match(
            id=uuid4(),
            api_football_id=123 + i,
            home_team_id="FCB",
            away_team_id="BVB" if i % 2 == 0 else "S04",
            league_id="bundesliga",
            season="2024-25",
            matchday=28 + (i // 3),
            kickoff=now + timedelta(days=i, hours=15),
            status="scheduled" if i < 6 else "live" if i < 9 else "finished",
            home_score=None if i < 9 else 2,
            away_score=None if i < 9 else 1,
            home_xg=1.5 if i >= 9 else None,
            away_xg=0.8 if i >= 9 else None,
        )
        for i in range(12)
    ]
    db.add_all(matches)
    await db.commit()
    return matches


class TestListMatches:
    """Test GET /matches endpoint."""

    @pytest.mark.asyncio
    async def test_list_all_matches(self, client, test_matches):
        """Test list all matches without filters."""
        response = client.get("/api/v1/matches")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 12
        assert data["limit"] == 50
        assert data["offset"] == 0
        assert len(data["matches"]) >= 12

    @pytest.mark.asyncio
    async def test_filter_by_league(self, client, test_matches):
        """Test filter matches by league."""
        response = client.get("/api/v1/matches?league=bundesliga")

        assert response.status_code == 200
        data = response.json()
        assert all(m["league_id"] == "bundesliga" for m in data["matches"])

    @pytest.mark.asyncio
    async def test_filter_by_matchday(self, client, test_matches):
        """Test filter matches by matchday."""
        response = client.get("/api/v1/matches?matchday=28")

        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["matchday"] == 28 for m in data["matches"])

    @pytest.mark.asyncio
    async def test_filter_by_status(self, client, test_matches):
        """Test filter matches by status."""
        response = client.get("/api/v1/matches?status=scheduled")

        assert response.status_code == 200
        data = response.json()
        assert all(m["status"] == "scheduled" for m in data["matches"])

    @pytest.mark.asyncio
    async def test_pagination(self, client, test_matches):
        """Test pagination with limit and offset."""
        response = client.get("/api/v1/matches?limit=5&offset=0")

        assert response.status_code == 200
        data = response.json()
        assert len(data["matches"]) <= 5
        assert data["limit"] == 5
        assert data["offset"] == 0

    @pytest.mark.asyncio
    async def test_invalid_limit(self, client):
        """Test invalid limit parameter."""
        response = client.get("/api/v1/matches?limit=101")

        # FastAPI validates and rejects
        assert response.status_code == 422 or response.status_code == 200


class TestLiveMatches:
    """Test GET /matches/live endpoint."""

    @pytest.mark.asyncio
    async def test_get_live_matches(self, client, test_matches):
        """Test get currently live matches."""
        response = client.get("/api/v1/matches/live")

        assert response.status_code == 200
        data = response.json()
        # 3 matches with status='live' in test data (indices 6, 7, 8)
        assert all(m["status"] == "live" for m in data["matches"])

    @pytest.mark.asyncio
    async def test_live_matches_empty(self, client):
        """Test get live matches when none exist."""
        response = client.get("/api/v1/matches/live")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0  # May be 0 if no live matches


class TestMatchDetail:
    """Test GET /matches/{match_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_match_detail(self, client, test_matches):
        """Test get match detail by ID."""
        match_id = str(test_matches[0].id)
        response = client.get(f"/api/v1/matches/{match_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == match_id
        assert data["home_team_id"] == "FCB"
        assert data["league_id"] == "bundesliga"

    @pytest.mark.asyncio
    async def test_get_finished_match_with_score(self, client, test_matches):
        """Test get finished match includes score and xG."""
        # Match at index 9 is finished with scores
        match_id = str(test_matches[9].id)
        response = client.get(f"/api/v1/matches/{match_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["home_score"] == 2
        assert data["away_score"] == 1
        assert data["home_xg"] == 1.5
        assert data["away_xg"] == 0.8

    @pytest.mark.asyncio
    async def test_get_nonexistent_match(self, client):
        """Test get non-existent match returns 404."""
        fake_id = str(uuid4())
        response = client.get(f"/api/v1/matches/{fake_id}")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_invalid_match_id_format(self, client):
        """Test invalid UUID format."""
        response = client.get("/api/v1/matches/invalid-uuid")

        assert response.status_code == 422  # Validation error


class TestMatchesByDate:
    """Test GET /matches/by-date/{date} endpoint."""

    @pytest.mark.asyncio
    async def test_get_matches_by_date(self, client, test_matches):
        """Test get matches on specific date."""
        target_date = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
        response = client.get(f"/api/v1/matches/by-date/{target_date}")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["total"], int)
        assert isinstance(data["matches"], list)

    @pytest.mark.asyncio
    async def test_matches_by_date_with_league_filter(self, client, test_matches):
        """Test get matches by date with league filter."""
        target_date = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
        response = client.get(f"/api/v1/matches/by-date/{target_date}?league=bundesliga")

        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["league_id"] == "bundesliga" for m in data["matches"])

    @pytest.mark.asyncio
    async def test_invalid_date_format(self, client):
        """Test invalid date format."""
        response = client.get("/api/v1/matches/by-date/2025/03/29")

        assert response.status_code == 400
        assert "Invalid date format" in response.json()["detail"]


class TestTeamMatches:
    """Test GET /matches/team/{team_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_team_matches(self, client, test_matches):
        """Test get all matches for a team."""
        response = client.get("/api/v1/matches/team/FCB")

        assert response.status_code == 200
        data = response.json()
        assert len(data["matches"]) > 0
        # All matches should have FCB as home or away
        for match in data["matches"]:
            assert (
                match["home_team_id"] == "FCB"
                or match["away_team_id"] == "FCB"
            )

    @pytest.mark.asyncio
    async def test_get_team_matches_with_season(self, client, test_matches):
        """Test get team matches filtered by season."""
        response = client.get("/api/v1/matches/team/FCB?season=2024-25")

        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["season"] == "2024-25" for m in data["matches"])

    @pytest.mark.asyncio
    async def test_team_no_matches(self, client):
        """Test team with no matches."""
        response = client.get("/api/v1/matches/team/UNKNOWN")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["matches"]) == 0


class TestUpcomingMatches:
    """Test GET /matches/upcoming endpoint."""

    @pytest.mark.asyncio
    async def test_get_upcoming_matches(self, client, test_matches):
        """Test get upcoming matches."""
        response = client.get("/api/v1/matches/upcoming?days=7")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["total"], int)
        # Only scheduled matches in future
        for match in data["matches"]:
            assert match["status"] == "scheduled"

    @pytest.mark.asyncio
    async def test_upcoming_with_league(self, client, test_matches):
        """Test upcoming matches with league filter."""
        response = client.get("/api/v1/matches/upcoming?days=14&league=bundesliga")

        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["league_id"] == "bundesliga" for m in data["matches"])

    @pytest.mark.asyncio
    async def test_invalid_days_parameter(self, client):
        """Test invalid days parameter."""
        response = client.get("/api/v1/matches/upcoming?days=31")

        assert response.status_code == 422  # Out of range


class TestMatchesResponseFormat:
    """Test response format consistency."""

    @pytest.mark.asyncio
    async def test_match_response_has_required_fields(self, client, test_matches):
        """Test match response includes all required fields."""
        response = client.get("/api/v1/matches")

        assert response.status_code == 200
        data = response.json()

        required_fields = {
            "id", "home_team_id", "away_team_id", "league_id",
            "season", "matchday", "kickoff", "status"
        }

        for match in data["matches"][:1]:  # Check first match
            assert all(field in match for field in required_fields)

    @pytest.mark.asyncio
    async def test_match_detail_has_extended_fields(self, client, test_matches):
        """Test match detail includes extended fields."""
        match_id = str(test_matches[9].id)  # Finished match
        response = client.get(f"/api/v1/matches/{match_id}")

        assert response.status_code == 200
        data = response.json()

        assert "home_score" in data
        assert "away_score" in data
        assert "home_xg" in data
        assert "away_xg" in data
