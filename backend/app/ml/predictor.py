"""Ensemble predictor combining all models."""

from pathlib import Path
from typing import Dict, Optional
import json
import logging

from app.ml.models.poisson_model import PoissonModel
from app.ml.models.dixon_coles import DixonColesModel
from app.ml.models.elo_system import EloSystem
from app.ml.models.kelly import KellyCriterion

logger = logging.getLogger(__name__)


class EnsemblePredictor:
    """Ensemble prediction combining Poisson, Dixon-Coles, and Elo."""

    def __init__(self, model_dir: str = "backend/ml/models/trained"):
        """Initialize ensemble predictor.

        Args:
            model_dir: Directory containing trained models
        """
        self.model_dir = Path(model_dir)
        self.poisson = PoissonModel()
        self.dixon_coles = DixonColesModel()
        self.elo = EloSystem()
        self.kelly = KellyCriterion()
        self.is_loaded = False

        self.model_weights = {
            "poisson": 0.25,
            "dixon_coles": 0.45,  # Weighted higher due to low-score adjustment
            "elo": 0.30,
        }

    def load_models(self) -> bool:
        """Load trained models from disk.

        Returns:
            True if all models loaded successfully
        """
        try:
            self.poisson.load(str(self.model_dir / "poisson_model.pkl"))
            logger.info("✅ Loaded Poisson model")
        except Exception as e:
            logger.warning(f"⚠️ Poisson model not found: {e}")

        try:
            self.dixon_coles.load(str(self.model_dir / "dixon_coles_model.pkl"))
            logger.info("✅ Loaded Dixon-Coles model")
        except Exception as e:
            logger.warning(f"⚠️ Dixon-Coles model not found: {e}")

        try:
            self.elo.load(str(self.model_dir / "elo_system.pkl"))
            logger.info("✅ Loaded Elo system")
        except Exception as e:
            logger.warning(f"⚠️ Elo system not found: {e}")

        self.is_loaded = (
            self.poisson.is_fitted or
            self.dixon_coles.is_fitted or
            bool(self.elo.team_ratings)
        )

        return self.is_loaded

    def predict(
        self,
        home_team: str,
        away_team: str,
        market_odds: Optional[Dict[str, float]] = None,
    ) -> Dict:
        """Predict match outcome using ensemble.

        Args:
            home_team: Home team ID
            away_team: Away team ID
            market_odds: Optional market odds dict with keys:
                - home_win, draw, away_win

        Returns:
            Ensemble prediction with all models' output
        """
        if not self.is_loaded:
            self.load_models()

        predictions = {}
        weights = []

        # Get individual model predictions
        if self.poisson.is_fitted:
            poisson_pred = self.poisson.predict(home_team, away_team)
            predictions["poisson"] = poisson_pred
            weights.append(self.model_weights["poisson"])
        else:
            weights.append(0)

        if self.dixon_coles.is_fitted:
            dc_pred = self.dixon_coles.predict(home_team, away_team)
            predictions["dixon_coles"] = dc_pred
            weights.append(self.model_weights["dixon_coles"])
        else:
            weights.append(0)

        if self.elo.team_ratings:
            elo_pred = self.elo.predict(home_team, away_team)
            predictions["elo"] = elo_pred
            weights.append(self.model_weights["elo"])
        else:
            weights.append(0)

        # Normalize weights
        total_weight = sum(weights)
        if total_weight == 0:
            # Fallback to reasonable defaults if no models loaded
            return {
                "home_win_prob": 0.45,
                "draw_prob": 0.30,
                "away_win_prob": 0.25,
                "confidence": 0.45,
                "most_likely_outcome": "home_win",
                "expected_goals_home": 1.5,
                "expected_goals_away": 1.0,
                "individual_predictions": predictions,
                "model_weights": {
                    "poisson": 0.0,
                    "dixon_coles": 0.0,
                    "elo": 0.0,
                },
                "value_bets": None,
            }

        normalized_weights = [w / total_weight for w in weights]

        # Weighted ensemble
        ensemble_home = 0.0
        ensemble_draw = 0.0
        ensemble_away = 0.0

        if "poisson" in predictions:
            ensemble_home += predictions["poisson"]["home_win_prob"] * normalized_weights[0]
            ensemble_draw += predictions["poisson"]["draw_prob"] * normalized_weights[0]
            ensemble_away += predictions["poisson"]["away_win_prob"] * normalized_weights[0]

        if "dixon_coles" in predictions:
            ensemble_home += predictions["dixon_coles"]["home_win_prob"] * normalized_weights[1]
            ensemble_draw += predictions["dixon_coles"]["draw_prob"] * normalized_weights[1]
            ensemble_away += predictions["dixon_coles"]["away_win_prob"] * normalized_weights[1]

        if "elo" in predictions:
            ensemble_home += predictions["elo"]["home_win_prob"] * normalized_weights[2]
            ensemble_draw += predictions["elo"]["draw_prob"] * normalized_weights[2]
            ensemble_away += predictions["elo"]["away_win_prob"] * normalized_weights[2]

        # Ensure probabilities sum to 1
        total_prob = ensemble_home + ensemble_draw + ensemble_away
        if total_prob > 0:
            ensemble_home /= total_prob
            ensemble_draw /= total_prob
            ensemble_away /= total_prob
        else:
            # Fallback if all probs are 0
            ensemble_home = 0.45
            ensemble_draw = 0.30
            ensemble_away = 0.25

        # Calculate confidence (highest probability)
        confidence = max(ensemble_home, ensemble_draw, ensemble_away)

        # Determine most likely outcome
        outcomes = {
            "home_win": ensemble_home,
            "draw": ensemble_draw,
            "away_win": ensemble_away,
        }
        most_likely_outcome = max(outcomes, key=outcomes.get)

        # Expected goals (average from models)
        expected_goals_home = 0.0
        expected_goals_away = 0.0
        xg_count = 0

        for pred in predictions.values():
            if "expected_goals_home" in pred:
                expected_goals_home += pred["expected_goals_home"]
                expected_goals_away += pred["expected_goals_away"]
                xg_count += 1

        if xg_count > 0:
            expected_goals_home /= xg_count
            expected_goals_away /= xg_count

        # Value bet detection if market odds provided
        value_bets = None
        if market_odds:
            value_bets = self._detect_value_bets(
                ensemble_home,
                ensemble_draw,
                ensemble_away,
                market_odds,
            )

        return {
            "home_win_prob": float(ensemble_home),
            "draw_prob": float(ensemble_draw),
            "away_win_prob": float(ensemble_away),
            "confidence": float(confidence),
            "most_likely_outcome": most_likely_outcome,
            "expected_goals_home": float(expected_goals_home),
            "expected_goals_away": float(expected_goals_away),
            "individual_predictions": predictions,
            "model_weights": {
                "poisson": float(normalized_weights[0]) if "poisson" in predictions else 0,
                "dixon_coles": float(normalized_weights[1]) if "dixon_coles" in predictions else 0,
                "elo": float(normalized_weights[2]) if "elo" in predictions else 0,
            },
            "value_bets": value_bets,
        }

    def _detect_value_bets(
        self,
        home_prob: float,
        draw_prob: float,
        away_prob: float,
        market_odds: Dict[str, float],
    ) -> Dict:
        """Detect value bets based on model vs market.

        Args:
            home_prob: Model home win probability
            draw_prob: Model draw probability
            away_prob: Model away win probability
            market_odds: Market odds dict with keys: home_win, draw, away_win

        Returns:
            Value bets dict
        """
        value_bets = {
            "home_win": None,
            "draw": None,
            "away_win": None,
        }

        # Check home win value
        if "home_win" in market_odds:
            market_home_prob = 1 / market_odds["home_win"]
            edge = home_prob - market_home_prob
            if edge > 0.05:  # 5% minimum edge
                value_bets["home_win"] = {
                    "our_probability": home_prob,
                    "market_probability": market_home_prob,
                    "edge": edge,
                    "kelly_stake": self.kelly.calculate_bet_size(
                        home_prob,
                        market_odds["home_win"],
                    )["bet_size"],
                }

        # Check draw value
        if "draw" in market_odds:
            market_draw_prob = 1 / market_odds["draw"]
            edge = draw_prob - market_draw_prob
            if edge > 0.05:
                value_bets["draw"] = {
                    "our_probability": draw_prob,
                    "market_probability": market_draw_prob,
                    "edge": edge,
                    "kelly_stake": self.kelly.calculate_bet_size(
                        draw_prob,
                        market_odds["draw"],
                    )["bet_size"],
                }

        # Check away win value
        if "away_win" in market_odds:
            market_away_prob = 1 / market_odds["away_win"]
            edge = away_prob - market_away_prob
            if edge > 0.05:
                value_bets["away_win"] = {
                    "our_probability": away_prob,
                    "market_probability": market_away_prob,
                    "edge": edge,
                    "kelly_stake": self.kelly.calculate_bet_size(
                        away_prob,
                        market_odds["away_win"],
                    )["bet_size"],
                }

        # Remove None entries
        value_bets = {k: v for k, v in value_bets.items() if v is not None}

        return value_bets if value_bets else None
