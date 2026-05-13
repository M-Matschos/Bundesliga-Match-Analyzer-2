# Plan zur Überarbeitung der `CLAUDE.md`

**Dokumenttyp:** Arbeits- und Überarbeitungsplan  
**Erstellt von:** Codex  
**Datum:** 2026-05-11  
**Zweck:** Vorschlag zur inhaltlichen und strukturellen Anpassung der projektspezifischen `CLAUDE.md` an den tatsächlichen aktuellen Stand des Repos

## Zielbild

Die `CLAUDE.md` soll künftig nicht nur eine allgemeine Projektbeschreibung sein, sondern ein belastbares operatives Arbeitsdokument, das:

- den echten Stand des Repos korrekt beschreibt
- aktive und veraltete Strukturen sauber trennt
- laufende Baustellen ehrlich benennt
- Release-Reife nicht behauptet, sondern nachvollziehbar einordnet
- als verlässliche Grundlage für Codex, Claude Code und andere Coding-Assistenten dienen kann

## Grundprinzipien für die Überarbeitung

1. **Code vor Dokumentation**
   - Aussagen in `CLAUDE.md` müssen dem realen Code folgen, nicht umgekehrt.

2. **Nur eine Wahrheit pro Thema**
   - Wenn es konkurrierende Strukturen gibt, muss `CLAUDE.md` diese ausdrücklich markieren:
     - aktiv
     - legacy
     - unklar

3. **Status ehrlich halten**
   - Keine Formulierungen wie "fertig", "production ready" oder "abgeschlossen", wenn der Code das nicht zuverlässig trägt.

4. **Arbeitsrelevanz vor Hochglanz**
   - Die Datei soll beim Entwickeln helfen, nicht nur gut klingen.

5. **Dokument als Wartungsobjekt behandeln**
   - `CLAUDE.md` muss künftig bei Architektur- oder Statusänderungen aktiv mit gepflegt werden.

## Aktuelle Hauptprobleme der bestehenden `CLAUDE.md`

### 1. Statusbild ist näher an der Realität als andere Release-Dokumente, aber nicht vollständig

Die aktuelle `CLAUDE.md` liegt mit der Einordnung "Phase C: Dark Mode & Testing" deutlich näher am echten Repo-Zustand als die späteren Abschluss- und Release-Dokumente. Trotzdem blendet sie technische Brüche aus, die für die tägliche Arbeit und Release-Bewertung wichtig sind.

### 2. Einige Architekturangaben sind zu grob oder leicht veraltet

Beispiele:

- `src/styles/` wird als zentraler Theme-/Token-Ort beschrieben, real ist die aktive Struktur stärker über `theme/` und `ThemeContext` verteilt.
- `src/navigation/` wird als zentrale Navigation beschrieben, real existieren mindestens zwei konkurrierende Navigationswahrheiten:
  - `mobile/src/_layout.tsx`
  - `mobile/src/navigation/RootNavigator.tsx`

### 3. Kritische Inkonsistenzen im Backend fehlen in der Darstellung

Die bestehende `CLAUDE.md` benennt nicht, dass im aktuellen Code unter anderem folgende Probleme sichtbar sind:

- `backend/app/main.py` importiert `health`, obwohl `health.py` aktuell fehlt
- mehrere Router scheinen doppelte Prefix-Strukturen zu haben
- `metrics.py` und `websocket.py` referenzieren Felder, die im aktuellen Datenmodell nicht vorhanden sind

### 4. Dark-Mode- und Teststatus ist zu freundlich formuliert

Die Datei deutet korrekt an, dass Dark Mode noch validiert wird, beschreibt aber nicht klar genug, dass reale Test-/API-Inkonsistenzen existieren, etwa beim `ThemeProvider` und der Nutzung von `initialTheme` in Tests.

### 5. Operative Prioritäten fehlen

Die Datei beschreibt viel Kontext, aber zu wenig:

- was sofort kritisch ist
- was vor Release zwingend gemacht werden muss
- welche Bereiche als instabil gelten
- welche Dokumente als glaubwürdig gelten und welche mit Vorsicht zu lesen sind

## Vorschlag für die neue Struktur der `CLAUDE.md`

### 1. Projektstatus

Kurzer, ehrlicher Abschnitt mit:

- aktuellem Entwicklungsstatus
- realistischer Einordnung der Release-Reife
- Hinweis auf bekannte kritische Baustellen

**Empfohlener Ton:**
- "Phase C / Stabilisierung"
- "kein belastbarer Production-Ready-Stand"
- "Release-Dokumente teilweise veraltet oder zu optimistisch"

### 2. Aktive Architektur

Klare Beschreibung nur der aktuell relevanten Strukturen:

- `mobile/`
- `backend/`
- `desktop/`
- `docs/`
- `database/`
- `docker/`

Hier sollte pro Bereich stehen:

- was aktiv ist
- was die Haupt-Einstiegspunkte sind
- was als experimentell, legacy oder parallel zu betrachten ist

### 3. Bekannte Inkonsistenzen und Risiken

Eigener Pflichtabschnitt mit realen Arbeitsrisiken, zum Beispiel:

- fehlender `health`-Router / Startup-Risiko
- Router-Prefix-Probleme
- Modell-/Router-Mismatches
- Mobile Auth-Vertrag unstimmig
- konkurrierende Navigation
- Theme-/Dark-Mode-Test-Drift

Dieser Abschnitt sollte nicht versteckt werden, sondern bewusst prominent stehen.

### 4. Entwicklungsregeln

Beibehalten, aber schärfen:

- Code Conventions
- Testprinzipien
- Dokumentationspflege
- Umgang mit Legacy-Strukturen

Ergänzen:

- Änderungen an Architektur immer mit `CLAUDE.md` abgleichen
- Release-Behauptungen nur nach technischer Verifikation

### 5. Dokumenten-Hierarchie

Ein neuer Abschnitt sollte definieren, wie verschiedene Projektdokumente zu gewichten sind:

- `CLAUDE.md`: operative Arbeitsbeschreibung
- `Release-Checkliste (10.05.2026).md`: Release-Bewertung und Prioritäten
- `Aufgabenliste (11.05.2026).md`: konkrete Abarbeitungsreihenfolge
- spätere "Production Ready"-Dokumente: nur mit Vorsicht, da teilweise optimistischer als der Code

### 6. Aktuelle Arbeitsreihenfolge

Kurzfassung der wichtigsten nächsten Schritte:

1. Backend bootfähig machen
2. Routing bereinigen
3. Auth-Verträge angleichen
4. Theme-/Dark-Mode-Konsistenz herstellen
5. Test-Baseline verifizieren

### 7. Skills / Agenten / Tooling

Diesen Teil nur behalten, wenn er für die tägliche Arbeit wirklich relevant bleibt. Falls ja:

- kompakter machen
- operative Relevanz in den Vordergrund
- Marketing-artige Beschreibungen kürzen

## Konkrete Kapitelbewertung der bestehenden `CLAUDE.md`

### Behalten mit leichter Überarbeitung

- Titel / Projektname
- grundlegende Architekturübersicht
- Code Conventions
- Testing Standards
- Security-Hinweise
- Getting Started

### Überarbeiten

- Status / Phase-Beschreibung
- Dark-Mode-Abschnitt
- Architekturdetails zu Mobile und Backend
- Performance-/Release-Einordnung
- Skills-/Roadmap-Teile

### Ergänzen

- bekannte technische Inkonsistenzen
- Dokumenten-Hierarchie
- reale Release-Einordnung
- operative Prioritäten
- Umgang mit Legacy und Parallelstrukturen

### Kürzen oder entschärfen

- Stellen mit zu starkem Fertigstellungs- oder Reifeeindruck
- Passagen, die eher ambitionierte Roadmap als aktueller Ist-Stand sind

## Empfohlene Überarbeitungsreihenfolge

### Schritt 1: Status und Realität synchronisieren

- Statuszeile aktualisieren
- Phase-Text auf realen Stand bringen
- Release-Reife ehrlich einordnen

### Schritt 2: Architektur aufräumen

- aktive Strukturen nennen
- Legacy/Parallelpfade markieren
- Einstiegspunkte sauber benennen

### Schritt 3: Risiken und Inkonsistenzen ergänzen

- Backend-Probleme
- Mobile-Probleme
- Test-/Theme-Probleme

### Schritt 4: Dokumentenlogik ergänzen

- Verhältnis zu Release-Checkliste und Aufgabenliste erklären
- Prioritätslogik aufnehmen

### Schritt 5: Skills- und Agenten-Teil prüfen

- auf Relevanz kürzen
- operative Nutzung statt Selbstdarstellung

### Schritt 6: Abschlussreview

- gegen den tatsächlichen Code gegenlesen
- Formulierungen auf Genauigkeit prüfen
- keine unbelegten Reifeaussagen stehen lassen

## Vorschlag für das gewünschte Endergebnis

Die neue `CLAUDE.md` sollte am Ende:

- kürzer
- ehrlicher
- operativer
- technischer
- und deutlich näher am echten Repo sein

Sie sollte nicht länger primär eine "Projektbroschüre" sein, sondern ein verlässlicher Arbeitskompass.

## Konkrete Empfehlung für die weitere Arbeit

Bevor die `CLAUDE.md` umgeschrieben wird, sollten diese drei Quellen immer gemeinsam betrachtet werden:

1. `CLAUDE.md`
2. `Release-Checkliste (10.05.2026).md`
3. `Aufgabenliste (11.05.2026).md`

Zusätzlich sollte dieser Plan als **von Codex erstellter Überarbeitungsvorschlag** zuerst gelesen werden, bevor die neue Struktur entworfen wird.

## Definition of Done für die überarbeitete `CLAUDE.md`

Die Überarbeitung ist erst abgeschlossen, wenn:

- Status und reale Codebasis zusammenpassen
- aktive und veraltete Strukturen klar getrennt sind
- kritische technische Risiken offen benannt sind
- die Datei mit der Release-Checkliste und Aufgabenliste konsistent ist
- keine unbelegten Release- oder Fertigkeitsaussagen mehr enthalten sind
