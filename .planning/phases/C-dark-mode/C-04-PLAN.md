---
phase: C-dark-mode
plan: 04
type: execute
wave: 3
depends_on: [C-02, C-03]
files_modified:
  - mobile/src/screens/PlayerDetailsScreen.tsx
  - mobile/src/screens/TeamDetailsScreen.tsx
  - mobile/src/screens/MatchDetailsScreen.tsx
  - mobile/src/screens/StadiumDetailsScreen.tsx
  - mobile/src/screens/SeasonStatsScreen.tsx
  - mobile/src/__tests__/screens/DetailScreens.test.tsx
autonomous: true
requirements:
  - F2.1
  - F2.2
  - F2.3
  - F2.4
  - F2.5
  - F2.6
user_setup: []

must_haves:
  truths:
    - Alle 5 Detail Screens navigieren korrekt
    - Alle Screens laden und zeigen Daten
    - Refresh Control funktioniert
    - Error States gehandhabt
    - Loading States zeigen Spinner
    - Alle Screens in Light + Dark Mode
  artifacts:
    - path: mobile/src/screens/PlayerDetailsScreen.tsx
      provides: Player profile with stats
      min_lines: 100
    - path: mobile/src/screens/TeamDetailsScreen.tsx
      provides: Team info with roster
      min_lines: 100
    - path: mobile/src/screens/MatchDetailsScreen.tsx
      provides: Match analytics
      min_lines: 100
    - path: mobile/src/screens/StadiumDetailsScreen.tsx
      provides: Stadium information
      min_lines: 80
    - path: mobile/src/screens/SeasonStatsScreen.tsx
      provides: Historical trends
      min_lines: 100

---

<objective>
Phase C4: Detail Screens Implementation — Implementiere 5 Detail Screens (PlayerDetailsScreen, TeamDetailsScreen, MatchDetailsScreen, StadiumDetailsScreen, SeasonStatsScreen) mit vollständigen Data Loading, Error Handling, Refresh Control, und Dark Mode Support.

**Output:**
- 5 fully implemented detail screens
- Mock data for testing
- 25+ integration tests
- All screens in light and dark modes
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/C-dark-mode/C-02-PLAN.md
@.planning/phases/C-dark-mode/C-03-PLAN.md
@mobile/src/theme/colors.ts
@mobile/src/hooks/useTheme.ts
</execution_context>

<context>
## Dependencies

**Blocking:** C-02 (Screens Dark Mode) + C-03 (Components Dark Mode) müssen komplett sein.

## 5 Detail Screens

1. **PlayerDetailsScreen** — name, position, team, jersey, stats
2. **TeamDetailsScreen** — logo, stadium, founded, season stats, squad roster
3. **MatchDetailsScreen** — teams, date, time, stadium, predictions, odds, stats
4. **StadiumDetailsScreen** — name, location, capacity, year opened, team history
5. **SeasonStatsScreen** — historical trends, season-by-season stats

## Common Patterns

- useState for loading/error/data
- useEffect for API calls
- useFocusEffect for screen refresh
- RefreshControl component
- Spinner + ErrorBoundary
- useTheme + getColors()
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implementiere PlayerDetailsScreen + TeamDetailsScreen</name>
  <files>
    - mobile/src/screens/PlayerDetailsScreen.tsx
    - mobile/src/screens/TeamDetailsScreen.tsx
  </files>
  <action>
**PlayerDetailsScreen:**
1. Route params: playerId
2. useState: loading, error, data
3. useEffect: Lade player data (API or mock)
4. UI:
   - Header: name, position, team, jersey
   - Stats card: goals, assists, appearances, rating
   - Defensive stats: tackles, interceptions, clearances
   - Goalkeeper stats: saves, clean sheets (if GK)
   - Refresh control at top
5. States: Loading (Spinner), Error (retry button), Success (data)
6. Dark mode: useTheme + getColors()
7. testID for testing

**TeamDetailsScreen:**
1. Route params: teamId
2. useState: loading, error, data
3. useEffect: Lade team data
4. UI:
   - Header: logo, name, stadium, founded
   - Season stats: wins, draws, losses, points, goal diff
   - Squad roster: key players list
   - Recent results: last 5 matches
   - Refresh control
5. States: Loading, Error, Success
6. Dark mode: useTheme + getColors()
7. testID for testing

**Both:**
- Mock data in __mocks__
- useFocusEffect for refresh on screen focus
- RefreshControl with onRefresh callback
- useMemo for computed values
- getColors() for all colors
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="PlayerDetailsScreen|TeamDetailsScreen" --no-coverage 2>&1 | grep -E "PASS|FAIL"</automated>
  </verify>
  <done>
PlayerDetailsScreen + TeamDetailsScreen implementiert. Data loading, error handling, refresh control funktional. Dark mode. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 2: Implementiere MatchDetailsScreen + StadiumDetailsScreen</name>
  <files>
    - mobile/src/screens/MatchDetailsScreen.tsx
    - mobile/src/screens/StadiumDetailsScreen.tsx
  </files>
  <action>
**MatchDetailsScreen:**
1. Route params: matchId
2. useState: loading, error, data
3. useEffect: Lade match data + predictions + odds
4. UI:
   - Header: home vs away, date, time, stadium
   - Prediction: confidence, probabilities (home/draw/away)
   - Odds: display odds, highlight value bets
   - Match stats: xG, possession %, shots, corners, cards
   - Refresh control
5. States: Loading, Error, Success
6. Dark mode: useTheme + getColors()
7. testID

**StadiumDetailsScreen:**
1. Route params: stadiumId
2. useState: loading, error, data
3. useEffect: Lade stadium data
4. UI:
   - Header: name, image/photo
   - Info: location, capacity, year opened
   - Team history: teams played there
   - Optional: directions link
5. States: Loading, Error, Success
6. Dark mode: useTheme + getColors()
7. testID

**Both:**
- Mock data
- useFocusEffect
- RefreshControl
- useMemo
- getColors()
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="MatchDetailsScreen|StadiumDetailsScreen" --no-coverage 2>&1 | grep -E "PASS|FAIL"</automated>
  </verify>
  <done>
MatchDetailsScreen + StadiumDetailsScreen implementiert. Predictions, odds, stats funktional. Dark mode. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 3: Implementiere SeasonStatsScreen</name>
  <files>mobile/src/screens/SeasonStatsScreen.tsx</files>
  <action>
**SeasonStatsScreen:**
1. Route params: entityId (team or league)
2. useState: loading, error, data, selectedSeason
3. useEffect: Lade historical data
4. UI:
   - Header: entity name
   - Season selector: dropdown/tabs for year selection
   - Statistics table/cards:
     - Team: wins, draws, losses, points, goals for/against
     - League: top scorers, top teams, standings
   - Refresh control
5. States: Loading, Error, Success
6. Dark mode: useTheme + getColors()
7. testID

**Implementation:**
- Mock data for 3-5 seasons
- useFocusEffect
- RefreshControl
- useMemo
- getColors()
- Optional: animated transitions
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="SeasonStatsScreen" --no-coverage 2>&1 | grep -E "PASS|FAIL"</automated>
  </verify>
  <done>
SeasonStatsScreen implementiert. Season selector, stats display funktional. Dark mode. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 4: Schreibe 25+ Integration Tests für Detail Screens</name>
  <files>mobile/src/__tests__/screens/DetailScreens.test.tsx</files>
  <action>
**Test-Struktur (5+ pro Screen):**

```typescript
describe('PlayerDetailsScreen', () => {
  it('renders loading state with spinner', () => {})
  it('renders error state with retry button', () => {})
  it('renders player data correctly', () => {})
  it('refresh control triggers data reload', () => {})
  it('renders correctly in dark mode', () => {})
})
```

**Tests pro Screen:**
1. PlayerDetailsScreen: 5 tests
2. TeamDetailsScreen: 5 tests
3. MatchDetailsScreen: 5 tests
4. StadiumDetailsScreen: 3 tests
5. SeasonStatsScreen: 5 tests
6. Integration: 2+ tests (navigation, back button)

**Total:** 25+ tests

**Test Categories:**
- Loading state (Spinner)
- Error state (retry button)
- Success state (data display)
- Refresh control
- Dark mode rendering
- Navigation & back button
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="DetailScreens.test" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
DetailScreens.test.tsx hat 25+ Tests. Alle States getestet. Dark mode verified. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 5: Überprüfe Navigation für Detail Screens</name>
  <files>
    - mobile/src/navigation/types.ts
    - mobile/src/__tests__/navigation/DetailScreenNavigation.test.tsx
  </files>
  <action>
Stelle sicher dass Navigation konfiguriert:

1. **Navigation Types** (in types.ts):
   - PlayerDetailsScreenRoute: { playerId: string }
   - TeamDetailsScreenRoute: { teamId: string }
   - MatchDetailsScreenRoute: { matchId: string }
   - StadiumDetailsScreenRoute: { stadiumId: string }
   - SeasonStatsScreenRoute: { entityId: string }

2. **Stack Navigator:**
   - Detail screens in Stack
   - Back button funktional
   - Params passed korrekt

3. **Deep Linking** (optional):
   - player/:playerId
   - team/:teamId
   - match/:matchId
   - stadium/:stadiumId
   - season/:entityId

4. **Tests:**
   - Navigate list → detail
   - Back button works
   - Params passed
   - Dark mode persists
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="Navigation" --no-coverage 2>&1 | grep -E "PASS|FAIL"</automated>
  </verify>
  <done>
Navigation für Detail Screens konfiguriert. Types definiert. Tests passing. Back button funktional.
  </done>
</task>

</tasks>

<success_criteria>
1. All 5 Detail Screens fully implemented
2. Data loading with states
3. Refresh control on all screens
4. 25+ Tests written and passing
5. Dark mode verified
6. Navigation working
7. Zero TypeScript errors
8. Ready for Phase C5
</success_criteria>

<output>
Nach Completion: `.planning/phases/C-dark-mode/C-04-SUMMARY.md`
</output>
