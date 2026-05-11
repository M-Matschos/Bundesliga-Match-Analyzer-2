"""
Monte Carlo Simulator for match outcome prediction.

Uses Poisson-distributed goal simulations to estimate
win/draw/loss probabilities for a given match.
"""

from __future__ import annotations

import logging
from typing import Dict, Any

import numpy as np

logger = logging.getLogger(__name__)


class MonteCarloSimulator:
    """Poisson Monte Carlo match simulator.

    Args:
        n_simulations: Number of simulated matches per prediction.
                       Higher values give more accurate probabilities
                       at the cost of compute time.
    """

    def __init__(self, n_simulations: int = 100_000) -> None:
        self.n_simulations = n_simulations

    def simulate(
        self,
        lambda_home: float,
        lambda_away: float,
    ) -> Dict[str, Any]:
        """Simulate n_simulations matches and return outcome probabilities.

        Args:
            lambda_home: Expected goals for the home team (Poisson rate).
            lambda_away: Expected goals for the away team (Poisson rate).

        Returns:
            Dict with keys:
                home_win, draw, away_win  — probabilities (0–1)
                confidence                — max(home_win, draw, away_win)
                expected_goals_home       — lambda_home
                expected_goals_away       — lambda_away
                most_likely_score         — mode score as "H-A" string
                home_win_prob             — alias for home_win (backend canonical name)
                draw_prob                 — alias for draw
                away_win_prob             — alias for away_win
        """
        rng = np.random.default_rng()

        home_goals = rng.poisson(lam=max(lambda_home, 0.01), size=self.n_simulations)
        away_goals = rng.poisson(lam=max(lambda_away, 0.01), size=self.n_simulations)

        home_wins = int(np.sum(home_goals > away_goals))
        draws = int(np.sum(home_goals == away_goals))
        away_wins = int(np.sum(home_goals < away_goals))
        total = self.n_simulations

        home_win_prob = home_wins / total
        draw_prob = draws / total
        away_win_prob = away_wins / total
        confidence = max(home_win_prob, draw_prob, away_win_prob)

        # Most likely score: mode of (home_goals, away_goals) pairs
        pairs, counts = np.unique(
            np.stack([home_goals, away_goals], axis=1), axis=0, return_counts=True
        )
        most_likely_idx = int(np.argmax(counts))
        h, a = int(pairs[most_likely_idx][0]), int(pairs[most_likely_idx][1])
        most_likely_score = f"{h}-{a}"

        return {
            # Mobile-compatible names
            "home_win": round(home_win_prob, 4),
            "draw": round(draw_prob, 4),
            "away_win": round(away_win_prob, 4),
            # Canonical backend names
            "home_win_prob": round(home_win_prob, 4),
            "draw_prob": round(draw_prob, 4),
            "away_win_prob": round(away_win_prob, 4),
            "confidence": round(confidence, 4),
            "expected_goals_home": round(float(lambda_home), 3),
            "expected_goals_away": round(float(lambda_away), 3),
            "most_likely_score": most_likely_score,
        }
