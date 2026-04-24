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
engine = create_async_engine(
    settings.sqlalchemy_database_url_async,
    echo=settings.db_echo,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    # Connection pool settings
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
    # Async settings
    future=True,
)

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

    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_username", "username"),
    )


class Match(Base):
    """Football match model."""

    __tablename__ = "matches"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    api_football_id = Column(Integer, unique=True, nullable=True, index=True)
    home_team_id = Column(String(50), nullable=False, index=True)
    away_team_id = Column(String(50), nullable=False, index=True)
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

    __table_args__ = (
        Index("ix_matches_league_season", "league_id", "season"),
        Index("ix_matches_kickoff", "kickoff"),
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
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    match = relationship("Match", back_populates="predictions")
    user = relationship("User", back_populates="predictions")

    __table_args__ = (
        Index("ix_predictions_match_id", "match_id"),
        Index("ix_predictions_user_id", "user_id"),
    )


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

    __table_args__ = (
        Index("ix_bets_user_id", "user_id"),
        Index("ix_bets_match_id", "match_id"),
    )
