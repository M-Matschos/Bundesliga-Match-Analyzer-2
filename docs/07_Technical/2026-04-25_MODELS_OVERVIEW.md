# 🧮 Mathematische Modelle

## Modell-Stack (von simpel zu komplex)

```
Rohdaten → Feature Engineering → Ensemble-Prognose
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
               Poisson          Dixon-Coles       XGBoost
             (Baseline)          (Verfeinert)     (ML-Layer)
                    │                │                │
                    └────────────────┴────────────────┘
                                     │
                             Monte Carlo (100k)
                                     │
                             Finale Wahrscheinlichkeit
```

---

## 1. Poisson-Verteilung

**Wofür:** Baseline-Modell. Berechnet Tor-Erwartungswerte.

```python
# backend/ml/models/poisson_model.py

import numpy as np
from scipy.stats import poisson

def calculate_match_probabilities(lambda_home: float, lambda_away: float, max_goals: int = 10):
    """
    Berechnet Wahrscheinlichkeits-Matrix für alle Spielstände.
    
    Args:
        lambda_home: Erwartete Tore Heimteam (z.B. 1.8)
        lambda_away: Erwartete Tore Auswärtsteam (z.B. 1.1)
    
    Returns:
        score_matrix: 11x11 Matrix mit Spielstand-Wahrscheinlichkeiten
    """
    score_matrix = np.zeros((max_goals + 1, max_goals + 1))
    
    for h in range(max_goals + 1):
        for a in range(max_goals + 1):
            score_matrix[h][a] = (
                poisson.pmf(h, lambda_home) * poisson.pmf(a, lambda_away)
            )
    
    home_win = np.sum(np.tril(score_matrix, -1))  # Unterhalb Diagonale
    draw     = np.sum(np.diag(score_matrix))       # Diagonale
    away_win = np.sum(np.triu(score_matrix, 1))    # Oberhalb Diagonale
    
    return {
        "home_win": float(home_win),
        "draw":     float(draw),
        "away_win": float(away_win),
        "score_matrix": score_matrix.tolist()
    }

def calculate_lambda(team_stats: dict, opponent_stats: dict, is_home: bool) -> float:
    """
    Berechnet den Tor-Erwartungswert (Lambda) für ein Team.
    Formel: λ = Angriffsstärke × Defensivschwäche Gegner × Liga-Durchschnitt
    """
    home_advantage = 1.15 if is_home else 1.0
    
    attack_strength = team_stats['avg_goals_scored'] / team_stats['league_avg_goals']
    defense_weakness = opponent_stats['avg_goals_conceded'] / opponent_stats['league_avg_goals']
    
    return attack_strength * defense_weakness * team_stats['league_avg_goals'] * home_advantage
```

---

## 2. Dixon-Coles Korrekturfaktor

**Wofür:** Verbessert Poisson bei Niedrig-Tore-Spielen (0:0, 1:0, 0:1, 1:1).

```python
# backend/ml/models/dixon_coles.py

def dixon_coles_correction(home_goals: int, away_goals: int,
                           lambda_home: float, lambda_away: float,
                           rho: float = -0.13) -> float:
    """
    Korrekturfaktor τ für Niedrigtore-Spiele.
    rho ≈ -0.13 ist der empirisch beste Wert für Bundesliga.
    """
    if home_goals == 0 and away_goals == 0:
        return 1 - lambda_home * lambda_away * rho
    elif home_goals == 1 and away_goals == 0:
        return 1 + lambda_away * rho
    elif home_goals == 0 and away_goals == 1:
        return 1 + lambda_home * rho
    elif home_goals == 1 and away_goals == 1:
        return 1 - rho
    else:
        return 1.0  # Keine Korrektur bei höheren Torzahlen
```

---

## 3. Monte Carlo Simulation

**Wofür:** Gibt vollständige Wahrscheinlichkeitsverteilung aller Ergebnisse.

```python
# backend/ml/models/monte_carlo.py

import numpy as np

class MonteCarloSimulator:
    def __init__(self, n_simulations: int = 100_000):
        self.n = n_simulations
    
    def simulate(self, lambda_home: float, lambda_away: float) -> dict:
        """
        Simuliert das Spiel n-mal. Gibt Wahrscheinlichkeiten zurück.
        Läuft in ~0.05 Sekunden dank NumPy-Vektorisierung.
        """
        # Alle Simulationen auf einmal (vektorisiert!)
        home_goals = np.random.poisson(lambda_home, size=self.n)
        away_goals = np.random.poisson(lambda_away, size=self.n)
        
        home_win_prob = float(np.mean(home_goals > away_goals))
        draw_prob     = float(np.mean(home_goals == away_goals))
        away_win_prob = float(np.mean(home_goals < away_goals))
        
        # Wahrscheinlichste Spielstände
        scores = {}
        for h, a in zip(home_goals, away_goals):
            key = f"{h}:{a}"
            scores[key] = scores.get(key, 0) + 1
        
        score_probs = {k: v / self.n for k, v in scores.items()}
        most_likely = max(score_probs, key=score_probs.get)
        
        # Konfidenz: Wie sicher ist das Modell?
        max_prob = max(home_win_prob, draw_prob, away_win_prob)
        confidence = self._calculate_confidence(max_prob)
        
        return {
            "home_win":   home_win_prob,
            "draw":       draw_prob,
            "away_win":   away_win_prob,
            "confidence": confidence,
            "confidence_label": self._confidence_label(confidence),
            "most_likely_score": most_likely,
            "most_likely_score_prob": score_probs[most_likely],
            "top_scores": dict(sorted(score_probs.items(), 
                              key=lambda x: x[1], reverse=True)[:10])
        }
    
    def _calculate_confidence(self, max_prob: float) -> float:
        """Konfidenz basiert auf wie eindeutig der Favorit ist."""
        # Normalisiert auf 0-1: 0.33 = keine Ahnung, 1.0 = sicher
        return min(1.0, (max_prob - 0.33) / 0.47)
    
    def _confidence_label(self, confidence: float) -> str:
        if confidence >= 0.7: return "HOCH"
        if confidence >= 0.4: return "MITTEL"
        return "NIEDRIG"
```

---

## 4. Elo-Rating-System

```python
# backend/ml/models/elo_system.py

class EloSystem:
    K_FACTOR = 20        # Anpassungsgeschwindigkeit
    HOME_ADVANTAGE = 100 # Heimvorteil in Elo-Punkten
    
    def expected_score(self, rating_home: float, rating_away: float) -> float:
        """Erwartete Gewinnwahrscheinlichkeit Heimteam."""
        return 1 / (1 + 10 ** ((rating_away - rating_home - self.HOME_ADVANTAGE) / 400))
    
    def update_ratings(self, rating_home: float, rating_away: float,
                       home_goals: int, away_goals: int) -> tuple:
        """Aktualisiert beide Team-Ratings nach einem Spiel."""
        if home_goals > away_goals:   actual = 1.0
        elif home_goals == away_goals: actual = 0.5
        else:                          actual = 0.0
        
        expected = self.expected_score(rating_home, rating_away)
        
        new_home = rating_home + self.K_FACTOR * (actual - expected)
        new_away = rating_away + self.K_FACTOR * ((1 - actual) - (1 - expected))
        
        return new_home, new_away
```

---

## 5. Kelly-Kriterium

```python
# backend/ml/models/kelly.py

def kelly_criterion(our_probability: float, bookmaker_odds: float,
                    bankroll: float, fraction: float = 0.5) -> dict:
    """
    Berechnet optimalen Einsatz.
    
    Args:
        fraction: 0.5 = Half-Kelly (empfohlen), 1.0 = Full Kelly
    """
    b = bookmaker_odds - 1  # Nettogewinn pro 1€
    p = our_probability
    q = 1 - p
    
    kelly_f = (b * p - q) / b
    
    if kelly_f <= 0:
        return {"stake": 0, "reason": "Kein Vorteil gegenüber Bookmaker"}
    
    recommended_stake = bankroll * kelly_f * fraction
    
    return {
        "kelly_fraction":     kelly_f,
        "recommended_stake":  round(recommended_stake, 2),
        "potential_profit":   round(recommended_stake * b, 2),
        "edge_percent":       round((our_probability - (1/bookmaker_odds)) * 100, 1),
        "is_value_bet":       our_probability > (1 / bookmaker_odds)
    }
```

---

## 6. Expected Goals (xG) Aggregation

```python
# backend/ml/features/xg_calculator.py

def get_team_xg_stats(team_id: str, last_n_games: int = 5) -> dict:
    """Holt xG-Statistiken aus der Datenbank."""
    # Aus PostgreSQL: Letzten N Heimspiele + N Auswärtsspiele
    return {
        "xg_for":         2.1,   # Durchschnitt xG erzeugt
        "xg_against":     0.9,   # Durchschnitt xG zugelassen
        "xg_difference":  1.2,   # xGF - xGA
        "xg_trend":       "up",  # Steigend/fallend
        "npxg_for":       1.9,   # Non-Penalty xG
    }
```

---

## Modell-Gewichtung im Ensemble

| Modell | Gewichtung | Begründung |
|---|---|---|
| XGBoost ML | 50% | Lernt aus 10 Jahren Daten |
| Dixon-Coles | 30% | Bewährt für Bundesliga |
| Elo-Kalibrierung | 20% | Stabilisiert Extreme |
| Monte Carlo | - | Generiert Wahrscheinlichkeiten aus Ensemble |
