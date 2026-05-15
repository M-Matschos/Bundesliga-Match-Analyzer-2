"""API-Football data collector stub.

Full implementation fetches fixtures and live data from
https://v3.football.api-sports.io — requires API_FOOTBALL_KEY.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class APIFootballCollector:
    """Fetches fixture and match data from the API-Football service."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or settings.api_football_key
        self.base_url = settings.api_football_base_url

    async def get_fixtures(
        self,
        league_id: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Return fixtures for a league within an optional date range."""
        logger.debug(
            "get_fixtures league=%s date_from=%s date_to=%s",
            league_id,
            date_from,
            date_to,
        )
        # TODO: implement HTTP call to API-Football /fixtures endpoint
        return []

    async def get_fixtures_by_matchday(
        self,
        league_id: str,
        matchday: int,
    ) -> List[Dict[str, Any]]:
        """Return fixtures for a specific matchday."""
        logger.debug(
            "get_fixtures_by_matchday league=%s matchday=%s", league_id, matchday
        )
        # TODO: implement HTTP call to API-Football /fixtures?round=
        return []
