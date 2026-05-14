"""
External API Integration Service — Polls API-Football for live match data.

Responsibilities:
- Poll API-Football every 30s for live match data
- Convert API responses to MatchEvent models (GoalEvent, CardEvent, etc.)
- Publish events to Redis Pub/Sub channels via event_publisher
- Implement error recovery and fallback strategies
- Cache fixture data to reduce API calls
- Handle rate limiting and API failures gracefully

Called by: Background tasks (Celery), startup events, scheduled jobs.
"""

import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum

import httpx
from redis import Redis

from app.models.events import (
    EventType,
    Team,
    CardType,
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
    StatsUpdateEvent,
)
from app.services.event_publisher import event_publisher

logger = logging.getLogger(__name__)


class MatchStatus(str, Enum):
    """API-Football match status enum."""
    NOT_STARTED = "Not Started"
    FIRST_HALF = "First Half"
    HALFTIME = "Half Time"
    SECOND_HALF = "Second Half"
    MATCH_FINISHED = "Match Finished"
    EXTRA_TIME = "Extra Time"
    PENALTIES = "Penalties"


class APIFootballError(Exception):
    """Raised when API-Football call fails."""
    pass


class MatchEventConverter:
    """Converts API-Football event data to MatchEvent models."""

    @staticmethod
    def convert_goal_event(
        api_event: Dict[str, Any],
        match_id: str,
        home_team_id: int,
    ) -> Optional[GoalEvent]:
        """
        Convert API goal event to GoalEvent model.

        Args:
            api_event: API-Football event dict with type='Goal'
            match_id: Match identifier
            home_team_id: Home team ID from API-Football

        Returns:
            GoalEvent or None if conversion fails
        """
        try:
            if api_event.get("type") != "Goal":
                return None

            team_id = api_event.get("team_id")
            if team_id is None:
                logger.error("Goal event missing team_id")
                return None

            team = Team.HOME if team_id == home_team_id else Team.AWAY
            minute = api_event.get("time", 0)
            player = api_event.get("player", {})
            assist = api_event.get("assist", {})

            return GoalEvent(
                event_type=EventType.GOAL,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_name=player.get("name", "Unknown"),
                player_id=str(player.get("id", "")),
                assist_player_name=assist.get("name") if assist else None,
                score_before=api_event.get("score_before", {}),
                score_after=api_event.get("score_after", {}),
                xg_value=api_event.get("xg_value", 0.0),
            )
        except Exception as e:
            logger.error(f"Failed to convert goal event: {str(e)}")
            return None

    @staticmethod
    def convert_card_event(
        api_event: Dict[str, Any],
        match_id: str,
        home_team_id: int,
    ) -> Optional[CardEvent]:
        """
        Convert API card event to CardEvent model.

        Args:
            api_event: API-Football event dict with type='Card'
            match_id: Match identifier
            home_team_id: Home team ID

        Returns:
            CardEvent or None if conversion fails
        """
        try:
            if api_event.get("type") != "Card":
                return None

            card_type_str = api_event.get("card_type", "").upper()
            card_type = (
                CardType.RED if "RED" in card_type_str else CardType.YELLOW
            )
            team = Team.HOME if api_event.get("team_id") == home_team_id else Team.AWAY
            minute = api_event.get("time", 0)
            player = api_event.get("player", {})

            return CardEvent(
                event_type=EventType.RED_CARD if card_type == CardType.RED else EventType.YELLOW_CARD,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_name=player.get("name", "Unknown"),
                player_id=str(player.get("id", "")),
                card_type=card_type,
                offense=api_event.get("reason", "Card"),
            )
        except Exception as e:
            logger.error(f"Failed to convert card event: {str(e)}")
            return None

    @staticmethod
    def convert_substitution_event(
        api_event: Dict[str, Any],
        match_id: str,
        home_team_id: int,
    ) -> Optional[SubstitutionEvent]:
        """
        Convert API substitution event to SubstitutionEvent model.

        Args:
            api_event: API-Football event dict with type='Substitution'
            match_id: Match identifier
            home_team_id: Home team ID

        Returns:
            SubstitutionEvent or None if conversion fails
        """
        try:
            if api_event.get("type") != "Substitution":
                return None

            team = Team.HOME if api_event.get("team_id") == home_team_id else Team.AWAY
            minute = api_event.get("time", 0)
            player_off = api_event.get("player_off", {})
            player_on = api_event.get("player_on", {})

            return SubstitutionEvent(
                event_type=EventType.SUBSTITUTION,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_off_name=player_off.get("name", "Unknown"),
                player_off_id=str(player_off.get("id", "")),
                player_on_name=player_on.get("name", "Unknown"),
                player_on_id=str(player_on.get("id", "")),
            )
        except Exception as e:
            logger.error(f"Failed to convert substitution event: {str(e)}")
            return None


class APIFootballIngestion:
    """
    Ingestion service for API-Football live data.

    Polls API-Football every 30s and publishes events to Redis.
    """

    def __init__(
        self,
        api_key: str,
        redis_client: Optional[Redis] = None,
        poll_interval: int = 30,
        cache_ttl: int = 3600,
    ):
        """
        Initialize APIFootballIngestion service.

        Args:
            api_key: API-Football API key
            redis_client: Redis client for caching and pub/sub (optional for testing)
            poll_interval: Seconds between API polls (default: 30s)
            cache_ttl: Cache time-to-live in seconds (default: 1h)
        """
        self.api_key = api_key
        self.redis = redis_client
        self.poll_interval = poll_interval
        self.cache_ttl = cache_ttl
        self.base_url = "https://api-football-v1.p.rapidapi.com/v3"
        self.headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        }
        self.converter = MatchEventConverter()
        self._last_events: Dict[str, Dict[str, bool]] = {}
        self.event_cache: Dict[int, List[str]] = {}
        self.last_statistics: Dict[int, Dict[str, Any]] = {}

    async def poll_live_matches(self) -> List[Dict[str, Any]]:
        """
        Poll API-Football for all live matches.

        Returns:
            List of live match data from API

        Raises:
            APIFootballError: If API call fails
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/fixtures",
                    params={"live": "all"},
                    headers=self.headers,
                )

                if response.status_code != 200:
                    raise APIFootballError(
                        f"API returned {response.status_code}: {response.text}"
                    )

                data = response.json()
                if data.get("response") is None:
                    raise APIFootballError("Invalid API response format")

                logger.info(
                    "live_matches_polled",
                    extra={
                        "count": len(data["response"]),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )

                return data["response"]

        except httpx.TimeoutException as e:
            logger.error(f"API-Football timeout: {str(e)}")
            raise APIFootballError(f"API timeout: {str(e)}")
        except httpx.RequestError as e:
            logger.error(f"API-Football request failed: {str(e)}")
            raise APIFootballError(f"API request failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error polling API-Football: {str(e)}")
            raise APIFootballError(f"Unexpected error: {str(e)}")

    async def get_match_events(self, match_id: int) -> List[Dict[str, Any]]:
        """
        Get detailed events for a specific match from API-Football.

        Args:
            match_id: Match ID from API-Football

        Returns:
            List of event data (goals, cards, substitutions, etc.)

        Raises:
            APIFootballError: If API call fails
        """
        # Try Redis cache first
        cache_key = f"match:{match_id}:events"
        cached = self.redis.get(cache_key)
        if cached:
            logger.debug(f"Using cached events for match {match_id}")
            import json
            return json.loads(cached)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/fixtures/events",
                    params={"fixture": match_id},
                    headers=self.headers,
                )

                if response.status_code != 200:
                    raise APIFootballError(
                        f"API returned {response.status_code}: {response.text}"
                    )

                data = response.json()
                events = data.get("response", [])

                # Cache events
                import json
                self.redis.setex(
                    cache_key,
                    self.cache_ttl,
                    json.dumps(events, default=str),
                )

                logger.debug(f"Fetched {len(events)} events for match {match_id}")
                return events

        except httpx.TimeoutException:
            logger.warning(f"Timeout fetching events for match {match_id}")
            return []
        except APIFootballError as e:
            logger.warning(f"Failed to fetch events for match {match_id}: {str(e)}")
            return []

    async def process_match_events(self, match: Dict[str, Any]) -> int:
        """
        Process events for a single live match and publish changes to Redis.

        Args:
            match: Match data from API-Football

        Returns:
            Number of events published
        """
        match_id = str(match.get("fixture", {}).get("id", ""))
        if not match_id:
            logger.warning("Match missing fixture ID, skipping")
            return 0

        try:
            # Fetch detailed events
            api_events = await self.get_match_events(int(match_id))
            home_team_id = match.get("teams", {}).get("home", {}).get("id", 0)

            published_count = 0
            event_hash_set = set()

            for api_event in api_events:
                # Create unique hash for event to avoid duplicates
                event_hash = self._hash_event(api_event)
                event_hash_set.add(event_hash)

                # Skip if we've already published this event
                if (match_id in self._last_events and
                    event_hash in self._last_events[match_id]):
                    continue

                # Try to convert to domain event
                domain_event = None

                if api_event.get("type") == "Goal":
                    domain_event = self.converter.convert_goal_event(
                        api_event, match_id, home_team_id
                    )
                elif api_event.get("type") == "Card":
                    domain_event = self.converter.convert_card_event(
                        api_event, match_id, home_team_id
                    )
                elif api_event.get("type") == "Substitution":
                    domain_event = self.converter.convert_substitution_event(
                        api_event, match_id, home_team_id
                    )

                # Publish if conversion succeeded
                if domain_event:
                    await event_publisher.publish_event(match_id, domain_event)
                    published_count += 1
                    logger.info(
                        "event_published_from_api",
                        extra={
                            "match_id": match_id,
                            "event_type": api_event.get("type"),
                            "minute": api_event.get("time"),
                        },
                    )

            # Update match stats
            stats = match.get("statistics", {})
            if stats:
                home_stats = stats[0] if len(stats) > 0 else {}
                away_stats = stats[1] if len(stats) > 1 else {}

                await event_publisher.publish_stats_update(
                    match_id,
                    home_possession=float(home_stats.get("Possession", 0) or 0),
                    away_possession=float(away_stats.get("Possession", 0) or 0),
                    home_shots=int(home_stats.get("Shots on Goal", 0) or 0),
                    away_shots=int(away_stats.get("Shots on Goal", 0) or 0),
                    home_shots_on_target=int(home_stats.get("Shots on Goal", 0) or 0),
                    away_shots_on_target=int(away_stats.get("Shots on Goal", 0) or 0),
                    home_corners=int(home_stats.get("Corner Kicks", 0) or 0),
                    away_corners=int(away_stats.get("Corner Kicks", 0) or 0),
                    home_fouls=int(home_stats.get("Fouls", 0) or 0),
                    away_fouls=int(away_stats.get("Fouls", 0) or 0),
                )
                published_count += 1

            # Track processed events for next cycle
            if match_id not in self._last_events:
                self._last_events[match_id] = {}
            self._last_events[match_id] = {h: True for h in event_hash_set}

            return published_count

        except Exception as e:
            logger.error(f"Error processing match {match_id}: {str(e)}")
            return 0

    async def run_ingestion_loop(self) -> None:
        """
        Run the main ingestion loop.

        Polls API-Football every `poll_interval` seconds and processes events.
        """
        logger.info("Starting API-Football ingestion loop", extra={
            "poll_interval": self.poll_interval,
        })

        while True:
            try:
                # Poll live matches
                live_matches = await self.poll_live_matches()

                total_events = 0
                for match in live_matches:
                    events_published = await self.process_match_events(match)
                    total_events += events_published

                logger.debug(
                    "ingestion_cycle_complete",
                    extra={
                        "matches_processed": len(live_matches),
                        "total_events_published": total_events,
                    },
                )

            except APIFootballError as e:
                logger.error(f"API-Football ingestion error (will retry): {str(e)}")

            except Exception as e:
                logger.error(f"Unexpected ingestion error: {str(e)}")

            # Wait before next poll
            await asyncio.sleep(self.poll_interval)

    async def process_match_events_from_api(
        self,
        match_id: int,
        home_team_id: int,
        events: List[Dict[str, Any]],
    ) -> int:
        """
        Process match events and publish to Redis (from API format).

        Args:
            match_id: Match identifier
            home_team_id: Home team ID
            events: List of event dicts from API

        Returns:
            Number of events published
        """
        if not self.redis or not events:
            return 0

        published_count = 0
        for event in events:
            event_type = event.get("type", "").upper()
            converted = None

            if event_type == "GOAL":
                converted = self.converter.convert_goal_event(
                    event, str(match_id), home_team_id
                )
            elif event_type == "CARD":
                converted = self.converter.convert_card_event(
                    event, str(match_id), home_team_id
                )
            elif event_type in ("SUBST", "SUBSTITUTION"):
                converted = self.converter.convert_substitution_event(
                    event, str(match_id), home_team_id
                )

            if converted:
                try:
                    await event_publisher.publish_event(str(match_id), converted)
                    published_count += 1
                except Exception as e:
                    logger.error(f"Failed to publish event: {e}")

        return published_count

    async def process_match_statistics(
        self,
        match_id: int,
        statistics: Dict[str, Any],
    ) -> None:
        """
        Process match statistics and cache them.

        Args:
            match_id: Match identifier
            statistics: Statistics dict with team1 and team2 data
        """
        self.last_statistics[match_id] = statistics

        if not self.redis:
            return

        stats_data = {
            "match_id": match_id,
            "team1": statistics.get("team1", {}),
            "team2": statistics.get("team2", {}),
        }

        try:
            import json
            # Handle both sync and async redis clients
            publish_result = self.redis.publish(
                f"stats:{match_id}",
                json.dumps(stats_data),
            )
            # If result is awaitable, await it; otherwise it's already done
            if hasattr(publish_result, "__await__"):
                await publish_result
        except Exception as e:
            logger.warning(f"Failed to publish stats for match {match_id}: {e}")

    def _generate_event_hash(
        self,
        event_type: str,
        match_id: int,
        event_data: Dict[str, Any],
    ) -> str:
        """
        Generate unique hash for event deduplication.

        Args:
            event_type: Type of event (e.g., "goal", "card", "substitution")
            match_id: Match identifier
            event_data: Event data dict

        Returns:
            Hash string
        """
        import hashlib
        import json

        event_key = json.dumps({
            "type": event_type,
            "match_id": match_id,
            "minute": event_data.get("minute"),
            "player_id": event_data.get("player_id"),
        }, sort_keys=True)

        return hashlib.md5(event_key.encode(), usedforsecurity=False).hexdigest()

    @staticmethod
    def _extract_stat(stats_dict: Dict[str, Any], stat_name: str) -> int:
        """
        Extract a stat value from API statistics dict.

        Args:
            stats_dict: Dict containing 'statistics' key with list of stat dicts
            stat_name: Name of stat to extract (e.g., "Shots on Goal")

        Returns:
            Integer value of stat, or 0 if not found
        """
        stats_list = stats_dict.get("statistics", [])
        for stat in stats_list:
            if stat.get("type") == stat_name:
                try:
                    value = stat.get("value", 0)
                    return int(float(value)) if value else 0
                except (ValueError, TypeError):
                    return 0
        return 0

    @staticmethod
    def _hash_event(event: Dict[str, Any]) -> str:
        """
        Create a unique hash for an event to detect duplicates.

        Args:
            event: Event dict from API-Football

        Returns:
            Hash string
        """
        import hashlib
        import json

        event_key = json.dumps({
            "type": event.get("type"),
            "time": event.get("time"),
            "team_id": event.get("team_id"),
            "player": event.get("player", {}).get("id"),
        }, sort_keys=True)

        return hashlib.md5(event_key.encode(), usedforsecurity=False).hexdigest()


def get_redis_manager():
    """
    Get Redis manager instance for cache operations.

    Used by tests and background tasks to access Redis client.
    """
    from redis.asyncio import from_url as redis_from_url
    from app.core.config import settings

    return redis_from_url(settings.redis_url, decode_responses=True)


# Singleton instance
_ingestion_service: Optional[APIFootballIngestion] = None


def get_ingestion_service() -> Optional[APIFootballIngestion]:
    """
    Get the ingestion service singleton.

    Returns:
        APIFootballIngestion instance or None if not yet initialized
    """
    return _ingestion_service


# Compatibility alias — older tests may import BundesligaDataIngestion
BundesligaDataIngestion = APIFootballIngestion


async def init_ingestion(api_key: str) -> APIFootballIngestion:
    """Create and initialize the APIFootballIngestion singleton.

    Convenience factory used by tests and startup scripts.
    """
    global _ingestion_service
    from redis.asyncio import from_url as redis_from_url
    from app.core.config import settings

    redis_client = redis_from_url(settings.redis_url, decode_responses=True)
    _ingestion_service = APIFootballIngestion(api_key, redis_client)
    return _ingestion_service
