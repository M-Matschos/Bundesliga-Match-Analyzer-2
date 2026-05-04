---
phase: D-advanced
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [mobile/src/services/MatchAnalyticsService.ts, mobile/src/hooks/useMatchPrediction.ts, mobile/src/context/AnalyticsContext.ts, mobile/src/screens/AnalyticsScreen.tsx, mobile/src/components/PredictionCard.tsx, mobile/src/components/ConfidenceIndicator.tsx, mobile/src/__tests__/services/MatchAnalyticsService.test.ts, mobile/src/__tests__/hooks/useMatchPrediction.test.ts]
autonomous: true
requirements: [D1-ANALYTICS, D1-ML-MODELS, D1-PREDICTION-CONFIDENCE, D1-BETTING-INSIGHTS]
must_haves:
  truths:
    - "User can view AI-powered match predictions with confidence levels"
    - "User can see betting insights and value-bet detection"
    - "Predictions update based on team form and historical data"
    - "Confidence levels are accurate and calibrated"
    - "System detects and displays overvalued/undervalued bets"
  artifacts:
    - path: "mobile/src/services/MatchAnalyticsService.ts"
      provides: "Ensemble ML prediction engine with 3+ model integration"
      exports: ["predictMatch()", "calculateConfidence()", "detectValueBets()"]
    - path: "mobile/src/hooks/useMatchPrediction.ts"
      provides: "React hook for prediction data loading and caching"
      exports: ["useMatchPrediction()"]
    - path: "mobile/src/context/AnalyticsContext.ts"
      provides: "Global state for analytics data and model metadata"
      exports: ["AnalyticsProvider", "useAnalytics()"]
    - path: "mobile/src/screens/AnalyticsScreen.tsx"
      provides: "Full analytics dashboard with predictions and insights"
      min_lines: 150
    - path: "mobile/src/components/PredictionCard.tsx"
      provides: "Card component showing match prediction details"
      min_lines: 80
    - path: "mobile/src/components/ConfidenceIndicator.tsx"
      provides: "Visual confidence level indicator (0-100%)"
      min_lines: 60
  key_links:
    - from: "mobile/src/screens/AnalyticsScreen.tsx"
      to: "mobile/src/services/MatchAnalyticsService.ts"
      via: "useMatchPrediction hook"
      pattern: "const.*useMatchPrediction"
    - from: "mobile/src/hooks/useMatchPrediction.ts"
      to: "mobile/src/services/MatchAnalyticsService.ts"
      via: "API calls to prediction service"
      pattern: "predictMatch|calculateConfidence"
    - from: "mobile/src/components/PredictionCard.tsx"
      to: "mobile/src/context/AnalyticsContext.ts"
      via: "theme and analytics context"
      pattern: "useAnalytics|useTheme"
---

<objective>
Build advanced match prediction engine with ML model integration, ensemble voting, and betting insight detection.

**Purpose:**
- Enable users to make informed betting decisions with AI-powered predictions
- Detect value bets where odds don't match predicted probability
- Provide confidence levels for prediction reliability
- Establish foundation for continuous model improvement

**Output:**
- MatchAnalyticsService with 3+ integrated ML models
- Ensemble prediction voting system
- Betting insight detection and display
- Analytics dashboard UI
- 30+ unit and integration tests
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/C-dark-mode/C-05-SUMMARY.md

## Phase C Completion Context

Phase C delivered:
- ✅ Dark Mode infrastructure (ThemeContext + useTheme hook)
- ✅ 15+ screens with dark mode support
- ✅ 6+ components with dark mode support
- ✅ 130+ tests passing
- ✅ 100% WCAG AA compliance

All screens now support `useTheme()` hook and dynamic colors via `getColors(mode)`.

## Available Services & Hooks (From Phase A-C)

Existing infrastructure available for D-01:
- `AuthContext` — User authentication state
- `ToastContext` — Toast notifications for feedback
- `ThemeContext` — Theme management (light/dark)
- `useAuth()` — Access to user/login state
- `useToast()` — Show toast notifications
- `useTheme()` — Access to current theme colors
- Navigation system — Type-safe routing
- AsyncStorage — Persistent data storage

## Backend API Assumptions

Assume these endpoints available from backend (FastAPI):
- `GET /api/matches/{id}` — Match details
- `POST /api/predictions` — Request predictions with match data
- `GET /api/predictions/{id}` — Get cached predictions
- `POST /api/bets/detect-value` — Detect value bets in odds
- `GET /api/models/metadata` — Model version info and confidence thresholds
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement MatchAnalyticsService with Ensemble Prediction Engine</name>
  <files>mobile/src/services/MatchAnalyticsService.ts</files>
  <action>
Create MatchAnalyticsService with ensemble ML prediction voting:

**Core Functions:**
1. `predictMatch(matchId: string, matchData: MatchData): Promise<PredictionResult>`
   - Accept match ID and historical data (home team, away team, recent form, etc.)
   - Call backend `/api/predictions` endpoint with match data
   - Return prediction object with probabilities and confidence

2. `calculateConfidence(predictions: ModelPrediction[]): number`
   - Take 3+ model predictions and calculate ensemble confidence
   - Confidence = (agreement_percentage * calibration_factor) * 100
   - Higher agreement between models = higher confidence
   - Cap at 95% maximum (never 100% sure)

3. `detectValueBets(odds: BettingOdds, prediction: PredictionResult): ValueBet[]`
   - Compare predicted probabilities vs. implied odds probability
   - Formula: implied_prob = 1 / odds_decimal
   - Value bet when: predicted_prob > implied_prob (by 3%+ threshold)
   - Return array of value bets with profit potential

4. `getModelMetadata(): Promise<ModelMetadata>`
   - Fetch model versions, types, and confidence thresholds from backend
   - Cache in memory for 1 hour with timestamp

**Error Handling:**
- Network errors: Retry 2x with exponential backoff (500ms, 1s)
- Invalid data: Return { error: string, fallback: default_prediction }
- API timeouts: 10-second timeout with graceful fallback
- Type validation: Validate response structure before returning

**TypeScript:**
- Define types: PredictionResult, ModelPrediction, ValueBet, BettingOdds, ModelMetadata
- No `any` types
- Export all types from service file

**Testing Integration:**
- Make all functions testable (dependency injection for API calls)
- Support mocking in jest (no hardcoded API URLs)
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/MatchAnalyticsService.test.ts --coverage</automated>
  </verify>
  <done>Service exports 4 main functions, all with full TypeScript types. 15+ unit tests passing (prediction logic, confidence calculation, value bet detection, error handling, caching). No network calls in unit tests (mocked). Service integrates with backend API.</done>
</task>

<task type="auto">
  <name>Task 2: Create useMatchPrediction Hook with Caching</name>
  <files>mobile/src/hooks/useMatchPrediction.ts</files>
  <action>
Create custom React hook for managing prediction data with caching:

**Hook Interface:**
```typescript
const { prediction, loading, error, refresh, confidence } = useMatchPrediction(matchId);
```

**Key Features:**
1. **Automatic Loading on Mount**
   - Call MatchAnalyticsService.predictMatch() on component mount
   - Set loading = true initially
   - On success: set prediction + confidence, loading = false
   - On error: set error message, loading = false

2. **Caching Strategy**
   - Cache predictions in memory using useRef (session-based)
   - Cache key = matchId
   - Return cached prediction immediately if available
   - Skip API call on re-renders with same matchId (memoization)
   - Cache expiry: 30 minutes (check timestamp)

3. **Manual Refresh Function**
   - refresh() clears cache for matchId and re-fetches
   - Used when user wants fresh prediction (e.g., after odds update)
   - Useful for pull-to-refresh patterns

4. **Error Recovery**
   - If API fails, return last cached prediction if available
   - Show error message in component
   - Provide refresh button to retry

**Dependencies:**
- Use useEffect for API calls with proper cleanup
- Use useCallback for refresh function
- Use useRef for cache object
- Dependency array: [matchId]

**TypeScript:**
- Define PredictionHookResult interface
- No `any` types
- Proper async/await error handling

**Accessibility:**
- None required for hook (UI concern for screen)
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/hooks/useMatchPrediction.test.ts --coverage</automated>
  </verify>
  <done>Hook exported and working. 10+ tests passing (loading states, caching, refresh, error handling, dependency array). Hook memoizes correctly and prevents infinite loops. Cache working as expected. Integration with MatchAnalyticsService verified.</done>
</task>

<task type="auto">
  <name>Task 3: Build AnalyticsContext for Global Prediction State</name>
  <files>mobile/src/context/AnalyticsContext.ts</files>
  <action>
Create React Context for managing analytics state globally (model metadata, prediction cache):

**Context State:**
```typescript
interface AnalyticsContextType {
  modelMetadata: ModelMetadata | null;
  predictions: Record<string, PredictionResult>; // Cache by matchId
  loading: boolean;
  error: string | null;
  fetchModelMetadata(): Promise<void>;
  clearCache(): void;
}
```

**Key Features:**
1. **Model Metadata Management**
   - Fetch model versions, types, confidence thresholds on app startup
   - Cache for entire app session
   - Used by UI to display model info (e.g., "Ensemble of 3 models")

2. **Prediction Cache**
   - Global cache for predictions keyed by matchId
   - Prevents duplicate API calls across screens
   - Shared between AnalyticsScreen and PredictionCard components

3. **Error Handling**
   - Global error state for model fetch failures
   - Graceful fallback to default metadata
   - Clear error on successful fetch

4. **AnalyticsProvider Component**
   - Wrap in App.tsx provider hierarchy (after ThemeProvider)
   - Fetch model metadata on mount
   - Provide context value to children

**Provider Hierarchy:**
```
GestureHandlerRootView
  → ThemeProvider
    → AnalyticsProvider (NEW)
      → NotificationProvider
        → Navigation
```

**TypeScript:**
- Full type safety, no `any` types
- Export AnalyticsProvider and useAnalytics hook

**Testing:**
- Make testable with provider fixtures
- Support mocking in jest
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/context/AnalyticsContext.test.ts --coverage</automated>
  </verify>
  <done>Context created and integrated into App.tsx. 8+ tests passing (provider initialization, metadata fetching, cache management, error handling). Hook exports working. No TypeScript errors. Provider integrated in correct position in hierarchy.</done>
</task>

<task type="auto">
  <name>Task 4: Create AnalyticsScreen with Predictions and Betting Insights</name>
  <files>mobile/src/screens/AnalyticsScreen.tsx</files>
  <action>
Create full analytics dashboard screen displaying predictions and value bets:

**Screen Layout:**
1. **Header Section**
   - Title: "Analytics & Predictions"
   - Refresh button (calls useMatchPrediction.refresh())
   - Model info badge (shows "Ensemble of 3 Models" from context)

2. **Upcoming Matches Section**
   - List of upcoming matches (fetch from backend /api/matches?status=upcoming)
   - Each match shows: Home vs Away, date/time, league

3. **Prediction Card Section**
   - For each upcoming match, show PredictionCard component with:
     - Team logos and names
     - Predicted outcome probabilities (Home Win %, Draw %, Away Win %)
     - Confidence indicator (0-100%, color-coded: red < 40%, yellow 40-70%, green > 70%)
     - Predicted winner badge

4. **Value Bets Section**
   - If value bets detected, show them below prediction
   - Each value bet shows: "Over 2.5 Goals @ 1.80 (Predicted: 2.1)"
   - Color indicator: green = good value
   - Calculate implied profit: (predicted_prob / odds) - 1

5. **Empty State**
   - If no matches available, show: "No upcoming matches"
   - Suggest checking back tomorrow

**Loading & Error States:**
- Loading spinner while fetching matches and predictions
- Error state with retry button if API fails
- Graceful fallback if predictions fail but matches load

**Dark Mode:**
- Use getColors(mode) from useTheme hook
- All text should respect theme colors
- Card backgrounds should use theme-appropriate colors

**Refresh Control:**
- Pull-to-refresh functionality (React Native ScrollView)
- Refresh calls useMatchPrediction.refresh() for all matches
- Show loading indicator during refresh

**Navigation:**
- Tap on prediction card → MatchDetailsScreen with prediction details
- Bottom tab to switch to other screens

**TypeScript:**
- Define UpcomingMatch, PredictionCard props interfaces
- No `any` types
- Proper async/await error handling

**Accessibility:**
- testID on all interactive elements
- Accessibility labels on icons (refresh button, etc.)
- Screen reader support for confidence levels ("87 percent confidence")
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/screens/AnalyticsScreen.test.ts --coverage</automated>
  </verify>
  <done>Screen created and renders correctly in both light and dark modes. 8+ tests passing (rendering, data loading, error states, navigation, dark mode). No TypeScript errors. Screen integrates with useMatchPrediction hook and AnalyticsContext. Pull-to-refresh working. Accessibility attributes in place.</done>
</task>

<task type="auto">
  <name>Task 5: Create PredictionCard Component</name>
  <files>mobile/src/components/PredictionCard.tsx</files>
  <action>
Create reusable card component for displaying match prediction:

**Props Interface:**
```typescript
interface IPredictionCardProps {
  homeTeam: Team;
  awayTeam: Team;
  prediction: PredictionResult;
  confidence: number;
  onPress?: () => void;
}
```

**Component Content:**
1. **Team Section**
   - Left: Home team logo + name
   - Center: VS text
   - Right: Away team logo + name
   - Larger font for team names

2. **Prediction Probabilities**
   - Home Win: {prediction.homeWinProb}%
   - Draw: {prediction.drawProb}%
   - Away Win: {prediction.awayWinProb}%
   - Small font, secondary color

3. **Confidence Indicator**
   - Use ConfidenceIndicator component (Task 6)
   - Shows {confidence}% with visual gauge
   - Color-coded (red/yellow/green based on confidence)

4. **Predicted Winner Badge**
   - Show winner emoji or text (e.g., "🏠 Home" if home favored)
   - Only if confidence > 50%

5. **Styling**
   - Card container with rounded corners and shadow
   - Use theme colors from useTheme() hook
   - Padding: 16px horizontal, 12px vertical
   - Background: theme.card (light mode: #FFFFFF, dark mode: #2A2A2A)
   - Border: 1px theme.border (light: #E0E0E0, dark: #3A3A3A)

**Dark Mode Support:**
- Get colors with: const { colors } = useTheme()
- Use colors.cardBackground, colors.text, colors.border
- Ensure text contrast meets WCAG AA

**Interaction:**
- Pressable wrapper for navigation
- onPress fires navigation to MatchDetailsScreen with prediction details
- Visual feedback on press (opacity change)

**TypeScript:**
- No `any` types
- Define all props interfaces

**Accessibility:**
- testID for testing
- Accessibility label: "{Home} vs {Away} prediction: {winner}"
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/components/PredictionCard.test.ts --coverage</automated>
  </verify>
  <done>Component created and renders correctly. 6+ tests passing (rendering, props, dark mode, onPress, accessibility). Component integrates with ConfidenceIndicator. Theme colors applied correctly. No TypeScript errors. Snapshot tests passing.</done>
</task>

<task type="auto">
  <name>Task 6: Create ConfidenceIndicator Component</name>
  <files>mobile/src/components/ConfidenceIndicator.tsx</files>
  <action>
Create visual confidence level indicator component (circular progress or gauge):

**Props Interface:**
```typescript
interface IConfidenceIndicatorProps {
  confidence: number; // 0-100
  size?: number; // Default: 60
}
```

**Component Design:**
1. **Circular Progress Indicator**
   - Use React Native Animated API or react-native-progress library
   - Show filled circle proportional to confidence (0-100%)
   - Inner text showing percentage (e.g., "87%")

2. **Color Coding**
   - Red: 0-40% (low confidence)
   - Yellow: 40-70% (medium confidence)
   - Green: 70-100% (high confidence)
   - Colors from theme palette (use getColors(mode))

3. **Sizing**
   - Default size: 60px diameter
   - Can be customized via size prop
   - Inner text scales with size

4. **Dark Mode**
   - Colors adapt to dark/light mode
   - Text color always readable (high contrast)

5. **Optional Label**
   - Below circle: "High Confidence" or "Medium Confidence" or "Low Confidence"
   - Optional, controlled via showLabel prop

**Styling:**
- Use StyleSheet.create() wrapped in useMemo for performance
- No hardcoded colors (all from theme)
- Proper spacing and alignment

**TypeScript:**
- No `any` types
- Optional props have defaults

**Accessibility:**
- testID for testing
- Accessibility label: "{confidence}% confidence"
- Screen reader support
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/components/ConfidenceIndicator.test.ts --coverage</automated>
  </verify>
  <done>Component created and renders correctly. 6+ tests passing (rendering, color coding, sizing, dark mode, accessibility). Component integrates with theme system. No TypeScript errors. Snapshot tests passing. Animations smooth (60 FPS).</done>
</task>

<task type="auto">
  <name>Task 7: Write Unit Tests for MatchAnalyticsService</name>
  <files>mobile/src/__tests__/services/MatchAnalyticsService.test.ts</files>
  <action>
Create comprehensive unit tests for MatchAnalyticsService:

**Test Coverage:**

1. **predictMatch() Tests (5+ tests)**
   - Test with valid match data → returns prediction with confidence
   - Test with invalid matchId → returns error
   - Test API timeout → returns fallback prediction
   - Test network error → retries 2x then fails gracefully
   - Test caching → second call returns cached result

2. **calculateConfidence() Tests (4+ tests)**
   - Test 3 models all agreeing → 95%+ confidence
   - Test 2 models agreeing, 1 different → 60-70% confidence
   - Test all models disagreeing → 20-30% confidence
   - Test edge case: empty predictions array → returns 0

3. **detectValueBets() Tests (4+ tests)**
   - Test odds 2.0 with predicted prob 0.6 → detects value bet
   - Test odds 2.0 with predicted prob 0.4 → no value bet
   - Test multiple odds → returns all value bets
   - Test no value bets detected → returns empty array

4. **getModelMetadata() Tests (2+ tests)**
   - Test first call → fetches from API
   - Test second call within 1 hour → returns cached result
   - Test cache expiry → re-fetches after 1 hour

**Mocking Strategy:**
- Mock API calls with jest.mock() of fetch/axios
- Mock AsyncStorage for caching (if used)
- Mock Date.now() for timestamp-based tests
- Use jest.useFakeTimers() for time-based tests

**Test Pattern:**
```typescript
describe('MatchAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('predictMatch returns prediction with valid data', async () => {
    const result = await predictMatch('match123', mockMatchData);
    expect(result.homeWinProb).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
  
  // More tests...
});
```

**Coverage Goal:**
- 80%+ coverage for MatchAnalyticsService
- All error paths tested
- All main functions covered
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/MatchAnalyticsService.test.ts --coverage</automated>
  </verify>
  <done>15+ unit tests written and passing. Service coverage at 80%+. All error paths tested. API mocking working correctly. No console errors. Test execution < 5 seconds.</done>
</task>

<task type="auto">
  <name>Task 8: Write Integration Tests for useMatchPrediction Hook and Context</name>
  <files>mobile/src/__tests__/hooks/useMatchPrediction.test.ts</files>
  <action>
Create integration tests for useMatchPrediction hook with AnalyticsContext:

**Test Coverage:**

1. **Hook Initialization Tests (3+ tests)**
   - Test hook mounts and starts loading
   - Test hook calls predictMatch with correct matchId
   - Test hook initializes with loading=true, prediction=null, error=null

2. **Successful Prediction Tests (3+ tests)**
   - Test prediction loads and updates state
   - Test confidence calculated correctly
   - Test loading state transitions: loading → data → !loading

3. **Error Handling Tests (3+ tests)**
   - Test API error → sets error state
   - Test network timeout → retries and fails gracefully
   - Test error state shows error message and allows retry

4. **Caching Tests (2+ tests)**
   - Test same matchId on re-render → uses cache, no API call
   - Test different matchId → makes new API call

5. **Refresh Tests (2+ tests)**
   - Test refresh() clears cache and re-fetches
   - Test refresh() updates prediction with new data

6. **Context Integration Tests (2+ tests)**
   - Test hook reads from AnalyticsContext
   - Test prediction gets stored in global cache

**Test Utilities:**
- Use renderHook from @testing-library/react-native
- Wrap with TestProviders (ThemeProvider, AnalyticsProvider, etc.)
- Mock MatchAnalyticsService calls
- Mock useNavigation if needed

**Test Pattern:**
```typescript
describe('useMatchPrediction', () => {
  test('loads prediction on mount', async () => {
    const { result } = renderHook(() => useMatchPrediction('match123'), {
      wrapper: TestProviders,
    });
    
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.prediction).toBeDefined();
    });
  });
  
  // More tests...
});
```

**Coverage Goal:**
- 80%+ coverage for useMatchPrediction hook
- All state transitions tested
- Cache behavior verified
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/hooks/useMatchPrediction.test.ts --coverage</automated>
  </verify>
  <done>10+ integration tests written and passing. Hook coverage at 80%+. Context integration verified. All state transitions working correctly. Cache behavior validated. No console errors during tests.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client → Backend API | Predictions received from backend; must validate structure |
| User Input → Analytics | User data (bets, preferences) stored locally; no sensitive PII |
| Model Confidence → User Decision | User may make financial decisions based on predictions; must be transparent about confidence |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-D1-01 | Spoofing | Backend API Response | Mitigate | Validate all API responses against expected schema in MatchAnalyticsService.predictMatch(). Use TypeScript types to enforce structure. |
| T-D1-02 | Tampering | Cached Predictions | Mitigate | Cache stored in app memory only (no disk persistence in D1). Cache expires after 30 minutes to prevent stale data influencing decisions. |
| T-D1-03 | Repudiation | Prediction History | Accept | App does not store prediction history; stateless predictions. User responsible for tracking their own decisions. |
| T-D1-04 | Information Disclosure | Model Metadata | Accept | Model metadata (versions, types) is non-sensitive. Exposed in UI for transparency. No API keys or secrets. |
| T-D1-05 | Denial of Service | API Rate Limiting | Mitigate | Backend rate limiting enforced (not in scope of D1). Client-side: Cache prevents duplicate requests within 30-min window. Max 3 retries with exponential backoff. |
| T-D1-06 | Elevation of Privilege | User Authentication | Mitigate | Predictions tied to authenticated user (AuthContext). No elevation of privilege attacks possible without breaking auth (handled in Phase A). |

## Security Checklist

- [ ] All API responses validated against schema in MatchAnalyticsService
- [ ] No API keys or secrets hardcoded in service files
- [ ] Cache expiry implemented (30 minutes)
- [ ] Retry logic with exponential backoff (max 3 retries)
- [ ] Error messages don't expose sensitive backend details
- [ ] Type safety enforced throughout (no `any` types)
- [ ] Unit tests mock external API calls
- [ ] No console.log() of sensitive data
</threat_model>

<verification>
**Phase D1 Verification Checklist:**

1. **Services Implemented**
   - [ ] MatchAnalyticsService created with 4 main functions
   - [ ] Ensemble voting logic working (3+ models)
   - [ ] Confidence calculation accurate
   - [ ] Value bet detection logic correct

2. **Hooks Implemented**
   - [ ] useMatchPrediction hook working
   - [ ] Caching implemented (30-min expiry)
   - [ ] Refresh function working
   - [ ] Error states handled

3. **Context Implemented**
   - [ ] AnalyticsContext created
   - [ ] AnalyticsProvider integrated in App.tsx
   - [ ] Global prediction cache working
   - [ ] Model metadata fetching

4. **UI Components Implemented**
   - [ ] AnalyticsScreen created and visible in navigation
   - [ ] PredictionCard component working with data
   - [ ] ConfidenceIndicator showing visual feedback
   - [ ] Dark mode support on all components

5. **Tests Passing**
   - [ ] 15+ unit tests for MatchAnalyticsService
   - [ ] 10+ integration tests for hooks/context
   - [ ] 8+ component tests for screens/cards
   - [ ] 80%+ coverage for critical paths
   - [ ] All Phase A & B tests still passing (470+)

6. **Code Quality**
   - [ ] Zero TypeScript errors
   - [ ] No hardcoded colors (all use theme)
   - [ ] No `any` types in TypeScript
   - [ ] Proper error handling throughout
   - [ ] WCAG AA contrast verified

7. **Integration**
   - [ ] AnalyticsScreen accessible from navigation
   - [ ] Dark mode toggle affects all analytics screens
   - [ ] Theme colors applied correctly
   - [ ] No console errors in development mode
</verification>

<success_criteria>
**Phase D1 Complete When:**

1. ✅ All 8 tasks implemented and tested
2. ✅ MatchAnalyticsService exports 4 functions with full TypeScript types
3. ✅ useMatchPrediction hook with caching and refresh working
4. ✅ AnalyticsContext integrated in provider hierarchy
5. ✅ AnalyticsScreen displays predictions and value bets
6. ✅ PredictionCard and ConfidenceIndicator components rendering
7. ✅ 33+ new tests written and passing (15 service + 10 hook + 8 component)
8. ✅ 80%+ coverage on critical services
9. ✅ Zero TypeScript errors
10. ✅ All 470+ Phase A/B/C tests still passing
11. ✅ WCAG AA accessibility verified
12. ✅ Dark mode support complete
13. ✅ Git commits made with clear messages
14. ✅ Ready for D2 (Push Notifications)
</success_criteria>

<output>
After completion, create `.planning/phases/D-advanced/D-01-SUMMARY.md` with:
- All 8 tasks completed with timing
- Test results (counts, coverage percentages)
- Files created/modified listing
- Integration verification
- Git commit hash(es)
- Readiness statement for D2
</output>
