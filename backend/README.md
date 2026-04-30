# Bundesliga Match Analyzer - Backend

## Phase C: Real-time WebSocket & Event Streaming

FastAPI-basiertes Backend für Echtzeit-Bundesliga-Match-Events via WebSocket.

### 🏗️ Architektur

```
backend/
├── app/
│   ├── core/               # Core-Module (Redis Pub/Sub)
│   ├── models/             # Pydantic Models (Events, Messages)
│   ├── routers/            # API-Router (WebSocket)
│   ├── services/           # Business Logic (Ingestion, Publishing)
│   └── main.py             # FastAPI Application Entry Point
├── tests/
│   ├── unit/               # Unit Tests
│   └── integration/        # Integration Tests
├── requirements.txt        # Python Dependencies
├── Dockerfile             # Docker Container
├── docker-compose.yml     # Docker Compose (mit PostgreSQL, Redis)
└── README.md             # Diese Datei
```

### 📋 Installation

#### 1. Clone und Setup

```bash
# Navigiere zum Backend-Verzeichnis
cd backend

# Erstelle virtuelle Umgebung
python -m venv venv

# Aktiviere virtuelle Umgebung
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Installiere Dependencies
pip install -r requirements.txt
```

#### 2. Environment-Variablen

```bash
# Kopiere .env.example
cp .env.example .env

# Bearbeite .env (füge API-Keys ein)
# REDIS_URL=redis://localhost:6379
# API_FOOTBALL_KEY=your_api_key_here
```

### 🚀 Starten

#### Option 1: Lokal (ohne Docker)

```bash
# Starte Redis (separates Terminal)
redis-server

# Starte PostgreSQL (separates Terminal)
postgres

# Starte Backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Option 2: Mit Docker

```bash
# Baue Images und starte Container
docker-compose up --build

# Oder nur specific services
docker-compose up postgres redis
```

#### Option 3: Mit launch.json (Claude Code)

```bash
# Im Claude Code Terminal:
# Wähle "Backend (FastAPI)" aus launch.json
```

### 🧪 Tests

```bash
# Alle Tests ausführen
pytest

# Nur Unit Tests
pytest tests/unit/

# Nur Integration Tests
pytest tests/integration/

# Mit Coverage Report
pytest --cov=app --cov-report=html

# Spezifische Test-Datei
pytest tests/unit/core/test_redis_pubsub.py -v
```

### 📡 WebSocket API

#### Verbindung herstellen

```javascript
const ws = new WebSocket("ws://localhost:8000/api/v1/ws/match/123");

ws.onopen = (event) => {
    console.log("Connected to match 123");
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("Event:", message);
    // Handle different event types
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

ws.onclose = () => {
    console.log("Disconnected from match");
};
```

#### Message-Format

```json
{
  "message_type": "event",
  "match_id": 123,
  "event": {
    "event_type": "goal",
    "match_id": 123,
    "timestamp": "2024-04-28T20:45:00Z",
    "data": {
      "minute": 45,
      "scorer": "Robert Lewandowski",
      "team_id": 1
    }
  }
}
```

### 🎯 Event-Typen

Alle unterstützten Event-Typen aus `app/models/events.py`:

- **Match Events**: `match_start`, `match_end`, `match_paused`, `match_resumed`
- **Goal Events**: `goal`, `own_goal`, `assist`
- **Card Events**: `yellow_card`, `red_card`
- **Substitution**: `substitution`
- **Possession**: `possession_change`, `possession_update`
- **Statistics**: `statistics_update`
- **Weather**: `weather_update`
- **System**: `connection_established`, `connection_lost`, `data_sync`

### 📊 Endpoints

#### Health Check
```
GET /health
```

#### Status
```
GET /api/v1/status
```

#### WebSocket
```
WS /api/v1/ws/match/{match_id}
```

#### Active Matches
```
GET /api/v1/ws/matches/active
```

#### Match Connections
```
GET /api/v1/ws/matches/{match_id}/connections
```

### 🔧 Komponenten

#### 1. Redis Pub/Sub (`app/core/redis_pubsub.py`)

Verwaltet Redis-Verbindungen und Pub/Sub-Kanäle.

```python
from app.core.redis_pubsub import get_redis_manager

redis_manager = get_redis_manager()
await redis_manager.publish("match:123:events", {
    "event_type": "goal",
    "scorer": "Lewandowski"
})
```

#### 2. Event Models (`app/models/events.py`)

Pydantic-Models für alle Event-Typen.

```python
from app.models.events import GoalEvent, EventType

goal = GoalEvent(
    match_id=123,
    minute=45,
    scorer=Player(...),
    team_id=1
)
```

#### 3. WebSocket Router (`app/routers/websocket.py`)

WebSocket-Endpoint und Connection Manager.

```python
@router.websocket("/match/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: int):
    await connection_manager.connect(websocket, match_id)
    # ... event streaming logic
```

#### 4. Data Ingestion (`app/services/ingestion.py`)

Ruft Live-Daten von API-Football ab und publiziert als Events.

```python
from app.services.ingestion import get_ingestion_service

service = get_ingestion_service()
# Polling läuft im Background
```

### 🐳 Docker

#### Build Custom Image

```bash
docker build -t bundesliga-backend:latest .
```

#### Run Docker Container

```bash
docker run -p 8000:8000 \
  -e REDIS_URL=redis://redis:6379 \
  -e API_FOOTBALL_KEY=your_key \
  bundesliga-backend:latest
```

### 📈 Performance & Monitoring

```bash
# Monitoring aktiver Connections
curl http://localhost:8000/api/v1/status

# Health Check
curl http://localhost:8000/health

# Logs (mit Docker)
docker-compose logs -f backend
```

### 🔐 Sicherheit

- API Football Key sollte in Umgebungsvariablen gespeichert sein
- PostgreSQL-Passwort in Production nicht hardcodieren
- CORS sollte für Production eingeschränkt werden
- WebSocket-Rate-Limiting implementieren (optional)

### 🐛 Troubleshooting

#### Redis Connection Error

```
✗ Redis-Verbindung fehlgeschlagen: Connection refused
```

**Lösung**: Redis starten oder Docker-Container überprüfen.

#### PostgreSQL Connection Error

```
✗ Fehler beim Startup: (psycopg2.OperationalError)
```

**Lösung**: PostgreSQL starten oder Datenbank-Credentials prüfen.

#### WebSocket Timeout

Erhöhe `WS_TIMEOUT` in `.env` (Standard: 300 Sekunden).

### 📚 Weitere Ressourcen

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [WebSocket Protocol](https://en.wikipedia.org/wiki/WebSocket)
- [Redis Pub/Sub](https://redis.io/topics/pubsub)
- [API-Football Documentation](https://api-football.com/)

### 👨‍💻 Contributing

Phase C Milestones:
- DAY 1-2: WebSocket + Redis Integration ✅
- DAY 3: Mobile Hook Integration 🔄
- DAY 4-5: Testing & Optimization 📋
- DAY 6+: Advanced Features 🚀

---

**Bundesliga Match Analyzer - Phase C**
**Version 3.0.0 | Backend Ready** ✅
