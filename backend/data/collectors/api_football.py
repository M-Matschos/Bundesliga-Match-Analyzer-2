"""
API-Football Collector
Holt Fixtures, Statistiken und xG-Daten von api-football.com
"""
import httpx
import asyncio
from typing import Optional
from ..core.config import settings
from ..core.cache import cache


BASE_URL = "https://v3.football.api-sports.io"

LEAGUE_NAME_MAP = {
    78:  "bundesliga",
    79:  "bundesliga2",
    39:  "premier-league",
    40:  "championship",
    2:   "champions-league",
    81:  "dfb-pokal",
}

CURRENT_SEASON = 2024  # 2024 = Saison 2024/25


class APIFootballCollector:
    def __init__(self):
        self.headers = {
            "x-rapidapi-key":  settings.API_FOOTBALL_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io"
        }
        self.client = httpx.AsyncClient(headers=self.headers, timeout=15.0)

    async def get_fixtures(self, league_id: int, date_from: str, date_to: str) -> list:
        """Holt alle Spiele einer Liga in einem Datumsbereich."""
        cache_key = f"fixtures:{league_id}:{date_from}:{date_to}"
        cached = await cache.get(cache_key)
        if cached:
            return cached

        params = {
            "league": league_id,
            "season": CURRENT_SEASON,
            "from":   date_from,
            "to":     date_to,
            "timezone": "Europe/Berlin"
        }

        response = await self.client.get(f"{BASE_URL}/fixtures", params=params)
        data = response.json()

        if data.get("errors"):
            raise Exception(f"API-Football Fehler: {data['errors']}")

        fixtures = [self._parse_fixture(f) for f in data.get("response", [])]

        await cache.set(cache_key, fixtures, ttl=3600)  # 1h Cache
        return fixtures

    async def get_fixtures_by_matchday(self, league_id: int, matchday: int) -> list:
        """Holt alle Spiele eines bestimmten Spieltags."""
        cache_key = f"matchday:{league_id}:{matchday}"
        cached = await cache.get(cache_key)
        if cached:
            return cached

        params = {"league": league_id, "season": CURRENT_SEASON, "round": f"Regular Season - {matchday}"}
        response = await self.client.get(f"{BASE_URL}/fixtures", params=params)
        fixtures = [self._parse_fixture(f) for f in response.json().get("response", [])]

        await cache.set(cache_key, fixtures, ttl=3600)
        return fixtures

    async def get_team_stats(self, team_id: int, league_id: int, last_n: int = 10) -> dict:
        """Holt Teamstatistiken für Feature Engineering."""
        cache_key = f"team_stats:{team_id}:{league_id}"
        cached = await cache.get(cache_key)
        if cached:
            return cached

        params = {"team": team_id, "league": league_id, "season": CURRENT_SEASON}
        response = await self.client.get(f"{BASE_URL}/teams/statistics", params=params)
        stats = response.json().get("response", {})

        parsed = {
            "team_id":              team_id,
            "avg_goals_scored":     self._extract_avg_goals(stats, "for"),
            "avg_goals_conceded":   self._extract_avg_goals(stats, "against"),
            "avg_goals_scored_home":    self._extract_avg_goals(stats, "for", "home"),
            "avg_goals_scored_away":    self._extract_avg_goals(stats, "for", "away"),
            "avg_goals_conceded_home":  self._extract_avg_goals(stats, "against", "home"),
            "avg_goals_conceded_away":  self._extract_avg_goals(stats, "against", "away"),
            "form":                 stats.get("form", ""),
            "clean_sheets":         stats.get("clean_sheet", {}).get("total", 0),
            "failed_to_score":      stats.get("failed_to_score", {}).get("total", 0),
        }

        await cache.set(cache_key, parsed, ttl=3600)
        return parsed

    def _parse_fixture(self, raw: dict) -> dict:
        """Parst ein Fixture aus der API-Response in unser Format."""
        fixture  = raw.get("fixture", {})
        teams    = raw.get("teams", {})
        goals    = raw.get("goals", {})
        league   = raw.get("league", {})
        venue    = fixture.get("venue", {})

        return {
            "match_id":   str(fixture.get("id")),
            "kickoff":    fixture.get("date"),
            "status":     fixture.get("status", {}).get("short"),
            "league":     LEAGUE_NAME_MAP.get(league.get("id"), "unknown"),
            "league_id":  league.get("id"),
            "round":      league.get("round"),
            "stadium":    venue.get("name"),
            "home_team": {
                "id":       str(teams.get("home", {}).get("id")),
                "name":     teams.get("home", {}).get("name"),
                "logo_url": teams.get("home", {}).get("logo"),
            },
            "away_team": {
                "id":       str(teams.get("away", {}).get("id")),
                "name":     teams.get("away", {}).get("name"),
                "logo_url": teams.get("away", {}).get("logo"),
            },
            "home_goals": goals.get("home"),   # None wenn noch nicht gespielt
            "away_goals": goals.get("away"),
        }

    def _extract_avg_goals(self, stats: dict, direction: str, venue: str = "total") -> float:
        try:
            total = stats["goals"][direction][venue]["total"] or 0
            played = stats["fixtures"]["played"][venue] or 1
            return round(total / played, 2)
        except (KeyError, TypeError, ZeroDivisionError):
            return 1.2  # Fallback: Liga-Durchschnitt
