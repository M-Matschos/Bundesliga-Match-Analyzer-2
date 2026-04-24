-- Match Oracle — Vollständiges Datenbankschema
-- PostgreSQL 16 + TimescaleDB

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Ligen
CREATE TABLE leagues (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code    VARCHAR(10) UNIQUE NOT NULL,  -- BL1, BL2, UCL, DFB, PL, CHAMP
  name    VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  api_id  INT                           -- API-Football ID
);

INSERT INTO leagues (code, name, country, api_id) VALUES
  ('BL1',   'Bundesliga',         'Germany', 78),
  ('BL2',   '2. Bundesliga',      'Germany', 79),
  ('UCL',   'Champions League',   'Europe',  2),
  ('DFB',   'DFB-Pokal',          'Germany', 81),
  ('PL',    'Premier League',     'England', 39),
  ('CHAMP', 'Championship',       'England', 40);

-- Vereine
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id        INT UNIQUE,
  name          VARCHAR(100) NOT NULL,
  short_name    VARCHAR(10),
  league_id     UUID REFERENCES leagues(id),
  logo_url      TEXT,
  primary_color VARCHAR(7),
  stadium       VARCHAR(100),
  stadium_cap   INT,
  elo_rating    FLOAT DEFAULT 1500,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Spieler
CREATE TABLE players (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id         INT UNIQUE,
  team_id        UUID REFERENCES teams(id),
  name           VARCHAR(100) NOT NULL,
  position       VARCHAR(20),
  shirt_number   INT,
  nationality    VARCHAR(50),
  birth_date     DATE,
  market_value   BIGINT,
  injury_status  VARCHAR(20) DEFAULT 'fit',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Spiele
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id       INT UNIQUE,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  league_id    UUID REFERENCES leagues(id),
  season       VARCHAR(10),
  matchday     INT,
  kickoff      TIMESTAMPTZ NOT NULL,
  home_goals   INT,
  away_goals   INT,
  home_xg      FLOAT,
  away_xg      FLOAT,
  status       VARCHAR(20) DEFAULT 'scheduled'
);

-- Timescale Hypertable für Zeitreihendaten
SELECT create_hypertable('matches', 'kickoff', if_not_exists => TRUE);

-- KI-Prognosen
CREATE TABLE predictions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id        UUID REFERENCES matches(id) UNIQUE,
  home_win_prob   FLOAT NOT NULL,
  draw_prob       FLOAT NOT NULL,
  away_win_prob   FLOAT NOT NULL,
  confidence      FLOAT NOT NULL DEFAULT 0.5,
  lambda_home     FLOAT,
  lambda_away     FLOAT,
  model_version   VARCHAR(20),
  shap_values     JSONB,
  score_matrix    JSONB,
  value_bets      JSONB,
  features_used   JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Nutzer
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  plan            VARCHAR(20) DEFAULT 'free',
  virtual_balance FLOAT DEFAULT 1000.0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Virtuelle Wetten
CREATE TABLE virtual_bets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id),
  match_id      UUID REFERENCES matches(id),
  bet_type      VARCHAR(50),
  selection     VARCHAR(50),
  odds          FLOAT NOT NULL,
  stake         FLOAT NOT NULL,
  potential_win FLOAT NOT NULL,
  actual_result VARCHAR(20) DEFAULT 'pending',
  placed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Performance-Indizes
CREATE INDEX idx_matches_kickoff   ON matches(kickoff);
CREATE INDEX idx_matches_league    ON matches(league_id, status);
CREATE INDEX idx_matches_teams     ON matches(home_team_id, away_team_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_virtual_bets_user ON virtual_bets(user_id, placed_at DESC);
