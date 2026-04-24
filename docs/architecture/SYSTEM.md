# 🏗️ Systemarchitektur

---

## Komponenten-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                     MATCH ORACLE SYSTEM                     │
├──────────────┬─────────────────────┬────────────────────────┤
│  📱 Mobile   │  🐍 Backend API     │  🤖 ML Service         │
│  React Native│  Python FastAPI     │  XGBoost + Monte Carlo │
│  iOS/Android │  Port 8000          │  Port 8001             │
├──────────────┴─────────────────────┴────────────────────────┤
│                     DATEN-SCHICHT                           │
│  PostgreSQL + TimescaleDB  │  Redis Cache  │  Celery Queue  │
├─────────────────────────────────────────────────────────────┤
│                     EXTERNE APIs                            │
│  API-Football │ football-data.org │ Transfermarkt │ OddsAPI │
│  OpenWeatherMap │ Tipico Affiliate │ Twitter/X     │         │
└─────────────────────────────────────────────────────────────┘
```

---

## Daten-Pipeline

```
Externe APIs
    │
    ▼ (täglich 2 Uhr + live am Spieltag)
ETL-Pipeline (Airflow / Celery)
    ├── Normalisierung
    ├── Feature Engineering (39 Faktoren)
    └── Validierung
    │
    ▼
PostgreSQL + TimescaleDB
    │
    ▼
ML-Service (XGBoost + Monte Carlo)
    │
    ▼
Redis Cache (1h TTL für Prognosen)
    │
    ▼
FastAPI REST API
    │
    ▼
React Native Mobile App
```

---

## Skalierbarkeit

| Ebene | Lösung |
|-------|--------|
| API | FastAPI async + mehrere Worker |
| Datenbank | Connection Pooling (asyncpg) |
| Cache | Redis für alle Prognosen |
| ML | Separate Service, horizontal skalierbar |
| CDN | Cloudflare R2 für Logos & statische Assets |

---

## Deployment

Empfohlen für Start: **Railway.app** (einfach, Auto-Deploy, PostgreSQL inkl.)
Alternative: **Render.com** oder eigener VPS (Hetzner DE, DSGVO-konform)

```
GitHub Push → Railway Auto-Deploy → Healthcheck → Live
```

---

*→ [Tech Stack](TECH_STACK.md) · [Datenbank](DATABASE.md)*
