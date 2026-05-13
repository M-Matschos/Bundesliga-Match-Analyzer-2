---
tags: [projekt, release-planning, bundesliga, p0-p1-priorität]
status: aktiv
date: 2026-05-11
---

# Gesamtplan: Release-Stabilisierung Bundesliga Match Analyzer

**Erstellt:** 2026-05-11  
**Basis:** Aufgabenliste (11.05.2026).md + Release-Checkliste (10.05.2026).md + CLAUDE.md + reale Code-Inspektion  
**Sprint-Ziel:** Belastbarer Release Candidate — kein Feature-Work, nur Stabilisierung

---

## Kontext

Der Codezustand weicht erheblich von der Dokumentation ab. Die Release-Dokumente behaupten Produktionsreife, die der Code nicht trägt. Drei konkrete Blocker wurden durch Code-Inspektion bestätigt:

1. **Backend startet nicht**: `health.py` fehlt, aber wird in `main.py` importiert
2. **Auth-Vertrag gebrochen**: `AuthContext.register()` erwartet Tokens, `/register` gibt nur User-Daten zurück
3. **Tests strukturell kaputt**: `ThemeProvider` hat keinen `initialTheme`-Prop, aber alle Dark-Mode-Tests nutzen ihn

Zusätzlich: CORS ist Wildcard (`["*"]`), 6+ Felder in `metrics.py` referenzieren nicht existierende DB-Spalten, `websocket.py` fragt `external_id` ab statt `api_football_id`, und es gibt zwei konkurrierende Navigationsstrukturen.

---

## Teil 1: CLAUDE.md Überarbeitung

### Was zu tun ist

Basierend auf dem Codex-Vorschlag (`Plan zur Überarbeitung der CLAUDE.md .md`) wird die projektspezifische CLAUDE.md umgeschrieben. Sie soll operatives Arbeitsdokument werden, keine Projektbroschüre.

**Datei:** `CLAUDE.md` (Projektroot)

### Struktur der neuen CLAUDE.md

1. **Projektstatus** (neu, ehrlich)
   - Phase C / Stabilisierung
   - Kein production-ready Stand
   - Verweis auf Release-Checkliste und Aufgabenliste als autoritative Quellen

2. **Aktive Architektur** (überarbeitet)
   - `src/styles/` → korrigieren zu `src/theme/` (styles/ existiert nicht)
   - Navigation: `_layout.tsx` = aktiv, `RootNavigator.tsx` = legacy/unused
   - Backend-Router: alle 11 vorhandenen (health.py fehlt aktuell)

3. **Bekannte Inkonsistenzen** (neu, prominent)
   - health.py fehlt → Backend startet nicht
   - CORS Wildcard in main.py (überschreibt config.py)
   - metrics.py: 6 nicht existierende Prediction-Felder
   - websocket.py: `external_id` statt `api_football_id`
   - AuthContext.register() erwartet Tokens, API gibt User zurück
   - ThemeProvider hat keinen initialTheme-Prop (Tests nutzen ihn fälschlich)
   - _layout.tsx und RootNavigator.tsx konkurrieren

4. **Entwicklungsregeln** (beibehalten + schärfen)
   - Architekturänderungen immer mit CLAUDE.md abgleichen
   - Release-Aussagen nur nach Code-Verifikation

5. **Dokumenten-Hierarchie** (neu)
   - CLAUDE.md: operative Arbeitsbeschreibung (nah am Code)
   - Release-Checkliste: Prioritäten und Abnahmekriterien
   - Aufgabenliste: konkrete Abarbeitungsreihenfolge
   - Ältere "Production Ready"-Docs: mit Vorsicht lesen

6. **Skills/Agents** (stark gekürzt)
   - Nur operative Befehle, keine Marketingtexte

### Neuer Pflichtabschnitt: Workflow Orchestration

Folgender Abschnitt wird vollständig in die neue CLAUDE.md aufgenommen (zwischen "Bekannte Inkonsistenzen" und "Entwicklungsregeln"):

```markdown
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

## Task Management

1. **Zuerst planen**: Schreibe einen Plan in `tasks/todo.md` mit abhakenbaren Punkten
2. **Plan verifizieren**: Prüfe den Plan, bevor du mit der Umsetzung beginnst
3. **Fortschritt tracken**: Hake Punkte ab, während du vorangehst
4. **Änderungen erklären**: Gib nach jedem Schritt eine Übersicht auf hoher Ebene
5. **Ergebnisse dokumentieren**: Füge einen Review-Abschnitt in `tasks/todo.md` hinzu
6. **Lektionen festhalten**: Aktualisiere `tasks/lessons.md` nach Korrekturen

## Core Principles

- **Einfachheit zuerst**: Mache jede Änderung so einfach wie möglich. Minimaler Code-Eingriff.
- **Keine Faulheit**: Finde die Ursache. Keine temporären Fixes. Senior-Developer-Standards.
- **Minimaler Impact**: Änderungen sollten nur das Notwendige berühren. Vermeide das Einführen neuer Bugs.
```

---

### Was korrekt bleibt (nur leicht überarbeiten)
- Grundarchitektur-Übersicht (mobile/, backend/, desktop/, docs/)
- Code Conventions (TypeScript und Python)
- Testing Standards
- Security-Hinweise (AsyncStorage-Warnung beibehalten)
- Getting Started

### Was entfernt/entschärft wird
- "Phase A ✅ COMPLETE", "Phase B ✅ COMPLETE" — zu euphorisch
- ".claude/ Directory Structure" — zu detailliert, veraltet
- Große Skills-Tabellen mit "PRIORITY 1: Sofort Einsatzbereit"
- Alle Formulierungen mit implizierter Produktionsreife

---

## Teil 2: P0-Blocker — Reihenfolge und Umsetzung

### P0.1 Backend-Startfähigkeit (Tag 1)

**Problem:** `main.py:11` importiert `health`, `backend/app/routers/health.py` fehlt.

**Lösung:** Health-Router neu anlegen mit minimalem Endpoint.

**Datei neu erstellen:** `backend/app/routers/health.py`
```python
from fastapi import APIRouter
router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok"}
```

**In main.py prüfen:** Router-Registrierung für health ohne Prefix (aktuell so konfiguriert — korrekt lassen).

**Verifikation:** `uvicorn app.main:app --reload` muss ohne ImportError starten. `GET /health` → 200.

---

### P0.2 CORS-Konfiguration (Tag 1, parallel zu P0.1)

**Problem:** `main.py` Lines 24–29 setzen `allow_origins=["*"]` hardcoded, überschreibt config.py.

**Datei:** `backend/app/main.py`

**Änderung:** CORS-Middleware auf `settings.CORS_ORIGINS` umstellen. config.py hat bereits `CORS_ORIGINS` konfiguriert mit sinnvollen Defaults.

**Verifikation:** CORS-Header in Response enthält nur erlaubte Origins, kein `*` in Production.

---

### P0.3 Backend Modell-/Router-Mismatches (Tag 1–2)

**Dateien:** `backend/app/routers/metrics.py`, `backend/app/routers/websocket.py`, `backend/app/models/db.py`

**metrics.py → db.py Abweichungen:**
| Router-Feld | Echtes DB-Feld | Aktion |
|---|---|---| 
| `predicted_home_prob` | `home_win_prob` | Umbenennen in Query |
| `was_correct` | existiert nicht | Feld in Prediction hinzufügen ODER Feature deaktivieren |
| `actual_outcome` | existiert nicht | s.o. |
| `betting_profit` | existiert nicht | s.o. |
| `betting_stake` | existiert nicht | s.o. |
| `Match.league` | `Match.league_id` | Umbenennen in Query |

**websocket.py → db.py Abweichungen:**
| Router-Feld | Echtes DB-Feld | Aktion |
|---|---|---|
| `external_id` | `api_football_id` | Umbenennen in Query |

**Entscheidung nötig:** Fehlende Felder (`was_correct`, `actual_outcome`, `betting_profit`, `betting_stake`) entweder als Migration zu db.py hinzufügen oder die Endpunkte vorerst als Stub deaktivieren.

**Empfehlung für schnellen Fix:** Stubs deaktivieren (HTTP 501 Not Implemented) bis Migration geplant ist.

---

### P0.4 Mobile Auth-Flow korrigieren (Tag 3)

**Problem:** Mismatch zwischen drei Schichten:
- `authService.register()` in `api.ts` → gibt `User` zurück (korrekt, Backend liefert User)  
- `AuthContext.register()` in `AuthContext.tsx` → erwartet `{ access_token, refresh_token }` aus register-Response → **kaputt**

**Dateien:**
- `mobile/src/context/AuthContext.tsx` (Lines 73–90)
- `mobile/src/services/api.ts` (Lines 387–461)

**Lösung — Option A (empfohlen):** Nach erfolgreichem Register automatisch `authService.login()` aufrufen.

```typescript
// AuthContext.tsx register()
const register = async (email: string, password: string, username?: string) => {
  await authService.register(email, password, username); // returns User
  const loginResult = await authService.login(email, password); // returns tokens
  // store tokens, fetch profile...
}
```

**Verifikation:** Register → automatischer Login → Token in AsyncStorage → isAuthenticated = true.

---

### P0.5 ThemeProvider / Dark-Mode-Tests synchronisieren (Tag 3–4)

**Problem:** `ThemeContext.tsx` hat keinen `initialTheme`-Prop. Tests in `DarkModeComponents.test.tsx` und `DarkModeScreens.test.tsx` nutzen `<ThemeProvider initialTheme="dark">`.

**Dateien:**
- `mobile/src/context/ThemeContext.tsx`
- `mobile/src/__tests__/components/DarkModeComponents.test.tsx`
- `mobile/src/__tests__/screens/DarkModeScreens.test.tsx`

**Lösung — Option A (empfohlen):** `initialTheme`-Prop zu ThemeProvider hinzufügen.

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}
```

Wenn `initialTheme` gesetzt → skip AsyncStorage-Load und System-Preference, direkt mit übergebenem Theme initialisieren.

**Verifikation:** Dark-Mode-Tests laufen grün ohne `TypeError: ... is not a valid prop`.

---

### P0.6 Navigation vereinheitlichen (Tag 3–4)

**Problem:** Zwei konkurrierende Navigatoren.
- `mobile/src/_layout.tsx` → aktiv, wird vom App-Einstieg genutzt
- `mobile/src/navigation/RootNavigator.tsx` → legacy, unused, hat hardcoded Colors und Tab-Struktur

**Aktion:**
1. `RootNavigator.tsx` als `// @deprecated` markieren oder löschen
2. Alle Imports, die auf `RootNavigator` zeigen, prüfen und auf `_layout.tsx` ausrichten
3. Test-Mocks für Navigation auf `_layout.tsx`-Struktur anpassen

**Verifikation:** Nur ein aktiver Navigation-Root. Keine doppelten Screen-Registrierungen.

---

### P0.7 Test- und Build-Baseline (Tag 5)

**Aktion:**
```bash
cd mobile && npm test -- --passWithNoTests 2>&1 | tee test-baseline.log
cd ../backend && pytest --tb=short 2>&1 | tee pytest-baseline.log
```

Ergebnis dokumentieren:
- Grüne Tests: Liste
- Rote Tests: nach Kategorie gruppieren (echter Defekt / Mock-Problem / Altlast)
- Flaky Tests: separat markieren

**Verifikation:** Dokumentierter aktueller Qualitätsstatus vorhanden.

---

## Teil 3: P1-Themen für Release-Fähigkeit (Tag 6–8)

### P1.1 API-Verträge bereinigen
Für jeden genutzten Endpoint: Request/Response zwischen Mobile und Backend abgleichen.
Bereiche: auth, predictions, metrics, notifications, weekend, teams, players, virtual-bets.

### P1.2 Security/CORS abschließen
Nach P0.2: Verifizieren dass Production-CORS-Config korrekt gesetzt ist.
JWT-Secret, Debug-Flags, Env-Variablen-Namen angleichen.

### P1.3 Health/Monitoring
Nach P0.1: Health-Endpoint erweitern (DB-Check, Redis-Check).
Sentry-DSN real verdrahten falls Produktionseinsatz geplant.

### P1.4 Staging-Smoke-Tests
Nach P0.1–P0.7: Alle 9 Kernflows manuell oder automatisiert testen:
App-Start → Register → Login → Token-Refresh → Match-Liste → Prediction → Weekend Calculator → Notification-History → Logout.

### P1.5 Notification-Flow
Device-Registration, Permission-Handling, Fehler ohne Firebase-Token validieren.

### P1.6 Desktop-Scope klären
Entscheiden: im Release-Scope oder explizit out-of-scope dokumentieren.

### P1.7 CI/CD validieren
`.github/workflows/` gegen aktuelle Pfade und Commands prüfen.

---

## Teil 4: P2-Härtung (nach P1)

15. Dead Code: `RootNavigator.tsx` entfernen, Platzhalter-Screens bereinigen
16. Test-Architektur: übermockte Tests identifizieren, realitätsnähere Integrationstests ergänzen
17. Performance: API-Latenzen, App-Start, FPS messen
18. Release-Dokumentation: "production ready"-Aussagen korrigieren
19. App-Store: Privacy Policy, Berechtigungstexte, Store Assets

---

## Empfohlene Umsetzungsreihenfolge

| Tag | Aufgaben |
|---|---|
| 1 | P0.1 health.py erstellen, P0.2 CORS fixen |
| 1–2 | P0.3 metrics.py + websocket.py Mismatches |
| 3 | P0.4 Auth-Flow fixen |
| 3–4 | P0.5 ThemeProvider initialTheme, P0.6 Navigation |
| 5 | P0.7 Test-Baseline dokumentieren |
| 6–7 | P1.1 API-Verträge, P1.2 Security |
| 7–8 | P1.3 Health/Monitoring, P1.4 Smoke-Tests |
| 8 | P1.5 Notifications, P1.6 Desktop-Scope, P1.7 CI/CD |
| 9–10 | P2 Härtungswelle |

---

## Abhängigkeiten

```
P0.1 (health.py) → P0.7 (Test-Baseline) → P1.4 (Smoke-Tests)
P0.2 (CORS) → P1.2 (Security final)
P0.3 (DB-Mismatches) → P1.1 (API-Verträge)
P0.4 (Auth-Flow) → P1.4 (Smoke-Tests)
P0.5 (ThemeProvider) → P0.7 (Test-Baseline)
P0.6 (Navigation) → P0.7 (Test-Baseline)
CLAUDE.md Update → parallel zu allem, aber vor P1.1
```

---

## Kritische Dateien

| Datei | Aufgabe |
|---|---|
| `backend/app/routers/health.py` | NEU ERSTELLEN (P0.1) |
| `backend/app/main.py` | CORS fixen (P0.2) |
| `backend/app/routers/metrics.py` | Feldnamen korrigieren (P0.3) |
| `backend/app/routers/websocket.py` | `external_id` → `api_football_id` (P0.3) |
| `backend/app/models/db.py` | Fehlende Felder ggf. ergänzen (P0.3) |
| `mobile/src/context/AuthContext.tsx` | Register-Logik fixen (P0.4) |
| `mobile/src/context/ThemeContext.tsx` | initialTheme-Prop hinzufügen (P0.5) |
| `mobile/src/navigation/RootNavigator.tsx` | Legacy markieren/entfernen (P0.6) |
| `CLAUDE.md` | Vollständig überarbeiten (Teil 1) |

---

## Definition of Done

Release Candidate erst freigeben wenn:
- [ ] Backend startet ohne Fehler
- [ ] CORS nicht Wildcard
- [ ] Kein Router referenziert nicht existierende DB-Felder
- [ ] Register → Login → Token → isAuthenticated funktioniert
- [ ] ThemeProvider und Dark-Mode-Tests sprechen dieselbe API
- [ ] Genau ein aktiver Navigation-Root
- [ ] Test-Baseline dokumentiert
- [ ] Staging-Kernflows alle grün
- [ ] CLAUDE.md entspricht realem Code-Zustand