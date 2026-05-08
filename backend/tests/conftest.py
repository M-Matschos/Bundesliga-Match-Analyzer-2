"""Pytest configuration and shared fixtures."""

import os
from typing import Generator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Minimal test database URL
TEST_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:test_password@localhost:5432/matchoracle_test"
)


@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine."""
    engine = create_engine(TEST_DATABASE_URL)
    return engine


@pytest.fixture
def db_session(db_engine) -> Generator[Session, None, None]:
    """Provide a database session for tests."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()
