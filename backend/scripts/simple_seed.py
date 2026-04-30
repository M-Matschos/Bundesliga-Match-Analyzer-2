#!/usr/bin/env python3
"""Minimal seed script."""

import sqlite3
from datetime import datetime

db = sqlite3.connect("test_seed.db")
c = db.cursor()

# Create tables
c.executescript("""
CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT,
  country TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT,
  short_name TEXT,
  league_id TEXT,
  stadium TEXT,
  elo_rating REAL
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  league_id TEXT,
  home_team_id TEXT,
  away_team_id TEXT,
  kickoff TEXT,
  season TEXT,
  matchday INTEGER
);

CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  match_id TEXT,
  home_prob REAL,
  draw_prob REAL,
  away_prob REAL,
  confidence REAL
);
""")

# Insert leagues
leagues = [
  ('L1', 'BL1', 'Bundesliga', 'Germany'),
  ('L2', 'BL2', '2. Bundesliga', 'Germany'),
]

for lid, code, name, country in leagues:
  c.execute("INSERT OR IGNORE INTO leagues VALUES (?, ?, ?, ?)",
           (lid, code, name, country))

# Insert teams
teams = [
  ('T1', 'Bayern Munich', 'FCB', 'L1', 'Allianz Arena', 1850),
  ('T2', 'Borussia Dortmund', 'BVB', 'L1', 'Signal Iduna Park', 1800),
  ('T3', 'Bayer Leverkusen', 'B04', 'L1', 'BayArena', 1750),
  ('T4', 'RB Leipzig', 'RBL', 'L1', 'Red Bull Arena', 1740),
  ('T5', 'Stuttgart', 'VFB', 'L1', 'Mercedes-Benz Arena', 1700),
]

for tid, name, sn, lid, stadium, elo in teams:
  c.execute("INSERT OR IGNORE INTO teams VALUES (?, ?, ?, ?, ?, ?)",
           (tid, name, sn, lid, stadium, elo))

# Insert matches
matches = [
  ('M1', 'L1', 'T1', 'T2', '2025-04-26T15:30', '2024-25', 1),
  ('M2', 'L1', 'T3', 'T4', '2025-04-26T17:30', '2024-25', 1),
  ('M3', 'L1', 'T5', 'T1', '2025-04-27T15:30', '2024-25', 1),
  ('M4', 'L1', 'T2', 'T3', '2025-04-27T17:30', '2024-25', 1),
  ('M5', 'L1', 'T4', 'T5', '2025-05-03T15:30', '2024-25', 2),
]

for mid, lid, h, a, kickoff, season, md in matches:
  c.execute("INSERT OR IGNORE INTO matches VALUES (?, ?, ?, ?, ?, ?, ?)",
           (mid, lid, h, a, kickoff, season, md))

# Insert predictions
predictions = [
  ('P1', 'M1', 0.65, 0.20, 0.15, 0.78),
  ('P2', 'M2', 0.55, 0.25, 0.20, 0.72),
  ('P3', 'M3', 0.70, 0.15, 0.15, 0.80),
  ('P4', 'M4', 0.50, 0.30, 0.20, 0.65),
  ('P5', 'M5', 0.60, 0.25, 0.15, 0.75),
]

for pid, mid, hp, dp, ap, conf in predictions:
  c.execute("INSERT OR IGNORE INTO predictions VALUES (?, ?, ?, ?, ?, ?)",
           (pid, mid, hp, dp, ap, conf))

db.commit()

# Verify
print("\n[VERIFY] Database content:")
print("Leagues:", c.execute("SELECT COUNT(*) FROM leagues").fetchone()[0])
print("Teams:  ", c.execute("SELECT COUNT(*) FROM teams").fetchone()[0])
print("Matches:", c.execute("SELECT COUNT(*) FROM matches").fetchone()[0])
print("Predictions:", c.execute("SELECT COUNT(*) FROM predictions").fetchone()[0])
print("\n[DONE] Seeding complete!")

db.close()
