"""SQLAlchemy database configuration and session management."""

import logging
from typing import AsyncGenerator
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.core.config import settings
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Database engine configuration
# SQLite doesn't support pool_size, max_overflow, pool_recycle
db_url = settings.sqlalchemy_database_url_async
is_sqlite = "sqlite" in db_url

engine_kwargs = {
    "echo": settings.db_echo,
    "future": True,
}

if not is_sqlite:
    engine_kwargs.update({
        "pool_size": settings.db_pool_size,
        "max_overflow": settings.db_max_overflow,
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    })
else:
    # SQLite-specific settings
    engine_kwargs["connect_args"] = {"timeout": 30, "check_same_thread": False}

engine = create_async_engine(db_url, **engine_kwargs)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for ORM models
Base = declarative_base()

# Metadata for reflection
metadata = MetaData()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting database session.

    Use in FastAPI route dependencies:
        @router.get("/matches")
        async def get_matches(db: AsyncSession = Depends(get_db)):
            stmt = select(Match).limit(10)
            result = await db.execute(stmt)
            return result.scalars().all()

    Yields:
        AsyncSession for database operations
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database (create tables).

    Call this in FastAPI startup event.
    """
    try:
        # Create all tables defined in models
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


async def close_db() -> None:
    """Close database connections.

    Call this in FastAPI shutdown event.
    """
    try:
        await engine.dispose()
        logger.info("✅ Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")


from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, Index, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship


class User(Base):
    """User model for authentication and profile."""

    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    bets = relationship("Bet", back_populates="user", cascade="all, delete-orphan")


class Team(Base):
    """Football team model."""

    __tablename__ = "teams"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    logo_url = Column(String(500), nullable=True)
    league = Column(String(50), nullable=False, index=True)
    position = Column(Integer, nullable=True)
    wins = Column(Integer, default=0, nullable=False)
    draws = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)
    goals_for = Column(Integer, default=0, nullable=False)
    goals_against = Column(Integer, default=0, nullable=False)
    points = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    home_matches = relationship("Match", foreign_keys="[Match.home_team_id]", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="[Match.away_team_id]", back_populates="away_team")


class Match(Base):
    """Football match model."""

    __tablename__ = "matches"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    api_football_id = Column(Integer, unique=True, nullable=True, index=True)
    home_team_id = Column(PG_UUID(as_uuid=True), ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False, index=True)
    away_team_id = Column(PG_UUID(as_uuid=True), ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False, index=True)
    league_id = Column(String(50), nullable=False, index=True)
    season = Column(String(10), nullable=False, index=True)
    matchday = Column(Integer, nullable=False)
    kickoff = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), default="scheduled", nullable=False)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    home_xg = Column(Float, nullable=True)
    away_xg = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    predictions = relationship("Prediction", back_populates="match", cascade="all, delete-orphan")
    bets = relationship("Bet", back_populates="match", cascade="all, delete-orphan")
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")

    __table_args__ = (
        Index("ix_matches_league_season", "league_id", "season"),
    )


class Prediction(Base):
    """Match prediction model."""

    __tablename__ = "predictions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id = Column(PG_UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    home_win_prob = Column(Float, nullable=False)
    draw_prob = Column(Float, nullable=False)
    away_win_prob = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    confidence_label = Column(String(20), nullable=False)
    expected_goals_home = Column(Float, nullable=True)
    expected_goals_away = Column(Float, nullable=True)
    most_likely_score = Column(String(10), nullable=True)
    model_version = Column(String(20), default="v1.0", nullable=False)

    # Outcome tracking for metrics
    was_correct = Column(Boolean, nullable=True, default=None)
    actual_outcome = Column(String(20), nullable=True)

    # Betting metrics
    betting_stake = Column(Float, nullable=True, default=None)
    betting_profit = Column(Float, nullable=True, default=None)
    betting_outcome = Column(String(20), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    match = relationship("Match", back_populates="predictions")
    user = relationship("User", back_populates="predictions")


class Bet(Base):
    """Virtual betting model."""

    __tablename__ = "bets"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    match_id = Column(PG_UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True)
    bet_type = Column(String(20), nullable=False)
    odds = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    win_amount = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="bets")
    match = relationship("Match", back_populates="bets")


class Device(Base):
    """User device registration for push notifications."""

    __tablename__ = "devices"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device_token = Column(String(255), nullable=False, index=True)
    platform = Column(String(20), nullable=False)  # ios, android, web
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", cascade="all")


class MatchSubscription(Base):
    """User match subscriptions for notifications."""

    __tablename__ = "match_subscriptions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    match_id = Column(PG_UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", cascade="all")
    match = relationship("Match", cascade="all")


class NotificationHistory(Base):
    """History of sent notifications."""

    __tablename__ = "notification_history"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    match_id = Column(PG_UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_type = Column(String(50), nullable=False)  # goal, card, substitution, kickoff, final_whistle
    payload = Column(String(1000), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", cascade="all")
    match = relationship("Match", cascade="all")


# Compatibility alias — some tests import VirtualBet instead of Bet
VirtualBet = Bet
