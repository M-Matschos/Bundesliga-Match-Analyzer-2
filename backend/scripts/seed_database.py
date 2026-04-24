#!/usr/bin/env python
"""Seed database with initial data."""

import asyncio
import json
from pathlib import Path
from datetime import datetime, timedelta
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.db import User, Match, Prediction, get_db, init_db
from app.core.security import hash_password
from app.core.db import async_session_maker


async def seed_users(session: AsyncSession) -> list[User]:
    """Create test users."""
    users_data = [
        {
            "email": "admin@example.com",
            "username": "admin",
            "password": "secure_admin_123",
            "full_name": "Admin User",
            "is_superuser": True,
        },
        {
            "email": "user1@example.com",
            "username": "user1",
            "password": "secure_user_123",
            "full_name": "Test User 1",
        },
        {
            "email": "user2@example.com",
            "username": "user2",
            "password": "secure_user_123",
            "full_name": "Test User 2",
        },
    ]

    users = []
    for user_data in users_data:
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            password_hash=hash_password(user_data["password"]),
            full_name=user_data.get("full_name"),
            is_superuser=user_data.get("is_superuser", False),
            is_active=True,
        )
        session.add(user)
        users.append(user)

    await session.commit()
    print(f"✅ Created {len(users)} users")
    return users


async def seed_matches(session: AsyncSession) -> list[Match]:
    """Create test matches."""
    teams = [
        ("FCB", "Bayern Munich"),
        ("BVB", "Borussia Dortmund"),
        ("S04", "Schalke 04"),
        ("LVR", "Bayer Leverkusen"),
        ("HAM", "Hamburger SV"),
        ("KÖL", "1. FC Köln"),
    ]

    matches = []
    base_date = datetime.utcnow() + timedelta(days=1)

    for i in range(12):
        home_idx = (i * 2) % len(teams)
        away_idx = (i * 2 + 1) % len(teams)

        match = Match(
            home_team_id=teams[home_idx][0],
            away_team_id=teams[away_idx][0],
            league_id="bundesliga",
            season="2024-25",
            matchday=28 + (i // 6),
            kickoff=base_date + timedelta(days=i // 6, hours=(i % 6) * 3),
            status="scheduled",
        )
        session.add(match)
        matches.append(match)

    await session.commit()
    print(f"✅ Created {len(matches)} matches")
    return matches


async def seed_predictions(
    session: AsyncSession,
    matches: list[Match],
    users: list[User],
) -> None:
    """Create test predictions."""
    predictions = []

    for match in matches:
        prediction = Prediction(
            match_id=match.id,
            user_id=users[0].id,
            home_win_prob=0.55,
            draw_prob=0.25,
            away_win_prob=0.20,
            confidence=0.72,
            confidence_label="MEDIUM",
            expected_goals_home=1.8,
            expected_goals_away=1.1,
            most_likely_score="2:1",
            model_version="v1.0",
        )
        session.add(prediction)
        predictions.append(prediction)

    await session.commit()
    print(f"✅ Created {len(predictions)} predictions")


async def main():
    """Run database seeding."""
    print("🌱 Seeding database...")

    # Initialize database
    await init_db()
    print("✅ Database initialized")

    async with async_session_maker() as session:
        users = await seed_users(session)
        matches = await seed_matches(session)
        await seed_predictions(session, matches, users)

    print("\n✨ Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
