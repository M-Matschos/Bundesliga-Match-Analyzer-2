# Bundesliga Match Analyzer — Database Migration Guide

## Overview

This guide explains how to initialize the PostgreSQL database, apply migrations, and seed test data.

---

## Setup

### 1. Start PostgreSQL & Redis (via Docker)

```bash
cd "Bundesliga Match Analyzer"
docker-compose up -d
```

**Expected Output:**
```
Creating bundesliga_postgres ... done
Creating bundesliga_redis ... done
```

**Verify connectivity:**
```bash
# Test PostgreSQL
psql -h localhost -U user -d bundesliga -c "SELECT 1"

# Test Redis
redis-cli ping
# Output: PONG
```

### 2. Configure Environment

Ensure `.env` in `backend/` has correct database URL:
```
DATABASE_URL=postgresql://user:password@localhost/bundesliga
```

---

## Migrations

### Apply Migrations

From the `backend/` directory:

```bash
# Upgrade to latest migration
python -m alembic upgrade head

# View migration history
python -m alembic current

# Rollback one migration
python -m alembic downgrade -1
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Initial migration: create users, matches, predictions, bets tables
```

### Create New Migration (after ORM model changes)

```bash
# Generate migration automatically (requires DB connection)
python -m alembic revision --autogenerate -m "Add new_field to users table"

# Or create manual migration
python -m alembic revision -m "Descriptive migration name"
```

---

## Seeding

### Seed Test Data

```bash
cd backend
python scripts/seed_database.py
```

**Expected Output:**
```
🌱 Seeding database...
✅ Database initialized
✅ Created 3 users
✅ Created 12 matches
✅ Created 12 predictions

✨ Database seeding complete!
```

**Test Data Created:**
- **Users (3):**
  - admin@example.com (superuser)
  - user1@example.com
  - user2@example.com
- **Matches (12):** Bundesliga fixtures across matchdays 28-29
- **Predictions (12):** ML predictions for each match

---

## Verification

### Check Tables

```bash
# Connect to database
psql -h localhost -U user -d bundesliga

# List tables
\dt

# Check user count
SELECT COUNT(*) FROM users;
# Output: 3

# Check match count
SELECT COUNT(*) FROM matches;
# Output: 12

# Check prediction count
SELECT COUNT(*) FROM predictions;
# Output: 12
```

### Verify API Connectivity

```bash
# In backend/ directory
uvicorn app.main:app --reload

# In another terminal
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secure_admin_123"}'

# Expected response: JWT token
```

---

## Troubleshooting

### PostgreSQL Connection Refused

```bash
# Check if container is running
docker ps | grep postgres

# View logs
docker logs bundesliga_postgres

# Restart service
docker restart bundesliga_postgres
```

### Migration Conflicts

```bash
# Show current migration status
python -m alembic current

# Show migration history
python -m alembic history

# Rollback to specific version
python -m alembic downgrade 001
```

### Database Locked

```bash
# Connect and terminate blocking queries
psql -h localhost -U user -d bundesliga

SELECT * FROM pg_stat_activity WHERE datname = 'bundesliga';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
  WHERE datname = 'bundesliga' AND pid <> pg_backend_pid();
```

---

## Database Schema

### tables

| Table | Purpose | Records (Test) |
|-------|---------|----------------|
| `users` | User accounts, auth | 3 |
| `matches` | Football matches | 12 |
| `predictions` | ML predictions | 12 |
| `bets` | Virtual bets | 0 (user-created) |

### Schema Diagram

```
users (1) ──┐
            ├─→ predictions (many) ←─── matches (many)
            └─→ bets (many) ────────→ matches (many)
```

---

## Deployment Notes

### Production Checklist

- [ ] Use managed PostgreSQL (RDS, Heroku, Railway)
- [ ] Set strong DATABASE_URL password
- [ ] Enable backup policy
- [ ] Use TimescaleDB for time-series xG data
- [ ] Configure connection pooling (PgBouncer)
- [ ] Run migrations before deployment
- [ ] Test rollback procedure

---

**Last Updated:** 2026-04-24  
**Version:** Sprint 1c
