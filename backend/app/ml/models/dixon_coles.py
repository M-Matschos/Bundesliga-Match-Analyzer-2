"""Dixon-Coles Model for match prediction.

Extends Poisson regression with dependency structure for low-scoring matches.
Addresses the underestimation of 0:0, 1:0, 0:1, 1:1 outcomes.
"""

import numpy as np
from scipy.optimize import minimize
from scipy.stats import poisson
from typing import Dict, List, Optional
import joblib
from datetime import datetime


class DixonColesModel:
    """Dixon-Coles model with dependency adjustment for low scores."""

    def __init__(self, decay_factor: float = 0.998):
        """Initialize Dixon-Coles model.

        Args:
            decay_factor: Exponential decay for historical matches
        """
        self.decay_factor = decay_factor
        self.team_params: Dict[str, Dict[str, float]] = {}
        self.home_advantage = 0.3
        self.rho = -0.05  # Correlation parameter (typically negative)
        self.is_fitted = False

    def fit(
        self,
        matches: List[Dict],
        max_iterations: int = 150,
    ) -> Dict[str, float]:
        """Fit Dixon-Coles parameters to historical data.

        Args:
            matches: List of dicts with keys:
                - home_team, away_team, home_goals, away_goals, date

        Returns:
            Optimization result
        """
        teams = set()
        for match in matches:
            teams.add(match["home_team"])
            teams.add(match["away_team"])

        for team in teams:
            self.team_params[team] = {"attack": 1.0, "defense": 1.0}

        # Weighted data (exponential decay)
        now = datetime.utcnow()
        weights = []
        for match in matches:
            days_ago = (now - match["date"]).days
            weight = self.decay_factor ** (days_ago / 365.0)
            weights.append(weight)
        weights = np.array(weights)

        # Optimize
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
            "rho": self.rho,
        }

    def predict(
        self,
        home_team: str,
        away_team: str,
        home_advantage: Optional[float] = None,
    ) -> Dict[str, float]:
        """Predict match probabilities with Dixon-Coles adjustment.

        Args:
            home_team: Home team ID
            away_team: Away team ID
            home_advantage: Optional override for home advantage

        Returns:
            Dict with adjusted probabilities
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")

        ha = home_advantage or self.home_advantage

        # Get team parameters
        home_attack = self.team_params.get(home_team, {}).get("attack", 1.0)
        home_defense = self.team_params.get(home_team, {}).get("defense", 1.0)
        away_attack = self.team_params.get(away_team, {}).get("attack", 1.0)
        away_defense = self.team_params.get(away_team, {}).get("defense", 1.0)

        lambda_home = home_attack * away_defense * np.exp(ha)
        lambda_away = away_attack * home_defense

        # Dixon-Coles adjusted probabilities
        max_goals = 5
        prob_matrix = np.zeros((max_goals + 1, max_goals + 1))

        for h_goals in range(max_goals + 1):
            for a_goals in range(max_goals + 1):
                # Base Poisson probabilities
                prob_h = poisson.pmf(h_goals, lambda_home)
                prob_a = poisson.pmf(a_goals, lambda_away)

                # Dixon-Coles adjustment function
                tau = self._tau(h_goals, a_goals, lambda_home, lambda_away)

                prob_matrix[h_goals, a_goals] = tau * prob_h * prob_a

        # Normalize
        prob_matrix = prob_matrix / prob_matrix.sum()

        # Outcome probabilities
        home_win = np.triu(prob_matrix, k=1).sum()
        draw = np.trace(prob_matrix)
        away_win = np.tril(prob_matrix, k=-1).sum()

        # Most likely score
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

    def _tau(self, h: int, a: int, lambda_h: float, lambda_a: float) -> float:
        """Dixon-Coles adjustment function for low-scoring matches.

        Adjusts probabilities for 0:0, 1:0, 0:1, 1:1 outcomes.

        Args:
            h: Home goals
            a: Away goals
            lambda_h: Expected home goals
            lambda_a: Expected away goals

        Returns:
            Adjustment factor (typically 0.8-1.2 for low scores)
        """
        if (h == 0 and a == 0) or (h == 1 and a == 1):
            return 1.0 + self.rho * lambda_h * lambda_a
        elif (h == 0 and a == 1) or (h == 1 and a == 0):
            return 1.0 - self.rho * lambda_h * lambda_a
        else:
            return 1.0

    def _negative_log_likelihood(
        self,
        params: np.ndarray,
        matches: List[Dict],
        weights: np.ndarray,
    ) -> float:
        """Calculate weighted negative log-likelihood."""
        self._vector_to_params(params)

        nll = 0.0
        for match, weight in zip(matches, weights):
            home_team = match["home_team"]
            away_team = match["away_team"]
            h_goals = match["home_goals"]
            a_goals = match["away_goals"]

            home_attack = self.team_params[home_team]["attack"]
            home_defense = self.team_params[home_team]["defense"]
            away_attack = self.team_params[away_team]["attack"]
            away_defense = self.team_params[away_team]["defense"]

            lambda_h = home_attack * away_defense * np.exp(self.home_advantage)
            lambda_a = away_attack * home_defense

            # Base Poisson probabilities
            prob_h = poisson.pmf(h_goals, lambda_h)
            prob_a = poisson.pmf(a_goals, lambda_a)

            # Dixon-Coles adjustment
            tau = self._tau(h_goals, a_goals, lambda_h, lambda_a)
            prob = tau * prob_h * prob_a

            # Avoid log(0)
            prob = max(1e-10, prob)
            nll -= weight * np.log(prob)

        return nll

    def _params_to_vector(self) -> np.ndarray:
        """Convert parameters to optimization vector."""
        params = []
        for team in sorted(self.team_params.keys()):
            params.append(self.team_params[team]["attack"])
            params.append(self.team_params[team]["defense"])
        params.append(self.home_advantage)
        params.append(self.rho)
        return np.array(params)

    def _vector_to_params(self, params: np.ndarray) -> None:
        """Convert optimization vector back to parameters."""
        teams = sorted(self.team_params.keys())
        idx = 0
        for team in teams:
            self.team_params[team]["attack"] = max(0.1, params[idx])
            self.team_params[team]["defense"] = max(0.1, params[idx + 1])
            idx += 2
        self.home_advantage = params[-2]
        self.rho = params[-1]  # Typically -0.3 to -0.05

    def save(self, filepath: str) -> None:
        """Save model to disk."""
        joblib.dump(
            {
                "team_params": self.team_params,
                "home_advantage": self.home_advantage,
                "rho": self.rho,
                "decay_factor": self.decay_factor,
            },
            filepath,
        )

    def load(self, filepath: str) -> None:
        """Load model from disk."""
        data = joblib.load(filepath)
        self.team_params = data["team_params"]
        self.home_advantage = data["home_advantage"]
        self.rho = data["rho"]
        self.decay_factor = data["decay_factor"]
        self.is_fitted = True
