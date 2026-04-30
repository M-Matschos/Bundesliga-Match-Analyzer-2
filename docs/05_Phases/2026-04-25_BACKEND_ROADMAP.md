# 🔧 Backend Implementation Roadmap

**Purpose:** Track missing backend features, improvements, and technical debt  
**Audience:** Backend developers, architects  
**Status:** Active — In-Progress & Planned

---

## 🔴 CRITICAL GAPS (Phase C Dependencies)

### 1. XGBoost Model Integration

**Issue:** README mentions "XGBoost + Ensemble (Poisson, Dixon-Coles, Elo)" but actual ML implementation unclear

**Current State:**
- ✅ Poisson model implemented (historical)
- ✅ Dixon-Coles model (in use for ensemble)
- ✅ Elo rating system (for team strength)
- ❌ **XGBoost not integrated** — Feature engineering done, but XGBoost predictions not used

**Roadmap:**
```
Week 1 (Phase 3b Planning):
- [ ] Audit existing ML code (backend/app/ml/)
- [ ] Define XGBoost features (39 factors from Feature Engineering)
- [ ] Create training pipeline (Celery task)
- [ ] Implement prediction aggregation (ensemble weights)

Week 2 (Phase 3b Implementation):
- [ ] Train XGBoost on historical data (100k+ matches)
- [ ] A/B test: Poisson+Elo vs Poisson+Elo+XGBoost
- [ ] Calibrate model weights (0.3 Poisson, 0.3 Elo, 0.4 XGBoost)
- [ ] Deploy to production (model versioning)

Expected Impact: +2-3% accuracy on predictions
```

**Files to Create:**
```python
# backend/app/ml/xgboost_model.py
class XGBoostPredictor:
    def __init__(self, model_path: str):
        self.model = xgb.XGBRegressor()
        self.model.load_model(model_path)
    
    def predict(self, features: MatchFeatures) -> float:
        """Predict home team win probability (0-1)."""
        ...

# backend/scripts/train_xgboost.py
def train_xgboost_model(
    data: List[MatchRecord],
    output_path: str,
    test_split: float = 0.2
) -> dict:
    """Train XGBoost on historical matches, return metrics."""
    ...
```

**Validation:**
- [ ] Cross-validation (5-fold) on test set
- [ ] Calibration test: predicted prob vs actual win rate
- [ ] Comparison test: beat baseline (Poisson+Elo) on held-out 2026 matches

---

### 2. WebSocket Live-Updates API

**Issue:** No `/ws/live/{match_id}` endpoint for real-time match events (Phase C blocker)

**Current State:**
- ✅ FastAPI app running
- ❌ **No WebSocket handler**
- ❌ **No event broadcasting system**
- ❌ **No client connection management**

**Roadmap:**
```
Week 1 (Phase 3 Weeks 2-3):
- [ ] Add WebSocket router
- [ ] Implement event broadcaster
- [ ] Add connection lifecycle management
- [ ] Test with mock clients

Week 2:
- [ ] Integration with match event scraper (API-Football)
- [ ] Event timestamp validation
- [ ] Heartbeat/ping-pong mechanism
- [ ] Stress test: 1000 concurrent connections
```

**Code Template:**
```python
# backend/app/routers/websocket.py
from fastapi import APIRouter, WebSocket, Query, Depends, HTTPException
from typing import Dict, List
import json
import logging

router = APIRouter(prefix="/ws", tags=["websocket"])
logger = logging.getLogger(__name__)

# Global state: track connected clients per match
connected_clients: Dict[str, List[WebSocket]] = {}

@router.websocket("/live/{match_id}")
async def websocket_live_match(
    websocket: WebSocket,
    match_id: str,
    token: str = Query(...),
):
    """WebSocket endpoint for real-time match updates."""
    # 1. Verify JWT token
    try:
        user = verify_token(token)
    except InvalidTokenError:
        await websocket.close(code=1008, reason="Unauthorized")
        return
    
    # 2. Accept connection
    await websocket.accept()
    logger.info(f"Client {user.id} connected to match {match_id}")
    
    # 3. Register client
    if match_id not in connected_clients:
        connected_clients[match_id] = []
    connected_clients[match_id].append(websocket)
    
    try:
        # 4. Keep connection alive, handle incoming messages
        while True:
            # Receive heartbeat/keep-alive messages
            message = await websocket.receive_text()
            # Optional: validate message format
    except Exception as e:
        logger.error(f"WebSocket error for match {match_id}: {e}")
    finally:
        # 5. Cleanup on disconnect
        if match_id in connected_clients:
            connected_clients[match_id].remove(websocket)
            if not connected_clients[match_id]:
                del connected_clients[match_id]

async def broadcast_event(match_id: str, event: dict) -> int:
    """Broadcast event to all connected clients for a match."""
    if match_id not in connected_clients:
        return 0  # No clients
    
    message = json.dumps(event)
    disconnected = []
    sent_count = 0
    
    for client in connected_clients[match_id]:
        try:
            await client.send_text(message)
            sent_count += 1
        except Exception as e:
            logger.warning(f"Failed to send to client: {e}")
            disconnected.append(client)
    
    # Remove dead connections
    for client in disconnected:
        connected_clients[match_id].remove(client)
    
    return sent_count
```

**Event Types to Support:**
- Goal (home/away)
- Yellow/Red card
- Substitution
- Possession update (every 5 min)
- Match start/end
- Video review incident

**Testing:**
- [ ] Unit: Event formatting, JSON serialization
- [ ] Integration: Start match → broadcast goal → client receives
- [ ] Load: 100, 500, 1000 concurrent connections
- [ ] Latency: Event broadcast < 500ms from source

---

### 3. Structured Logging (JSON Format)

**Issue:** Logging is unstructured — no correlation IDs, inconsistent fields, hard to aggregate in production

**Current State:**
- ✅ Basic Python logging configured
- ❌ **No JSON format** (required for ELK/DataDog)
- ❌ **No correlation IDs** (trace requests end-to-end)
- ❌ **No context propagation** (async tasks lose request context)

**Roadmap:**
```
Phase 3 (Week 1):
- [ ] Install: pip install python-json-logger
- [ ] Implement JSON formatter
- [ ] Add correlation ID middleware
- [ ] Migrate existing log calls
```

**Implementation:**
```python
# backend/app/core/logging.py
import json
import logging
import uuid
from contextvars import ContextVar
from pythonjsonlogger import jsonlogger

# Global context for correlation ID
correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = correlation_id.get()
        return True

def setup_logging():
    """Configure JSON logging with correlation IDs."""
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        fmt="%(timestamp)s %(level)s %(name)s %(correlation_id)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%SZ"
    )
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.addFilter(CorrelationIdFilter())
    root_logger.setLevel(logging.INFO)

# In FastAPI app
from fastapi import Request, FastAPI
from app.core.logging import correlation_id, setup_logging

app = FastAPI()
setup_logging()

@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    """Inject correlation ID for tracing."""
    cid = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    token = correlation_id.set(cid)
    
    try:
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = cid
        return response
    finally:
        correlation_id.reset(token)

# Usage in any logger
logger.info(
    "prediction_calculated",
    extra={
        "match_id": "match_123",
        "model": "ensemble",
        "confidence": 0.78,
        "duration_ms": 456,
    }
)
# Output: {"timestamp": "2026-04-26T19:30:00Z", "level": "INFO", 
#          "correlation_id": "550e8400-e29b-41d4-a716-446655440000", ...}
```

**Benefits:**
- ✅ ELK/DataDog aggregation (JSON parsing)
- ✅ Request tracing (correlation ID)
- ✅ Performance monitoring (duration_ms)
- ✅ Error context (stack trace in JSON)

---

## 🟠 HIGH-PRIORITY IMPROVEMENTS

### 4. Circuit Breaker for External APIs

**Issue:** API-Football, OddsAPI, OpenWeatherMap can timeout/fail without graceful fallback

**Current State:**
- ✅ Try-catch error handling
- ❌ **No exponential backoff**
- ❌ **No circuit breaker** (fail fast when API is down)
- ❌ **No fallback cache** (return stale data vs hard error)

**Implementation (Phase 3):**
```python
# backend/app/core/circuit_breaker.py
from pybreaker import CircuitBreaker
import logging

logger = logging.getLogger(__name__)

api_football_breaker = CircuitBreaker(
    fail_max=5,           # 5 failures → Open
    reset_timeout=60,     # Try again after 60s
    listeners=[logging_listener]
)

@api_football_breaker
def get_match_stats(match_id: str) -> dict:
    """Fetch match stats with circuit breaker."""
    response = requests.get(
        f"https://api-football-v3.p.rapidapi.com/matches/{match_id}",
        timeout=5
    )
    response.raise_for_status()
    return response.json()

# In route handler
async def get_match_detail(match_id: str):
    try:
        # Try circuit breaker first
        stats = get_match_stats(match_id)
    except CircuitBreakerListener as e:
        # API is down, return cached data
        logger.warning(f"Circuit breaker open for API-Football: {e}")
        stats = get_cached_stats(match_id)  # Fall back to Redis
        if not stats:
            raise HTTPException(status_code=503, detail="API temporarily unavailable")
    
    return stats
```

**Pip Install:** `pip install pybreaker`

---

### 5. Database Performance: Indexes & Partitioning

**Issue:** Missing indexes on frequently-queried columns, no partitioning for time-series data

**Current State:**
- ✅ Primary keys indexed
- ❌ **No indexes on foreign keys** (matches.team_id, predictions.match_id)
- ❌ **No indexes on timestamps** (matches.scheduled_at, predictions.created_at)
- ❌ **No table partitioning** (TimescaleDB installed but not used)

**Roadmap (Phase 3):**

```sql
-- Create missing indexes
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at DESC);
CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status, user_id);

-- Enable TimescaleDB hypertable for time-series
SELECT create_hypertable('match_events', 'timestamp', if_not_exists => TRUE);
SELECT create_hypertable('performance_metrics', 'timestamp', if_not_exists => TRUE);

-- Auto-compress old data (30+ days)
ALTER TABLE match_events SET (
    timescaledb.compress,
    timescaledb.compress_orderby = 'timestamp DESC'
);

SELECT add_compression_policy('match_events', INTERVAL '30 days');
```

**Migration File:**
```python
# backend/alembic/versions/003_add_performance_indexes.py
def upgrade():
    op.create_index('idx_matches_scheduled_at', 'matches', ['scheduled_at'], unique=False)
    op.create_index('idx_matches_team_id', 'matches', ['team_id'], unique=False)
    op.create_index('idx_predictions_match_id', 'predictions', ['match_id'], unique=False)
    # ... etc
```

**Testing:**
- [ ] Query performance before/after (EXPLAIN ANALYZE)
- [ ] Index size (should be < 10% of table size)
- [ ] Query times reduced by 50%+

---

### 6. DSGVO Data Deletion Endpoint

**Issue:** No way for users to request data deletion (Article 17 — Right to be Forgotten)

**Current State:**
- ❌ **No DELETE endpoint**
- ❌ **No anonymization option**
- ❌ **No audit trail**

**Implementation (Phase 3):**
```python
# backend/app/routers/users.py

@router.post("/api/v1/users/{user_id}/delete")
async def delete_user_data(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete user account and all associated data (DSGVO Article 17)."""
    
    # Verify requesting user owns the account
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Log deletion request (audit trail)
    logger.info(
        "user_deletion_requested",
        extra={"user_id": user_id, "timestamp": datetime.utcnow()}
    )
    
    # Delete cascading data
    db.query(Bet).filter(Bet.user_id == user_id).delete()
    db.query(Prediction).filter(Prediction.user_id == user_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    
    logger.info("user_deleted", extra={"user_id": user_id})
    
    return {"status": "deleted", "message": "Your account has been deleted"}
```

**Documentation:**
- Add to API docs: `GET /api/v1/users/me/export` (DSGVO Article 20)
- Add to API docs: `POST /api/v1/users/{user_id}/delete` (DSGVO Article 17)

---

## 🟡 NICE-TO-HAVE FEATURES (Phase D+)

### 7. Rate Limiting per Endpoint

**Issue:** Global 100 req/min/IP is too coarse — Predictions endpoint is expensive

**Solution:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/weekend/calculate")
@limiter.limit("10/minute")  # Only 10 requests/min for expensive op
async def weekend_calculate(...):
    ...

@app.get("/api/v1/matches/{match_id}")
@limiter.limit("100/minute")  # More lenient for reads
async def get_match(...):
    ...
```

---

### 8. Authentication: Token Revocation

**Issue:** No way to revoke tokens (logout can't prevent reuse of stolen token)

**Solution:**
```python
# Add token blacklist table
class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    jti = Column(String, primary_key=True)  # JWT ID
    revoked_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

# On logout
@router.post("/api/v1/auth/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
):
    db.add(RevokedToken(jti=token_payload["jti"], expires_at=token_payload["exp"]))
    db.commit()
    return {"status": "logged_out"}

# In token verification
def verify_token(token: str, db: Session) -> dict:
    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    
    # Check if revoked
    revoked = db.query(RevokedToken).filter(RevokedToken.jti == payload["jti"]).first()
    if revoked:
        raise InvalidTokenError("Token has been revoked")
    
    return payload
```

---

### 9. API Documentation: OpenAPI Client Generation

**Issue:** Manual API client in mobile app, no auto-generation from OpenAPI spec

**Solution:**
```bash
# Install OpenAPI generator
pip install openapi-python-client

# Generate TypeScript client from OpenAPI spec
openapi-python-client generate \
  --input-file-path backend/openapi.json \
  --output-dir mobile/src/api/generated
```

Result: Type-safe API client with full autocomplete.

---

### 10. Performance: Caching Strategy Enhancement

**Current:** Redis cache with 24h TTL for predictions, 6h for standings

**Improvement:**
```python
# Invalidate cache on specific events
@app.post("/api/v1/matches/{match_id}/events")
async def post_match_event(match_id: str, event: MatchEvent, redis: Redis):
    # Save event
    save_event(event)
    
    # Invalidate related caches
    redis.delete(f"match:{match_id}:stats")
    redis.delete(f"team:{event.team_id}:form")
    redis.delete(f"team:{event.team_id}:predictions")
    
    return event
```

---

## 📋 SUMMARY TABLE

| Issue | Priority | Est. Days | Phase | Status |
|-------|----------|-----------|-------|--------|
| XGBoost Integration | 🔴 P1 | 5 | 3b | 📋 Planned |
| WebSocket Live API | 🔴 P1 | 3 | 3 | 📋 Planned |
| Structured Logging | 🟠 P2 | 2 | 3 | 📋 Planned |
| Circuit Breaker | 🟠 P2 | 2 | 3 | 📋 Planned |
| DB Indexes & Partitioning | 🟠 P2 | 2 | 3 | 📋 Planned |
| DSGVO Data Deletion | 🟠 P2 | 1 | 3 | 📋 Planned |
| Rate Limiting per Endpoint | 🟡 P3 | 1 | 3 | 📋 Nice-to-have |
| Token Revocation | 🟡 P3 | 2 | D | 📋 Nice-to-have |
| OpenAPI Client Gen | 🟡 P3 | 1 | D | 📋 Nice-to-have |
| Cache Invalidation | 🟡 P3 | 1 | D | 📋 Nice-to-have |

---

## 🎯 INTEGRATION WITH PHASES

**Phase 3 (Weeks 1-4):**
- ✅ XGBoost Integration
- ✅ WebSocket Live API
- ✅ Structured Logging
- ✅ Circuit Breaker
- ✅ DB Indexes
- ✅ DSGVO Deletion

**Phase 3b (Parallel, Weeks 1-6):**
- ✅ Advanced Analytics (xG, Performance Timeline)
- ✅ Knowledge-Graph API
- ✅ RAG-Traceability

**Phase D (After MVP):**
- 📋 Token Revocation
- 📋 OpenAPI Client Gen
- 📋 Advance Cache Strategy
- 📋 Rate Limiting per Endpoint

---

**Version:** 1.0  
**Last Updated:** 2026-04-26  
**Author:** Michael Matschos
