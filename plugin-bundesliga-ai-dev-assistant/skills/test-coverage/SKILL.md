---
name: Analyze Model Test Coverage
description: Validate prediction model accuracy, edge case handling, and decision confidence thresholds. Identifies coverage gaps in the oracle's validation layer.
---

# Analyze Model Test Coverage

Evaluate the prediction model's test suite comprehensiveness, focusing on coverage of edge cases, confidence thresholds, and decision boundaries critical to ROI optimization.

## Core Analysis Areas

### 1. Model Accuracy Coverage
- **Prediction accuracy by scenario**: Home wins, away wins, draws, under/over, both teams score
- **Historical accuracy vs. live accuracy**: Seasonal variance, team form degradation
- **Confidence threshold testing**: What confidence levels correlate with actual accuracy?
- **Kelly Criterion validation**: Does test data confirm Kelly bet sizing assumptions?

### 2. Edge Case Validation
- **Low-liquidity matches**: Testing model behavior with sparse historical data
- **Unusual lineups**: Testing robustness to missing/injured key players
- **Weather extremes**: Uncharacteristic conditions (heavy snow, extreme heat)
- **Referee-heavy scenarios**: How does model handle new/controversial referees?
- **Calendar congestion**: Short turnarounds, fixture pile-ups

### 3. Decision Engine Testing
- **Kill-switch thresholds**: Does the system correctly reject low-confidence scenarios?
- **Hard constraint validation**: Injury thresholds, form constraints actually enforced?
- **Capital allocation logic**: Does portfolio sizing match risk parameters?
- **Drawdown protection**: Are position sizes reduced when underwater?

### 4. Feedback Loop Validation
- **Learning cycle**: Does model improve after receiving true outcomes?
- **Drift detection**: Does system catch when model accuracy degrades?
- **Recalibration frequency**: Is retraining triggered appropriately?

## Commands

### `/test-coverage analyze [--model=MODEL] [--sport=SPORT]`
Run comprehensive coverage analysis. Returns:
- Coverage percentage by category (accuracy, edges, decision, learning)
- Risk zones (low coverage areas)
- Confidence interval widths
- Recommendations for additional test cases

**Example**: `/test-coverage analyze --model=bundesliga-xg-ensemble --sport=bundesliga`

### `/test-coverage generate-missing [--priority=HIGH|MEDIUM|LOW]`
Generate test cases for identified gaps. Creates pytest fixtures and data generators for missing coverage areas.

### `/test-coverage validate-kelly [--historical-data=PATH]`
Validate Kelly Criterion assumptions against historical data. Reports actual vs. theoretical bet sizing.

## Requirements

- Access to model training/validation code
- Historical match data with outcomes
- Test suite with pytest framework
- Model prediction outputs with confidence scores
