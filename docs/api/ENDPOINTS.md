# 🔌 API-Referenz

Base URL: `https://api.match-oracle.de/api/v1`

---

## Authentifizierung

```
Authorization: Bearer <JWT-Token>

POST /auth/register  → Account erstellen
POST /auth/login     → JWT Token erhalten
POST /auth/refresh   → Token erneuern
```

---

## Kern-Endpoints

### Weekend Calculator (Haupt-Feature)
```
POST   /calculate/weekend
Body:  { "leagues": ["BL1","BL2"], "date_from": "2026-03-28", "date_to": "2026-03-30" }
→ Server-Sent Events mit Live-Fortschritt + finale Prognosen

POST   /calculate/match/{match_id}
→ Einzelspiel-Berechnung (sofort, ~500ms)
```

### Spiele
```
GET    /matches                    → Alle Spiele (Filter: league, date, status)
GET    /matches/{id}               → Einzelspiel mit allen Details
GET    /matches/weekend            → Alle Spiele dieses Wochenendes
GET    /matches/live               → Aktuell laufende Spiele
```

### Prognosen
```
GET    /predictions/{match_id}     → Vollständige Prognose mit SHAP
GET    /predictions/weekend        → Alle Wochenend-Prognosen
GET    /predictions/value-bets     → Alle aktuellen Value-Bets
```

### Teams
```
GET    /teams                      → Alle Vereine (Filter: league)
GET    /teams/{id}                 → Vereinsdetails + Statistiken
GET    /teams/{id}/form            → Formkurve letzte N Spiele
GET    /teams/{id}/squad           → Aktueller Kader
```

### Spieler
```
GET    /players/{id}               → Spielerprofil
GET    /players/{id}/stats         → Saisonstatistiken
GET    /players/{id}/influence     → Einfluss-Score auf Team
```

### Virtuelles Wetten
```
GET    /virtual-bets               → Eigene Wetthistorie
POST   /virtual-bets               → Wette platzieren
GET    /virtual-bets/stats         → ROI, Trefferquote
POST   /virtual-bets/reset         → Bankroll zurücksetzen
GET    /virtual-bets/backtest      → Strategie-Backtest
GET    /virtual-bets/leaderboard   → Anonymes Leaderboard
```

### Quoten
```
GET    /odds/{match_id}            → Quoten aller Bookmaker
GET    /odds/{match_id}/best       → Beste Quote pro Markt
GET    /odds/value-bets            → Value-Bets nach Edge
```

---

## Response-Format

```json
{
  "status": "success",
  "data": {
    "match_id": "uuid",
    "home_win_prob": 0.63,
    "draw_prob": 0.21,
    "away_win_prob": 0.16,
    "confidence": 0.78,
    "score_matrix": { "1:0": 0.14, "2:0": 0.11, "2:1": 0.10 },
    "shap_values": { "xg_advantage": 0.12, "injury_away": -0.08 },
    "value_bets": [{ "market": "1X2", "selection": "home", "edge": 0.07 }]
  },
  "meta": { "model_version": "2.3", "calculated_at": "2026-03-28T10:00:00Z" }
}
```

---

*→ [System](../architecture/SYSTEM.md) · [Weekend Calculator](../features/WEEKEND_CALCULATOR.md)*
