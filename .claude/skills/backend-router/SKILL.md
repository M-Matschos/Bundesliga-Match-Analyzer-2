# 🔧 Backend Router Generator Skill

**Command:** `/gen-router`  
**Purpose:** Scaffold a new API router with models, validation, and error handling  
**Trigger:** Starting new feature (Auth, Teams, Players, etc.)  
**Output:** Complete router.py with CRUD endpoints + tests

---

## Usage

```bash
# Generate Auth router
/gen-router --name auth --model User --endpoints register,login,refresh,profile

# Generate Teams router
/gen-router --name teams --model Team --endpoints get_all,get_one,get_stats

# Generate with full spec
/gen-router --name matches \
  --model Match \
  --endpoints get_all,get_one,search,live \
  --auth required \
  --cache 3600
```

---

## What Gets Generated

### Files Created

1. **`backend/app/routers/{name}.py`**
   - APIRouter with all requested endpoints
   - Type hints on every function
   - Error handling (400, 404, 500)
   - Logging for every operation
   - Swagger docstrings (@router.get, etc.)

2. **`backend/app/models/schemas.py` (updated)**
   - Pydantic schema for the model (if not exists)
   - Request/Response schemas
   - Validation rules

3. **`backend/tests/unit/routers/test_{name}.py`**
   - Unit tests for all endpoints
   - Success + error cases
   - Mocked database
   - 80% coverage template

### Example: Generate Auth Router

```bash
/gen-router --name auth --model User --endpoints register,login,refresh,profile --auth false
```

**Generated:** `backend/app/routers/auth.py`
```python
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from app.models.schemas import UserRegister, UserLogin, UserResponse
from app.core.security import hash_password, verify_password, create_token
from sqlalchemy.ext.asyncio import AsyncSession
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)
security = HTTPBearer()

@router.post("/register", status_code=201, response_model=UserResponse)
async def register(user: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register new user account."""
    existing = await db.execute(select(User).where(User.email == user.email))
    if existing.scalar():
        logger.warning(f"Registration failed: duplicate email {user.email}")
        raise HTTPException(status_code=400, detail="Email already exists")
    
    hashed_pwd = hash_password(user.password)
    new_user = User(email=user.email, password_hash=hashed_pwd)
    db.add(new_user)
    await db.commit()
    
    logger.info(f"User registered: {user.email}")
    return UserResponse.from_orm(new_user)

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = await db.execute(select(User).where(User.email == credentials.email))
    user = user.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Login failed: invalid credentials for {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_token({"sub": str(user.id), "email": user.email})
    logger.info(f"User logged in: {credentials.email}")
    
    return {"access_token": access_token, "token_type": "bearer"}

# ... more endpoints
```

---

## Template Features

Every generated router includes:

- ✅ **Type Hints:** `async def get_match(match_id: UUID) -> MatchResponse`
- ✅ **Error Handling:** Specific HTTP exceptions (400, 404, 500)
- ✅ **Logging:** Structured logs with context
- ✅ **Authentication:** `Depends(get_current_user)` when needed
- ✅ **Validation:** Pydantic schemas with constraints
- ✅ **Caching:** Redis integration (if flag set)
- ✅ **Pagination:** Limit/offset for list endpoints
- ✅ **Filtering:** Common query filters
- ✅ **Documentation:** Swagger docstrings

---

## Available Endpoints (Pre-built)

### Auth Router
```
POST   /auth/register        (public)
POST   /auth/login           (public)
POST   /auth/refresh         (public, needs refresh_token)
GET    /auth/me              (auth required)
POST   /auth/logout          (auth required)
```

### Matches Router
```
GET    /matches              (list, filterable)
GET    /matches/{id}         (detail)
GET    /matches/live         (ongoing)
GET    /matches/upcoming     (next 7 days)
POST   /matches/{id}/rate    (auth required, user rating)
```

### Teams Router
```
GET    /teams                (all teams, filter by league)
GET    /teams/{id}           (detail + form)
GET    /teams/{id}/form      (form curve)
GET    /teams/{id}/xg        (xG stats)
GET    /teams/{id}/h2h/{opponent_id}  (head-to-head)
```

### Players Router
```
GET    /players/{id}         (detail)
GET    /players/{id}/form    (performance trend)
GET    /players/injured      (current injuries)
GET    /players/{id}/influence  (impact without them)
```

### Predictions Router
```
GET    /predictions/{match_id}   (full model output)
POST   /predictions/simulate     (custom feature test)
GET    /predictions/value-bets   (opportunities)
GET    /predictions/accuracy     (backtest stats)
```

### Betting Router
```
GET    /bets/virtual         (user's bets)
POST   /bets/virtual         (place bet)
DELETE /bets/virtual/{id}    (cancel)
GET    /bets/virtual/stats   (ROI, accuracy)
POST   /bets/virtual/reset   (reset bankroll)
```

---

## Parameters

| Flag | Example | Description |
|------|---------|-------------|
| `--name` | `auth` | Router module name |
| `--model` | `User` | SQLAlchemy model class |
| `--endpoints` | `get_all,get_one` | Comma-separated endpoints to generate |
| `--auth` | `required` | Auth requirement: `none`, `optional`, `required` |
| `--cache` | `3600` | Cache results for N seconds (0 = no cache) |
| `--pagination` | `true` | Add limit/offset pagination |

---

## Integration

After generation, the router is **automatically imported** in `main.py`:

```python
# backend/app/main.py
from app.routers import auth, matches, teams, players, predictions, betting

app.include_router(auth.router)
app.include_router(matches.router)
# ... etc
```

Then test:
```bash
pytest backend/tests/unit/routers/test_auth.py -v
# OR
curl http://localhost:8000/api/v1/auth/register -X POST ...
```

---

## Customization

Generated routers are **fully editable**. You can:
- Modify endpoints
- Add business logic
- Change validation rules
- Add caching
- Add webhooks

The generator is just a **fast starting point**, not a strict template.

---

## Next Steps

1. Generate all 6 routers (Auth, Matches, Teams, Players, Predictions, Betting)
2. Customize business logic as needed
3. Write integration tests
4. Document with Swagger examples

**Time Estimate:** ~5 min per router (manual edits)

---

**Last Updated:** 2026-04-24
