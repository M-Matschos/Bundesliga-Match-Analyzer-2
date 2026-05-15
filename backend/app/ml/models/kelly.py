"""Kelly Criterion for optimal bet sizing.

Maximizes long-term capital growth while managing risk.
"""

from typing import Dict, List, Tuple, Optional
import numpy as np


class KellyCriterion:
    """Kelly Criterion bet sizing calculator."""

    def __init__(
        self,
        bankroll: float = 1000.0,
        kelly_fraction: float = 0.25,
        min_edge: float = 0.05,
    ):
        """Initialize Kelly Criterion calculator.

        Args:
            bankroll: Starting capital
            kelly_fraction: Fraction of Kelly bet (0.25 = 25% of Kelly)
                           Using fraction < 1.0 reduces variance
            min_edge: Minimum edge required to place bet (5%)
        """
        self.bankroll = bankroll
        self.kelly_fraction = kelly_fraction
        self.min_edge = min_edge
        self.betting_history: List[Dict] = []

    def calculate_bet_size(
        self,
        probability: float,
        odds: float,
        current_bankroll: Optional[float] = None,
    ) -> Dict[str, float]:
        """Calculate optimal bet size using Kelly Criterion.

        Kelly: f = (bp - q) / b
        where:
            f = fraction of bankroll to bet
            b = odds - 1 (decimal odds - 1)
            p = probability of winning
            q = probability of losing (1 - p)

        Args:
            probability: Our estimated probability of winning (0-1)
            odds: Decimal odds offered
            current_bankroll: Current bankroll (uses self.bankroll if None)

        Returns:
            Dict with bet size, edge, kelly fraction
        """
        bankroll = current_bankroll or self.bankroll

        # Kelly criterion calculation
        b = odds - 1
        q = 1 - probability

        # Edge (should be positive for profitable bets)
        edge = probability * odds - 1  # Expected value per unit bet

        # Check if edge meets threshold
        if edge < self.min_edge:
            return {
                "bet_size": 0.0,
                "edge": edge,
                "kelly_fraction": 0.0,
                "reason": f"Edge ({edge:.2%}) below minimum ({self.min_edge:.2%})",
            }

        # Avoid division issues and negative kelly
        if b <= 0:
            return {
                "bet_size": 0.0,
                "edge": edge,
                "kelly_fraction": 0.0,
                "reason": "Odds <= 1 (no value)",
            }

        # Full Kelly fraction
        full_kelly = (probability * b - q) / b

        # Safety: cap Kelly at 25% (fractional Kelly)
        kelly_to_use = min(full_kelly, 0.25) * self.kelly_fraction
        kelly_to_use = max(kelly_to_use, 0)  # Ensure non-negative

        # Bet size
        bet_size = bankroll * kelly_to_use

        return {
            "bet_size": bet_size,
            "edge": edge,
            "kelly_fraction": kelly_to_use,
            "full_kelly": full_kelly,
        }

    def calculate_value_bet(
        self,
        our_probability: float,
        market_odds: float,
    ) -> Dict[str, float]:
        """Identify value bets (mispriced odds).

        A value bet occurs when market probability < our probability.

        Args:
            our_probability: Our estimated probability
            market_odds: Market decimal odds

        Returns:
            Dict with value metrics
        """
        market_probability = 1 / market_odds if market_odds > 0 else 0
        value = our_probability - market_probability

        is_value = value > 0.05  # At least 5% edge

        return {
            "our_probability": our_probability,
            "market_probability": market_probability,
            "value": value,
            "is_value": is_value,
            "market_odds": market_odds,
        }

    def simulate_betting(
        self,
        bets: List[Dict],
        starting_bankroll: float = 1000.0,
    ) -> Dict:
        """Simulate betting performance.

        Args:
            bets: List of dicts with keys:
                - our_probability, market_odds, result (0=loss, 1=win)
            starting_bankroll: Starting capital

        Returns:
            Performance statistics
        """
        bankroll = starting_bankroll
        results = []

        for bet in bets:
            calc = self.calculate_bet_size(
                bet["our_probability"],
                bet["market_odds"],
                bankroll,
            )

            bet_size = calc["bet_size"]

            if bet_size == 0:
                results.append({"bet_size": 0, "bankroll": bankroll, "pnl": 0})
                continue

            # Apply result
            if bet["result"] == 1:  # Win
                pnl = bet_size * (bet["market_odds"] - 1)
            else:  # Loss
                pnl = -bet_size

            bankroll += pnl

            results.append(
                {
                    "bet_size": bet_size,
                    "bankroll": bankroll,
                    "pnl": pnl,
                }
            )

        # Calculate statistics
        pnls = [r["pnl"] for r in results]
        wins = sum(1 for p in pnls if p > 0)
        losses = sum(1 for p in pnls if p < 0)

        return {
            "starting_bankroll": starting_bankroll,
            "final_bankroll": bankroll,
            "total_pnl": bankroll - starting_bankroll,
            "roi": (bankroll - starting_bankroll) / starting_bankroll,
            "total_bets": len(bets),
            "winning_bets": wins,
            "losing_bets": losses,
            "win_rate": wins / len(bets) if bets else 0,
            "avg_win": np.mean([p for p in pnls if p > 0]) if wins > 0 else 0,
            "avg_loss": np.mean([p for p in pnls if p < 0]) if losses > 0 else 0,
            "sharpe_ratio": self._calculate_sharpe(pnls),
        }

    def _calculate_sharpe(
        self, returns: List[float], risk_free_rate: float = 0.02
    ) -> float:
        """Calculate Sharpe ratio of betting returns."""
        if len(returns) < 2:
            return 0.0

        returns = np.array(returns)
        excess_returns = returns - risk_free_rate / 252  # Daily risk-free
        if np.std(excess_returns) == 0:
            return 0.0

        return (np.mean(excess_returns) / np.std(excess_returns)) * np.sqrt(252)

    def recommend_stake(
        self,
        our_probability: float,
        market_odds: float,
        confidence: float = 0.5,
    ) -> Dict[str, float]:
        """Recommend stake based on confidence and edge.

        Combines Kelly Criterion with confidence score.

        Args:
            our_probability: Our prediction
            market_odds: Market odds
            confidence: Model confidence (0-1)

        Returns:
            Recommendation with adjusted stake
        """
        # Value check
        value = self.calculate_value_bet(our_probability, market_odds)

        if not value["is_value"]:
            return {
                "recommended_stake": 0.0,
                "reason": "No edge detected",
                "edge": value["value"],
            }

        # Apply confidence discount
        adjusted_prob = (
            our_probability * confidence
            + (1 - confidence) * value["market_probability"]
        )

        # Kelly calculation with adjusted probability
        kelly = self.calculate_bet_size(adjusted_prob, market_odds)

        return {
            "recommended_stake": kelly["bet_size"],
            "edge": value["value"],
            "confidence_adjusted_probability": adjusted_prob,
            "kelly_fraction": kelly["kelly_fraction"],
        }
