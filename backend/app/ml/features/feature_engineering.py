"""
Feature engineering for match prediction.

Extracts lambda (expected goals) and SHAP top-3 factors from
a match dict for use by the MonteCarloSimulator.
"""

from __future__ import annotations

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Bundesliga average goals per game (used as fallback)
_DEFAULT_LAMBDA = 1.35


async def build_features(match: Dict[str, Any]) -> Dict[str, Any]:
    """Build prediction features from a match dict.

    Args:
        match: Match dict containing team and league data.

    Returns:
        Feature dict with at minimum:
            lambda_home  -- expected home goals (Poisson rate)
            lambda_away  -- expected away goals (Poisson rate)
            shap_top3    -- list of top-3 SHAP factor dicts
    """
    # Use pre-computed xG values when available
    lambda_home = float(match.get("home_xg") or match.get("xg_home") or 0)
    lambda_away = float(match.get("away_xg") or match.get("xg_away") or 0)

    # Fall back to league average with home advantage when no xG present
    if lambda_home == 0 and lambda_away == 0:
        lambda_home = round(_DEFAULT_LAMBDA * 1.10, 3)   # +10 % home advantage
        lambda_away = round(_DEFAULT_LAMBDA * 0.92, 3)

    logger.debug(
        "build_features match_id=%s lambda_home=%.3f lambda_away=%.3f",
        match.get("id") or match.get("match_id"),
        lambda_home,
        lambda_away,
    )

    return {
        "lambda_home": lambda_home,
        "lambda_away": lambda_away,
        "shap_top3": [],   # TODO: full SHAP integration (P2 task)
    }
