# 📡 REST API Dokumentation

Base URL: `http://localhost:8000/api/v1`
Swagger UI: `http://localhost:8000/docs`

## Authentifizierung

```http
Authorization: Bearer <JWT_TOKEN>
```

Token erhalten via: `POST /auth/login`

---

## 🔑 Auth Endpunkte

| Method | Endpoint | Beschreibung |
|---|---|---|
| POST | `/auth/register` | Neuen Account erstellen |
| POST | `/auth/login` | JWT Token erhalten |
| POST | `/auth/refresh` | Token erneuern |
| GET | `/auth/me` | Eigenes Profil |

---

## ⚡ Weekend Calculator

| Method | Endpoint | Beschreibung |
|---|---|---|
| POST | `/weekend/calculate` | Wochenend-Berechnung starten |
| GET | `/weekend/results/{job_id}` | Ergebnis abfragen |
| GET | `/weekend/next` | Nächstes Wochenende |
| GET | `/weekend/matchday/{league}/{matchday}` | Bestimmter Spieltag |

### POST /weekend/calculate
```json
{
  "leagues": ["bundesliga", "bundesliga2"],
  "date_from": "2025-03-29",
  "date_to": "2025-03-30",
  "simulations": 100000
}
```

---

## ⚽ Matches

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/matches` | Alle Spiele (Filter: league, season, matchday) |
| GET | `/matches/{id}` | Spiel-Details |
| GET | `/matches/live` | Laufende Spiele |
| GET | `/matches/upcoming` | Nächste Spiele |

### Query Parameter für GET /matches
```
?league=bundesliga
&season=2024-25
&matchday=28
&status=scheduled
&limit=20
&offset=0
```

---

## 📊 Predictions

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/predictions/{match_id}` | Prognose für Spiel |
| POST | `/predictions/simulate` | Eigene Simulation |
| GET | `/predictions/value-bets` | Alle Value Bets heute |

### Response: GET /predictions/{match_id}
```json
{
  "match_id": "uuid",
  "home_win_prob": 0.63,
  "draw_prob": 0.18,
  "away_win_prob": 0.19,
  "confidence": 0.78,
  "confidence_label": "HOCH",
  "expected_goals_home": 2.1,
  "expected_goals_away": 1.2,
  "most_likely_score": "2:1",
  "most_likely_score_prob": 0.14,
  "top_scores": {"2:1": 0.14, "1:0": 0.12, "2:0": 0.10},
  "shap_values": [
    {"factor": "xG Differenz", "impact": 0.12, "direction": "positive"},
    {"factor": "Heimvorteil", "impact": 0.08, "direction": "positive"}
  ],
  "value_bet": {
    "exists": true,
    "selection": "home_win",
    "edge_percent": 5.2,
    "best_odds": 1.65,
    "best_bookmaker": "Tipico",
    "kelly_stake_100": 8.50
  }
}
```

---

## 🏟️ Teams

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/teams` | Alle Teams (Filter: league) |
| GET | `/teams/{id}` | Team-Details + Stats |
| GET | `/teams/{id}/form` | Form-Kurve letzte N Spiele |
| GET | `/teams/{id}/xg` | xG-Zeitreihe |
| GET | `/teams/{id}/players` | Kader |
| GET | `/teams/{id}/h2h/{opponent_id}` | Head-to-Head |

---

## 👤 Players

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/players/{id}` | Spieler-Details |
| GET | `/players/{id}/form` | Performance letzte Spiele |
| GET | `/players/{id}/influence` | Einfluss-Score ohne diesen Spieler |
| GET | `/players/injured` | Alle aktuell Verletzten |

---

## 🎲 Virtual Betting

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/bets/virtual` | Eigene virtuelle Wetten |
| POST | `/bets/virtual` | Neue virtuelle Wette |
| DELETE | `/bets/virtual/{id}` | Wette stornieren |
| GET | `/bets/virtual/stats` | ROI, Trefferquote, etc. |
| POST | `/bets/virtual/reset` | Bankroll zurücksetzen |

### POST /bets/virtual
```json
{
  "match_id": "uuid",
  "bet_type": "1X2",
  "selection": "home",
  "odds": 1.65,
  "stake": 25.00
}
```

---

## Fehler-Codes

| Code | Bedeutung |
|---|---|
| 400 | Ungültige Parameter |
| 401 | Nicht authentifiziert |
| 403 | Keine Berechtigung (Premium erforderlich) |
| 404 | Nicht gefunden |
| 429 | Rate Limit überschritten |
| 503 | ML-Service nicht verfügbar |
