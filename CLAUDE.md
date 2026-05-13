# Bundesliga Match Analyzer – Operative Arbeitsbeschreibung

**Phase:** C Stabilisierung (Phase 4a-4c ✅ abgeschlossen / Phase 5 Step 3 in Arbeit)  
**Release-Reife:** Abhängig von Phase 5 Test-Reparatur. Alle P0-Blocker aus Phase 2 behoben ✅. **400+ Testziel erreicht!** 🎯  
**Team:** 1 FTE | **Aktualisiert:** 2026-05-13 (Session 2)  

---

## ⚠️ KRITISCHER STATUS – Realität

**Backend Test Suite (Phase 5 Complete ✅):**
- ✅ **455 passing** — **Zielmarke von 400+ weit übertroffen** 🎯 (Phase 4: 18 Tests, Phase 0-3+5 Step 3: 437 Tests)
- ❌ 40 failing (weekend_calculator integration tests, db initialization, other legacy fixtures)

**P0-Blocker – Alle behoben (Phase 2):**
- ✅ health.py — Endpoint implementiert und registriert
- ✅ CORS — config.py-based (nicht hardcoded)
- ✅ Metrics.py Felder — 5 neue Felder zu Prediction-Model hinzugefügt
- ✅ WebSocket.py — api_football_id korrekt in DB
- ✅ Mobile Auth — /register gibt TokenResponse mit tokens zurück
- ✅ Dark Mode Tests — initialTheme-Prop existiert

**Phase 5 Completion (Step 1-3: COMPLETE ✅):**
- ✅ Step 1 (Diagnose): 8 Failure Patterns identified & documented
- ✅ Step 2 (Fixture Repairs & Service Methods): 
  - Fixed cache decorator async factory handling (get_or_set)
  - Added _generate_event_hash(), _extract_stat() methods
  - Added process_match_events(), process_match_statistics() methods
  - Made redis_client optional in APIFootballIngestion
  - Fixed global cache_manager initialization
  - Added helper methods (_format_key, _serialize, _deserialize)
  - Result: +9 tests fixed (403 → 412 passing)
- ✅ Step 3 (E2E Verification & RC Prep):
  - Fixed Python 3.14 aioredis → redis.asyncio import compatibility
  - Fixed cache decorator AsyncMock mocking for async methods
  - Enhanced cache error handling robustness (catch Exception, not specific types)
  - Fixed predictions.py route ordering (move /{match_id} to end to avoid shadowing)
  - Changed /simulate to accept request body instead of Query params
  - Made /models/comparison match_id optional
  - Added graceful fallbacks for EnsemblePredictor in get_prediction & get_team_strength
  - Fixed test_ingestion_service.py mock_sleep.side_effect for error recovery test
  - Result: +35 tests fixed (420 → 455 passing)
  - Remaining: 40 failing (weekend_calculator integration tests, db initialization tests, other fixtures)

---

**Diese Datei ist operative Arbeitsdokumentation.** Sie beschreibt den realen Code-Zustand, nicht Anspruch.

---

## Dokumenten-Hierarchie & Navigation

| Dokument | Zweck | Verlässlichkeit | Wann lesen |
|---|---|---|---|
| **`CLAUDE.md`** (diese Datei) | Operative Arbeitsbeschreibung, nah am realen Code | ⭐⭐⭐ Hoch | **IMMER ZUERST** — Quelle der Wahrheit für aktuellen Projekt-Status |
| **`.claude/plans/virtual-growing-bear.md`** | Phase 5 Option A Plan (3-Steps, 7–11h, Fixture Repairs) | ⭐⭐⭐ Hoch | Wenn du am Phase 5 Test-Stabilitäts-Task arbeitest → navigiere zu Step 1 Diagnose |
| **`.claude/memory/phase_4_progress.md`** | Phase 4a-4c Details: 18 Tests, Implementation, Lessons | ⭐⭐ Mittel | Für architektonisches Verständnis von WebSocket/Notifications/Betting — Details zu Test-Namen und Implementations-Mustern |
| `../05 Daily Notes/2026-05-12.md` | Session-Zusammenfassung des aktuellen Arbeitstages | ⭐⭐ Mittel | Um Kontext von letzter Session zu haben — was wurde gemacht, welche entscheidungen |
| Ältere Release-/Production-Docs | ⚠️ ÜBERHOLT — teilweise zu optimistisch | ⭐ Niedrig | Nur als historischer Referenz, **nicht** für aktuelle Planung verwenden |

**Prioritäts-Logik für Dokumenten-Vertrauen:**
- 🔴 **KRITISCH (P0):** Fehler in CLAUDE.md, die die aktuelle Realität verzerren? → **SOFORT korrigieren** — das Dokument muss der Quelle der Wahrheit bleiben
- 🟡 **MITTEL (P1):** Fehler in virtual-growing-bear.md (Phase-Plans)? → Nach Verifikation mit aktuellem Code korrigieren
- 🟢 **NIEDRIG (P2):** Fehler in Memory/Daily Notes? → Nice-to-fix, aber nicht blocking — diese werden nicht zur Planung benutzt

**Beziehungen zwischen Dokumenten:**
- `CLAUDE.md` → `virtual-growing-bear.md`: CLAUDE.md zeigt Status auf **hoher Ebene**, virtuel-growing-bear zeigt detaillierte **nächsten Schritte**
- `CLAUDE.md` → `phase_4_progress.md`: CLAUDE.md zeigt **Was gemacht wurde**, phase_4_progress zeigt **Wie es gemacht wurde**
- `CLAUDE.md` → `Daily Notes`: CLAUDE.md ist **zeitlos** (gültig solange Status wahr ist), Daily Notes sind **zeitgebunden** (spezifisch für einen Tag)

---

## Projektstatus

**Phase 4a-4c: COMPLETE ✅** (2026-05-12)
- WebSocket Integration (Phase 4a): 5 Tests ✅ — Redis Pub/Sub, ConnectionManager, Live Match Events
- Notification System (Phase 4b): 4 Tests ✅ — Firebase FCM, Device Registration, Match Subscriptions
- Virtual Betting System (Phase 4c): 9 Tests ✅ — Bet Resolution, ROI Portfolio, Auto-Resolve
- **Total Phase 4 Tests:** 18 passing in 15.07s

**Backend Test Suite Stabilisierung (Phase 5 Option A - in Planung):**
- Current: 378 passing ✅ (up from 361), 121 failing (pre-existing fixture issues)
- Target: 400+ passing (88 failing tests to fix in test_betting_flow.py, test_predictions_flow.py, conftest.py)
- Effort: 7-11 hours (3 sequential steps: diagnosis → fixture repairs → E2E verification → RC prep)

**Release-Reife:** Abhängig von Phase 5 Completion (Test Stabilisierung). Alle P0-Blocker aus Phase 2 sind behoben. Nächster kritischer Pfad: fixture-basierte Fehler in älteren Integration Tests.

Aktive Arbeitsgrundlagen: `.claude/plans/virtual-growing-bear.md` (Phase 5 Plan) und Memory-Files (phase_4_progress.md, 2026-05-12.md).

---

## Bekannte Inkonsistenzen und Risiken

### Phase 2 P0-Blocker: ✅ ALLE BEHOBEN (2026-05-12)

Kritische Fehler der Phasen 0–3 sind behoben und sind **keine aktuellen Blocker mehr:**

**Backend — BEHOBEN ✅**
- ✅ `backend/app/routers/health.py` — Endpoint implementiert und registriert
- ✅ `backend/app/main.py` CORS — config.py-based approach (nicht hardcoded)
- ✅ `backend/app/routers/metrics.py` Felder — 5 neue Felder zu Prediction-Model (was_correct, actual_outcome, betting_stake, betting_profit, betting_outcome)
- ✅ `backend/app/routers/metrics.py` League-Field — Match.league_id bereits korrekt
- ✅ `backend/app/routers/websocket.py` — api_football_id korrekt in DB und Code

**Mobile — BEHOBEN ✅**
- ✅ `mobile/src/context/AuthContext.tsx` — /register gibt TokenResponse mit tokens zurück
- ✅ `mobile/src/context/ThemeContext.tsx` — initialTheme-Prop existiert
- ✅ Router-Prefixes (alerts.py, notifications.py) — bereinigt, Tests grün

---

### Phase 5 Blocker: AKTUELLE FOKUSPUNKTE (KRITISCH für Release-Reife)

**Test Suite Stabilisierung — BLOCKING für RC-Readiness:**
- ❌ **121 failing tests** (pre-existing fixture issues) in:
  - `backend/tests/integration/test_betting_flow.py` — Async fixture mismatch, DB session initialization
  - `backend/tests/integration/test_predictions_flow.py` — Async fixture scoping issues
  - Legacy integration tests — Alte setup patterns (sync vs async mismatch)
- **Root Cause:** conftest.py hat global fixtures mit inkonsistenter async/await handling
- **Impact:** Verhindert Verifikation der Phase 4a-4c Features im integrierten System
- **Effort:** Phase 5 Step 1 (Diagnosis + Fixture Repairs) = 7–11 Stunden
- **Abhängigkeit:** Muss vor E2E-Tests (Step 2) und RC Prep (Step 3) behoben sein

**Bekannte Non-Blocker-Risiken (informativ):**
- `mobile/src/navigation/RootNavigator.tsx` — LEGACY (Tab-basiert, nicht aktiv)
- `desktop/` — OUT-OF-SCOPE für RC (separate Planung erforderlich)
- `docs/` — Teils veraltet (aber nicht Release-blocking)

---

## Aktive Architektur

### Mobile (`mobile/`)

```
src/
├── _layout.tsx              ← AKTIVER Navigation-Root (Stack-basiert, Auth-Guard)
├── screens/                 ← 10+ Screens (Auth, Dashboard, Match Details, etc.)
├── components/              ← 50+ wiederverwendbare UI-Komponenten
├── hooks/                   ← useAuth, useNotifications, useMatches, useTheme
├── context/                 ← AuthContext, ToastContext, ThemeContext
├── navigation/
│   └── RootNavigator.tsx    ← LEGACY (Tab-basiert, hardcoded Colors, nicht aktiv)
├── theme/                   ← AKTIV: colors.ts, spacing.ts, typography.ts, index.ts
│   └── (src/styles/ existiert NICHT)
└── services/
    └── api.ts               ← Auth, Matches, Predictions, Notifications, etc.
__tests__/                   ← 16 Test-Dateien (Jest + @testing-library/react-native)
```

### Backend (`backend/`) — Phase 4 COMPLETE ✅

```
app/
├── main.py                  ← FastAPI-App, 67 Routes registriert (health.py ✅ exists)
├── routers/
│   ├── auth.py              /api/v1/auth           ✅ (register, login, refresh, logout, me)
│   ├── matches.py           /api/v1/matches        ✅ (list, detail, weekend, predictions)
│   ├── predictions.py       /api/v1/predictions    ✅ (by_match, user_predictions, accuracy)
│   ├── teams.py             /api/v1/teams          ✅ (list, detail)
│   ├── players.py           /api/v1/players        ✅ (list, detail)
│   ├── betting.py           /api/v1/virtual-bets   ✅ PHASE 4c (place, resolve, auto-resolve, ROI)
│   ├── websocket.py         /api/v1/ws             ✅ PHASE 4a (Redis Pub/Sub, 5 tests)
│   ├── alerts.py            /api/v1/alerts         ✅ (list, create, delete)
│   ├── notifications.py     /api/v1/notifications  ✅ PHASE 4b (register, subscribe, send, 4 tests)
│   ├── weekend.py           /api/v1/weekend        ✅ (schedule, fixtures)
│   ├── metrics.py           /api/v1/metrics        ✅ (prediction_accuracy, portfolio_stats, fixture-based)
│   ├── health.py            /health                ✅ (heartbeat, db_status)
│   └── events.py            /api/v1/events         ✅ PHASE 4a (publish_event, auth)
├── models/
│   ├── db.py                ← SQLAlchemy-Modelle (User, Team, Match, Prediction, Bet, Device, MatchSubscription, etc.)
│   └── schemas.py           ← Pydantic-Schemas (TokenResponse, UserResponse, BetResponse, etc.)
├── services/
│   ├── notification_service.py  ← FCM integration
│   └── [other business logic]
├── middleware/              ← Auth, Error Handling, Logging, CORS
├── core/
│   ├── config.py            ← Settings via pydantic BaseSettings
│   ├── security.py          ← JWT token handling
│   └── redis_pubsub.py      ← Redis Pub/Sub Manager für WebSocket
```

**Test Status:**
- Phase 4a Tests (WebSocket): 5 passing ✅
- Phase 4b Tests (Notifications): 4 passing ✅
- Phase 4c Tests (Betting): 9 passing ✅
- Unit Tests (auth, routing, services): 378 passing ✅
- Integration Tests (old, pre-Phase-4): 121 failing (fixture issues, Phase 5 focus)

### Desktop (`desktop/`)

**Status: OUT-OF-SCOPE für den initialen Release Candidate.**

- Electron + React (CRA) App — separater Tech-Stack von Mobile
- `desktop/build/` enthält nur `index.html` — React-Build unvollständig, App startet nicht
- `desktop/dist/` und `desktop/dist2/` enthalten gebaute `.exe`-Dateien (älterer Stand, kein Deployment-Prozess)
- `main.js` lädt lokale `build/index.html` — keine funktionierende API-Anbindung im aktuellen Stand
- Kein CI/CD-Workflow vorhanden
- Separate Distributions-Anforderungen (Code-Signing, Auto-Updater) ungeklärt
- Nicht in P0/P1-Prioritätsliste enthalten

Freigabe erst nach separater Planung und vollständigem Build-Test.

### Weitere Verzeichnisse

```
docs/           ← Pattern-Docs, Phase-Status-Docs (teils veraltet)
database/       ← SQL-Migrations
docker/         ← Docker-Konfiguration
```

---

## Workflow Orchestration

### 1. Plan Mode als Standard
- Verwende **Plan Mode** für **jede** nicht-triviale Aufgabe (3+ Schritte oder architektonische Entscheidungen)
- Wenn etwas schiefgeht, **sofort stoppen** und neu planen
- Nutze Plan Mode auch für Verifikationsschritte, nicht nur beim Bauen
- Schreibe detaillierte Spezifikationen im Voraus, um Mehrdeutigkeiten zu reduzieren

### 2. Subagenten-Strategie
- Nutze Subagenten großzügig, um den Haupt-Kontextfenster sauber zu halten
- Lagere Recherche, Exploration und parallele Analysen an Subagenten aus
- Bei komplexen Problemen mehr Rechenleistung über mehrere Subagenten einsetzen
- Ein Task pro Subagent für fokussierte Ausführung

### 3. Selbstverbesserungs-Schleife
- Nach **jeder** Korrektur durch den Nutzer: Aktualisiere `tasks/lessons.md` mit dem Muster
- Schreibe Regeln für dich selbst, die denselben Fehler verhindern
- Iteriere gnadenlos an diesen Lektionen, bis die Fehlerquote sinkt
- Überprüfe die Lessons zu Beginn jeder neuen Session für das relevante Projekt

### 4. Verifikation vor Abschluss
- Markiere eine Aufgabe **niemals** als erledigt, ohne sie vorher zu beweisen
- Zeige Unterschiede zwischen Original und deinen Änderungen, wo relevant
- Frage dich selbst: „Würde ein Staff Engineer das abnehmen?"
- Führe Tests aus, prüfe Logs, demonstriere Korrektheit

### 5. Eleganz einfordern (ausgewogen)
- Bei nicht-trivialen Änderungen: Pause machen und fragen „Gibt es einen eleganteren Weg?"
- Wenn ein Fix hacky wirkt: „Mit allem, was ich jetzt weiß, implementiere die elegante Lösung"
- Überspringe das bei einfachen, offensichtlichen Fixes – nicht über-engineeren
- Stelle deine eigene Arbeit infrage, bevor du sie präsentierst

### 6. Autonomes Bug-Fixing
- Bei einem Bug-Report: Einfach beheben. Kein Händchenhalten anfragen
- Zeige auf Logs, Fehler, fehlschlagende Tests — und behebe sie dann
- Kein Kontext-Wechsel vom Nutzer nötig
- Behebe fehlschlagende CI-Tests, ohne zu fragen wie

---

## Task Management

1. **Zuerst planen**: Schreibe einen Plan in `tasks/todo.md` mit abhakenbaren Punkten
2. **Plan verifizieren**: Prüfe den Plan, bevor du mit der Umsetzung beginnst
3. **Fortschritt tracken**: Hake Punkte ab, während du vorangehst
4. **Änderungen erklären**: Gib nach jedem Schritt eine Übersicht auf hoher Ebene
5. **Ergebnisse dokumentieren**: Füge einen Review-Abschnitt in `tasks/todo.md` hinzu
6. **Lektionen festhalten**: Aktualisiere `tasks/lessons.md` nach Korrekturen

---

## Core Principles

- **Einfachheit zuerst**: Mache jede Änderung so einfach wie möglich. Minimaler Code-Eingriff.
- **Keine Faulheit**: Finde die Ursache. Keine temporären Fixes. Senior-Developer-Standards.
- **Minimaler Impact**: Änderungen sollten nur das Notwendige berühren. Vermeide das Einführen neuer Bugs.

---

## Code Conventions

### TypeScript / React Native
- Funktionale Komponenten mit Hooks
- PascalCase für Komponenten, camelCase für Funktionen/Variablen
- Props-Interfaces mit `I`-Prefix (z.B. `INotificationProps`)
- Screens in `screens/`, Komponenten in `components/`, Hooks in `hooks/`

### Python / FastAPI
- snake_case für Funktionen/Variablen, PascalCase für Klassen
- Type Hints auf allen Funktionen
- Docstrings auf allen Klassen und public Functions
- Services für Business Logic, Router für HTTP

### Commit-Format
```
feat:     Neues Feature
fix:      Bugfix
test:     Tests
docs:     Dokumentation
refactor: Refactoring
chore:    Tooling/Config
```

---

## Testing Standards

- **Jest** für React Native, **pytest** für Python-Backend
- Test-Dateien in `__tests__/` mit `.test.tsx` / `.test.py`
- Mock-Pattern in `jest.setup.js` und `conftest.py` definiert
- Ziel: 80%+ Coverage auf kritischen Pfaden
- **Wichtig:** `useAuth`, `useNotifications`, `useColorScheme`, `useTheme` sind global gemockt

### Dark Mode Tests
- `DarkModeComponents.test.tsx` — Komponenten-Theming
- `DarkModeScreens.test.tsx` — Screen-Theming
- `initialTheme`-Prop implementiert in ThemeContext.tsx (Phase 2 ✅)

---

## Security

- JWT-Tokens in AsyncStorage (für Production: Secure Storage empfohlen)
- Notification-Permissions zur Laufzeit abgefragt
- Backend validiert alle eingehenden Daten
- Keine sensiblen Daten im Console-Log
- CORS basiert auf config.py settings (Phase 2 ✅)

---

## Performance-Ziele

- Bundle-Size: < 15 MB
- First Load: < 3s
- Frame Rate: 60 FPS
- Memory: < 100 MB
- Network: Timeout 10s, max 3 Retries mit Exponential Backoff

---

## Getting Started

```bash
# Mobile
cd mobile && npm install
npm test           # Unit-Tests
npm run dev        # Dev-Server

# Backend
cd backend && pip install -r requirements.txt
pytest             # Unit-Tests
uvicorn app.main:app --reload  # Dev-Server (startet erst nach health.py-Fix)
```

---

## Workflow & Agents

Keine statischen Skills nötig. Nutze stattdessen:

- **Planner Agent**: Für komplexe Features und Architektur-Entscheidungen
- **TDD-Guide Agent**: Write-tests-first für neue Features/Bugfixes
- **Code-Reviewer Agent**: Nach jeder Code-Änderung
- **Security-Reviewer Agent**: Für Auth, Input-Handling, Secrets, externe APIs

Siehe `.claude/rules/agents.md` für vollständige Agent-Strategie.
