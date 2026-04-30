# Developer Setup Guide — Match Oracle v1.0

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Audience:** Backend developers, mobile developers, DevOps engineers

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Windows 10/11** or **macOS 12+** or **Linux (Ubuntu 22.04+)**
- **Git** 2.30+: `git --version`
- **Node.js** 18.0+: `node --version`
- **Python** 3.11+: `python --version`
- **Docker** (optional, for PostgreSQL): `docker --version`
- **PostgreSQL** 16 (or Docker: `docker run -d postgres:16`)
- **Redis** 7 (or Docker: `docker run -d redis:7`)

---

## 🚀 Quick Start (< 15 Minutes)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/bundesliga-match-analyzer.git
cd bundesliga-match-analyzer
```

### 2. Backend Setup

```bash
# Create Python virtual environment
cd backend
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your API keys (see Environment Variables section)
# Required: OPENWEATHER_API_KEY, ODDS_API_KEY, API_FOOTBALL_KEY

# Run migrations
alembic upgrade head

# Seed database
python scripts/seed_database.py --leagues bundesliga,bundesliga2

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000**

### 3. Mobile Setup

```bash
cd ../mobile

# Install dependencies
npm install --legacy-peer-deps

# Start Expo development server
npx expo start

# Options:
# Press 'w' for web (localhost:19006)
# Press 'a' for Android
# Press 'i' for iOS (macOS only)
```

### 4. Desktop Setup

```bash
cd ../desktop

# Install dependencies
npm install

# Build React
npm run build:react

# Start Electron (development mode)
npm start
```

Desktop window opens at 1280×800

---

## 🔧 Environment Variables

Create `.env` files in each directory:

### backend/.env

```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/matchoracle
SQLALCHEMY_ECHO=False
SQLALCHEMY_POOL_SIZE=10
SQLALCHEMY_POOL_RECYCLE=3600

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_TTL_PREDICTIONS=86400
REDIS_TTL_CACHE=3600

# JWT Authentication
SECRET_KEY=your-super-secret-key-min-32-chars-long!!!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# External APIs
API_FOOTBALL_KEY=your-api-football-key
OPENWEATHER_API_KEY=your-openweather-key
ODDS_API_KEY=your-odds-api-key

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=optional-sentry-url

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:19006"]

# Celery (background tasks)
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Email (for alerts)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### mobile/.env

```
API_BASE_URL=http://localhost:8000
API_VERSION=v1
DEBUG=true
```

### desktop/.env

```
API_URL=http://localhost:8000
NODE_ENV=development
```

---

## 🗄️ Database Setup

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL + Redis with docker-compose
docker-compose -f docker/docker-compose.yml up -d

# Verify
docker-compose ps
# Should show: postgres (UP), redis (UP)

# Access PostgreSQL shell
docker exec -it <container-id> psql -U postgres
```

### Option 2: Local Installation

**macOS (Homebrew):**
```bash
brew install postgresql redis
brew services start postgresql
brew services start redis
```

**Ubuntu:**
```bash
sudo apt-get install postgresql postgresql-contrib redis-server
sudo systemctl start postgresql
sudo systemctl start redis-server
```

**Windows:**
- Download PostgreSQL installer: https://www.postgresql.org/download/windows/
- Download Redis: https://github.com/microsoftarchive/redis/releases (or use WSL2)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE matchoracle;
CREATE USER matchoracle WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE matchoracle TO matchoracle;
\q

# Run migrations
cd backend
alembic upgrade head
```

### Seed with Test Data

```bash
# Populate Teams, Leagues, Matches, Players
python scripts/seed_database.py --leagues bundesliga,bundesliga2 --seasons 2024-25,2023-24

# Verify
psql -U matchoracle -d matchoracle -c "SELECT COUNT(*) as team_count FROM teams;"
# Expected: 36 teams (18 Bundesliga + 18 Bundesliga 2)
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_auth.py

# With coverage
pytest --cov=app tests/

# Output HTML report
pytest --cov=app --cov-report=html tests/
# Open: htmlcov/index.html
```

**Target Coverage:**
- Units: 80%+
- Integration: 60%+

### Mobile Tests

```bash
cd mobile

# Run Jest tests
npm test

# With coverage
npm test -- --coverage

# Watch mode (auto-rerun on file change)
npm test -- --watch
```

---

## 📦 Building for Production

### Backend Docker Image

```bash
# Build
docker build -f docker/Dockerfile.api -t bundesliga-api:1.0 .

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e SECRET_KEY=... \
  bundesliga-api:1.0

# Push to registry (e.g., Docker Hub)
docker tag bundesliga-api:1.0 yourorg/bundesliga-api:1.0
docker push yourorg/bundesliga-api:1.0
```

### Mobile APK (Android)

```bash
cd mobile

# Prerequisites: EXPO_TOKEN set
export EXPO_TOKEN=your_expo_token

# Build APK
eas build --platform android --profile preview

# Download from: https://expo.dev/builds
# OR: Get signing credentials for release builds
eas credentials
```

### Desktop EXE (Windows)

```bash
cd desktop

# Build portable EXE
npm run build:portable
# Output: dist2/Match Oracle 1.0.0.exe (65 MB)

# Build MSI installer (requires rcedit, complex signing)
npm run build:msi
# Output: dist2/installers/Match Oracle 1.0.0.msi
```

---

## 🔍 Troubleshooting

### Backend Issues

**"Cannot connect to database"**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Verify database exists
psql -U postgres -l | grep matchoracle
```

**"Redis connection refused"**
```bash
# Check Redis is running
redis-cli ping
# Expected: PONG

# Check REDIS_URL in .env
echo $REDIS_URL
```

**"ModuleNotFoundError: No module named 'app'"**
```bash
# Ensure you're in backend/ directory
cd backend

# Ensure venv is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Mobile Issues

**"expo-router config error: withPodfile is not a function"**
```bash
# Ensure compatible versions
npm list expo expo-router

# If mismatch, reset
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**"Metro bundler stuck"**
```bash
# Kill and restart
npx expo start --clear
```

**"Cannot find API endpoint"**
```bash
# Ensure backend is running on port 8000
curl http://localhost:8000/api/v1/health

# Check mobile .env API_BASE_URL matches
cat .env | grep API_BASE_URL
```

### Desktop Issues

**"Cannot find module 'electron-is-dev'"**
```bash
# Reinstall dependencies
cd desktop
rm -rf node_modules
npm install

# Or use local check instead of module
# See main.js: const isDev = !app.isPackaged
```

**"Blank window on startup"**
```bash
# Check build/index.html exists
ls -la build/index.html

# Rebuild React
npm run build:react

# Check console for errors (Ctrl+Shift+I)
npm start
```

---

## 🔐 Security Checklist

Before deploying:

- [ ] `.env` files NOT committed to git (check `.gitignore`)
- [ ] `SECRET_KEY` is random, 32+ characters
- [ ] All API keys from environment, never hardcoded
- [ ] CORS origins restricted to production domain
- [ ] Database password strong and unique
- [ ] Redis AUTH enabled in production
- [ ] HTTPS enforced in production
- [ ] Rate limiting configured
- [ ] SENTRY_DSN for error tracking set

---

## 📚 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── routers/             # 9 API endpoint groups
│   ├── models/              # SQLAlchemy + Pydantic schemas
│   ├── core/                # Config, security, cache
│   ├── middleware/          # Error handling, logging
│   ├── ml/                  # Machine learning models
│   └── data/                # Data collectors
├── scripts/                 # Database seed, utility scripts
├── tests/                   # Unit + integration tests
├── database/
│   ├── schema.sql           # Current schema
│   └── migrations/          # Alembic versioned migrations
└── requirements.txt

mobile/
├── src/
│   ├── screens/             # Main UI screens
│   ├── components/          # Reusable components
│   ├── services/            # API client, context
│   ├── theme/               # Colors, typography
│   └── utils/               # Helpers, formatters
├── app.json                 # Expo config
├── package.json
└── .env

desktop/
├── src/
│   ├── App.tsx              # React component
│   ├── index.tsx            # Entry point
│   └── services/            # API integration
├── main.js                  # Electron main process
├── package.json
└── build/                   # Static HTML template
```

---

## 🚀 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/new-feature
```

### 2. Code & Test

```bash
# Backend
cd backend
pytest tests/unit/routers/test_matches.py -v

# Mobile
cd mobile
npm test -- --watch

# Desktop
cd desktop
npm test
```

### 3. Code Style

```bash
# Backend: Black + Flake8
black app/
flake8 app/ --max-line-length=100

# Mobile: Prettier + ESLint
npm run format
npm run lint

# Desktop: Same as mobile
npm run format
npm run lint
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add match prediction details screen"
git push origin feat/new-feature
```

### 5. Create Pull Request

- Link to issue
- Describe changes
- Ensure CI/CD passes
- Request review

---

## 📞 Getting Help

- **Slack**: #bundesliga-dev
- **Docs**: See `/docs` folder
- **Issues**: GitHub Issues with `[help]` tag
- **API Docs**: http://localhost:8000/docs (Swagger UI)

---

**Next:** See [DEPLOYMENT_RUNBOOK.md](03_DEPLOYMENT_RUNBOOK.md) for production deployment steps.
