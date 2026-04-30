# 🚀 Deployment Guide — Match Oracle

## Übersicht

**Ziel:** Production-Ready Release mit Monitoring & Rollback  
**Infrastruktur:** Docker + Railway/Render (MVP), Kubernetes (Scale)  
**CI/CD:** GitHub Actions → Staging → Production

---

## Pre-Deployment Checklist

### Code Quality

- [ ] `pytest backend/tests/ -v --cov=app` → 80%+ coverage ✅
- [ ] `black backend/ --check && flake8 backend/` → No violations ✅
- [ ] `cd mobile && npm run lint` → No violations ✅
- [ ] All secrets removed from code (scan with `detect-secrets`) ✅
- [ ] Database migrations verified (`alembic upgrade head`) ✅

### Security

- [ ] API keys in `.env.production`, not in code ✅
- [ ] HTTPS enforced (TLS 1.3) ✅
- [ ] JWT token expiry set (7 days) ✅
- [ ] CORS origins whitelisted (no `*`) ✅
- [ ] Rate limiting enabled ✅
- [ ] Sensitive logs redacted (no passwords, tokens) ✅

### Documentation

- [ ] README.md updated with quick start ✅
- [ ] API Swagger docs complete ✅
- [ ] TESTING_STRATEGY.md written ✅
- [ ] Architecture diagram updated ✅
- [ ] Runbook for incidents created ✅

### Performance

- [ ] Weekend calculator < 10s for 12 matches ✅
- [ ] API response < 200ms P99 ✅
- [ ] Database indexes created ✅
- [ ] Redis cache configured ✅

---

## Environment Setup

### Production Environment Variables

**.env.production** (must set these):

```bash
# FastAPI
ENVIRONMENT=production
DEBUG=False
API_TITLE=Match Oracle API
API_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:password@prod-db.railway.app:5432/matchoracle
DATABASE_POOL_SIZE=20
DATABASE_POOL_RECYCLE=3600

# Redis (Cache + Session)
REDIS_URL=redis://prod-redis.railway.app:6379/0
REDIS_PASSWORD=secure_password_here

# Security
JWT_SECRET=your_super_secret_jwt_key_here  # Generate with: openssl rand -hex 32
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=168  # 7 days
CORS_ORIGINS=["https://matchoracle.app", "https://www.matchoracle.app"]

# External APIs
API_FOOTBALL_KEY=your_api_football_key_here
ODDS_API_KEY=your_odds_api_key_here
OPENWEATHERMAP_KEY=your_weather_api_key_here

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@matchoracle.app
SMTP_PASSWORD=your_app_password_here

# Monitoring
SENTRY_DSN=https://key@sentry.io/project_id
LOG_LEVEL=INFO
```

### Database Migration

```bash
# 1. Connect to production database
# Set DATABASE_URL to production

# 2. Run migrations
alembic upgrade head

# 3. Verify tables
psql $DATABASE_URL -c "\dt"

# 4. Seed initial data
python scripts/seed_database.py --leagues bundesliga,bundesliga2
```

---

## Docker Deployment

### Build Docker Images

**Backend:**
```dockerfile
# docker/Dockerfile.api
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY alembic ./alembic
COPY alembic.ini .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build:**
```bash
docker build -f docker/Dockerfile.api -t matchoracle-api:1.0.0 .
docker tag matchoracle-api:1.0.0 matchoracle-api:latest
```

**Mobile (APK):**
```bash
cd mobile
eas build --platform android --release
# Output: APK in ./build/
```

### Push to Registry

```bash
# Docker Hub
docker login
docker push matchoracle-api:1.0.0

# Or: GitHub Container Registry
docker tag matchoracle-api:1.0.0 ghcr.io/your-org/matchoracle-api:1.0.0
docker push ghcr.io/your-org/matchoracle-api:1.0.0
```

---

## Railway/Render Deployment (MVP)

### Option 1: Railway.app

**1. Connect GitHub:**
```
https://railway.app → New Project → GitHub
Select: matchoracle repo
```

**2. Add Services:**
```
API: matchoracle-api (Docker)
- Build: docker/Dockerfile.api
- Port: 8000
- Env: Load from .env.production

Database: PostgreSQL 16
- Auto-provisioned

Cache: Redis 7
- Auto-provisioned
```

**3. Configure Environment:**
```
Railway Dashboard → Environment
- Add all production .env vars
- Store secrets in Railway Secrets
```

**4. Deploy:**
```
Push to main branch → Automatic deployment
https://api.matchoracle.railway.app
```

### Option 2: Render.com

**1. Create Web Service:**
```
https://render.com → New → Web Service
- GitHub repo connection
- Build command: pip install -r backend/requirements.txt
- Start command: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**2. Add Database:**
```
Postgres 16 (Managed)
- Auto-backups enabled
- Point-in-time recovery enabled
```

**3. Deploy:**
```
Automatic on git push to main
```

---

## Production Architecture

```
┌─────────────────┐
│   Mobile App    │
│  (iOS / APK)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌──────────────────────────────┐
│   CloudFlare CDN             │
│   (DDoS Protection + Cache)  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│   FastAPI Backend            │
│   (Railway/Render)           │
│   Port: 8000                 │
│   Auto-scaled: 2-10 instances│
└────────┬─────────────────────┘
         │
    ┌────┴─────────┬──────────────┐
    ▼              ▼              ▼
┌─────────┐  ┌─────────┐   ┌──────────┐
│PostgreSQL   Redis    │   │ S3/R2    │
│(Primary)    (Cache)  │   │ (Logos)  │
└────────────┴────────┘   └──────────┘
                              ▲
              ┌────────────────┘
              │
         ┌────▼──────────────────┐
         │  Background Jobs      │
         │  (Celery + Redis)     │
         │  - ML Training        │
         │  - Data Sync          │
         │  - Email Notifications│
         └───────────────────────┘
```

---

## Monitoring & Logging

### Error Tracking (Sentry)

**1. Setup:**
```python
# app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=settings.ENVIRONMENT,
)
```

**2. Dashboard:**
```
https://sentry.io → Match Oracle → Issues
- Real-time error alerts
- Group similar errors
- 30-day retention (free tier)
```

### Performance Monitoring (DataDog)

**Optional: For scale phase**

```python
from datadog import initialize, api

options = {"api_key": "YOUR_API_KEY", "app_key": "YOUR_APP_KEY"}
initialize(**options)

# Log custom metrics
statsd.gauge('weekend.calculation.duration_ms', duration)
statsd.increment('predictions.fetched')
```

### Structured Logging

```python
import structlog

logger = structlog.get_logger()

# Example
logger.info(
    "prediction_calculated",
    match_id=match_id,
    confidence=0.78,
    duration_ms=456,
    model_version="v2.1"
)

# Output: JSON → CloudWatch/ELK/DataDog
```

---

## Backup & Recovery

### Database Backups

**Automatic:**
- Railway/Render: Daily backups (7-day retention)

**Manual:**
```bash
# Export
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260424.sql
```

### Secrets Rotation

**Every 90 days:**
```bash
# 1. Generate new JWT secret
openssl rand -hex 32

# 2. Update in Railway/Render environment
# 3. Restart API pods
# 4. Old JWTs still valid until expiry
```

---

## Rollback Procedure

**If Production Issue Detected:**

### Option 1: Instant Rollback

```bash
# GitHub → Releases
# Select previous version (v0.9.8)
# Railway/Render automatically redeploys

# Or manually:
git revert <commit_hash>
git push main
# Auto-triggers deploy
```

### Option 2: Feature Flag Disable

```python
# app/core/config.py
FEATURE_FLAGS = {
    "weekend_calculator": True,  # Toggle off if broken
    "virtual_betting": True,
    "ml_predictions": True,
}

# In router:
if not settings.FEATURE_FLAGS["weekend_calculator"]:
    raise HTTPException(status_code=503, detail="Feature temporarily disabled")
```

---

## Production Checklist

### Day 1

- [ ] Database migrated & seeded
- [ ] API responding (healthcheck: GET /)
- [ ] Redis cache working
- [ ] Mobile app connects to API
- [ ] Sentry receiving errors
- [ ] Logs accessible

### Week 1

- [ ] Monitor error rates (< 0.1%)
- [ ] Monitor API response times (< 200ms P99)
- [ ] Monitor database performance
- [ ] Check user feedback
- [ ] Review Sentry issues

### Month 1

- [ ] Performance optimization if needed
- [ ] Feature rollout based on usage
- [ ] Database optimization (indices)
- [ ] Capacity planning for scale

---

## Incident Response

**If API Down:**

1. Check GitHub Actions for failed deploy
2. Check Railway/Render logs for errors
3. Check database connection
4. Check Redis connection
5. Rollback last commit
6. Create incident ticket

**If Database Down:**

1. Check Railway/Render PostgreSQL status
2. Restore from last backup
3. Verify data consistency
4. Notify users

**If High Error Rate:**

1. Check Sentry for error spikes
2. Check external API rate limits (API-Football)
3. Check database locks
4. Review recent code changes
5. Rollback if needed

---

## Scaling (Future)

### Kubernetes Migration

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: matchoracle-api
spec:
  replicas: 3  # Auto-scale 3-10
  template:
    spec:
      containers:
      - name: api
        image: ghcr.io/your-org/matchoracle-api:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: prod-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy to Staging | `git push staging` |
| Deploy to Production | `git push main` |
| View Logs | Railway/Render Dashboard |
| Check Uptime | https://status.matchoracle.app |
| Report Issue | https://github.com/your-org/matchoracle/issues |

