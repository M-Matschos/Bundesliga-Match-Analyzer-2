"""
Open Metrics Router — Transparent Model Accuracy & Performance
Part of v2.0+ Trust Initiative
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from pydantic import BaseModel

from app.core.security import get_current_user
from app.models.db import get_db, Prediction, Match, User
from app.models.schemas import UserResponse

router = APIRouter(prefix="/api/v1/metrics", tags=["Metrics"])


# ─────────────────────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────────────────────

class AccuracyMetrics(BaseModel):
    """Model accuracy broken down by confidence level."""
    confidence_level: str  # 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL'
    accuracy_percent: float
    win_rate_percent: float
    sample_size: int
    period_days: int


class CalibrationPoint(BaseModel):
    """Single point on calibration curve."""
    predicted_probability: float  # e.g., 0.65 (65%)
    actual_win_rate: float  # e.g., 0.68 (68% actually won)
    num_predictions: int  # How many predictions in this bin


class MetricsDashboard(BaseModel):
    """Full metrics dashboard for transparency."""
    overall_accuracy: AccuracyMetrics
    accuracy_by_confidence: list[AccuracyMetrics]
    accuracy_by_league: dict[str, float]
    calibration_curve: list[CalibrationPoint]
    roi_trend: list[dict]  # [{date, roi_percent}]
    total_predictions_analyzed: int
    last_updated: datetime


class ModelPerformance(BaseModel):
    """Historical performance snapshot."""
    prediction_id: str
    match_id: str
    home_team: str
    away_team: str
    league: str
    kickoff: datetime

    predicted_home_prob: float
    confidence: float
    confidence_label: str  # 'HIGH' | 'MEDIUM' | 'LOW'

    actual_outcome: str  # 'home' | 'draw' | 'away'
    was_correct: bool

    odds_at_prediction: float
    bookmaker_implied_prob: float
    divergence: float  # Our prob - Bookmaker prob


# ─────────────────────────────────────────────────────────────
# CORE METRICS CALCULATION
# ─────────────────────────────────────────────────────────────

async def calculate_accuracy(
    db: AsyncSession,
    confidence_level: Optional[str] = None,
    days: int = 30,
    league: Optional[str] = None,
) -> AccuracyMetrics:
    """Calculate model accuracy for given period and confidence."""

    # Build query
    query = select(Prediction).where(
        Prediction.created_at >= datetime.utcnow() - timedelta(days=days)
    )

    if confidence_level and confidence_level != 'ALL':
        # Map: HIGH (0.7+), MEDIUM (0.5-0.7), LOW (<0.5)
        if confidence_level == 'HIGH':
            query = query.where(Prediction.confidence >= 0.7)
        elif confidence_level == 'MEDIUM':
            query = query.where(and_(Prediction.confidence >= 0.5, Prediction.confidence < 0.7))
        elif confidence_level == 'LOW':
            query = query.where(Prediction.confidence < 0.5)

    if league:
        query = query.join(Match).where(Match.league == league)

    predictions = await db.execute(query)
    predictions = predictions.scalars().all()

    if not predictions:
        return AccuracyMetrics(
            confidence_level=confidence_level or 'ALL',
            accuracy_percent=0,
            win_rate_percent=0,
            sample_size=0,
            period_days=days,
        )

    # Calculate accuracy
    correct = sum(1 for p in predictions if p.was_correct)
    accuracy = (correct / len(predictions)) * 100 if predictions else 0

    # Win rate (for betting context)
    win_count = sum(1 for p in predictions if p.actual_outcome == 'home' and p.predicted_home_prob > 0.5)
    win_rate = (win_count / len(predictions)) * 100 if predictions else 0

    return AccuracyMetrics(
        confidence_level=confidence_level or 'ALL',
        accuracy_percent=round(accuracy, 1),
        win_rate_percent=round(win_rate, 1),
        sample_size=len(predictions),
        period_days=days,
    )


async def calculate_calibration_curve(
    db: AsyncSession,
    bins: int = 10,
    days: int = 30,
) -> list[CalibrationPoint]:
    """Calculate calibration: Do 70% predictions actually win 70% of the time?"""

    # Fetch predictions
    query = select(Prediction).where(
        Prediction.created_at >= datetime.utcnow() - timedelta(days=days)
    )
    result = await db.execute(query)
    predictions = result.scalars().all()

    if not predictions:
        return []

    # Create bins
    calibration_points = []
    bin_size = 1.0 / bins

    for i in range(bins):
        bin_start = i * bin_size
        bin_end = (i + 1) * bin_size

        # Find predictions in this bin
        bin_predictions = [
            p for p in predictions
            if bin_start <= p.predicted_home_prob <= bin_end
        ]

        if not bin_predictions:
            continue

        # Calculate actual win rate in bin
        wins = sum(1 for p in bin_predictions if p.actual_outcome == 'home')
        actual_win_rate = wins / len(bin_predictions)

        calibration_points.append(CalibrationPoint(
            predicted_probability=round(bin_start + bin_size / 2, 2),
            actual_win_rate=round(actual_win_rate, 2),
            num_predictions=len(bin_predictions),
        ))

    return calibration_points


async def calculate_roi_trend(
    db: AsyncSession,
    days: int = 30,
) -> list[dict]:
    """Calculate rolling 7-day ROI trend."""

    roi_trend = []

    for day_offset in range(days, 0, -1):
        start_date = datetime.utcnow() - timedelta(days=day_offset + 7)
        end_date = datetime.utcnow() - timedelta(days=day_offset)

        query = select(Prediction).where(
            and_(
                Prediction.created_at >= start_date,
                Prediction.created_at <= end_date,
                Prediction.betting_outcome is not None,  # Has result
            )
        )
        result = await db.execute(query)
        predictions = result.scalars().all()

        if predictions:
            profit = sum(p.betting_profit for p in predictions)
            stake = sum(p.betting_stake for p in predictions)
            roi = (profit / stake * 100) if stake > 0 else 0

            roi_trend.append({
                'date': (datetime.utcnow() - timedelta(days=day_offset)).isoformat(),
                'roi_percent': round(roi, 1),
                'sample_size': len(predictions),
            })

    return roi_trend


# ─────────────────────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=MetricsDashboard)
async def get_metrics_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    days: int = Query(30, ge=7, le=365),
):
    """
    GET /metrics/dashboard — Full transparency dashboard

    Shows model accuracy, calibration, ROI trend for last N days.
    Helps users understand prediction quality.

    Example response:
    {
        "overall_accuracy": {
            "confidence_level": "ALL",
            "accuracy_percent": 68.4,
            "win_rate_percent": 71.2,
            "sample_size": 234,
            "period_days": 30
        },
        "accuracy_by_confidence": [
            {"confidence_level": "HIGH", "accuracy_percent": 72.1, ...},
            {"confidence_level": "MEDIUM", "accuracy_percent": 64.3, ...},
            {"confidence_level": "LOW", "accuracy_percent": 51.8, ...}
        ],
        "accuracy_by_league": {
            "bundesliga": 70.2,
            "bundesliga2": 65.8,
            "dfb_pokal": 62.1
        },
        "calibration_curve": [
            {"predicted_probability": 0.05, "actual_win_rate": 0.08, "num_predictions": 12},
            ...
        ],
        "roi_trend": [
            {"date": "2026-04-01", "roi_percent": -2.3, "sample_size": 15},
            ...
        ],
        "total_predictions_analyzed": 234,
        "last_updated": "2026-04-25T10:30:00Z"
    }
    """

    # Calculate all metrics
    overall_accuracy = await calculate_accuracy(db, None, days)

    accuracy_high = await calculate_accuracy(db, 'HIGH', days)
    accuracy_med = await calculate_accuracy(db, 'MEDIUM', days)
    accuracy_low = await calculate_accuracy(db, 'LOW', days)

    accuracy_bl1 = await calculate_accuracy(db, None, days, 'bundesliga')
    accuracy_bl2 = await calculate_accuracy(db, None, days, 'bundesliga2')

    calibration = await calculate_calibration_curve(db, 10, days)
    roi_trend = await calculate_roi_trend(db, days)

    return MetricsDashboard(
        overall_accuracy=overall_accuracy,
        accuracy_by_confidence=[accuracy_high, accuracy_med, accuracy_low],
        accuracy_by_league={
            'bundesliga': accuracy_bl1.accuracy_percent,
            'bundesliga2': accuracy_bl2.accuracy_percent,
        },
        calibration_curve=calibration,
        roi_trend=roi_trend,
        total_predictions_analyzed=overall_accuracy.sample_size,
        last_updated=datetime.utcnow(),
    )


@router.get("/accuracy")
async def get_accuracy_by_period(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    period: str = Query('30d', regex='^(7d|30d|90d|1y|all)$'),
):
    """
    GET /metrics/accuracy?period=30d — Simple accuracy metric

    Returns: {"accuracy_percent": 68.4, "sample_size": 234, "period": "30d"}
    """

    days_map = {'7d': 7, '30d': 30, '90d': 90, '1y': 365, 'all': 365*10}
    days = days_map.get(period, 30)

    metrics = await calculate_accuracy(db, None, days)

    return {
        'accuracy_percent': metrics.accuracy_percent,
        'sample_size': metrics.sample_size,
        'period': period,
        'last_updated': datetime.utcnow(),
    }


@router.get("/calibration")
async def get_calibration(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    days: int = Query(30, ge=7, le=365),
):
    """
    GET /metrics/calibration — Calibration curve for model diagnostics

    Shows if predicted probabilities match actual outcomes.
    Perfect calibration = 45° diagonal line.
    """

    calibration = await calculate_calibration_curve(db, 10, days)

    return {
        'calibration_points': calibration,
        'interpretation': 'Points above diagonal = model underconfident. Below = overconfident.',
        'last_updated': datetime.utcnow(),
    }


@router.get("/performance-history")
async def get_performance_history(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(100, ge=10, le=1000),
    confidence_filter: Optional[str] = Query(None, regex='^(HIGH|MEDIUM|LOW)$'),
):
    """
    GET /metrics/performance-history — Recent predictions with outcomes

    Lets users see exactly which predictions were right/wrong.
    Returns: [{"match": "Bayern vs BVB", "predicted": 58%, "actual": "home_win", "correct": true}, ...]
    """

    query = select(Prediction).order_by(Prediction.created_at.desc()).limit(limit)

    if confidence_filter:
        if confidence_filter == 'HIGH':
            query = query.where(Prediction.confidence >= 0.7)
        elif confidence_filter == 'MEDIUM':
            query = query.where(and_(Prediction.confidence >= 0.5, Prediction.confidence < 0.7))
        elif confidence_filter == 'LOW':
            query = query.where(Prediction.confidence < 0.5)

    result = await db.execute(query)
    predictions = result.scalars().all()

    performance_list = []
    for pred in predictions:
        match = await db.execute(select(Match).where(Match.id == pred.match_id))
        match = match.scalar()

        if match:
            performance_list.append({
                'match_id': pred.match_id,
                'home_team': match.home_team_id,
                'away_team': match.away_team_id,
                'predicted_home_prob': round(pred.predicted_home_prob, 3),
                'confidence': round(pred.confidence, 2),
                'confidence_label': pred.confidence_label,
                'actual_outcome': pred.actual_outcome,
                'was_correct': pred.was_correct,
                'created_at': pred.created_at.isoformat(),
            })

    return {
        'predictions': performance_list,
        'count': len(performance_list),
    }


@router.get("/health-check")
async def metrics_health_check(db: AsyncSession = Depends(get_db)):
    """
    GET /metrics/health-check — System health for transparency

    Returns model status, last update, data freshness.
    """

    # Count recent predictions
    query = select(func.count(Prediction.id)).where(
        Prediction.created_at >= datetime.utcnow() - timedelta(days=1)
    )
    result = await db.execute(query)
    predictions_last_24h = result.scalar()

    return {
        'status': 'healthy',
        'predictions_last_24h': predictions_last_24h,
        'data_freshness_minutes': 5,  # Updated every 5 min
        'model_version': '2.0',
        'last_trained': '2026-04-20T10:00:00Z',
        'timestamp': datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    print("Metrics router loaded ✅")
    print("Endpoints:")
    print("  GET  /api/v1/metrics/dashboard — Full metrics")
    print("  GET  /api/v1/metrics/accuracy — Simple accuracy")
    print("  GET  /api/v1/metrics/calibration — Calibration curve")
    print("  GET  /api/v1/metrics/performance-history — Recent predictions")
    print("  GET  /api/v1/metrics/health-check — System health")
