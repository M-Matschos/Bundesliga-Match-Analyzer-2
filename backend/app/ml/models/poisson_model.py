"""Poisson Regression Model for match prediction.

Uses team-specific attack/defense parameters to predict goal distributions.
"""

import numpy as np
from scipy.optimize import minimize
from scipy.stats import poisson
from typing import Dict, Tuple, List, Optional
import joblib
from datetime import datetime


class PoissonModel:
    """Poisson Regression model for predicting match outcomes."""

    def __init__(self, decay_factor: float = 0.998):
        """Initialize Poisson model.

        Args:
            decay_factor: Exponential decay for historical matches (0.998 = -0.2% per day)
        """
        self.decay_factor = decay_factor
        self.team_params: Dict[str, Dict[str, float]] = {}
        self.home_advantage = 0.3
        self.is_fitted = False

    def fit(
        self,
        matches: List[Dict],
        max_iterations: int = 100,
    ) -> Dict[str, float]:
        """Fit Poisson parameters to historical match data.

        Args:
            matches: List of dicts with keys:
                - home_team, away_team, home_goals, away_goals, date
            max_iterations: Max iterations for optimization

        Returns:
            Optimization result with final parameters
        """
        # Initialize team parameters
        teams = set()
        for match in matches:
            teams.add(match["home_team"])
            teams.add(match["away_team"])

        for team in teams:
            self.team_params[team] = {
                "attack": 1.0,
                "defense": 1.0,
            }

        # Prepare weighted data (recent matches weighted higher)
        now = datetime.utcnow()
        weights = []
        for match in matches:
            days_ago = (now - match["date"]).days
            weight = self.decay_factor ** (days_ago / 365.0)
            weights.append(weight)
        weights = np.array(weights)

        # Optimize parameters
        initial_params = self._params_to_vector()
        result = minimize(
            self._negative_log_likelihood,
            initial_params,
            args=(matches, weights),
            method="Nelder-Mead",
            options={"maxiter": max_iterations, "xatol": 1e-4},
        )

        self._vector_to_params(result.x)
        self.is_fitted = True

        return {
            "success": result.success,
            "nfev": result.nfev,
            "final_loss": result.fun,
            "home_advantage": self.home_advantage,
        }

    def predict(
        self,
        home_team: str,
        away_team: str,
        home_advantage: Optional[float] = None,
    ) -> Dict[str, float]:
        """Predict match probabilities using Poisson distribution.

        Args:
            home_team: Home team ID
            away_team: Away team ID
            home_advantage: Optional override for home advantage

        Returns:
            Dict with probabilities and expected goals
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")

        ha = home_advantage or self.home_advantage

        # Get team parameters (default if not in training data)
        home_attack = self.team_params.get(home_team, {}).get("attack", 1.0)
        home_defense = self.team_params.get(home_team, {}).get("defense", 1.0)
        away_attack = self.team_params.get(away_team, {}).get("attack", 1.0)
        away_defense = self.team_params.get(away_team, {}).get("defense", 1.0)

        # Expected goals (lambda parameters for Poisson)
        lambda_home = home_attack * away_defense * np.exp(ha)
        lambda_away = away_attack * home_defense

        # Calculate probabilities for score matrix (0-5 goals each)
        max_goals = 5
        prob_matrix = np.zeros((max_goals + 1, max_goals + 1))

        for h_goals in range(max_goals + 1):
            for a_goals in range(max_goals + 1):
                prob_h = poisson.pmf(h_goals, lambda_home)
                prob_a = poisson.pmf(a_goals, lambda_away)
                prob_matrix[h_goals, a_goals] = prob_h * prob_a

        # Normalize (we cut off at 5 goals, so sum < 1)
        prob_matrix = prob_matrix / prob_matrix.sum()

        # Calculate outcome probabilities
        home_win = np.triu(prob_matrix, k=1).sum()  # home_goals > away_goals
        draw = np.trace(prob_matrix)  # Diagonal
        away_win = np.tril(prob_matrix, k=-1).sum()  # home_goals < away_goals

        # Find most likely score
        max_idx = np.unravel_index(prob_matrix.argmax(), prob_matrix.shape)
        most_likely_score = f"{max_idx[0]}:{max_idx[1]}"

        return {
            "home_win_prob": float(home_win),
            "draw_prob": float(draw),
            "away_win_prob": float(away_win),
            "expected_goals_home": float(lambda_home),
            "expected_goals_away": float(lambda_away),
            "most_likely_score": most_likely_score,
            "prob_matrix": prob_matrix.tolist(),
        }

    def _negative_log_likelihood(
        self,
        params: np.ndarray,
        matches: List[Dict],
        weights: np.ndarray,
    ) -> float:
        """Calculate negative log-likelihood for optimization."""
        self._vector_to_params(params)

        nll = 0.0
        for match, weight in zip(matches, weights):
            home_team = match["home_team"]
            away_team = match["away_team"]
            home_goals = match["home_goals"]
            away_goals = match["away_goals"]

            # Expected goals
            home_attack = self.team_params[home_team]["attack"]
            home_defense = self.team_params[home_team]["defense"]
            away_attack = self.team_params[away_team]["attack"]
            away_defense = self.team_params[away_team]["defense"]

            lambda_h = home_attack * away_defense * np.exp(self.home_advantage)
            lambda_a = away_attack * home_defense

            # Poisson log-likelihood
            ll_h = -lambda_h + home_goals * np.log(lambda_h) - np.log(np.math.factorial(home_goals))
            ll_a = -lambda_a + away_goals * np.log(lambda_a) - np.log(np.math.factorial(away_goals))

            nll -= weight * (ll_h + ll_a)

        return nll

    def _params_to_vector(self) -> np.ndarray:
        """Convert team parameters to optimization vector."""
        params = []
        for team in sorted(self.team_params.keys()):
            params.append(self.team_params[team]["attack"])
            params.append(self.team_params[team]["defense"])
        params.append(self.home_advantage)
        return np.array(params)

    def _vector_to_params(self, params: np.ndarray) -> None:
        """Convert optimization vector back to team parameters."""
        teams = sorted(self.team_params.keys())
        idx = 0
        for team in teams:
            self.team_params[team]["attack"] = max(0.1, params[idx])
            self.team_params[team]["defense"] = max(0.1, params[idx + 1])
            idx += 2
        self.home_advantage = params[-1]

    def get_team_strength(self, team: str) -> Dict[str, float]:
        """Get attack/defense strength for a team."""
        if team not in self.team_params:
            return {"attack": 1.0, "defense": 1.0}
        return self.team_params[team].copy()

    def save(self, filepath: str) -> None:
        """Save model to disk."""
        joblib.dump({
            "team_params": self.team_params,
            "home_advantage": self.home_advantage,
            "decay_factor": self.decay_factor,
        }, filepath)

    def load(self, filepath: str) -> None:
        """Load model from disk."""
        data = joblib.load(filepath)
        self.team_params = data["team_params"]
        self.home_advantage = data["home_advantage"]
        self.decay_factor = data["decay_factor"]
        self.is_fitted = True
