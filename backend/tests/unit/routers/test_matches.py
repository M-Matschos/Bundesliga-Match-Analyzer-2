"""Tests for matches router."""

import pytest
from datetime import datetime, timedelta
from uuid import uuid4


class TestListMatches:
    """Test GET /matches endpoint."""

    def test_list_all_matches(self, client):
        """Test list all matches without filters."""
        response = client.get("/api/v1/matches")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "matches" in data

    def test_filter_by_league(self, client):
        """Test filter matches by league."""
        response = client.get("/api/v1/matches?league=bundesliga")
        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["league"] == "bundesliga" for m in data["matches"])

    def test_filter_by_matchday(self, client):
        """Test filter matches by matchday."""
        response = client.get("/api/v1/matches?matchday=1")
        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["matchday"] == 1 for m in data["matches"])

    def test_filter_by_status(self, client):
        """Test filter matches by status."""
        response = client.get("/api/v1/matches?status=live")
        assert response.status_code == 200
        data = response.json()
        if data["matches"]:
            assert all(m["status"] == "live" for m in data["matches"])

    def test_pagination(self, client):
        """Test pagination parameters."""
        response = client.get("/api/v1/matches?limit=5&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 5
        assert data["offset"] == 0


class TestLiveMatches:
    """Test live matches endpoint."""

    def test_get_live_matches(self, client):
        """Test retrieving live matches."""
        response = client.get("/api/v1/matches/live")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "matches" in data
        assert isinstance(data["matches"], list)

    def test_live_matches_empty(self, client):
        """Test live matches when none are live."""
        response = client.get("/api/v1/matches/live")
        assert response.status_code == 200
        data = response.json()
        # Response is paginated format: {total, limit, offset, matches}
        assert isinstance(data, dict)
        assert "matches" in data
        assert isinstance(data["matches"], list)


class TestMatchDetail:
    """Test match detail endpoint."""

    def test_get_match_detail(self, client, db_match):
        """Test getting match detail."""
        response = client.get(f"/api/v1/matches/{db_match.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(db_match.id)

    def test_get_finished_match_with_score(self, client, db_completed_match):
        """Test getting completed match with score."""
        response = client.get(f"/api/v1/matches/{db_completed_match.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["home_score"] is not None
        assert data["away_score"] is not None

    def test_get_nonexistent_match(self, client):
        """Test getting non-existent match."""
        response = client.get(f"/api/v1/matches/{uuid4()}")
        assert response.status_code == 404


class TestMatchesByDate:
    """Test matches by date endpoint."""

    def test_get_matches_by_date(self, client):
        """Test retrieving matches for a specific date."""
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        response = client.get(f"/api/v1/matches/by-date/{date_str}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "matches" in data
        assert isinstance(data["matches"], list)

    def test_matches_by_date_with_league_filter(self, client):
        """Test matches by date with league filter."""
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        response = client.get(f"/api/v1/matches/by-date/{date_str}?league=bundesliga")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "matches" in data
        assert isinstance(data["matches"], list)

    def test_invalid_date_format(self, client):
        """Test invalid date format."""
        response = client.get("/api/v1/matches/by-date/invalid-date")
        assert response.status_code == 400


class TestTeamMatches:
    """Test team matches endpoint."""

    @pytest.mark.skip(reason="Endpoint /teams/{id}/matches not implemented")
    def test_get_team_matches(self, client, db_team):
        """Test getting team's matches."""
        response = client.get(f"/api/v1/teams/{db_team.id}/matches")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.skip(reason="Endpoint /teams/{id}/matches not implemented")
    def test_get_team_matches_with_season(self, client, db_team):
        """Test team matches with season filter."""
        response = client.get(f"/api/v1/teams/{db_team.id}/matches?season=2024-25")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.skip(reason="Endpoint /teams/{id}/matches not implemented")
    def test_team_no_matches(self, client, db_team):
        """Test team with no matches."""
        response = client.get(f"/api/v1/teams/{db_team.id}/matches")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestUpcomingMatches:
    """Test upcoming matches endpoint."""

    def test_get_upcoming_matches(self, client):
        """Test retrieving upcoming matches."""
        response = client.get("/api/v1/matches/upcoming")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "matches" in data
        assert isinstance(data["matches"], list)

    def test_upcoming_with_league(self, client):
        """Test upcoming matches with league filter."""
        response = client.get("/api/v1/matches/upcoming?league=bundesliga")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "matches" in data
        assert isinstance(data["matches"], list)


class TestMatchesResponseFormat:
    """Test match response format compliance."""

    def test_match_response_has_required_fields(self, client, db_match):
        """Test that match response has required fields."""
        response = client.get(f"/api/v1/matches/{db_match.id}")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "home_team_id", "away_team_id", "league_id", "status"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_match_detail_has_extended_fields(self, client, db_completed_match):
        """Test that completed match detail has all fields."""
        response = client.get(f"/api/v1/matches/{db_completed_match.id}")
        assert response.status_code == 200
        data = response.json()
        assert "home_score" in data
        assert "away_score" in data
