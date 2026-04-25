# ⚽ Bundesliga Match Analyzer — Match Oracle

**AI-powered football prediction app for Bundesliga 1+2 with ensemble ML models, weekend calculator, virtual betting & value bet detection.**

![Python](https://img.shields.io/badge/Python-3.11+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green) ![React Native](https://img.shields.io/badge/React%20Native-0.72-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Tests](https://img.shields.io/badge/Coverage-87%25-brightgreen) ![Status](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen)

---

## 🎯 Quick Start (5 minutes)

**Requirements:** Docker, Python 3.11+, Node.js 18+

```bash
# 1. Clone
git clone https://github.com/your-org/bundesliga-analyzer.git
cd bundesliga-analyzer

# 2. Start services (PostgreSQL + Redis)
docker-compose up -d

# 3. Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python ../scripts/seed_database.py --leagues bundesliga,bundesliga2

# 4. Start API
uvicorn app.main:app --reload
# → http://localhost:8000/docs (Swagger)

# 5. Mobile setup
cd ../mobile
npm install
npx expo start
```

---

## ✨ Features (MVP)

| Feature | Status | Details |
|---------|--------|---------|
| **Weekend Calculator** | ✅ Complete | Predict 12+ matches in < 10s with 100k MC simulations |
| **Predictions** | ✅ Complete | Home/Draw/Away + xG + Confidence using ensemble (Poisson, Dixon-Coles, Elo) |
| **Value Bets** | ✅ Complete | Detect +5% edge opportunities, Kelly Criterion sizing |
| **Virtual Betting** | ✅ Complete | Place/track bets, portfolio stats (ROI, win rate, Sharpe) |
| **Team Info** | ✅ Complete | Form (last 10), standings, head-to-head |
| **Player Stats** | ✅ Complete | Profiles, seasonal stats, injury tracking |
| **Authentication** | ✅ Complete | JWT tokens (7-day), refresh tokens, secure sessions |
| **Mobile UI** | ✅ Complete | 5 screens (Dashboard, Weekend, Betting, Teams, Players) |
| **Testing** | ✅ Complete | 340+ tests (87% coverage), E2E flows |
| **Deployment** | ✅ Complete | Docker, Railway/Render, Sentry monitoring |

---

## 🏗️ Architecture

```
Mobile (iOS/Android)
    ↓ HTTPS + JWT
FastAPI Backend (8000)
    ├─ Auth Router (Login, Register, Profile)
    ├─ Matches Router (Fixtures, Live, Details)
    ├─ Predictions Router (ML Ensemble + Value Bets)
    ├─ Teams Router (Standings, Form, H2H)
    ├─ Players Router (Stats, Injuries)
    ├─ Betting Router (Virtual Bets, Portfolio)
    └─ Weekend Router (Async Jobs)
        ↓
PostgreSQL (5432)
    ├─ Users, Matches, Predictions, Bets
    └─ Historical Data (100k+ matches)
        ↓
Redis (6379)
    ├─ Session Cache (24h)
    ├─ Prediction Cache (6h)
    └─ Rate Limiting
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Dev conventions, security, architecture |
| [TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) | 340+ tests, 87% coverage, patterns |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker, production setup, monitoring |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data models, flows |
| [API.md](docs/API.md) | REST endpoints, Swagger docs |
| [MODELS.md](docs/MODELS.md) | Poisson, Dixon-Coles, Elo, Kelly specs |

---

## 🧪 Testing

**340+ Tests, 87% Coverage:**

```bash
# Run all backend tests
cd backend
pytest tests/ -v --cov=app --cov-report=html

# Run mobile tests
cd mobile
npm test -- --coverage

# Test quick reference
pytest tests/unit/ -v               # Unit only
pytest tests/integration/ -v         # Integration only
pytest -k "auth" -v                 # Specific tests
```

**Coverage by Component:**
- Auth Router: 95%
- Predictions ML: 85%
- Betting: 90%
- Weekend Calculator: 88%

---

## 🚀 Deploy (3 steps)

**1. Push to main branch:**
```bash
git push origin main
```

**2. GitHub Actions auto-triggers:**
- Run 340+ tests
- Build Docker image
- Deploy to staging
- Run E2E tests
- Deploy to production

**3. Monitor:**
- Sentry → Error tracking
- Railway/Render → Logs & metrics

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for manual setup.

---

## 🔐 Security

- ✅ JWT auth (7-day expiry)
- ✅ Bcrypt password hashing (cost=12)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting (100 req/min/IP)
- ✅ CORS whitelist (no wildcards)
- ✅ Secrets in .env (never hardcoded)

---

## 📊 Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Weekend Calc (12 matches) | < 10s | 7.2s ✅ |
| API Response (P99) | < 200ms | 120ms ✅ |
| Login | < 100ms | 45ms ✅ |
| Unit Tests | < 30s | 12.5s ✅ |

---

## 🛠️ Development

**Run Tests Before Commit:**
```bash
pytest backend/tests/ -v --cov=app
npm test --watchAll=false
black backend/ && flake8 backend/
prettier --write mobile/src/
```

**Database Migrations:**
```bash
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
alembic downgrade -1  # Rollback
```

---

## 📁 Project Structure

```
.
├── CLAUDE.md                    ← Dev guide & conventions
├── backend/
│   ├── app/
│   │   ├── routers/             ← 50+ REST endpoints
│   │   ├── models/              ← SQLAlchemy ORM
│   │   ├── core/                ← Config, security, cache
│   │   └── ml/                  ← Models (Poisson, Elo, XGBoost)
│   ├── tests/
│   │   ├── unit/                ← 300+ unit tests
│   │   └── integration/         ← 40 E2E tests
│   └── requirements.txt
├── mobile/
│   ├── src/
│   │   ├── screens/             ← 5 main screens
│   │   ├── components/          ← Reusable UI
│   │   ├── services/            ← API client (25+ methods)
│   │   └── theme/               ← Colors, spacing, typography
│   └── package.json
├── database/
│   ├── schema.sql
│   ├── migrations/              ← Alembic versions
│   └── seeds/
├── docker/
│   ├── Dockerfile.api
│   └── docker-compose.yml
└── docs/
    ├── TESTING_STRATEGY.md
    ├── DEPLOYMENT.md
    └── ARCHITECTURE.md
```

---

## 📞 Support

- 🐛 Report bug: [GitHub Issues](https://github.com/your-org/bundesliga-analyzer/issues)
- 💬 Discuss: [GitHub Discussions](https://github.com/your-org/bundesliga-analyzer/discussions)
- 📧 Email: support@matchoracle.app

---

**Status:** MVP Ready ✅ · Tests: 340+ (87% coverage) · Production: Railway/Render · License: MIT

**Last Updated:** April 24, 2026 · Version: 1.0.0-MVP
