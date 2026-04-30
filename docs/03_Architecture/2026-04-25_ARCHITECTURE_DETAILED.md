# Architecture Document — Match Oracle v1.0

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Audience:** Architects, senior developers, tech leads

---

## 🎯 System Overview

**Match Oracle** is a 3-tier distributed system for AI-powered Bundesliga match predictions using ensemble machine learning models, real-time data collection, and multi-platform clients.

```
┌─────────────────────────────────────────────────────────────┐
│                    MATCH ORACLE v1.0                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 Mobile App (React Native)  🖥️  Desktop (Electron)       │
│       iOS / Android              Windows                    │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    HTTPS/JWT
                         │
┌────────────────────────▼─────────────────────────────────────┐
│          🔗 API GATEWAY (FastAPI)                           │
│  Load Balancer + Auth Middleware + Rate Limiting            │
├─────────────────────────────────────────────────────────────┤
│  ✅ Auth Router      → Register, Login, Profile             │
│  ✅ Matches Router   → Fixtures, Live, Stats                │
│  ✅ Teams Router     → Standings, Form, H2H                 │
│  ✅ Players Router   → Stats, Injuries                      │
│  ✅ Predictions      → ML Results + SHAP Explanations       │
│  ✅ Betting Router   → Virtual Bets, Portfolio              │
│  ✅ Weekend Router   → Multi-match Calculations             │
│  ✅ Alerts Router    → Breaking News Feed                   │
│  ✅ Metrics Router   → Model Accuracy Dashboard             │
└────────────────────────┬─────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌────────┐      ┌─────────┐      ┌─────────┐
   │  💾    │      │  🚀     │      │  📡     │
   │ Data   │      │ Async   │      │ Cache   │
   │ Layer  │      │ Tasks   │      │ Layer   │
   └────────┘      └─────────┘      └─────────┘
        │                │                │
        ├─→ PostgreSQL   ├─→ Celery       ├─→ Redis
        │   (Primary)    │   (Queue)      │   (Sessions)
        │                │                │
        ├─→ TimescaleDB  ├─→ RabbitMQ     └─→ Redis
        │   (Time-Series)│   (Broker)         (Predictions)
        │                │
        └─→ SQLAlchemy   └─→ ML Workers
            (ORM)            (Async)
```

---

## 🏗️ Architectural Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│   PRESENTATION LAYER                │
│   (Mobile App, Desktop, Web)        │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   APPLICATION LAYER                 │
│   (FastAPI Routers + Services)      │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   DOMAIN LAYER                      │
│   (Business Logic, ML Models)       │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   DATA ACCESS LAYER                 │
│   (SQLAlchemy ORM, Repositories)    │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   INFRASTRUCTURE LAYER              │
│   (PostgreSQL, Redis, APIs)         │
└─────────────────────────────────────┘
```

### 2. Asynchronous Task Processing

**Use Case:** Weekend predictions take 8-10 seconds; API must respond immediately

```
User Request (Mobile)
    │
    ▼
POST /api/v1/weekend/calculate
    │
    ├─→ Immediate Response: {job_id: "xyz", status: "queued"}
    │   (Client-side: poll GET /weekend/results/{job_id})
    │
    └─→ Queue Message: Celery Task
        │
        ├─→ Background Worker (Async)
        │   ├─ Load training models
        │   ├─ Fetch weekend fixtures
        │   ├─ Feature engineering (39 factors)
        │   ├─ XGBoost prediction
        │   ├─ Monte Carlo simulation (100k samples)
        │   ├─ Calculate Kelly sizing
        │   └─ Persist to DB + Cache
        │
        └─→ Result stored: Redis (24h TTL) + PostgreSQL
            │
            ▼
        GET /api/v1/weekend/results/{job_id}
        ├─→ Return cached result (if ready)
        └─→ Return 202 if still processing
```

### 3. Cache-Aside Pattern

```
Client Request (GET /predictions/{match_id})
    │
    ├─→ Check Redis Cache
    │   ├─ Cache HIT (< 6h old) → Return immediately
    │   │
    │   └─ Cache MISS / STALE
    │       │
    │       ├─→ Query PostgreSQL
    │       ├─→ Recalculate if stale (>6h)
    │       ├─→ Update Redis (TTL: 6h)
    │       └─→ Return to client
    │
    └─→ Average latency: 40ms (cache) vs 200ms (DB)
```

### 4. Event-Driven Architecture (Celery)

```
Events:
├─ "match.created"          → Fetch live data, calculate xG
├─ "prediction.calculated"  → Send alert if value bet found
├─ "odds.updated"           → Recalculate betting recommendations
└─ "user.registered"        → Send welcome email, create portfolio

Worker Pool (4 CPU cores):
├─ PredictionWorker (high priority)
├─ DataCollectorWorker (low priority)
├─ AlertWorker (high priority)
└─ EmailWorker (low priority)
```

---

## 🗄️ Data Layer Architecture

### Database Schema Overview

```
┌──────────────────┐
│     USERS        │
├──────────────────┤
│ id (PK)          │
│ email (UQ)       │
│ password_hash    │
│ created_at       │
│ updated_at       │
└──────────────────┘
        │
        ├─→ has_many PREDICTIONS
        ├─→ has_many BETS
        ├─→ has_many ALERTS
        └─→ has_one PORTFOLIO

┌──────────────────┐
│     MATCHES      │
├──────────────────┤
│ id (PK)          │
│ api_football_id  │
│ league_id (FK)   │
│ home_team_id (FK)│
│ away_team_id (FK)│
│ kickoff          │
│ result           │
│ xg_home, xg_away │
│ created_at       │
└──────────────────┘
        │
        ├─→ has_many PREDICTIONS
        └─→ has_one STATS (xG, Form, etc.)

┌──────────────────┐
│   PREDICTIONS    │
├──────────────────┤
│ id (PK)          │
│ match_id (FK)    │
│ user_id (FK)     │
│ model_version    │
│ home_prob        │
│ draw_prob        │
│ away_prob        │
│ confidence       │
│ kelly_size       │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│       BETS       │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ prediction_id(FK)│
│ amount           │
│ side (HOME/AWAY) │
│ status           │
│ result           │
│ pnl              │
│ created_at       │
└──────────────────┘
```

### Indexing Strategy

```sql
-- High-priority indexes (frequently queried)
CREATE INDEX idx_matches_league_kickoff 
  ON matches(league_id, kickoff DESC);

CREATE INDEX idx_matches_team_season
  ON matches(home_team_id, season) 
  WHERE result IS NULL;  -- Only unplayed

CREATE INDEX idx_predictions_user_match
  ON predictions(user_id, match_id);

CREATE INDEX idx_bets_user_created
  ON bets(user_id, created_at DESC);

-- Partial indexes (fast filtering)
CREATE INDEX idx_predictions_value_bets
  ON predictions(match_id, kelly_size)
  WHERE kelly_size > 0.05;  -- Only significant bets
```

### TimescaleDB for Time-Series Data

```
-- Hypertable for historical xG tracking
CREATE TABLE xg_timeseries (
  time TIMESTAMPTZ NOT NULL,
  match_id BIGINT NOT NULL,
  team_id BIGINT NOT NULL,
  xg_accumulated FLOAT NOT NULL
);

SELECT create_hypertable('xg_timeseries', 'time');

-- Automatic compression after 7 days
ALTER TABLE xg_timeseries SET (
  timescaledb.compress,
  timescaledb.compress_interval = '7 days'
);

-- Query last 10 matches for team
SELECT xg_accumulated 
FROM xg_timeseries
WHERE team_id = 123 
  AND time > NOW() - INTERVAL '30 days'
ORDER BY time DESC
LIMIT 10;
```

---

## 🤖 Machine Learning Architecture

### Feature Engineering Pipeline

```
Raw Match Data (API-Football)
    │
    ├─→ TEAM FEATURES (18 features)
    │   ├─ Last 5 matches win rate
    │   ├─ Elo rating
    │   ├─ Form (last 10 games)
    │   ├─ Attack/Defense strength (xG based)
    │   ├─ Home advantage factor
    │   └─ Head-to-head record
    │
    ├─→ PLAYER FEATURES (12 features)
    │   ├─ Missing key players (injury/suspension)
    │   ├─ Team depth rating
    │   ├─ Key striker form
    │   └─ Goalkeeper reliability
    │
    ├─→ MATCH CONTEXT (6 features)
    │   ├─ Day of week
    │   ├─ Time of day (early/late kickoff)
    │   ├─ Weather (temperature, wind)
    │   ├─ Stadium capacity
    │   └─ Crowd expectations
    │
    └─→ STATISTICAL FEATURES (3 features)
        ├─ Poisson λ (expected goals)
        ├─ Historical goal distribution
        └─ Over/Under trends

        ▼
    FEATURE VECTOR (39 dimensions)
        │
        ├─→ Standardized (μ=0, σ=1)
        ├─→ Checked for NaN (interpolation)
        └─→ Ready for ML models
```

### Ensemble Prediction Model

```
                    MATCH DATA (39 features)
                         │
            ┌────────────┬────────────┬────────────┐
            │            │            │            │
            ▼            ▼            ▼            ▼
        [XGBoost]    [Poisson]   [Dixon-Coles] [Elo]
        (70% weight) (10% weight) (15% weight)  (5%)
            │            │            │            │
            └────────────┴────────────┴────────────┘
                         │
                    Weighted Average
                         │
            ┌────────────┬────────────┐
            │            │            │
            ▼            ▼            ▼
        Home Prob   Draw Prob   Away Prob
        (Sum = 1.0)
            │
            ├─→ Monte Carlo Simulation (100k samples)
            │   ├─ Sample from probability distribution
            │   ├─ Track goal distribution (0-3+)
            │   ├─ Calculate confidence (probability concentration)
            │   └─ Estimate win/draw/loss likelihood
            │
            └─→ FINAL OUTPUT
                ├─ Match: Home 2.5 vs Away 1.2
                ├─ Prediction: HOME WIN (65% confidence)
                ├─ Kelly Sizing: 5.2% of bankroll
                ├─ Top 3 Factors (SHAP):
                │  ├─ "Home team form" (+0.15 log-odds)
                │  ├─ "Goalkeeper injury" (-0.12 log-odds)
                │  └─ "Elo difference" (+0.08 log-odds)
                └─ Value Bet: YES (vs Tipico 1.75, EV=+3.2%)
```

### Model Performance Tracking

```
Training Phase (Historical Data):
├─ Backtest: 10 years (2014-2024)
├─ Train/Test: 80/20 split by season
├─ Validation: Rolling 1-year forward test
└─ Metrics:
   ├─ Accuracy: 58% (vs 33% random)
   ├─ Calibration: Brier Score 0.18
   ├─ ROI (Kelly sizing): +12% annually
   └─ Sharpe Ratio: 0.42

Live Monitoring (Production):
├─ Weekly accuracy update
├─ Monthly Sharpe recalculation
├─ Alert if accuracy drops < 52%
└─ Automatic retraining if needed
```

---

## 🔐 Security Architecture

### Authentication & Authorization Flow

```
1. USER REGISTRATION
   POST /auth/register
   ├─ Input: {email, password}
   ├─ Validate: email format, password strength (8+ chars, mixed case)
   ├─ Hash: bcrypt(password, cost=12)
   └─ Store: user record in PostgreSQL

2. USER LOGIN
   POST /auth/login
   ├─ Input: {email, password}
   ├─ Lookup: user by email
   ├─ Verify: bcrypt.verify(password, stored_hash)
   ├─ Generate JWT token:
   │  {
   │    sub: user_id,
   │    email: user@example.com,
   │    scopes: ["read:predictions", "write:bets"],
   │    exp: now + 30 minutes,
   │    iat: now
   │  }
   ├─ Sign: HS256(JWT, SECRET_KEY)
   ├─ Generate refresh_token (7-day expiry)
   └─ Return: {access_token, refresh_token, expires_in}

3. API REQUEST WITH JWT
   GET /api/v1/predictions/...
   Header: Authorization: Bearer <access_token>
   │
   ├─ FastAPI middleware intercepts
   ├─ Extract token from header
   ├─ Verify signature: HS256(token, SECRET_KEY)
   ├─ Check expiration (exp > now)
   ├─ Check scopes match endpoint requirements
   └─ Inject user context into request

4. TOKEN REFRESH
   POST /auth/refresh
   ├─ Input: refresh_token (HttpOnly cookie)
   ├─ Verify: signature + expiration
   ├─ Generate new access_token
   └─ Return: new token (30 min validity)

5. LOGOUT
   POST /auth/logout
   ├─ Blacklist refresh_token (Redis set)
   ├─ Client deletes local access_token
   └─ Subsequent requests fail (no valid token)
```

### Data Protection

```
├─ Passwords: Bcrypt (cost=12, unrecoverable)
├─ JWT Token: HS256 (HMAC-SHA256, symmetric)
├─ Sensitive Data: Encrypted at rest (optional, AES-256)
├─ HTTPS: TLS 1.3, enforced
├─ CORS: Restricted to production origin only
├─ SQL Injection: Prevented via SQLAlchemy ORM (parameterized queries)
├─ XSS: React/React Native sanitization (no raw HTML)
└─ Rate Limiting: 1000 req/min per IP (Redis counter)
```

---

## 📡 API Gateway Design

```
                    CLIENT REQUEST
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    [Browser]       [Mobile App]    [Desktop App]
        │                │                │
        └────────────────┴────────────────┘
                         │
                    HTTPS (TLS 1.3)
                         │
              ┌──────────▼──────────┐
              │  Load Balancer      │
              │  (Cloud Native)     │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    [API Pod 1]    [API Pod 2]    [API Pod 3]
    (8000/tcp)     (8000/tcp)     (8000/tcp)
        │                │                │
        └────────────────┴────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    [Auth]          [Cache]         [DB]
  Middleware      (Redis)      (PostgreSQL)
    (JWT)          (Sessions)   (Predictions)
                   (Predictions)
```

### Request Processing Pipeline

```
Incoming Request: GET /api/v1/matches?league=bundesliga

    │
    ├─→ [1] ROUTING: Match to correct router
    │       (FastAPI APIRouter dispatcher)
    │
    ├─→ [2] AUTHENTICATION: Validate JWT
    │       (If endpoint requires auth)
    │       Middleware: check Authorization header
    │
    ├─→ [3] AUTHORIZATION: Check scope/permissions
    │       Middleware: verify user role (admin, user, viewer)
    │
    ├─→ [4] VALIDATION: Check input parameters
    │       Pydantic models: parse, validate, convert types
    │
    ├─→ [5] RATE LIMITING: Check request quota
    │       Redis counter: ip:endpoint → increment
    │       If exceeded: 429 Too Many Requests
    │
    ├─→ [6] HANDLER: Business logic execution
    │       1. Check Redis cache
    │       2. If miss, query PostgreSQL
    │       3. Update Redis (24h TTL)
    │       4. Return response
    │
    ├─→ [7] SERIALIZATION: Convert to JSON
    │       Pydantic model dump
    │
    ├─→ [8] RESPONSE HEADERS: Add metadata
    │       X-Request-ID, Cache-Control, CORS headers
    │
    └─→ [9] ERROR HANDLING: If exception
        ├─ Log error (Sentry)
        ├─ Sanitize message (no stack trace to client)
        └─ Return HTTP error code
```

---

## 🔄 Integration Points

### External APIs (Data Ingestion)

```
┌──────────────────────────────────────────┐
│     EXTERNAL DATA SOURCES                │
├──────────────────────────────────────────┤
│                                          │
│  API-Football          OddsAPI           │
│  (Fixtures, Stats)     (Bookmaker Odds)  │
│  100 req/day           500 req/month     │
│                                          │
│  OpenWeatherMap        Football-Data.org │
│  (Weather)             (Alternative Data)│
│  1000 req/day          10 req/min        │
│                                          │
└──────────────────────────────────────────┘
         │                │              │
         ├─→ Async Collectors (Celery)
         │   ├─ APIFootballCollector
         │   ├─ OddsCollector
         │   ├─ WeatherCollector
         │   └─ Error handling + retry
         │
         ├─→ Data Validation
         │   └─ Check for missing fields, bad timestamps
         │
         ├─→ Data Enrichment
         │   ├─ Calculate xG from shot data
         │   ├─ Merge with historical data
         │   └─ Calculate feature vectors
         │
         └─→ Store in PostgreSQL + Cache
             ├─ Raw match data (immutable)
             ├─ Calculated features (cached)
             └─ Predictions (TTL: 6-24h)
```

### Mobile App Integration

```
Mobile App (React Native)
    │
    ├─→ HTTP/REST (no WebSocket for MVP)
    ├─→ JWT token in Authorization header
    ├─→ AsyncStorage for token persistence
    ├─→ Axios interceptor for error handling
    ├─→ Long polling for weekend results (500ms interval)
    │
    └─→ API Endpoints:
        ├─ POST /auth/register
        ├─ POST /auth/login
        ├─ GET /matches
        ├─ POST /weekend/calculate
        ├─ GET /weekend/results/{job_id}
        ├─ GET /predictions/{match_id}
        ├─ POST /bets (virtual)
        └─ GET /alerts
```

---

## 📈 Scalability Design

### Horizontal Scaling

```
Current (MVP):
┌───────┐
│ 1 API │ 1000 users
│ Pod   │ ~50 req/s
└───────┘

As Traffic Grows (Add Pods):
┌───────┐  ┌───────┐  ┌───────┐
│ API 1 │  │ API 2 │  │ API 3 │
└───────┘  └───────┘  └───────┘
     │         │         │
     └─────────┴─────────┘
          │
    [Load Balancer]
    (Round-robin / least-conn)
          │
    [PostgreSQL]
    (Connection pooling)

Max capacity: 10k users, 500 req/s
(Based on 50 req/s per pod, 10 pods max)
```

### Database Optimization

```
Query Performance Optimization:

Problem: "Get all predictions for league"
SELECT * FROM predictions 
WHERE match_id IN (SELECT id FROM matches WHERE league_id = 1)

Slow: Full table scan, no index

Solution:
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_matches_league_id ON matches(league_id);

Fast: Index join, ~5ms for 10k rows
```

### Cache Optimization

```
Cache Hierarchy:

L1: In-Memory (FastAPI, <1ms)
├─ Model weights (XGBoost, Poisson)
└─ Loaded once at startup

L2: Redis (Network, ~10ms)
├─ User sessions (24h TTL)
├─ Predictions (6h TTL)
├─ Team standings (1h TTL)
└─ Odds snapshots (30m TTL)

L3: PostgreSQL (Disk, ~200ms)
├─ Historical data (immutable)
├─ User data (mutable)
└─ Audit logs (append-only)

Cache Hit Rate Target: 85%+ (costs money otherwise)
```

---

## 🚀 Deployment Architecture

```
                   Git Push (main branch)
                         │
                         ▼
                  GitHub Actions CI/CD
                    (Lint, Test, Build)
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
     Build Docker Image        Build Mobile APK
     (API + Dependencies)      (Expo EAS Cloud)
            │                         │
            ├─→ Push to Registry      ├─→ Upload to Play Store
            │                         │
            └─────────────┬───────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
      Deploy to Staging          Deploy to Production
      (Kubernetes)               (Blue-Green)
            │                         │
            ├─→ Run E2E Tests         ├─→ Gradual Rollout (Canary)
            ├─→ Load Testing          │
            └─→ Manual Approval       └─→ Production (100%)
```

---

## 🔗 Related Documents

- [API Reference](01_API_REFERENCE.md) — Endpoint specifications
- [Developer Setup](02_DEVELOPER_SETUP.md) — Local development
- [Deployment Runbook](03_DEPLOYMENT_RUNBOOK.md) — Production deployment
- [Onboarding Guide](05_ONBOARDING.md) — Team onboarding

---

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Next Review:** 2026-06-01
