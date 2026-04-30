---
name: Validate Production Deployment
description: Pre-deployment verification of model accuracy, decision logic, capital constraints, kill-switch functionality, and system integration. Ensures Match Oracle readiness.
---

# Validate Production Deployment

Execute comprehensive pre-deployment checks ensuring the Match Oracle system is production-ready with validated accuracy, functioning kill-switches, and enforced capital constraints.

## Pre-Deployment Validation Checklist

### 1. Model Validation
- ✅ **Backtesting Results**: Historical accuracy meets threshold (>55% for moneyline, >48% for O/U)
- ✅ **Out-of-Sample Performance**: Model maintains accuracy on held-out test set
- ✅ **Confidence Calibration**: Predicted confidence aligns with actual accuracy
- ✅ **Edge Cases**: Model handles unusual lineups, weather, calendar stress
- ✅ **Ensemble Consensus**: Sub-models reasonably aligned (correlation >0.7)
- ✅ **Drift Detection**: Model accuracy stable over last 30 matches

### 2. Decision Engine Validation
- ✅ **Kill-Switch Testing**: Rejects low-confidence scenarios (<40% confidence = no bet)
- ✅ **Hard Constraints**: Injury thresholds, form requirements enforced
- ✅ **Capital Limits**: Position sizes never exceed portfolio limits
- ✅ **Kelly Validation**: Theoretical Kelly sizing matches actual implementation
- ✅ **Drawdown Protection**: System reduces exposure when underwater >10%
- ✅ **Circuit Breakers**: System halts trading on critical errors

### 3. Integration Testing
- ✅ **Data Pipeline**: Real-time market data feeds active and low-latency
- ✅ **Outcome Verification**: Post-match result feeds capturing correctly
- ✅ **API Connectivity**: All external services responding
- ✅ **Database Integrity**: Player data, lineups, historical records accurate
- ✅ **Prediction Serving**: Model predictions available within SLA
- ✅ **Execution Layer**: Betting/trading execution functional

### 4. Operational Readiness
- ✅ **Monitoring Active**: Dashboards tracking ROI, accuracy, capital
- ✅ **Alert Systems**: Critical failures trigger notifications
- ✅ **Rollback Plan**: Can revert to previous model version
- ✅ **Audit Logging**: All decisions logged with reasoning
- ✅ **Manual Override**: Human operators can intervene if needed
- ✅ **Documentation**: System behavior documented for support

### 5. Security & Compliance
- ✅ **Access Control**: Only authorized users can modify configuration
- ✅ **Encryption**: Sensitive data (API keys, credentials) encrypted
- ✅ **Input Validation**: Market data validated against injection attacks
- ✅ **Rate Limiting**: API usage within provider terms
- ✅ **Compliance**: Bet volume within licensing limits
- ✅ **Audit Trail**: Complete history of all decisions

## Commands

### `/deployment-check validate [--environment=STAGE|PROD]`
Run full validation suite. Reports:
- Pass/fail status for each category
- Critical issues blocking deployment
- Warnings for manual review
- Deployment readiness score (0-100%)

**Example**: `/deployment-check validate --environment=PROD`

### `/deployment-check model-audit [--min-accuracy=0.55]`
Detailed model performance audit. Compares:
- Training vs. production accuracy
- Confidence distribution
- Edge case handling
- Ensemble agreement

### `/deployment-check system-health [--timeout=30s]`
Quick health check of all dependencies. Tests:
- Database connectivity
- API endpoints responsive
- Data freshness
- System resource usage

### `/deployment-check safety-gates`
Verify all safety mechanisms engaged. Confirms:
- Kill-switch armed and tested
- Capital limits configured
- Circuit breakers active
- Manual override available

### `/deployment-check generate-report [--format=HTML|PDF]`
Generate stakeholder-ready deployment report with executive summary, detailed findings, and go/no-go recommendation.

## Deployment Workflow

### Pre-Deployment (T-7 Days)
1. Run full validation suite
2. Address critical issues
3. Conduct manual review of edge cases
4. Prepare rollback plan

### Staging Deployment (T-3 Days)
1. Deploy to staging environment
2. Run live integration tests
3. Validate with real market data feeds
4. Monitor for 48 hours

### Production Deployment (T-0)
1. Final pre-flight check
2. Deploy during low-volatility period
3. Monitor closely first 24 hours
4. Gradual capital increase if stable

### Post-Deployment (T+1 Day)
1. Verify all systems stable
2. Check accuracy metrics
3. Monitor error rates
4. Plan any necessary adjustments

## Requirements

- Complete backtesting historical data
- Production environment credentials
- Real market data API access
- Decision logging infrastructure
- Monitoring and alerting system
- Rollback procedure documentation
