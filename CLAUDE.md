# Bundesliga Match Analyzer

**Status:** Phase C / Stabilisierung — kein production-ready Stand  
**Team:** 1 FTE  
**Zuletzt aktualisiert:** 2026-05-11

> Diese Datei ist das operative Arbeitsdokument für Coding-Assistenten.  
> Sie beschreibt den **realen** Code-Zustand, nicht den angestrebten.

---

## Dokumenten-Hierarchie

| Dokument | Zweck | Verlässlichkeit |
|---|---|---|
| `CLAUDE.md` (diese Datei) | Operative Arbeitsbeschreibung, nah am Code | Hoch |
| `Release-Checkliste (10.05.2026).md` | Release-Prioritäten und Abnahmekriterien | Hoch |
| `Aufgabenliste (11.05.2026).md` | Konkrete Abarbeitungsreihenfolge | Hoch |
| Ältere "Production Ready"-Docs | Frühere Einschätzungen, teils zu optimistisch | Mit Vorsicht lesen |

---

## Projektstatus

Das Projekt befindet sich in **Phase C / Stabilisierung**. Es existiert funktionale Code-Masse für Mobile, Backend und Desktop, aber mehrere harte technische Inkonsistenzen verhindern einen belastbaren Release.

**Release-Reife:** Noch nicht gegeben. Erst nach Abarbeitung der P0-Blocker sinnvoll zu bewerten.

Aktive Arbeitsgrundlagen: `Release-Checkliste (10.05.2026).md` und `Aufgabenliste (11.05.2026).md`.

---

## Bekannte Inkonsistenzen und Risiken

Diese Punkte sind **vor jedem Feature-Work** zu beseitigen:

### Backend
- `backend/app/routers/health.py` **fehlt** → `main.py` importiert es → Backend startet nicht
- `backend/app/main.py` setzt CORS auf `["*"]` (hardcoded, überschreibt config.py) → unsicher für Production
- `backend/app/routers/metrics.py` referenziert 6 nicht existierende Prediction-Felder: `predicted_home_prob`, `was_correct`, `actual_outcome`, `betting_profit`, `betting_stake`, `betting_outcome`
- `backend/app/routers/metrics.py` nutzt `Match.league` statt `Match.league_id`
- `backend/app/routers/websocket.py` fragt `external_id` ab, DB-Feld heißt `api_football_id`

### Mobile
- `mobile/src/context/AuthContext.tsx` → `register()` erwartet `{ access_token, refresh_token }` aus der Register-Response, aber `authService.register()` gibt nur User-Daten zurück → Auth-Flow kaputt
- `mobile/src/context/ThemeContext.tsx` → `ThemeProvider` hat keinen `initialTheme`-Prop, aber Dark-Mode-Tests nutzen ihn → Tests strukturell kaputt
- `mobile/src/navigation/RootNavigator.tsx` existiert parallel zu `mobile/src/_layout.tsx` → `_layout.tsx` ist aktiv, `RootNavigator.tsx` ist legacy/unused

### Dokumentation
- `src/styles/` existiert **nicht** — aktiver Token-Ort ist `src/theme/`
- Frühere Phase-Dokumente mit "production ready"-Aussagen bilden den realen Code-Zustand nicht ab

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

### Backend (`backend/`)

```
app/
├── main.py                  ← FastAPI-App, 11 Router registriert (health.py FEHLT aktuell)
├── routers/
│   ├── auth.py              /api/v1/auth
│   ├── matches.py           /api/v1/matches
│   ├── predictions.py       /api/v1/predictions
│   ├── teams.py             /api/v1/teams
│   ├── players.py           /api/v1/players
│   ├── betting.py           /api/v1/virtual-bets
│   ├── websocket.py         /api/v1/ws   ← Modell-Mismatch (external_id)
│   ├── alerts.py            /api/v1/alerts
│   ├── notifications.py     /api/v1/notifications
│   ├── weekend.py           /api/v1/weekend
│   ├── metrics.py           /api/v1/metrics  ← 6 fehlende DB-Felder
│   └── health.py            /health  ← FEHLT, muss erstellt werden
├── models/
│   ├── db.py                ← SQLAlchemy-Modelle (User, Team, Match, Prediction, Bet)
│   └── schemas.py           ← Pydantic-Schemas
├── services/                ← Business Logic
├── middleware/              ← Auth, Error Handling, Logging
└── core/
    └── config.py            ← Settings via pydantic BaseSettings
```

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
- **Achtung:** Tests nutzen `initialTheme`-Prop, der aktuell in ThemeProvider fehlt → P0-Blocker

---

## Security

- JWT-Tokens in AsyncStorage (für Production: Secure Storage empfohlen)
- Notification-Permissions zur Laufzeit abgefragt
- Backend validiert alle eingehenden Daten
- Keine sensiblen Daten im Console-Log
- CORS aktuell Wildcard → muss vor Release eingeschränkt werden (P0-Blocker)

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

## Aktive Skills (operativ)

```bash
/sports-analytics                    # Match-Vorhersage
/generate-tests --dark-mode          # Dark-Mode-Tests generieren
/security-audit --strict             # OWASP-Scan vor Release
/deployment-check --release          # Pre-Release-Checkliste
```
