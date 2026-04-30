"""Seed Bundesliga 1 + 2 teams into the teams table.

Idempotent: skips teams that already exist (matched by name).

Usage:
    cd backend
    python scripts/seed_teams.py

    # Dry-run (print only, no DB writes):
    python scripts/seed_teams.py --dry-run
"""
import asyncio
import sys
import uuid
from pathlib import Path

# Make app importable when run from backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.models.db import async_session_maker, init_db, Team


# ─── Seed Data ────────────────────────────────────────────────

BUNDESLIGA_1: list[dict] = [
    {"name": "Bayern Munich",           "logo_url": "https://media.api-sports.io/football/teams/40.png",   "position": 1},
    {"name": "Bayer Leverkusen",        "logo_url": "https://media.api-sports.io/football/teams/36.png",   "position": 2},
    {"name": "Borussia Dortmund",       "logo_url": "https://media.api-sports.io/football/teams/34.png",   "position": 3},
    {"name": "RB Leipzig",              "logo_url": "https://media.api-sports.io/football/teams/173.png",  "position": 4},
    {"name": "Eintracht Frankfurt",     "logo_url": "https://media.api-sports.io/football/teams/35.png",   "position": 5},
    {"name": "VfB Stuttgart",           "logo_url": "https://media.api-sports.io/football/teams/172.png",  "position": 6},
    {"name": "SC Freiburg",             "logo_url": "https://media.api-sports.io/football/teams/160.png",  "position": 7},
    {"name": "Union Berlin",            "logo_url": "https://media.api-sports.io/football/teams/182.png",  "position": 8},
    {"name": "Borussia Mönchengladbach","logo_url": "https://media.api-sports.io/football/teams/163.png",  "position": 9},
    {"name": "Werder Bremen",           "logo_url": "https://media.api-sports.io/football/teams/162.png",  "position": 10},
    {"name": "FC Augsburg",             "logo_url": "https://media.api-sports.io/football/teams/170.png",  "position": 11},
    {"name": "1. FC Heidenheim",        "logo_url": "https://media.api-sports.io/football/teams/180.png",  "position": 12},
    {"name": "TSG Hoffenheim",          "logo_url": "https://media.api-sports.io/football/teams/167.png",  "position": 13},
    {"name": "VfL Wolfsburg",           "logo_url": "https://media.api-sports.io/football/teams/161.png",  "position": 14},
    {"name": "VfL Bochum",              "logo_url": "https://media.api-sports.io/football/teams/168.png",  "position": 15},
    {"name": "1. FC Köln",              "logo_url": "https://media.api-sports.io/football/teams/165.png",  "position": 16},
    {"name": "FC St. Pauli",            "logo_url": "https://media.api-sports.io/football/teams/164.png",  "position": 17},
    {"name": "Holstein Kiel",           "logo_url": "https://media.api-sports.io/football/teams/176.png",  "position": 18},
]

BUNDESLIGA_2: list[dict] = [
    {"name": "Hamburger SV",            "logo_url": "https://media.api-sports.io/football/teams/32.png",   "position": 1},
    {"name": "Fortuna Düsseldorf",      "logo_url": "https://media.api-sports.io/football/teams/169.png",  "position": 2},
    {"name": "Karlsruher SC",           "logo_url": "https://media.api-sports.io/football/teams/178.png",  "position": 3},
    {"name": "1. FC Nürnberg",          "logo_url": "https://media.api-sports.io/football/teams/166.png",  "position": 4},
    {"name": "Hannover 96",             "logo_url": "https://media.api-sports.io/football/teams/171.png",  "position": 5},
    {"name": "Darmstadt 98",            "logo_url": "https://media.api-sports.io/football/teams/179.png",  "position": 6},
    {"name": "SpVgg Greuther Fürth",    "logo_url": "https://media.api-sports.io/football/teams/174.png",  "position": 7},
    {"name": "Eintracht Braunschweig",  "logo_url": "https://media.api-sports.io/football/teams/186.png",  "position": 8},
    {"name": "Preußen Münster",         "logo_url": "https://media.api-sports.io/football/teams/2421.png", "position": 9},
    {"name": "1. FC Magdeburg",         "logo_url": "https://media.api-sports.io/football/teams/2417.png", "position": 10},
    {"name": "Schalke 04",              "logo_url": "https://media.api-sports.io/football/teams/33.png",   "position": 11},
    {"name": "Hertha BSC",              "logo_url": "https://media.api-sports.io/football/teams/159.png",  "position": 12},
    {"name": "SV Elversberg",           "logo_url": "https://media.api-sports.io/football/teams/2420.png", "position": 13},
    {"name": "FC Kaiserslautern",       "logo_url": "https://media.api-sports.io/football/teams/177.png",  "position": 14},
    {"name": "Jahn Regensburg",         "logo_url": "https://media.api-sports.io/football/teams/2418.png", "position": 15},
    {"name": "SSV Ulm 1846",            "logo_url": "https://media.api-sports.io/football/teams/2419.png", "position": 16},
    {"name": "SV Wehen Wiesbaden",      "logo_url": "https://media.api-sports.io/football/teams/185.png",  "position": 17},
    {"name": "Hansa Rostock",           "logo_url": "https://media.api-sports.io/football/teams/175.png",  "position": 18},
]

ALL_LEAGUES: list[tuple[str, list[dict]]] = [
    ("bundesliga",  BUNDESLIGA_1),
    ("bundesliga2", BUNDESLIGA_2),
]


# ─── Core ─────────────────────────────────────────────────────

async def seed_teams(dry_run: bool = False) -> None:
    """Insert teams that don't yet exist — idempotent by name."""
    if not dry_run:
        await init_db()

    inserted = 0
    skipped = 0

    async with async_session_maker() as session:
        for league, teams in ALL_LEAGUES:
            for data in teams:
                stmt = select(Team).where(Team.name == data["name"])
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()

                if existing:
                    print(f"  SKIP   {data['name']} ({league})")
                    skipped += 1
                    continue

                if dry_run:
                    print(f"  DRY    {data['name']} ({league})")
                    inserted += 1
                    continue

                session.add(Team(
                    id=uuid.uuid4(),
                    name=data["name"],
                    logo_url=data.get("logo_url"),
                    league=league,
                    position=data.get("position"),
                    wins=0,
                    draws=0,
                    losses=0,
                    goals_for=0,
                    goals_against=0,
                    points=0,
                ))
                print(f"  INSERT {data['name']} ({league})")
                inserted += 1

        if not dry_run:
            await session.commit()

    mode = "DRY RUN" if dry_run else "DONE"
    print(f"\n{mode}: {inserted} inserted, {skipped} skipped.")


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    asyncio.run(seed_teams(dry_run=dry_run))
