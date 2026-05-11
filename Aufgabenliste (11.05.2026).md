# Aufgabenliste

**Projekt:** Bundesliga Match Analyzer  
**Datum:** 2026-05-11  
**Ziel:** Konkrete Arbeitsreihenfolge zur technischen Release-Stabilisierung

## Verbindlicher Arbeitsablauf

Die folgende Reihenfolge ist verbindlich einzuhalten, bevor mit der eigentlichen technischen Umsetzung begonnen wird.

### Schritt 0: Dokumente vollständig lesen

Bevor technische Änderungen geplant oder umgesetzt werden, müssen diese Dokumente vollständig gelesen und inhaltlich abgeglichen werden:

1. diese Datei: `Aufgabenliste (11.05.2026).md`
2. danach die projektspezifische `CLAUDE.md`
3. danach die `Release-Checkliste (10.05.2026).md`

**Pfad der projektspezifischen `CLAUDE.md`:**
- `C:\Users\DEFCON1\Desktop\Cloud Cowork Ordner\Projekte\Bundesliga Match Analyzer\Bundesliga Match Analyzer\CLAUDE.md`

**Ziel dieses Schritts:**
- vollständiges gemeinsames Lagebild herstellen
- Widersprüche zwischen Dokumentation und Code erkennen
- Prioritäten vor jeder Änderung absichern

### Schritt 1: Plan für `CLAUDE.md` erstellen

Nachdem alle drei Dokumente gelesen wurden, wird ein eigener Plan erstellt, wie die aktuelle `CLAUDE.md`:

- an den aktuellen Stand angepasst wird
- inhaltlich korrigiert wird
- strukturell verbessert wird
- und falls nötig teilweise oder vollständig umgeschrieben wird

**Der Plan für `CLAUDE.md` muss mindestens enthalten:**
- welche Aussagen korrekt sind
- welche Aussagen veraltet sind
- welche Aussagen dem aktuellen Code widersprechen
- welche Kapitel ergänzt, entfernt oder umgebaut werden sollen
- in welcher Reihenfolge die Überarbeitung sinnvoll ist

**Wichtiger zusätzlicher Hinweis:**  
Bevor die Planung der neuen `CLAUDE.md` beginnt, ist zuerst das Dokument `Plan zur Überarbeitung der CLAUDE.md .md` vollständig zu lesen. Dieses Dokument ist ein **von Codex erstellter Vorschlag** und dient als vorbereitende Arbeitsgrundlage für die Anpassung und/oder Umschreibung der projektspezifischen `CLAUDE.md`.

### Schritt 2: Gesamtplan erweitern

Anschließend wird der Plan erweitert, sodass zusätzlich alle Punkte aus der `Aufgabenliste (11.05.2026).md` samt Umsetzung geplant werden.

Dieser erweiterte Gesamtplan soll enthalten:

- die Überarbeitung der `CLAUDE.md`
- die Abarbeitung der Release-Checkliste
- die technische Umsetzung aller Punkte aus dieser Aufgabenliste
- die empfohlene Reihenfolge
- Abhängigkeiten zwischen den Aufgaben
- sinnvolle Etappen oder Sprint-Blöcke

### Schritt 3: Erst dann mit der Umsetzung beginnen

Erst wenn:

- diese Datei vollständig gelesen wurde
- `CLAUDE.md` vollständig gelesen wurde
- `Release-Checkliste (10.05.2026).md` vollständig gelesen wurde
- ein Plan für die Anpassung/Umschreibung von `CLAUDE.md` erstellt wurde
- und der Gesamtplan um alle Punkte dieser Aufgabenliste erweitert wurde

beginnt die konkrete Abarbeitung.

### Schritt 4: Schrittweise Abarbeitung

Danach wird Punkt für Punkt gearbeitet:

- keine parallelen ungeplanten Baustellen
- nach jedem größeren Schritt kurze Neubewertung
- Ergebnisse dokumentieren
- bei Änderungen an Architektur oder Statusdokumenten immer `CLAUDE.md` mitdenken

## Arbeitsprinzip

- Erst alle `P0`-Blocker beseitigen
- Danach `P1`-Themen für echte Release-Fähigkeit
- `P2` nur nachgelagert oder parallel, wenn sie `P0/P1` nicht blockieren
- Nach jedem abgeschlossenen Block: testen, dokumentieren, neu bewerten

## Sprint-Ziel

Von einem inkonsistenten, dokumentarisch überbewerteten Stand zu einem belastbaren Release Candidate mit:

- bootfähigem Backend
- konsistentem Mobile/Auth/API-Vertrag
- stabiler Test-Baseline
- sauberer Navigation
- verifizierten Staging-Kernflows

## Phase 1: P0-Blocker sofort bearbeiten

### 1. Backend-Startfähigkeit herstellen

**Aufgaben:**
- `backend/app/main.py` prüfen
- fehlenden `health`-Import klären
- Backend lokal starten
- Startup-Fehler dokumentieren und beheben

**Ergebnis soll sein:**
- Backend startet ohne Importfehler
- App registriert alle produktiven Router sauber

**Status:** `Offen`

### 2. Backend-Router und Prefixe vereinheitlichen

**Aufgaben:**
- `main.py` und alle Router auf Prefix-Logik prüfen
- doppelte Prefixe entfernen
- finale API-Struktur dokumentieren

**Prüfbereiche:**
- `notifications`
- `metrics`
- `websocket`
- `alerts`
- alle weiteren Router mit eigenem Prefix

**Ergebnis soll sein:**
- Jeder Endpoint ist genau unter einer konsistenten URL erreichbar

**Status:** `Offen`

### 3. Backend-Modell-/Router-Mismatches auflösen

**Aufgaben:**
- `metrics.py` gegen `models/db.py` abgleichen
- `websocket.py` gegen `models/db.py` abgleichen
- nicht existierende Felder identifizieren
- entscheiden: Modell erweitern oder Router vereinfachen

**Besonders prüfen:**
- `predicted_home_prob`
- `was_correct`
- `actual_outcome`
- `betting_profit`
- `betting_stake`
- `external_id`
- `league` vs `league_id`

**Ergebnis soll sein:**
- Kein produktiver Router referenziert nicht existierende Datenfelder

**Status:** `Offen`

### 4. Mobile Auth-Flow korrigieren

**Aufgaben:**
- `AuthContext.tsx` und `api.ts` abgleichen
- Backend-Register-Vertrag mit Frontend harmonisieren
- sauberen Flow festlegen:
  - Registrierung mit anschließendem Login
  - oder Registrierung mit direkter Token-Ausgabe

**Ergebnis soll sein:**
- Register, Login, Logout und Refresh funktionieren konsistent

**Status:** `Offen`

### 5. ThemeProvider und Dark-Mode-Tests synchronisieren

**Aufgaben:**
- `ThemeContext.tsx` prüfen
- entscheiden, ob `initialTheme` unterstützt werden soll
- andernfalls Tests auf echte API umstellen
- Dark-Mode-Suites bereinigen

**Ergebnis soll sein:**
- Theme-API und Tests sprechen dieselbe Sprache

**Status:** `Offen`

### 6. Mobile-Navigation auf eine Wahrheit reduzieren

**Aufgaben:**
- `_layout.tsx` und `navigation/RootNavigator.tsx` vergleichen
- produktiven Einstieg festlegen
- alte oder parallele Navigation entfernen oder isolieren
- Screen-Imports bereinigen

**Ergebnis soll sein:**
- genau ein echter produktiver Navigationspfad

**Status:** `Offen`

### 7. Echte lokale Qualitätsbasis herstellen

**Aufgaben:**
- Backend-Tests ausführen
- Mobile-Tests ausführen
- Linting und Formatchecks ausführen
- fehlschlagende Tests gruppieren:
  - echte Defekte
  - Altlasten
  - Mock-/Setup-Probleme

**Ergebnis soll sein:**
- aktueller, verifizierter Qualitätsstatus

**Status:** `Offen`

## Phase 2: P1-Themen für Release-Fähigkeit

### 8. API-Verträge vollständig bereinigen

**Aufgaben:**
- Mobile-Services gegen Backend-Schemas mappen
- Request- und Response-Modelle dokumentieren
- veraltete Annahmen entfernen

**Bereiche:**
- `auth`
- `matches`
- `predictions`
- `teams`
- `players`
- `virtual-bets`
- `weekend`
- `notifications`
- `metrics`

**Ergebnis soll sein:**
- Mobile und Backend haben deckungsgleiche API-Verträge

**Status:** `Offen`

### 9. Security- und Konfigurationsabgleich machen

**Aufgaben:**
- CORS-Konfiguration prüfen
- Env-Variablen-Namen bereinigen
- lokale und produktive Konfiguration unterscheiden
- Secrets-Dokumentation korrigieren

**Besonders prüfen:**
- Wildcard-CORS
- JWT-Secret-Namen
- Backend-URL-Konfiguration
- Debug-Flags

**Ergebnis soll sein:**
- produktionsfähige Sicherheits- und Konfigurationsbasis

**Status:** `Offen`

### 10. Healthchecks, Logging und Monitoring vervollständigen

**Aufgaben:**
- Health-Endpunkte finalisieren
- Logging-Strategie prüfen
- Error Tracking anbinden oder validieren
- Monitoring-Anforderungen definieren

**Ergebnis soll sein:**
- Systemzustand ist nach Deploy messbar und überwachbar

**Status:** `Offen`

### 11. Notification-Flow real prüfen

**Aufgaben:**
- Device-Registration testen
- Notification-History-Endpunkte testen
- Mark-as-read prüfen
- Verhalten ohne Berechtigung prüfen
- Fehlerverhalten ohne Firebase/Token prüfen

**Ergebnis soll sein:**
- Notifications funktionieren oder degradieren sauber

**Status:** `Offen`

### 12. Desktop-Scope entscheiden

**Aufgaben:**
- entscheiden, ob `desktop/` Teil des nächsten Releases ist
- falls ja: Auth, API und Build prüfen
- falls nein: klar als out-of-scope dokumentieren

**Ergebnis soll sein:**
- eindeutiger Release-Scope ohne stillschweigende Nebenbaustellen

**Status:** `Offen`

### 13. CI/CD gegen die aktuelle Codebasis validieren

**Aufgaben:**
- `.github/workflows/` gegen tatsächliche Pfade und Befehle prüfen
- sicherstellen, dass alle Jobs auf aktuelle Struktur passen
- falsche Green-Signale identifizieren

**Ergebnis soll sein:**
- CI bestätigt den echten Release-Zustand

**Status:** `Offen`

### 14. Staging-Smoke-Tests durchführen

**Pflichtflows:**
- App-Start
- Registrierung
- Login
- Token-Refresh
- Match-Liste
- Prediction abrufen
- Weekend Calculator
- Notification-History
- Logout

**Ergebnis soll sein:**
- Kernpfade laufen Ende-zu-Ende auf einer realen Umgebung

**Status:** `Offen`

## Phase 3: P2-Härtung

### 15. Legacy- und Dead-Code abbauen

**Aufgaben:**
- veraltete Navigation entfernen
- Platzhalter-Screens markieren oder löschen
- doppelte Strukturen konsolidieren

**Status:** `Offen`

### 16. Testarchitektur glaubwürdiger machen

**Aufgaben:**
- übermockte Tests identifizieren
- realistischere Integrationspfade ergänzen
- flakey Tests isolieren

**Status:** `Offen`

### 17. Performance verifizieren

**Aufgaben:**
- API-Latenz messen
- App-Startzeiten prüfen
- Memory/FPS prüfen
- Weekend-Calculation benchmarken

**Status:** `Offen`

### 18. Release-Dokumentation bereinigen

**Aufgaben:**
- überoptimistische "production ready"-Aussagen korrigieren
- echte Release-Voraussetzungen dokumentieren
- Runbook an realen Zustand anpassen

**Status:** `Offen`

### 19. App-Store- und Compliance-Themen vorbereiten

**Aufgaben:**
- Privacy Policy
- Berechtigungsbeschreibungen
- Store Assets
- Release Notes
- Support-Kanal

**Status:** `Offen`

## Empfohlene Reihenfolge für die tatsächliche Umsetzung

### Tag 1-2

1. Backend-Startfähigkeit
2. Router-Prefixe
3. Modell-/Router-Mismatches

### Tag 3-4

4. Mobile Auth-Flow
5. Theme-/Dark-Mode-Konsistenz
6. Navigation vereinheitlichen

### Tag 5

7. lokale Test- und Build-Baseline
8. API-Verträge bereinigen

### Tag 6-7

9. Security/Konfiguration
10. Health/Monitoring
11. Notification-Flow

### Tag 8

12. Desktop-Scope klären
13. CI/CD validieren

### Tag 9-10

14. Staging-Smoke-Tests
15. Bugfix-Runde aus den Smoke-Tests

## Definition of Done für einen Release Candidate

Ein Release Candidate ist erst dann sinnvoll, wenn:

- Backend sauber startet
- Mobile Auth stabil läuft
- Navigation eindeutig ist
- Dark Mode technisch und testseitig konsistent ist
- API-Verträge übereinstimmen
- Test-Baseline dokumentiert grün ist
- Staging-Kernflows erfolgreich geprüft sind
- Monitoring und Healthchecks vorhanden sind

## Empfohlene Arbeitsweise im Repo

- Jede Aufgabe als kleinen, überprüfbaren Block umsetzen
- Nach jedem Block direkt testen
- Keine neuen Features während Phase 1 und 2
- Dokumentation erst nach technischem Fix nachziehen, nicht davor
- Vor jedem Merge den realen End-to-End-Pfad kurz prüfen

## Nächster sinnvoller Startpunkt

Die erste konkrete Arbeitswelle sollte erst **nach Abschluss des verbindlichen Arbeitsablaufs oben** mit diesen drei Punkten beginnen:

1. `backend/app/main.py` bootfähig machen
2. Backend-Routing bereinigen
3. Mobile-Auth-Vertrag angleichen

Damit wird der größte technische Nebel früh entfernt und alle Folgearbeiten werden deutlich einfacher.
