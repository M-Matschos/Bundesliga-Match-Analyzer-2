# Mobile App User Guide — Match Oracle v1.0

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Audience:** End users, beta testers, football fans

---

## 📱 Welcome to Match Oracle!

**Match Oracle** gives you AI-powered predictions for Bundesliga matches. Get accurate predictions, learn why models chose specific outcomes, and test your betting strategy without real money.

---

## 🚀 Getting Started (5 Minutes)

### Installation

**Android (Google Play):**
1. Open Google Play Store
2. Search: "Match Oracle"
3. Tap "Install"
4. Wait for download (20 MB)

**iOS (App Store):**
1. Open App Store
2. Search: "Match Oracle"
3. Tap "Get"
4. Authenticate with Face ID / Touch ID
5. Wait for download

### First Launch

1. **Allow Notifications?** → Tap "Allow" (to get match alerts)
2. **Allow Location?** → Tap "Allow" (for local stadium info)
3. See **Register** screen

---

## 👤 Account Setup (2 Minutes)

### Register

```
Email:     your-email@example.com
Password:  MySecure123! (min 8 chars, mixed case)
Confirm:   MySecure123!

Tap: "REGISTER"
```

**Password Requirements:**
- At least 8 characters
- Contains uppercase (A-Z) and lowercase (a-z)
- Contains number (0-9)
- Contains special character (!@#$%^&*)

⚠️ **Forgot Password?** Tap "Forgot?" and enter your email. We'll send a reset link.

### Login

```
Email:     your-email@example.com
Password:  MySecure123!

Tap: "LOGIN"
```

✅ **Success:** See Dashboard with "Welcome, [Your Name]!"

---

## 📊 Dashboard Screen (Main Hub)

The Dashboard shows upcoming Bundesliga matches from the next 7 days.

```
┌─────────────────────────────┐
│  ⚽ MATCH ORACLE            │
│  Bundesliga Predictions     │
├─────────────────────────────┤
│                             │
│  📅 Saturday, April 26      │
│  15:30 CEST                 │
│                             │
│  🔴 Bayern Munich           │
│        Home 65%             │
│        vs                   │
│  ⚪ Bayer Leverkusen        │
│        Away 25%             │
│                             │
│  Confidence: HIGH (78%)     │
│                             │
│  [TAP FOR DETAILS]          │
│                             │
├─────────────────────────────┤
│  🔄 REFRESH  📋 WEEKEND      │
└─────────────────────────────┘
```

### Reading a Match Card

| Element | Meaning |
|---------|---------|
| **Date & Time** | When the match kicks off (your local time) |
| **Teams** | Home team (top) vs Away team (bottom) |
| **Probability** | Home: 65%, Draw: 10%, Away: 25% (always sum to 100%) |
| **Confidence** | HIGH/MEDIUM/LOW indicator of prediction certainty |
| **Color** | Green (strong prediction), Yellow (weak), Red (very uncertain) |

### Actions

**Tap Match Card:**
- See full prediction details
- View explanation (which factors matter)
- Compare with bookmaker odds
- Option to place virtual bet

**Refresh Button (🔄):**
- Updates match list
- Pulls latest odds from APIs
- Recalculates if odds changed

**Weekend Button (📋):**
- Jump to Weekend Calculator
- Quick calculation for all weekend matches

---

## ⚡ Weekend Calculator (Core Feature)

The Weekend Calculator is the **fastest way** to get predictions for all Saturday + Sunday matches.

### How to Use

1. **Tap "Weekend" button** on Dashboard
2. **See loading screen** with progress bar
3. **Wait for calculation** (usually 8-10 seconds)
   - Progress shows: "Calculating match 3 of 12..."
4. **See results** with all matches:
   - Match 1: Bayern vs Leverkusen → HOME 65%
   - Match 2: BVB vs Schalke → HOME 78%
   - ... (all 12 weekend matches)

### Understanding Results

```
┌──────────────────────────────┐
│  ⚡ WEEKEND CALCULATOR       │
│  April 26-27, 2025           │
├──────────────────────────────┤
│                              │
│  Match 1: Bayern vs Leverkusen│
│  Prediction: HOME WIN        │
│  Confidence: 78% ✅          │
│  Probabilities:             │
│  • Home:  65%               │
│  • Draw:  10%               │
│  • Away:  25%               │
│                              │
│  Kelly Bet Size: 5.2%       │
│  (Of your total bankroll)    │
│                              │
│  Value Bet vs Tipico Odds?   │
│  ✅ YES! (+3.2% expected return)|
│                              │
│  [TAP FOR MORE DETAILS]      │
│                              │
│  [PLACE BET]  [NEXT MATCH]   │
└──────────────────────────────┘
```

### What Kelly Bet Size Means

The **Kelly Criterion** tells you how much to bet based on:
- Your prediction confidence
- The odds offered by bookmakers
- Your total betting budget

Example:
- Your bankroll: €100
- Kelly bet size: 5.2%
- Recommended bet: 5.2 (1 euro or 1 cricket unit)
- Half-Kelly (safer): €2.60

⚠️ **Note:** We use **Half-Kelly** in the app (safer than full Kelly)

### Value Bet Explanation

A **value bet** is when:
```
Our Prediction: Home 65% (1.54 odds implied)
Tipico Offers:  Home 1.75 odds (57% implied)

If Home wins (65% chance):
Expected ROI = 1.75 × 0.65 - 1 = +3.2%

This is a VALUE BET! 
Bet when our prediction is better than market.
```

---

## 🎯 Match Details Screen

Tap any match card to see full analysis.

```
┌──────────────────────────────┐
│  Bayern Munich               │
│        vs                    │
│  Bayer Leverkusen            │
│                              │
│  Saturday, April 26, 15:30   │
├──────────────────────────────┤
│                              │
│  🎯 PREDICTION               │
│  Winner: HOME (Bayern)       │
│  Confidence: 78% (HIGH)      │
│                              │
│  Probabilities:              │
│  Home:  65% █████░░░░        │
│  Draw:  10% ░░████░░░░       │
│  Away:  25% ░░░░░░░░░        │
│                              │
├──────────────────────────────┤
│  📊 KEY FACTORS              │
│  (Why the model chose HOME)  │
│                              │
│  1. Bayern's Form            │
│     • Last 5 matches: 4W-1D  │
│     • Elo rating: 1847       │
│     • Impact: +15% to HOME   │
│                              │
│  2. Home Advantage           │
│     • Allianz Arena (100%)   │
│     • Historical: 72% wins   │
│     • Impact: +8% to HOME    │
│                              │
│  3. Missing Players          │
│     • Leverkusen: No Injuries│
│     • Bayern: No Injuries    │
│     • Impact: ±0%            │
│                              │
├──────────────────────────────┤
│  💰 BETTING OPTIONS          │
│                              │
│  Implied Odds:               │
│  • Home: 1.54 (65%)          │
│  • Draw: 10.0 (10%)          │
│  • Away: 4.00 (25%)          │
│                              │
│  Market Odds (Tipico):       │
│  • Home: 1.75 ← Worse for us│
│  • Draw: 8.50 ← Better!      │
│  • Away: 5.25 ← Better!      │
│                              │
│  Value Bet? NO (Home odds bad)│
│                              │
│  [PLACE BET] [SHARE] [BACK]  │
└──────────────────────────────┘
```

### Interpreting Key Factors

**"Impact: +15% to HOME"**
- This factor increases HOME probability by 15 percentage points
- Shows which factors matter most
- Calculated using SHAP (SHapley Additive exPlanations)

**"Missing Players"**
- Yellow = injury (affects prediction)
- Red = suspended
- Gray = available

---

## 💵 Virtual Betting (No Real Money)

Test your betting strategy with **virtual €1000**.

### Place a Bet

1. **Tap match card** → Select prediction
2. **Choose side:**
   ```
   Home Win:  Bayern to win (1.75 odds)
   Draw:      All teams equal (8.50 odds)  
   Away Win:  Leverkusen to win (5.25 odds)
   ```
3. **Enter amount:**
   ```
   Suggested: €5.20 (Kelly formula)
   Min: €1
   Max: €1000
   ```
4. **Tap "PLACE BET"**

### Bet Confirmation

```
┌─────────────────────────────┐
│  ✅ BET PLACED              │
│                             │
│  Match: Bayern vs Leverkusen│
│  Prediction: HOME WIN       │
│  Amount: €5.20              │
│  Odds: 1.75                 │
│  Potential Payout: €9.10    │
│  (If bet wins)              │
│                             │
│  Your Portfolio:            │
│  Remaining: €994.80         │
│  Open Bets: €5.20           │
│                             │
│  [BACK TO DASHBOARD]        │
└─────────────────────────────┘
```

### Portfolio Screen

**Tap Menu → "Portfolio"** to see:

| Status | Meaning | Action |
|--------|---------|--------|
| 🔴 **Open** | Match not played yet | Wait for result |
| 🟢 **Won** | Your bet was correct | Payout credited |
| ⚫ **Lost** | Your bet was wrong | Money deducted |
| ⚪ **Push** | Exact draw, same odds | Bet returned |

### Example Week

```
Monday (Start):    €1000.00 💰

Tuesday (Bayern vs Leverkusen):
- You bet €5.20 on HOME
- Bayern wins 3-1
- Payout: 5.20 × 1.75 = €9.10 ✅
- Balance: €1003.90

Wednesday (BVB vs Schalke):
- You bet €8.00 on HOME
- Draw 1-1
- Status: PUSH (money returned)
- Balance: €1003.90

Thursday (Cologne vs Frankfurt):
- You bet €10.00 on AWAY
- Cologne wins 2-0
- Loss: -€10.00 ❌
- Balance: €993.90

Friday (End of week):
- Total Bets Placed: 3
- Win Rate: 67% (2 wins, 1 push)
- Profit: -€6.10 (slight loss)
- ROI: -0.61%
```

---

## 🔔 Alerts & Notifications

Stay informed about important match updates.

### Push Notifications

Allow notifications for:
- ✅ Value bets detected
- ✅ Team news (injuries, suspensions)
- ✅ Odds changes (> 5%)
- ✅ Match starting soon (15 min warning)

### Alert Screen

**Tap "Alerts" tab** to see:

```
┌──────────────────────────────┐
│  📢 BREAKING NEWS            │
│                              │
│  15:30 — Bayern injury alert │
│  Manuel Neuer (GK) out with  │
│  hip flexor strain.          │
│  Impact: -2% to Bayern odds  │
│  [DISMISS]                   │
│                              │
│  14:15 — Value bet found!    │
│  Cologne vs Frankfurt        │
│  AWAY odds improved to 3.80  │
│  (Your model: 32%)           │
│  [VIEW MATCH]                │
│                              │
│  12:00 — Schalke news        │
│  Coach change: Old vs New    │
│  Prediction refreshed        │
│  [VIEW]                      │
│                              │
└──────────────────────────────┘
```

---

## ⚙️ Settings & Account

**Tap Menu → Settings** to configure:

### Display
- 🌙 Dark Mode (ON/OFF)
- 📏 Probability View (Percentages / Bars)
- 🌍 Language (English / Deutsch)

### Notifications
- 🔔 Push Alerts (ON/OFF)
- ⚡ Value Bets Only (ON/OFF)
- ⏰ Quiet Hours (10 PM - 8 AM)

### Data
- 📊 Download My Data (GDPR)
- 🗑️ Delete My Account (Permanent)
- 🔐 Change Password

### Support
- 💬 Contact Us
- 📖 Help & FAQ
- ⚖️ Terms of Service
- 🔒 Privacy Policy

---

## ❓ FAQ (Frequently Asked Questions)

### "Why is confidence only 45%?"

Low confidence means:
- Model disagrees with odds
- Historical data is uncertain
- Similar matches had varied results

**What to do:** Smaller bets, or skip this match

### "I lost 5 bets in a row. Is the model broken?"

No! Even accurate predictions lose sometimes:
- Your model: 60% win rate (realistic)
- Variance: 5 losses in a row happens 2% of the time
- Solution: Larger sample size (~100 bets) shows true accuracy

### "Can I use real money?"

Not in MVP. This is **virtual betting only** (€1000 play money).

**Future:** Real money betting in v2.0 (requires licensing)

### "Why do you use Half-Kelly, not full Kelly?"

**Full Kelly:** Mathematically optimal but risky
- Example: 1 bad week loses 50% of bankroll
- Variance can be extreme

**Half-Kelly:** Conservative, proven in practice
- Example: Same scenario loses only 20%
- Better for humans who handle variance poorly

### "What if the API is down?"

The app caches predictions for 6-24 hours, so:
- Yesterday's predictions: ✅ Available
- Real-time odds: ❌ Unavailable

**Solution:** Try again in 1 hour, or contact support

### "Can I export my bets?"

Yes! **Settings → Download My Data** exports JSON with:
- All bets placed
- Results
- P&L by match

### "How accurate is the model?"

**Backtesting (2014-2024):**
- Accuracy: 58% (vs 33% random)
- Sharpe Ratio: 0.42
- ROI: +12% annually with Kelly

**Live (2025):**
- TBD — first season of live predictions

---

## 🐛 Troubleshooting

### App Won't Load

**Problem:** Blank screen, loading forever

**Solution:**
1. Check internet (WiFi or 4G)
2. Close app completely
3. Open again
4. If still stuck, reinstall:
   - Android: Long-press app icon → Uninstall
   - iOS: Swipe app up from home screen
   - Reinstall from Store

### Can't Log In

**Problem:** "Invalid email or password"

**Solution:**
1. Check email spelling
2. If forgot password:
   - Tap "Forgot?"
   - Enter email
   - Check inbox for reset link
   - Create new password
3. If still stuck, contact support

### Prediction Seems Wrong

**Problem:** Model says HOME 70%, but odds are 1.5 (67%)

**Solution:**
- Model ≠ Bookmakers
- Models can disagree
- This is why value bets exist!
- If you think model is wrong, place smaller bet

### Notifications Not Working

**Problem:** App predicted value bet but no alert

**Solution:**
1. **Settings → Notifications → Enable Push Alerts**
2. Check phone settings:
   - Android: Settings → Apps → Match Oracle → Notifications
   - iOS: Settings → Notifications → Match Oracle
3. Ensure "Allow" is enabled
4. Check battery saver (might block notifications)

---

## 🚀 Tips for Best Results

### 1. Start Small
- First week: €5-10 per bet
- Learn how model behaves
- Get comfortable with variance

### 2. Focus on Value Bets
- Only bet when model disagrees with odds
- Skip matches where model agrees with market
- Your edge = model vs bookmakers

### 3. Use Half-Kelly (Not Full)
- Suggested in app already
- Protects against bad variance
- Smaller swings = easier psychology

### 4. Track Your ROI
- Portfolio shows: Bets Won/Lost
- Calculate: (Winnings - Losses) / Total Bet
- Target: +2-3% weekly (conservative)

### 5. Don't Chase Losses
- Bad week? Take a break
- Variance is normal (52% weeks happen)
- Long term: 55-58% win rate

### 6. Understand the Model
- Read match details
- Learn which factors matter
- Question predictions that seem off

---

## 📞 Support & Feedback

### Contact Us

**Email:** support@mathoracle.com  
**Response Time:** 24-48 hours  
**Open:** Monday-Friday, 9 AM - 5 PM CEST

### Report a Bug

**In App:**
1. Settings → Contact Us
2. Attach screenshot
3. Describe what went wrong

**Email:** bugs@mathoracle.com

### Feature Requests

Want a feature? Vote in app or email:  
feedback@mathoracle.com

---

## 📚 Glossary

| Term | Meaning |
|------|---------|
| **Confidence** | How certain model is (HIGH/MEDIUM/LOW) |
| **Value Bet** | When model odds are better than bookmaker odds |
| **Kelly Criterion** | Formula for optimal bet sizing |
| **Half-Kelly** | Conservative Kelly (recommended for users) |
| **Odds** | Payout multiplier (1.75 = €1.75 return per €1 bet) |
| **Probability** | Percentage chance (65% HOME) |
| **Elo Rating** | Team strength score (higher = stronger) |
| **Form** | Team performance last 5-10 matches |
| **xG** | Expected goals (statistical metric) |
| **Bankroll** | Your total betting budget |
| **ROI** | Return on Investment (profit / total bet) |
| **SHAP** | Feature importance explanation method |

---

## ⚖️ Legal & Disclaimer

**Match Oracle** is for **educational and entertainment purposes only**.

- ✅ Use **virtual money** (no real money betting)
- ❌ Don't bet more than you can afford to lose
- ❌ Don't develop gambling addiction
- ✅ Check local laws (betting regulations)

**Predictions are not guaranteed.** Historical accuracy (58%) is no promise of future results.

---

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Language:** English | Deutsch (future)

---

**Enjoy! ⚽🎯**
