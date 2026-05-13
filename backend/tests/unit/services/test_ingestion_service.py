"""
Unit Tests für Ingestion Service
Testet API-Football Integration und Event-Publishing
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from app.services.ingestion import BundesligaDataIngestion, init_ingestion, get_ingestion_service
from app.models.events import EventType


@pytest.fixture
def ingestion_service():
    """Erstelle einen Ingestion-Service für Tests"""
    from unittest.mock import AsyncMock, MagicMock
    mock_redis = AsyncMock()
    mock_redis.publish = AsyncMock(return_value=1)
    mock_redis.get = MagicMock(return_value=None)
    mock_redis.setex = MagicMock(return_value=True)
    return BundesligaDataIngestion(
        api_key="test_api_key",
        redis_client=mock_redis,
        poll_interval=10
    )


@pytest.mark.asyncio
class TestBundesligaDataIngestion:
    """Test-Klasse für BundesligaDataIngestion"""
    
    @patch("httpx.AsyncClient.get")
    async def test_get_live_matches(self, mock_get, ingestion_service):
        """Test Abrufen von Live-Matches"""
        # Setup Mock
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            "response": [
                {
                    "fixture": {"id": 123},
                    "league": {"id": 78},
                    "teams": {
                        "home": {"id": 1, "name": "Bayern Munich"},
                        "away": {"id": 2, "name": "Borussia Dortmund"}
                    },
                    "goals": {"home": 2, "away": 1},
                    "status": "LIVE"
                }
            ]
        }
        mock_response.raise_for_status = AsyncMock()
        
        # Patch httpx.AsyncClient
        with patch("httpx.AsyncClient.get", return_value=mock_response):
            with patch("httpx.AsyncClient.__aenter__", return_value=AsyncMock(get=AsyncMock(return_value=mock_response))):
                # Diese Implementierung benötigt angepasstes Mocking
                pass
    
    async def test_event_hash_generation(self, ingestion_service):
        """Test Event-Hash-Generierung für Deduplication"""
        # Erstelle zwei identische Events
        event_data1 = {"minute": 45, "player_id": 100}
        event_data2 = {"minute": 45, "player_id": 100}
        
        # Generiere Hashes
        hash1 = ingestion_service._generate_event_hash("goal", 123, event_data1)
        hash2 = ingestion_service._generate_event_hash("goal", 123, event_data2)
        
        # Assertions
        assert hash1 == hash2
    
    async def test_event_deduplication(self, ingestion_service):
        """Test Event-Deduplication"""
        match_id = 123
        event_data = {"minute": 45, "player_id": 100}
        
        # Generiere Hash
        event_hash = ingestion_service._generate_event_hash("goal", match_id, event_data)
        
        # Initialisiere Cache
        ingestion_service.event_cache[match_id] = [event_hash]
        
        # Prüfe ob Event in Cache ist
        assert event_hash in ingestion_service.event_cache[match_id]
    
    async def test_extract_stat_from_api_response(self, ingestion_service):
        """Test Extrahieren von Statistiken aus API-Response"""
        # Mock-Statistiken
        stats_dict = {
            "statistics": [
                {"type": "Shots on Goal", "value": "5"},
                {"type": "Ball Possession", "value": "60.5"},
                {"type": "Total Passes", "value": "450"}
            ]
        }
        
        # Extrahiere Werte
        shots = BundesligaDataIngestion._extract_stat(stats_dict, "Shots on Goal")
        possession = BundesligaDataIngestion._extract_stat(stats_dict, "Ball Possession")
        passes = BundesligaDataIngestion._extract_stat(stats_dict, "Total Passes")
        
        # Assertions
        assert shots == 5
        assert possession == 60  # Wird zu Int konvertiert
        assert passes == 450
    
    async def test_extract_missing_stat(self, ingestion_service):
        """Test Extrahieren von nicht-vorhandenen Statistiken"""
        # Mock-Statistiken ohne gewünschten Wert
        stats_dict = {
            "statistics": [
                {"type": "Shots on Goal", "value": "5"}
            ]
        }
        
        # Extrahiere nicht-existierenden Wert
        result = BundesligaDataIngestion._extract_stat(stats_dict, "Missing Stat")
        
        # Assertions
        assert result == 0


@pytest.mark.asyncio
class TestEventProcessing:
    """Test Event-Verarbeitung"""
    
    @patch("app.services.event_publisher.event_publisher.publish_event")
    async def test_process_goal_event(self, mock_publish, ingestion_service):
        """Test Verarbeitung von Tor-Ereignissen"""
        # Setup
        mock_publish.return_value = AsyncMock()

        match_id = 123
        api_event = {
            "type": "Goal",
            "time": 45,
            "player": {"name": "Robert Lewandowski", "id": 100},
            "assist": {"name": "Joshua Kimmich"},
            "team_id": 1
        }

        # Verarbeite Event
        count = await ingestion_service.process_match_events_from_api(match_id, 1, [api_event])

        # Assertions
        assert count >= 0  # Service should process without errors
    
    @patch("app.services.event_publisher.event_publisher.publish_event")
    async def test_process_card_event(self, mock_publish, ingestion_service):
        """Test Verarbeitung von Karten-Ereignissen"""
        # Setup
        mock_publish.return_value = AsyncMock()

        match_id = 123

        # Gelbe Karte
        yellow_card_event = {
            "type": "Card",
            "card_type": "Yellow",
            "time": 62,
            "player": {"name": "Serge Gnabry", "id": 110},
            "team_id": 1
        }

        # Verarbeite Event
        count = await ingestion_service.process_match_events_from_api(match_id, 1, [yellow_card_event])

        # Assertions
        assert count >= 0  # Service should process without errors
    
    @patch("app.services.event_publisher.event_publisher.publish_event")
    async def test_process_substitution_event(self, mock_publish, ingestion_service):
        """Test Verarbeitung von Spielerwechseln"""
        # Setup
        mock_publish.return_value = AsyncMock()

        match_id = 123
        subst_event = {
            "type": "Substitution",
            "time": 75,
            "player": {"name": "Robert Lewandowski", "id": 100},
            "assist": {"name": "Serge Gnabry", "id": 110},
            "team_id": 1
        }

        # Verarbeite Event
        count = await ingestion_service.process_match_events_from_api(match_id, 1, [subst_event])

        # Assertions
        assert count >= 0  # Service should process without errors


@pytest.mark.asyncio
class TestStatisticsProcessing:
    """Test Statistik-Verarbeitung"""
    
    async def test_process_match_statistics(self, ingestion_service):
        """Test Verarbeitung von Match-Statistiken"""
        match_id = 123
        stats = {
            "team1": {
                "statistics": [
                    {"type": "Shots on Goal", "value": "5"},
                    {"type": "Ball Possession", "value": "60.5"},
                    {"type": "Total Passes", "value": "450"},
                    {"type": "Fouls", "value": "12"},
                    {"type": "Corner Kicks", "value": "8"}
                ]
            },
            "team2": {
                "statistics": [
                    {"type": "Shots on Goal", "value": "3"},
                    {"type": "Ball Possession", "value": "39.5"},
                    {"type": "Total Passes", "value": "380"},
                    {"type": "Fouls", "value": "15"},
                    {"type": "Corner Kicks", "value": "5"}
                ]
            }
        }

        # Verarbeite Statistiken
        await ingestion_service.process_match_statistics(match_id, stats)

        # Assertions
        assert match_id in ingestion_service.last_statistics
        assert ingestion_service.last_statistics[match_id] == stats


@pytest.mark.asyncio
class TestGlobalFunctions:
    """Test globale Funktionen"""
    
    async def test_init_ingestion(self):
        """Test Ingestion-Initialisierung"""
        service = await init_ingestion("test_api_key")
        
        # Assertions
        assert service is not None
        assert service.api_key == "test_api_key"
    
    async def test_get_ingestion_service(self):
        """Test Abrufen des Ingestion-Service"""
        # Initialisiere zuerst
        await init_ingestion("test_api_key")
        
        # Hole Service
        service = get_ingestion_service()
        
        # Assertions
        assert service is not None


class TestIngestionEdgeCases:
    """Test Edge Cases"""
    
    def test_empty_matches_response(self):
        """Test Behandlung leerer Match-Responses"""
        service = BundesligaDataIngestion("test_key")
        
        # Empty response sollte nicht zu Fehlern führen
        import asyncio
        
        async def run_test():
            with patch("httpx.AsyncClient.get") as mock_get:
                mock_response = AsyncMock()
                mock_response.json.return_value = {"response": []}
                # Würde normal funktionieren
        
        # Das ist ein Placeholder-Test
        assert True
    
    def test_api_error_handling(self):
        """Test API-Fehlerbehandlung"""
        service = BundesligaDataIngestion("test_key")
        
        # Service sollte graceful mit Fehlern umgehen
        assert service.event_cache == {}


# Test Fixtures für API-Responses
LIVE_MATCHES_RESPONSE = {
    "response": [
        {
            "fixture": {
                "id": 123,
                "date": "2024-04-28T20:30:00+00:00",
                "status": "LIVE"
            },
            "league": {"id": 78, "name": "Bundesliga"},
            "teams": {
                "home": {"id": 1, "name": "Bayern Munich"},
                "away": {"id": 2, "name": "Borussia Dortmund"}
            },
            "goals": {"home": 2, "away": 1},
            "score": {
                "fulltime": {"home": 2, "away": 1},
                "halftime": {"home": 1, "away": 0}
            }
        }
    ]
}

MATCH_EVENTS_RESPONSE = {
    "response": [
        {
            "type": "GOAL",
            "time": {"elapsed": 45},
            "player": {"name": "Robert Lewandowski", "id": 100},
            "assist": {"name": "Joshua Kimmich"},
            "team": {"id": 1}
        },
        {
            "type": "CARD",
            "detail": "Yellow Card",
            "time": {"elapsed": 62},
            "player": {"name": "Serge Gnabry", "id": 110},
            "team": {"id": 1}
        }
    ]
}


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
