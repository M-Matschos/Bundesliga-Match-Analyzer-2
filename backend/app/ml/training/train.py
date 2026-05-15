"""Training script for ML models.

Trains Poisson, Dixon-Coles, Elo, and backtests performance.
"""

import asyncio
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np

from app.core.config import settings
from app.core.db import async_session_maker
from app.models.db import Match
from app.ml.models.poisson_model import PoissonModel
from app.ml.models.dixon_coles import DixonColesModel
from app.ml.models.elo_system import EloSystem
from sqlalchemy import select


class ModelTrainer:
    """Orchestrates training of all prediction models."""

    def __init__(self, model_dir: str = "backend/ml/models/trained"):
        """Initialize trainer.

        Args:
            model_dir: Directory to save trained models
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

        self.poisson = PoissonModel()
        self.dixon_coles = DixonColesModel()
        self.elo = EloSystem()

        self.metrics = {
            "poisson": {},
            "dixon_coles": {},
            "elo": {},
            "ensemble": {},
        }

    async def fetch_historical_matches(
        self,
        years: int = 10,
        min_date: datetime = None,
    ) -> List[Dict]:
        """Fetch historical matches from database.

        Args:
            years: Years of history to fetch
            min_date: Optional minimum date

        Returns:
            List of match dicts
        """
        if min_date is None:
            min_date = datetime.utcnow() - timedelta(days=365 * years)

        async with async_session_maker() as session:
            query = (
                select(Match)
                .where((Match.kickoff >= min_date) & (Match.status == "finished"))
                .order_by(Match.kickoff.asc())
            )

            result = await session.execute(query)
            matches_orm = result.scalars().all()

        # Convert ORM to dicts
        matches = []
        for m in matches_orm:
            matches.append(
                {
                    "id": str(m.id),
                    "home_team": m.home_team_id,
                    "away_team": m.away_team_id,
                    "home_goals": m.home_score or 0,
                    "away_goals": m.away_score or 0,
                    "date": m.kickoff,
                    "league": m.league_id,
                    "season": m.season,
                }
            )

        return matches

    async def train(self, years: int = 10) -> Dict:
        """Train all models on historical data.

        Args:
            years: Years of historical data to use

        Returns:
            Training metrics
        """
        print(f"🔄 Fetching {years} years of historical matches...")
        matches = await self.fetch_historical_matches(years=years)
        print(f"✅ Loaded {len(matches)} finished matches")

        if len(matches) < 100:
            print("⚠️ Warning: Less than 100 matches, training may be unreliable")

        # Split into train and test
        train_size = int(0.8 * len(matches))
        train_matches = matches[:train_size]
        test_matches = matches[train_size:]

        print(f"\n📊 Train set: {len(train_matches)} matches")
        print(f"📊 Test set: {len(test_matches)} matches")

        # Train Poisson
        print("\n🎯 Training Poisson model...")
        poisson_result = self.poisson.fit(train_matches)
        print(f"   Loss: {poisson_result['final_loss']:.4f}")
        self.metrics["poisson"]["train_loss"] = poisson_result["final_loss"]

        # Train Dixon-Coles
        print("🎯 Training Dixon-Coles model...")
        dc_result = self.dixon_coles.fit(train_matches)
        print(f"   Loss: {dc_result['final_loss']:.4f}")
        self.metrics["dixon_coles"]["train_loss"] = dc_result["final_loss"]

        # Train Elo
        print("🎯 Training Elo system...")
        self.elo.batch_update(train_matches)
        ratings_dist = self.elo.get_rating_distribution()
        print(f"   Mean rating: {ratings_dist['mean']:.1f}")
        self.metrics["elo"]["mean_rating"] = ratings_dist["mean"]

        # Evaluate on test set
        print("\n🧪 Evaluating on test set...")
        self._evaluate_test_set(test_matches)

        # Backtest
        print("\n📈 Running backtest...")
        self._backtest(matches)

        return self.metrics

    def _evaluate_test_set(self, matches: List[Dict]) -> None:
        """Evaluate models on test set.

        Calculates accuracy (% of correct outcome predictions).
        """
        poisson_correct = 0
        dc_correct = 0
        elo_correct = 0

        for match in matches:
            home = match["home_team"]
            away = match["away_team"]
            h_goals = match["home_goals"]
            a_goals = match["away_goals"]

            # Determine actual outcome
            if h_goals > a_goals:
                actual = "home_win"
            elif h_goals < a_goals:
                actual = "away_win"
            else:
                actual = "draw"

            # Poisson prediction
            poisson_pred = self.poisson.predict(home, away)
            p_outcome = self._get_most_likely_outcome(poisson_pred)
            if p_outcome == actual:
                poisson_correct += 1

            # Dixon-Coles prediction
            dc_pred = self.dixon_coles.predict(home, away)
            dc_outcome = self._get_most_likely_outcome(dc_pred)
            if dc_outcome == actual:
                dc_correct += 1

            # Elo prediction
            elo_pred = self.elo.predict(home, away)
            elo_outcome = self._get_most_likely_outcome(elo_pred)
            if elo_outcome == actual:
                elo_correct += 1

        total = len(matches)
        self.metrics["poisson"]["accuracy"] = poisson_correct / total
        self.metrics["dixon_coles"]["accuracy"] = dc_correct / total
        self.metrics["elo"]["accuracy"] = elo_correct / total

        print(
            f"   Poisson accuracy: {poisson_correct}/{total} ({self.metrics['poisson']['accuracy']:.2%})"
        )
        print(
            f"   Dixon-Coles accuracy: {dc_correct}/{total} ({self.metrics['dixon_coles']['accuracy']:.2%})"
        )
        print(
            f"   Elo accuracy: {elo_correct}/{total} ({self.metrics['elo']['accuracy']:.2%})"
        )

    def _backtest(self, matches: List[Dict]) -> None:
        """Backtest betting strategy using models.

        Uses Kelly Criterion for bet sizing.
        """
        from app.ml.models.kelly import KellyCriterion

        kelly = KellyCriterion(bankroll=10000.0, kelly_fraction=0.25)

        # Hypothetical betting: try to find value bets
        bets = []
        for match in matches:
            home = match["home_team"]
            away = match["away_team"]

            # Get predictions
            dc_pred = self.dixon_coles.predict(home, away)
            elo_pred = self.elo.predict(home, away)

            # Average predictions
            avg_home_prob = (dc_pred["home_win_prob"] + elo_pred["home_win_prob"]) / 2
            avg_draw_prob = (dc_pred["draw_prob"] + elo_pred["draw_prob"]) / 2
            avg_away_prob = (dc_pred["away_win_prob"] + elo_pred["away_win_prob"]) / 2

            # Hypothetical market odds (using fair odds with 5% margin)
            home_fair_odds = 1 / avg_home_prob if avg_home_prob > 0 else 100
            draw_fair_odds = 1 / avg_draw_prob if avg_draw_prob > 0 else 100
            away_fair_odds = 1 / avg_away_prob if avg_away_prob > 0 else 100

            # Apply 5% margin
            home_market = home_fair_odds * 1.05
            draw_market = draw_fair_odds * 1.05
            away_market = away_fair_odds * 1.05

            # Actual result
            h_goals = match["home_goals"]
            a_goals = match["away_goals"]

            if h_goals > a_goals:
                actual = 1  # Home win
                bet_result = 1
                bet_odds = home_market
                bet_prob = avg_home_prob
            elif h_goals < a_goals:
                actual = 0  # Away win
                bet_result = 0
                bet_odds = away_market
                bet_prob = avg_away_prob
            else:
                actual = 0.5  # Draw
                bet_result = 0
                bet_odds = draw_market
                bet_prob = avg_draw_prob

            # Only track home/away bets for simplicity
            if actual != 0.5:
                bets.append(
                    {
                        "our_probability": bet_prob,
                        "market_odds": bet_odds,
                        "result": bet_result,
                    }
                )

        # Run simulation
        if bets:
            perf = kelly.simulate_betting(bets, starting_bankroll=10000.0)
            self.metrics["ensemble"]["backtest"] = {
                "final_bankroll": perf["final_bankroll"],
                "roi": perf["roi"],
                "win_rate": perf["win_rate"],
                "sharpe_ratio": perf["sharpe_ratio"],
            }
            print(f"   Final bankroll: ${perf['final_bankroll']:.2f}")
            print(f"   ROI: {perf['roi']:.2%}")
            print(f"   Win rate: {perf['win_rate']:.2%}")
            print(f"   Sharpe ratio: {perf['sharpe_ratio']:.2f}")

    def _get_most_likely_outcome(self, pred: Dict) -> str:
        """Get most likely outcome from probabilities."""
        home = pred["home_win_prob"]
        draw = pred["draw_prob"]
        away = pred["away_win_prob"]

        probs = {"home_win": home, "draw": draw, "away_win": away}
        return max(probs, key=probs.get)

    def save(self) -> None:
        """Save all trained models to disk."""
        self.poisson.save(str(self.model_dir / "poisson_model.pkl"))
        self.dixon_coles.save(str(self.model_dir / "dixon_coles_model.pkl"))
        self.elo.save(str(self.model_dir / "elo_system.pkl"))

        # Save metrics
        with open(self.model_dir / "metrics.json", "w") as f:
            json.dump(self.metrics, f, indent=2, default=str)

        print(f"\n✅ Models saved to {self.model_dir}/")


async def main():
    """Train all models."""
    trainer = ModelTrainer()

    # Train on 10 years of data
    metrics = await trainer.train(years=10)

    # Save models
    trainer.save()

    print("\n🎉 Training complete!")
    print(json.dumps(metrics, indent=2, default=str))


if __name__ == "__main__":
    asyncio.run(main())
