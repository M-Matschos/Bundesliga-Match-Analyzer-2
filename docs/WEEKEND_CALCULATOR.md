# ⚡ Weekend Calculator — Alle Spiele auf Knopfdruck

## Konzept

Das Herzstück der App: Ein einziger Button berechnet alle Prognosen für das aktuelle Bundesliga-Wochenende.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  📅 Spieltag 28 — 29./30. März 2025            │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  🔄 Alle Begegnungen jetzt berechnen    │   │
│  │                                         │   │
│  │  [  ⚡ BL1 + BL2 berechnen  ]           │   │
│  │  [  🏆 Nur Bundesliga 1     ]           │   │
│  │  [  🥈 Nur Bundesliga 2     ]           │   │
│  │  [  🌍 Alle Ligen           ]           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ⏱️  Berechnung läuft... (12 Spiele × 100k Sim) │
│  ████████████░░░░  8/12 Spiele berechnet        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Backend API

### Endpunkt: Wochenend-Berechnung starten

```
POST /api/v1/weekend/calculate
```

**Request Body:**
```json
{
  "leagues": ["bundesliga", "bundesliga2"],
  "date_from": "2025-03-29",
  "date_to":   "2025-03-30",
  "simulations": 100000
}
```

**Response:**
```json
{
  "job_id": "wknd_20250329_abc123",
  "status": "calculating",
  "total_matches": 12,
  "estimated_seconds": 8,
  "matches": [...]
}
```

### Endpunkt: Ergebnis abfragen

```
GET /api/v1/weekend/results/{job_id}
```

**Response (fertig):**
```json
{
  "job_id": "wknd_20250329_abc123",
  "status": "completed",
  "calculated_at": "2025-03-27T14:32:11Z",
  "matches": [
    {
      "match_id": "uuid-here",
      "home_team": {
        "id": "fcb",
        "name": "Bayern München",
        "logo_url": "/logos/bundesliga/fcb.png",
        "elo_rating": 1847
      },
      "away_team": {
        "id": "bvb",
        "name": "Borussia Dortmund",
        "logo_url": "/logos/bundesliga/bvb.png",
        "elo_rating": 1734
      },
      "kickoff": "2025-03-29T18:30:00Z",
      "stadium": "Allianz Arena",
      "prediction": {
        "home_win":  0.63,
        "draw":      0.18,
        "away_win":  0.19,
        "confidence": 0.78,
        "confidence_label": "HOCH",
        "expected_goals_home": 2.1,
        "expected_goals_away": 1.2,
        "most_likely_score": "2:1",
        "most_likely_score_prob": 0.14,
        "value_bet": {
          "exists": true,
          "selection": "home_win",
          "our_prob": 0.63,
          "bookmaker_prob": 0.58,
          "edge": 0.05,
          "best_odds": 1.65,
          "bookmaker": "Tipico"
        },
        "shap_top3": [
          { "factor": "xG Differenz (letzte 5)", "impact": +0.12 },
          { "factor": "Heimvorteil", "impact": +0.08 },
          { "factor": "Kader-Marktwert-Ratio", "impact": +0.05 }
        ]
      },
      "tipico_deeplink": "https://www.tipico.de/de/live-wetten/...",
      "weather": {
        "temp_celsius": 9,
        "condition": "Bewölkt",
        "rain_probability": 0.15
      }
    }
    // ... weitere Spiele
  ],
  "summary": {
    "total_matches": 12,
    "high_confidence": 4,
    "medium_confidence": 6,
    "low_confidence": 2,
    "value_bets_found": 3
  }
}
```

### Endpunkt: Nächstes Wochenende automatisch ermitteln

```
GET /api/v1/weekend/next?leagues=bundesliga,bundesliga2
```

→ Gibt Datum + alle Spiele des nächsten Spieltags zurück.

---

## Backend Implementation

### `backend/app/routers/weekend.py`

```python
from fastapi import APIRouter, BackgroundTasks
from ..core.cache import cache
from ..ml.models.monte_carlo import MonteCarloSimulator
from ..data.collectors.api_football import get_weekend_matches
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/weekend", tags=["weekend"])
simulator = MonteCarloSimulator(n_simulations=100_000)

@router.post("/calculate")
async def calculate_weekend(request: WeekendRequest, background_tasks: BackgroundTasks):
    job_id = f"wknd_{datetime.now().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"
    
    # Sofort antworten, Berechnung im Hintergrund
    background_tasks.add_task(run_weekend_calculation, job_id, request)
    
    matches = await get_weekend_matches(request.leagues, request.date_from, request.date_to)
    
    return {
        "job_id": job_id,
        "status": "calculating",
        "total_matches": len(matches),
        "estimated_seconds": len(matches) * 0.8
    }

@router.get("/results/{job_id}")
async def get_results(job_id: str):
    result = await cache.get(f"weekend_result:{job_id}")
    if not result:
        return {"status": "calculating"}
    return result

@router.get("/next")
async def get_next_weekend(leagues: str = "bundesliga,bundesliga2"):
    league_list = leagues.split(",")
    # Nächsten Spieltag ermitteln
    next_friday = get_next_friday()
    next_sunday = next_friday + timedelta(days=2)
    matches = await get_weekend_matches(league_list, next_friday, next_sunday)
    return {"date_from": next_friday, "date_to": next_sunday, "matches": matches}

async def run_weekend_calculation(job_id: str, request: WeekendRequest):
    """Hintergrund-Task: Berechnet alle Prognosen und cached sie."""
    matches = await get_weekend_matches(request.leagues, request.date_from, request.date_to)
    results = []
    
    for match in matches:
        # Feature-Engineering
        features = build_features(match)
        
        # Monte Carlo Simulation
        prediction = simulator.simulate(features)
        
        # Value Bet Check
        odds = await get_current_odds(match["match_id"])
        value_bet = check_value_bet(prediction, odds)
        
        results.append({**match, "prediction": prediction, "value_bet": value_bet})
    
    # Ergebnis in Redis cachen (24 Stunden)
    await cache.set(f"weekend_result:{job_id}", {
        "status": "completed",
        "calculated_at": datetime.utcnow().isoformat(),
        "matches": results,
        "summary": build_summary(results)
    }, ttl=86400)
```

---

## Frontend Implementation

### `mobile/src/screens/WeekendCalculatorScreen.tsx`

```typescript
import React, { useState, useCallback } from 'react'
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { calculateWeekend, getWeekendResults } from '../services/weekendService'
import MatchPredictionCard from '../components/MatchPredictionCard'
import ProgressBar from '../components/ProgressBar'

type League = 'bundesliga' | 'bundesliga2' | 'premier-league' | 'all'

export default function WeekendCalculatorScreen() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [selectedLeague, setSelectedLeague] = useState<League>('bundesliga')

  const handleCalculate = useCallback(async (league: League) => {
    setLoading(true)
    setProgress(0)
    setResults(null)

    try {
      // Job starten
      const job = await calculateWeekend(league)
      
      // Polling bis fertig
      const poll = setInterval(async () => {
        const res = await getWeekendResults(job.job_id)
        const pct = res.matches?.length
          ? (res.matches.filter(m => m.prediction).length / job.total_matches) * 100
          : 0
        setProgress(pct)
        
        if (res.status === 'completed') {
          clearInterval(poll)
          setResults(res)
          setLoading(false)
        }
      }, 800)
      
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }, [])

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>⚡ Wochenend-Kalkulator</Text>
      <Text style={styles.subtitle}>Alle Prognosen auf Knopfdruck</Text>

      {/* Buttons */}
      {!loading && !results && (
        <View style={styles.buttonContainer}>
          <CalcButton
            label="⚡ BL1 + BL2 berechnen"
            color="#1A3A5C"
            onPress={() => handleCalculate('bundesliga+bundesliga2')}
          />
          <CalcButton
            label="🏆 Nur Bundesliga 1"
            color="#2E75B6"
            onPress={() => handleCalculate('bundesliga')}
          />
          <CalcButton
            label="🥈 Nur Bundesliga 2"
            color="#4A90C4"
            onPress={() => handleCalculate('bundesliga2')}
          />
          <CalcButton
            label="🌍 Alle Ligen"
            color="#1E7B4B"
            onPress={() => handleCalculate('all')}
          />
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E75B6" />
          <Text style={styles.loadingText}>Berechne Prognosen...</Text>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>{Math.round(progress)}% abgeschlossen</Text>
        </View>
      )}

      {/* Ergebnisse */}
      {results && (
        <>
          <SummaryBar summary={results.summary} />
          
          {/* Nochmal berechnen Button */}
          <TouchableOpacity
            style={styles.recalcButton}
            onPress={() => setResults(null)}
          >
            <Text style={styles.recalcText}>🔄 Neu berechnen</Text>
          </TouchableOpacity>

          {/* Spiel-Kacheln */}
          {results.matches.map(match => (
            <MatchPredictionCard
              key={match.match_id}
              match={match}
              onVirtualBet={(match) => {/* → VirtualBettingScreen */}}
              onTipico={(link) => openTipicoLink(link)}
            />
          ))}
        </>
      )}
    </ScrollView>
  )
}
```

---

## Spieltag-Spezifischer Kalkulator

Zusätzlich zum Wochenend-Button gibt es einen **Spieltag-Selektor**:

```typescript
// Nutzer wählt spezifischen Spieltag
<MatchdayPicker
  league="bundesliga"
  currentMatchday={28}
  onSelect={(matchday) => calculateMatchday('bundesliga', matchday)}
/>
```

→ **Spieltag 1 bis 34** auswählbar
→ Vergangene Spieltage zeigen **tatsächliche Ergebnisse** vs. **Prognose** (Backtesting)
→ Zukünftige Spieltage zeigen **Prognosen**

---

## Caching-Strategie

| Situation | Cache-Verhalten |
|---|---|
| Erste Berechnung | Neu berechnen, 24h cachen |
| Selbes Wochenende, selbe Liga | Aus Cache zurückgeben |
| Neue Verletzungs-News | Cache invalidieren, neu berechnen |
| Spieltag läuft | Alle 15 Min neu berechnen |
| Spiel abgepfiffen | Ergebnis permanent speichern |
