# 🗄️ Datenbankschema

---

## Kern-Tabellen (SQL)

```sql
-- Ligen
CREATE TABLE leagues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(10) UNIQUE,  -- BL1, BL2, UCL, DFB, PL, CHAMP
  name         VARCHAR(100),
  country      VARCHAR(50),
  api_id       INT                  -- API-Football Liga-ID
);

-- Vereine
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id        INT UNIQUE,
  name          VARCHAR(100),
  short_name    VARCHAR(10),
  league_id     UUID REFERENCES leagues(id),
  logo_url      TEXT,
  primary_color VARCHAR(7),        -- Hex: #C8102E
  stadium       VARCHAR(100),
  stadium_cap   INT,
  elo_rating    FLOAT DEFAULT 1500,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Spieler
CREATE TABLE players (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id       INT UNIQUE,
  team_id      UUID REFERENCES teams(id),
  name         VARCHAR(100),
  position     VARCHAR(20),        -- GK, CB, CM, ST, ...
  shirt_number INT,
  nationality  VARCHAR(50),
  birth_date   DATE,
  market_value BIGINT,             -- in Euro
  injury_status VARCHAR(20) DEFAULT 'fit'  -- fit, doubtful, out
);

-- Spiele
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id       INT UNIQUE,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  league_id    UUID REFERENCES leagues(id),
  season       VARCHAR(10),        -- '2024-25'
  matchday     INT,
  kickoff      TIMESTAMPTZ,
  home_goals   INT,                -- NULL = noch nicht gespielt
  away_goals   INT,
  home_xg      FLOAT,
  away_xg      FLOAT,
  status       VARCHAR(20) DEFAULT 'scheduled'  -- scheduled, live, finished
);

-- KI-Prognosen
CREATE TABLE predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID REFERENCES matches(id) UNIQUE,
  home_win_prob   FLOAT,           -- 0.0 bis 1.0
  draw_prob       FLOAT,
  away_win_prob   FLOAT,
  confidence      FLOAT,           -- 0.0 bis 1.0
  lambda_home     FLOAT,           -- Poisson λ Heim
  lambda_away     FLOAT,           -- Poisson λ Auswärts
  model_version   VARCHAR(20),
  shap_values     JSONB,           -- {"xg_home": 0.12, "injury_away": -0.08, ...}
  score_matrix    JSONB,           -- {"0:0": 0.08, "1:0": 0.14, ...}
  value_bets      JSONB,           -- [{"market": "1X2", "edge": 0.07}, ...]
  features_used   JSONB,           -- alle 39 Feature-Werte (Audit-Trail)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Virtuelle Wetten
CREATE TABLE virtual_bets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  match_id        UUID REFERENCES matches(id),
  bet_type        VARCHAR(50),     -- 1X2, BTTS, Over25, ExactScore, AH
  selection       VARCHAR(50),     -- 'home', 'draw', 'away', '2:1'
  odds            FLOAT,
  stake           FLOAT,           -- in virtuellen Euro
  potential_win   FLOAT,
  actual_result   VARCHAR(20),     -- won, lost, void, pending
  placed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Nutzer
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE,
  plan            VARCHAR(20) DEFAULT 'free',  -- free, premium, pro
  virtual_balance FLOAT DEFAULT 1000.0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indizes (Performance)

```sql
CREATE INDEX idx_matches_kickoff    ON matches(kickoff);
CREATE INDEX idx_matches_league     ON matches(league_id, status);
CREATE INDEX idx_predictions_match  ON predictions(match_id);
CREATE INDEX idx_virtual_bets_user  ON virtual_bets(user_id, placed_at DESC);
CREATE INDEX idx_teams_league       ON teams(league_id);
```

---

## Historische Daten

10 Jahre Bundesliga + 5 Jahre Premier League bereits in der DB:

```bash
# Datenbank mit Historik befüllen
python database/seeds/seed_database.py --league BL1 --years 10
python database/seeds/seed_database.py --league BL2 --years 10
python database/seeds/seed_database.py --league PL  --years 5
```

---

*→ [System](SYSTEM.md) · [Tech Stack](TECH_STACK.md)*
