---
name: Sports Analytics & Predictions
description: Generate match predictions, player performance analysis, team analysis, historical trends, and momentum scoring. Uses xG calculations and confidence intervals.
---

# Sports Analytics & Predictions

Advanced sports analytics for match prediction, team analysis, and performance metrics with quantitative rigor.

## Analysis Types

### Match Predictions
- **Moneyline Prediction**: Home/Draw/Away with confidence score
- **Over/Under Goals**: Total goals prediction with margin of error
- **Both Teams To Score**: Binary prediction with probability
- **Asian Handicap**: Goal margin predictions with handicap adjustment
- **Confidence Intervals**: 95% CI around point estimates

### Player Performance
- **Position-Specific Metrics**: Forward xG, midfielder possession, defender tackles
- **Season Comparisons**: Current form vs. historical average
- **Injury Impact**: Expected performance drop with absence
- **Matchup Analysis**: Historical performance against opponent

### Team Analysis
- **Offensive Power**: xG per match, conversion rate
- **Defensive Strength**: xGA allowed, clean sheet percentage
- **Home/Away Split**: Performance variance by venue
- **Fatigue Index**: Schedule density and player rotation

### Historical Trends
- **Form Momentum**: Win/loss streak impact on confidence
- **Calendar Patterns**: Performance by day of week, stage of season
- **Head-to-Head History**: Past matchup outcomes and patterns
- **Seasonal Cycles**: Performance degradation/improvement over time

## Usage

### `/sports-analytics predict [--match=ID] [--model=VERSION]`

**Prediction types:**
- `moneyline` — Win/draw/loss
- `goals` — Over/under total goals
- `btts` — Both teams to score
- `all` — All prediction types

**Example:**
```
/sports-analytics predict --match=bundesliga-2026-04-26 --model=ensemble-v2
```

### `/sports-analytics team-analysis [--team=TEAM] [--timeframe=DAYS]`

Analyze team strength, form, fatigue, and matchup-specific factors.

### `/sports-analytics player-analysis [--player=ID] [--stat=METRIC]`

Performance breakdown by position, matchup, and historical comparison.

## Key Metrics

### xG (Expected Goals)
- Probability-weighted shots
- Accounts for shot quality
- Cumulative over match timeline
- Compared to actual goals for calibration

### Expected Possession
- Field control percentage
- Pass completion rate
- Territory dominance

### Defensive Metrics
- Tackles + Interceptions per 90 min
- Pressures applied
- Ball recovery rate

## Output

For each prediction:
1. **Point Estimate**: Most likely outcome
2. **Confidence Score**: 0-100% confidence
3. **Probability Distribution**: Full range of outcomes
4. **95% Confidence Interval**: Margin of error
5. **Key Factors**: What drives the prediction
6. **Model Agreement**: Consensus across sub-models

## Requirements

- Historical match data (minimum 2 seasons)
- Player statistics database
- Team roster and formation data
- Injury/suspension information
- Weather and venue data
- Optional: advanced metrics (xG, xA, pressure data)
