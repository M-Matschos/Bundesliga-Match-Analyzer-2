#!/usr/bin/env python3
"""Quick seed script for Match Oracle database (SQLite)."""

import sqlite3
from datetime import datetime, timedelta
import uuid

DB_PATH = "matchoracle.db"

def init_db():
    """Initialize database with schema."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS leagues (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        country TEXT
    );

    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        api_id INTEGER,
        name TEXT NOT NULL,
        short_name TEXT,
        league_id TEXT,
        logo_url TEXT,
        stadium TEXT,
        stadium_cap INTEGER,
        elo_rating REAL DEFAULT 1500,
        FOREIGN KEY (league_id) REFERENCES leagues(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        api_id INTEGER,
        league_id TEXT,
        home_team_id TEXT,
        away_team_id TEXT,
        kickoff TEXT NOT NULL,
        result TEXT,
        home_goals INTEGER,
        away_goals INTEGER,
        xg_home REAL,
        xg_away REAL,
        season TEXT,
        matchday INTEGER,
        FOREIGN KEY (league_id) REFERENCES leagues(id),
        FOREIGN KEY (home_team_id) REFERENCES teams(id),
        FOREIGN KEY (away_team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        match_id TEXT,
        home_prob REAL,
        draw_prob REAL,
        away_prob REAL,
        confidence REAL,
        model_version TEXT,
        created_at TEXT,
        FOREIGN KEY (match_id) REFERENCES matches(id)
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        full_name TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS bets (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        match_id TEXT,
        amount REAL,
        side TEXT,
        odds REAL,
        status TEXT DEFAULT 'open',
        result TEXT,
        pnl REAL,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (match_id) REFERENCES matches(id)
    );
    """)

    conn.commit()
    print("[OK] Database tables created")
    return conn, cursor

def seed_leagues(cursor):
    """Seed league data."""
    leagues = [
        ('L1', 'BL1', 'Bundesliga', 'Germany'),
        ('L2', 'BL2', '2. Bundesliga', 'Germany'),
        ('L3', 'PL', 'Premier League', 'England'),
    ]

    for lid, code, name, country in leagues:
        try:
            cursor.execute(
                "INSERT INTO leagues (id, code, name, country) VALUES (?, ?, ?, ?)",
                (lid, code, name, country)
            )
        except sqlite3.IntegrityError:
            pass

    print("[OK] Seeded %d leagues" % len(leagues))

def seed_teams(cursor):
    """Seed team data for Bundesliga."""
    teams_bl1 = [
        ('T1', 1, 'Bayern Munich', 'FCB', 'L1', 'https://logo.png', 'Allianz Arena', 75024, 1850),
        ('T2', 2, 'Borussia Dortmund', 'BVB', 'L1', 'https://logo.png', 'Signal Iduna Park', 81365, 1800),
        ('T3', 3, 'Bayer Leverkusen', 'B04', 'L1', 'https://logo.png', 'BayArena', 30210, 1750),
        ('T4', 4, 'RB Leipzig', 'RBL', 'L1', 'https://logo.png', 'Red Bull Arena', 47530, 1740),
        ('T5', 5, 'VfB Stuttgart', 'VFB', 'L1', 'https://logo.png', 'Mercedes-Benz Arena', 60441, 1700),
        ('T6', 6, 'Eintracht Frankfurt', 'SGE', 'L1', 'https://logo.png', 'Deutsche Bank Park', 59674, 1680),
        ('T7', 7, 'VfL Wolfsburg', 'VFL', 'L1', 'https://logo.png', 'Volkswagen Arena', 30000, 1670),
        ('T8', 8, 'Werder Bremen', 'SVW', 'L1', 'https://logo.png', 'Wohninvest Weser-Stadion', 42100, 1650),
        ('T9', 9, 'Hoffenheim', 'TSG', 'L1', 'https://logo.png', 'PreZero Arena', 30150, 1640),
        ('T10', 10, 'Union Berlin', 'FCU', 'L1', 'https://logo.png', 'An der Alten Foresterei', 22012, 1630),
        ('T11', 11, 'SC Freiburg', 'SCF', 'L1', 'https://logo.png', 'Europa-Park Stadion', 34700, 1620),
        ('T12', 12, 'Borussia Monchengladbach', 'BMG', 'L1', 'https://logo.png', 'Borussia-Park', 54074, 1610),
        ('T13', 13, 'Cologne', 'KOE', 'L1', 'https://logo.png', 'RheinEnergieStadion', 49574, 1600),
        ('T14', 14, 'Mainz 05', 'M05', 'L1', 'https://logo.png', 'MEWA Arena', 34034, 1590),
        ('T15', 15, 'Augsburg', 'FCA', 'L1', 'https://logo.png', 'WWK Arena', 30660, 1580),
        ('T16', 16, 'Heidenheim', 'HDH', 'L1', 'https://logo.png', 'Voith-Arena', 15000, 1570),
        ('T17', 17, 'Bochum', 'VER', 'L1', 'https://logo.png', 'Vonovia Ruhrstadion', 27599, 1560),
        ('T18', 18, 'Bielefeld', 'DSC', 'L1', 'https://logo.png', 'Schuco Arena', 26515, 1550),
    ]

    for tid, api_id, name, short, league_id, logo, stadium, cap, elo in teams_bl1:
        try:
            cursor.execute(
                "INSERT INTO teams (id, api_id, name, short_name, league_id, logo_url, stadium, stadium_cap, elo_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (tid, api_id, name, short, league_id, logo, stadium, cap, elo)
            )
        except sqlite3.IntegrityError:
            pass

    print("[OK] Seeded %d teams (Bundesliga)" % len(teams_bl1))

def seed_matches(cursor, conn):
    """Seed match data for current season."""
    cursor.execute("SELECT id FROM teams WHERE league_id = 'L1' ORDER BY id")
    teams = [t[0] for t in cursor.fetchall()]

    base_date = datetime(2025, 4, 26)

    match_count = 0
    for round_num in range(17):
        for i in range(len(teams) // 2):
            home_team = teams[i]
            away_team = teams[-(i+1)]

            if home_team != away_team:
                match_date = base_date + timedelta(weeks=round_num, days=i % 3)
                match_id = str(uuid.uuid4())[:8]

                try:
                    cursor.execute(
                        "INSERT INTO matches (id, league_id, home_team_id, away_team_id, kickoff, season, matchday) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (match_id, 'L1', home_team, away_team, match_date.isoformat(), '2024-25', round_num + 1)
                    )
                    match_count += 1
                except sqlite3.IntegrityError:
                    pass

    conn.commit()
    print("[OK] Seeded %d matches for season 2024-25" % match_count)

def seed_predictions(cursor, conn):
    """Seed dummy prediction data."""
    cursor.execute("SELECT id FROM matches LIMIT 12")
    matches = [m[0] for m in cursor.fetchall()]

    for match_id in matches:
        pred_id = str(uuid.uuid4())[:8]
        try:
            cursor.execute(
                "INSERT INTO predictions (id, match_id, home_prob, draw_prob, away_prob, confidence, model_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (pred_id, match_id, 0.55, 0.25, 0.20, 0.75, 'v1.0', datetime.now().isoformat())
            )
        except sqlite3.IntegrityError:
            pass

    conn.commit()
    print("[OK] Seeded %d predictions" % len(matches))

def verify(cursor):
    """Verify seeded data."""
    cursor.execute("SELECT COUNT(*) FROM leagues")
    leagues = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM teams")
    teams = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM matches")
    matches = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM predictions")
    predictions = cursor.fetchone()[0]

    print("\n" + "="*50)
    print("DATABASE SEEDING SUMMARY")
    print("="*50)
    print("Leagues:     %d" % leagues)
    print("Teams:       %d" % teams)
    print("Matches:     %d" % matches)
    print("Predictions: %d" % predictions)
    print("="*50)
    print("[DONE] ALL DATA SEEDED SUCCESSFULLY!\n")

if __name__ == "__main__":
    print("[START] Starting database seeding...\n")

    conn, cursor = init_db()
    seed_leagues(cursor)
    seed_teams(cursor)
    seed_matches(cursor, conn)
    seed_predictions(cursor, conn)

    conn.commit()
    cursor.close()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    verify(cursor)
    conn.close()

    print("[COMPLETE] Database is ready for API testing!")
