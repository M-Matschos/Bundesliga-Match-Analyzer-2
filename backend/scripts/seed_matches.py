"""Seed database with Bundesliga match data."""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import sys
sys.path.insert(0, "..")

from app.models.db import engine, async_session_maker, Match, User
from app.core.security import hash_password


async def seed_matches():
    """Seed database with Bundesliga match data."""
    async with async_session_maker() as session:
        # Check if data already exists
        result = await session.execute(select(Match))
        existing = result.scalar_one_or_none()
        if existing:
            print("[OK] Matches already seeded")
            return

        # Sample Bundesliga matchday 28 (2025-03-29/30)
        base_date = datetime(2025, 3, 29, 15, 30)

        matches_data = [
            # Matchday 28
            ("BM", "FCK", "bundesliga", "2024-25", 28, base_date, None, None),
            ("BVB", "HSV", "bundesliga", "2024-25", 28, base_date + timedelta(hours=1), None, None),
            ("SCF", "S04", "bundesliga", "2024-25", 28, base_date + timedelta(hours=2), None, None),
            ("FCB", "RBL", "bundesliga", "2024-25", 28, base_date + timedelta(hours=3), None, None),
            ("WOB", "M05", "bundesliga", "2024-25", 28, base_date + timedelta(hours=4), None, None),
            ("B04", "SGE", "bundesliga", "2024-25", 28, base_date + timedelta(hours=5), None, None),
            ("VfL", "BEN", "bundesliga", "2024-25", 28, base_date + timedelta(hours=6), 2, 1),
            ("HAN", "AUG", "bundesliga", "2024-25", 28, base_date + timedelta(hours=7), 1, 1),
            ("SCP", "STU", "bundesliga", "2024-25", 28, base_date + timedelta(hours=8), 0, 0),
            ("TSG", "FCN", "bundesliga", "2024-25", 28, base_date + timedelta(hours=9), 3, 1),
            ("KÖL", "MGL", "bundesliga", "2024-25", 28, base_date + timedelta(hours=10), 2, 2),
            ("MZE", "WHU", "bundesliga", "2024-25", 28, base_date + timedelta(hours=11), None, None),
        ]

        matches = []
        for home, away, league, season, matchday, kickoff, home_score, away_score in matches_data:
            match = Match(
                home_team_id=home,
                away_team_id=away,
                league_id=league,
                season=season,
                matchday=matchday,
                kickoff=kickoff,
                status="scheduled" if home_score is None else "finished",
                home_score=home_score,
                away_score=away_score,
                home_xg=None,
                away_xg=None,
            )
            matches.append(match)
            session.add(match)

        await session.commit()
        print(f"[OK] Seeded {len(matches)} matches")


async def seed_users():
    """Seed database with test users."""
    async with async_session_maker() as session:
        # Check if test user exists
        result = await session.execute(select(User).where(User.email == "test@example.com"))
        existing = result.scalar_one_or_none()
        if existing:
            print("[OK] Users already seeded")
            return

        users = [
            User(
                email="test@example.com",
                username="testuser",
                password_hash=hash_password("TestPass123"),
                full_name="Test User",
                is_active=True,
            ),
            User(
                email="admin@example.com",
                username="admin",
                password_hash=hash_password("AdminPass123"),
                full_name="Admin User",
                is_active=True,
                is_superuser=True,
            ),
        ]

        for user in users:
            session.add(user)

        await session.commit()
        print(f"[OK] Seeded {len(users)} users")


async def main():
    """Run all seed functions."""
    print("[START] Seeding database...")
    await seed_users()
    await seed_matches()
    print("[OK] Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
