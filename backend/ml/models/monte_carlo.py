"""
Monte Carlo Simulator
Simuliert Fußballspiele 100.000x für präzise Wahrscheinlichkeitsverteilungen.
"""
import numpy as np
from dataclasses import dataclass


@dataclass
class SimulationResult:
    home_win:              float
    draw:                  float
    away_win:              float
    confidence:            float
    confidence_label:      str
    most_likely_score:     str
    most_likely_score_prob: float
    top_scores:            dict
    expected_goals_home:   float
    expected_goals_away:   float
    over_2_5_prob:         float
    btts_prob:             float   # Both Teams To Score


class MonteCarloSimulator:
    def __init__(self, n_simulations: int = 100_000):
        self.n = n_simulations

    def simulate(self, lambda_home: float, lambda_away: float) -> dict:
        """
        Simuliert ein Spiel n-mal mittels Poisson-Ziehungen.
        Vektorisiert mit NumPy — läuft in ~50ms für 100k Simulationen.

        Args:
            lambda_home: Erwartete Tore Heimteam (z.B. 1.8)
            lambda_away: Erwartete Tore Auswärtsteam (z.B. 1.1)

        Returns:
            dict mit allen Wahrscheinlichkeiten
        """
        rng = np.random.default_rng()

        home_goals = rng.poisson(lambda_home, size=self.n)
        away_goals = rng.poisson(lambda_away, size=self.n)

        home_win_prob = float(np.mean(home_goals > away_goals))
        draw_prob     = float(np.mean(home_goals == away_goals))
        away_win_prob = float(np.mean(home_goals < away_goals))

        over_2_5  = float(np.mean((home_goals + away_goals) > 2.5))
        btts      = float(np.mean((home_goals > 0) & (away_goals > 0)))

        # Top-Spielstände berechnen
        score_counts = {}
        for h, a in zip(home_goals.tolist(), away_goals.tolist()):
            key = f"{h}:{a}"
            score_counts[key] = score_counts.get(key, 0) + 1

        score_probs = {k: round(v / self.n, 4) for k, v in score_counts.items()}
        top_scores  = dict(sorted(score_probs.items(), key=lambda x: x[1], reverse=True)[:10])
        most_likely = max(score_probs, key=score_probs.get)

        confidence = self._calculate_confidence(home_win_prob, draw_prob, away_win_prob)

        return {
            "home_win":              round(home_win_prob, 4),
            "draw":                  round(draw_prob, 4),
            "away_win":              round(away_win_prob, 4),
            "confidence":            round(confidence, 4),
            "confidence_label":      self._confidence_label(confidence),
            "most_likely_score":     most_likely,
            "most_likely_score_prob": score_probs[most_likely],
            "top_scores":            top_scores,
            "expected_goals_home":   round(float(np.mean(home_goals)), 2),
            "expected_goals_away":   round(float(np.mean(away_goals)), 2),
            "over_2_5_prob":         round(over_2_5, 4),
            "btts_prob":             round(btts, 4),
        }

    def _calculate_confidence(self, hw: float, d: float, aw: float) -> float:
        """
        Konfidenz: Wie klar ist der Favorit?
        0.33 = komplette Unsicherheit, 1.0 = absolut sicher
        """
        max_prob = max(hw, d, aw)
        # Normalisiert: 0.33 (Gleichverteilung) → 0.0, 0.80 → 1.0
        return max(0.0, min(1.0, (max_prob - 0.33) / 0.47))

    def _confidence_label(self, confidence: float) -> str:
        if confidence >= 0.70: return "HOCH"
        if confidence >= 0.35: return "MITTEL"
        return "NIEDRIG"
