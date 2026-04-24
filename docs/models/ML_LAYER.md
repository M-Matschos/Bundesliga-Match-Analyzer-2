# 🤖 KI / Machine-Learning-Schicht

---

## Architektur-Übersicht

```
Mathematische Modelle (Poisson, Dixon-Coles, Monte Carlo, Elo)
                    │
                    ▼
          39 Feature-Vektor
                    │
                    ▼
         ┌─────────────────┐
         │  XGBoost Model  │  ← Haupt-Klassifikator
         │  Random Forest  │  ← Ensemble-Partner
         └────────┬────────┘
                  │
                  ▼
         Finale Wahrscheinlichkeiten (1/X/2)
                  │
         ┌────────┴────────┐
         │  SHAP-Explainer │  → "Warum diese Prognose?"
         └────────┬────────┘
                  │
                  ▼
         Value-Bet-Detection
```

---

## XGBoost Haupt-Modell

| Parameter | Wert |
|-----------|------|
| Algorithmus | XGBoost + Random Forest Ensemble |
| Trainingsdaten | 10 Jahre BL + 5 Jahre PL (~15.000 Spiele) |
| Features | 39 Faktoren aus DATA_FACTORS.md |
| Ziel-Variable | 3-Klassen: Heimsieg / Unentschieden / Auswärtssieg |
| Validierung | Walk-Forward-Cross-Validation (zeitbasiert) |
| Re-Training | Wöchentlich automatisch (Celery Task) |
| Erwartete Genauigkeit | ~60–65% (Benchmark Bookmaker: ~53–56%) |

Datei: `backend/ml/models/xgboost_model.py`
Training: `backend/ml/training/train.py`

---

## NLP-Modul: News & Verletzungen

Dateien: `backend/nlp/news_scraper.py`, `backend/nlp/injury_detector.py`

- Scraping: Vereins-Pressemitteilungen + kicker.de + transfermarkt.de
- Modell: Multilingual BERT (HuggingFace Transformers)
- Erkennt: Verletzungen, Transfernews, Trainerwechsel, Trainingsprotokolle
- Alert: Push-Notification wenn Prognose-Verschiebung > 5%

---

## SHAP-Erklärungen

Jede Prognose enthält eine Erklärung:

```
Beispiel: Bayern München gewinnt mit 68%

Wichtigste Faktoren:
+ xG Vorteil:        +12%  ████████
+ Heimvorteil:       + 8%  █████
+ Form (5 Spiele):   + 6%  ████
- Verletzung Kimmich:- 9%  ██████
- Müdigkeit (UCL):   - 4%  ███
```

Datei: `backend/ml/explainability/shap_explainer.py`

---

## Anomalie-Erkennung

- Flaggt Spiele mit sehr breiten Konfidenzintervallen (Low-Confidence-Badge)
- Erkennt ungewöhnliche Quoten-Bewegungen (mögliche Wettmanipulation)
- Markiert Spiele wo NLP-Modul kritische News gefunden hat

---

## Auto-Retraining Pipeline

```
Jeden Montag 3:00 Uhr UTC (Celery Beat):
1. Neue Spielergebnisse aus DB laden
2. Feature-Vektor neu berechnen
3. XGBoost re-trainieren (Walk-Forward)
4. Backtesting: Präzision letzte 100 Spiele
5. Modell deployen falls Verbesserung
6. Slack/Email Alert: "Modell v2.3 deployed, Acc: 62.1%"
```

Datei: `backend/ml/training/retrain_scheduler.py`

---

*→ [Mathematische Modelle](MATHEMATICAL_MODELS.md) · [API Endpoints](../api/ENDPOINTS.md)*
