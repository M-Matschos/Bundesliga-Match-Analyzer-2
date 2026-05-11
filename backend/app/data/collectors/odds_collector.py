"""Odds data collector stub.

Full implementation fetches decimal odds from the configured
odds API (ODDS_API_KEY) for value-bet detection.
"""

from __future__ import annotations

import logging
from typing import Optional, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class OddsCollector:
    """Fetches market odds for matches."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or settings.odds_api_key
        self.base_url = settings.odds_api_base_url

    async def get_odds(self, match_id: str) -> Optional[Dict[str, Any]]:
        """Return decimal odds for a match, or None if unavailable."""
        logger.debug("get_odds match_id=%s", match_id)
        # TODO: implement HTTP call to odds API
        return None
