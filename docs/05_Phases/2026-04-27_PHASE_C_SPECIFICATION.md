# ⚽ Phase C — Detail Screens & Advanced Features

**Status:** 📋 Not Started  
**Timeline:** Q2/Q3 2026 (4-6 weeks)  
**Scope:** Detail Screens, Live Updates, Advanced Analytics, Dark Mode  
**Dependencies:** Phase A+B ✅ Complete

---

## 📋 OVERVIEW

Phase C expands MVP with user-facing detail screens, real-time match updates via WebSocket, and advanced analytics visualizations. This phase bridges the gap between weekend predictions and in-depth match/team/player analysis.

### High-Level Features

| Feature | Scope | Priority | Est. Days |
|---------|-------|----------|-----------|
| Match-Detail Screen | Lineup, Stats, Commentary, Timeline | 🔴 P1 | 5 |
| Team-Detail Screen | Form, H2H, Performance Metrics | 🔴 P1 | 4 |
| Player-Profile Screen | Career, Stats, Injury Tracker | 🟠 P2 | 4 |
| WebSocket Live-Updates | Real-time Match Events | 🔴 P1 | 3 |
| xG Visualization | Expected Goals Charts | 🟠 P2 | 3 |
| Performance Timeline | Historical Form, Trends | 🟠 P2 | 3 |
| Dark Mode | Theme Toggle, Persistence | 🟡 P3 | 2 |
| Push Notifications | Value Bet Alerts | 🟡 P3 | 2 |

**Total: 26 Days (5.2-week sprint)**

---

## 🎨 MOBILE SCREENS

### 1. MatchDetailScreen

**Route:** `/match/:matchId`  
**Parent:** Dashboard → Matches List (tap on match card)

#### Layout
```
┌─ HEADER ──────────────────┐
│ Home Team    VS    Away    │ (Logo + Name)
│ 3 — 1                      │ (Score if live/ended)
│ 19:30 • Allianz Arena      │ (Time + Venue)
└────────────────────────────┘

┌─ TABS ─────────────────────┐
│ 📊 Stats  📋 Lineup  💬 Live│
└────────────────────────────┘

┌─ TAB: STATS ───────────────┐
│                            │
│ Possession: 58% vs 42%     │
│ Shots: 14 vs 7             │
│ Shots on Target: 6 vs 3    │
│ xG: 2.14 vs 1.02           │ ← Predicted vs Actual
│ Corners: 5 vs 2            │
│ Fouls: 12 vs 15            │
│                            │
│ [See Full Stats]           │
└────────────────────────────┘

┌─ TAB: LINEUP ──────────────┐
│ Home Formation: 4-2-3-1    │
│                            │
│ GK: Neuer (90 min)         │
│ DEF: Süle, Hernández ...   │
│ MID: Kimmich, Goretzka ... │
│ FWD: Müller, Sané, Kane   │
│                            │
│ Away Formation: 4-3-3      │
│ [Similar layout]           │
└────────────────────────────┘

┌─ TAB: LIVE (if ongoing) ───┐
│ 45' Goal: Kane! (1-0)      │
│ 38' Yellow: Hernández      │
│ 32' Chance: Sané (off target)
│ 28' Goal: Müller (1-0)     │
│ 20' Yellow: Kimmich        │
│ ...                        │
│ [Auto-scroll, newest first]│
└────────────────────────────┘

┌─ FOOTER ───────────────────┐
│ [Prediction Stats] [Share] │
└────────────────────────────┘
```

#### Key Features
- **Live Commentary:** Auto-refresh via WebSocket (new events in real-time)
- **xG Visualization:** Compare predicted vs actual
- **Player Stats:** Tap player → mini-profile (rating, touches, passes)
- **Prediction Badge:** Show confidence + our prediction vs result

#### API Endpoints (New)
```
GET /api/v1/matches/{match_id}/full-stats
  → {possession, shots, xg, corners, fouls, cards}

GET /api/v1/matches/{match_id}/lineup
  → {home: [{id, name, position, number}], away: [...]}

GET /api/v1/matches/{match_id}/events
  → {events: [{minute, type, player, description}]} (polled)

WS /ws/live/{match_id}
  → Real-time: {event: "goal|yellow|substitution", player, minute}
```

#### Backend Tasks
- [ ] Aggregate match stats from PostgreSQL + API-Football
- [ ] Lineup schema: store formation, player positions
- [ ] Event timeline: goals, cards, substitutions (TimescaleDB)
- [ ] WebSocket handler: broadcast match events to connected clients

---

### 2. TeamDetailScreen

**Route:** `/team/:teamId`  
**Parent:** Teams tab → team card

#### Layout
```
┌─ HEADER ───────────────────┐
│ Team Logo + Name           │
│ Bundesliga, 1st Place      │ (League + Current Position)
│ 35 pts | 12W-0D-1L | 38 GD │ (Points, Record, Goal Diff)
└────────────────────────────┘

┌─ TABS ─────────────────────┐
│ 📈 Form  📊 Stats  🏆 H2H  │
└────────────────────────────┘

┌─ TAB: FORM (Last 10) ──────┐
│ W  W  W  D  W  W  L  W  W  │ (Cards, color-coded)
│ 3-0 2-1 1-0 ... 0-1 ...    │ (Score on hover)
│ 20 days • Avg: 2.8 pts/gm  │
│                            │
│ Performance Trend: ↗ +5%   │
│ xG Trend: ↘ -0.3 vs avg    │
└────────────────────────────┘

┌─ TAB: STATS ───────────────┐
│ Goals For: 38 (avg 2.92)   │
│ Goals Against: 8 (avg 0.61)│
│ Possession: 61% (avg)      │
│ Shots per Game: 14.2       │
│ xG per Game: 2.14          │
│ Clean Sheets: 9            │
│                            │
│ [See Full Metrics] [Export]│
└────────────────────────────┘

┌─ TAB: H2H (vs Opponent) ───┐
│ [When on Team page, H2H   │
│  against selected opponent]│
│                            │
│ Last 5 Meetings:           │
│ 2-1, 3-0, 1-1, 0-2, 2-1   │
│                            │
│ Head-to-Head Stats:        │
│ Wins: 3 | Draws: 1 | Loss: 1│
│ Avg Goals: 2.0 vs 0.8      │
│ Next Match: [Date]         │
└────────────────────────────┘
```

#### Key Features
- **Form Cards:** Visual W/D/L streak with color coding
- **Performance Metrics:** Goals, xG, Possession trends
- **H2H Comparison:** Seasonal record vs rivals
- **Export:** Generate shareable team report

#### API Endpoints (New)
```
GET /api/v1/teams/{team_id}/season-stats
  → {gf, ga, possession, shots, xg, clean_sheets, form_trend}

GET /api/v1/teams/{team_id}/form-last-n?n=10
  → {form: [["W", "2-1"], ["D", "1-1"], ...]}

GET /api/v1/teams/{team_id}/h2h/{opponent_id}
  → {head_to_head: [{date, result, score}], stats: {wins, draws, losses}}
```

#### Backend Tasks
- [ ] Aggregate seasonal statistics (wins, goals, xG)
- [ ] Form calculation: last 10 matches analysis
- [ ] H2H schema: historical matchups between teams
- [ ] Performance trends: rolling averages, trend direction

---

### 3. PlayerProfileScreen

**Route:** `/player/:playerId`  
**Parent:** Team → Player name (tap)

#### Layout
```
┌─ HEADER ───────────────────┐
│ Player Photo + Name        │
│ Position: ST | Number: 9   │
│ Team: FC Bayern • 25 yrs   │
└────────────────────────────┘

┌─ STATS ROW ────────────────┐
│ 14 Goals | 3 Assists       │
│ 8 Yellow | 0 Red           │
│ 78% Pass | 1.2 Tackles/gm  │
└────────────────────────────┘

┌─ TABS ─────────────────────┐
│ 📊 Stats  ⚽ Goals  🤕 Injury
└────────────────────────────┘

┌─ TAB: STATS ───────────────┐
│ Appearances: 34 (2,856 min)│
│ Goals: 14 (avg 0.41/gm)    │
│ Assists: 3                 │
│ Pass Accuracy: 78%         │
│ Shots/Game: 2.1            │
│ Tackles/Game: 1.2          │
│ Interceptions/Game: 0.8    │
│                            │
│ Rating: 7.6/10 (avg)       │
│ Trend: ↗ +0.3 last 3 gm    │
└────────────────────────────┘

┌─ TAB: GOALS ───────────────┐
│ Recent Goals:              │
│ vs BVB (2-1) • 76' — Header│
│ vs Köln (3-0) • 45' — Left │
│ vs Hoffenheim • 28' — Pen  │
│ ...                        │
│ [Historical goal tracker]  │
└────────────────────────────┘

┌─ TAB: INJURY ──────────────┐
│ Status: 🟢 Fit             │
│ Last Injury: Hamstring     │
│ Out: Dec 2-15 (14 days)    │
│                            │
│ Injury History:            │
│ 2026: Muscle (5 days)      │
│ 2025: Calf (10 days)       │
│ 2025: Ankle (21 days)      │
│                            │
│ Injury Risk (AI Pred): 3%  │
│ [Next Match Risk: 1%]      │
└────────────────────────────┘
```

#### Key Features
- **Performance Metrics:** Stats aggregation with trends
- **Goal Timeline:** Video highlights (if available)
- **Injury Tracker:** History + AI-predicted injury risk
- **Comparison:** Compare to position average

#### API Endpoints (New)
```
GET /api/v1/players/{player_id}/season-stats
  → {appearances, goals, assists, minutes, pass_acc, tackles, rating}

GET /api/v1/players/{player_id}/goals
  → {goals: [{date, opponent, minute, type, video_url}]}

GET /api/v1/players/{player_id}/injuries
  → {current_status, history: [{date, type, duration}], risk_prediction}
```

#### Backend Tasks
- [ ] Player stats schema: appearances, goals, assists, pass%, tackles
- [ ] Injury tracking: model injury patterns, predict future risk
- [ ] Goal timeline: link to API-Football video highlights
- [ ] Player comparison: vs position average, vs team average

---

## 🔌 WEBSOCKET LIVE-UPDATES

### Specification

**Endpoint:** `ws://api.matchoracle.app/ws/live/{match_id}`

#### Authentication
```javascript
// Connect with JWT token
const ws = new WebSocket(
  `ws://api.matchoracle.app/ws/live/${matchId}?token=${accessToken}`
)
```

#### Events (Server → Client)

```json
{
  "type": "goal",
  "minute": 45,
  "second": 23,
  "player_id": "kane_123",
  "player_name": "Harry Kane",
  "team": "home",
  "score_before": "1-0",
  "score_after": "2-0",
  "goal_type": "open_play",
  "timestamp": "2026-04-26T19:45:23Z"
}

{
  "type": "yellow_card",
  "minute": 38,
  "player_id": "hernandez_456",
  "player_name": "Lucas Hernández",
  "team": "home",
  "reason": "Foul",
  "timestamp": "2026-04-26T19:38:15Z"
}

{
  "type": "substitution",
  "minute": 60,
  "player_out_id": "muller_789",
  "player_out_name": "Thomas Müller",
  "player_in_id": "sane_101",
  "player_in_name": "Leroy Sané",
  "team": "home",
  "timestamp": "2026-04-26T20:00:00Z"
}

{
  "type": "possession",
  "minute": 30,
  "possession_home": 58,
  "possession_away": 42,
  "timestamp": "2026-04-26T19:30:00Z"
}

{
  "type": "match_start",
  "minute": 0,
  "timestamp": "2026-04-26T19:30:00Z"
}

{
  "type": "match_end",
  "minute": 90,
  "final_score": "3-1",
  "timestamp": "2026-04-26T21:20:00Z"
}
```

#### Client-Side Integration (React Native)

```typescript
import { useEffect, useState } from 'react'

export function useMatchLiveUpdates(matchId: string, accessToken: string) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(
      `ws://api.matchoracle.app/ws/live/${matchId}?token=${accessToken}`
    )

    ws.onopen = () => {
      setConnected(true)
      logger.info('WebSocket connected', { matchId })
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setEvents((prev) => [data, ...prev]) // Prepend new event
      
      // Trigger Toast notification
      if (data.type === 'goal') {
        showToast(`⚽ GOAL! ${data.player_name}`, {
          duration: 5000,
          type: 'success'
        })
      }
    }

    ws.onerror = (error) => {
      logger.error('WebSocket error', { matchId, error })
      setConnected(false)
    }

    return () => ws.close()
  }, [matchId, accessToken])

  return { events, connected }
}
```

#### Backend Implementation (FastAPI)

```python
# backend/app/routers/websocket.py

from fastapi import APIRouter, WebSocket, Query, Depends
from app.core.security import verify_token

router = APIRouter(prefix="/ws", tags=["websocket"])

# In-memory client tracking
connected_clients: dict[str, list[WebSocket]] = {}

@router.websocket("/live/{match_id}")
async def websocket_live_match(
    websocket: WebSocket,
    match_id: str,
    token: str = Query(...),
):
    # Verify JWT token
    try:
        user = verify_token(token)
    except InvalidTokenError:
        await websocket.close(code=1008, reason="Unauthorized")
        return
    
    await websocket.accept()
    
    # Add to connected clients
    if match_id not in connected_clients:
        connected_clients[match_id] = []
    connected_clients[match_id].append(websocket)
    
    logger.info(f"Client connected to {match_id}", extra={"user_id": user.id})
    
    try:
        while True:
            # Keep connection alive, receive ping/pong
            data = await websocket.receive_text()
    except Exception:
        pass
    finally:
        # Remove on disconnect
        connected_clients[match_id].remove(websocket)
        logger.info(f"Client disconnected from {match_id}")

# Background task: Broadcast match events
async def broadcast_match_event(match_id: str, event: dict):
    """Broadcast event to all connected clients."""
    if match_id not in connected_clients:
        return
    
    message = json.dumps(event)
    disconnected = []
    
    for client in connected_clients[match_id]:
        try:
            await client.send_text(message)
        except Exception as e:
            logger.error(f"Failed to send to client: {e}")
            disconnected.append(client)
    
    # Remove disconnected clients
    for client in disconnected:
        connected_clients[match_id].remove(client)
```

#### Backend Tasks
- [ ] WebSocket handler: accept connections, verify JWT, manage clients
- [ ] Event broadcaster: push match events to all subscribers
- [ ] Heartbeat: ping/pong to detect dead connections
- [ ] Rate limiting: prevent event spam (max 100 events/sec)

---

## 📊 ANALYTICS VISUALIZATIONS

### xG Chart

**Location:** MatchDetailScreen, Stats tab

```
Home Team xG Timeline
┌──────────────────────────────┐
│ Cumulative xG vs Time        │
│                              │
│ 3.0 │       ╱─────────────   │ (Final: 2.14)
│ 2.5 │     ╱                  │
│ 2.0 │   ╱─────                │
│ 1.5 │  ╱                      │
│ 1.0 │ ╱                       │
│ 0.5 │╱                        │
│   0 └──────────────────────→ │
│     0   15   30   45   60   90│ (Minutes)
└──────────────────────────────┘

Away Team: 1.02 (Dashed line)
```

**Implementation:**
- Use Chart.js or React Native Charts
- Data source: `GET /api/v1/matches/{match_id}/xg-timeline`

---

### Performance Timeline (Team)

**Location:** TeamDetailScreen, Form tab

```
Performance Index (Last 10 Matches)
┌────────────────────────────────┐
│ 100 │     ╱╲    ╱╲    ╱        │
│  80 │    ╱  ╲  ╱  ╲  ╱        │
│  60 │   ╱    ╲╱    ╲╱       │
│  40 │                       │
│  20 │                       │
│   0 └────────────────────── │
│     1  2  3  4  5  6  7  8  9 10
│ (Red=Loss, Yellow=Draw, Green=Win)
└────────────────────────────────┘
```

**Data Components:**
- Goals scored/conceded per match
- xG performance
- Possession %
- Pass accuracy

---

## 🌙 DARK MODE

**Implementation:**
- Add `colorScheme` state to Theme context
- Two color palettes: `light` + `dark`
- Persist preference to AsyncStorage

```typescript
// theme/colors.ts
export const colors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    card: '#F5F5F5',
    border: '#EEEEEE',
    primary: '#2196F3',
  },
  dark: {
    background: '#121212',
    text: '#FFFFFF',
    card: '#1E1E1E',
    border: '#333333',
    primary: '#64B5F6',
  }
}

// Dynamically select in components
const currentColors = isDarkMode ? colors.dark : colors.light
```

---

## 📲 PUSH NOTIFICATIONS

**Triggers:**
- Value bet detected (Edge > 5%)
- Favorite team goal
- Match live (15 min before kickoff)

**Implementation:**
- Firebase Cloud Messaging (FCM) backend
- Expo Notifications wrapper
- User preference toggles

```typescript
export async function registerForPushNotifications() {
  const token = (await Notifications.getExpoPushTokenAsync()).data
  
  await api.post('/api/v1/notifications/register', {
    push_token: token,
    platform: Platform.OS
  })
}
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Week 1: Detail Screens
- [ ] MatchDetailScreen (UI + API integration)
- [ ] TeamDetailScreen (UI + API integration)
- [ ] PlayerProfileScreen (UI + API integration)
- [ ] Navigation routing updates

### Week 2: WebSocket
- [ ] WebSocket handler (FastAPI)
- [ ] Event broadcaster
- [ ] Client-side hook (useMatchLiveUpdates)
- [ ] Real-time UI updates

### Week 3: Analytics
- [ ] xG Chart component
- [ ] Performance Timeline component
- [ ] Chart data aggregation
- [ ] Performance metrics calculations

### Week 4: Polish
- [ ] Dark Mode theme + toggle
- [ ] Push Notifications setup
- [ ] Performance optimization
- [ ] E2E testing

---

## 📈 SUCCESS CRITERIA

✅ All 3 detail screens functional (90%+ coverage)  
✅ WebSocket live updates latency < 500ms  
✅ All visualizations load < 1s  
✅ Dark mode fully functional  
✅ 90%+ test coverage on new code  
✅ Performance: no P99 latency > 300ms  
✅ All Phase A+B features still working (regression test)

---

**Version:** 1.0  
**Last Updated:** 2026-04-26
