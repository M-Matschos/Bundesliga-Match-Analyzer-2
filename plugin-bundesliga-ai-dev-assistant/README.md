# Bundesliga Match Oracle AI Entwicklungs-Assistent

Ein umfassendes Cowork-Plugin, das spezialisierte Unterstützung für das Match Oracle Decision Intelligence System bietet. Integriert 15 spezialisierte Skills, 3 autonome Agenten und produktionsreife Sicherheitsmechanismen zum Aufbau, zur Validierung und zum Deployment von ROI-maximierten Vorhersagesystemen.

## Übersicht

Das Match Oracle ist eine quantitative Sports-Intelligence-Plattform, die darauf ausgelegt ist, die Rendite (ROI) durch folgende Faktoren zu maximieren:

- **Multi-Modell-Ensemble-Vorhersagen** mit Konfidenzscoring
- **Edge-Detection** zur Identifikation von Value Bets mit positivem Expected Value
- **Kapitalallokation** unter Verwendung des Kelly-Kriteriums mit Hard Constraints
- **Kill-Switch-Logik** zur rücksichtslosen Ablehnung von niedrig-vertrauenswürdigen Szenarien
- **Kontinuierliches Lernen** durch Feedback-Schleifen zur Verbesserung der Modellgenauigkeit
- **Portfolio-Optimierung** zur Verwaltung von Drawdowns und Risikoexposition

Dieses Plugin bietet Entwicklungswerkzeuge, Validierungs-Frameworks und Monitoring-Dashboards für den Aufbau und Betrieb solcher Systeme.

## Schnelleinstieg

1. **UI/UX Design**: Erstelle barrierefreie React Native Komponenten mit Design Tokens
   ```
   /design-ui-component [komponenten-name] --pattern=BUTTON|CARD|MODAL
   ```

2. **Code-Qualitätsanalyse**: Audit Code auf Komplexität, Duplikate, Performance-Probleme
   ```
   /analyze-code-quality --file=pfad/zur/datei --metrics=all
   ```

3. **Sicherheitsscanning**: Erkenne Sicherheitslücken, Geheimnisse, OWASP-Verstöße
   ```
   /security-audit --scope=project --include-dependencies
   ```

4. **Performance-Benchmarks**: Messe Rendering, Bundle-Größe, Speicher, Netzwerk-Performance
   ```
   /run-benchmarks --profile=complete --compare-baseline
   ```

5. **Modell-Testing**: Validiere Vorhersagegenauigkeit und Konfidenz-Kalibrierung
   ```
   /test-coverage analyze --model=ensemble-v2 --sport=bundesliga
   ```

6. **Metrics Dashboard**: Erstelle ROI-, Sharpe Ratio- und Genauigkeits-Tracking Dashboards
   ```
   /metrics-dashboard create --dashboard=comprehensive --timeframe=90d
   ```

7. **Deployment-Validierung**: Überprüfe Produktionsreife vor Release
   ```
   /deployment-check validate --environment=PROD
   ```

## Features

### 15 Spezialisierte Skills

**Kernentwicklung (4 Skills)**
- `/design-ui-component` — React Native Komponenten mit WCAG 2.1 AA/AAA Compliance
- `/analyze-code-quality` — Zyklomatische Komplexität, Duplikate, Wartbarkeitskennzahlen
- `/suggest-refactoring` — Intelligente Refactoring-Vorschläge mit Code-Generierung
- `/generate-tests` — Jest, Detox, React Native Testing Library Test-Generierung

**Performance & Qualität (3 Skills)**
- `/run-benchmarks` — Rendering, Bundle-Größe, Speicher, Netzwerk, Last-Performance
- `/security-audit` — Geheimnisse, CVE, OWASP, Injection-Risiken, Auth-Validierung
- `/check-dependencies` — Veraltete Pakete, Sicherheitslücken, Lizenzen, Größen-Auswirkungen

**Dokumentation & Barrierefreiheit (2 Skills)**
- `/generate-docs` — API, Komponenten, Architektur, Onboarding-Dokumentation
- `/check-a11y` — WCAG 2.1 AA/AAA Compliance, Tastaturnavigation, Screen-Reader

**Sports-Analytik (1 Skill)**
- `/sports-analytics` — Spiel-Vorhersagen, Spieler-Performance, Team-Analyse, xG-Berechnungen

**Match Oracle Spezifisch (5 Skills)**
- `/test-coverage` — Modell-Genauigkeitsvalidierung, Edge-Case-Testing, Kelly-Verifikation
- `/module-design` — Agent-Modul-Architektur, Kommunikationsprotokolle, State Management
- `/metrics-dashboard` — ROI, Sharpe Ratio, Drawdown, Win Rate, Edge-Detection-Tracking
- `/error-tracking` — Vorhersage-Fehleranalyse, systematische Fehler-Erkennung, Feedback-Generierung
- `/deployment-check` — Pre-Deployment-Validierung, Modell-Genauigkeit, Decision Engine, Kill-Switch-Testing

### 3 Autonome Agenten

**Orchestrator-Agent** (Automatisch bei Spiel-Updates)
- Zentraler Koordinator für Ensemble-Vorhersagen
- Wendet Hard Constraints und Kill-Switch-Logik an
- Leitet Entscheidungen zur Kapitalallokation weiter
- Verwaltet Feedback-Schleifen und Lernsignale

**Ensemble-Validator-Agent** (Automatisch bei Vorhersage)
- Validiert Sub-Modell-Vorhersagen
- Erkennt Anomalien und verdächtige Muster
- Berechnet Ensemble-Konfidenz
- Eskaliert anomale Vorhersagen für manuellen Review

**Learning-Feedback-Agent** (Automatisch nach Spiel)
- Erfasst Vorhersage-Feedback
- Erkennt Modell-Drift
- Triggert Umtraining bei Genauigkeitsverschlechterung
- Verwaltet kontinuierlichen Lernzyklus

### Sicherheitsmechanismen

**Pre-Commit Quality Gates**
- TypeScript-Kompilierung
- ESLint Code-Style-Validierung
- Jest Test-Suite-Verifikation
- Sicherheits-Vulnerability-Scanning

**Deployment-Safeguards**
- Modell-Genauigkeitsvalidierung (>55% für Moneyline, >48% für O/U)
- Kill-Switch-Funktionalitätstesting
- Kapital-Constraint-Durchsetzung
- Drawdown-Schutz-Verifikation
- Circuit Breaker Aktivierung

**Produktions-Monitoring**
- Echtzeit ROI- und Sharpe Ratio-Tracking
- Modell-Drift Frühwarnung
- Decision Execution Audit-Logging
- Automatische Rollback-Trigger

## Architektur

### Skill-Organisation

Jeder Skill ist ein selbstständiges Modul mit:
- Klaren Trigger-Phrasen und Nutzungsbeispielen
- Detaillierter Parameterdokumentation
- Integrationspunkten mit anderen Skills
- Werkzeug-Anforderungen und Berechtigungen

### Agent-Orchestrierung

Dreischichtiges Agent-Koordinationsmodell:
1. **Orchestrator** — Zentrale Decision-Flow-Verwaltung
2. **Validator** — Qualitätssicherung und Anomalieerkennung
3. **Learning** — Kontinuierliche Verbesserung und Feedback

### Hook-Integration

Sicherheits-Gates an kritischen Punkten:
- Pre-Deployment-Validierung (blockiert bei unerfüllten Kriterien)
- Post-Analyse-Logging (verfolgt Erkenntnisse)
- Quality-Check-Gates (verhindert fehlerhafte Builds)

## Entwicklungs-Workflow

### Phase 1: Design
```
/design-ui-component [name] → Erstellt barrierefreie React Native Komponente
```

### Phase 2: Implementierung & Validierung
```
/analyze-code-quality [datei] → Identifiziert Verbesserungen
/suggest-refactoring [datei] --apply → Wendet Refactorings automatisch an
/generate-tests [datei] --framework=jest → Erstellt Unit-Tests
```

### Phase 3: Performance & Sicherheit
```
/run-benchmarks --profile=complete → Misst Performance
/security-audit --scope=project → Scannt Sicherheitslücken
/check-dependencies → Auditet npm-Pakete
```

### Phase 4: Deployment-Validierung
```
/test-coverage analyze [modell] → Validiert Vorhersagegenauigkeit
/deployment-check validate --environment=PROD → Pre-Flight-Check
```

### Phase 5: Monitoring
```
/metrics-dashboard create --timeframe=90d → ROI-Tracking
/error-tracking analyze --period=START..END → Fehleranalyse
```

## Integration mit Match Oracle System

### Modell-Validierung
- Backtesting Genauigkeitsverifikation (>55% Moneyline, >48% O/U)
- Konfidenz-Kalibrierung (vorhergesagte vs. tatsächliche Genauigkeit)
- Edge-Case-Testing (ungewöhnliche Aufstellungen, Wetter, Kalender-Stress)
- Kelly-Kriterium-Validierung

### Decision Engine Testing
- Kill-Switch-Schwellenwert-Verifikation (40% Konfidenz Minimum)
- Hard-Constraint-Durchsetzung (Verletzungen, Form-Anforderungen)
- Kapitalallokations-Genauigkeit (vs. Kelly-Optimal)
- Drawdown-Schutz (<15% Maximum)

### Operatives Monitoring
- ROI- und Sharpe-Ratio-Dashboards
- Modell-Drift-Erkennung (30-Match Rolling Window)
- Feedback-Loop-Zykluszeit (Umtrainings-Häufigkeit)
- Vorhersagegenauigkeit nach Szenariotyp

## Anforderungen

### Umgebung
- Node.js 18+ mit npm/yarn
- Python 3.9+ für ML-Modell-Tools
- React Native/Expo für Mobile-Entwicklung
- Git für Versionskontrolle

### Datenbank
- Historische Spieldaten (mindestens 2 Saisons)
- Spieler-Verletzungs-/Sperr-Aufzeichnungen
- Schiedsrichter-Statistiken
- Wetterdaten

### APIs
- Echtzeit-Marktdaten-Feed
- Post-Match-Ergebnis-Verifikation
- Aufstellungs-Bestätigungs-Feed
- Optional: Erweiterte Sports-Statistiken (xG, Expected Assists)

### Tools
- Jest für Unit-Testing
- Detox für E2E-Testing
- TypeDoc für Dokumentation
- npm-check-updates für Abhängigkeitsverwaltung

## Konfiguration

### Umgebungsvariablen
```bash
MATCH_DATA_DB_URL=postgresql://...
PREDICTION_MODEL_PATH=/models/ensemble-v2
KELLY_REDUCTION_FACTOR=0.25
CONFIDENCE_THRESHOLD=0.40
MAX_POSITION_SIZE=0.02  # 2% des Portfolios
MAX_DRAWDOWN=0.15       # 15% Maximum
```

### Modell-Konfiguration
```json
{
  "ensemble": {
    "models": ["xg-model", "form-model", "historical-model"],
    "weights": [0.4, 0.3, 0.3],
    "consensusThreshold": 0.70
  },
  "decisionEngine": {
    "injuryThreshold": 0.15,
    "formThreshold": 0.45,
    "confidenceKill": 0.40,
    "kellyReduction": 0.25
  }
}
```

## Troubleshooting

### Modell-Genauigkeit sinkt
1. Überprüfe Drift-Erkennung: `/error-tracking analyze --type=prediction-errors`
2. Validiere Trainingsdaten: `/test-coverage analyze --model=current`
3. Triggere Lernzyklus: `/error-tracking trigger-feedback --severity=HIGH`
4. Überprüfe Feedback-Loop: Monitore in `/metrics-dashboard`

### Deployment schlägt fehl
1. Führe Pre-Flight aus: `/deployment-check validate --environment=PROD`
2. Audite Modell: `/test-coverage analyze --model=candidate`
3. Überprüfe Constraints: Verifikation Kill-Switch und Kapitallimits
4. Validiere Integration: Teste API-Verbindungen und Daten-Feeds

### Performance-Probleme
1. Profile: `/run-benchmarks --profile=complete`
2. Analysiere Komplexität: `/analyze-code-quality [datei]`
3. Schlage Verbesserungen vor: `/suggest-refactoring [datei]`
4. Validiere: Führe Tests und Benchmarks nach Refactoring durch

## Support & Dokumentation

- **Architektur**: Siehe `agents/` Verzeichnis für Agent-Workflows
- **Modell-Testing**: Überprüfe `/test-coverage` Skill für Validierungs-Muster
- **Safety Gates**: Untersuche `hooks/hooks.json` für Deployment-Safeguards
- **Metriken**: Konsultiere `/metrics-dashboard` für KPI-Definitionen

## Lizenz

MIT

## Autor

Bundesliga Match Analyzer Development Team
