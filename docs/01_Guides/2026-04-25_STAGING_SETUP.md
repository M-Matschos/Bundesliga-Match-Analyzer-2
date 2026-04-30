# 🚀 Staging Environment Setup Guide

**Version:** v2.0-MVP  
**Status:** Production-Ready  
**Last Updated:** 2026-04-25

---

## Quick Start (One Command)

```bash
chmod +x scripts/deploy_staging.sh
./scripts/deploy_staging.sh
```

This script handles:
- ✅ Docker image builds
- ✅ Service startup (PostgreSQL, Redis, Backend, Celery)
- ✅ Database migrations & seeding
- ✅ Health checks
- ✅ API endpoint validation

---

## Manual Setup

### Prerequisites
```bash
# Install Docker & Docker Compose
# macOS with Homebrew:
brew install docker-compose

# Linux (Ubuntu/Debian):
sudo apt install docker-compose

# Windows: Download Docker Desktop
```

### 1. Configure Environment

```bash
cp .env.staging .env.staging.local

# Edit .env.staging.local with your settings:
# - Change JWT_SECRET to a secure random string
# - Add API keys (API-Football, etc.)
# - Set database password
nano .env.staging.local
```

### 2. Start Services

```bash
# Start all containers
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f

# Wait for services to be healthy (~30s)
```

### 3. Run Migrations

```bash
# Connect to backend container
docker-compose -f docker-compose.staging.yml exec backend bash

# Run Alembic migrations
alembic upgrade head

# Seed initial data
python scripts/seed_database.py --leagues bundesliga,bundesliga2 --env staging

# Exit container
exit
```

### 4. Verify Deployment

```bash
# Health check
curl http://localhost:8000/api/v1/metrics/health-check

# API documentation
open http://localhost:8000/docs
```

---

## Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| Backend API | 8000 | `GET /api/v1/metrics/health-check` |
| PostgreSQL | 5433 | `pg_isready -U matchoracle` |
| Redis | 6380 | `redis-cli ping` |

---

## Database Access

```bash
# Direct psql connection
psql -h localhost -p 5433 -U matchoracle -d matchoracle_staging

# Or via Docker
docker-compose -f docker-compose.staging.yml exec postgres psql -U matchoracle -d matchoracle_staging

# Useful queries
SELECT version();
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM matches;
SELECT COUNT(*) FROM predictions;
SELECT COUNT(*) FROM news_alerts;
```

---

## API Testing

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser"
  }'

# Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }' | jq -r '.access_token')

echo $TOKEN
```

### Get Metrics Dashboard

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/metrics/dashboard
```

### Get Alerts Feed

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/alerts/feed?limit=5
```

### Weekend Calculator

```bash
curl -X POST http://localhost:8000/api/v1/weekend/calculate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leagues": ["bundesliga"],
    "date_from": "2026-04-25",
    "date_to": "2026-04-26"
  }'
```

---

## Testing

### Run Unit Tests

```bash
docker-compose -f docker-compose.staging.yml exec backend \
  pytest tests/unit/ -v --cov=app
```

### Run Integration Tests

```bash
docker-compose -f docker-compose.staging.yml exec backend \
  pytest tests/integration/ -v
```

### Run E2E Tests

```bash
docker-compose -f docker-compose.staging.yml exec backend \
  pytest tests/integration/test_e2e_journeys.py -v
```

---

## Monitoring & Debugging

### View Logs

```bash
# All services
docker-compose -f docker-compose.staging.yml logs -f

# Specific service
docker-compose -f docker-compose.staging.yml logs -f backend
docker-compose -f docker-compose.staging.yml logs -f celery
docker-compose -f docker-compose.staging.yml logs -f postgres
```

### Enter Container Shell

```bash
docker-compose -f docker-compose.staging.yml exec backend bash
```

### Check Service Status

```bash
docker-compose -f docker-compose.staging.yml ps
```

### Stop Services

```bash
docker-compose -f docker-compose.staging.yml down

# With volume cleanup (reset database)
docker-compose -f docker-compose.staging.yml down -v
```

---

## Performance Testing

### Load Test Weekend Calculator

```bash
# Install Apache Bench (macOS)
brew install httpd

# Test endpoint (concurrent requests)
ab -n 100 -c 10 http://localhost:8000/api/v1/metrics/health-check

# Test with authentication
# Create load test script: load_test.sh
```

### Monitor Resource Usage

```bash
# Docker stats
docker stats

# Check specific container
docker stats matchoracle_backend_staging
```

---

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.staging.yml logs postgres

# Test connection directly
docker-compose -f docker-compose.staging.yml exec postgres \
  psql -U matchoracle -c "SELECT 1;"
```

### Redis Connection Error

```bash
# Check Redis logs
docker-compose -f docker-compose.staging.yml logs redis

# Test Redis connection
docker-compose -f docker-compose.staging.yml exec redis \
  redis-cli PING
```

### Backend API Not Starting

```bash
# View backend logs
docker-compose -f docker-compose.staging.yml logs backend

# Check for missing environment variables
docker-compose -f docker-compose.staging.yml exec backend env | grep -E "DATABASE|REDIS|JWT"
```

### Database Migration Failed

```bash
# View migration status
docker-compose -f docker-compose.staging.yml exec backend \
  alembic current

# Rollback migrations (caution!)
docker-compose -f docker-compose.staging.yml exec backend \
  alembic downgrade -1

# Re-run migrations
docker-compose -f docker-compose.staging.yml exec backend \
  alembic upgrade head
```

---

## Useful Docker Commands

```bash
# Build specific image
docker-compose -f docker-compose.staging.yml build backend

# Force rebuild without cache
docker-compose -f docker-compose.staging.yml build --no-cache

# Pull latest images
docker-compose -f docker-compose.staging.yml pull

# Restart service
docker-compose -f docker-compose.staging.yml restart backend

# Scale service (for load testing)
docker-compose -f docker-compose.staging.yml up -d --scale backend=3
```

---

## Next Steps: Production Deploy

### Before Going to Production:
- [ ] Set secure JWT_SECRET (min 32 chars)
- [ ] Configure real API keys (API-Football, OddsAPI, etc.)
- [ ] Set up SSL/TLS certificates
- [ ] Enable HTTPS redirect
- [ ] Configure Sentry DSN for error tracking
- [ ] Set up database backups
- [ ] Configure log aggregation (ELK/DataDog)
- [ ] Run security audit (bandit, safety)
- [ ] Load test with 100+ concurrent users
- [ ] Document runbook & incident response

### Deployment Platforms Supported:
- **Railway.app** — Simple cloud deployment (recommended for MVP)
- **Render.com** — Free tier available
- **AWS ECS** — Kubernetes-ready
- **DigitalOcean App Platform** — Simple & affordable
- **Heroku** — Quick & easy (costs more)

---

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.staging.yml logs -f`
- Run health checks: `curl http://localhost:8000/api/v1/metrics/health-check`
- Review DEPLOYMENT.md for production setup
- Review CLAUDE.md for architecture & conventions
