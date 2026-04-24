# ⚽ Bundesliga Match Analyzer — CLAUDE.md

> **Match Oracle:** KI-gestützte Fußball-Prognose-App für Bundesliga 1+2, Premier League, DFB-Pokal

---

## 🎯 PROJEKTÜBERSICHT

**Status:** MVP Development (Sprint 1-4, 8 Wochen)  
**Reifegrad:** 60% implementiert (Weekend Calculator + Core ML + Mobile UI Skeletons)  
**Ziel:** Production-ready Release mit Auth, Predictions, Virtual Betting

---

## 📐 TECH STACK

### Backend
- **Framework:** FastAPI 0.104 (Python 3.11+)
- **ORM:** SQLAlchemy 2.0 + Alembic
- **Database:** PostgreSQL 16 + TimescaleDB (Time-Series)
- **Cache:** Redis 7 (Session + Predictions)
- **Async:** Celery + Redis Broker (Background Tasks)
- **ML:** XGBoost, Scikit-Learn, SHAP, NumPy, SciPy
- **Validation:** Pydantic V2

### Frontend (Mobile)
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State:** React Context API (kein Redux – KISS)
- **HTTP:** Axios
- **UI:** React Native Paper (Material Design)
- **Build:** Expo EAS (iOS/Android)

### DevOps
- **Container:** Docker + Docker Compose
- **Orchestration:** Docker Compose (MVP), Kubernetes (Scale)
- **CI/CD:** GitHub Actions (Lint, Test, Deploy)
- **Monitoring:** Sentry (Error Tracking), DataDog (Metrics)
- **Logging:** Structured JSON Logs (ELK Stack optional)

### External APIs
- **Fixtures/Stats:** API-Football (7500 req/day Pro)
- **Football Data:** football-data.org (10 req/min)
- **Odds:** OddsAPI (500 req/month Free)
- **Weather:** OpenWeatherMap (1000 req/day Free)
- **Affiliate:** Tipico deeplinks (native betting)

---

## 🏗️ ARCHITEKTUR

### Datenfluss: Weekend-Berechnung (Kernfeature)

```
Nutzer klickt "Alle Spiele berechnen"
        │
        ▼
POST /api/v1/weekend/calculate {leagues: ["bundesliga", "bundesliga2"]}
        │
        ├─→ Sofortige Response: {job_id, status: "calculating"}
        │
        └─→ Background Task (Celery):
            │
            ├─ Hole Wochenend-Spiele (API-Football + Cache)
            │
            ├─ Für jedes Spiel:
            │  ├─ Feature Engineering (39 Faktoren)
            │  ├─ XGBoost Prediction
            │  ├─ Monte Carlo Simulation (100k)
            │  ├─ Elo-Kalibrierung
            │  ├─ SHAP Explanation (Top 3 Faktoren)
            │  └─ Value Bet Detection (vs. Tipico Odds)
            │
            ├─ Speichere alle Prognosen in DB + Redis Cache (24h)
            │
            └─ Response ready: GET /weekend/results/{job_id}
                    │
                    ▼
            Mobile App pollt alle 800ms, zeigt Progress-Bar
                    │
                    ▼
            Fertig: 12 Spiele mit Confidence, Home/Draw/Away Probs
```

### Datenbank-Schichten

| Schicht | Tech | Zweck |
|---------|------|-------|
| **Transactional** | PostgreSQL | User, Bets, Predictions (ACID) |
| **Time-Series** | TimescaleDB | xG-Verläufe, Form-Kurven, Historical Stats |
| **Cache** | Redis | Prognosen, Sessions, Rate Limiting |
| **Storage** | S3/R2 | Logos, Match Videos (Optional) |

### API-Schichten

```
Frontend (Mobile) 
    ↓ REST + JWT
API Gateway (FastAPI)
    │   ├─ Auth Router (Login, Register, Profile)
    │   ├─ Weekend Router (Predictions, Calculations)
    │   ├─ Matches Router (Fixtures, Live, Stats)
    │   ├─ Teams Router (Standings, Form, H2H)
    │   ├─ Players Router (Stats, Injuries)
    │   ├─ Predictions Router (Full Model, Simulate)
    │   └─ Betting Router (Virtual Bets, Portfolio)
    ↓
ML Pipeline
    │   ├─ Feature Engineering (39 Faktoren)
    │   ├─ Ensemble Models (XGBoost, Poisson, Dixon-Coles, Elo)
    │   └─ Monte Carlo Simulation (100k samples)
    ↓
Data Layer
    │   ├─ PostgreSQL (Match Data, User Data)
    │   ├─ TimescaleDB (Historical xG, Form Trends)
    │   └─ Redis (Cache, Queue)
    ↓
External APIs
    ├─ API-Football (Fixtures, Stats)
    ├─ OddsAPI (Bookmaker Odds)
    ├─ OpenWeatherMap (Stadium Weather)
    └─ Tipico Affiliate (Deeplinks)
```

---

## 💻 CODING CONVENTIONS

### Python (Backend)

**Style Guide:** Black (88-char line length) + Flake8

```bash
# Auto-format
black backend/

# Lint
flake8 backend/ --max-line-length=88 --ignore=E203,W503
```

**Imports:** Organized (stdlib → third-party → local)
```python
# 1. Standard library
from datetime import datetime, timedelta
from typing import Optional, List

# 2. Third-party
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
import numpy as np

# 3. Local
from app.core.config import settings
from app.models.schemas import MatchResponse
```

**Type Hints:** Always required (except simple loops)
```python
async def calculate_prediction(
    match_id: str,
    features: MatchFeatures,
    cache: Redis,
) -> PredictionResponse:
    """Calculate match prediction using ensemble models."""
```

**Error Handling:** Never swallow exceptions
```python
# ❌ BAD
try:
    data = api_football.get_match(match_id)
except Exception:
    data = None  # Swallowed!

# ✅ GOOD
try:
    data = api_football.get_match(match_id)
except APIFootballError as e:
    logger.error(f"API-Football unavailable: {e}")
    # Return cached data or raise HTTPException
    raise HTTPException(status_code=503, detail="Data source unavailable")
except ValueError as e:
    logger.warning(f"Invalid match_id: {match_id}, {e}")
    raise HTTPException(status_code=400, detail="Invalid match ID")
```

**Logging:** Structured, with context
```python
logger.info(
    "prediction_calculated",
    extra={
        "match_id": match_id,
        "confidence": 0.78,
        "duration_ms": 456,
        "model_version": "v2.1",
    }
)
```

### TypeScript (Mobile)

**Style Guide:** Prettier (ESLint airbnb)

```bash
# Format
prettier --write mobile/src/

# Lint
eslint mobile/src/ --fix
```

**File Organization:**
```
mobile/src/
├── screens/        # Full-page components
├── components/     # Reusable UI components
├── services/       # API, Auth, Storage
├── hooks/          # Custom React hooks
├── theme/          # Colors, Typography, Spacing
└── utils/          # Helpers (formatters, validators)
```

**Component Style:**
```typescript
import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useQuery } from '@react-query/react-native'

interface WeekendCalculatorProps {
  onCalculate?: (jobId: string) => void
}

export default function WeekendCalculatorScreen({
  onCalculate,
}: WeekendCalculatorProps) {
  const [loading, setLoading] = useState(false)

  // Styles inline (no external .css files)
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  }

  return <View style={styles.container}>{/* ... */}</View>
}
```

**No Redux:** Context API is sufficient for this MVP
```typescript
// ✅ Good: Context
const { predictions, loading } = useWeekendContext()

// ❌ Bad: Redux would be over-engineering
// const predictions = useSelector(state => state.predictions)
```

---

## 🧪 TESTING REQUIREMENTS

### Backend

**Target:** 80% Unit Coverage, 100% Critical Paths Integration

```bash
# Run all tests
pytest backend/tests/ -v --cov=backend --cov-report=html

# Only Unit
pytest backend/tests/unit/ -v

# Only Integration
pytest backend/tests/integration/ -v

# Single file
pytest backend/tests/unit/routers/test_auth.py -v
```

**Test Structure:**
```python
# backend/tests/unit/routers/test_auth.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_register_success(client):
    """Test successful user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "secure123"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"

def test_register_duplicate_email(client, db_user):
    """Test registration with duplicate email raises 400."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": db_user.email, "password": "secure123"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
```

**Integration Tests:** Hit real DB + Redis (Docker)
```python
# backend/tests/integration/test_weekend_calculator.py

@pytest.mark.asyncio
async def test_weekend_calculator_end_to_end(
    client: TestClient,
    auth_token: str,
    postgres_db,
    redis_cache,
):
    """Full E2E: Calculate weekend, fetch results, verify DB."""
    # 1. Start calculation
    response = client.post(
        "/api/v1/weekend/calculate",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"leagues": ["bundesliga"], "simulations": 1000}
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    # 2. Wait for completion
    await wait_for_job(job_id, redis_cache, timeout=30)

    # 3. Fetch results
    response = client.get(
        f"/api/v1/weekend/results/{job_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert len(data["matches"]) > 0

    # 4. Verify DB
    matches = postgres_db.query(Match).filter(...).all()
    assert len(matches) == len(data["matches"])
```

### Mobile

**Target:** Component Tests für kritische Screens

```bash
# Run React Native tests
npm test --watchAll=false

# Coverage
npm test -- --coverage
```

**Component Test:**
```typescript
// mobile/__tests__/screens/WeekendCalculatorScreen.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import WeekendCalculatorScreen from '../../src/screens/WeekendCalculatorScreen'

describe('WeekendCalculatorScreen', () => {
  it('renders league buttons', () => {
    render(<WeekendCalculatorScreen />)
    expect(screen.getByText('⚡ BL1 + BL2 berechnen')).toBeTruthy()
  })

  it('calculates weekend on button press', async () => {
    const { getByText } = render(<WeekendCalculatorScreen />)
    fireEvent.press(getByText('⚡ BL1 + BL2 berechnen'))

    await waitFor(() => {
      expect(screen.getByText(/Berechne Prognosen/i)).toBeTruthy()
    })
  })
})
```

---

## 📋 GIT WORKFLOW

### Branch Strategy: Trunk-Based with Feature Branches

```
main (production)
  ↓ (PR + Review)
feature/weekend-calculator
feature/auth-router
feature/ml-models
feature/mobile-ui

hotfix/fix-jwt-expiry
  ↓ (PR + Hotfix)
main
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

Fixes #123
Closes #456
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Example:**
```
feat(weekend-calculator): add Monte Carlo simulation with 100k samples

- Vectorized NumPy implementation (50ms per match)
- Confidence score based on probability concentration
- Caches results in Redis for 24h

Fixes #42
```

### Code Review Checklist

- [ ] Type hints on all functions
- [ ] Tests pass locally + CI
- [ ] 80% test coverage (if backend)
- [ ] No API keys in code (check .env.example)
- [ ] Database migrations included (if schema changes)
- [ ] Documentation updated (docstrings + API docs)
- [ ] Performance impact considered

---

## 🔐 SECURITY

### API Authentication

**JWT Token Flow:**
```
1. Register/Login → POST /auth/login
2. Receive: {access_token, refresh_token, expires_in}
3. Store refresh_token in Secure HttpOnly Cookie
4. Store access_token in Memory (not localStorage!)
5. Every API call: Authorization: Bearer <access_token>
6. Token expires → POST /auth/refresh (uses HttpOnly cookie)
```

**Token Spec:**
```python
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1704067200,  # 7 days
  "iat": 1703462400,
  "scopes": ["read:predictions", "write:bets"]
}
```

### Environment Variables

**Never commit secrets:**
```bash
# ✅ .env.example (committed)
API_FOOTBALL_KEY=your_key_here
JWT_SECRET=your_secret_here

# ❌ .env (gitignored, NOT committed)
API_FOOTBALL_KEY=abc123xyz789...
JWT_SECRET=super_secret_key_12345...
```

**Check before commit:**
```bash
# Scan for secrets
detect-secrets scan --baseline .baseline.json

# Or manually
git diff --cached | grep -E "password|secret|key|token" && echo "FOUND SECRETS!" || echo "OK"
```

### DSGVO/Data Protection

- ✅ No IP logging (anonymized if required)
- ✅ User can request data export (implement `/api/v1/users/export`)
- ✅ User can request deletion (implement `/api/v1/users/delete`)
- ✅ No third-party tracking (except Sentry errors)
- ✅ HTTPS only (TLS 1.3)
- ✅ Passwords hashed with Bcrypt (cost=12)

---

## ⚡ PERFORMANCE TARGETS

| Endpoint | Target | Notes |
|----------|--------|-------|
| POST /weekend/calculate | < 500ms response | Job ID immediately, async calculation |
| GET /predictions/{match_id} | < 200ms | Cache in Redis if < 6h old |
| POST /auth/login | < 100ms | JWT generation + DB lookup |
| Mobile App Load | < 2s cold | Expo Go, 4G network |
| Weekend Calc (12 matches) | < 10s total | 100k MC simulations, 4 CPU cores |

### Optimization Strategy

**Backend:**
- Redis cache for predictions (24h TTL)
- Database indexes on frequent queries (match.kickoff, user.id)
- Connection pooling (SQLAlchemy pool_size=20)
- Async/await for I/O (API calls, DB queries)

**Mobile:**
- LazyLoad components (only render visible)
- Memoize expensive calculations (useMemo)
- Image caching (react-native-fast-image)
- Polyfill only needed libraries

---

## 📡 KNOWN ISSUES & ROADMAP

### Known Limitations (MVP)

- ❌ No real-time live ticker (only poll every 30s)
- ❌ No offline mode (requires internet)
- ❌ No push notifications (implement after MVP)
- ❌ No player injury scraping (manual updates or premium API)
- ⚠️ Limited to German/English UI
- ⚠️ API-Football Free tier (100 req/day) — will need upgrade for production

### Phase 2 (After MVP)

- 📋 Real-time WebSocket updates
- 📋 Offline mode with sync
- 📋 Push notifications for value bets
- 📋 More leagues (Premier League, La Liga, Serie A)
- 📋 User portfolio analytics (Sharpe ratio, ROI)
- 📋 Tipico API integration (direct betting)

---

## 🚀 QUICK START (Developer)

```bash
# 1. Clone & setup
git clone https://github.com/your-repo/match-oracle.git
cd match-oracle

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with API keys
uvicorn app.main:app --reload

# 3. Database
createdb matchoracle
psql matchoracle < ../database/schema.sql
python ../scripts/seed_database.py --leagues bundesliga,bundesliga2

# 4. Mobile
cd ../mobile
npm install
npx expo start

# 5. Test
pytest ../backend/tests/ -v
npm test
```

---

## 📝 CRITICAL SUCCESS FACTORS

1. **JWT Auth is Gatekeeper** — Everything depends on working Auth Router
2. **Test as you code** — No late-stage integration nightmares
3. **Cache aggressively** — API-Football rate limits are real
4. **Database migrations** — Schema changes require Alembic
5. **Documentation** — Every API endpoint must have Swagger docs
6. **Performance** — Weekend calc must stay < 10s

---

## 👤 Team Context

- **Developer:** Michael Matschos (Safety-first, structured, expects precision)
- **Architecture Style:** Microservices, ML-Pipeline, Security-focused
- **CI/CD:** GitHub Actions (Lint, Test, Build, Deploy)
- **Deployment:** Docker + Railway/Render initially, Kubernetes later

---

**Last Updated:** 2026-04-24  
**Version:** 2.0-MVP  
**Status:** Development (Sprint 1-4)
