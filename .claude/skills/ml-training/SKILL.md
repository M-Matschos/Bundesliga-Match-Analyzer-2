# ⚙️ ML-Training Skill

**Command:** `/ml-train`  
**Purpose:** Train ensemble ML models (XGBoost, Poisson, Dixon-Coles, Elo) on historical Bundesliga data  
**Trigger:** Manually or after new season data available  
**Output:** Trained model artifacts (joblib) + backtesting report

---

## What This Skill Does

1. **Fetch historical data** (10 years, 3060+ matches)
   - From PostgreSQL: Team stats, xG, Form
   - From API-Football: Latest season fixtures

2. **Feature Engineering** (39 factors)
   - Attack strength, defense weakness, home advantage
   - Form curves (5/10 game rolling avg)
   - Injury impact estimation
   - Weather adjusted expectations

3. **Train 4 models in parallel**
   - Poisson (baseline)
   - Dixon-Coles (low-goal adjustment)
   - XGBoost (learns complex patterns)
   - Elo System (rating updates)

4. **Backtest** (walk-forward validation)
   - 8-year training, 2-year test
   - Rolling window (no lookahead bias)
   - Metrics: Accuracy, Sharpe Ratio, ROI

5. **Save artifacts**
   - `backend/ml/models/trained/` with timestamps
   - Version info (data date, hyperparams)
   - API loads latest automatically

---

## Usage

```bash
# Train on last 10 years
/ml-train --years 10

# Train + detailed backtest report
/ml-train --years 10 --backtest --verbose

# Train only XGBoost (fast)
/ml-train --model xgboost --years 5

# Use specific season dates
/ml-train --date-from 2014-08-01 --date-to 2024-06-30
```

---

## Parameters

| Flag | Default | Description |
|------|---------|-------------|
| `--years` | 10 | Years of historical data to use |
| `--model` | all | Specific model: `poisson`, `dixon_coles`, `xgboost`, `elo`, or `all` |
| `--simulations` | 100000 | Monte Carlo samples per match |
| `--backtest` | false | Run full backtesting (slow, ~30 min) |
| `--verbose` | false | Detailed logging + plots |
| `--db` | matchoracle | PostgreSQL database name |

---

## Example Workflow

```bash
# 1. Initial setup (first time)
/ml-train --years 10 --backtest --verbose

# Output:
# ✅ Loaded 3060 matches (2014-2024)
# ✅ Extracted 39 features per match
# ✅ Trained Poisson (2 min)
# ✅ Trained Dixon-Coles (2 min)
# ✅ Trained XGBoost (5 min, with 10-fold CV)
# ✅ Trained Elo System (1 min)
# ✅ Backtested XGBoost (walk-forward, 15 min)
#
# BACKTEST RESULTS
# ├─ Accuracy: 58.2%
# ├─ Sharpe Ratio: 0.41
# ├─ ROI (100€ stakes): +12.3%
# ├─ Best Model: XGBoost (ensemble weight 50%)
# └─ Models saved to backend/ml/models/trained/20260424_150000/

# 2. Monthly retraining
/ml-train --years 10 --model xgboost

# Output:
# ✅ Retrained XGBoost with latest month
# ✅ Model saved: backend/ml/models/trained/20260424_160000/xgboost_model.pkl
```

---

## What Gets Trained

### 1. Poisson Distribution
- **Goal:** Baseline match outcome probabilities
- **Input:** Team avg goals/match, defense conceded
- **Output:** P(Home Win), P(Draw), P(Away Win)
- **File:** `poisson_model.json`

### 2. Dixon-Coles Correction
- **Goal:** Adjust for low-goal games (0:0, 1:0, 1:1)
- **Input:** Poisson lambdas + historical low-goal frequency
- **Output:** Rho parameter (empirically optimized for Bundesliga)
- **File:** `dixon_coles_params.json`

### 3. XGBoost Ensemble
- **Goal:** Learn complex patterns from 39 features
- **Input:** Team stats, form, injuries, weather, etc.
- **Output:** Probability + SHAP values
- **Training:** Gradient boosting, 500 trees, max_depth=6
- **File:** `xgboost_model.pkl` (80 MB)

### 4. Elo Rating System
- **Goal:** Rate teams dynamically based on results
- **Input:** Match outcomes, home/away
- **Output:** Team ratings (1400-2000) + K-factor
- **File:** `elo_ratings.json` + `elo_history.csv`

---

## Data Quality Checks

The skill automatically validates:

- ✅ No duplicate matches
- ✅ All required teams exist
- ✅ xG values in reasonable range (0-10)
- ✅ Goals/actual match within historical distribution
- ✅ No future dates in training data

**If validation fails:**
```
❌ Data quality issue in season 2019-20
  └─ Match #1234: Home team scored 12 goals (outlier)
  └─ Recommendation: Review or exclude match
```

---

## Performance Notes

- **Full Training (10 years):** ~25 minutes
- **Backtesting:** +15 minutes (walk-forward)
- **Model Size:** 80 MB (XGBoost)
- **Load Time:** <500ms per API request

**Optimization:**
- Parallel training (4 CPU cores)
- Feature caching (don't recompute)
- Incremental Elo updates

---

## Output Files

```
backend/ml/models/trained/20260424_150000/
├── xgboost_model.pkl          # Main prediction model
├── poisson_params.json        # Baseline stats
├── dixon_coles_params.json    # Low-goal adjustment
├── elo_ratings.json           # Current team ratings
├── elo_history.csv            # Rating trends
├── feature_scaler.pkl         # Standardization params
├── hyperparams.json           # XGBoost config
└── backtest_report.html       # Interactive backtesting results
```

---

## Integration

Once trained, models are **automatically loaded** by the API:

```python
# backend/app/routers/weekend.py
from app.ml.models.model_loader import load_trained_models

models = load_trained_models()
prediction = models['ensemble'].predict(features)
```

---

## Troubleshooting

**Problem:** `ModuleNotFoundError: xgboost`
```bash
# Solution
pip install -r backend/requirements.txt
```

**Problem:** `PostgreSQL connection refused`
```bash
# Solution
docker-compose up -d postgres
```

**Problem:** `XGBoost training very slow`
```bash
# Solution: Use only recent data
/ml-train --years 5 --model xgboost
```

**Problem:** `Backtest report shows poor Sharpe ratio`
```
# This is OK for 2024 (volatile season)
# Check backtesting 2023 data separately
/ml-train --years 1 --date-from 2023-08-01 --backtest
```

---

## Next Steps

1. Run `/ml-train --years 10` once during setup
2. Retrain monthly or after major tournaments
3. Monitor accuracy: `pytest backend/tests/integration/test_ml_models.py`
4. Update model weights if accuracy drops below 55%

---

**Last Updated:** 2026-04-24  
**Requires:** Python 3.11+, PostgreSQL, 4GB RAM minimum
