"""Elo Rating System for team strength tracking.

Updates team ratings after each match result.
"""

from typing import Dict, List, Tuple
import joblib


class EloSystem:
    """Elo rating system for football teams."""

    def __init__(self, k_factor: float = 32.0, initial_rating: float = 1500.0):
        """Initialize Elo system.

        Args:
            k_factor: Rating change sensitivity (default 32 for standard Elo)
            initial_rating: Starting rating for new teams
        """
        self.k_factor = k_factor
        self.initial_rating = initial_rating
        self.team_ratings: Dict[str, float] = {}

    def get_rating(self, team: str) -> float:
        """Get current Elo rating for a team."""
        return self.team_ratings.get(team, self.initial_rating)

    def predict(self, home_team: str, away_team: str) -> Dict[str, float]:
        """Predict match outcome probabilities based on Elo ratings.

        Uses logistic function to convert rating difference to probability.

        Args:
            home_team: Home team ID
            away_team: Away team ID

        Returns:
            Dict with home_win_prob, draw_prob, away_win_prob
        """
        home_elo = self.get_rating(home_team)
        away_elo = self.get_rating(away_team)

        # Rating difference
        rating_diff = home_elo - away_elo

        # Expected scores (logistic function)
        expected_home = 1 / (1 + 10 ** (-rating_diff / 400))
        expected_away = 1 - expected_home

        # Approximate draw probability (draws are common in football)
        # Empirically, draws occur ~25-30% of the time in football
        draw_prob = 0.25
        home_win_prob = (1 - draw_prob) * expected_home
        away_win_prob = (1 - draw_prob) * expected_away

        return {
            "home_win_prob": home_win_prob,
            "draw_prob": draw_prob,
            "away_win_prob": away_win_prob,
            "home_elo": home_elo,
            "away_elo": away_elo,
            "rating_diff": rating_diff,
        }

    def update(
        self,
        home_team: str,
        away_team: str,
        home_goals: int,
        away_goals: int,
    ) -> Tuple[float, float]:
        """Update Elo ratings after a match.

        Args:
            home_team: Home team ID
            away_team: Away team ID
            home_goals: Home team goals
            away_goals: Away team goals

        Returns:
            Tuple of (new_home_rating, new_away_rating)
        """
        home_elo = self.get_rating(home_team)
        away_elo = self.get_rating(away_team)

        # Expected scores
        expected_home = 1 / (1 + 10 ** (-(home_elo - away_elo) / 400))
        expected_away = 1 - expected_home

        # Match result (1=win, 0.5=draw, 0=loss)
        if home_goals > away_goals:
            home_result = 1.0
            away_result = 0.0
        elif home_goals < away_goals:
            home_result = 0.0
            away_result = 1.0
        else:
            home_result = 0.5
            away_result = 0.5

        # Goal difference factor (rewards decisive victories)
        goal_diff = abs(home_goals - away_goals)
        goal_factor = 1 + 0.1 * min(goal_diff, 3)  # Cap at 3-goal difference

        # Update ratings
        new_home_elo = home_elo + self.k_factor * goal_factor * (home_result - expected_home)
        new_away_elo = away_elo + self.k_factor * goal_factor * (away_result - expected_away)

        self.team_ratings[home_team] = new_home_elo
        self.team_ratings[away_team] = new_away_elo

        return (new_home_elo, new_away_elo)

    def batch_update(self, matches: List[Dict]) -> Dict[str, float]:
        """Update ratings for multiple matches in chronological order.

        Args:
            matches: List of dicts with keys:
                - home_team, away_team, home_goals, away_goals

        Returns:
            Final team ratings
        """
        for match in matches:
            self.update(
                match["home_team"],
                match["away_team"],
                match["home_goals"],
                match["away_goals"],
            )

        return self.team_ratings.copy()

    def reset_team(self, team: str) -> None:
        """Reset team rating to initial value."""
        self.team_ratings[team] = self.initial_rating

    def get_rankings(self) -> List[Tuple[str, float]]:
        """Get teams ranked by Elo rating.

        Returns:
            List of (team_id, rating) sorted by rating (descending)
        """
        return sorted(self.team_ratings.items(), key=lambda x: x[1], reverse=True)

    def get_rating_distribution(self) -> Dict[str, float]:
        """Get mean and std of team ratings."""
        if not self.team_ratings:
            return {"mean": 0, "std": 0, "min": 0, "max": 0}

        import numpy as np
        ratings = list(self.team_ratings.values())
        return {
            "mean": float(np.mean(ratings)),
            "std": float(np.std(ratings)),
            "min": float(np.min(ratings)),
            "max": float(np.max(ratings)),
        }

    def save(self, filepath: str) -> None:
        """Save system to disk."""
        joblib.dump({
            "team_ratings": self.team_ratings,
            "k_factor": self.k_factor,
            "initial_rating": self.initial_rating,
        }, filepath)

    def load(self, filepath: str) -> None:
        """Load system from disk."""
        data = joblib.load(filepath)
        self.team_ratings = data["team_ratings"]
        self.k_factor = data["k_factor"]
        self.initial_rating = data["initial_rating"]
