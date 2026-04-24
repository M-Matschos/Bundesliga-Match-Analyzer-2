# 🛠️ Setup & Installation

## Voraussetzungen

| Tool | Version | Download |
|---|---|---|
| Python | ≥ 3.11 | python.org |
| Node.js | ≥ 20 LTS | nodejs.org |
| PostgreSQL | ≥ 16 | postgresql.org |
| Redis | ≥ 7 | redis.io |
| Expo CLI | Latest | `npm i -g expo-cli` |

---

## 1. Backend Setup

### 1.1 Virtuelle Umgebung

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

### 1.2 Umgebungsvariablen

```bash
cp .env.example .env
```

Folgende Werte in `.env` eintragen:

```env
# Datenbank
DATABASE_URL=postgresql://user:password@localhost:5432/matchoracle
REDIS_URL=redis://localhost:6379

# API Keys
API_FOOTBALL_KEY=dein_key_hier
FOOTBALL_DATA_KEY=dein_key_hier
OPENWEATHER_KEY=dein_key_hier
ODDS_API_KEY=dein_key_hier

# Auth
JWT_SECRET=zufaelliger_langer_string_hier
JWT_EXPIRE_MINUTES=10080

# Tipico Affiliate
TIPICO_AFFILIATE_ID=dein_affiliate_id

# App Settings
DEBUG=True
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 1.3 Datenbank einrichten

```bash
# PostgreSQL Datenbank erstellen
createdb matchoracle

# TimescaleDB Extension aktivieren (falls installiert)
psql matchoracle -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# Schema ausführen
psql matchoracle < database/schema.sql

# Historische Daten laden (10 Jahre Bundesliga)
python scripts/seed_database.py --leagues bundesliga,bundesliga2 --years 10

# Premier League Daten laden
python scripts/seed_database.py --leagues premier-league,championship --years 5
```

### 1.4 Backend starten

```bash
# Entwicklung
uvicorn app.main:app --reload --port 8000

# Produktion
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

API läuft auf: http://localhost:8000
Swagger Doku: http://localhost:8000/docs

---

## 2. Mobile App Setup

### 2.1 Dependencies installieren

```bash
cd mobile
npm install
```

### 2.2 API-URL konfigurieren

In `mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'       // Entwicklung
  : 'https://api.matchoracle.app' // Produktion
```

### 2.3 App starten

```bash
# Expo Go (einfachste Methode zum Testen)
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android
```

---

## 3. Docker Setup (Empfohlen für Produktion)

```bash
# Alle Services starten
docker-compose up -d

# Logs anschauen
docker-compose logs -f api

# Datenbank-Seed in Docker
docker-compose exec api python scripts/seed_database.py
```

Services nach Start:
- API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Adminer (DB-UI): http://localhost:8080

---

## 4. Celery Worker (für Hintergrundaufgaben)

```bash
# Worker starten (separates Terminal)
cd backend
celery -A app.core.celery_app worker --loglevel=info

# Beat Scheduler (für automatische Daten-Updates)
celery -A app.core.celery_app beat --loglevel=info
```

---

## 5. Erste Schritte nach Installation

```bash
# 1. Aktuelle Spieltag-Daten holen
python scripts/fetch_current_matchday.py

# 2. Prognosen für dieses Wochenende berechnen
python scripts/calculate_weekend.py

# 3. ML-Modell trainieren (braucht Historik-Daten!)
python backend/ml/training/train.py

# 4. API testen
curl http://localhost:8000/api/v1/weekend/calculate
```

---

## 6. Häufige Probleme

### "Database connection refused"
```bash
# Prüfen ob PostgreSQL läuft
pg_ctl status
# oder
sudo service postgresql start
```

### "Redis connection error"
```bash
redis-server &
```

### "API-Football rate limit"
→ Free-Tier: 100 Requests/Tag. Für Entwicklung reicht das.
→ Daten cachen! Prognosen nicht bei jedem Request neu berechnen.

### Expo "Network request failed"
→ API_BASE_URL auf die lokale IP stellen (nicht localhost):
```typescript
const API_BASE_URL = 'http://192.168.1.XXX:8000'  // Deine lokale IP
```
