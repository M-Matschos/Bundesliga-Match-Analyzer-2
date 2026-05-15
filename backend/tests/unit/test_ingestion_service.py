"""
Unit tests for APIFootballIngestion service.

Test coverage:
- API polling (live matches fetch)
- Event fetching with caching
- Event conversion (goals, cards, substitutions)
- Event deduplication
- Error handling and fallback
- Run loop behavior
"""

import pytest
import json
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any, List

import httpx
from redis import Redis

from app.services.ingestion import (
    APIFootballIngestion,
    MatchEventConverter,
    APIFootballError,
    MatchStatus,
)
from app.models.events import (
    EventType,
    Team,
    CardType,
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
)


class TestMatchEventConverter:
    """Unit tests for MatchEventConverter (static methods)."""

    def test_convert_goal_event_valid(self):
        """Test: Valid goal event conversion to GoalEvent model."""
        api_event = {
            "type": "Goal",
            "team_id": 123,
            "time": 45,
            "player": {"id": 456, "name": "Lewandowski"},
            "assist": {"id": 789, "name": "Müller"},
            "score_before": {"home": 0, "away": 0},
            "score_after": {"home": 1, "away": 0},
            "xg_value": 0.78,
        }

        match_id = "match_123"
        home_team_id = 123

        goal_event = MatchEventConverter.convert_goal_event(
            api_event, match_id, home_team_id
        )

        assert goal_event is not None
        assert goal_event.event_type == EventType.GOAL
        assert goal_event.match_id == match_id
        assert goal_event.minute == 45
        assert goal_event.team == Team.HOME
        assert goal_event.player_name == "Lewandowski"
        assert goal_event.player_id == "456"
        assert goal_event.assist_player_name == "Müller"
        assert goal_event.xg_value == 0.78

    def test_convert_goal_event_away_team(self):
        """Test: Goal event for away team."""
        api_event = {
            "type": "Goal",
            "team_id": 456,  # Away team
            "time": 67,
            "player": {"id": 111, "name": "Haaland"},
            "assist": {"id": 222, "name": "Foden"},
            "score_before": {"home": 1, "away": 0},
            "score_after": {"home": 1, "away": 1},
            "xg_value": 0.85,
        }

        match_id = "match_456"
        home_team_id = 123

        goal_event = MatchEventConverter.convert_goal_event(
            api_event, match_id, home_team_id
        )

        assert goal_event.team == Team.AWAY

    def test_convert_goal_event_invalid_type(self):
        """Test: Non-goal event returns None."""
        api_event = {
            "type": "Card",  # Wrong type
            "team_id": 123,
            "time": 45,
        }

        result = MatchEventConverter.convert_goal_event(api_event, "match_123", 123)

        assert result is None

    def test_convert_goal_event_missing_player(self):
        """Test: Goal with missing player data uses defaults."""
        api_event = {
            "type": "Goal",
            "team_id": 123,
            "time": 45,
            "player": {},  # Empty player data
            "assist": None,
            "score_before": {},
            "score_after": {},
            "xg_value": 0.0,
        }

        goal_event = MatchEventConverter.convert_goal_event(api_event, "match_123", 123)

        assert goal_event is not None
        assert goal_event.player_name == "Unknown"
        assert goal_event.player_id == ""
        assert goal_event.assist_player_name is None

    def test_convert_goal_event_exception_handling(self):
        """Test: Exception in conversion returns None and logs error."""
        api_event = {
            "type": "Goal",
            "team_id": None,  # Will cause issues
            "time": 45,
        }

        result = MatchEventConverter.convert_goal_event(api_event, "match_123", 123)

        assert result is None

    def test_convert_card_event_red_card(self):
        """Test: Red card event conversion."""
        api_event = {
            "type": "Card",
            "team_id": 123,
            "time": 52,
            "card_type": "RED",
            "player": {"id": 333, "name": "Defender1"},
            "reason": "Violent conduct",
        }

        card_event = MatchEventConverter.convert_card_event(api_event, "match_789", 123)

        assert card_event is not None
        assert card_event.card_type == CardType.RED
        assert card_event.event_type == EventType.RED_CARD
        assert card_event.minute == 52
        assert card_event.offense == "Violent conduct"

    def test_convert_card_event_yellow_card(self):
        """Test: Yellow card event conversion."""
        api_event = {
            "type": "Card",
            "team_id": 456,
            "time": 38,
            "card_type": "YELLOW",
            "player": {"id": 444, "name": "Midfielder1"},
            "reason": "Foul play",
        }

        card_event = MatchEventConverter.convert_card_event(api_event, "match_789", 123)

        assert card_event is not None
        assert card_event.card_type == CardType.YELLOW
        assert card_event.event_type == EventType.YELLOW_CARD
        assert card_event.team == Team.AWAY

    def test_convert_card_event_invalid_type(self):
        """Test: Non-card event returns None."""
        api_event = {"type": "Goal"}

        result = MatchEventConverter.convert_card_event(api_event, "match_789", 123)

        assert result is None

    def test_convert_substitution_event_valid(self):
        """Test: Valid substitution event conversion."""
        api_event = {
            "type": "Substitution",
            "team_id": 123,
            "time": 61,
            "player_off": {"id": 555, "name": "PlayerOff"},
            "player_on": {"id": 666, "name": "PlayerOn"},
        }

        sub_event = MatchEventConverter.convert_substitution_event(
            api_event, "match_101", 123
        )

        assert sub_event is not None
        assert sub_event.event_type == EventType.SUBSTITUTION
        assert sub_event.minute == 61
        assert sub_event.team == Team.HOME
        assert sub_event.player_off_name == "PlayerOff"
        assert sub_event.player_off_id == "555"
        assert sub_event.player_on_name == "PlayerOn"
        assert sub_event.player_on_id == "666"

    def test_convert_substitution_event_invalid_type(self):
        """Test: Non-substitution event returns None."""
        api_event = {"type": "Goal"}

        result = MatchEventConverter.convert_substitution_event(
            api_event, "match_101", 123
        )

        assert result is None


class TestAPIFootballIngestion:
    """Unit tests for APIFootballIngestion service."""

    @pytest.fixture
    def mock_redis(self):
        """Create mock Redis client."""
        return AsyncMock(spec=Redis)

    @pytest.fixture
    def ingestion_service(self, mock_redis):
        """Create APIFootballIngestion instance with mocked Redis."""
        return APIFootballIngestion(
            api_key="test_key",
            redis_client=mock_redis,
            poll_interval=30,
            cache_ttl=3600,
        )

    @pytest.mark.asyncio
    async def test_poll_live_matches_success(self, ingestion_service, mock_redis):
        """Test: Successful polling of live matches."""
        mock_response_data = {
            "response": [
                {
                    "fixture": {"id": 1001},
                    "teams": {"home": {"id": 123}, "away": {"id": 456}},
                    "league": {"id": 39},
                    "season": 2025,
                    "status": {"long": "Match Live"},
                },
                {
                    "fixture": {"id": 1002},
                    "teams": {"home": {"id": 789}, "away": {"id": 101}},
                    "league": {"id": 39},
                    "season": 2025,
                    "status": {"long": "Match Live"},
                },
            ]
        }

        with patch("app.services.ingestion.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_response_data
            mock_client.get = AsyncMock(return_value=mock_response)

            live_matches = await ingestion_service.poll_live_matches()

            assert len(live_matches) == 2
            assert live_matches[0]["fixture"]["id"] == 1001
            assert live_matches[1]["fixture"]["id"] == 1002

    @pytest.mark.asyncio
    async def test_poll_live_matches_api_error(self, ingestion_service):
        """Test: API-Football returns error status."""
        with patch("app.services.ingestion.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 429  # Rate limited
            mock_response.text = "Rate limit exceeded"
            mock_client.get = AsyncMock(return_value=mock_response)

            with pytest.raises(APIFootballError) as exc_info:
                await ingestion_service.poll_live_matches()

            assert "429" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_poll_live_matches_timeout(self, ingestion_service):
        """Test: Timeout during API call."""
        with patch("app.services.ingestion.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(
                side_effect=httpx.TimeoutException("Request timeout")
            )

            with pytest.raises(APIFootballError) as exc_info:
                await ingestion_service.poll_live_matches()

            assert "timeout" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_get_match_events_cache_hit(self, ingestion_service, mock_redis):
        """Test: Match events retrieved from Redis cache."""
        match_id = 1001
        cached_events = [
            {"type": "Goal", "time": 45, "team_id": 123},
            {"type": "Card", "time": 52, "team_id": 456},
        ]
        cached_json = json.dumps(cached_events)

        mock_redis.get.return_value = cached_json

        events = await ingestion_service.get_match_events(match_id)

        assert len(events) == 2
        assert events[0]["type"] == "Goal"
        mock_redis.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_match_events_cache_miss_api_fetch(
        self, ingestion_service, mock_redis
    ):
        """Test: Cache miss → API fetch → cache store."""
        match_id = 1002
        api_events = [
            {"type": "Goal", "time": 30, "team_id": 123},
        ]

        mock_redis.get.return_value = None  # Cache miss
        mock_redis.setex = AsyncMock()

        with patch("app.services.ingestion.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"response": api_events}
            mock_client.get = AsyncMock(return_value=mock_response)

            events = await ingestion_service.get_match_events(match_id)

            assert len(events) == 1
            assert events[0]["type"] == "Goal"
            # Verify cache was set
            mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_match_events_api_timeout_fallback_empty(
        self, ingestion_service, mock_redis
    ):
        """Test: API timeout → return empty list (graceful fallback)."""
        match_id = 1003
        mock_redis.get.return_value = None  # Cache miss

        with patch("app.services.ingestion.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(side_effect=httpx.TimeoutException("Timeout"))

            events = await ingestion_service.get_match_events(match_id)

            assert events == []

    def test_hash_event_creates_consistent_hash(self):
        """Test: Same event produces same hash."""
        event = {
            "type": "Goal",
            "time": 45,
            "team_id": 123,
            "player": {"id": 456},
        }

        hash1 = APIFootballIngestion._hash_event(event)
        hash2 = APIFootballIngestion._hash_event(event)

        assert hash1 == hash2
        assert len(hash1) == 32  # MD5 hex digest length

    def test_hash_event_different_for_different_events(self):
        """Test: Different events produce different hashes."""
        event1 = {
            "type": "Goal",
            "time": 45,
            "team_id": 123,
            "player": {"id": 456},
        }
        event2 = {
            "type": "Goal",
            "time": 46,  # Different time
            "team_id": 123,
            "player": {"id": 456},
        }

        hash1 = APIFootballIngestion._hash_event(event1)
        hash2 = APIFootballIngestion._hash_event(event2)

        assert hash1 != hash2

    @pytest.mark.asyncio
    async def test_process_match_events_publishes_new_events(
        self, ingestion_service, mock_redis
    ):
        """Test: New events are published, duplicates are skipped."""
        match_data = {
            "fixture": {"id": 1001},
            "teams": {"home": {"id": 123}},
            "statistics": [
                {
                    "Possession": "55.5",
                    "Shots on Goal": 12,
                    "Corner Kicks": 5,
                    "Fouls": 8,
                },
                {
                    "Possession": "44.5",
                    "Shots on Goal": 8,
                    "Corner Kicks": 3,
                    "Fouls": 10,
                },
            ],
        }

        # Mock get_match_events
        goal_event_api = {
            "type": "Goal",
            "time": 45,
            "team_id": 123,
            "player": {"id": 456, "name": "Lewandowski"},
            "assist": {"id": 789, "name": "Müller"},
            "score_before": {"home": 0, "away": 0},
            "score_after": {"home": 1, "away": 0},
            "xg_value": 0.78,
        }

        with patch.object(
            ingestion_service, "get_match_events", new_callable=AsyncMock
        ) as mock_get_events:
            mock_get_events.return_value = [goal_event_api]

            with patch(
                "app.services.ingestion.event_publisher.publish_event",
                new_callable=AsyncMock,
            ) as mock_publish_event:
                with patch(
                    "app.services.ingestion.event_publisher.publish_stats_update",
                    new_callable=AsyncMock,
                ) as mock_publish_stats:
                    events_published = await ingestion_service.process_match_events(
                        match_data
                    )

                    # Should publish 1 event + 1 stats update = 2
                    assert events_published == 2
                    assert mock_publish_event.called
                    assert mock_publish_stats.called

    @pytest.mark.asyncio
    async def test_process_match_events_deduplication(
        self, ingestion_service, mock_redis
    ):
        """Test: Duplicate events are not published twice."""
        match_data = {
            "fixture": {"id": 1002},
            "teams": {"home": {"id": 123}},
            "statistics": [],
        }

        goal_event_api = {
            "type": "Goal",
            "time": 45,
            "team_id": 123,
            "player": {"id": 456, "name": "Lewandowski"},
            "assist": None,
            "score_before": {},
            "score_after": {},
            "xg_value": 0.78,
        }

        with patch.object(
            ingestion_service, "get_match_events", new_callable=AsyncMock
        ) as mock_get_events:
            mock_get_events.return_value = [goal_event_api]

            with patch(
                "app.services.ingestion.event_publisher.publish_event",
                new_callable=AsyncMock,
            ) as mock_publish_event:
                # First call - should publish
                events_published_1 = await ingestion_service.process_match_events(
                    match_data
                )
                assert events_published_1 == 1
                assert mock_publish_event.call_count == 1

                # Second call - same event should NOT publish (dedup)
                events_published_2 = await ingestion_service.process_match_events(
                    match_data
                )
                assert events_published_2 == 0  # No new events
                assert mock_publish_event.call_count == 1  # Still 1

    @pytest.mark.asyncio
    async def test_process_match_events_missing_fixture_id(self, ingestion_service):
        """Test: Match without fixture ID is skipped with warning."""
        match_data = {
            "fixture": {},  # Missing ID
            "teams": {"home": {"id": 123}},
        }

        events_published = await ingestion_service.process_match_events(match_data)

        assert events_published == 0

    @pytest.mark.asyncio
    async def test_process_match_events_error_handling(self, ingestion_service):
        """Test: Exception during event processing doesn't crash loop."""
        match_data = {
            "fixture": {"id": 1003},
            "teams": {"home": {"id": 123}},
            "statistics": [],
        }

        with patch.object(
            ingestion_service, "get_match_events", new_callable=AsyncMock
        ) as mock_get_events:
            mock_get_events.side_effect = Exception("Random error")

            events_published = await ingestion_service.process_match_events(match_data)

            assert events_published == 0

    @pytest.mark.asyncio
    async def test_run_ingestion_loop_polling_cycle(self, ingestion_service):
        """Test: Ingestion loop polls and processes matches."""
        match_data = {
            "fixture": {"id": 1004},
            "teams": {"home": {"id": 123}},
            "statistics": [],
        }

        with patch.object(
            ingestion_service, "poll_live_matches", new_callable=AsyncMock
        ) as mock_poll:
            with patch.object(
                ingestion_service, "process_match_events", new_callable=AsyncMock
            ) as mock_process:
                mock_poll.return_value = [match_data]
                mock_process.return_value = 1

                # Run loop for 1 cycle only (simulate with exception)
                with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
                    mock_sleep.side_effect = KeyboardInterrupt()

                    with pytest.raises(KeyboardInterrupt):
                        await ingestion_service.run_ingestion_loop()

                    # Verify polling happened
                    assert mock_poll.called
                    # Verify processing happened
                    assert mock_process.called

    @pytest.mark.asyncio
    async def test_run_ingestion_loop_error_recovery(self, ingestion_service):
        """Test: Loop continues on API error."""
        with patch.object(
            ingestion_service, "poll_live_matches", new_callable=AsyncMock
        ) as mock_poll:
            # First call fails, second succeeds
            mock_poll.side_effect = [
                APIFootballError("API down"),
                [],  # Second call returns empty
            ]

            with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
                mock_sleep.side_effect = [None, KeyboardInterrupt()]

                with pytest.raises(KeyboardInterrupt):
                    await ingestion_service.run_ingestion_loop()

                # Should have tried polling twice despite first failure
                assert mock_poll.call_count == 2


class TestAPIFootballError:
    """Unit tests for APIFootballError exception."""

    def test_api_football_error_is_exception(self):
        """Test: APIFootballError is an Exception subclass."""
        error = APIFootballError("Test error")
        assert isinstance(error, Exception)
        assert str(error) == "Test error"
