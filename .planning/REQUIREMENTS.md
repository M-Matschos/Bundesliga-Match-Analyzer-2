# Phase C Requirements — Dark Mode, Detail Screens & Testing

**Phase:** C  
**Version:** 1.0  
**Date:** 2026-04-30  
**Duration:** 10 days (Target: 2026-05-10)

---

## Overview

Phase C delivers dark mode support, enhanced detail screens, and comprehensive test coverage for the Bundesliga Match Analyzer mobile app. All existing Phase A and Phase B functionality must remain intact and tested.

---

## Feature Requirements

### F1: Dark Mode Implementation

**Description:** Full light/dark theme support across all screens and components.

**Requirements:**
- F1.1: Create/update ThemeContext with mode state ('light' | 'dark')
- F1.2: Implement useTheme() hook for accessing current theme mode
- F1.3: Create theme toggle button in ProfileScreen or settings UI
- F1.4: Persist user's theme preference to AsyncStorage
- F1.5: Apply dynamic colors to ALL screens (ProfileScreen, DashboardScreen, LoginScreen, etc.)
- F1.6: Apply dynamic colors to ALL components (MatchPredictionCard, Spinner, etc.)
- F1.7: Update colors.ts with DARK_COLORS and LIGHT_COLORS palettes
- F1.8: Ensure readability in both themes (WCAG AA contrast)
- F1.9: No hardcoded colors in components (all use getColors())

**Acceptance Criteria:**
- ✅ App renders correctly in light mode
- ✅ App renders correctly in dark mode
- ✅ Toggle switches between light/dark without restart
- ✅ User preference persists after app close/reopen
- ✅ All text meets WCAG AA contrast ratios in both themes
- ✅ No console errors related to styling

---

### F2: Detail Screens Implementation

**Description:** Enhance and finalize detail screens for players, teams, and matches.

**Requirements:**
- F2.1: Implement PlayerDetailsScreen
  - Display player profile (name, position, team, jersey number)
  - Show player statistics (goals, assists, appearances, etc.)
  - Display defensive stats (tackles, interceptions) if applicable
  - Show goalkeeper stats (saves, clean sheets) if applicable
  - Support refresh control for data reload
  - Dark mode support

- F2.2: Implement TeamDetailsScreen
  - Display team info (name, logo, stadium, founded)
  - Show season statistics (wins, draws, losses, points)
  - Display squad roster with key players
  - Show recent match results
  - Dark mode support

- F2.3: Implement MatchDetailsScreen
  - Display match info (teams, date, time, stadium)
  - Show prediction details (confidence, probabilities)
  - Display betting odds and value bets
  - Show match statistics (xG, possession, shots)
  - Dark mode support

- F2.4: Implement StadiumDetailsScreen
  - Display stadium info (name, location, capacity)
  - Show stadium image/photo
  - Display team history at stadium
  - Dark mode support

- F2.5: Implement SeasonStatsScreen
  - Display historical trends and charts
  - Show seasonal comparisons
  - Dark mode support

- F2.6: All detail screens must have:
  - Proper loading states (Spinner component)
  - Error handling and error messages
  - Refresh control
  - Proper navigation back
  - Responsive layout (mobile-first)
  - Dark mode support

**Acceptance Criteria:**
- ✅ All 5 detail screens navigate correctly from main screens
- ✅ All screens load data and display correctly
- ✅ Refresh control works on all screens
- ✅ Error states handled gracefully
- ✅ Loading states show Spinner component
- ✅ All screens render in both light and dark modes
- ✅ No TypeScript errors

---

### F3: Testing & Quality Assurance

**Description:** Achieve 80%+ test coverage with comprehensive unit, component, and integration tests.

**Requirements:**
- F3.1: Unit Tests
  - Test all custom hooks (useAuth, useTheme, useToast, etc.)
  - Test utility functions (formatDate, validators, etc.)
  - Test context providers
  - Minimum 80% line coverage per file

- F3.2: Component Tests
  - Test all screens for rendering
  - Test navigation flows
  - Test user interactions (buttons, inputs, toggles)
  - Test dark mode rendering
  - Test error states

- F3.3: Integration Tests
  - Test complete auth flow (login → authenticated state → dashboard)
  - Test dark mode toggle → preference persistence → app restart
  - Test navigation between multiple screens
  - Test data loading and refresh flows

- F3.4: Test Configuration
  - Fix AsyncStorage mocking in jest.setup.js
  - Fix native module mocking (React Native Navigation, etc.)
  - Create test utilities and mock factories
  - Configure snapshot testing for components

- F3.5: Test Documentation
  - Create TEST.md with testing guidelines
  - Document mocking strategies
  - Document test file structure and naming conventions

**Acceptance Criteria:**
- ✅ 100+ new tests written
- ✅ 80%+ overall test coverage
- ✅ All tests passing (Phase A 70+ tests + Phase B 300+ tests + new 100+ tests)
- ✅ No TypeScript errors in test files
- ✅ Pre-existing Jest issues resolved
- ✅ TEST.md documentation complete

---

## Non-Functional Requirements

### NFR1: Performance
- App launch time: < 3 seconds
- Screen navigation: < 300ms
- Theme toggle: < 100ms
- No memory leaks
- Optimize StyleSheet.create() with useMemo

### NFR2: Accessibility
- All text meets WCAG AA contrast ratios (4.5:1 minimum)
- Touch targets minimum 44x44 points
- Proper accessibility labels and roles
- Screen reader support maintained

### NFR3: Code Quality
- No TypeScript errors
- Consistent code style (ESLint)
- No console errors/warnings in development
- Proper error handling (try-catch, error boundaries)

### NFR4: Compatibility
- iOS 12+
- Android 6+
- All screen sizes (phones and tablets)
- Both light and dark modes

---

## Out of Scope

- Backend API changes
- New data models
- Third-party library upgrades
- Platform-specific features (push notifications, etc.)
- Internationalization (i18n) — German only for Phase C

---

## Dependencies

**On Phase A & B:**
- All 70+ Phase A tests must still pass
- All 300+ Phase B tests must still pass
- All existing screens must support dark mode
- All existing components must support dark mode

**External:**
- React Native navigation (already available)
- AsyncStorage (already available)
- React Context API (already available)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Test Coverage | 80%+ |
| New Tests | 100+ |
| Passing Tests | 100% |
| TypeScript Errors | 0 |
| Dark Mode Screens | 15+ |
| Detail Screens | 5+ |
| Lines of Code | ~2,000 |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Pre-existing Jest mocks break | Medium | High | Fix AsyncStorage mocking before tests |
| Dark mode contrast issues | Low | Medium | Use established color palettes, WCAG checker |
| Detail screens API integration | Medium | Medium | Use mock data first, then integrate API |
| Test flakiness | Medium | Medium | Implement proper async/await handling |
| Performance regression | Low | High | Profile before/after theme changes |

---

## Checklist

Phase C completion checklist:

- [ ] F1: Dark Mode Implementation
  - [ ] F1.1: ThemeContext updated
  - [ ] F1.2: useTheme() hook working
  - [ ] F1.3: Theme toggle UI added
  - [ ] F1.4: Preference persistence works
  - [ ] F1.5-1.9: All screens/components styled

- [ ] F2: Detail Screens Implementation
  - [ ] F2.1: PlayerDetailsScreen complete
  - [ ] F2.2: TeamDetailsScreen complete
  - [ ] F2.3: MatchDetailsScreen complete
  - [ ] F2.4: StadiumDetailsScreen complete
  - [ ] F2.5: SeasonStatsScreen complete
  - [ ] F2.6: All screens fully functional

- [ ] F3: Testing & Quality
  - [ ] F3.1: Unit tests written
  - [ ] F3.2: Component tests written
  - [ ] F3.3: Integration tests written
  - [ ] F3.4: Jest configuration fixed
  - [ ] F3.5: TEST.md documentation complete

- [ ] All phase requirements met
- [ ] All tests passing (470+)
- [ ] No TypeScript errors
- [ ] WCAG AA compliance maintained
- [ ] Ready for Phase D

---

## Approval

**Author:** Claude Code (Automated GSD)  
**Date Created:** 2026-04-30  
**Status:** ⏳ Pending Approval
