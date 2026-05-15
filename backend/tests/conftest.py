"""Pytest configuration and shared fixtures."""

import os
import pytest
import tempfile
from typing import Generator, AsyncGenerator
from uuid import uuid4
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool, StaticPool
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

# Set testing environment
os.environ["ENVIRONMENT"] = "testing"
os.environ["DEBUG"] = "true"
os.environ["JWT_SECRET"] = "test-secret-key-minimum-32-characters-long!!"
os.environ["API_FOOTBALL_KEY"] = "test-api-key"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["REDIS_URL"] = "redis://localhost:6379/1"

from app.core.config import get_settings, Settings
from app.core.security import hash_password, create_token
from app.core.redis_pubsub import RedisPubSubManager
from app.models.db import (
    Base,
    User,
    Team,
    Match,
    Bet,
    Device,
    MatchSubscription,
    Prediction,
)
from app.main import app


@pytest.fixture
def settings() -> Settings:
    """Get test settings."""
    return get_settings()


# ============================================================================
# SYNC FIXTURES (for TestClient-based integration tests)
# ============================================================================


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Create sync database session for TestClient-based tests.

    Uses file-based SQLite database with NullPool to avoid thread-affinity issues.
    NullPool creates a new connection for each database access, allowing TestClient
    (which runs handlers in different threads) to work correctly with SQLite.
    """
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)

    engine = create_engine(
        f"sqlite:///{db_path}",
        echo=False,
        future=True,
        poolclass=NullPool,
        connect_args={"check_same_thread": False},
    )

    Base.metadata.create_all(engine)

    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    session = session_factory()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()
        try:
            os.unlink(db_path)
        except Exception:
            pass


@pytest.fixture
def db_team(db_session: Session) -> Team:
    """Create test team in database."""
    team = Team(
        id=uuid4(),
        name="FC Bayern München",
        league="bundesliga",
    )
    db_session.add(team)
    db_session.commit()
    db_session.refresh(team)
    return team


@pytest.fixture
def db_user(db_session: Session) -> User:
    """Create test user in database."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        username="testuser",
        password_hash=hash_password("secure_password_123"),
        is_active=True,
        is_superuser=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def db_admin_user(db_session: Session) -> User:
    """Create admin user in database."""
    user = User(
        id=uuid4(),
        email="admin@example.com",
        username="adminuser",
        password_hash=hash_password("admin_password_123"),
        is_active=True,
        is_superuser=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def db_match(db_session: Session, db_team: Team) -> Match:
    """Create test match in database (scheduled status)."""
    home_team = db_team
    away_team = Team(
        id=uuid4(),
        name="Borussia Dortmund",
        league="bundesliga",
    )
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
        status="scheduled",
    )
    db_session.add(match)
    db_session.commit()
    db_session.refresh(match)
    return match


@pytest.fixture
def db_completed_match(db_session: Session, db_team: Team) -> Match:
    """Create test match with completed status and scores."""
    home_team = db_team
    away_team = Team(
        id=uuid4(),
        name="Borussia Dortmund",
        league="bundesliga",
    )
    db_session.add(away_team)
    db_session.commit()

    match = Match(
        id=uuid4(),
        api_football_id=123457,
        home_team_id=home_team.id,
        away_team_id=away_team.id,
        league_id="bundesliga",
        season="2024-2025",
        matchday=25,
        kickoff=datetime.utcnow(),
        status="completed",
        home_score=2,
        away_score=1,
    )
    db_session.add(match)
    db_session.commit()
    db_session.refresh(match)
    return match


@pytest.fixture
def db_bet(db_session: Session, db_user: User, db_match: Match) -> Bet:
    """Create test bet in database (pending status)."""
    bet = Bet(
        id=uuid4(),
        user_id=db_user.id,
        match_id=db_match.id,
        bet_type="home_win",
        odds=2.5,
        amount=100.0,
        status="pending",
    )
    db_session.add(bet)
    db_session.commit()
    db_session.refresh(bet)
    return bet


@pytest.fixture
def db_user_bet(db_session: Session, db_user: User, db_match: Match) -> Bet:
    """Create test bet for specific user (alias for db_bet compatibility)."""
    bet = Bet(
        id=uuid4(),
        user_id=db_user.id,
        match_id=db_match.id,
        bet_type="home_win",
        odds=2.5,
        amount=100.0,
        status="pending",
    )
    db_session.add(bet)
    db_session.commit()
    db_session.refresh(bet)
    return bet


@pytest.fixture
def db_other_user(db_session: Session) -> User:
    """Create second test user for isolation/security tests."""
    user = User(
        id=uuid4(),
        email="other@example.com",
        username="otheruser",
        password_hash=hash_password("test_password_123"),
        is_active=True,
        is_superuser=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def db_device(db_session: Session, db_user: User) -> Device:
    """Create test device for notifications."""
    device = Device(
        id=uuid4(),
        user_id=db_user.id,
        device_token="test-device-token-123",
        platform="ios",
        is_active=True,
    )
    db_session.add(device)
    db_session.commit()
    db_session.refresh(device)
    return device


@pytest.fixture
def db_match_subscription(
    db_session: Session, db_user: User, db_match: Match
) -> MatchSubscription:
    """Create test match subscription."""
    subscription = MatchSubscription(
        id=uuid4(),
        user_id=db_user.id,
        match_id=db_match.id,
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    return subscription


@pytest.fixture
def auth_headers(db_user: User) -> dict:
    """Generate Authorization header for test user."""
    token = create_token(data={"sub": str(db_user.id)}, token_type="access")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_token(db_admin_user: User) -> str:
    """Generate JWT token for admin user."""
    return create_token(data={"sub": str(db_admin_user.id)}, token_type="access")


@pytest.fixture
def mock_cache():
    """Mock cache for testing without Redis.

    Returns a simple in-memory cache implementation.
    """

    class InMemoryCache:
        def __init__(self):
            self.store = {}

        async def get(self, key: str):
            return self.store.get(key)

        async def set(self, key: str, value, ttl=None):
            self.store[key] = value
            return True

        async def delete(self, key: str):
            if key in self.store:
                del self.store[key]
                return 1
            return 0

        async def clear_pattern(self, pattern: str):
            import fnmatch

            count = 0
            keys_to_delete = [
                k for k in self.store.keys() if fnmatch.fnmatch(k, pattern)
            ]
            for key in keys_to_delete:
                del self.store[key]
                count += 1
            return count

    return InMemoryCache()


@pytest.fixture(autouse=True)
def clear_rate_limit_state():
    """Auto-use fixture that clears rate limit state before each test.

    This ensures tests don't interfere with each other via slowapi rate limiting.
    """
    # Clear before test
    try:
        from app.routers import auth

        if hasattr(auth, "limiter") and hasattr(auth.limiter, "_storage"):
            auth.limiter._storage.reset()
    except TypeError as e:
        # clear() requires key argument in slowapi, use reset() instead
        pass

    try:
        from app.main import app

        if hasattr(app.state, "limiter") and hasattr(app.state.limiter, "_storage"):
            app.state.limiter._storage.reset()
    except TypeError as e:
        # reset() properly clears slowapi storage without arguments
        pass

    yield

    # Optionally clear after test
    try:
        from app.routers import auth

        if hasattr(auth, "limiter") and hasattr(auth.limiter, "_storage"):
            auth.limiter._storage.reset()
    except TypeError as e:
        pass


@pytest.fixture
def client(db_session: Session) -> TestClient:
    """Create FastAPI TestClient with async database session override.

    Uses the same database as db_session (sync SQLite) but with async override.
    This ensures that data fixtures (db_match, db_user, etc.) are visible to client requests.
    Also disables rate limiting for tests.
    """
    import asyncio
    from sqlalchemy import create_engine as sync_create_engine
    from unittest.mock import patch, MagicMock

    # Setup in-memory cache BEFORE importing app
    from app.core.cache import _InMemoryCache
    import app.core.cache as cache_module

    cache_module.cache = _InMemoryCache()

    # Use the same test database file as db_session
    # Get the database URL from the sync engine
    sync_db_path = db_session.bind.url.database

    # Create async engine pointing to same file
    async_engine = create_async_engine(
        f"sqlite+aiosqlite:///{sync_db_path}",
        echo=False,
        future=True,
        poolclass=StaticPool,
        connect_args={"timeout": 30, "check_same_thread": False},
    )

    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        """Override get_db to use test async session (required by FastAPI)."""
        async with async_session_maker() as session:
            yield session

    from app.models.db import get_db

    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(app)

    yield client

    app.dependency_overrides.clear()

    # Note: cleanup is handled by db_session fixture


@pytest.fixture
def client_with_auth(client: TestClient, auth_headers: dict) -> TestClient:
    """Create TestClient pre-configured with auth headers."""
    client.headers.update(auth_headers)
    return client


# ============================================================================
# ASYNC FIXTURES (for true async tests with @pytest.mark.asyncio)
# ============================================================================


@pytest.fixture
async def async_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create async database session for testing.

    Uses in-memory SQLite database with StaticPool.
    """
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
        poolclass=StaticPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def async_db_user(async_db_session: AsyncSession) -> User:
    """Create test user in async database."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        username="testuser",
        password_hash=hash_password("secure_password_123"),
        is_active=True,
        is_superuser=False,
    )
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    return user


@pytest.fixture
async def async_db_match(async_db_session: AsyncSession) -> Match:
    """Create test match in async database (scheduled status)."""
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
        status="scheduled",
    )
    async_db_session.add(match)
    await async_db_session.commit()
    await async_db_session.refresh(match)
    return match


@pytest.fixture
async def async_db_completed_match(async_db_session: AsyncSession) -> Match:
    """Create test match with completed status in async database."""
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
    async_db_session.add(home_team)
    async_db_session.add(away_team)
    await async_db_session.commit()

    match = Match(
        id=uuid4(),
        api_football_id=123457,
        home_team_id=home_team.id,
        away_team_id=away_team.id,
        league_id="bundesliga",
        season="2024-2025",
        matchday=25,
        kickoff=datetime.utcnow(),
        status="completed",
        home_score=2,
        away_score=1,
    )
    async_db_session.add(match)
    await async_db_session.commit()
    await async_db_session.refresh(match)
    return match


@pytest.fixture
async def async_db_bet(
    async_db_session: AsyncSession, async_db_user: User, async_db_match: Match
) -> Bet:
    """Create test bet in async database (pending status)."""
    bet = Bet(
        id=uuid4(),
        user_id=async_db_user.id,
        match_id=async_db_match.id,
        bet_type="home_win",
        odds=2.5,
        amount=100.0,
        status="pending",
    )
    async_db_session.add(bet)
    await async_db_session.commit()
    await async_db_session.refresh(bet)
    return bet


# ============================================================================
# TEST DATA FIXTURES
# ============================================================================


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


# ============================================================================
# MOCKED SERVICES
# ============================================================================


@pytest.fixture
async def pubsub_manager(mocker) -> RedisPubSubManager:
    """Create a RedisPubSubManager instance with mocked Redis for testing.

    Uses global patch to ensure websocket.py has access to mocked manager.
    """
    from unittest.mock import AsyncMock
    from app.routers.websocket import pubsub_manager as global_manager

    manager = RedisPubSubManager()
    manager.redis = AsyncMock()
    manager.is_connected = AsyncMock(return_value=True)

    # Patch global pubsub_manager in websocket module
    mocker.patch("app.routers.websocket.pubsub_manager", manager)

    return manager


# ============================================================================
# CACHE INITIALIZATION FIXTURES
# ============================================================================


@pytest.fixture(scope="session")
async def init_cache_fixture():
    """Initialize global cache manager once per test session.

    Ensures Redis cache is initialized for integration tests that depend on caching.
    """
    from app.core.cache import init_cache, close_cache

    await init_cache()
    yield
    await close_cache()


@pytest.fixture(scope="function")
async def clear_cache(init_cache_fixture):
    """Clear cache between tests.

    Depends on session-scoped init_cache_fixture to ensure cache manager is initialized.
    Clears all cached data before each test function runs.
    """
    from app.core.cache import cache

    if cache:
        await cache.clear_pattern("*")
    yield
    # Optional: clear again after test
    if cache:
        await cache.clear_pattern("*")


# ============================================================================
# PYTEST HOOKS
# ============================================================================

# pytest_collection_modifyitems removed: asyncio_mode = auto in pytest.ini
# automatically marks all async tests with @pytest.mark.asyncio.
# The redundant marking caused PytestUnraisableExceptionWarning with --strict-markers.
