# Bundesliga Match Analyzer — Phase Roadmap

**Last Updated:** 2026-04-30  
**Current Phase:** C  
**Total Phases Planned:** D (future)

---

## Phase Structure Overview

```
Phase A ✅ (Complete)     → Mobile Foundation
         ├─ A1: Components
         ├─ A2: Auth
         ├─ A3: Navigation
         └─ A4: Integration

Phase B ✅ (Complete)     → Design Patterns
         ├─ B1: Table Pattern
         ├─ B2: Modal Pattern
         ├─ B3: Toast Pattern
         ├─ B4: Loading/Error Pattern
         └─ B5: Navigation Pattern

Phase C ⏳ (In Progress)   → Dark Mode & Detail Screens & Testing
         ├─ C1: Dark Mode Infrastructure
         ├─ C2: Dark Mode Implementation (Screens)
         ├─ C3: Dark Mode Implementation (Components)
         ├─ C4: Detail Screens (Players, Teams, Matches, Stadium, Season)
         └─ C5: Testing & Quality Assurance

Phase D 📋 (Planned)      → Advanced Features
         ├─ D1: Advanced Analytics
         ├─ D2: Notifications
         ├─ D3: Performance Optimization
         └─ D4: Production Release
```

---

## Phase C — Dark Mode, Detail Screens & Testing

**Start Date:** 2026-04-30  
**Target End Date:** 2026-05-10  
**Duration:** 10 days  
**Team:** 1 developer (Claude Code)

### Phase C1: Dark Mode Infrastructure (Days 1-2)

**Goal:** Set up theme system foundation.

**Tasks:**
- [ ] C1.1: Review existing colors.ts and theme setup
- [ ] C1.2: Create/update DARK_COLORS and LIGHT_COLORS palettes
- [ ] C1.3: Update ThemeContext with mode state management
- [ ] C1.4: Implement useTheme() hook
- [ ] C1.5: Create theme toggle UI component
- [ ] C1.6: Wire theme persistence to AsyncStorage
- [ ] C1.7: Test theme switching and persistence

**Acceptance Criteria:**
- ✅ ThemeContext provides mode state and toggle function
- ✅ useTheme() hook works in any component
- ✅ Theme toggle button renders correctly
- ✅ User preference persists across app restarts
- ✅ No TypeScript errors

**Deliverables:**
- Updated ThemeContext with full type safety
- useTheme() hook with persistence logic
- Theme toggle button in ProfileScreen
- Updated colors.ts with dark palette

---

### Phase C2: Dark Mode Implementation — Screens (Days 3-5)

**Goal:** Apply dark mode to all 15+ screens.

**Tasks:**
- [ ] C2.1: ProfileScreen — Apply dynamic colors
- [ ] C2.2: DashboardScreen — Apply dynamic colors
- [ ] C2.3: LoginScreen — Apply dynamic colors
- [ ] C2.4: RegisterScreen — Apply dynamic colors
- [ ] C2.5: WeekendCalculatorScreen — Apply dynamic colors
- [ ] C2.6: TeamDetailsScreen — Apply dynamic colors
- [ ] C2.7: PlayerDetailsScreen — Apply dynamic colors
- [ ] C2.8: MatchDetailsScreen — Apply dynamic colors
- [ ] C2.9: StadiumDetailsScreen — Apply dynamic colors
- [ ] C2.10: SeasonStatsScreen — Apply dynamic colors
- [ ] C2.11: Other screens (Settings, Help, etc.) — Apply dynamic colors
- [ ] C2.12: Test all screens in light and dark modes
- [ ] C2.13: Verify WCAG AA contrast ratios

**Acceptance Criteria:**
- ✅ All 15+ screens render correctly in light mode
- ✅ All 15+ screens render correctly in dark mode
- ✅ No hardcoded colors in any screen file
- ✅ All colors use getColors() function
- ✅ All text meets WCAG AA contrast (4.5:1 minimum)
- ✅ No console errors

**Deliverables:**
- Updated screen files with dynamic colors
- No hardcoded color values
- Verified contrast ratios for both themes

---

### Phase C3: Dark Mode Implementation — Components (Days 4-5)

**Goal:** Apply dark mode to all 6+ components.

**Tasks:**
- [ ] C3.1: MatchPredictionCard — Apply dynamic colors
- [ ] C3.2: Spinner — Apply dynamic colors
- [ ] C3.3: Toast component — Apply dynamic colors
- [ ] C3.4: Modal component — Apply dynamic colors
- [ ] C3.5: ErrorBoundary — Apply dynamic colors
- [ ] C3.6: FormInputGroup — Apply dynamic colors
- [ ] C3.7: Other components — Apply dynamic colors
- [ ] C3.8: Test all components in light and dark modes
- [ ] C3.9: Verify WCAG AA contrast ratios

**Acceptance Criteria:**
- ✅ All components render correctly in light mode
- ✅ All components render correctly in dark mode
- ✅ No hardcoded colors in any component file
- ✅ All colors use getColors() function or color props
- ✅ StyleSheet.create() optimized with useMemo
- ✅ No console errors

**Deliverables:**
- Updated component files with dynamic colors
- useMemo optimization for style factories
- Proper color prop threading through sub-components

---

### Phase C4: Detail Screens Implementation (Days 6-7)

**Goal:** Implement and enhance 5 detail screens.

**Tasks:**
- [ ] C4.1: PlayerDetailsScreen
  - Display player info (name, position, team, jersey)
  - Show statistics (goals, assists, appearances, rating)
  - Show defensive stats (tackles, interceptions, clearances)
  - Show goalkeeper stats (saves, clean sheets) if applicable
  - Add refresh control
  - Add dark mode support

- [ ] C4.2: TeamDetailsScreen
  - Display team info (name, logo, stadium, founded)
  - Show season stats (wins, draws, losses, points, goal diff)
  - Display squad roster with key players
  - Show recent match results
  - Add refresh control
  - Add dark mode support

- [ ] C4.3: MatchDetailsScreen
  - Display match info (teams, date, time, stadium)
  - Show prediction details (confidence, probabilities)
  - Display betting odds and value bets
  - Show match statistics (xG, possession, shots)
  - Add refresh control
  - Add dark mode support

- [ ] C4.4: StadiumDetailsScreen
  - Display stadium info (name, location, capacity, year opened)
  - Show stadium image/photo
  - Display team history at stadium
  - Add dark mode support

- [ ] C4.5: SeasonStatsScreen
  - Display historical trends and comparisons
  - Show season-by-season statistics
  - Display charts/visualizations
  - Add dark mode support

- [ ] C4.6: Test all detail screens navigation
- [ ] C4.7: Test data loading and error handling
- [ ] C4.8: Test refresh control functionality

**Acceptance Criteria:**
- ✅ All 5 detail screens navigate correctly
- ✅ All screens load and display data correctly
- ✅ Refresh control works on all screens
- ✅ Error states handled gracefully
- ✅ Loading states show Spinner component
- ✅ All screens render in light and dark modes
- ✅ No TypeScript errors

**Deliverables:**
- 5 fully implemented detail screens
- Mock data for testing
- Integration with existing navigation

---

### Phase C5: Testing & Quality Assurance (Days 8-10)

**Goal:** Achieve 80%+ test coverage with comprehensive tests.

**Tasks:**
- [ ] C5.1: Fix Jest configuration
  - Fix AsyncStorage mocking
  - Fix React Native Navigation mocking
  - Create mock factories for common objects

- [ ] C5.2: Write unit tests
  - Test useAuth() hook (10+ tests)
  - Test useTheme() hook (8+ tests)
  - Test useToast() hook (8+ tests)
  - Test utility functions (10+ tests)
  - Target: 50+ unit tests

- [ ] C5.3: Write component tests
  - Test all screens for rendering (15+ tests)
  - Test navigation flows (8+ tests)
  - Test user interactions (12+ tests)
  - Test dark mode rendering (6+ tests)
  - Test error states (6+ tests)
  - Target: 47+ component tests

- [ ] C5.4: Write integration tests
  - Test auth flow (login → authenticated) (5+ tests)
  - Test dark mode toggle → persistence → restart (3+ tests)
  - Test navigation between screens (4+ tests)
  - Test data loading and refresh (3+ tests)
  - Target: 15+ integration tests

- [ ] C5.5: Create TEST.md documentation
  - Testing guidelines and best practices
  - Mocking strategies and mock factories
  - Test file structure and naming conventions
  - Running tests locally and in CI

- [ ] C5.6: Run full test suite
  - Verify all Phase A tests still pass (70+)
  - Verify all Phase B tests still pass (300+)
  - Verify all Phase C tests pass (100+)
  - Target: 470+ tests passing

**Acceptance Criteria:**
- ✅ 100+ new tests written
- ✅ 80%+ overall test coverage
- ✅ All 470+ tests passing
- ✅ No TypeScript errors in test files
- ✅ Pre-existing Jest issues resolved
- ✅ TEST.md documentation complete
- ✅ No console errors/warnings

**Deliverables:**
- 100+ new test files and test code
- Fixed jest.setup.js with proper mocks
- TEST.md with testing documentation
- All tests passing

---

## Phase C Summary

**Total Tasks:** 50+  
**Estimated Hours:** 80 (10 days × 8 hours)  
**Estimated Commits:** 10-15  
**Expected Test Count:** 470+ (70 + 300 + 100)  
**Expected Code Lines:** ~2,000 (screens + components + tests)

---

## Definition of Done — Phase C

A feature/task is "done" when:
1. ✅ All acceptance criteria met
2. ✅ Code compiles without TypeScript errors
3. ✅ All tests passing (new + existing)
4. ✅ No console errors/warnings in development
5. ✅ Code reviewed (self-review minimum)
6. ✅ Committed to git with clear message
7. ✅ WCAG AA accessibility verified (where applicable)

---

## Phase C Completion Checklist

**Infrastructure:**
- [ ] ThemeContext properly configured
- [ ] useTheme() hook working
- [ ] Theme toggle UI functional
- [ ] Preference persistence working
- [ ] DARK_COLORS and LIGHT_COLORS defined

**Screens (15+):**
- [ ] ProfileScreen dark mode complete
- [ ] DashboardScreen dark mode complete
- [ ] LoginScreen dark mode complete
- [ ] RegisterScreen dark mode complete
- [ ] WeekendCalculatorScreen dark mode complete
- [ ] TeamDetailsScreen dark mode complete
- [ ] PlayerDetailsScreen dark mode complete
- [ ] MatchDetailsScreen dark mode complete
- [ ] StadiumDetailsScreen dark mode complete
- [ ] SeasonStatsScreen dark mode complete
- [ ] Other screens dark mode complete

**Components (6+):**
- [ ] MatchPredictionCard dark mode complete
- [ ] Spinner dark mode complete
- [ ] Toast dark mode complete
- [ ] Modal dark mode complete
- [ ] ErrorBoundary dark mode complete
- [ ] FormInputGroup dark mode complete

**Testing:**
- [ ] 50+ unit tests written
- [ ] 47+ component tests written
- [ ] 15+ integration tests written
- [ ] 80%+ coverage achieved
- [ ] All 470+ tests passing
- [ ] TEST.md documentation complete

**Quality:**
- [ ] No TypeScript errors
- [ ] WCAG AA contrast verified
- [ ] No console errors/warnings
- [ ] All commits made
- [ ] Phase C complete ✅

---

## Transition to Phase D

After Phase C completion, Phase D will cover:
- Advanced analytics features
- Push notification system
- Performance optimization and profiling
- Production release preparation

**Estimated Phase D Duration:** 8-10 days

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Lines of Code | ~2,000 | ⏳ |
| New Tests | 100+ | ⏳ |
| Test Coverage | 80%+ | ⏳ |
| All Tests Passing | 470+ | ⏳ |
| TypeScript Errors | 0 | ⏳ |
| Dark Mode Screens | 15+ | ⏳ |
| Detail Screens | 5+ | ⏳ |
| WCAG AA Compliance | 100% | ⏳ |

---

**Phase C Roadmap Complete**  
**Next Step:** Execute Phase C tasks in sequence  
**Command:** `/gsd-plan-phase C` (after approval)
