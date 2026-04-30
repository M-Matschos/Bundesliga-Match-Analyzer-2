# Phase B: Bundesliga Match Analyzer — Mobile Detail Screens & Advanced Features

**Projektkontext:** Bundesliga Match Analyzer MVP (Mobile-First, React Native/Expo)

**Aktueller Status:** Phase A ✅ COMPLETE
- ✅ App.tsx entry point created
- ✅ Authentication system (LoginScreen, RegisterScreen)
- ✅ Root navigation with conditional rendering
- ✅ 10+ screens verified and compatible
- ✅ All providers integrated (Auth, Toast, Gestures)
- ✅ 70+ tests passing
- ✅ Design token system in place

**Startpunkt für Phase B:** mobile/src/screens/ (alle Screens vorhanden, benötigen Verbesserungen)

---

## 🎯 Phase B: Detail Screens & Advanced Features (10 Tage)

**Ziel:** Erweitern und verfeinern der bestehenden Screens mit echter Funktionalität

### B1: MatchDetailsScreen Verbesserungen (Tag 1-3)

**Aktueller Zustand:** Skeleton (10+ KB existiert)

**Zu implementieren:**
1. Match-Header mit Team-Logos und Score
   - Home/Away Team names
   - Live score (wenn Spiel läuft)
   - Match status badge (Not started, Live, Finished)
   - Kickoff time mit Countdown (wenn < 24h)

2. Prediction Card
   - Home win probability (%)
   - Draw probability (%)
   - Away win probability (%)
   - Confidence score
   - SHAP explanation (Top 3 factors)

3. Match Statistics
   - Expected goals (xG) Home vs Away
   - Possession percentage
   - Shots on target
   - Fouls
   - Yellow/Red cards (if finished)

4. H2H History
   - Last 5 matches between teams
   - Head-to-head record
   - Scoring trends

5. Value Bet Section
   - Tipico odds comparison
   - Model prediction vs Tipico odds
   - Highlighted value bets (>10% edge)
   - Betting buttons (deeplinks to Tipico)

6. Technical Implementation
   - useRoute() to get matchId parameter
   - API call: GET /api/v1/predictions/{match_id}
   - Error boundary with retry
   - Loading skeletons during fetch
   - Pull-to-refresh functionality
   - Share button (share prediction via WhatsApp/Email)

**Tests zu schreiben:** 8-10 test cases
- Rendering mit gültiger matchId
- API error handling
- Loading state
- Odds display
- Share functionality

---

### B2: TeamDetailsScreen Verbesserung (Tag 3-5)

**Aktueller Zustand:** Skeleton (7 KB existiert)

**Zu implementieren:**
1. Team Header
   - Team logo + name
   - League badge
   - Current standing (position, points)
   - Form indicator (last 5 games)

2. Squad Table
   - Player list mit Position, Apps, Goals
   - Injury status indicator
   - Market value
   - Sortierbar nach Position/Apps/Goals

3. Upcoming Fixtures
   - Nächste 5 Spiele
   - Gegner mit Logo
   - Predicted result von Modell
   - Link zu MatchDetailsScreen

4. Season Statistics
   - Goals scored / conceded
   - Average xG per match
   - Win rate
   - Home vs Away performance
   - Cards distribution

5. Historical Form
   - Formchart (letzte 10 Spiele)
   - Trend-Pfeil (improving/declining/stable)
   - Elo rating progression

**Tests zu schreiben:** 8 test cases
- Rendering mit gültiger teamId
- Squad table sorting
- Fixtures loading
- Statistics display

---

### B3: PlayerDetailsScreen Verbesserung (Tag 5-6)

**Aktueller Zustand:** Skeleton (10.6 KB existiert)

**Zu implementieren:**
1. Player Card
   - Photo + name + position + number
   - Age + height + weight
   - Nationality (flag)
   - Market value (Transfermarkt)

2. Season Stats
   - Appearances
   - Goals / Assists
   - Yellow/Red cards
   - Minutes played
   - Average rating

3. Performance Metrics
   - xG (expected goals)
   - Pass accuracy
   - Tackles/Interceptions
   - Dribbles successful
   - Shots per game

4. Injury Status
   - Return date (if injured)
   - Type of injury
   - Days out
   - Red/Yellow alert

5. Team Context
   - Current team
   - Joined date
   - Contract until
   - Squad number
   - Position in team order

**Tests zu schreiben:** 6 test cases
- Rendering mit gültiger playerId
- Injury status display
- Stats accuracy

---

### B4: Advanced Navigation (Tag 6-8)

**Zu implementieren:**

1. Modal Navigation
   - Bottom Sheet für Betting (VirtualBettingScreen)
   - Confirmation modal für sensitive actions
   - Share sheet

2. Nested Stack Navigation
   - Match → Team → Player (navigating through details)
   - Back button behavior (pop vs dismiss)
   - Header management pro Stack

3. Custom Transitions
   - Slide-in für Details screens
   - Fade für Modals
   - Scale für Confirmations

4. Deep Link Enhancements
   - Test all deep linking routes
   - Handle invalid/missing matchIds
   - Fallback to home when resource not found

**Tests zu schreiben:** 6 test cases
- Navigation between detail screens
- Modal presentation
- Deep links
- Back button behavior

---

### B5: Performance & Polish (Tag 8-10)

**Zu implementieren:**

1. List Virtualization
   - Use FlashList für lange Listen (Squad, Fixtures, History)
   - estimatedItemSize={120}
   - Test mit 100+ items

2. Image Caching
   - Team logos cachen
   - Player photos cachen
   - Expo-image mit cache options

3. Skeleton Loading States
   - MatchCardSkeleton beim Laden
   - PlayerCardSkeleton
   - StatsBarSkeleton
   - Shimmer animation

4. Error Recovery
   - Retry buttons bei API errors
   - Fallback content wenn keine Daten
   - User-friendly error messages

5. Responsive Design
   - Tablet layout (wider screens)
   - Landscape orientation support
   - Font scaling accessibility

6. Analytics
   - Log screen views
   - Log user interactions (clicks, shares)
   - Track error rates

**Tests zu schreiben:** 8 test cases
- Performance benchmarks (< 2s load time)
- Memory leaks detection
- Skeleton display
- Error recovery

---

## 📋 Aufgaben-Liste für Phase B

### Day 1-3: MatchDetailsScreen
- [ ] Header mit Team-Logos implementieren
- [ ] Prediction Card mit Wahrscheinlichkeiten
- [ ] Match Statistics Section
- [ ] H2H History Display
- [ ] Value Bet Detection & Display
- [ ] API Integration (GET /predictions/{match_id})
- [ ] Error handling + Retry
- [ ] 8-10 Unit Tests
- [ ] Documentation (PATTERN_MATCH_DETAILS_SCREEN.md)

### Day 3-5: TeamDetailsScreen
- [ ] Team Header mit Standing
- [ ] Squad Table mit Sorting
- [ ] Upcoming Fixtures List
- [ ] Season Statistics
- [ ] Form Chart & Trends
- [ ] API Integration
- [ ] 8 Unit Tests
- [ ] Documentation

### Day 5-6: PlayerDetailsScreen
- [ ] Player Card mit Infos
- [ ] Season Statistics
- [ ] Performance Metrics
- [ ] Injury Status
- [ ] Team Context
- [ ] API Integration
- [ ] 6 Unit Tests

### Day 6-8: Advanced Navigation
- [ ] Modal navigation setup
- [ ] Nested stacks
- [ ] Custom transitions
- [ ] Deep linking verification
- [ ] 6 Navigation Tests

### Day 8-10: Performance & Polish
- [ ] List virtualization (FlashList)
- [ ] Image caching
- [ ] Loading skeletons
- [ ] Error recovery
- [ ] Responsive design
- [ ] Analytics integration
- [ ] 8 Performance Tests
- [ ] Final verification

---

## 🔧 Technische Details

### API Endpoints benötigt:
`
GET /api/v1/matches/{match_id}           # Match details
GET /api/v1/predictions/{match_id}       # Prediction + SHAP
GET /api/v1/teams/{team_id}              # Team info + stats
GET /api/v1/teams/{team_id}/fixtures     # Team fixtures
GET /api/v1/teams/{team_id}/squad        # Squad list
GET /api/v1/players/{player_id}          # Player details
GET /api/v1/players/{player_id}/stats    # Player stats
`

### TypeScript Interfaces (neu):

`	ypescript
interface MatchDetails {
  match_id: string
  kickoff: string
  status: 'not_started' | 'live' | 'finished'
  home_team: { name: string; logo_url: string }
  away_team: { name: string; logo_url: string }
  score: { home: number; away: number }
  xg: { home: number; away: number }
}

interface Prediction {
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  confidence: number
  factors: { name: string; importance: number }[]
}

interface TeamDetails {
  team_id: string
  name: string
  logo_url: string
  league: string
  position: number
  points: number
  form: string  // 'WWWWL' last 5
}

interface PlayerDetails {
  player_id: string
  name: string
  position: string
  age: number
  nationality: string
  market_value: number
  injured: boolean
  return_date?: string
}
`

### Design Token Usage:
- Colors: COLORS.primary (blue), COLORS.success (green), COLORS.error (red)
- Typography: headingLG, bodyMD, labelSM
- Spacing: lg (24px) für sections, md (16px) für cards
- Elevation: md/lg shadows für cards

### Context Integration:
- useAuth() — für user data
- useToast() — für notifications (Fehler, Erfolg)
- useRoute() — für route parameter (matchId, teamId, playerId)
- useNavigation() — für navigation zwischen screens

---

## 🧪 Test Strategie für Phase B

**Target:** 60+ neue Tests (gesamt 130+)

**Test-Pyramid:**
- Unit Tests (70%): Component rendering, API calls, calculations
- Integration Tests (20%): Navigation flows, data fetching
- E2E Tests (10%): Complete user journeys

**Zu testen:**
- Rendering mit verschiedenen Daten (loading, error, success)
- API error handling (timeout, 404, 500)
- User interactions (scroll, tap, share)
- Navigation zwischen screens
- Deep links zu detail screens
- Performance (< 2s load time)
- Memory leaks
- Accessibility

---

## 📚 Dokumentation für Phase B

Zu schreiben:
1. **PATTERN_MATCH_DETAILS_SCREEN.md** — MatchDetails architecture + usage
2. **PATTERN_TEAM_DETAILS_SCREEN.md** — Team info display + navigation
3. **PATTERN_PLAYER_DETAILS_SCREEN.md** — Player profile + stats
4. **PHASE_B_ADVANCED_NAVIGATION.md** — Modal + nested stacks + deep linking
5. **PHASE_B_PERFORMANCE_OPTIMIZATION.md** — Virtualization + caching + skeletons

---

## ⚡ Quick Start für Phase B

`ash
# In neuem Chat starten:
cd mobile

# Abhängigkeiten aktualisieren (falls nötig)
npm install

# Tests während Entwicklung laufen lassen
npm test -- --watch

# Dev server starten
npm start
`

### Phase B Workflow:
1. **Erkunden:** Existing screen skeletons anschauen
2. **Plan:** Welche API endpoints fehlen?
3. **Entwickeln:** Screen für Screen mit TDD
4. **Testen:** Unit + Integration Tests schreiben
5. **Dokumentieren:** Pattern Dokumentation
6. **Polieren:** Performance + Accessibility check

---

## 🎯 Phase B Success Criteria

✅ MatchDetailsScreen vollständig mit:
- Real-time Prediction Display
- H2H History
- Value Bet Detection
- Share Funktionalität

✅ TeamDetailsScreen mit:
- Squad Management
- Fixture Display
- Form Analytics

✅ PlayerDetailsScreen mit:
- Career Stats
- Injury Tracking

✅ Advanced Navigation working:
- Modal sheets
- Nested stacks
- Deep links

✅ Performance targets met:
- Detail screen load < 2 seconds
- List scroll smooth (60 FPS)
- No memory leaks

✅ 60+ neue Tests
✅ 5 neue Pattern Dokumente
✅ Zero console errors
✅ WCAG 2.1 AA compliance maintained

---

**Startdatum Phase B:** Nach Approval  
**Geschätzte Dauer:** 10 Tage  
**Team:** 1 Mobile Developer  
**Status:** Bereit zum Starten 🚀

Kopiere diese Anweisung in den nächsten Chat um Phase B zu starten!
