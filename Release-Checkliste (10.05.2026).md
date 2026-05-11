# Release-Checkliste

**Projekt:** Bundesliga Match Analyzer  
**Dateiname auf Wunsch:** `Release-Checkliste (10.05.2026).md`  
**Erstellt auf Basis des aktuellen Repo-Zustands:** 2026-05-11  
**Ziel:** Von "wirkt weit fortgeschritten" zu "technisch belastbar release-fertig"

## Executive Summary

Der aktuelle Stand wirkt wie ein fortgeschrittener Beta- oder Staging-Stand, aber noch nicht wie ein belastbarer Production Release. Die größte Lücke ist nicht fehlende Feature-Masse, sondern Inkonsistenz zwischen Code, API-Verträgen, Tests, Routing und Dokumentation.

Bevor ein Release verantwortbar ist, müssen zuerst die P0-Punkte abgearbeitet werden. Danach folgen P1-Themen für echte Release-Stabilität und P2-Themen für Härtung, Wartbarkeit und sauberen Betrieb.

## Prioritätenmodell

- `P0`: Release-Blocker. Ohne diese Punkte kein Release.
- `P1`: Muss vor Release abgeschlossen oder explizit akzeptiert werden.
- `P2`: Sollte direkt nach P1 folgen, kann aber in begründeten Fällen knapp nach Release passieren.

## Statusbild

### Positiv

- Monorepo-Struktur ist grundsätzlich klar: `mobile/`, `backend/`, `desktop/`, `docs/`, `database/`, `docker/`
- Es gibt bereits umfangreiche Tests, Dokumentation und Deployment-Unterlagen
- Mobile, Backend und Desktop sind funktional als getrennte Produktflächen erkennbar
- ML-/Prediction-Logik ist strukturell vorhanden

### Kritisch

- Mehrere harte Inkonsistenzen zwischen realem Code und Dokumentation
- API- und Modell-Verträge passen nicht überall zusammen
- Mobile Auth- und Theme-Flows sind nicht konsistent
- Routing im Backend ist teilweise doppelt oder widersprüchlich
- Release-Dokumente behaupten "production ready", der Codezustand belegt das derzeit nicht sicher

## Abgleich mit `CLAUDE.md`

### Gesamteinschätzung

`CLAUDE.md` ist als Zustandsbeschreibung deutlich näher am realen Repo als die späteren "Production Ready"- und Abschlussdokumente. Die Einordnung als **Phase C: Dark Mode & Testing** mit noch offenen Jest-, Theme- und Validierungsthemen passt wesentlich besser zum aktuellen Codebild.

### Was mit dem realen Repo-Zustand übereinstimmt

- Die Grundarchitektur mit `mobile/`, `backend/`, Tests und Konfigurationsdateien ist korrekt beschrieben.
- Die Mobile-Bereiche `screens`, `components`, `hooks`, `context`, `navigation` und `__tests__` existieren real.
- Die Fokusthemen Dark Mode, Notifications, Auth und Testing sind im Code tatsächlich zentral.
- Die Aussage, dass Dark Mode noch validiert und Jest-Mocks noch stabilisiert werden müssen, ist glaubwürdig.
- Die Security-Notiz zu AsyncStorage als vorläufige Lösung ist realistisch und passt zum aktuellen Mobile-Auth-Setup.

### Was nur teilweise stimmt oder veraltet wirkt

- `CLAUDE.md` nennt `src/styles/` als zentralen Ort für Design Tokens. Im aktuellen Mobile-Code ist die reale Struktur stärker über `theme/` und `ThemeContext` organisiert.
- `CLAUDE.md` beschreibt `src/navigation/` als die Navigationsebene, aber tatsächlich existieren mindestens zwei konkurrierende Navigationswahrheiten:
  - `mobile/src/_layout.tsx`
  - `mobile/src/navigation/RootNavigator.tsx`
- Die Backend-Beschreibung ist grundsätzlich korrekt, blendet aber reale Inkonsistenzen in Routing und Modellverwendung aus.

### Klare Widersprüche zum aktuellen Codezustand

- `CLAUDE.md` beschreibt eine laufende, aber im Kern geordnete Phase-C-Basis. Im realen Backend gibt es jedoch zusätzliche harte technische Probleme:
  - `backend/app/main.py` importiert `health`, obwohl `backend/app/routers/health.py` aktuell fehlt
  - mehrere Router haben mutmaßlich doppelte Prefix-Definitionen
  - `metrics.py` und `websocket.py` referenzieren Felder, die im aktuellen Datenmodell nicht vorhanden sind
- Die Dark-Mode-Tests sind nicht vollständig mit der echten Theme-API synchron:
  - Tests nutzen `ThemeProvider initialTheme=...`
  - der reale `ThemeProvider` unterstützt diesen Prop aktuell nicht
- Der Mobile-Auth-Flow ist nicht so konsistent, wie `CLAUDE.md` indirekt nahelegt:
  - `register()` im Frontend erwartet faktisch ein anderes Verhalten als das Backend derzeit liefert

### Einordnung für die Release-Bewertung

Für die Release-Einschätzung ist `CLAUDE.md` aktuell die glaubwürdigere Projekterzählung als die späteren "alles fertig"-Dokumente. Gleichzeitig reicht auch `CLAUDE.md` nicht aus, um Release-Reife zu belegen, weil dort mehrere heute sichtbare technische Brüche nicht benannt sind.

### Konsequenz für diese Checkliste

Die in dieser Datei definierten P0- und P1-Punkte bleiben nach dem Abgleich mit `CLAUDE.md` vollständig bestehen. Der Abgleich stärkt vor allem folgende Schlussfolgerung:

- Das Projekt ist eher in einem **Stabilisierungs- und Bereinigungszustand** als in einem echten Production-Ready-Zustand.
- Aussagen aus späteren Release-Dokumenten sollten derzeit nicht als verlässliche Freigabebasis verwendet werden.
- Für die operative Planung sollte `CLAUDE.md` als näher am Ist-Zustand betrachtet werden, aber immer gegen den realen Code gegengeprüft werden.

## P0 — Release-Blocker

### P0.1 Backend-Startfähigkeit sicherstellen

**Problem:**  
`backend/app/main.py` importiert `health`, aber `backend/app/routers/health.py` ist im aktuellen Repo nicht vorhanden. Wenn das so bleibt, ist der Backend-Start blockiert oder zumindest nicht belastbar.

**Betroffene Dateien:**
- `backend/app/main.py`
- `backend/app/routers/`

**Zu tun:**
- Prüfen, ob `health.py` fehlt, verschoben wurde oder in lokaler Änderung steckt
- Entweder echten Health-Router wiederherstellen oder Import/Registration korrekt entfernen
- Backend lokal booten und Startup vollständig validieren

**Abnahmekriterium:**
- `uvicorn app.main:app --reload` startet ohne Import-/Startup-Fehler
- Swagger/OpenAPI lädt
- Health-Endpunkt ist erreichbar oder bewusst sauber entfernt und ersetzt

**Aufwand:** `0.5-1 Tag`

### P0.2 Backend-Router-Präfixe bereinigen

**Problem:**  
Mehrere Router definieren bereits ein Prefix und erhalten in `main.py` zusätzlich ein Prefix. Das ist ein klassischer Release-Killer, weil dokumentierte und reale Endpunkte auseinanderlaufen.

**Auffällig betroffen:**
- `backend/app/routers/notifications.py`
- `backend/app/routers/metrics.py`
- `backend/app/routers/websocket.py`
- `backend/app/main.py`

**Zu tun:**
- Einheitliches Routing-Schema festlegen
- Prefix nur an einer Stelle definieren
- Alle Endpunkte gegen Mobile-Client und Dokumentation abgleichen

**Abnahmekriterium:**
- Alle registrierten Routen sind unter exakt den erwarteten URLs verfügbar
- Mobile-API-Aufrufe treffen echte Endpunkte ohne Sonderfälle oder Legacy-Pfade

**Aufwand:** `0.5-1 Tag`

### P0.3 Modell- und Router-Mismatches im Backend beheben

**Problem:**  
`metrics.py` und `websocket.py` referenzieren Felder, die im DB-Modell nicht existieren. Das ist ein echter Stabilitäts- und Qualitätsblocker.

**Beispiele:**
- `predicted_home_prob`
- `was_correct`
- `actual_outcome`
- `betting_profit`
- `betting_stake`
- `external_id`
- `Match.league` statt `league_id`

**Betroffene Dateien:**
- `backend/app/routers/metrics.py`
- `backend/app/routers/websocket.py`
- `backend/app/models/db.py`

**Zu tun:**
- Entscheiden, ob Modell erweitert oder Router zurückgebaut werden
- Falls Features geplant, fehlende Felder sauber migrieren
- Falls nicht geplant, Router auf vorhandenes Datenmodell reduzieren

**Abnahmekriterium:**
- Kein Router referenziert nicht existierende Modellfelder
- Metrics- und WebSocket-Endpunkte laufen fehlerfrei oder sind bewusst deaktiviert

**Aufwand:** `1-2 Tage`

### P0.4 Mobile Auth-Flow an echte Backend-API anpassen

**Problem:**  
`AuthContext.register()` erwartet Tokens, das Backend liefert bei `/register` aber laut aktuellem Code nur Userdaten. Damit ist Registrierung/Auto-Login inkonsistent.

**Betroffene Dateien:**
- `mobile/src/context/AuthContext.tsx`
- `mobile/src/services/api.ts`
- `backend/app/routers/auth.py`
- `backend/app/models/schemas.py`

**Zu tun:**
- Auth-Vertrag festlegen:
  - Option A: `register` gibt nur User zurück, danach separater Login
  - Option B: `register` gibt direkt Tokens zurück
- Mobile und Backend auf denselben Vertrag bringen
- Login, Register, Refresh und Logout Ende-zu-Ende testen

**Abnahmekriterium:**
- Registrierung funktioniert reproduzierbar
- Danach ist Nutzer entweder korrekt eingeloggt oder sauber zum Login geführt
- Token-Refresh und Logout funktionieren ohne Seiteneffekte

**Aufwand:** `1 Tag`

### P0.5 Dark-Mode-/Theme-API und Tests synchronisieren

**Problem:**  
Viele Tests verwenden `ThemeProvider initialTheme=...`, der aktuelle Provider unterstützt diesen Prop nicht. Damit ist ein Teil der Dark-Mode-Validierung derzeit nicht belastbar.

**Betroffene Dateien:**
- `mobile/src/context/ThemeContext.tsx`
- `mobile/src/__tests__/components/DarkModeComponents.test.tsx`
- `mobile/src/__tests__/screens/DarkModeScreens.test.tsx`

**Zu tun:**
- Entscheiden, ob `ThemeProvider` einen `initialTheme`-Prop erhalten soll
- Oder Tests auf die reale API umstellen
- Danach Dark-Mode-Tests und echte UI-Pfade prüfen

**Abnahmekriterium:**
- Theme-Verhalten und Testannahmen sind deckungsgleich
- Dark-Mode-Tests sind real grün und nicht nur durch zufällige Mocks

**Aufwand:** `0.5-1 Tag`

### P0.6 Aktive Mobile-Navigation vereinheitlichen

**Problem:**  
Es gibt mindestens zwei konkurrierende Navigationsstrukturen:
- `mobile/src/_layout.tsx`
- `mobile/src/navigation/RootNavigator.tsx`

Das erhöht die Gefahr, dass Screens, Tests und Deep Links auf unterschiedliche Wahrheiten zeigen.

**Zu tun:**
- Festlegen, welche Navigation produktiv ist
- Alte/alternative Struktur entfernen oder klar als Legacy markieren
- Tests und Imports auf den echten Navigationspfad ausrichten

**Abnahmekriterium:**
- Genau ein produktiver Root-Navigation-Flow
- Keine konkurrierenden Einstiegspunkte mit abweichender Screen-Topologie

**Aufwand:** `0.5-1 Tag`

### P0.7 Reale Test- und Build-Baseline herstellen

**Problem:**  
Die Doku nennt hohe Testzahlen und Release-Reife, aber aus dem Codezustand sind mehrere Inkonsistenzen erkennbar. Vor Release braucht es eine verifizierte Baseline.

**Zu tun:**
- Backend-Tests laufen lassen
- Mobile-Tests laufen lassen
- Linting und Formatchecks laufen lassen
- Ergebnis dokumentieren: grün, rot, flaky, ignoriert

**Abnahmekriterium:**
- Es gibt einen echten, aktuellen Qualitätsstatus statt nur historischer Aussagen
- Alle P0-relevanten Tests laufen grün

**Aufwand:** `0.5-1 Tag`

## P1 — Muss vor Release erledigt werden

### P1.1 API-Verträge systematisch bereinigen

**Ziel:** Mobile-Client, Backend-Schemas und Doku sprechen dieselbe Sprache.

**Zu prüfen:**
- `auth`
- `predictions`
- `metrics`
- `notifications`
- `weekend`
- `teams`
- `players`
- `virtual-bets`

**Abnahmekriterium:**
- Für jeden genutzten Endpoint stimmt Request/Response zwischen Mobile und Backend

**Aufwand:** `1-2 Tage`

### P1.2 CORS und Sicherheitskonfiguration auf Produktionsniveau bringen

**Problem:**  
In `backend/app/main.py` ist aktuell `allow_origins=["*"]`. Das widerspricht der Projektdoku und ist für Production mindestens prüfpflichtig.

**Zu tun:**
- CORS auf echte Origins begrenzen
- Security-Settings auf Konsistenz mit `backend/app/core/config.py` prüfen
- Secret-Namen und Env-Doku angleichen

**Abnahmekriterium:**
- Keine Wildcard-CORS-Konfiguration für Production
- Dokumentierte und reale Security-Konfiguration stimmen überein

**Aufwand:** `0.5 Tag`

### P1.3 Health, Monitoring und Observability vervollständigen

**Zu tun:**
- funktionierende Health-Endpunkte
- Logging prüfen
- Sentry oder äquivalentes Error Tracking real verdrahten
- Monitoring für API, DB, Redis, Queue und Worker vorbereiten

**Abnahmekriterium:**
- API-Health, Dependency-Health und Fehlertracking sind produktiv nutzbar

**Aufwand:** `1 Tag`

### P1.4 Staging-Smoke-Tests definieren und durchführen

**Pflicht-Szenarien:**
- App-Start
- Register
- Login
- Token-Refresh
- Match-Liste
- Prediction abrufen
- Weekend Calculator
- Notification-History
- Logout

**Abnahmekriterium:**
- Alle Kernflüsse laufen gegen eine Staging-Umgebung Ende-zu-Ende

**Aufwand:** `1 Tag`

### P1.5 Push-Notification-Flow absichern

**Zu tun:**
- Device Registration
- Permission Handling
- Error-Fallbacks
- Verhalten ohne Firebase-Token
- Notification-History und Mark-as-read-Endpunkte real prüfen

**Abnahmekriterium:**
- Notification-Features funktionieren oder degradieren sauber, ohne App-Instabilität

**Aufwand:** `0.5-1 Tag`

### P1.6 Desktop-Client gegen reale API prüfen

**Problem:**  
`desktop/` ist ein eigener Client und sollte vor Release nicht stillschweigend mitveröffentlicht werden, ohne dass seine Auth- und API-Flows validiert sind.

**Zu tun:**
- Login prüfen
- API-Basis-URL prüfen
- Build starten
- Packaging und Startverhalten prüfen

**Abnahmekriterium:**
- Desktop ist entweder ausdrücklich im Release-Scope und getestet
- oder bewusst aus dem Release ausgeschlossen

**Aufwand:** `0.5-1 Tag`

### P1.7 CI/CD gegen aktuellen Codezustand validieren

**Zu tun:**
- Workflows in `.github/workflows/` gegen aktuelles Repo prüfen
- Abhängigkeiten, Pfade und Build-Schritte verifizieren
- Sicherstellen, dass "grün" nicht nur für ältere Annahmen gilt

**Abnahmekriterium:**
- CI bildet den realen Release-Pfad korrekt ab

**Aufwand:** `0.5-1 Tag`

## P2 — Härtung, Wartbarkeit, Go-Live-Qualität

### P2.1 Dead Code und Legacy-Strukturen abbauen

**Zu tun:**
- alte Navigation bereinigen
- Platzhalter-Screens entfernen oder klar markieren
- veraltete Doku und ungenutzte Pfade konsolidieren

**Abnahmekriterium:**
- Weniger doppelte Wahrheiten im Repo

**Aufwand:** `1-2 Tage`

### P2.2 Testarchitektur entschlacken

**Problem:**  
Das Jest-Setup ist sehr stark gemockt. Das kann sinnvoll sein, aber vor Release sollte klar sein, welche Tests wirklich Produktverhalten absichern.

**Zu tun:**
- Flaky Tests identifizieren
- übermockte Tests markieren
- Smoke-/Integrationstests mit realitätsnäherem Setup ergänzen

**Abnahmekriterium:**
- Testpyramide ist glaubwürdig

**Aufwand:** `1-2 Tage`

### P2.3 Performance verifizieren

**Zu tun:**
- API-Latenzen messen
- App-Start prüfen
- Memory/FPS prüfen
- Weekend-Calculation unter realistischen Lasten messen

**Abnahmekriterium:**
- dokumentierte Performance-Ziele sind durch aktuelle Messung belegt

**Aufwand:** `1 Tag`

### P2.4 Release-Dokumentation an echten Stand anpassen

**Zu tun:**
- "production ready"-Aussagen korrigieren
- Release-Scope eindeutig machen
- Setup- und Runbook-Dokumente an reale Commands/Dateien anpassen

**Abnahmekriterium:**
- Doku beschreibt das System, das wirklich im Repo liegt

**Aufwand:** `0.5-1 Tag`

### P2.5 App-Store-/Compliance-Readiness

**Zu tun:**
- Privacy Policy
- Terms/Impressum falls erforderlich
- Berechtigungs-Texte
- Release Notes
- Screenshots/Assets

**Abnahmekriterium:**
- formale Veröffentlichung ist vorbereitet

**Aufwand:** `0.5-1 Tag`

## Empfohlene Umsetzungsreihenfolge

1. P0.1 Backend-Startfähigkeit
2. P0.2 Router-Präfixe
3. P0.3 Modell-/Router-Mismatches
4. P0.4 Mobile Auth-Vertrag
5. P0.5 Theme-/Dark-Mode-Konsistenz
6. P0.6 Navigation vereinheitlichen
7. P0.7 echte Test-Baseline
8. P1.1 API-Verträge komplett bereinigen
9. P1.2 Security/CORS
10. P1.3 Monitoring/Health
11. P1.4 Staging-Smoke-Tests
12. P1.5 Notifications
13. P1.6 Desktop-Scope klären
14. P1.7 CI/CD validieren
15. P2-Themen als Härtungswelle

## Geschätzter Gesamtaufwand

### Nur bis "technisch releasefähig"

- P0: `4-8 Arbeitstage`
- P1: `4-7 Arbeitstage`
- Gesamt: `8-15 Arbeitstage`

### Bis "sauber gehärteter Release"

- zusätzlich P2: `3-6 Arbeitstage`
- Gesamt inklusive Härtung: `11-21 Arbeitstage`

## Go/No-Go-Kriterien

### Go

- Backend startet stabil
- Mobile Auth funktioniert Ende-zu-Ende
- aktive Navigation ist eindeutig
- API-Verträge stimmen
- Kernflows in Staging sind grün
- Monitoring und Healthchecks sind produktiv nutzbar
- CI zeigt reale Qualität

### No-Go

- Import-/Startup-Fehler im Backend
- dokumentierte Endpunkte stimmen nicht mit realen Routen überein
- Register/Login/Refresh inkonsistent
- Dark-Mode- oder Navigationstests basieren auf veralteter API
- Production-Konfiguration ist unsauber oder nicht verifiziert

## Konkrete Empfehlung

Das Projekt sollte als Nächstes nicht in Richtung "mehr Features" bewegt werden, sondern in einen kurzen, fokussierten **Release-Stabilisierungs-Sprint**. Der Sprint sollte strikt auf P0 und P1 begrenzt sein, mit täglicher Verifikation gegen eine echte Staging-Umgebung.

Sobald P0 und P1 erledigt sind, kann die App mit deutlich besserem Gewissen in einen kontrollierten Release-Kandidaten überführt werden.
