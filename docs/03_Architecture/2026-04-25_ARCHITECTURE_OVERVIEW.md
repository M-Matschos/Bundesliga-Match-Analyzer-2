# 🏗️ System-Architektur

## Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                │
│  Dashboard │ WeekendCalc │ Teams │ Players │ VirtualBetting │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────▼────────────────────────────────────┐
│                  FASTAPI BACKEND (Python)                   │
│  /matches  /weekend  /teams  /players  /predictions  /bets  │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼────────┐
│  PostgreSQL │  │     Redis     │  │  Celery Worker │
│  + TimeDB   │  │  (Cache+Queue)│  │  (Hintergrund) │
└──────┬──────┘  └───────────────┘  └───────┬────────┘
       │                                     │
┌──────▼─────────────────────────────────────▼────────────────┐
│                     ML / KI SCHICHT                         │
│  XGBoost │ Monte Carlo │ Poisson │ Dixon-Coles │ Elo │ SHAP │
└─────────────────────────────────────────────────────────────┘
       │
┌──────▼─────────────────────────────────────────────────────┐
│                    EXTERNE APIS                            │
│  API-Football │ football-data.org │ OddsAPI │ OpenWeather  │
└───────────────────────────────────────────────────────────┘
```

## Datenfluss: Wochenend-Berechnung

```
Nutzer drückt "Berechnen"
        │
        ▼
POST /weekend/calculate
        │
        ├── 1. Holt Spiele des Wochenendes (API-Football)
        │
        ├── 2. Für jedes Spiel:
        │       ├── Feature Engineering (39 Faktoren)
        │       ├── XGBoost Prediction
        │       ├── Monte Carlo Simulation (100k)
        │       ├── Elo-basierte Kalibrierung
        │       └── SHAP Erklärung generieren
        │
        ├── 3. Value Bets identifizieren (OddsAPI)
        │
        ├── 4. Wetter abfragen (OpenWeatherMap)
        │
        └── 5. Ergebnis in Redis cachen → App anzeigen
```

## Datenbank-Schichten

| Schicht | Technologie | Zweck |
|---|---|---|
| Transaktionsdaten | PostgreSQL 16 | User, Bets, Predictions |
| Zeitreihendaten | TimescaleDB | xG-Verläufe, Form-Kurven |
| Cache | Redis 7 | Prognosen, Sessions |
| Objekte | Cloudflare R2 | Logos, Bilder |

## API Rate Limits & Caching

| API | Limit | Cache-Dauer |
|---|---|---|
| API-Football (Free) | 100/Tag | 6 Stunden |
| API-Football (Pro) | 7500/Tag | 1 Stunde |
| football-data.org | 10/Min | 30 Minuten |
| OddsAPI | 500/Mo (Free) | 30 Minuten |
| OpenWeather | 1000/Tag | 3 Stunden |

## Skalierung

- **Stufe 1 (MVP):** Einzelner Server, Railway/Render (~15€/Mo)
- **Stufe 2 (1k User):** Load Balancer + 2 API Server + Read Replica DB (~80€/Mo)
- **Stufe 3 (10k User):** Kubernetes, CDN, dedizierter ML-Server (~300€/Mo)
