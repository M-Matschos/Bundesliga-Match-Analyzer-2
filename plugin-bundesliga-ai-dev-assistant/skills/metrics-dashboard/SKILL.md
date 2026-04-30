---
name: Build Metrics Dashboard
description: Create comprehensive dashboards tracking ROI, Sharpe Ratio, drawdown, win rate, edge detection, and capital efficiency metrics for the Match Oracle system.
---

# Build Metrics Dashboard

Construct dashboards for real-time monitoring of portfolio performance, prediction accuracy, capital allocation efficiency, and model health indicators critical to decision intelligence operations.

## Key Performance Indicators

### Financial Metrics
- **ROI (Return on Investment)**: Cumulative returns vs. capital deployed
- **Sharpe Ratio**: Risk-adjusted returns (target: >1.5)
- **Sortino Ratio**: Downside risk-adjusted returns
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of winning predictions
- **Profit Factor**: Gross profit / gross loss ratio

### Decision Quality Metrics
- **Edge Detection Rate**: Percentage of bets identified with positive expected value
- **Confidence Calibration**: Predicted confidence vs. actual accuracy
- **Kill-Switch Activations**: How often low-confidence scenarios rejected
- **Model Accuracy by Scenario**: Home/away/draw/O/U/BTTS breakdown

### Operational Metrics
- **Capital Allocation Efficiency**: Actual vs. theoretical Kelly sizing
- **Liquidity Coverage**: Average bet size vs. market depth
- **Latency**: Decision time from match trigger to execution
- **Model Drift**: Accuracy degradation trend
- **Data Freshness**: Latest outcome incorporation timestamp

### Learning Metrics
- **Feedback Cycle Time**: Speed of model retraining
- **Improvement Rate**: Accuracy gains post-retraining
- **False Negative Trend**: Missed edge cases over time
- **Ensemble Consensus**: Agreement between sub-models

## Commands

### `/metrics-dashboard create [--dashboard=TYPE] [--timeframe=PERIOD]`
Generate dashboard configuration. Types: financial, decision-quality, operational, learning, comprehensive. Creates:
- Chart definitions (React/D3 compatible)
- Real-time data feeds
- Drill-down capability
- Export templates

**Example**: `/metrics-dashboard create --dashboard=comprehensive --timeframe=90d`

### `/metrics-dashboard analyze-health`
Run comprehensive health check. Reports:
- Current ROI and trajectory
- Sharpe ratio status
- Model drift trend
- Operational bottlenecks
- Recommendations

### `/metrics-dashboard export [--format=CSV|JSON|XLSX] [--period=START..END]`
Export metrics for external analysis or stakeholder reporting. Includes summary statistics and trend analysis.

## Dashboard Sections

### Financial Overview
- ROI timeline with benchmark comparison
- Drawdown visualization with recovery timeline
- Win rate and profit factor trends
- Capital efficiency scatter plots

### Model Performance
- Accuracy by match type (home/away/draw, O/U, BTTS)
- Confidence calibration (predicted vs. actual)
- Ensemble sub-model agreement
- Model drift early warning

### Decision Intelligence
- Edge detection timeline
- Kill-switch activation frequency
- Capital allocation vs. Kelly optimal
- Value bet identification success rate

### Learning Feedback
- Model retraining cycles
- Accuracy improvement post-training
- False negative analysis
- Emerging pattern detection

## Requirements

- Real-time data pipeline
- Historical match outcomes
- Prediction archives with confidence scores
- Actual bet execution logs
- Portfolio state snapshots
- Visualization library (React, D3.js, or similar)
