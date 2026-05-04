---
phase: D-advanced
plan: 03
type: execute
wave: 3
depends_on: [01, 02]
files_modified: [mobile/src/services/PerformanceProfiler.ts, mobile/src/hooks/useMemoryMonitor.ts, mobile/src/utils/BundleSizeAnalyzer.ts, mobile/src/utils/NetworkOptimizer.ts, mobile/src/screens/PerformanceDebugScreen.tsx, mobile/src/__tests__/services/PerformanceProfiler.test.ts, mobile/src/__tests__/utils/BundleSizeAnalyzer.test.ts]
autonomous: true
requirements: [D3-PERFORMANCE-METRICS, D3-BUNDLE-SIZE-OPTIMIZATION, D3-MEMORY-PROFILING, D3-NETWORK-OPTIMIZATION]
must_haves:
  truths:
    - "App bundle size is less than 15 MB"
    - "First app launch time is less than 3 seconds"
    - "Screen navigation transitions are under 300ms"
    - "Memory usage stays below 100 MB during normal use"
    - "Frame rate is stable at 60 FPS"
    - "No memory leaks in production code"
  artifacts:
    - path: "mobile/src/services/PerformanceProfiler.ts"
      provides: "Performance metrics collection and analysis"
      exports: ["measureScreenLoad()", "measureComponentRender()", "getMetrics()"]
    - path: "mobile/src/hooks/useMemoryMonitor.ts"
      provides: "React hook for memory usage monitoring"
      exports: ["useMemoryMonitor()"]
    - path: "mobile/src/utils/BundleSizeAnalyzer.ts"
      provides: "Bundle size analysis and reporting"
      exports: ["analyzeBundleSize()", "getOptimizationRecommendations()"]
    - path: "mobile/src/utils/NetworkOptimizer.ts"
      provides: "Network request optimization"
      exports: ["optimizeNetworkRequests()", "getCacheStrategy()"]
    - path: "mobile/src/screens/PerformanceDebugScreen.tsx"
      provides: "Debug UI showing performance metrics"
      min_lines: 100
    - path: ".planning/PERFORMANCE_BASELINE.md"
      provides: "Established baseline for regression detection"
      contains: "measurement_date, bundle_size, memory, frame_rate, startup_time"
  key_links:
    - from: "mobile/src/screens/PerformanceDebugScreen.tsx"
      to: "mobile/src/services/PerformanceProfiler.ts"
      via: "useMemoryMonitor hook and metrics service"
      pattern: "getMetrics|useMemoryMonitor"
    - from: "mobile/src/utils/NetworkOptimizer.ts"
      to: "mobile/src/services/MatchAnalyticsService.ts"
      via: "request batching and caching"
      pattern: "cache|batch"
    - from: "mobile/src/hooks/useMemoryMonitor.ts"
      to: "mobile/src/services/PerformanceProfiler.ts"
      via: "memory metrics collection"
      pattern: "getMetrics"
---

<objective>
Profile, measure, and optimize app performance for production release.

**Purpose:**
- Achieve sub-3-second launch time
- Keep memory usage below 100 MB
- Maintain 60 FPS frame rate
- Optimize network requests and bundle size
- Establish performance baseline and regression detection

**Output:**
- PerformanceProfiler service for metrics collection
- useMemoryMonitor hook for memory tracking
- BundleSizeAnalyzer for bundle optimization
- NetworkOptimizer for request optimization
- PerformanceDebugScreen for metrics visualization
- Performance baseline report
- 20+ unit tests for performance utilities
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/D-advanced/D-01-PLAN.md
@.planning/phases/D-advanced/D-02-PLAN.md

## Phase D1-D2 Delivery

D-01 + D-02 delivered:
- ✅ MatchAnalyticsService with predictions
- ✅ PushNotificationManager and services
- ✅ usePushNotifications hook
- ✅ 60+ tests covering analytics and notifications

## Performance Targets

From PROJECT.md:
- Bundle size: < 15 MB
- First load: < 3s
- Navigation: < 300ms
- Memory: < 100 MB
- Frame rate: 60 FPS
- Request timeout: 10s
- Max retries: 3x with exponential backoff

## Available Tools & Libraries

- React Native DevTools — built-in profiling
- react-native-performance — metrics collection
- AsyncStorage — caching layer
- React.memo, useMemo, useCallback — optimization primitives
- NavigationPerformanceMonitor — navigation timing
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement PerformanceProfiler Service</name>
  <files>mobile/src/services/PerformanceProfiler.ts</files>
  <action>
Create PerformanceProfiler service for measuring and collecting performance metrics:

**Core Functions:**

1. `measureScreenLoad(screenName: string, startTime: number): void`
   - Measure screen navigation time from startTime to now
   - Calculate: current time - startTime (target: < 300ms)
   - Log metrics: screenName, duration, passed/failed status
   - Store in metrics array (keep last 100 measurements for memory efficiency)

2. `measureComponentRender(componentName: string, startTime: number): void`
   - Measure component render time from startTime to now
   - Target: < 100ms for critical components
   - Log metrics: componentName, duration, passed/failed

3. `getMetrics(): PerformanceMetrics`
   - Return current performance metrics object with:
     - Average screen load time
     - Average component render time
     - Memory usage (via React Native native APIs)
     - Frame rate (via native performance monitor)
     - Bundle size (from build artifacts)
   - Calculate percentiles: 50th, 90th, 95th for variance analysis

4. `reportPerformance(): PerformanceReport`
   - Generate comprehensive performance report JSON
   - Include: metrics, targets, pass/fail status
   - Highlight areas needing optimization
   - Return JSON-serializable report

5. `resetMetrics(): void`
   - Clear all collected metrics
   - Called before starting new profiling session

6. `getMemoryUsage(): Promise<MemoryInfo>`
   - Get current memory usage from native APIs
   - Return: heapSize, heapUsed, external memory info
   - Handle platform-specific APIs (iOS native, Android native)

**Performance Metrics Type:**
```typescript
interface PerformanceMetrics {
  screenLoadAvg: number;        // milliseconds
  componentRenderAvg: number;   // milliseconds
  memoryUsage: number;          // MB
  frameRate: number;            // FPS
  bundleSize: number;           // MB
  measurements: Measurement[];  // Array of individual measurements
}
```

**Error Handling:**
- Native API failures return null, continue measuring
- Invalid measurements filtered out (duration < 0 rejected)
- Memory queries graceful fallback to estimate

**TypeScript:**
- Define PerformanceMetrics, Measurement, MemoryInfo types
- No `any` types
- Export all types

**Optimization:**
- Lightweight tracking with minimal overhead
- Store last 100 measurements only (memory-efficient)
- Async memory queries (don't block rendering)
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/PerformanceProfiler.test.ts --coverage</automated>
  </verify>
  <done>Profiler exports 6 functions with full TypeScript types. 10+ unit tests passing (screen load measurement, component render timing, metrics calculation, memory queries, error handling). Lightweight profiling verified. No TypeScript errors.</done>
</task>

<task type="auto">
  <name>Task 2: Create useMemoryMonitor Hook</name>
  <files>mobile/src/hooks/useMemoryMonitor.ts</files>
  <action>
Create React hook for monitoring and tracking memory usage in real-time:

**Hook Interface:**
```typescript
const {
  memoryUsage,
  isWarning,
  isError,
  metrics,
  resetMetrics,
} = useMemoryMonitor(warningThreshold = 80, errorThreshold = 100);
```

**Key Features:**

1. **Memory Polling**
   - Poll memory usage every 5 seconds via useEffect
   - Use PerformanceProfiler.getMemoryUsage() for native queries
   - Update state with current memory in MB

2. **Threshold Monitoring**
   - isWarning: memory > warningThreshold (default 80 MB)
   - isError: memory > errorThreshold (default 100 MB)
   - States update in real-time for UI warnings

3. **Metrics Collection**
   - Track memory history (last 20 measurements)
   - Calculate average, min, max, trend for analysis
   - Detect potential memory leaks (steadily increasing trend)

4. **Cleanup**
   - Cancel polling on component unmount
   - Stop native memory queries on unmount
   - useEffect cleanup function prevents dangling intervals

5. **Manual Reset**
   - resetMetrics() clears history for new profiling session
   - Useful for profiling specific user actions

**Dependencies:**
- useEffect for polling setup/cleanup
- useRef for interval ID and history tracking
- Dependency array: [] (runs once on mount)

**TypeScript:**
- Define MemoryMonitorResult interface
- No `any` types
- Proper error handling for native APIs

**Accessibility:**
- None required for hook (UI responsibility)
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/hooks/useMemoryMonitor.test.ts --coverage</automated>
  </verify>
  <done>Hook exported and working. 8+ tests passing (polling setup, threshold monitoring, metrics tracking, cleanup, manual reset). Hook integrates with PerformanceProfiler. No memory leaks in hook itself. Dependency array correct.</done>
</task>

<task type="auto">
  <name>Task 3: Build BundleSizeAnalyzer Utility</name>
  <files>mobile/src/utils/BundleSizeAnalyzer.ts</files>
  <action>
Create utility for analyzing bundle size and providing optimization recommendations:

**Core Functions:**

1. `analyzeBundleSize(): Promise<BundleAnalysis>`
   - Read bundle size from build artifacts (index.android.bundle, main.jsbundle)
   - Calculate size breakdown: Total, JavaScript, Native modules, Assets
   - Return analysis object with all categories
   - Target: < 15 MB total

2. `getModuleSizes(): Promise<ModuleSize[]>`
   - List all npm modules and their sizes (via build tools integration)
   - Sort by size descending to identify largest contributors
   - Include usage information per module
   - Return array of {module, size, usage}

3. `getOptimizationRecommendations(): OptimizationRecommendation[]`
   - Analyze bundle and generate actionable recommendations:
     - "Remove unused dependencies" (if found with size info)
     - "Code split screens into lazy bundles" (if over 10 MB)
     - "Use lightweight alternative for X module" (if alternatives found)
     - "Tree-shake unused exports"
     - "Remove console.log() statements (15 KB saved)"
   - Prioritize by impact (KB saved)

4. `compareWithBaseline(currentSize: number, baselineSize: number): SizeComparison`
   - Compare current bundle size to established baseline
   - Calculate: delta in KB, percentage increase/decrease
   - Flag regressions: > 5% increase (deviation detection)
   - Celebrate improvements: > 5% decrease

5. `generateReport(analysis: BundleAnalysis): string`
   - Generate human-readable report text
   - Include: current size, targets, status, recommendations
   - Format: Markdown or JSON

**Bundle Analysis Type:**
```typescript
interface BundleAnalysis {
  total: number;              // MB
  javascript: number;        // MB
  nativeModules: number;     // MB
  assets: number;            // MB
  timestamp: number;         // Unix timestamp
  targetSize: number;        // 15 MB
  passed: boolean;           // total < targetSize
  moduleSizes: ModuleSize[]; // Per-module breakdown
}
```

**Error Handling:**
- Build artifacts missing: Return 0 and log warning
- Invalid size data: Filter out and recalculate
- Module analysis failure: Skip and continue with other modules

**TypeScript:**
- Define BundleAnalysis, ModuleSize, OptimizationRecommendation types
- No `any` types
- Export all types

**Data Sources:**
- Build artifacts: metro.config.js or react-native.config.js
- npm package.json: dependencies and devDependencies
- Code analysis: optional scan of src/ for unused imports
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/utils/BundleSizeAnalyzer.test.ts --coverage</automated>
  </verify>
  <done>Analyzer exports 5 functions with full TypeScript types. 8+ unit tests passing (bundle analysis, module sizes, recommendations, baseline comparison, reporting). Build artifact reading mocked. No TypeScript errors.</done>
</task>

<task type="auto">
  <name>Task 4: Build NetworkOptimizer Utility</name>
  <files>mobile/src/utils/NetworkOptimizer.ts</files>
  <action>
Create utility for optimizing network requests (caching, batching, compression):

**Core Functions:**

1. `optimizeNetworkRequests(requests: NetworkRequest[]): OptimizedRequests`
   - Analyze array of pending network requests
   - Group similar requests for batching (same endpoint)
   - Check cache for identical requests (avoid duplicates)
   - Apply compression recommendations
   - Return optimized request plan with savings estimates

2. `getCacheStrategy(endpoint: string): CacheStrategy`
   - Determine cache strategy per endpoint type:
     - `/api/predictions` → 30 minutes TTL
     - `/api/notifications/history` → 10 minutes TTL
     - `/api/models/metadata` → 1 hour TTL
     - `/api/matches` → 5 minutes TTL
   - Return: TTL (time-to-live), revalidation policy, compression

3. `batchRequests(requests: NetworkRequest[]): BatchRequest[]`
   - Group requests to same endpoint for batching
   - Combine into single POST request with array payload
   - Apply to: predictions, notifications, match data
   - Save bandwidth by reducing HTTP overhead

4. `estimateTransferSize(request: NetworkRequest): number`
   - Estimate request + response size in KB
   - Consider: headers, body, compression algorithm
   - Target: < 100 KB per request on 4G

5. `getNetworkOptimizations(): NetworkOptimization[]`
   - Analyze network patterns and suggest optimizations:
     - "Enable request caching for X endpoint" (if < 5min cache)
     - "Batch Y requests to reduce HTTP overhead"
     - "Use gzip compression for responses > 10 KB"
     - "Reduce response payload by removing unused fields"
   - Prioritize by bandwidth savings

**Cache Strategy Type:**
```typescript
interface CacheStrategy {
  endpoint: string;
  ttl: number;                    // Time-to-live in seconds
  revalidate: 'stale-while-revalidate' | 'network-first' | 'cache-first';
  maxAge: number;                 // Max cached items
  compression: 'gzip' | 'brotli' | 'none';
}
```

**Error Handling:**
- Unknown endpoints: Use default 5-min TTL
- Invalid requests: Skip and continue with valid ones
- Cache misses: Fall through to network

**TypeScript:**
- Define CacheStrategy, OptimizedRequests, NetworkOptimization types
- No `any` types
- Export all types

**Integration:**
- Use with MatchAnalyticsService for prediction batching
- Use with NotificationService for history caching
- Use with useMatchPrediction hook for smart caching
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/utils/NetworkOptimizer.test.ts --coverage</automated>
  </verify>
  <done>Optimizer exports 5 functions with full TypeScript types. 8+ unit tests passing (request optimization, cache strategies, batching, transfer size estimation, recommendations). Integration scenarios mocked. No TypeScript errors.</done>
</task>

<task type="auto">
  <name>Task 5: Create PerformanceDebugScreen</name>
  <files>mobile/src/screens/PerformanceDebugScreen.tsx</files>
  <action>
Create debug screen for viewing performance metrics (dev-only, hidden in production):

**Screen Layout:**

1. **Header Section**
   - Title: "Performance Metrics (Dev Only)"
   - Environment indicator: Development/Production build
   - Refresh button to re-measure

2. **Real-time Metrics Section**
   - Memory Usage: X MB / 100 MB limit
   - Memory graph: last 20 measurements with trend line
   - Warning/Error indicators if threshold exceeded

3. **Frame Rate Section**
   - Current FPS: 60 FPS
   - FPS graph: trend over time
   - Dropped frames counter
   - Target: 60 FPS visual indicator

4. **Bundle Size Section**
   - Total: 12.5 MB (Target: < 15 MB) ✅ or ❌
   - JavaScript: 8.2 MB
   - Native: 3.1 MB
   - Assets: 1.2 MB
   - Pass/Fail visual indicator

5. **Screen Load Performance Section**
   - Average load time: 250ms (Target: < 300ms)
   - Slowest screen: AnalyticsScreen (280ms)
   - Fastest screen: HomeScreen (120ms)
   - List of all screens with load times

6. **Optimization Recommendations Section**
   - List of suggestions from BundleSizeAnalyzer
   - Prioritized by estimated savings
   - Action buttons (e.g., "View details")

7. **Actions Section**
   - "Generate Performance Report" button (exports JSON)
   - "Reset Metrics" button
   - "Export to JSON" button for logging

**Loading & Error States:**
- Loading spinner while collecting metrics
- Error state if metrics unavailable
- Graceful degradation if native APIs unavailable

**Dark Mode:**
- Use getColors(mode) from useTheme hook
- All text respects theme colors
- Graphs use theme-appropriate colors

**Accessibility:**
- testID on all interactive elements
- Accessibility labels for metrics
- Screen reader support for numeric values

**Dev-Only Implementation:**
- Only show in development mode (check __DEV__ constant)
- Hide all metrics in production builds
- No sensitive data exposure

**TypeScript:**
- No `any` types
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/screens/PerformanceDebugScreen.test.ts --coverage</automated>
  </verify>
  <done>Screen created and renders correctly in development mode. 7+ tests passing (rendering, metrics display, dark mode, actions, accessibility). Screen integrates with PerformanceProfiler, useMemoryMonitor, and BundleSizeAnalyzer. No TypeScript errors. Dev-only gating working (__DEV__ check in place).</done>
</task>

<task type="auto">
  <name>Task 6: Write Unit Tests for PerformanceProfiler and BundleSizeAnalyzer</name>
  <files>mobile/src/__tests__/services/PerformanceProfiler.test.ts</files>
  <action>
Create comprehensive unit tests for performance-related services:

**Test Coverage:**

1. **PerformanceProfiler Tests (6+ tests)**
   - Test measureScreenLoad() records timing under 300ms target
   - Test measureComponentRender() records timing under 100ms
   - Test getMetrics() returns all required fields with correct types
   - Test reportPerformance() identifies pass/fail against targets
   - Test resetMetrics() clears history completely
   - Test getMemoryUsage() returns valid memory info
   - Test measurements array capacity (keep last 100 only)

2. **BundleSizeAnalyzer Tests (4+ tests)**
   - Test analyzeBundleSize() reports size under 15 MB target
   - Test getOptimizationRecommendations() prioritizes by impact
   - Test compareWithBaseline() detects regressions (> 5% increase)
   - Test generateReport() produces valid JSON output

3. **NetworkOptimizer Tests (4+ tests)**
   - Test getCacheStrategy() returns correct TTL per endpoint
   - Test batchRequests() groups similar requests correctly
   - Test optimizeNetworkRequests() reduces overhead
   - Test getNetworkOptimizations() suggests improvements

**Mocking Strategy:**
- Mock native memory APIs (non-blocking calls)
- Mock fetch/axios for network tests
- Mock file system for bundle analysis
- Use jest.useFakeTimers() for timing tests

**Test Pattern:**
```typescript
describe('PerformanceProfiler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('measureScreenLoad records timing under 300ms', () => {
    const startTime = Date.now();
    measureScreenLoad('HomeScreen', startTime);
    const metrics = getMetrics();
    expect(metrics.screenLoadAvg).toBeLessThan(300);
  });
});
```

**Coverage Goal:**
- 80%+ coverage for all performance services
- All error paths tested (invalid inputs, null responses)
- Edge cases covered (empty arrays, null values, zero values)
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/PerformanceProfiler.test.ts --coverage</automated>
  </verify>
  <done>14+ unit tests written and passing. Service coverage at 80%+. All error paths tested. Native API mocking working. No console errors. Test execution under 5 seconds.</done>
</task>

<task type="auto">
  <name>Task 7: Measure and Document Performance Baseline</name>
  <files>mobile/src/__tests__/utils/BundleSizeAnalyzer.test.ts</files>
  <action>
Measure performance baseline and create documentation for regression detection:

**Measurement Process:**

1. **Bundle Size Baseline**
   - Build production app
   - Measure bundle sizes: total, JavaScript, native, assets
   - Record: timestamps, app version, build date
   - Target baseline: < 15 MB
   - Store in `.planning/PERFORMANCE_BASELINE.md`

2. **Memory Usage Baseline**
   - Run app on test device
   - Measure baseline: app launch memory (after startup)
   - Measure after 10 screen navigations: memory usage
   - Measure after predictions: memory after analytics operations
   - Target baseline: < 80 MB average
   - Record in PERFORMANCE_BASELINE.md

3. **Frame Rate Baseline**
   - Measure FPS during app startup
   - Measure FPS during screen navigation (each major screen)
   - Measure FPS during analytics rendering (graphs)
   - Target: 60 FPS stable (no drops below 59)
   - Record in PERFORMANCE_BASELINE.md

4. **Load Time Baseline**
   - Measure app startup time: target < 3 seconds
   - Measure screen load times: for each screen
   - Measure component render times: critical paths
   - Record in PERFORMANCE_BASELINE.md

5. **Network Performance Baseline**
   - Measure typical request sizes (predictions, notifications)
   - Measure typical request times (4G, WiFi conditions)
   - Measure cache hit rates
   - Record in PERFORMANCE_BASELINE.md

**Documentation Format:**

Create `.planning/PERFORMANCE_BASELINE.md` with:
```markdown
# Performance Baseline — Phase D3

**Measurement Date:** 2026-05-15 (ISO 8601 format)
**App Version:** 1.0.0
**Baseline Status:** ESTABLISHED

## Bundle Size
- Total: 12.5 MB (Target: < 15 MB) ✅
- JavaScript: 8.2 MB
- Native: 3.1 MB
- Assets: 1.2 MB

## Memory Usage
- Baseline (app launch): 65 MB
- Average (during normal use): 75 MB
- Peak (intensive operations): 95 MB
- Target: < 100 MB ✅

## Frame Rate
- Average: 59.8 FPS (Target: 60 FPS) ✅
- Minimum: 58 FPS (stable)
- Dropped frames: 0.2%

## Load Times
- App startup: 2.1 seconds (Target: < 3s) ✅
- Average screen load: 250ms (Target: < 300ms) ✅
- Component render: 85ms (Target: < 100ms) ✅

## Network Performance
- Average request size: 45 KB
- Average response time: 180ms on 4G
- Cache hit rate: 35%

## Regression Detection
- [ ] Establish baseline first
- [ ] Run periodic tests
- [ ] Alert if > 5% regression
```

**TypeScript:**
- Create types for baseline measurements
- Store in TypeScript for compile-time validation

**Integration:**
- Link baseline to CI/CD pipeline (reference only, no enforcement in Phase D)
- Use for regression detection in future phases
- Reference in D-04 release checks
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/utils/BundleSizeAnalyzer.test.ts --coverage</automated>
  </verify>
  <done>Baseline measurements completed and documented. PERFORMANCE_BASELINE.md created with all required metrics. All measurements meet targets. Baseline established for future regression detection. Documentation is thorough and actionable.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Performance Metrics → Debug UI | Metrics only shown in dev mode; not exposed in production |
| Native APIs → JavaScript | Memory and frame rate queries via native bridge; validate responses |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-D3-01 | Information Disclosure | Debug Screen | Mitigate | Debug screen only visible in __DEV__ mode. Production builds don't expose metrics. |
| T-D3-02 | Denial of Service | Profiling Overhead | Mitigate | Profiling code is lightweight (< 1% overhead). Profiling can be disabled in production. |
| T-D3-03 | Tampering | Performance Baseline | Accept | Baseline is documentation only. No enforcement in code. For CI/CD, use separate system. |
| T-D3-04 | Information Disclosure | Memory Usage Data | Mitigate | Memory metrics don't contain user data, only app memory usage. Dev-only visibility. |
| T-D3-05 | Elevation of Privilege | Debug Features | Mitigate | Debug screen requires __DEV__ mode (build-time setting). Can't be enabled by user. |

## Security Checklist

- [ ] Debug screen hidden in production (__DEV__ check)
- [ ] No user data exposed in performance metrics
- [ ] Profiling overhead < 1% of execution time
- [ ] No sensitive information in logs
- [ ] Performance baseline not exposed to users
- [ ] Type safety enforced (no `any` types)
- [ ] Unit tests mock all external calls
</threat_model>

<verification>
**Phase D3 Verification Checklist:**

1. **PerformanceProfiler Implemented**
   - [ ] measureScreenLoad() working
   - [ ] measureComponentRender() working
   - [ ] getMetrics() returning complete metrics
   - [ ] Memory usage tracking working

2. **useMemoryMonitor Hook Implemented**
   - [ ] Memory polling working (every 5 seconds)
   - [ ] Threshold monitoring (warning/error states)
   - [ ] Metrics tracking and history
   - [ ] Cleanup on unmount

3. **BundleSizeAnalyzer Implemented**
   - [ ] Bundle analysis working
   - [ ] Module sizes calculated
   - [ ] Optimization recommendations generated
   - [ ] Baseline comparison working

4. **NetworkOptimizer Implemented**
   - [ ] Cache strategies defined per endpoint
   - [ ] Request batching working
   - [ ] Transfer size estimation accurate
   - [ ] Network optimizations suggested

5. **PerformanceDebugScreen Implemented**
   - [ ] Real-time metrics displayed
   - [ ] Memory graph rendering
   - [ ] Bundle size breakdown showing
   - [ ] Recommendations listed
   - [ ] Dark mode support complete

6. **Tests Passing**
   - [ ] 6+ PerformanceProfiler tests
   - [ ] 4+ BundleSizeAnalyzer tests
   - [ ] 4+ NetworkOptimizer tests
   - [ ] 7+ debug screen component tests
   - [ ] 80%+ coverage on critical paths
   - [ ] All Phase A/B/C/D1/D2 tests still passing (520+)

7. **Performance Baselines Established**
   - [ ] Bundle size < 15 MB ✅
   - [ ] Startup time < 3 seconds ✅
   - [ ] Screen load < 300ms ✅
   - [ ] Memory < 100 MB ✅
   - [ ] Frame rate 60 FPS ✅
   - [ ] PERFORMANCE_BASELINE.md created

8. **Code Quality**
   - [ ] Zero TypeScript errors
   - [ ] No hardcoded colors (all use theme)
   - [ ] No `any` types
   - [ ] Proper error handling
   - [ ] Debug screen dev-only (hidden in prod)
</verification>

<success_criteria>
**Phase D3 Complete When:**

1. ✅ All 7 tasks implemented and tested
2. ✅ PerformanceProfiler exports 6 functions with full types
3. ✅ useMemoryMonitor hook working with threshold monitoring
4. ✅ BundleSizeAnalyzer exports 5 functions
5. ✅ NetworkOptimizer exports 5 functions
6. ✅ PerformanceDebugScreen displaying all metrics
7. ✅ 14+ new tests written and passing
8. ✅ 80%+ coverage on critical services
9. ✅ Zero TypeScript errors
10. ✅ All 520+ Phase A/B/C/D1/D2 tests still passing
11. ✅ Performance baselines established and documented
12. ✅ All performance targets met:
    - Bundle: < 15 MB
    - Startup: < 3s
    - Navigation: < 300ms
    - Memory: < 100 MB
    - FPS: 60 FPS stable
13. ✅ PERFORMANCE_BASELINE.md created
14. ✅ Git commits made with clear messages
15. ✅ Ready for D4 (Production Release)
</success_criteria>

<output>
After completion, create `.planning/phases/D-advanced/D-03-SUMMARY.md` with:
- All 7 tasks completed with timing
- Test results (counts, coverage percentages)
- Performance baseline measurements
- Files created/modified listing
- Integration verification
- Git commit hash(es)
- Readiness statement for D4
- PERFORMANCE_BASELINE.md reference
</output>
