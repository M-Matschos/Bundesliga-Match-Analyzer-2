# 🚀 Erweiterter Feature-Roadmap — Bundesliga Match Analyzer

**Feedback Integration**: User-submitted feature improvements + Strategic roadmap planning

---

## 📊 Feature-Bewertung Matrix

| Feature | Wert | Effort | Impact | Phase | Priority |
|---------|------|--------|--------|-------|----------|
| Schiedsrichter-Einfluss-Score | 🟢 Hoch | 🟠 Mittel | 3-5% Accuracy | v2.1 | 🔴 P1 |
| LivexG-Anstieg (Echtzeit) | 🟢 Hoch | 🔴 Hoch | Differenzierung | v2.1 | 🔴 P1 |
| What-If-Simulation | 🟡 Mittel-Hoch | 🟠 Mittel | Engagement +40% | v2.1 | 🟡 P2 |
| Marktbewegungsindex | 🟢 Hoch | 🟡 Niedrig-Mittel | Smart-Money ID | v2.1 | 🟡 P2 |
| Strategie-Backtester | 🟢 Hoch | 🔴 Hoch | Retention +60% | v2.2 | 🟡 P2 |
| KI-Podcast-Modus | 🟡 Mittel | 🟠 Mittel | Audio-Content | v2.2 | 🟢 P3 |
| Social Betting/Ligen | 🟢 Sehr Hoch | 🔴 Sehr Hoch | Virales Growth | v3.0 | 🟡 P2 |
| Apple Watch Widget | 🟡 Mittel | 🟡 Niedrig-Mittel | Push-Engagement | v2.2 | 🟢 P3 |
| Open Metrics Dashboard | 🔴 KRITISCH | 🟢 Niedrig | Trust+Compliance | v2.0 | 🔴 P1 |
| Half-Kelly-Standard | 🔴 KRITISCH | 🟢 Niedrig | Risk Management | v2.0 | 🔴 P1 |
| NLP-Alert-System | 🟢 Hoch | 🟠 Mittel | Real-time Value | v2.1 | 🔴 P1 |

---

## 🎯 Phase 1: MVP 2.0 → MVP 2.0+ (2 Wochen, KRITISCH)

> **Focus**: Vertrauen & Verantwortung ZUERST

### 1.1 Open Metrics Dashboard ✅ MUSS-Haben

**Problem**: Nutzer wissen nicht, ob die Prognosen gut sind → Vertrauen fehlt

**Lösung**:
```typescript
// mobile/src/screens/MetricsScreen.tsx
interface ModelAccuracy {
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW'
  accuracy_percent: number  // z.B. 68%
  sample_size: number       // z.B. 234 matches
  period: 'all_time' | 'last_30d' | 'last_7d'
}

// Dashboard zeigt:
- Overall Accuracy: 68.4% (für High-Confidence Picks)
- Win Rate by Confidence: HIGH=72%, MED=64%, LOW=51%
- Performance by League: BL1=69%, BL2=64%
- Calibration Plot (predicted prob vs. actual outcome)
- Monthly ROI Trend (rolling 7-day average)
- Total Predictions: 1,243 matches
- Last Updated: 2 hours ago
```

**Backend Impact**:
```python
# backend/app/routers/metrics.py
@router.get("/metrics/accuracy")
async def get_model_accuracy(
    confidence: str = "all",
    days: int = 30
):
    """Return transparent model accuracy metrics."""
    # Query historical predictions vs. actual outcomes
    predictions = db.query(Prediction).filter(
        Prediction.created_at >= now() - timedelta(days=days)
    ).all()
    
    accuracy = calculate_accuracy(predictions, confidence)
    calibration = calculate_calibration_curve(predictions)
    
    return {
        "accuracy": accuracy,
        "calibration": calibration,
        "sample_size": len(predictions),
        "last_updated": datetime.utcnow(),
    }
```

**Daten-Pipeline**:
```python
# backend/ml/metrics/accuracy_tracker.py
class AccuracyTracker:
    def log_prediction(self, match_id, prediction: dict, actual_outcome: str):
        """Log prediction for post-match accuracy calculation."""
        self.db.insert('prediction_log', {
            'match_id': match_id,
            'predicted_home_prob': prediction['home_win_prob'],
            'confidence': prediction['confidence'],
            'actual_outcome': actual_outcome,  # 'home' | 'draw' | 'away'
            'timestamp': datetime.utcnow(),
        })
    
    def calculate_calibration(self, bins=10):
        """Calibration: Do 70% predictions win 70% of the time?"""
        # Binning: Group predictions by 0-10%, 10-20%, etc.
        # Calculate actual win% per bin
        # Plot: Expected vs. Actual
        return calibration_curve
```

**Time**: 3-5 Tage  
**Tech**: React component + Backend metrics API + SQLite query  
**Value**: 🔴 TRUST (absolute prerequisite)

---

### 1.2 Half-Kelly als Standard ✅ MUSS-Haben

**Problem**: Volle Kelly = optimal aber riskant (Ruinrisiko bei Variance)

**Lösung**:
```typescript
// mobile/src/utils/kelly.ts
interface KellyRecommendation {
  full_kelly_percent: number      // z.B. 8%
  half_kelly_percent: number      // 4% (STANDARD)
  quarter_kelly_percent: number   // 2% (conservative)
  recommended: 'half' | 'quarter'
}

function calculateKellyStake(
  bankroll: number,
  odd: number,
  win_probability: number,
): KellyRecommendation {
  const w = win_probability
  const b = odd - 1
  const q = 1 - w
  
  const fullKelly = (w * b - q) / b
  
  return {
    full_kelly_percent: fullKelly * 100,
    half_kelly_percent: (fullKelly / 2) * 100,
    quarter_kelly_percent: (fullKelly / 4) * 100,
    recommended: 'half',  // Conservative default
  }
}

// UI Betting Screen:
// "Empfohlen: €2 (Half-Kelly aus 4% × €50 Bankroll)"
// Button: "Mehr Risiko?" → Toggle zu Quarter-Kelly / Full-Kelly
```

**Bankroll Management Screen**:
```typescript
interface BankrollTracking {
  starting_balance: number      // €100
  current_balance: number       // €87
  max_drawdown: number          // -15%
  kelly_stake_size: number      // €2
  recommended_action: string    // "STOP after 3 losses"
}

// Rule: Stop wenn Drawdown > 25% (Nutzer-Schutz)
```

**Time**: 1-2 Tage  
**Tech**: Math function + UI Toggle + Bankroll tracking  
**Value**: 🔴 RISK MANAGEMENT (legal + ethical)

---

## 🎯 Phase 2: v2.1 (4 Wochen, HIGH-VALUE FEATURES)

### 2.1 Schiedsrichter-Einfluss-Score

**Datenquellen**:
```python
# backend/data/referee_scorer.py
class RefereeInfluenceScorer:
    def analyze_referee(self, referee_id: str, season: str):
        """Score referee tendencies from historical data."""
        matches = self.db.query(Match).filter(
            Match.referee_id == referee_id,
            Match.season == season
        ).all()
        
        home_advantage = calculate_home_advantage(matches)
        card_frequency = calculate_card_frequency(matches)
        penalty_rate = calculate_penalty_rate(matches)
        goal_tolerance = calculate_xg_vs_goals(matches)
        
        return {
            'home_advantage_factor': home_advantage,  # +2.3% for home teams
            'yellow_cards_per_game': card_frequency,  # 4.2 per game
            'penalty_tendency': penalty_rate,         # 1 per 45 matches
            'goal_tolerance': goal_tolerance,         # Lenient/Strict
            'influence_score': 0.47,                  # 0.0-1.0
        }
    
    def adjust_prediction(self, base_prediction: dict, referee_data: dict) -> dict:
        """Adjust home/away odds based on referee influence."""
        if referee_data['home_advantage_factor'] > 0.02:
            base_prediction['home_win_prob'] *= 1.02
            base_prediction['away_win_prob'] *= 0.98
        
        return base_prediction
```

**Feature Storage**:
```python
# backend/ml/features/xgboost_features_extended.py
REFEREE_FEATURES = [
    'referee_home_advantage',    # +/-2.5%
    'referee_card_frequency',    # Influence on game tempo
    'referee_penalty_tendency',  # Defensive advantage?
    'referee_goal_tolerance',    # Affects xG→Goals
]
```

**Impact**: +2-3% Model Accuracy für hochkalibrierte Modelle  
**Time**: 5-7 Tage  
**Priority**: 🔴 P1 (differentiation)

---

### 2.2 LivexG-Anstieg (Real-time Feature)

**Architecture**:
```python
# backend/services/live_xg_stream.py
class LiveXGService:
    async def stream_xg_updates(self, match_id: str):
        """WebSocket stream of xG per second during match."""
        async with aiohttp.ClientSession() as session:
            # Fetch live play-by-play from API-Football
            async for event in api_football.stream_live_events(match_id):
                if event['type'] == 'shot':
                    xg = self.calculate_xg_for_shot(event)
                    
                    # Broadcast to all subscribers
                    await self.websocket_manager.broadcast({
                        'match_id': match_id,
                        'timestamp': event['timestamp'],
                        'team': event['team'],
                        'cumulative_xg': self.cumulative_xg[match_id],
                        'shot_xg': xg,
                        'momentum': self.calculate_momentum(match_id),
                    })
```

**Mobile Display**:
```typescript
// mobile/src/screens/LiveMatchScreen.tsx
// Shows animated bar chart:
// HOME [========>  3.2 xG]  |  AWAY [====>  1.8 xG]
// With second-by-second updates during live match
```

**Time**: 8-10 Tage  
**Priority**: 🔴 P1 (differentiator vs. competitors)

---

### 2.3 What-If-Simulation

**UI**:
```typescript
// mobile/src/screens/SimulationScreen.tsx
interface SimulationFactors {
  missing_player?: string           // "Kane out"
  injury_status?: 'confirmed' | 'doubtful' | 'fit'
  weather_change?: 'rain' | 'clear' | 'extreme_heat'
  form_adjustment?: number          // -10% to +10%
  custom_strength?: {
    home_attack: number
    home_defense: number
    away_attack: number
    away_defense: number
  }
}

// "Was passiert, wenn Kane doch fit wird?"
// Original: Home 58% | Adjusted: Home 62% (+4%)
// Sensitivity: ±0.2% per 1% Kane-Fitness-Change
```

**Backend**:
```python
# backend/routers/predictions.py
@router.post("/predictions/{match_id}/simulate")
async def simulate_what_if(
    match_id: str,
    simulation: SimulationFactors
):
    """Re-run prediction with modified factors."""
    # Load base features
    features = load_match_features(match_id)
    
    # Apply modifications
    if simulation.missing_player:
        features['player_absence_impact'] += 0.05
    
    if simulation.custom_strength:
        features['home_attack'] = simulation.custom_strength.home_attack
    
    # Re-predict
    predictions = ensemble_model.predict(features)
    
    return {
        'original': original_prediction,
        'simulated': predictions,
        'change_percentage': predictions['home_win_prob'] - original_prediction['home_win_prob'],
        'sensitivity': calculate_sensitivity(features, simulation),
    }
```

**Time**: 4-5 Tage  
**Impact**: +40% User Engagement (Education tool)

---

### 2.4 Marktbewegungsindex

**Concept**:
```python
# backend/ml/market_analysis/smart_money.py
class SmartMoneyTracker:
    async def track_market_movement(self, match_id: str):
        """Compare prediction vs. bookmaker odds over time."""
        
        # Fetch odds from OddsAPI (every 5 minutes)
        odds_history = []
        for i in range(300):  # 25 hours before match
            odds = await self.odds_api.get_live_odds(match_id)
            odds_history.append({
                'timestamp': datetime.utcnow(),
                'home_odds': odds['home'],
                'draw_odds': odds['draw'],
                'away_odds': odds['away'],
            })
            await asyncio.sleep(300)  # 5 minutes
        
        # Compare vs. Match Analyzer prediction
        our_prediction = db.query(Prediction).filter_by(match_id=match_id).first()
        
        # Detect smart money movement
        movement = self.detect_smart_money(odds_history, our_prediction)
        
        return {
            'odds_change': odds_history[-1]['home_odds'] - odds_history[0]['home_odds'],
            'our_prediction': our_prediction['home_win_prob'],
            'implied_probability': 1 / odds_history[-1]['home_odds'],
            'divergence': our_prediction['home_win_prob'] - (1 / odds_history[-1]['home_odds']),
            'smart_money_detected': movement['type'],  # 'sharp_action' | 'regular_movement'
        }
```

**Frontend Display**:
```typescript
// "Smart Money Alert: Quoten für Heimsieg gefallen von 1.95 auf 1.82"
// "Match Analyzer sagte: 58% (= 1.72 Quote)"
// "Market unterschätzt dieses Spiel → Wert für Heimsieg"
```

**Time**: 3-4 Tage  
**Value**: Identifiziert undervalued bets

---

## 🎯 Phase 3: v2.2 (4 Wochen, ENGAGEMENT FEATURES)

### 3.1 Interaktiver Strategie-Backtester

```typescript
// mobile/src/screens/StrategyBacktesterScreen.tsx
interface CustomStrategy {
  name: string
  rules: StrategyRule[]
  backtest_period: 'last_month' | 'last_season' | 'all_time'
}

interface StrategyRule {
  condition: 'CONFIDENCE_HIGH' | 'VALUE_BET' | 'ODDS_ABOVE' | 'MOMENTUM'
  threshold: number
  bet_type: 'home_win' | 'draw' | 'away_win' | 'over_2_5'
  stake_percent: number
}

// Example: "Wette auf Heimsieg wenn: Confidence > 60% AND Quote > 1.8"
// Backtest: Hätte 156 Wetten gewonnen (89% ROI), 47 verloren
```

**Backend**:
```python
# backend/ml/backtesting/strategy_engine.py
class StrategyBacktester:
    def backtest_strategy(self, strategy: CustomStrategy, period: str):
        """Test custom strategy against historical data."""
        
        matches = self.load_historical_matches(period)
        predictions = self.load_historical_predictions(matches)
        
        results = []
        for prediction in predictions:
            if self.matches_rules(prediction, strategy.rules):
                # Calculate outcome
                result = {
                    'match_id': prediction.match_id,
                    'predicted': prediction.home_win_prob,
                    'actual': actual_outcome,
                    'odds': prediction.odds_at_time,
                    'profit': calculate_profit(prediction, actual_outcome),
                }
                results.append(result)
        
        return {
            'total_bets': len(results),
            'wins': len([r for r in results if r['profit'] > 0]),
            'roi': sum([r['profit'] for r in results]) / sum([r['stake'] for r in results]),
            'sharpe_ratio': calculate_sharpe(results),
            'max_drawdown': calculate_max_drawdown(results),
            'details': results,
        }
```

**Time**: 10-12 Tage  
**Impact**: +60% Retention (users testing strategies for hours)

---

### 3.2 KI-Podcast-Modus (Text + Audio)

```python
# backend/services/ai_commentary.py
class AICommentaryGenerator:
    async def generate_preview(self, match_id: str, prediction: dict):
        """Generate natural language match preview from model data."""
        
        context = {
            'home_team': prediction.home_team,
            'away_team': prediction.away_team,
            'home_form': prediction.home_form,  # "Sehr gut (3 Siege)"
            'home_win_prob': prediction.home_win_prob,
            'key_factors': prediction.shap_values[:3],  # Top 3 factors
            'injury_news': prediction.injuries,
            'weather': prediction.weather,
        }
        
        # Prompt für LLM (z.B. GPT-4o)
        prompt = f"""
        Erstelle einen 30-Sekunden-Kommentar für eine Match-Vorschau:
        
        {context['home_team']} vs {context['away_team']}
        Prognose: {context['home_win_prob']:.0%} Sieg {context['home_team']}
        
        Wichtigste Faktoren:
        1. {context['key_factors'][0]}
        2. {context['key_factors'][1]}
        3. {context['key_factors'][2]}
        
        Verletzungen: {context['injury_news']}
        Wetter: {context['weather']}
        
        Tone: Sachlich, professionell, kurz (für Podcast)
        """
        
        # Generate with GPT-4o
        text = await openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Convert to audio with TTS
        audio = await elevenlabs.text_to_speech(text, voice="neutral_german")
        
        return {
            'text': text,
            'audio_url': upload_to_cdn(audio),
            'duration_seconds': len(audio) / sample_rate,
        }
```

**Time**: 6-8 Tage  
**Value**: Audio-first consumption (commute-friendly)

---

### 3.3 Apple Watch Widget

```swift
// iOS/WatchOS Widget
import WidgetKit

struct MatchOracleWidget: Widget {
    let kind: String = "MatchOracleWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            ZStack {
                // Dark background
                Color(.systemBackground)
                
                VStack(spacing: 8) {
                    // Match: FCB 2-1 VfL Bochum (HT 45')
                    HStack {
                        Image("fcb").resizable().frame(20, 20)
                        Text("2-1")
                        Image("bochum").resizable().frame(20, 20)
                    }
                    
                    // Live Prediction
                    HStack {
                        Text("⚽ FCB gewinnt").font(.caption)
                        Text("72%").font(.headline).foregroundColor(.green)
                    }
                    
                    // xG
                    HStack {
                        Text("xG: 2.1 - 0.8").font(.caption2)
                    }
                }
            }
        }
        .supportedFamilies([.accessoryRectangular])
        .configurationDisplayName("Match Oracle")
        .description("Nächstes Spiel & Live-Prognose")
    }
}
```

**Time**: 3-4 Tage  
**Value**: Push-Engagement (always-on visibility)

---

## 🎯 Phase 4: v3.0 (6+ Wochen, COMMUNITY FEATURES)

### 4.1 Social Betting & Tipp-Ligen

**Feature Set**:
```typescript
// Privatte Freundes-Ligen
interface PrivateLeague {
  name: string
  members: string[]
  starting_capital: 100  // Virtual €
  rules: LeagueRules
  season: 'bundesliga_2024_25' | 'champions_league_2024_25'
}

// Leaderboard in Real-time
// 1. Max: €156 (ROI +56%)
// 2. Anna: €143 (ROI +43%)
// 3. Tom: €98 (ROI -2%)

// Social Features:
// - Chat during matches
// - Trash-talk leaderboard
// - Monthly prizes (bragging rights)
// - Export results to WhatsApp
```

**Time**: 12-16 Tage  
**Impact**: Virales Wachstum (+200-300% DAU mit friends feature)

---

### 4.2 NLP-Alert-System ✅ MUSS-Haben

**Real-time Injury News**:
```python
# backend/services/breaking_news_monitor.py
class BreakingNewsMonitor:
    async def monitor_official_sources(self):
        """Monitor Twitter, Bundesliga.de, official team feeds."""
        
        while True:
            # Fetch latest news
            tweets = await self.twitter_api.search_live("Verletzung OR injury")
            
            for tweet in tweets:
                # NLP: Is this a match-relevant injury?
                if self.is_relevant_injury(tweet):
                    # Get affected player
                    player = extract_player_name(tweet)
                    matches_affected = self.find_matches_with_player(player)
                    
                    for match in matches_affected:
                        # Get current prediction
                        prediction = self.get_latest_prediction(match)
                        
                        # Recalculate with player absence
                        new_prediction = self.recalculate_without_player(prediction, player)
                        
                        # If >5% change, send alert
                        if abs(new_prediction['home_win_prob'] - prediction['home_win_prob']) > 0.05:
                            await self.send_push_notification(
                                f"⚠️ {player} verletzt! {match['home']} Gewinn-Chance: {prediction['home_win_prob']:.0%} → {new_prediction['home_win_prob']:.0%}"
                            )
                            
                            # Auto-update prediction in DB
                            self.update_prediction(match, new_prediction)
```

**Push Notification**:
```
⚠️ BREAKING: Haaland verletzt (Aufwärmen)
Bayern München vs Manchester City
Ihre Wette: Man City Sieg (62% → 58%)
💡 Möchten Sie die Wette anpassen?
```

**Time**: 5-7 Tage  
**Value**: Real-time market efficiency

---

## 📈 Implementation Timeline

```
April 2026:
  Week 1-2: MVP 2.0+ (Open Metrics + Half-Kelly) 🔴 CRITICAL
  Week 2-3: Accessibility Fixes (WCAG)
  Week 4: Deploy to Staging

Mai 2026:
  Week 1-2: v2.1 (Referee + LivexG + What-If + Markt)
  Week 3: NLP-Alerts implementieren
  Week 4: Deploy to Production

Juni-Juli 2026:
  Week 1-4: v2.2 (Backtester + Podcast + Watch)
  Week 5+: v3.0 Planning (Social Betting)
```

---

## 💰 Business Impact Prognose

| Feature | MAU Growth | Retention | ARPU | Timeline |
|---------|-----------|-----------|------|----------|
| Open Metrics | +30% (Trust) | +15% | +€0 | Apr 2026 |
| Half-Kelly | +5% (Safety) | +10% | +€0 | Apr 2026 |
| LivexG | +50% (Hype) | +30% | +€2 | Mai 2026 |
| What-If | +40% (Engagement) | +40% | +€1 | Mai 2026 |
| Backtester | +60% (Retention) | +50% | +€3 | Jun 2026 |
| Social Betting | +200% (Virality) | +80% | +€8 | Jul 2026 |

**Zielgröße nach v2.2**: 50K MAU, €800K ARR  
**Zielgröße nach v3.0**: 150K+ MAU, €3M+ ARR

---

## 🎯 Nächste Schritte

1. **Sofort (This Week)**:
   - [ ] Open Metrics Dashboard designen
   - [ ] Half-Kelly UI mockups
   - [ ] NLP-Alert infrastructure prüfen

2. **Sprint 5 Planning**:
   - [ ] Assign teams: 2 Backend, 1.5 Mobile, 0.5 ML Ops
   - [ ] Create Jira epics für v2.1-v3.0
   - [ ] Booking für external NLP/LLM APIs

3. **Kommunikation**:
   - [ ] Roadmap mit Stakeholdern teilen
   - [ ] Community-Feedback in Designs einarbeiten
   - [ ] Beta-Tester für v2.1 rekrutieren

---

**Status**: ✅ Roadmap aktualisiert + prioritisiert  
**Owner**: Product Team  
**Last Updated**: 2026-04-25
