# Phase C: Detail Screens & Advanced Features

**Status:** 🚀 Starting (2026-04-26)  
**Duration:** ~50-60 days  
**Goal:** Implement detail screens + advanced features using Phase B patterns

---

## 📋 Phase C Overview

Phase C expands the app with detailed information screens and advanced user features, building on the foundation and patterns from Phase A & B.

**3 Sub-phases:**
- **C1:** Detail Screens (Match, Team, Player)
- **C2:** Settings & Help Screens
- **C3:** Advanced Navigation & Performance

---

## C1: Detail Screen Enhancements (20 days)

### C1.1 MatchDetailsScreen
**Purpose:** Full match data, live updates, betting options

**Features:**
- Match header (teams, date, score)
- Live match stats (possession, shots, corners)
- Event timeline (goals, cards, substitutions)
- Betting odds comparison
- Expert predictions + confidence
- Historical H2H statistics
- Team lineups + formation

**Files to Create:**
- `mobile/src/screens/MatchDetailsScreen.tsx`
- `desktop/src/screens/MatchDetailsScreen.jsx`
- `mobile/src/components/MatchEventTimeline.tsx`
- `desktop/src/components/MatchEventTimeline.jsx`
- `mobile/src/components/BettingOddsComparison.tsx`
- `desktop/src/components/BettingOddsComparison.jsx`
- Tests: 30+ test cases

**Uses Phase B Patterns:**
- Table (for stats, odds)
- Modal (for odds details, player info)
- Toast (for live updates)
- Loading states (while fetching live data)

---

### C1.2 TeamDetailsScreen
**Purpose:** Squad info, fixtures, form table, transfers

**Features:**
- Squad roster with player cards
- Season fixtures + results
- Form table (last 10 games)
- Team statistics (xG, xGA, possession)
- Transfer news + market value
- Manager info + coaching staff
- Stadium information

**Files to Create:**
- `mobile/src/screens/TeamDetailsScreen.tsx`
- `desktop/src/screens/TeamDetailsScreen.jsx`
- `mobile/src/components/PlayerCard.tsx`
- `desktop/src/components/PlayerCard.jsx`
- `mobile/src/components/FormTable.tsx`
- `desktop/src/components/FormTable.jsx`
- Tests: 25+ test cases

**Uses Phase B Patterns:**
- Table (for fixtures, form, squad)
- Tabs (squad, fixtures, stats)
- Modal (for player details)
- Skeleton (while loading)

---

### C1.3 PlayerDetailsScreen
**Purpose:** Performance stats, injury info, market value

**Features:**
- Player profile (photo, position, number)
- Career statistics (goals, assists, appearances)
- Performance metrics (expected assists, pass accuracy)
- Injury history + current status
- Market value + transfer history
- Playing time chart
- Comparison with similar players

**Files to Create:**
- `mobile/src/screens/PlayerDetailsScreen.tsx`
- `desktop/src/screens/PlayerDetailsScreen.jsx`
- `mobile/src/components/PerformanceChart.tsx`
- `desktop/src/components/PerformanceChart.jsx`
- `mobile/src/components/InjuryTimeline.tsx`
- `desktop/src/components/InjuryTimeline.jsx`
- Tests: 20+ test cases

**Uses Phase B Patterns:**
- Modal (for comparison view)
- Loading states (while fetching stats)
- Toast (for quick stats)

---

## C2: Settings & Help Screens (15 days)

### C2.1 ProfileScreen
**Purpose:** Extended user info, preferences, security settings

**Features:**
- User avatar + basic info
- Account settings (email, password)
- Notification preferences
- Betting preferences (Kelly%, unit size)
- Privacy settings
- Connected accounts
- Subscription info

**Files to Create:**
- `mobile/src/screens/ProfileScreen.tsx`
- `desktop/src/screens/ProfileScreen.jsx`
- Tests: 15+ test cases

---

### C2.2 SettingsScreen
**Purpose:** App settings, notifications, language/theme

**Features:**
- Display settings (dark/light mode, font size)
- Notification settings (push, email, SMS)
- Language selection
- Data usage settings
- App version + updates
- Cache management
- Legal (Privacy, Terms)

**Files to Create:**
- `mobile/src/screens/SettingsScreen.tsx`
- `desktop/src/screens/SettingsScreen.jsx`
- Tests: 15+ test cases

---

### C2.3 HelpScreen
**Purpose:** FAQ, tutorial, contact support

**Features:**
- FAQ sections
- Interactive tutorial (first-time)
- Contact support form
- Feedback collection
- Documentation links
- Video guides (embedded)
- Chat support widget

**Files to Create:**
- `mobile/src/screens/HelpScreen.tsx`
- `desktop/src/screens/HelpScreen.jsx`
- Tests: 10+ test cases

---

## C3: Advanced Navigation & Performance (15 days)

### C3.1 Advanced Navigation
- Modal stacks for dialogs
- Bottom sheet navigation for betting
- Nested stacks for complex flows
- Custom transition animations
- Gesture-based navigation (swipe back)

**Files to Create:**
- `mobile/src/navigation/ModalNavigator.tsx`
- `mobile/src/navigation/BettingNavigator.tsx`
- Tests: 10+ test cases

---

### C3.2 Performance & Polish
- List virtualization (FlashList for large lists)
- Component memoization (useMemo, React.memo)
- Image caching + lazy loading
- Bundle size optimization
- Asset optimization
- Performance profiling

**Implementation:**
- Replace FlatList with FlashList where needed
- Add React.memo to expensive components
- Implement image caching strategy
- Code splitting for screens

---

## 🎯 Success Criteria (Phase C)

**Detail Screens:**
- [ ] MatchDetailsScreen fully functional (Mobile + Desktop)
- [ ] TeamDetailsScreen with all features (Mobile + Desktop)
- [ ] PlayerDetailsScreen with stats (Mobile + Desktop)
- [ ] All screens use Phase B patterns consistently
- [ ] 70+ test cases for detail screens
- [ ] Loading, empty, error states properly handled

**Settings & Help:**
- [ ] ProfileScreen with preferences (Mobile + Desktop)
- [ ] SettingsScreen with all toggles (Mobile + Desktop)
- [ ] HelpScreen with FAQ + support (Mobile + Desktop)
- [ ] 40+ test cases for settings

**Navigation & Performance:**
- [ ] Advanced navigation flows working
- [ ] Performance metrics improved (LCP < 2.5s)
- [ ] Bundle size optimized
- [ ] 30+ performance-related test cases

**Overall:**
- [ ] 150+ total test cases
- [ ] WCAG 2.1 AA accessibility
- [ ] Mobile-first responsive
- [ ] Design token compliance

---

## Task Breakdown

| Task | Type | Days | Priority |
|------|------|------|----------|
| C1.1 MatchDetailsScreen | Detail | 7 | P1 |
| C1.2 TeamDetailsScreen | Detail | 6 | P1 |
| C1.3 PlayerDetailsScreen | Detail | 5 | P1 |
| C2.1 ProfileScreen | Settings | 4 | P2 |
| C2.2 SettingsScreen | Settings | 3 | P2 |
| C2.3 HelpScreen | Help | 3 | P2 |
| C3.1 Advanced Navigation | Navigation | 5 | P2 |
| C3.2 Performance & Polish | Optimization | 10 | P2 |
| Integration & Testing | QA | 5 | P1 |
| **Total** | | **48 days** | |

---

## Dependencies

**Phase C depends on:**
- ✅ Phase A: Mobile Foundation (Auth, Navigation, Providers)
- ✅ Phase B: Design Patterns (Table, Modal, Toast, Loading, Navigation)

**Phase C enables:**
- Phase D: Advanced Features (Predictions, Betting, Analytics)
- Phase E: Production Optimization

---

## Implementation Order

**Week 1-2: Detail Screens (C1)**
1. MatchDetailsScreen (7 days)
2. TeamDetailsScreen (6 days)
3. PlayerDetailsScreen (5 days)

**Week 3: Settings & Help (C2)**
4. ProfileScreen (4 days)
5. SettingsScreen (3 days)
6. HelpScreen (3 days)

**Week 4-5: Navigation & Performance (C3)**
7. Advanced Navigation (5 days)
8. Performance & Polish (10 days)
9. Integration Testing (5 days)

---

**Ready to start C1: Detail Screens?** 🚀
