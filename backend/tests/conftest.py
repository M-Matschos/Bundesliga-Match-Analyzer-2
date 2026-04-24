"""Pytest configuration and shared fixtures."""

import os
import pytest
from typing import Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

# Set testing environment
os.environ["ENVIRONMENT"] = "testing"
os.environ["DEBUG"] = "true"
os.environ["JWT_SECRET"] = "test-secret-key-minimum-32-characters-long!!"
os.environ["API_FOOTBALL_KEY"] = "test-api-key"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["REDIS_URL"] = "redis://localhost:6379/1"

from app.core.config import get_settings, Settings
from app.core.security import hash_password


@pytest.fixture
def settings() -> Settings:
    """Get test settings."""
    return get_settings()


@pytest.fixture
async def async_db_session() -> Generator[AsyncSession, None, None]:
    """Create async database session for testing.

    Uses in-memory SQLite database.
    """
    # Create engine
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )

    # Create tables
    async with engine.begin() as conn:
        from app.models.db import Base

        await conn.run_sync(Base.metadata.create_all)

    # Create session
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        yield session

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
def test_user_data() -> dict:
    """Test user data."""
    return {
        "id": "test-user-123",
        "email": "test@example.com",
        "password": "secure_password_123",
        "password_hash": hash_password("secure_password_123"),
        "username": "testuser",
    }


@pytest.fixture
def test_match_data() -> dict:
    """Test match data."""
    return {
        "id": "match-123",
        "home_team_id": "fcb",
        "away_team_id": "bvb",
        "league_id": "bundesliga",
        "season": "2024-25",
        "matchday": 28,
        "kickoff": "2025-03-29T18:30:00Z",
        "status": "scheduled",
        "home_score": None,
        "away_score": None,
    }


@pytest.fixture
def test_prediction_data() -> dict:
    """Test prediction data."""
    return {
        "id": "pred-123",
        "match_id": "match-123",
        "home_win_prob": 0.58,
        "draw_prob": 0.22,
        "away_win_prob": 0.20,
        "confidence": 0.72,
        "confidence_label": "MEDIUM",
        "expected_goals_home": 1.8,
        "expected_goals_away": 1.1,
        "most_likely_score": "2:1",
    }


# Run async tests
def pytest_collection_modifyitems(items):
    """Mark all tests as async if they use async fixtures."""
    for item in items:
        if "async" in str(item.fspath):
            item.add_marker(pytest.mark.asyncio)
