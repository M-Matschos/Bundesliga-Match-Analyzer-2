# 📡 API Endpoints Reference

**Base URL:** `http://localhost:8000/api/v1`  
**Authentication:** Bearer Token (JWT)

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}

Response: 201 Created
{
  "id": "user_uuid",
  "email": "user@example.com",
  "created_at": "2026-04-24T10:00:00Z"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

### Get Profile
```http
GET /auth/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "user_uuid",
  "email": "user@example.com",
  "created_at": "2026-04-24T10:00:00Z"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 604800
}
```

---

## ⚽ Matches Endpoints

### List Matches
```http
GET /matches?league=bundesliga&season=2024-25&matchday=28&status=scheduled
Authorization: Bearer <access_token>

Response: 200 OK
{
  "total": 306,
  "limit": 100,
  "offset": 0,
  "matches": [
    {
      "id": "match_uuid",
      "home_team": "Bayern Munich",
      "away_team": "Borussia Dortmund",
      "kickoff": "2026-04-26T15:30:00Z",
      "league": "bundesliga",
      "status": "scheduled",
      "stadium": "Allianz Arena"
    }
  ]
}
```

**Query Parameters:**
- `league` (optional): bundesliga, bundesliga2, premier_league
- `season` (optional): YYYY-YY format (e.g., 2024-25)
- `matchday` (optional): 1-34
- `status` (optional): scheduled, live, finished, postponed

### Get Live Matches
```http
GET /matches/live
Authorization: Bearer <access_token>

Response: 200 OK
{
  "live_matches": [
    {
      "id": "match_uuid",
      "home_team": "Bayern Munich",
      "away_team": "Dortmund",
      "home_score": 2,
      "away_score": 1,
      "status": "live",
      "minute": 45
    }
  ]
}
```

### Get Match Detail
```http
GET /matches/{match_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "match_uuid",
  "home_team": "Bayern Munich",
  "away_team": "Borussia Dortmund",
  "kickoff": "2026-04-26T15:30:00Z",
  "league": "bundesliga",
  "status": "scheduled",
  "stadium": "Allianz Arena",
  "home_score": null,
  "away_score": null,
  "expected_goals_home": 2.1,
  "expected_goals_away": 1.5
}
```

### Get Matches by Date
```http
GET /matches/by-date/2026-04-26
Authorization: Bearer <access_token>

Response: 200 OK
{
  "date": "2026-04-26",
  "matches": [...]
}
```

### Get Team Matches
```http
GET /matches/team/FCB?season=2024-25
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team_id": "FCB",
  "season": "2024-25",
  "matches": [...]
}
```

### Get Upcoming Matches
```http
GET /matches/upcoming?days=7&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
  "upcoming_days": 7,
  "matches": [...]
}
```

---

## 🧠 Predictions Endpoints

### Get Prediction
```http
GET /predictions/{match_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "match_id": "match_uuid",
  "home_win_prob": 0.45,
  "draw_prob": 0.28,
  "away_win_prob": 0.27,
  "confidence": 0.82,
  "expected_goals_home": 2.1,
  "expected_goals_away": 1.5,
  "most_likely_score": "2:1",
  "value_bet": {
    "exists": true,
    "selection": "home_win",
    "edge_percent": 7.5,
    "best_odds": 2.15,
    "kelly_stake_100": 3.2
  }
}
```

### Simulate Prediction
```http
POST /predictions/simulate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "home_team": "Bayern Munich",
  "away_team": "Borussia Dortmund"
}

Response: 200 OK
{
  "home_win_prob": 0.45,
  "draw_prob": 0.28,
  "away_win_prob": 0.27,
  "confidence": 0.82,
  "expected_goals_home": 2.1,
  "expected_goals_away": 1.5
}
```

### Get Value Bets
```http
GET /predictions/value-bets?min_edge=5
Authorization: Bearer <access_token>

Response: 200 OK
{
  "value_bets": [
    {
      "match_id": "match_uuid",
      "home_team": "Bayern Munich",
      "away_team": "Dortmund",
      "selection": "home_win",
      "our_probability": 0.45,
      "market_odds": 2.15,
      "edge_percent": 7.5,
      "kelly_stake_100": 3.2
    }
  ]
}
```

### Get Team Strength
```http
GET /predictions/team-strength/FCB
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team_id": "FCB",
  "attack_rating": 2.1,
  "defense_rating": 1.2,
  "elo_rating": 1750,
  "trend": "improving"
}
```

### Get Model Comparison
```http
GET /predictions/match-comparison/{match_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "match_id": "match_uuid",
  "poisson": {
    "home_win_prob": 0.44,
    "draw_prob": 0.29,
    "away_win_prob": 0.27
  },
  "dixon_coles": {
    "home_win_prob": 0.46,
    "draw_prob": 0.27,
    "away_win_prob": 0.27
  },
  "elo": {
    "home_win_prob": 0.45,
    "draw_prob": 0.28,
    "away_win_prob": 0.27
  }
}
```

---

## 🎯 Weekend Calculator Endpoints

### Start Calculation
```http
POST /weekend/calculate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "leagues": ["bundesliga", "bundesliga2"],
  "simulations": 1000,
  "date_from": "2026-04-26",
  "date_to": "2026-04-27"
}

Response: 202 Accepted
{
  "job_id": "job_uuid",
  "status": "calculating",
  "total_matches": 12,
  "estimated_seconds": 8
}
```

### Get Results
```http
GET /weekend/results/{job_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "job_id": "job_uuid",
  "status": "completed",
  "calculated_at": "2026-04-24T10:00:08Z",
  "matches": [
    {
      "match_id": "match_uuid",
      "home_team": "Bayern Munich",
      "away_team": "Dortmund",
      "prediction": {
        "home_win": 0.45,
        "draw": 0.28,
        "away_win": 0.27,
        "confidence": 0.82
      }
    }
  ],
  "summary": {
    "total_matches": 12,
    "high_confidence": 7,
    "medium_confidence": 3,
    "low_confidence": 2,
    "value_bets_found": 3
  }
}
```

### Get Next Weekend
```http
GET /weekend/next?leagues=bundesliga,bundesliga2
Authorization: Bearer <access_token>

Response: 200 OK
{
  "weekend_start": "2026-04-26T00:00:00Z",
  "weekend_end": "2026-04-27T23:59:59Z",
  "matches": [...]
}
```

### Get Matchday
```http
GET /weekend/matchday/bundesliga/28
Authorization: Bearer <access_token>

Response: 200 OK
{
  "league": "bundesliga",
  "matchday": 28,
  "matches": [...]
}
```

---

## 👥 Teams Endpoints

### List Teams
```http
GET /teams?league=bundesliga
Authorization: Bearer <access_token>

Response: 200 OK
{
  "league": "bundesliga",
  "total": 18,
  "teams": [
    {
      "id": "FCB",
      "name": "Bayern Munich",
      "logo": "https://..."
    }
  ]
}
```

### Get Team Detail
```http
GET /teams/FCB
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team_id": "FCB",
  "name": "Bayern Munich",
  "league": "bundesliga",
  "logo": "https://..."
}
```

### Get Team Form
```http
GET /teams/FCB/form?limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team_id": "FCB",
  "recent_matches": 10,
  "matches": [
    {
      "opponent": "Dortmund",
      "result": "W",
      "score": "3:1"
    }
  ],
  "metrics": {
    "wins": 7,
    "draws": 2,
    "losses": 1,
    "goals_for": 24,
    "goals_against": 8
  }
}
```

### Get Head-to-Head
```http
GET /teams/FCB/head-to-head/BVB?limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team_1": "FCB",
  "team_2": "BVB",
  "recent_matches": 10,
  "h2h": {
    "fcb_wins": 5,
    "draws": 2,
    "bvb_wins": 3
  }
}
```

### Get Standings
```http
GET /teams/standings/bundesliga?season=2024-25
Authorization: Bearer <access_token>

Response: 200 OK
{
  "league": "bundesliga",
  "season": "2024-25",
  "standings": [
    {
      "rank": 1,
      "team_id": "FCB",
      "team_name": "Bayern Munich",
      "played": 28,
      "wins": 21,
      "draws": 4,
      "losses": 3,
      "goals_for": 68,
      "goals_against": 22,
      "goal_difference": 46,
      "points": 67
    }
  ]
}
```

---

## 🏟️ Players Endpoints

### List Players
```http
GET /players?team_id=FCB&position=Forward&limit=50
Authorization: Bearer <access_token>

Response: 200 OK
{
  "total": 12,
  "limit": 50,
  "players": [
    {
      "player_id": "kane-harry",
      "name": "Harry Kane",
      "position": "Forward",
      "team": "FCB",
      "jersey_number": 9
    }
  ]
}
```

### Get Player Detail
```http
GET /players/kane-harry
Authorization: Bearer <access_token>

Response: 200 OK
{
  "player_id": "kane-harry",
  "name": "Harry Kane",
  "position": "Forward",
  "team": "FCB",
  "jersey_number": 9,
  "nationality": "England",
  "date_of_birth": "1990-07-28",
  "height": 188,
  "weight": 89,
  "stats": {
    "appearances": 28,
    "goals": 22,
    "assists": 5,
    "yellow_cards": 2
  }
}
```

### Get Player Stats
```http
GET /players/kane-harry/stats?season=2024-25
Authorization: Bearer <access_token>

Response: 200 OK
{
  "player_id": "kane-harry",
  "season": "2024-25",
  "stats": {
    "appearances": 28,
    "goals": 22,
    "assists": 5,
    "avg_rating": 8.2,
    "pass_accuracy": 0.78
  }
}
```

### Get Player Injuries
```http
GET /players/kane-harry/injuries
Authorization: Bearer <access_token>

Response: 200 OK
{
  "player_id": "kane-harry",
  "is_injured": false,
  "injuries": []
}
```

### Get Squad
```http
GET /players/team/FCB/squad?season=2024-25
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team_id": "FCB",
  "season": "2024-25",
  "squad": {
    "goalkeepers": [...],
    "defenders": [...],
    "midfielders": [...],
    "forwards": [...]
  }
}
```

---

## 💰 Virtual Betting Endpoints

### Place Bet
```http
POST /virtual-bets?match_id=<uuid>&bet_type=home_win&odds=1.95&amount=100
Authorization: Bearer <access_token>

Response: 201 Created
{
  "bet_id": "bet_uuid",
  "match_id": "match_uuid",
  "bet_type": "home_win",
  "odds": 1.95,
  "amount": 100.0,
  "status": "pending",
  "created_at": "2026-04-24T10:00:00Z"
}
```

### Get User Bets
```http
GET /virtual-bets?status=pending&limit=50&offset=0
Authorization: Bearer <access_token>

Response: 200 OK
{
  "total": 15,
  "limit": 50,
  "offset": 0,
  "bets": [
    {
      "bet_id": "bet_uuid",
      "match_id": "match_uuid",
      "bet_type": "home_win",
      "odds": 1.95,
      "amount": 100.0,
      "status": "pending",
      "win_amount": null,
      "created_at": "2026-04-24T10:00:00Z"
    }
  ]
}
```

### Get Bet Detail
```http
GET /virtual-bets/{bet_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "bet_id": "bet_uuid",
  "match_id": "match_uuid",
  "match": {
    "home_team": "Bayern Munich",
    "away_team": "Dortmund",
    "kickoff": "2026-04-26T15:30:00Z",
    "status": "scheduled",
    "home_score": null,
    "away_score": null
  },
  "bet_type": "home_win",
  "odds": 1.95,
  "amount": 100.0,
  "status": "pending",
  "win_amount": null,
  "created_at": "2026-04-24T10:00:00Z"
}
```

### Get Portfolio Statistics
```http
GET /virtual-bets/statistics/portfolio
Authorization: Bearer <access_token>

Response: 200 OK
{
  "total_bets": 42,
  "stats": {
    "total_staked": 4200.0,
    "total_winnings": 5680.0,
    "total_losses": 2100.0,
    "net_profit": 1380.0,
    "roi": 0.328,
    "win_rate": 0.619,
    "won_bets": 26,
    "lost_bets": 16,
    "pending_bets": 0
  }
}
```

### Cancel Bet
```http
POST /virtual-bets/{bet_id}/cancel
Authorization: Bearer <access_token>

Response: 200 OK
{
  "bet_id": "bet_uuid",
  "status": "void",
  "message": "Bet cancelled successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid bet_type. Must be one of: home_win, draw, away_win"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Match not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

All endpoints are rate-limited to **100 requests per minute** per IP address.

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

**Generated:** April 24, 2026  
**API Version:** 1.0.0  
**Status:** Production

