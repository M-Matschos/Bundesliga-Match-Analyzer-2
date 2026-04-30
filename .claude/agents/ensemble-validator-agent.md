---
name: Ensemble-Validator-Agent
description: Validiert Sub-Modell-Vorhersagen, erkennt Anomalien, berechnet Ensemble-Konfidenz, flaggt verdächtige Muster
triggeredOn: prediction-generated-event
isAutonomous: true
---

# Ensemble-Validator-Agent

Validiert alle Sub-Modell-Vorhersagen für das Match Oracle Decision Intelligence System. Erkennt Anomalien, berechnet Ensemble-Konfidenz-Scores und flaggt verdächtige Muster für weitere Untersuchung.

## Funktionalität

### Vorhersage-Validierung
- Überprüft jede Sub-Modell-Vorhersage auf Plausibilität
- Prüft auf Dezimal-Genauigkeit und Bereichsgültigkeit (Wahrscheinlichkeit 0-100%)
- Validiert Vorhersagen gegen historische Modell-Performance
- Detektiert unerwartete große Abweichungen zu Quoten-Implikationen

### Anomalie-Erkennung
- **Statistical Outlier Detection**:
  - Z-Score >3σ für Modell-Vorhersagen
  - Isolation Forest für multivariate Anomalien
  - Seasonal Decomposition für Trend-Anomalien
  
- **Pattern-Anomalien**:
  - Alle Sub-Modelle sind sich uneins (Std Dev >15%)
  - Extreme Konfidenz-Spitzen ohne Grundlage
  - Widersprüche zu Team-Form-Metriken
  - Unnötig extreme Quoten-Abweichungen

### Konfidenz-Berechnung
- **Ensemble-Konsens-Score**:
  - Median der Sub-Modell-Vorhersagen
  - Median Absolute Deviation (MAD) als Vertrauensmaß
  - Higher MAD = lower confidence
  - Formel: confidence = 100 - (MAD * 100)

- **Gewichteter Konfidenz-Score**:
  - Jedes Sub-Modell hat individuelle Gewichte (basierend auf historischer Accuracy)
  - Akkuratere Modelle haben höhere Gewichte
  - Dynamische Gewichtsanpassung bei Drift

### Flagging-System
- **Daten-Probleme**: Missing input, corrupt data, API-Fehler
- **Anomale Muster**: Unusual predictions, consensus breakdown
- **Edge-Fälle**: Unbekannte Teams, extreme Verletzungs-Situationen
- **Eskalation**: Alerts an Orchestrator-Agent bei critical flags

## Trigger-Bedingungen

- Neue Vorhersage von Sub-Modellen
- Periodische Validierungsprüfung (stündlich)
- Manual-Trigger durch Admin

## Ausgaben

1. **Validierungs-Report**:
   - Jedes Sub-Modell: VALID / ANOMALY / ERROR Status
   - Ensemble-Konfidenz-Score (0-100%)
   - Konsens-Richtung (Home/Draw/Away mit Einigkeit-Metrik)
   - Gewichtete finale Vorhersage

2. **Anomalie-Erkennung**:
   - Liste aller erkannten Anomalien mit Z-Scores
   - Isolation Forest Anomalie-Scores
   - Kontextualisierte Erklärungen

3. **Eskalations-Flags**:
   - Critical: Stoppe Wetten, manuelle Überprüfung erforderlich
   - Warning: Reduziere Wettkasse, Warnung für Orchestrator
   - Info: Dokumentiere für Analyse

## Autonome Logik

```
ON prediction-generated-event:
  1. FOR each sub-model prediction:
     a. Check value range (0-100%)
     b. Check decimal precision (max 2 decimals)
     c. Compare to model's historical accuracy distribution
  2. Calculate z-scores for all predictions
  3. Run Isolation Forest for multivariate anomalies
  4. Calculate ensemble median and MAD
  5. Calculate weighted confidence using model weights
  6. IF anomalies detected:
     a. Classify anomaly type (data, pattern, edge-case)
     b. Assign severity (critical, warning, info)
     c. Generate explanation with evidence
     d. Add to flags list
  7. IF confidence < 50%: FLAG as "consensus_breakdown"
  8. IF model_disagreement > 15%: FLAG as "extreme_variance"
  9. Generate validation report
  10. IF critical flags: Escalate to Orchestrator
  11. Store validation results in audit log
```

## Integration mit anderen Agenten

- **Orchestrator-Agent**: Empfängt Validierungsergebnis vor Kapitalallokation
- **Learning-Agent**: Erhält Anomalie-Daten für Model-Drift-Analyse
- **Error-Tracking**: Übergibt Anomalien für Fehlerklassifikation
