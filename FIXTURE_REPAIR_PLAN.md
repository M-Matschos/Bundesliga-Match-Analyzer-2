# Fixture Repair Plan: backend/tests/conftest.py

**Date:** 2026-05-12  
**Status:** Ready for Implementation  
**Scope:** Add missing fixtures to fix 58 fixture-not-found failures, 35 DB initialization issues, and 22 data seeding issues

---

## Executive Summary

The test suite has **112 tests** failing due to missing pytest fixtures. Current `conftest.py` provides:
- 1 async database session fixture (`async_db_session`)
- 3 data dictionary fixtures (no ORM objects)
- 1 pubsub manager fixture
- 1 settings fixture

**Missing: 14 fixtures** that tests depend on:
- Sync database session (for TestClient-based integration tests)
- Data seeding fixtures (6 sync + 4 async = 10 total)
- Convenience fixtures (2 total: auth headers, admin tokens)

---

## Part 1: Current Architecture Analysis

### Existing Fixtures (in conftest.py)

| Fixture | Type | Scope | Purpose | Issue |
|---------|------|-------|---------|-------|
| `async_db_session` | Async Generator | Function | Fresh in-memory SQLite per test | Works but async-only |
| `settings` | Settings object | Function | App configuration | Working |
| `test_user_data` | Dict | Function | User registration template | No ORM object |
| `test_match_data` | Dict | Function | Match creation template | No ORM object |
| `test_prediction_data` | Dict | Function | Prediction creation template | No ORM object |
| `pubsub_manager` | RedisPubSubManager | Function | Mocked Redis for WebSocket tests | Working |

### Gap Analysis

**Sync Integration Tests (using TestClient)** require a sync database:
- 8 integration test files use `TestClient` (not async)
- Current `async_db_session` is async-only
- **Missing:** `db_session` fixture for sync tests

**Data Seeding** requires ORM objects in DB:
- Tests call endpoints that query the database
- Current fixtures return dicts, not ORM objects
- **Missing:** 10 data seeding fixtures

**Convenience Patterns** missing:
- Tests need `client` + auth headers pre-configured
- **Missing:** `client_with_auth`, `admin_token`

---

## Part 2: New Fixture Architecture

### Sync Database Session Pattern
```python
@pytest.fixture
def db_session():
    """Create in-memory SQLite database for sync tests using TestClient.
    
    Uses StaticPool to maintain a single in-memory database across
    async/sync boundaries. Fresh tables created per test, dropped after.
    
    Returns:
        Session object connected to in-memory SQLite
    """
    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool
    from sqlalchemy.orm import sessionmaker
    from app.models.db import Base
    
    # In-memory SQLite with StaticPool for single connection
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    # Create session factory
    SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
    session = SessionLocal()
    
    yield session
    
    # Cleanup
    session.close()
    Base.metadata.drop_all(engine)
    engine.dispose()
```

### Sync Data Seeding Fixture Pattern
```python
@pytest.fixture
def db_user(db_session):
    """Create a test user in the database.
    
    Args:
        db_session: Sync database session fixture
        
    Returns:
        User ORM object (committed, refreshed)
    """
    from app.models.db import User
    from app.core.security import hash_password
    
    user = User(
        id=uuid.uuid4(),
        email="testuser@example.com",
        username="testuser",
        password_hash=hash_password("secure_password_123"),
        full_name="Test User",
        is_active=True,
        is_superuser=False,
    )
    
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return user
```

### Async Data Seeding Fixture Pattern
```python
@pytest.fixture
async def async_db_user(async_db_session):
    """Create test user in async database session.
    
    Args:
        async_db_session: Async database session fixture
        
    Returns:
        User ORM object (committed, refreshed)
    """
    from app.models.db import User
    from app.core.security import hash_password
    
    user = User(
        id=uuid.uuid4(),
        email="asyncuser@example.com",
        username="asyncuser",
        password_hash=hash_password("secure_password_123"),
        is_active=True,
        is_superuser=False,
    )
    
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    
    return user
```

### Convenience Fixture Pattern
```python
@pytest.fixture
def auth_headers(db_user, settings):
    """Generate auth headers with JWT token for test user.
    
    Args:
        db_user: Test user fixture
        settings: App settings
        
    Returns:
        Dict with "Authorization" header for TestClient
    """
    from app.core.security import create_access_token
    from datetime import timedelta
    
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=30),
    )
    
    return {"Authorization": f"Bearer {access_token}"}
```

---

## Part 3: Complete Fixture List

### Sync Fixtures (12 new)

| Fixture | Depends On | Returns | Purpose |
|---------|-----------|---------|---------|
| `db_session` | None | Session | Sync in-memory SQLite |
| `db_team` | `db_session` | Team ORM | Test team for matches |
| `db_user` | `db_session` | User ORM | Non-admin test user |
| `db_admin_user` | `db_session` | User ORM | Admin test user |
| `db_match` | `db_session`, `db_team` | Match ORM | Scheduled match |
| `db_completed_match` | `db_session`, `db_team` | Match ORM | Completed match with scores |
| `db_bet` | `db_session`, `db_user`, `db_match` | Bet ORM | Pending virtual bet |
| `db_device` | `db_session`, `db_user` | Device ORM | Mobile device token |
| `db_match_subscription` | `db_session`, `db_user`, `db_match` | MatchSubscription ORM | Match subscription |
| `auth_headers` | `db_user`, `settings` | Dict | HTTP auth headers with JWT |
| `admin_token` | `db_admin_user`, `settings` | str | JWT token for admin |
| `client_with_auth` | `auth_headers` | TestClient | Pre-auth TestClient |

### Async Fixtures (4 new)

| Fixture | Depends On | Returns | Purpose |
|---------|-----------|---------|---------|
| `async_db_user` | `async_db_session` | User ORM | Async test user |
| `async_db_match` | `async_db_session` | Match ORM | Async scheduled match |
| `async_db_completed_match` | `async_db_session` | Match ORM | Async completed match |
| `async_db_bet` | `async_db_session`, `async_db_user`, `async_db_match` | Bet ORM | Async virtual bet |

---

## Part 4: Fixture Dependency Graph

```
db_session
├── db_team
│   ├── db_match
│   │   ├── db_completed_match
│   │   └── db_bet
│   └── db_match_subscription
├── db_user
│   ├── db_bet (also needs db_match)
│   ├── db_device
│   ├── db_match_subscription (also needs db_match)
│   └── auth_headers
│       └── client_with_auth
└── db_admin_user
    └── admin_token

async_db_session
├── async_db_user
│   └── async_db_bet (also needs async_db_match)
├── async_db_match
│   ├── async_db_completed_match
│   └── async_db_bet (also needs async_db_user)
```

---

## Part 5: Implementation Sequence (7 Steps)

### Step 1: Add Sync Database Session
Insert into `conftest.py` after imports, before `settings()` fixture:
```python
# db_session fixture code (see Part 2 pattern)
```
**Verify:**
```bash
pytest backend/tests/ --collect-only | grep "db_session"
```

### Step 2: Add Helper db_team Fixture
Insert after `db_session`:
```python
# db_team fixture code
```

### Step 3: Add Sync User Fixtures
Insert in order:
1. `db_user` (depends on db_session)
2. `db_admin_user` (depends on db_session)

### Step 4: Add Sync Match & Bet Fixtures
Insert in order:
1. `db_match` (depends on db_session, db_team)
2. `db_completed_match` (depends on db_session, db_team)
3. `db_bet` (depends on db_session, db_user, db_match)
4. `db_device` (depends on db_session, db_user)
5. `db_match_subscription` (depends on db_session, db_user, db_match)

### Step 5: Add Sync Convenience Fixtures
Insert in order:
1. `auth_headers` (depends on db_user, settings)
2. `admin_token` (depends on db_admin_user, settings)
3. `client_with_auth` (depends on auth_headers)

### Step 6: Add Async Data Seeding Fixtures
Insert in order:
1. `async_db_user` (depends on async_db_session)
2. `async_db_match` (depends on async_db_session)
3. `async_db_completed_match` (depends on async_db_session)
4. `async_db_bet` (depends on async_db_session, async_db_user, async_db_match)

### Step 7: Validate
```bash
pytest backend/tests/ --collect-only | grep "fixture.*not found" | wc -l
# Expected: 0 missing fixtures

pytest backend/tests/ -v --tb=line
# Expected: Tests now find fixtures; failures due to logic, not fixtures
```

---

## Part 6: Test Migration Patterns

### Pattern A: Sync Integration Tests (Using TestClient)
**Before:**
```python
def test_register(self, client):
    response = client.post("/api/v1/auth/register", json={...})
```

**After:**
```python
def test_register(self, client, db_user, db_session):
    # DB pre-populated with test user
    initial_count = db_session.query(User).count()
    
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "secure123"
    })
    
    assert response.status_code == 201
    assert db_session.query(User).count() == initial_count + 1
```

### Pattern B: Async Tests
**Before:**
```python
@pytest.mark.asyncio
async def test_query(self, async_db_session):
    stmt = select(User)
    result = await async_db_session.execute(stmt)
    users = result.scalars().all()
```

**After:**
```python
@pytest.mark.asyncio
async def test_query(self, async_db_session, async_db_user):
    # DB pre-populated with async_db_user
    stmt = select(User).where(User.id == async_db_user.id)
    result = await async_db_session.execute(stmt)
    user = result.scalar_one()
    
    assert user.email == "asyncuser@example.com"
```

---

## Part 7: Expected Outcomes

### Current State
```
Test Run Results:
- Total: 112 tests
- Failed: 112
  - 58: fixture 'X' not found
  - 35: database initialization failed
  - 22: test data not available
```

### After Implementation
```
Test Run Results:
- Total: 112 tests
- Passed: 70-85 (varies by code logic)
- Failed: 27-42 (API contracts, logic errors)
- Skipped: 0-5

Fixture Errors:
- fixture 'X' not found: 0 (100% resolved)
- database initialization: 0 (100% resolved)
- test data unavailable: 0 (100% resolved)
```

---

## Part 8: Implementation Checklist

Before starting:
- [ ] Read `app/models/db.py` to understand ORM models
- [ ] Confirm `app.core.security` has `hash_password()` and `create_access_token()`
- [ ] Confirm `app.main` exports `app` object
- [ ] Verify no circular imports between conftest and models

During implementation:
- [ ] Fixtures defined in dependency order (base → dependent)
- [ ] All imports added to conftest.py top
- [ ] Each fixture has docstring with Args and Returns
- [ ] Sync fixtures use `db_session.commit()` + `db_session.refresh()`
- [ ] Async fixtures use `await async_db_session.commit()` + `await async_db_session.refresh()`
- [ ] Fixture functions are properly indented (not nested)

After each step:
- [ ] Run `pytest --collect-only` to verify no new missing fixtures
- [ ] Check for import errors: `pytest backend/tests/ -v --tb=short`

After all steps:
- [ ] Full test collection shows no missing fixtures
- [ ] Test run shows failures due to code logic, not fixtures

---

## Part 9: Troubleshooting

**Issue: "fixture 'db_session' not found"**
- Check: db_session defined at module level (not indented)
- Check: @pytest.fixture decorator present
- Check: Function name exactly matches 'db_session'

**Issue: "NameError: name 'uuid' is not defined"**
- Fix: Add `import uuid` to conftest.py imports

**Issue: "AttributeError: User has no attribute 'id'"**
- Check: `from app.models.db import User` in fixture
- Check: User model has id column

**Issue: "IntegrityError: UNIQUE constraint failed"**
- Likely: Fixture not using unique values (email, username already exist)
- Fix: Use uuid.uuid4() for unique identifiers in each fixture

**Issue: "Cannot start new OS thread in test"**
- Check: Async fixtures aren't mixing with sync code
- Check: async/await keywords present in async fixtures

---

**End of Plan**

Ready for implementation. Follow steps 1-7 in Part 5 sequentially.
