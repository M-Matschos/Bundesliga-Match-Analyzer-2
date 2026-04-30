# 🧮 Mathematische Modelle

---

## Übersicht

Match Oracle verwendet fünf mathematische Modelle, die zu einem gewichteten Ensemble kombiniert werden.

| Modell | Datei | Gewicht im Ensemble |
|--------|-------|---------------------|
| Poisson-Verteilung | `ml/models/poisson_model.py` | Basis (λ-Berechnung) |
| Dixon-Coles | `ml/models/dixon_coles.py` | 40% |
| Monte Carlo | `ml/models/monte_carlo.py` | 40% |
| Elo-Rating | `ml/models/elo_system.py` | 20% |
| XGBoost (ML) | `ml/models/xgboost_model.py` | Final-Layer |
| Kelly-Kriterium | `ml/models/kelly.py` | Einsatz-Empfehlung |

---

## 1. Poisson-Verteilung (Basis-λ)

Berechnet die erwarteten Toranzahlen (λ) für beide Teams.

```
P(k Tore) = (λ^k × e^(-λ)) / k!

λ_home = attack_strength_home × defense_strength_away × league_avg_goals_home
λ_away = attack_strength_away × defense_strength_home × league_avg_goals_away

attack_strength_home  = avg_goals_scored_home  / league_avg_goals_home
defense_strength_away = avg_goals_conceded_away / league_avg_goals_away
```

Datei: `backend/ml/models/poisson_model.py`

---

## 2. Dixon-Coles-Modell

Verfeinert Poisson für Niedrig-Tore-Spiele (0:0, 1:0, 0:1, 1:1).

- Korrelationsparameter **ρ** korrigiert Joint-Wahrscheinlichkeiten bei ≤ 1 Tor/Team
- Zeitgewichtung **ξ**: Spiele älter als 365 Tage erhalten halbes Gewicht
- Ergebnis: vollständige Spielstand-Matrix P(i:j) für alle Stände 0:0 bis 6:6

Datei: `backend/ml/models/dixon_coles.py`

---

## 3. Monte Carlo Simulation (100.000 Runs)

```python
import numpy as np

def simulate(lambda_home: float, lambda_away: float, n=100_000) -> dict:
    home_goals = np.random.poisson(lambda_home, size=n)
    away_goals = np.random.poisson(lambda_away, size=n)

    home_win = float(np.mean(home_goals > away_goals))
    draw     = float(np.mean(home_goals == away_goals))
    away_win = float(np.mean(home_goals < away_goals))
    std      = float(np.std(home_goals - away_goals))

    # Spielstand-Matrix
    score_matrix = {}
    for h in range(7):
        for a in range(7):
            prob = float(np.mean((home_goals == h) & (away_goals == a)))
            score_matrix[f"{h}:{a}"] = round(prob, 4)

    return {"home_win": home_win, "draw": draw, "away_win": away_win,
            "std": std, "score_matrix": score_matrix}
```

Datei: `backend/ml/models/monte_carlo.py`

---

## 4. Elo-Rating-System

```
K = 20  (K-Faktor)
expected = 1 / (1 + 10^((rating_away - rating_home) / 400))
new_rating = old_rating + K × (result - expected)

Heimvorteil:    +100 Elo-Punkte
Startrating:    1500 (kalibriert auf Saisonstart)
Update:         Nach jedem Spieltag automatisch
```

Datei: `backend/ml/models/elo_system.py`

---

## 5. Expected Goals (xG)

| Kennzahl | Beschreibung |
|----------|-------------|
| xG | Erwartete Tore aus Chancenqualität eigener Angriffe |
| xGA | Erwartete Gegentore — misst Defensivstärke |
| NPxG | Non-Penalty xG — ohne Elfmeter |
| xGOT | Nur Schüsse aufs Tor |

Quelle: API-Football (Statsbomb-kompatibel)
Datei: `backend/ml/features/xg_calculator.py`

---

## 6. Kelly-Kriterium (Bankroll-Management)

```
f* = (b × p - q) / b

b = Nettogewinn (Quote - 1)
p = eigene Gewinnwahrscheinlichkeit
q = 1 - p

Empfehlung: Half-Kelly → f*/2 (konservativer, weniger Drawdown)
```

Datei: `backend/ml/models/kelly.py`

---

## Ensemble-Gewichtung

```python
home_win_final = (
    0.40 * dixon_coles["home_win"] +
    0.40 * monte_carlo["home_win"] +
    0.20 * elo_system.win_prob(home_id, away_id)
)
# XGBoost verfeinert die finale Ausgabe als letzter Layer
```

---

*→ [Data Factors](DATA_FACTORS.md) · [ML Layer](ML_LAYER.md)*
