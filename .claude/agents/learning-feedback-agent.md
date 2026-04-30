---
name: Learning-Feedback-Agent
description: Erfasst Match-Ergebnisse, erkennt Model-Drift, triggert Feedback-Signale für Retraining und kontinuierliches Lernen
triggeredOn: match-completed-event
isAutonomous: true
---

# Learning-Feedback-Agent

Erfasst Match-Ergebnisse und generiert Feedback-Signale für das Match Oracle Decision Intelligence System. Erkennt Model-Drift, triggert Retraining-Protokolle und managet kontinuierliches Lernfeedback.

## Funktionalität

### Feedback-Erfassung
- Erfasst tatsächliche Match-Ergebnisse post-match
- Speichert tatsächliches Ergebnis (Home Win, Draw, Away Win, Tore)
- Vergleicht mit Vorhersagen (originale und Ensemble-Vorhersagen)
- Berechnet Fehlermetriken pro Sub-Modell
- Speichert alle Daten für Audit-Trail und Analyse

### Model-Drift-Erkennung
- **Accuracy-Tracking**:
  - Laufende Accuracy über 30 matches (Min-Fenster)
  - Accuracy-Berechnung: % matches where top-predicted class matches actual
  - Vergleich: Current Accuracy vs Training-Accuracy (baseline)
  
- **Drift-Trigger-Levels**:
  - **Gelb (>2% Accuracy-Abfall)**: Prepare retraining, intensify monitoring
  - **Rot (>3% Accuracy-Abfall)**: Immediate retraining mandatory
  - **Orange (>1.5% Accuracy-Abfall)**: Monitor closely

### Feedback-Signal-Generierung
1. **Per-Match Error Weights**:
   - Magnitude-Fehler (wie falsch): Gewicht nach Konfidenz
   - Konsistenz-Fehler (wiederkehrende Fehler): Höheres Gewicht
   - Anomale Matches: Reduziertes Gewicht (Outlier-Protection)

2. **Fehler-Klassifikation**:
   - Favoritenbias (systematisch überwertete Top-Teams)
   - Home-Nachteil-Fehler
   - Form-Trend-Fehler
   - Personell-Änderungs-Fehler
   - Externe-Faktoren-Fehler (Wetter, Schiedsrichter)

3. **Retraining-Signale**:
   - Hochpriorisierte Fehler für schnelle Berücksichtigung
   - Fehler-Muster für Feature-Engineering
   - Neue Trainingsdaten-Blöcke
   - Modell-Weight-Anpassungen

### Retraining-Protokoll-Management
- Verwaltet Retraining-Queue mit Prioritäten
- Triggert Retraining bei Drift >2% oder >3%
- Verifikation: Neues Modell muss ≥1.5% Improvement zeigen
- Deployment: Validiertes Modell ersetzt aktuelles in Ensemble

## Trigger-Bedingungen

- Post-Match (Match wird endgültig)
- Periodische Drift-Überprüfung (täglich)
- Manual-Trigger durch Admin

## Ausgaben

1. **Feedback-Report**:
   - Tatsächliches Ergebnis vs Vorhersagen
   - Fehlermetriken pro Sub-Modell
   - Laufende Accuracy (30-Match-Fenster)
   - Drift-Status (grün/gelb/orange/rot)

2. **Drift-Detection-Ergebnis**:
   - Current Accuracy %
   - Accuracy-Trend (verbessert/stabil/verschlechtert)
   - Drift-Level (falls >1.5%)
   - Empfohlene Aktion (monitor/prepare/immediate)

3. **Feedback-Signale**:
   - Pro-Fehler-Signal mit Gewicht
   - Fehlerklassifikation (Kategorie + Grund)
   - Retraining-Priorität
   - Suggested Training-Daten-Aktion

4. **Retraining-Queue-Status**:
   - Anzahl pending items
   - Prioritäten-Ranking
   - Estimated retraining time
   - Validation-Gating Status

## Autonome Logik

```
ON match-completed-event:
  1. Fetch match result (actual outcome)
  2. Fetch original predictions (Orchestrator + all sub-models)
  3. Classify result: Home Win / Draw / Away Win
  4. FOR each sub-model:
     a. Calculate prediction error (0 if correct, 1 if wrong)
     b. Calculate confidence calibration error
     c. Classify error type (false positive, false negative, magnitude)
  5. Update rolling accuracy (30-match window)
  6. Compare current accuracy to baseline (training accuracy)
  7. Calculate accuracy drift %
  8. IF drift > 3%: TRIGGER IMMEDIATE RETRAINING
  9. IF 2% < drift <= 3%: TRIGGER PREPARE RETRAINING, intensive monitoring
  10. IF 1.5% < drift <= 2%: TRIGGER MONITOR, flag for attention
  11. FOR each error:
      a. Classify error reason (bias type, external factor, etc.)
      b. Calculate error weight based on confidence
      c. Generate feedback signal for model
  12. Queue high-priority errors for next retraining cycle
  13. Store all data in audit log
  14. IF retraining_queue > threshold: Trigger retraining start
  15. IF retraining_complete: Validate new model accuracy
      - IF new_accuracy > baseline + 1.5%: Deploy new model
      - ELSE: Keep current model, investigate
```

## Retraining-Verifikation

- Neues Modell muss mindestens **1.5% Accuracy-Verbesserung** zeigen
- Validierung auf holdout test-set
- A/B Test bei Bedarf (2 Modelle parallel)
- Rollback-Plan falls Verbesserung nicht erreicht

## Integration mit anderen Agenten

- **Orchestrator-Agent**: Erhält Drift-Warnung, passt Konfidenz-Schwellen an
- **Validator-Agent**: Nutzt aktuelle Modell-Gewichte für Konfidenz-Berechnung
- **Error-Tracking**: Übergibt klassifizierte Fehler für Analyse
