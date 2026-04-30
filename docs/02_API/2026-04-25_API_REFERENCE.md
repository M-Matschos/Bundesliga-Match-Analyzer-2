# Match Oracle — API Reference
**Version:** 1.0.0  
**Base URL:** `http://localhost:8000/api/v1` (Local) | `https://api.matchoracle.com` (Production)  
**Documentation Date:** 2026-04-25

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints by Category](#endpoints-by-category)
5. [Code Examples](#code-examples)

---

## Authentication

### JWT Token Flow

All protected endpoints require a Bearer token:

```http
Authorization: Bearer <access_token>
```

#### 1. Register New User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (201 Created):**
```json
{
  "user_id": "uuid-123",
  "email": "user@example.com",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 604800
}
```

#### 2. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 604800,
  "token_type": "bearer"
}
```

#### 3. Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 604800
}
```

#### 4. Get Current User
```bash
GET /auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user_id": "uuid-123",
  "email": "user@example.com",
  "created_at": "2026-04-20T10:30:00Z",
  "preferences": {
    "leagues": ["bundesliga", "bundesliga2"],
    "theme": "dark"
  }
}
```

#### 5. Logout
```bash
POST /auth/logout
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

## Endpoints by Category

### 📅 Matches

#### GET /matches
Fetch matches with filters

```bash
GET /matches?league=bundesliga&season=2025-26&matchday=28&status=scheduled
Authorization: Bearer <token>
```

**Query Parameters:**
- `league` (string): `bundesliga`, `bundesliga2`, `dfb-pokal`
- `season` (string): Format `2025-26`
- `matchday` (integer): 1-34
- `status` (string): `scheduled`, `live`, `finished`
- `page` (integer): Default 1
- `limit` (integer): Default 20, Max 100

**Response (200 OK):**
```json
{
  "matches": [
    {
      "match_id": "m-1234",
      "home_team": "Bayern Munich",
      "away_team": "Borussia Dortmund",
      "kickoff": "2026-05-15T19:30:00Z",
      "status": "scheduled",
      "stadium": "Allianz Arena",
      "attendance": null,
      "home_goals": null,
      "away_goals": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 306,
    "pages": 16
  }
}
```

#### GET /matches/{match_id}
Get single match details

```bash
GET /matches/m-1234
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "match_id": "m-1234",
  "home_team": {
    "team_id": "t-1",
    "name": "Bayern Munich",
    "logo_url": "https://...",
    "form": ["W", "W", "D", "W", "W"],
    "goals_for": 45,
    "goals_against": 12
  },
  "away_team": {
    "team_id": "t-2",
    "name": "Borussia Dortmund",
    "logo_url": "https://...",
    "form": ["W", "W", "L", "W", "D"],
    "goals_for": 38,
    "goals_against": 18
  },
  "kickoff": "2026-05-15T19:30:00Z",
  "weather": {
    "temperature": 18,
    "condition": "clear",
    "wind_speed": 12
  },
  "previous_meetings": [
    {
      "date": "2025-10-10",
      "home_goals": 3,
      "away_goals": 1,
      "winner": "home"
    }
  ]
}
```

### 👥 Teams

#### GET /teams
List all teams

```bash
GET /teams?league=bundesliga
Authorization: Bearer <token>
```

**Query Parameters:**
- `league` (string): `bundesliga`, `bundesliga2`

**Response (200 OK):**
```json
{
  "teams": [
    {
      "team_id": "t-1",
      "name": "Bayern Munich",
      "logo_url": "https://...",
      "standing": 1,
      "points": 84,
      "matches_played": 28,
      "wins": 27,
      "draws": 3,
      "losses": 1,
      "goals_for": 89,
      "goals_against": 18,
      "goal_difference": 71
    }
  ]
}
```

#### GET /teams/{team_id}
Get team details

```bash
GET /teams/t-1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "team_id": "t-1",
  "name": "Bayern Munich",
  "founded": 1900,
  "stadium": "Allianz Arena",
  "city": "Munich",
  "coach": "Vincent Kompany",
  "formation": "4-2-3-1",
  "squad": [
    {
      "player_id": "p-1",
      "name": "Manuel Neuer",
      "position": "GK",
      "number": 1,
      "age": 38,
      "market_value": "5M€"
    }
  ],
  "recent_matches": [
    {
      "match_id": "m-100",
      "opponent": "Bayer Leverkusen",
      "result": "3-1",
      "date": "2026-04-20"
    }
  ]
}
```

### 👤 Players

#### GET /players
Search players

```bash
GET /players?name=Sane&team_id=t-1
Authorization: Bearer <token>
```

**Query Parameters:**
- `name` (string): Player name (partial match)
- `team_id` (string): Filter by team
- `position` (string): `GK`, `DEF`, `MID`, `FWD`

**Response (200 OK):**
```json
{
  "players": [
    {
      "player_id": "p-234",
      "name": "Leroy Sané",
      "position": "MID",
      "team_id": "t-1",
      "team_name": "Bayern Munich",
      "number": 10,
      "age": 28,
      "nationality": "Germany",
      "market_value": "75M€",
      "injury_status": "fit",
      "yellow_cards": 3,
      "red_cards": 0,
      "goals": 12,
      "assists": 8
    }
  ]
}
```

#### GET /players/{player_id}
Get player profile

```bash
GET /players/p-234
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "player_id": "p-234",
  "name": "Leroy Sané",
  "position": "MID",
  "team_id": "t-1",
  "contract_until": "2027-06-30",
  "stats": {
    "appearances": 24,
    "goals": 12,
    "assists": 8,
    "minutes_played": 1920,
    "avg_rating": 7.8
  },
  "injury_history": [
    {
      "injury": "Muscle strain",
      "date_from": "2026-03-10",
      "date_to": "2026-03-25",
      "status": "recovered"
    }
  ],
  "upcoming_fixtures": [
    {
      "match_id": "m-1234",
      "opponent": "Borussia Dortmund",
      "date": "2026-05-15"
    }
  ]
}
```

### 🎯 Predictions

#### GET /predictions/{match_id}
Get match prediction

```bash
GET /predictions/m-1234
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "match_id": "m-1234",
  "prediction": {
    "home_win_prob": 0.62,
    "draw_prob": 0.20,
    "away_win_prob": 0.18,
    "most_likely": "HOME",
    "confidence": 0.62
  },
  "expected_goals": {
    "home_xg": 2.1,
    "away_xg": 0.8,
    "total_xg": 2.9
  },
  "probabilities": {
    "over_2_5_goals": 0.65,
    "both_score": 0.48,
    "home_clean_sheet": 0.42,
    "away_clean_sheet": 0.68
  },
  "feature_importance": [
    {
      "feature": "Home team form",
      "importance": 0.18,
      "impact": "positive"
    },
    {
      "feature": "Away team injuries",
      "importance": 0.12,
      "impact": "positive"
    },
    {
      "feature": "Head-to-head history",
      "importance": 0.09,
      "impact": "neutral"
    }
  ],
  "value_bets": [
    {
      "bet_type": "Home Win",
      "model_prob": 0.62,
      "market_prob": 0.55,
      "value": 0.07,
      "recommended_kelly": 0.035
    }
  ]
}
```

#### POST /predictions/simulate
Simulate prediction with custom features

```bash
POST /predictions/simulate
Authorization: Bearer <token>
Content-Type: application/json

{
  "match_id": "m-1234",
  "override_features": {
    "home_team_form": [0, 0, 1, 1, 1],
    "home_team_missing_players": ["Sané", "Müller"],
    "weather_condition": "rain",
    "home_advantage": 0.1
  }
}
```

**Response (200 OK):**
```json
{
  "base_prediction": { "home_win_prob": 0.62, "draw_prob": 0.20, "away_win_prob": 0.18 },
  "adjusted_prediction": { "home_win_prob": 0.55, "draw_prob": 0.22, "away_win_prob": 0.23 },
  "changes": {
    "home_win_prob_delta": -0.07,
    "reason": "Missing key attacking players (Sané, Müller) reduces home advantage"
  }
}
```

### 💰 Betting

#### GET /betting/bets
List user's bets

```bash
GET /betting/bets?status=active
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (string): `active`, `completed`, `all`
- `date_from` (ISO8601): Filter by date
- `date_to` (ISO8601): Filter by date

**Response (200 OK):**
```json
{
  "bets": [
    {
      "bet_id": "b-1001",
      "match_id": "m-1234",
      "match": "Bayern Munich vs Borussia Dortmund",
      "bet_type": "HOME_WIN",
      "odds": 1.65,
      "stake": 100,
      "potential_return": 165,
      "status": "pending",
      "created_at": "2026-04-25T10:30:00Z"
    }
  ],
  "portfolio": {
    "total_staked": 250,
    "total_return": 0,
    "win_rate": 0.0,
    "roi": 0.0
  }
}
```

#### POST /betting/place-bet
Place a virtual bet

```bash
POST /betting/place-bet
Authorization: Bearer <token>
Content-Type: application/json

{
  "match_id": "m-1234",
  "bet_type": "HOME_WIN",
  "odds": 1.65,
  "stake": 100,
  "using_kelly": true,
  "kelly_fraction": 0.5
}
```

**Response (201 Created):**
```json
{
  "bet_id": "b-1001",
  "match_id": "m-1234",
  "bet_type": "HOME_WIN",
  "odds": 1.65,
  "stake": 50,
  "potential_return": 82.5,
  "kelly_sizing": {
    "formula_result": 0.07,
    "kelly_fraction": 0.5,
    "recommended_stake": 50
  },
  "status": "pending",
  "created_at": "2026-04-25T11:45:00Z"
}
```

### 📊 Metrics

#### GET /metrics/dashboard
Get model accuracy dashboard

```bash
GET /metrics/dashboard?period=30d
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string): `7d`, `30d`, `90d`, `1y`, `all`

**Response (200 OK):**
```json
{
  "period": "30d",
  "overall_accuracy": 0.67,
  "predictions_count": 128,
  "by_confidence": [
    {
      "confidence_level": "> 70%",
      "accuracy": 0.75,
      "predictions": 45,
      "sample_size": 45
    },
    {
      "confidence_level": "60-70%",
      "accuracy": 0.62,
      "predictions": 38,
      "sample_size": 38
    },
    {
      "confidence_level": "< 60%",
      "accuracy": 0.51,
      "predictions": 45,
      "sample_size": 45
    }
  ],
  "by_league": [
    {
      "league": "bundesliga",
      "accuracy": 0.69,
      "predictions": 76
    },
    {
      "league": "bundesliga2",
      "accuracy": 0.64,
      "predictions": 52
    }
  ],
  "roi_trend": [
    { "date": "2026-03-25", "roi": 0.12 },
    { "date": "2026-04-01", "roi": 0.18 },
    { "date": "2026-04-15", "roi": 0.22 },
    { "date": "2026-04-25", "roi": 0.25 }
  ]
}
```

#### GET /metrics/health-check
Backend health status

```bash
GET /metrics/health-check
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-25T12:00:00Z",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "ml_models": "healthy",
    "external_apis": {
      "api_football": "healthy",
      "odds_api": "healthy",
      "weather_api": "healthy"
    }
  },
  "uptime_seconds": 345600,
  "requests_last_hour": 1234,
  "avg_response_time_ms": 145
}
```

### 🚨 Alerts

#### GET /alerts/feed
Get breaking news feed

```bash
GET /alerts/feed?priority=critical,high&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `priority` (string): `critical`, `high`, `medium`, `low`
- `alert_type` (string): `injury`, `suspension`, `tactical`, `transfer`, `weather`, `odds`
- `limit` (integer): Default 20, Max 100

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "alert_id": "a-5001",
      "alert_type": "INJURY",
      "priority": "HIGH",
      "team": "Bayern Munich",
      "affected_player": "Leroy Sané",
      "impact": "Bayern's attacking prowess significantly reduced without Sané",
      "source": "Official Club Statement",
      "impact_score": 0.18,
      "published_at": "2026-04-25T10:15:00Z",
      "matches_affected": ["m-1234", "m-1235"]
    }
  ],
  "stats": {
    "total_alerts_24h": 12,
    "critical_alerts": 1,
    "high_priority": 3,
    "trends": ["injuries_up", "transfers_down"]
  }
}
```

### 🏆 Weekend Calculator

#### POST /weekend/calculate
Calculate all weekend matches

```bash
POST /weekend/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "leagues": ["bundesliga", "bundesliga2"],
  "date_from": "2026-04-26",
  "date_to": "2026-04-28",
  "include_simulations": true
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "job-xyz123",
  "status": "calculating",
  "matches_count": 12,
  "estimated_duration_seconds": 8,
  "check_status_url": "/weekend/results/job-xyz123",
  "polling_interval_ms": 800
}
```

#### GET /weekend/results/{job_id}
Get weekend calculation results

```bash
GET /weekend/results/job-xyz123
Authorization: Bearer <token>
```

**Response (200 OK when complete):**
```json
{
  "job_id": "job-xyz123",
  "status": "completed",
  "duration_seconds": 7.8,
  "matches": [
    {
      "match_id": "m-1234",
      "home_team": "Bayern Munich",
      "away_team": "Borussia Dortmund",
      "prediction": "HOME",
      "confidence": 0.62,
      "home_prob": 0.62,
      "draw_prob": 0.20,
      "away_prob": 0.18,
      "xg_home": 2.1,
      "xg_away": 0.8
    }
  ]
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "reason": "Must be a valid email address"
    },
    "request_id": "req-123456"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Token valid but insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate email) |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

Rate limits are returned in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1682445600
```

### Limits by Endpoint Type

- **Authentication:** 5 req/min per IP
- **Predictions:** 100 req/min per user
- **Matches/Teams:** 500 req/min per user
- **Weekend Calculator:** 10 req/min per user
- **Betting:** 50 req/min per user

---

## Code Examples

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "user@example.com",
    "password": "secure123"
})
token = response.json()["access_token"]

# 2. Get predictions
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(
    f"{BASE_URL}/predictions/m-1234",
    headers=headers
)
prediction = response.json()
print(f"Home Win Probability: {prediction['prediction']['home_win_prob']}")

# 3. Place bet
response = requests.post(
    f"{BASE_URL}/betting/place-bet",
    headers=headers,
    json={
        "match_id": "m-1234",
        "bet_type": "HOME_WIN",
        "odds": 1.65,
        "stake": 100
    }
)
bet = response.json()
print(f"Bet placed with ID: {bet['bet_id']}")
```

### JavaScript (axios)

```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

// 1. Register
const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
  email: 'user@example.com',
  password: 'secure123'
});
const token = registerResponse.data.access_token;

// 2. Get predictions
const headers = { Authorization: `Bearer ${token}` };
const predictionResponse = await axios.get(
  `${BASE_URL}/predictions/m-1234`,
  { headers }
);
console.log(`Home Win: ${predictionResponse.data.prediction.home_win_prob}`);

// 3. Place bet
const betResponse = await axios.post(
  `${BASE_URL}/betting/place-bet`,
  {
    match_id: 'm-1234',
    bet_type: 'HOME_WIN',
    odds: 1.65,
    stake: 100
  },
  { headers }
);
console.log(`Bet ID: ${betResponse.data.bet_id}`);
```

### cURL

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

# 1. Register
TOKEN=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}' \
  | jq -r '.access_token')

# 2. Get predictions
curl -s -X GET "$BASE_URL/predictions/m-1234" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Place bet
curl -s -X POST "$BASE_URL/betting/place-bet" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": "m-1234",
    "bet_type": "HOME_WIN",
    "odds": 1.65,
    "stake": 100
  }' | jq '.'
```

---

## Support

- **Issues:** Open a GitHub issue
- **Slack:** #match-oracle-api
- **Email:** api-support@matchoracle.com
- **Status:** https://status.matchoracle.com
