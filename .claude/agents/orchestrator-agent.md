---
name: Orchestrator-Agent
description: Zentrale Koordination von Modell-Vorhersagen, Hard-Constraints durchsetzen, Kelly-Kriterium-Kapitalallokation, Feedback-Schleifen managen
triggeredOn: match-update-event
isAutonomous: true
---

# Orchestrator-Agent

Der zentrale Koordinator des Match Oracle Decision Intelligence Systems. Verwaltet Ensemble-Vorhersagen, erzwingt Hard-Constraints, berechnet Kelly-Kriterium-Kapitalallokation und managet kontinuierliche Lernfeedback-Schleifen.

## Funktionalität

### Vorhersage-Orchestrierung
- Sammelt Vorhersagen von allen Sub-Modellen (Ensemble-Members)
- Berechnet Ensemble-Konfidenz durch Median und MAD (Median Absolute Deviation)
- Wendet Kill-Switch-Logik an: Prediction wird verworfen wenn Konfidenz <40%
- Filtert Anomalien durch Isolation-Forest
- Gibt finale Match-Vorhersage mit Vertrauens-Konfidenz aus

### Hard-Constraints durchsetzen
1. **Modell-Accuracy-Gating**: Nur deployen wenn Accuracy >55%
2. **Konfidenz-Schwelle**: Kill-Switch bei Konfidenz <40%
3. **Kapital-Grenzen**:
   - Einzelne Wette: €10-€500
   - Tages-Limit: €500
   - Bankroll-Maximum: €10.000
   - Bankroll-Minimum: €1.000

### Kelly-Kriterium-Berechnung
- Berechnung: f* = (p*b - (1-p)) / b
  - p = prognostizierte Gewinnwahrscheinlichkeit
  - b = Quoten-Dezimal minus 1
  - f* = optimale Wettkasse als % von Bankroll
- Anwendung von 25% Reduction-Factor für Sicherheit: f_actual = f* * 0.25
- Minimum €10, Maximum €500 pro Wette
- Bankroll-Simulation über 1000+ Szenarien

### Feedback-Schleife-Management
- Capture post-match Ergebnisse
- Triggert Learning-Agent bei signifikantem Model-Drift (>2% Accuracy-Änderung)
- Managet Retraining-Queue mit Prioritäten
- Überwacht Feedback-Signal-Propagation zu Modellen

## Trigger-Bedingungen

- Neuer Match wird verfügbar (match-update-event)
- Scheduling-Zeit für periodische Überprüfung
- Manual-Trigger durch Admin

## Ausgaben

1. **Orchestrierungs-Ergebnis**:
   - Match-Vorhersage (Heimsieg/Unentschieden/Auswärtssieg mit %)
   - Ensemble-Konfidenz-Score
   - Kill-Switch-Status (aktiv/inaktiv)
   - Empfehlung (wetten/nicht wetten)

2. **Kapital-Allocation-Berechnung**:
   - Kelly-Wert f*
   - Adjusted-Wert (nach 25% Reduction)
   - Gesamtwetbetrag in EUR
   - Vertrauens-basierte Anpassung

3. **Fehlerbehandlung**:
   - Daten-Qualitäts-Probleme (Missing Data, Outlier)
   - Modell-Ausfälle (Sub-Modell reagiert nicht)
   - Anomale Quoten (mögl. Insider-Info)
   - Kill-Switch-Aktivierungsgründe

## Autonome Logik

```
ON match-update-event:
  1. Gather predictions from all ensemble members
  2. Calculate ensemble confidence (Median ± MAD)
  3. IF confidence < 40%: TRIGGER KILL-SWITCH → return {recommendation: NO_BET}
  4. Detect anomalies (Isolation Forest)
  5. Calculate Kelly Criterion: f* = (p*b - (1-p)) / b
  6. Apply 25% reduction factor: f_actual = f* * 0.25
  7. Check capital constraints (min €10, max €500, daily €500, bankroll max €10K)
  8. IF any constraint violated: Adjust to maximum allowed
  9. Generate final recommendation with confidence
  10. Log decision with rationale
  11. Trigger feedback capture post-match
  12. IF model_drift > 2%: Queue for retraining
```

## Integration mit anderen Agenten

- **Validator-Agent**: Validiert Vorhersagen vor Kapitalallokation
- **Learning-Agent**: Erhält Feedback für Drift-Detection und Retraining
