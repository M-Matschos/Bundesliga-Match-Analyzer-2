# Onboarding Guide — Match Oracle v1.0

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Audience:** New team members, interns, contractors

---

## 👋 Welcome to Match Oracle!

This guide helps you get up to speed in your first week. We'll cover:
1. **Project context** (what we build, why it matters)
2. **Team structure** (who does what)
3. **Local setup** (< 1 hour to "Hello World")
4. **Key systems** (backend, frontend, databases)
5. **Common workflows** (daily tasks, debugging)
6. **Who to ask for what** (support channels)

---

## 🎯 Project Context (5 Minutes)

### What is Match Oracle?

**Match Oracle** is an AI-powered prediction engine for German Bundesliga football matches. We predict match outcomes (Home/Draw/Away) using ensemble machine learning models trained on 10 years of historical data.

**For Users:**
- Mobile app (iOS/Android) to get predictions + virtual betting
- Desktop app for detailed analysis
- Web dashboard for team stats and alerts

**For Us (Engineers):**
- 3-tier distributed system (Frontend, Backend, Data)
- Real-time data collection from API-Football
- Complex ML pipeline (XGBoost, Poisson, Monte Carlo)
- 35+ REST API endpoints
- 80%+ test coverage requirement

### Why We Built This

**Business Goal:** Generate betting value through accurate match predictions
- Baseline: Random guessing = 33% accuracy
- Our goal: 58%+ accuracy (Sharpe ratio 0.4+)
- ROI: +12% annually with Kelly sizing

**Tech Goal:** Build production-ready AI system that scales
- Learn: ML in production, distributed systems, DevOps
- Practice: Testing, code review, documentation
- Ship: Real users, real money (simulated in MVP)

### Core Values

1. **Precision:** Code must be correct (80% test coverage)
2. **Clarity:** Readable, well-documented code
3. **Safety:** No data leaks, secure authentication
4. **Speed:** MVP first, polish later

---

## 👥 Team Structure

```
┌─────────────────────────────────────┐
│  Michael Matschos                   │
│  Founder + Lead Architect           │
│  • Strategic decisions              │
│  • Code review                      │
│  • Security/DevOps                  │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Backend   Frontend
Dev       Dev
```

### Your Role

**Backend Developer:**
- Implement new API endpoints
- Write unit tests + integration tests
- Optimize database queries
- Integrate external APIs

**Mobile Developer:**
- Build React Native screens
- Component architecture + styling
- Handle API calls + error handling
- Test on iOS/Android simulators

**DevOps Engineer:**
- CI/CD pipelines (GitHub Actions)
- Docker + Kubernetes
- Monitoring + logging
- Production deployments

---

## 🚀 Local Setup (< 1 Hour)

### Prerequisite Check (5 minutes)

```bash
# Ensure you have these installed
node --version     # Should be 18.0+
python --version   # Should be 3.11+
git --version      # Should be 2.30+

# If missing, see Developer Setup Guide (02_DEVELOPER_SETUP.md)
```

### Backend Setup (15 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Copy config
cp .env.example .env

# Edit .env (ask for values in #setup Slack channel)
# At minimum, you need:
# - DATABASE_URL=postgresql://...
# - REDIS_URL=redis://localhost:6379
# - SECRET_KEY=something-random

# Start backend
uvicorn app.main:app --reload --port 8000
```

✅ **Success:** http://localhost:8000/docs shows API documentation

### Database Setup (10 minutes)

```bash
# In a new terminal, with backend venv activated

# Run migrations
alembic upgrade head

# Seed data
python scripts/seed_database.py --leagues bundesliga,bundesliga2

# Verify
psql -U postgres -d matchoracle -c "SELECT COUNT(*) FROM teams;"
# Should print: 36
```

✅ **Success:** Database has Teams, Matches, Players

### Mobile Setup (15 minutes)

```bash
cd ../mobile

# Install dependencies
npm install --legacy-peer-deps

# Start Expo dev server
npx expo start

# In another window, test in browser
# Press 'w' for web, should open http://localhost:19006
```

✅ **Success:** Mobile app loads in browser with "Loading..." message

### Desktop Setup (10 minutes)

```bash
cd ../desktop

# Install dependencies
npm install

# Build React
npm run build:react

# Start Electron
npm start

# Window should open showing placeholder UI
```

✅ **Success:** Window opens without crashing

### Verify Complete Setup (5 minutes)

```bash
# Run a full test to verify everything connects

# 1. Backend running?
curl http://localhost:8000/api/v1/health

# 2. Database seeded?
curl http://localhost:8000/api/v1/teams?league=bundesliga

# 3. Auth working?
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# All should return 200-201 status
```

---

## 🔑 Key Systems (Next 2 Days)

### 1. Backend API (FastAPI)

**Location:** `/backend/app/main.py`

**Key Files:**
- `routers/` — 9 endpoint groups (auth, matches, predictions, etc.)
- `models/` — Data models (SQLAlchemy + Pydantic)
- `core/config.py` — Environment configuration
- `middleware/` — Error handling, logging

**To Add New Endpoint:**
1. Create in appropriate router (e.g., `routers/matches.py`)
2. Add Pydantic schema in `models/schemas.py`
3. Write unit tests in `tests/unit/routers/test_matches.py`
4. Run: `pytest tests/unit/ -v`
5. PR with tests passing

**Common Tasks:**
```bash
# Run specific test
pytest tests/unit/routers/test_auth.py::test_register -v

# Run all tests with coverage
pytest --cov=app tests/

# Format code (Black)
black backend/

# Check types (optional)
mypy backend/ --ignore-missing-imports
```

### 2. Mobile App (React Native)

**Location:** `/mobile/src`

**Key Files:**
- `screens/` — Full-screen components
- `components/` — Reusable UI components
- `services/api.ts` — API client
- `theme/` — Colors, fonts

**To Add New Screen:**
1. Create in `screens/NewScreen.tsx`
2. Add navigation route in `_layout.tsx`
3. Use components from `components/`
4. Import API from `services/api.ts`
5. Test: `npm test`

**Common Tasks:**
```bash
# Start dev server
npx expo start

# Format code (Prettier)
npm run format

# Run tests
npm test -- --watch

# Check types (TypeScript)
npx tsc --noEmit
```

### 3. Database (PostgreSQL)

**Location:** `/database/schema.sql`

**Key Concepts:**
- Users, Teams, Matches, Players, Predictions, Bets
- Indexes on frequently queried columns
- Foreign keys for referential integrity

**Common Tasks:**
```bash
# Connect to DB
psql -U postgres -d matchoracle

# View schema
\d  # List all tables
\d matches  # Describe table

# Query data
SELECT COUNT(*) FROM teams;
SELECT * FROM matches LIMIT 5;

# Update schema (use migrations!)
# 1. Create migration: alembic revision --autogenerate -m "add column"
# 2. Edit migration file in database/migrations/versions/
# 3. Run: alembic upgrade head
```

### 4. ML Pipeline (XGBoost)

**Location:** `/backend/ml/models/`

**Key Files:**
- `xgboost_model.py` — Main prediction engine
- `feature_engineering.py` — Feature extraction
- `monte_carlo.py` — Simulation

**To Understand Predictions:**
1. Feature vector (39 dimensions) built from match data
2. XGBoost predicts probabilities (Home/Draw/Away)
3. Monte Carlo simulates 100k matches to get confidence
4. Kelly criterion sizes bets
5. Result cached for 6-24 hours

**Common Tasks:**
```bash
# Train model on historical data
python scripts/train_models.py --backtest

# Evaluate accuracy
python scripts/evaluate_models.py --years 5

# Make a prediction (API call)
curl http://localhost:8000/api/v1/predictions/123?explain=true
```

---

## 🏃 Common Workflows

### Daily: Start Development

```bash
# 1. Pull latest code
cd ~/match-oracle
git pull origin main

# 2. Activate virtual environments
cd backend && source venv/bin/activate
cd ../mobile && source venv/bin/activate
cd ../desktop && source venv/bin/activate

# 3. Start services in separate terminals
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Database (if not running)
docker run -d postgres:16 ...

# Terminal 3: Frontend (mobile or desktop)
cd mobile && npx expo start
# OR
cd desktop && npm start

# 4. Open project in IDE
code .
```

### Feature Development: Git Workflow

```bash
# 1. Create feature branch
git checkout -b feat/add-kelly-calculator

# 2. Make changes
# Edit files, test locally

# 3. Run tests before commit
pytest backend/tests/ -v
npm test -- --watch

# 4. Format code
black backend/
npm run format

# 5. Commit
git add .
git commit -m "feat(ml): add Kelly criterion bet sizing

- Implements Half-Kelly and Quarter-Kelly strategies
- Tests with 100 matches from 2023-24 season
- Caches results in Redis for 6h

Closes #42"

# 6. Push
git push origin feat/add-kelly-calculator

# 7. Create PR on GitHub
# Title: "Add Kelly criterion bet sizing"
# Description: Explain changes, link issue
# Wait for review + CI/CD to pass
# Merge after approval
```

### Debugging: Backend Issue

```bash
# Issue: API returns 500 error

# 1. Check server logs
tail -f ~/.logs/uvicorn.log
# Look for error message, traceback

# 2. Check database
psql matchoracle -c "SELECT * FROM users LIMIT 1;"
# Verify DB is responsive

# 3. Check Redis
redis-cli ping
redis-cli get cache_key_here

# 4. Enable debug mode
# Edit backend/.env: LOG_LEVEL=DEBUG
# Restart: uvicorn app.main:app --reload

# 5. Add breakpoint (VSCode debug)
# Place: breakpoint() in Python code
# Run: python -m pdb app/routers/matches.py
# Step through execution

# 6. Check request/response
# Use Postman or curl with verbose
curl -v http://localhost:8000/api/v1/matches
# Look for HTTP status, headers, response body
```

### Debugging: Mobile Issue

```bash
# Issue: App crashes when loading matches

# 1. Check Metro Bundler logs
# Terminal running "npx expo start"
# Look for error message

# 2. Check React errors
# Expo Go app on phone:
# - Press Ctrl+M (Android) or Cmd+D (iOS)
# - Select "Show JS Errors"
# - Look for component error

# 3. Check API calls
# In chrome DevTools (mobile web):
# - F12 → Network tab
# - Filter: XHR
# - Check request/response
# Example: GET http://localhost:8000/api/v1/matches
# Should return 200 with JSON

# 4. Add debugging
// In WeekendCalculatorScreen.tsx
useEffect(() => {
  console.log('Component mounted, fetching matches...');
  fetchMatches();
  console.log('Fetch initiated');
}, [])

// 5. View logs
npx expo start
# Look in terminal for console.log output
```

---

## ❓ Common Questions

### "How do I add a new API endpoint?"

1. Create router if not exists: `backend/app/routers/my_feature.py`
2. Define Pydantic schema: `backend/app/models/schemas.py`
3. Write endpoint with type hints + docstring
4. Add to `main.py`: `app.include_router(my_router)`
5. Write tests: `tests/unit/routers/test_my_feature.py`
6. Document in `docs/01_API_REFERENCE.md`

### "My tests are failing. What do I do?"

```bash
# 1. Run single test
pytest tests/unit/routers/test_auth.py::test_register -v -s

# 2. See failure reason
# Output shows: AssertionError: expected 201, got 400

# 3. Check test code
# What's it expecting? What's API actually returning?

# 4. Debug API
# Add breakpoint() in router code
# Re-run test, inspect variables

# 5. Fix + re-run
# Repeat until test passes
```

### "Database migration failed. How do I recover?"

```bash
# 1. Check current state
alembic current
# Shows: c3f7a8b2e9f0 (current migration)

# 2. View migrations
alembic history
# Shows: all migrations with timestamps

# 3. Downgrade if bad migration
alembic downgrade -1
# Rolls back 1 version

# 4. Fix migration file
# Edit database/migrations/versions/xxxxxxxx_my_migration.py

# 5. Upgrade again
alembic upgrade head

# If still stuck, restore from backup
psql matchoracle < backup_2026-04-25.sql
```

### "I need to deploy my code. What's the process?"

See: [DEPLOYMENT_RUNBOOK.md](03_DEPLOYMENT_RUNBOOK.md)

Summary:
1. Code passes tests locally
2. PR approved by code reviewer
3. Merge to main (GitHub Actions CI/CD runs)
4. Automated: Build Docker image, run tests, push to registry
5. DevOps: Deploy to staging, run E2E tests
6. Manual approval → Deploy to production

### "What if I break something in production?"

Don't panic! Here's what happens:

1. You notice error (Sentry alert or user report)
2. Immediately rollback: `kubectl rollout undo deployment/...`
3. Get 5 min to stabilize
4. Root cause analysis (5 Whys)
5. Fix in code
6. Test on staging first
7. Deploy again with confidence

Every engineer breaks production eventually. It's okay!

---

## 📞 Support Channels

### Who To Ask For What

| Topic | Who | Where |
|-------|-----|-------|
| Architecture decisions | Michael | #architecture |
| Code review help | Michael | PR comments |
| Setup problems | Team | #setup |
| Database issues | Michael | #database |
| API design | Michael | #api-design |
| ML questions | Michael | #ml-engineering |
| Frontend issues | You | #frontend (if other FE dev exists) |
| Deployment help | Michael | #devops |
| General questions | Any | #general |

### Response Times

- **Urgent (prod down):** Michael within 5 min
- **High priority (blocker):** Michael within 1 hour
- **Normal:** Async, check Slack next day
- **Questions in PR:** 24-48 hours

### Learning Resources

- **Slack:** #resources channel has links
- **Docs:** See `/docs` folder (you are reading one!)
- **Code:** Best teachers are existing endpoints (look at `routers/auth.py`)
- **Tests:** Look at `tests/unit/` for examples

---

## ✅ Your First Week Checklist

### Day 1 (Tuesday)
- [ ] Read this guide
- [ ] Complete local setup (backend + mobile + desktop)
- [ ] Can run `curl http://localhost:8000/api/v1/health`
- [ ] Add yourself to team Slack channels
- [ ] Intro call with Michael (15 min)

### Day 2-3 (Wednesday-Thursday)
- [ ] Read [ARCHITECTURE.md](04_ARCHITECTURE.md)
- [ ] Explore `/backend/app/routers/` (understand one endpoint)
- [ ] Write a simple test
- [ ] Make first git commit
- [ ] Ask 3 questions in Slack (get used to team)

### Day 4-5 (Friday)
- [ ] Pick first small task (see GITHUB ISSUES)
- [ ] Implement + write tests
- [ ] Create PR
- [ ] Code review feedback
- [ ] Merge PR
- [ ] Deploy to staging

### Week 2
- [ ] You should be able to:
  - [ ] Add a new API endpoint with tests
  - [ ] Run full test suite locally
  - [ ] Create a feature branch + PR
  - [ ] Debug a failing test
  - [ ] Answer "where does X live?" without asking

---

## 🎓 Learning Path (If You Want to Deepen Knowledge)

### Foundation (You Should Know)
- REST APIs (GET/POST/PUT/DELETE)
- JSON data format
- SQL basics (SELECT, JOIN, WHERE)
- HTTP status codes (200, 400, 500)

### Intermediate (2-4 Weeks In)
- FastAPI routing + dependency injection
- SQLAlchemy ORM (relationships, queries)
- React Hooks (useState, useEffect, useContext)
- JWT authentication flow
- Docker basics

### Advanced (Month 2+)
- PostgreSQL performance tuning
- ML model evaluation metrics
- Kubernetes deployment
- System design + scalability
- Security best practices

### Where to Learn
- **Backend:** FastAPI docs, SQLAlchemy tutorial
- **Frontend:** React Native docs, Expo docs
- **ML:** Scikit-learn docs, SHAP docs
- **DevOps:** Docker docs, Kubernetes basics

---

## 🚨 Important Don'ts

❌ **Don't commit secrets** (API keys, passwords)
- Use `.env.example` as template
- All secrets go in `.env` (gitignored)

❌ **Don't skip tests**
- Every change needs a test
- Target: 80% coverage

❌ **Don't push to main directly**
- Always use feature branch + PR
- Wait for code review

❌ **Don't ignore CI/CD failures**
- Green CI = safe to merge
- Red CI = fix before merging

❌ **Don't merge your own PR**
- Wait for another engineer's approval
- Exception: hotfixes (rare)

---

## 🎉 You're Ready!

Congratulations! You should now be able to:
✅ Set up local environment
✅ Understand project structure
✅ Read and understand existing code
✅ Write tests
✅ Contribute features
✅ Debug issues
✅ Know who to ask for help

**Next Step:** Ask Michael to assign you a small task. Something like:
- "Add a new endpoint for X"
- "Write tests for existing feature"
- "Fix a failing test"
- "Improve documentation"

Welcome to the team! 🎉

---

**Questions?** Ask in #general Slack or reach out to Michael.

**Next Read:** See [Developer Setup Guide](02_DEVELOPER_SETUP.md) for deeper technical setup info.

---

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Audience:** New team members  
**Estimated Read Time:** 20 minutes
