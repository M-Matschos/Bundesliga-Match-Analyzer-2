---
phase: C-dark-mode
plan: 05
type: execute
wave: 4
depends_on: [C-01, C-02, C-03, C-04]
files_modified:
  - mobile/jest.setup.js
  - mobile/src/__tests__/hooks/useAuth.test.tsx
  - mobile/src/__tests__/hooks/useTheme.test.tsx
  - mobile/src/__tests__/hooks/useToast.test.tsx
  - mobile/src/__tests__/utils/validators.test.tsx
  - mobile/src/__tests__/utils/formatters.test.tsx
  - mobile/src/__tests__/integration/AuthFlow.test.tsx
  - mobile/src/__tests__/integration/DarkModeFlow.test.tsx
  - mobile/src/__tests__/integration/NavigationFlow.test.tsx
  - mobile/src/__tests__/integration/DataLoadingFlow.test.tsx
  - docs/TEST.md
autonomous: false
requirements:
  - F3.1
  - F3.2
  - F3.3
  - F3.4
  - F3.5
user_setup: []

must_haves:
  truths:
    - 100+ neue Tests geschrieben
    - 80%+ Test Coverage erreicht
    - Alle 470+ Tests passing (Phase A + B + C)
    - Keine TypeScript-Fehler
    - Jest Configuration Fixed
    - TEST.md Dokumentation komplett
  artifacts:
    - path: mobile/jest.setup.js
      provides: Fixed AsyncStorage + RN Navigation mocks
      min_lines: 50
    - path: mobile/src/__tests__/hooks/
      provides: Unit tests for useAuth, useTheme, useToast
      min_lines: 100
    - path: mobile/src/__tests__/utils/
      provides: Utility function tests
      min_lines: 80
    - path: mobile/src/__tests__/integration/
      provides: Integration tests for key flows
      min_lines: 200
    - path: docs/TEST.md
      provides: Comprehensive testing documentation
      min_lines: 100

---

<objective>
Phase C5: Testing & Quality Assurance — Schreibe 100+ neue Tests, fixe Jest Configuration, und erreiche 80%+ Test Coverage. Alle Phase A, B, C Tests passing.

**Output:**
- 100+ neue Tests
- 80%+ Overall Coverage
- 470+ Tests passing (70 Phase A + 300 Phase B + 100 Phase C)
- TEST.md Dokumentation
- Zero TypeScript errors
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/phases/C-dark-mode/C-01-PLAN.md
@.planning/phases/C-dark-mode/C-02-PLAN.md
@.planning/phases/C-dark-mode/C-03-PLAN.md
@.planning/phases/C-dark-mode/C-04-PLAN.md
</execution_context>

<context>
## Dependencies

**Blocking:** All of C-01, C-02, C-03, C-04 must be complete.

## Test Distribution (100+)

- Unit Tests: 50+ (hooks, utilities)
- Component Tests: 30+ (from C-02, C-03, C-04)
- Integration Tests: 20+ (flows)

## Pre-existing Issues to Fix

From PROJECT.md:
- AsyncStorage mocking needs reconfiguration
- 10+ tests failing in useWeekendCache, useRegisterDevice hooks
- Jest configuration issues

## Target

- 470+ total tests passing
- 80%+ code coverage
- Zero TypeScript errors
- Zero console errors
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix Jest Configuration und AsyncStorage Mocking</name>
  <files>mobile/jest.setup.js</files>
  <action>
Fix pre-existing Jest configuration issues:

**Current Issues:**
- AsyncStorage mocking broken
- 10+ tests failing in useWeekendCache, useRegisterDevice
- RN Navigation mocking incomplete

**Implementation:**

1. **AsyncStorage Mock:**
```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))

const AsyncStorage = require('@react-native-async-storage/async-storage').default
beforeEach(() => {
  AsyncStorage.getItem.mockClear()
  AsyncStorage.setItem.mockClear()
})
```

2. **React Native Navigation Mock:**
```typescript
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
}))
```

3. **Additional Mocks:**
- useColorScheme (react-native)
- AppState (react-native)
- Animated (react-native)

4. **Global Setup:**
- Suppress console warnings
- Setup test utilities
- Configure test timeouts
- Mock factories

**Result:**
- jest.setup.js fixed
- 10+ previously failing tests now pass
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="useWeekendCache|useRegisterDevice" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
Jest Configuration fixed. AsyncStorage + RN Navigation mocked. 10+ previously failing tests passing. jest.setup.js committed.
  </done>
</task>

<task type="auto">
  <name>Task 2: Schreibe Unit Tests für Custom Hooks (35+ Tests)</name>
  <files>
    - mobile/src/__tests__/hooks/useAuth.test.tsx
    - mobile/src/__tests__/hooks/useTheme.test.tsx
    - mobile/src/__tests__/hooks/useToast.test.tsx
  </files>
  <action>
Schreibe Unit Tests für 3 Custom Hooks (mindestens 35 tests):

**useAuth.test.tsx (15+ tests):**
- Login with valid credentials
- Login with invalid credentials
- Login error handling
- Register user
- Logout
- Token storage/retrieval
- Token refresh
- Persistent auth state
- useAuth outside provider throws error

**useTheme.test.tsx (10+ tests):**
- Initial theme (system preference)
- Toggle theme dark→light
- Toggle theme light→dark
- Set specific theme
- Persist to AsyncStorage
- Load from AsyncStorage
- useTheme outside provider
- useThemeColors hook
- isDarkMode helper

**useToast.test.tsx (10+ tests):**
- Show toast with type (success, error, info)
- Toast auto-dismiss
- Multiple toasts
- Clear toast
- useToast outside provider
- Toast styling
- Toast accessibility

**Pattern:**
```typescript
describe('useAuth', () => {
  it('logs in user with valid credentials', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })
    await act(async () => {
      await result.current.login('user@test.com', 'password')
    })
    expect(result.current.user).toBeDefined()
  })
})
```

**Target:** 35+ tests, all passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="useAuth.test|useTheme.test|useToast.test" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
35+ Hook Tests geschrieben. useAuth, useTheme, useToast getestet. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 3: Schreibe Unit Tests für Utility Functions (15+ Tests)</name>
  <files>
    - mobile/src/__tests__/utils/validators.test.tsx
    - mobile/src/__tests__/utils/formatters.test.tsx
  </files>
  <action>
Schreibe Unit Tests für Utilities (15+ tests):

**validators.test.tsx (8+ tests):**
- validateEmail (valid, invalid, edge cases)
- validatePassword (length, complexity)
- validatePhoneNumber (formats)
- validateUsername (chars, length)

**formatters.test.tsx (8+ tests):**
- formatDate (various formats)
- formatCurrency (different locales)
- formatPercentage
- formatNumber (thousands)
- formatTime (duration)

**Pattern:**
```typescript
describe('Validators', () => {
  it('validates email correctly', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
  })
})
```

**Target:** 15+ tests, all passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="validators.test|formatters.test" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
15+ Utility Tests geschrieben. Validators + Formatters getestet. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 4: Schreibe Integration Tests für Key Flows (20+ Tests)</name>
  <files>
    - mobile/src/__tests__/integration/AuthFlow.test.tsx
    - mobile/src/__tests__/integration/DarkModeFlow.test.tsx
    - mobile/src/__tests__/integration/NavigationFlow.test.tsx
    - mobile/src/__tests__/integration/DataLoadingFlow.test.tsx
  </files>
  <action>
Schreibe 4 Integration Test Files (20+ total):

**AuthFlow.test.tsx (5+ tests):**
- Register → Login → Dashboard → Logout
- Invalid credentials → error message
- Session persistence across restart
- Token refresh on expiry
- Logout clears auth

**DarkModeFlow.test.tsx (5+ tests):**
- Light mode → Toggle → Dark mode → persists
- System theme respected on first start
- Theme change updates all screens
- Theme toggle in ProfileScreen
- Theme persists after app restart

**NavigationFlow.test.tsx (5+ tests):**
- Navigate list → detail
- Back button returns
- Deep linking to detail
- Deep linking with params
- Navigation state persists

**DataLoadingFlow.test.tsx (5+ tests):**
- Load data on screen focus
- RefreshControl triggers reload
- Error state shows retry
- Retry reloads data
- Multiple screens load independently

**Pattern:**
```typescript
describe('AuthFlow', () => {
  it('completes register → login → dashboard', async () => {
    const { getByText } = render(<App />)
    fireEvent.press(getByText('Register'))
    // ... verify flow
  })
})
```

**Target:** 20+ tests, all passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="integration" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
20+ Integration Tests geschrieben. Auth, Dark Mode, Navigation, Data Loading Flows getestet. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 5: Run Full Test Suite und Überprüfe Coverage</name>
  <files>mobile/jest.config.js</files>
  <action>
Führe vollständige Test Suite aus:

**Commands:**
1. `npm test -- --coverage --collectCoverageFrom='src/**/*.{ts,tsx}' --coveragePathIgnorePatterns='node_modules'`
   - Überprüfe dass 80%+ Coverage erreicht
   - Target Lines: 80%+, Functions: 80%+, Branches: 75%+, Statements: 80%+

2. `npm test 2>&1 | tail -20`
   - Überprüfe total test count
   - Target: 470+ tests passing (70 A + 300 B + 100 C)
   - Verify: Zero failures

3. Check for TypeScript errors:
   `npx tsc --noEmit`
   - Verify: Zero errors

4. Check for lint errors:
   `npm run lint 2>&1 | tail -20`
   - Verify: Zero errors

**Coverage Report Analysis:**
- Lines: 80%+
- Functions: 80%+
- Branches: 75%+
- Statements: 80%+

**If Coverage < 80%:**
- Identify under-tested files
- Add tests for critical paths
- Re-run coverage

**Result:**
- All 470+ tests passing
- 80%+ coverage achieved
- Zero TypeScript errors
- Zero lint errors
  </action>
  <verify>
    <automated>cd mobile && npm test -- --coverage 2>&1 | grep -E "PASS|FAIL|Lines|Branches|Functions|Statements" | tail -10</automated>
  </verify>
  <done>
Full Test Suite running. Coverage 80%+. 470+ tests passing. Zero failures. Coverage Report generated.
  </done>
</task>

<task type="auto">
  <name>Task 6: Erstelle TEST.md Dokumentation</name>
  <files>docs/TEST.md</files>
  <action>
Erstelle umfangreiche TEST.md (100+ lines):

**Struktur:**

1. **Overview**
   - Framework: Jest + @testing-library/react-native
   - Coverage goal: 80%+
   - Test count target: 470+

2. **Running Tests**
```bash
npm test
npm test -- --watch
npm test -- --coverage
npm test -- --testPathPattern=feature
```

3. **Test Structure**
   - Unit tests: /src/__tests__/units/
   - Components: /src/__tests__/screens/, /src/__tests__/components/
   - Integration: /src/__tests__/integration/
   - Naming: feature.test.tsx

4. **Mocking Strategies**
   - AsyncStorage mock pattern
   - RN Navigation mock pattern
   - API mocking pattern
   - Hook mocking pattern

5. **Test Patterns**
   - Unit test pattern
   - Component test pattern
   - Integration test pattern
   - Hook test pattern

6. **Coverage Guidelines**
   - 80%+ overall target
   - 100% for critical paths
   - Branch coverage important
   - Avoid coverage-only tests

7. **Best Practices**
   - Arrange-Act-Assert pattern
   - Focused tests (one assertion)
   - Descriptive test names
   - Clean up (beforeEach/afterEach)
   - Mock external dependencies
   - Test behavior, not implementation

8. **Debugging Tests**
   - console.log in tests
   - screen.debug()
   - fireEvent vs userEvent
   - Jest debugging

9. **Pre-commit Checks**
   - All tests must pass
   - 80%+ coverage
   - No console errors
   - No TypeScript errors

10. **Common Issues**
    - Async timeouts
    - Mock not working
    - Component not rendering
    - Navigation in tests

**Target:** 100+ lines with examples
  </action>
  <verify>
    <automated>wc -l /c/Users/DEFCON1/Desktop/"Cloud Cowork Ordner"/Projekte/"Bundesliga Match Analyzer"/"Bundesliga Match Analyzer"/docs/TEST.md 2>&1 | head -1</automated>
  </verify>
  <done>
TEST.md erstellt. 100+ Zeilen. Testing Guidelines, Patterns, Mocking, Best Practices dokumentiert.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
**Phase C Complete: Dark Mode, Detail Screens, Testing**

Alle 5 Sub-Phasen (C1-C5) implementiert:

**C-01: Dark Mode Infrastructure (18 tests)**
- ThemeContext with AsyncStorage persistence
- useTheme Hook + utilities
- Theme toggle in ProfileScreen
- Integrated in App provider hierarchy

**C-02: Dark Mode Screens (40 tests)**
- All 15+ screens with dynamic colors
- WCAG AA contrast verified
- Zero hardcoded colors
- Snapshot tests for critical screens

**C-03: Dark Mode Components (20 tests)**
- All 6+ components with dynamic colors
- useMemo optimization
- Color props threading
- Tests passing

**C-04: Detail Screens (25 tests)**
- PlayerDetailsScreen (name, position, stats)
- TeamDetailsScreen (logo, stadium, roster)
- MatchDetailsScreen (predictions, odds, stats)
- StadiumDetailsScreen (info, team history)
- SeasonStatsScreen (historical trends)

**C-05: Testing & Quality (100+ tests)**
- Fixed Jest configuration (AsyncStorage, RN Navigation)
- 35+ Hook unit tests (useAuth, useTheme, useToast)
- 15+ Utility unit tests (validators, formatters)
- 20+ Integration tests (auth, dark mode, navigation, data loading)
- 80%+ code coverage achieved
- Zero TypeScript errors
- TEST.md documentation complete

**Total Metrics:**
- 470+ tests passing (70 Phase A + 300 Phase B + 100 Phase C)
- 80%+ code coverage (lines, functions, statements)
- All 15+ screens Dark Mode ready
- All 6+ components Dark Mode ready
- All 5 detail screens fully implemented
- Zero TypeScript errors
- Zero console errors
  </what-built>
  <how-to-verify>
**Automated Verification:**
1. `cd mobile && npm test -- --coverage`
   - Expected: 470+ tests passing, 80%+ coverage
   - Pass/Fail indicators for all test suites

2. `npm run lint`
   - Expected: Zero errors

3. `npx tsc --noEmit`
   - Expected: No TypeScript errors

**Manual Verification (on device/simulator):**
1. Launch app
   - Expected: No console errors on startup
   
2. Navigate to ProfileScreen
   - Expected: Theme toggle button visible
   - Click toggle
   - Expected: App theme switches Light ↔ Dark instantly
   
3. Navigate to DashboardScreen
   - Expected: All colors update dynamically
   - Expected: No visual glitches
   
4. Navigate to detail screens
   - PlayerDetailsScreen, TeamDetailsScreen, MatchDetailsScreen, StadiumDetailsScreen, SeasonStatsScreen
   - Expected: All screens render in both light and dark modes
   - Expected: Data loads correctly
   - Expected: Refresh control works
   
5. Test refresh control
   - Pull to refresh on any detail screen
   - Expected: Data reloads
   - Expected: Loading state shows spinner
   
6. Test error handling
   - (Simulate API error if possible)
   - Expected: Error message displayed
   - Expected: Retry button functional
   
7. Close and reopen app
   - Expected: Theme preference persisted
   - Expected: All data still visible
   
8. Visual verification
   - Compare screenshots of screens in light and dark modes
   - Expected: WCAG AA contrast met (4.5:1 minimum for text)
   - Expected: Readability in both themes
  </how-to-verify>
  <resume-signal>
Type "approved" if all verifications pass. Phase C is complete and ready for Phase D planning.
Type "issues: [description]" if problems found. List specific issues for fixes.
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Test Coverage | 80%+ ensures critical paths tested |
| TypeScript | Prevents runtime type errors |
| AsyncStorage | User preferences stored locally (secure) |
| Navigation | App state persists correctly |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-C5-01 | Testing | Jest Setup | mitigate | Fixed AsyncStorage + RN Navigation mocks, verified tests pass |
| T-C5-02 | Coverage | Threshold | mitigate | 80%+ coverage enforced, critical paths tested |
| T-C5-03 | Code Quality | TypeScript | mitigate | npx tsc --noEmit verified, zero errors |

</threat_model>

<verification>
## Phase C5 Verification Checklist

1. **Jest Configuration Fixed** ✓
   - AsyncStorage mocking working
   - RN Navigation mocking working
   - 10+ previously failing tests now passing

2. **Unit Tests** (50+ total) ✓
   - 35+ Hook tests (useAuth, useTheme, useToast)
   - 15+ Utility tests (validators, formatters)

3. **Integration Tests** (20+ total) ✓
   - AuthFlow: 5+ tests
   - DarkModeFlow: 5+ tests
   - NavigationFlow: 5+ tests
   - DataLoadingFlow: 5+ tests

4. **Full Test Suite** ✓
   - 470+ tests passing (70 + 300 + 100)
   - 80%+ coverage achieved
   - Zero failures

5. **Code Quality** ✓
   - npm run lint: zero errors
   - npx tsc --noEmit: zero TypeScript errors
   - Zero console errors/warnings

6. **Documentation** ✓
   - TEST.md: 100+ lines
   - Testing guidelines documented
   - Patterns documented

7. **Manual Testing** ✓
   - App launches without errors
   - Theme toggle works + persists
   - All screens render in both themes
   - Detail screens load data + error handling
   - Refresh control works

</verification>

<success_criteria>
**Phase C erfolgreich abgeschlossen wenn:**

1. ✅ ThemeContext + useTheme Hook + AsyncStorage persistence
2. ✅ All 15+ screens with Dark Mode + WCAG AA contrast
3. ✅ All 6+ components with Dark Mode + useMemo optimization
4. ✅ All 5 detail screens fully implemented
5. ✅ 100+ new tests written
6. ✅ 470+ total tests passing (80%+ coverage)
7. ✅ Zero TypeScript errors
8. ✅ Zero console errors
9. ✅ TEST.md documentation complete
10. ✅ Checkpoint approval: Phase C production ready

</success_criteria>

<output>
Nach Checkpoint Approval:
1. Create `.planning/phases/C-dark-mode/C-05-SUMMARY.md`
2. Create `.planning/phases/C-dark-mode/PHASE_C_COMPLETE.md`
3. Update `.planning/ROADMAP.md` — Mark Phase C complete
4. Update `.planning/STATE.md` — Phase C completion status
5. Ready for Phase D planning
</output>
