---
phase: D-advanced
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified: [mobile/src/services/NotificationService.ts, mobile/src/services/PushNotificationManager.ts, mobile/src/hooks/usePushNotifications.ts, mobile/src/screens/NotificationSettingsScreen.tsx, mobile/src/context/NotificationPreferencesContext.ts, mobile/src/components/NotificationCard.tsx, mobile/src/__tests__/services/PushNotificationManager.test.ts, mobile/src/__tests__/hooks/usePushNotifications.test.ts]
autonomous: false
requirements: [D2-PUSH-NOTIFICATIONS, D2-NOTIFICATION-PREFERENCES, D2-NOTIFICATION-HISTORY, D2-NOTIFICATION-PERMISSIONS]
must_haves:
  truths:
    - "User receives push notifications for upcoming matches"
    - "User can enable/disable notifications per match type"
    - "User sees notification history with timestamps"
    - "System requests platform permissions at runtime"
    - "Notifications include match prediction and odds information"
  artifacts:
    - path: "mobile/src/services/PushNotificationManager.ts"
      provides: "Cross-platform push notification handling"
      exports: ["requestPermissions()", "subscribeToTopic()", "unsubscribeFromTopic()"]
    - path: "mobile/src/services/NotificationService.ts"
      provides: "Notification preference management and history"
      exports: ["getPreferences()", "updatePreferences()", "getHistory()"]
    - path: "mobile/src/hooks/usePushNotifications.ts"
      provides: "React hook for managing push notification state"
      exports: ["usePushNotifications()"]
    - path: "mobile/src/context/NotificationPreferencesContext.ts"
      provides: "Global state for notification preferences"
      exports: ["NotificationPreferencesProvider", "useNotificationPreferences()"]
    - path: "mobile/src/screens/NotificationSettingsScreen.tsx"
      provides: "Settings UI for notification preferences"
      min_lines: 120
    - path: "mobile/src/components/NotificationCard.tsx"
      provides: "Card component for displaying notification"
      min_lines: 70
  key_links:
    - from: "mobile/src/screens/NotificationSettingsScreen.tsx"
      to: "mobile/src/context/NotificationPreferencesContext.ts"
      via: "useNotificationPreferences hook"
      pattern: "const.*useNotificationPreferences"
    - from: "mobile/src/hooks/usePushNotifications.ts"
      to: "mobile/src/services/PushNotificationManager.ts"
      via: "permission requests and subscriptions"
      pattern: "requestPermissions|subscribeToTopic"
    - from: "mobile/src/services/NotificationService.ts"
      to: "mobile/src/context/NotificationPreferencesContext.ts"
      via: "preference storage and sync"
      pattern: "AsyncStorage|preferences"
---

<objective>
Implement cross-platform push notification system with permission handling, preference management, and notification history.

**Purpose:**
- Alert users about upcoming matches, prediction updates, and value bets
- Provide granular control over notification types
- Maintain notification history for reference
- Handle iOS/Android permission flows gracefully

**Output:**
- PushNotificationManager for cross-platform integration
- NotificationService for preference and history management
- NotificationSettingsScreen for user control
- NotificationPreferencesContext for global state
- 25+ unit and integration tests
- ✅ **CHECKPOINT: User verifies notification permissions and delivery**
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

## Phase D1 Delivery

D-01 delivered:
- ✅ MatchAnalyticsService with ensemble predictions
- ✅ useMatchPrediction hook with caching
- ✅ AnalyticsScreen with predictions and value bets
- ✅ PredictionCard and ConfidenceIndicator components
- ✅ 33+ tests covering analytics

## Push Notification Ecosystem

Available infrastructure for D-02:
- React Native (native platform modules available)
- AsyncStorage — for preference persistence
- AuthContext — to get current user
- ToastContext — for feedback notifications
- ThemeContext — for dark mode support
- Navigation system — for deep linking from notifications

## Third-Party Libraries

Using expo-notifications for cross-platform push:
- expo-notifications — Cross-platform push handling
- expo-permissions — Runtime permission requests
- Backend sends via Firebase Cloud Messaging (FCM)

## Backend API Assumptions

Assume these endpoints available:
- `POST /api/notifications/subscribe` — Subscribe to topics
- `POST /api/notifications/unsubscribe` — Unsubscribe from topics
- `GET /api/notifications/preferences` — Get preferences
- `PUT /api/notifications/preferences` — Update preferences
- `GET /api/notifications/history` — Get notification history
- `POST /api/notifications/mark-read` — Mark notification read
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement PushNotificationManager for Cross-Platform Integration</name>
  <files>mobile/src/services/PushNotificationManager.ts</files>
  <action>
Create PushNotificationManager service for handling iOS/Android push notifications:

**Core Functions:**

1. `requestPermissions(): Promise<PermissionStatus>`
   - Request notification permissions from OS (platform-specific)
   - iOS: Use expo-permissions to request notification permission
   - Android: Request notification runtime permission (Android 13+)
   - Return status: 'granted' | 'denied' | 'undetermined'
   - Handle user declining permissions gracefully

2. `subscribeToTopic(topic: string, userId: string): Promise<void>`
   - Subscribe user to notification topic
   - Topics: "upcoming_matches", "value_bets", "prediction_updates"
   - Call backend POST /api/notifications/subscribe
   - Store subscription in AsyncStorage as backup
   - Validate topic exists before subscribing

3. `unsubscribeFromTopic(topic: string, userId: string): Promise<void>`
   - Unsubscribe from topic
   - Call backend POST /api/notifications/unsubscribe
   - Remove from AsyncStorage
   - Handle already-unsubscribed gracefully

4. `registerForRemoteNotifications(userId: string): Promise<void>`
   - Initialize push notification system on app launch
   - Get FCM device token via expo-notifications
   - Send token to backend for message delivery
   - Store token in AsyncStorage

5. `handleNotificationReceived(notification: RemoteNotification): void`
   - Process incoming notification in foreground
   - Parse notification data (match info, odds, etc.)
   - Show toast or in-app notification
   - OS manages background handling

6. `getDeviceToken(): Promise<string | null>`
   - Retrieve current device FCM token
   - Return null if not available

**Error Handling:**
- Permission denied: Handle gracefully, suggest settings
- Network errors: Retry 2x with exponential backoff
- Invalid topics: Validate against predefined list
- Device token issues: Log warning, continue without notifications

**TypeScript:**
- Define types: PermissionStatus, RemoteNotification, NotificationTopic
- No `any` types
- Export all types

**Platform-Specific:**
- Use Platform.OS for detection
- Abstract platform differences
- Support both iOS and Android
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/PushNotificationManager.test.ts --coverage</automated>
  </verify>
  <done>Manager exports 6 functions with full TypeScript types. 12+ unit tests passing (permission requests, topic subscription, device token handling, error scenarios). Platform-specific code tested with mocks. No network calls in tests (mocked). Ready for platform integration.</done>
</task>

<task type="auto">
  <name>Task 2: Build NotificationService for Preferences and History</name>
  <files>mobile/src/services/NotificationService.ts</files>
  <action>
Create NotificationService for managing notification preferences and history:

**Core Functions:**

1. `getPreferences(userId: string): Promise<NotificationPreferences>`
   - Fetch user's notification preferences from backend
   - Cache locally using AsyncStorage (5-min expiry)
   - Return preferences object with all toggle states
   - Fallback to default preferences if network fails

2. `updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>`
   - Update notification preferences on backend
   - Call PUT /api/notifications/preferences
   - Update AsyncStorage cache immediately
   - Revert on backend failure with error

3. `getHistory(userId: string, limit?: number): Promise<Notification[]>`
   - Fetch notification history from backend
   - Default limit: 50 notifications
   - Sort by timestamp (newest first)
   - Include read/unread status

4. `markAsRead(notificationId: string): Promise<void>`
   - Mark notification as read on backend
   - Update local cache
   - Remove unread badge if applicable

5. `clearHistory(userId: string): Promise<void>`
   - Clear notification history
   - Call backend DELETE endpoint
   - Remove from AsyncStorage cache

**Notification Preferences Structure:**
```typescript
interface NotificationPreferences {
  upcomingMatches: boolean;
  predictionUpdates: boolean;
  valueBetAlerts: boolean;
  matchReminders: boolean;
  oddChangesAlerts: boolean;
  newsAndUpdates: boolean;
  notificationsEnabled: boolean;
}
```

**Error Handling:**
- Network errors: Use cached preferences as fallback
- Invalid responses: Return default preferences
- AsyncStorage failures: Graceful degradation
- Backend validation errors: User-friendly errors

**TypeScript:**
- Define NotificationPreferences and Notification types
- No `any` types
- Proper error handling

**Caching Strategy:**
- Preferences cache expiry: 5 minutes
- History cache: 10 minutes
- Use AsyncStorage with timestamp validation
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/NotificationService.test.ts --coverage</automated>
  </verify>
  <done>Service exports 5 functions with full TypeScript types. 10+ unit tests passing (preference fetching/updating, history retrieval, caching, error handling). Caching strategy validated. No TypeScript errors.</done>
</task>

<task type="auto">
  <name>Task 3: Create usePushNotifications Hook</name>
  <files>mobile/src/hooks/usePushNotifications.ts</files>
  <action>
Create custom React hook for managing push notification state:

**Hook Interface:**
```typescript
const {
  permissionStatus,
  preferences,
  history,
  loading,
  error,
  requestPermissions,
  updatePreferences,
  refreshHistory,
  markAsRead,
} = usePushNotifications();
```

**Key Features:**

1. **Permission Management**
   - Check permission status on mount
   - requestPermissions() function to request at runtime
   - Update permissionStatus in state
   - Show permission prompt if needed

2. **Preferences Loading**
   - Load user preferences on mount
   - Fetch from NotificationService
   - Set loading = true while fetching
   - Handle errors gracefully

3. **updatePreferences() Function**
   - Update preferences via NotificationService
   - Optimistic update (update UI immediately)
   - Show toast on success
   - Revert on failure with error toast

4. **History Loading**
   - Load notification history on mount or refreshHistory() call
   - Keep last 50 notifications in state
   - Pagination support (optional)

5. **markAsRead() Function**
   - Mark notification as read
   - Update history in state
   - Call NotificationService.markAsRead()

6. **Error Handling**
   - Set error state on failures
   - Provide user-friendly error messages
   - Allow retry via refreshHistory()

**Dependencies:**
- useEffect for initialization and cleanup
- useCallback for functions
- useRef for permission status tracking
- Dependency array: [userId from useAuth()]

**TypeScript:**
- Define PushNotificationHookResult interface
- No `any` types
- Proper async/await error handling

**Accessibility:**
- None required for hook
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/hooks/usePushNotifications.test.ts --coverage</automated>
  </verify>
  <done>Hook exported and working. 8+ tests passing (permission requests, preference loading, updates, history refresh, error handling). Hook integrates with NotificationService and PushNotificationManager. No infinite loops. Dependency array correct.</done>
</task>

<task type="auto">
  <name>Task 4: Build NotificationPreferencesContext</name>
  <files>mobile/src/context/NotificationPreferencesContext.ts</files>
  <action>
Create React Context for managing notification preferences globally:

**Context State:**
```typescript
interface NotificationPreferencesContextType {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences(prefs: Partial<NotificationPreferences>): Promise<void>;
  refetchPreferences(): Promise<void>;
}
```

**Key Features:**

1. **Preferences State Management**
   - Load preferences on provider mount
   - Store in context for app-wide access
   - Sync with backend on updates

2. **Real-time Updates**
   - updatePreferences() immediately updates UI
   - Also updates backend
   - Revert on backend failure

3. **Global Cache**
   - Prevents duplicate API calls
   - Shared across NotificationSettingsScreen and other components
   - 5-minute cache expiry

4. **NotificationPreferencesProvider Component**
   - Wrap in App.tsx after AnalyticsProvider
   - Fetch preferences on mount
   - Provide context value to children

**Provider Hierarchy:**
```
GestureHandlerRootView
  → ThemeProvider
    → AnalyticsProvider
      → NotificationPreferencesProvider (NEW)
        → NotificationProvider
          → Navigation
```

**TypeScript:**
- Full type safety, no `any` types
- Export provider and hook

**Testing:**
- Make testable with provider fixtures
- Support mocking in jest
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/context/NotificationPreferencesContext.test.ts --coverage</automated>
  </verify>
  <done>Context created and integrated into App.tsx. 7+ tests passing (provider initialization, preference fetching, updates, caching, error handling). Hook exports working. No TypeScript errors. Provider in correct hierarchy position.</done>
</task>

<task type="auto">
  <name>Task 5: Create NotificationSettingsScreen</name>
  <files>mobile/src/screens/NotificationSettingsScreen.tsx</files>
  <action>
Create settings screen for notification preferences:

**Screen Layout:**

1. **Header Section**
   - Title: "Notification Settings"
   - Back button

2. **Master Toggle Section**
   - Toggle: "Enable Notifications"
   - Shows permission status (enabled/disabled in settings)
   - If disabled, show prompt: "Enable in Settings"

3. **Notification Types Section**
   - Toggle switches for each preference:
     - Upcoming Matches
     - Prediction Updates
     - Value Bet Alerts
     - Match Reminders
     - Odds Changes
     - News & Updates

4. **Notification History Section**
   - List of recent notifications (last 20)
   - Each entry shows: title, timestamp, read/unread status
   - Tap to dismiss or view details
   - Clear History button at bottom

5. **Loading & Error States**
   - Loading spinner while fetching preferences
   - Error message with retry button if fetch fails
   - Loading indicator while updating toggles

**Interaction:**
- Toggle switch updates preferences immediately
- Show loading indicator during update
- Toast confirmation on successful update
- Toast error if update fails (with retry option)
- Tap history item for details or navigation

**Dark Mode:**
- Use getColors(mode) from useTheme hook
- All text respects theme colors

**Accessibility:**
- testID on all toggles
- Accessibility labels for each toggle
- Screen reader support for list items

**TypeScript:**
- No `any` types
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/screens/NotificationSettingsScreen.test.ts --coverage</automated>
  </verify>
  <done>Screen created and renders correctly in both light and dark modes. 7+ tests passing (rendering, toggle interactions, history display, dark mode, error states). Screen integrates with NotificationPreferencesContext and usePushNotifications hook. No TypeScript errors. Accessibility attributes in place.</done>
</task>

<task type="auto">
  <name>Task 6: Create NotificationCard Component</name>
  <files>mobile/src/components/NotificationCard.tsx</files>
  <action>
Create card component for displaying a notification:

**Props Interface:**
```typescript
interface INotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onDismiss?: () => void;
  unread?: boolean;
}
```

**Component Content:**

1. **Header**
   - Left: Icon (notification type)
   - Right: Timestamp
   - Unread badge if unread = true

2. **Title & Description**
   - Bold title
   - Description with details
   - Smaller font for secondary info

3. **Content Area**
   - Match info if applicable
   - Prediction info if applicable

4. **Action Area**
   - Dismiss/X button on right
   - Tap card to navigate

5. **Styling**
   - Card with rounded corners and shadow
   - Use theme colors from useTheme()
   - Unread: highlighted background
   - Read: dimmed appearance
   - Left border accent (colored by type)

**Dark Mode Support:**
- Get colors with const { colors } = useTheme()
- Ensure text contrast meets WCAG AA

**Interaction:**
- onPress: Navigate or show details
- onDismiss: Remove from history or mark read
- Visual feedback on press (opacity)

**TypeScript:**
- No `any` types
- Define Notification type

**Accessibility:**
- testID for testing
- Accessibility label for screen readers
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/components/NotificationCard.test.ts --coverage</automated>
  </verify>
  <done>Component created and renders correctly. 6+ tests passing (rendering, props, callbacks, dark mode, unread state). Component integrates with theme system. No TypeScript errors. Snapshot tests passing.</done>
</task>

<task type="auto">
  <name>Task 7: Write Unit Tests for PushNotificationManager</name>
  <files>mobile/src/__tests__/services/PushNotificationManager.test.ts</files>
  <action>
Create comprehensive unit tests for PushNotificationManager:

**Test Coverage:**

1. **requestPermissions() Tests (3+ tests)**
   - Test on iOS with permission granted
   - Test on Android with permission denied
   - Test caching of already-granted permissions

2. **subscribeToTopic() Tests (3+ tests)**
   - Test valid topic subscription
   - Test invalid topic returns error
   - Test network error with retry

3. **unsubscribeFromTopic() Tests (2+ tests)**
   - Test valid unsubscription
   - Test already-unsubscribed handling

4. **registerForRemoteNotifications() Tests (2+ tests)**
   - Test gets device token and sends to backend
   - Test token retrieval from cache

5. **handleNotificationReceived() Tests (2+ tests)**
   - Test parses notification and shows toast
   - Test invalid notification handling

**Mocking Strategy:**
- Mock expo-permissions and expo-notifications
- Mock fetch/axios for backend calls
- Mock AsyncStorage
- Mock Platform.OS for iOS/Android tests

**Test Pattern:**
```typescript
describe('PushNotificationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('requestPermissions returns granted on iOS', async () => {
    Platform.OS = 'ios';
    const status = await requestPermissions();
    expect(status).toBe('granted');
  });
});
```

**Coverage Goal:**
- 80%+ coverage for PushNotificationManager
- All error paths tested
- Platform-specific code covered
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/services/PushNotificationManager.test.ts --coverage</automated>
  </verify>
  <done>12+ unit tests written and passing. Manager coverage at 80%+. All platform-specific code tested. Error scenarios covered. No console errors. Test execution under 5 seconds.</done>
</task>

<task type="auto">
  <name>Task 8: Write Integration Tests for usePushNotifications Hook</name>
  <files>mobile/src/__tests__/hooks/usePushNotifications.test.ts</files>
  <action>
Create integration tests for usePushNotifications hook with services:

**Test Coverage:**

1. **Initialization Tests (2+ tests)**
   - Test hook loads permissions and preferences on mount
   - Test loading = true during initialization

2. **Permission Tests (3+ tests)**
   - Test requestPermissions() requests from manager
   - Test permission status updates correctly
   - Test permission denied handling

3. **Preferences Tests (3+ tests)**
   - Test preferences load from service
   - Test updatePreferences() updates UI and backend
   - Test preferences failure handling

4. **History Tests (2+ tests)**
   - Test history loads on mount
   - Test refreshHistory() reloads

5. **markAsRead() Tests (2+ tests)**
   - Test marks notification as read
   - Test updates history in state

6. **Error Recovery Tests (2+ tests)**
   - Test error state clears on retry
   - Test error messages are user-friendly

**Test Utilities:**
- Use renderHook from @testing-library/react-native
- Wrap with TestProviders including NotificationPreferencesProvider
- Mock services and AsyncStorage

**Test Pattern:**
```typescript
describe('usePushNotifications', () => {
  test('loads permissions and preferences on mount', async () => {
    const { result } = renderHook(() => usePushNotifications(), {
      wrapper: TestProviders,
    });
    
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.preferences).toBeDefined();
    });
  });
});
```

**Coverage Goal:**
- 80%+ coverage for usePushNotifications hook
- All state transitions tested
- Integration with services verified
  </action>
  <verify>
    <automated>npm test -- mobile/src/__tests__/hooks/usePushNotifications.test.ts --coverage</automated>
  </verify>
  <done>8+ integration tests written and passing. Hook coverage at 80%+. Integration with PushNotificationManager and NotificationService verified. All state transitions working. No console errors during tests.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Push notification system with permission requests, preference management, and notification history display.</what-built>
  <how-to-verify>
1. Build and run app on iOS device or simulator
2. Grant notification permissions when prompted
3. Navigate to Settings → Notification Settings
4. Toggle notification preferences and verify toggles update
5. Send test notification from backend
6. Verify notification appears in notification center
7. Check NotificationHistoryScreen shows received notification
8. Toggle "Enable Notifications" off and verify no new notifications
9. Check notification badges work (unread count)
10. Test on both light and dark modes
11. Verify all accessibility labels are present
  </how-to-verify>
  <resume-signal>
Type "approved" if notification system works correctly, or describe any issues:
- Permission requests flow
- Notification delivery
- Preference persistence
- History display
- Dark mode rendering
- Accessibility features
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client → Push Service | Notifications from backend; validate structure |
| User Permission → OS | Permission grant is OS-enforced; app respects decision |
| Device Token → Backend | Device token sent for message delivery; secure handling |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-D2-01 | Spoofing | Incoming Notifications | Mitigate | Validate notification structure in handleNotificationReceived(). Verify signature if using FCM. |
| T-D2-02 | Tampering | Device Token | Mitigate | Device token stored in AsyncStorage only. Rotate token on app uninstall. |
| T-D2-03 | Repudiation | Notification Sent | Accept | Backend logs notifications sent. App logs in dev console. User responsible for settings. |
| T-D2-04 | Information Disclosure | Notification History | Mitigate | History stored locally in AsyncStorage, not synced elsewhere. User can clear anytime. No PII. |
| T-D2-05 | Denial of Service | Permission Requests | Mitigate | OS handles permission UI (no spam). Backend rate-limits notifications per user. |
| T-D2-06 | Elevation of Privilege | Preferences Update | Mitigate | Update tied to authenticated user. Backend validates user_id match. |

## Security Checklist

- [ ] Notification payload validated in handleNotificationReceived()
- [ ] No sensitive PII in notification titles/bodies
- [ ] Device token stored securely (AsyncStorage)
- [ ] Permission requests respect OS flow
- [ ] Notification history clearable by user
- [ ] Type safety enforced (no `any` types)
- [ ] Unit tests mock all external calls
</threat_model>

<verification>
**Phase D2 Verification Checklist:**

1. **PushNotificationManager Implemented**
   - [ ] requestPermissions() working on iOS and Android
   - [ ] subscribeToTopic() working with backend sync
   - [ ] Device token retrieval working
   - [ ] handleNotificationReceived() processing notifications

2. **NotificationService Implemented**
   - [ ] getPreferences() fetching and caching
   - [ ] updatePreferences() updating backend and cache
   - [ ] getHistory() retrieving notification history
   - [ ] markAsRead() marking notifications read

3. **Hooks Implemented**
   - [ ] usePushNotifications hook working
   - [ ] Permission status tracked
   - [ ] Preferences loading/updating
   - [ ] History management

4. **Context Implemented**
   - [ ] NotificationPreferencesContext created
   - [ ] Provider integrated in App.tsx
   - [ ] Global state working

5. **UI Components Implemented**
   - [ ] NotificationSettingsScreen accessible
   - [ ] Toggle switches working
   - [ ] History display working
   - [ ] NotificationCard rendering correctly
   - [ ] Dark mode support complete

6. **Tests Passing**
   - [ ] 12+ unit tests for PushNotificationManager
   - [ ] 8+ integration tests for hook
   - [ ] 6+ component tests for screens/cards
   - [ ] 80%+ coverage on critical paths
   - [ ] All Phase A/B/C/D1 tests still passing (500+)

7. **Permissions & Delivery**
   - [ ] iOS permission prompt working
   - [ ] Android permission prompt working
   - [ ] Test notification received successfully
   - [ ] Preferences persist across app restart

8. **Code Quality**
   - [ ] Zero TypeScript errors
   - [ ] No hardcoded colors (all use theme)
   - [ ] No `any` types
   - [ ] Proper error handling
   - [ ] WCAG AA contrast verified
</verification>

<success_criteria>
**Phase D2 Complete When:**

1. ✅ All 8 tasks implemented (7 auto + 1 checkpoint)
2. ✅ PushNotificationManager exports 6 functions with full types
3. ✅ NotificationService exports 5 functions with preferences/history
4. ✅ usePushNotifications hook working with state management
5. ✅ NotificationPreferencesContext integrated in provider hierarchy
6. ✅ NotificationSettingsScreen displaying and updating preferences
7. ✅ NotificationCard component rendering notifications
8. ✅ 20+ new tests written and passing (12 manager + 8 hook + 6 component)
9. ✅ 80%+ coverage on critical services
10. ✅ Zero TypeScript errors
11. ✅ All 500+ Phase A/B/C/D1 tests still passing
12. ✅ WCAG AA accessibility verified
13. ✅ Dark mode support complete
14. ✅ Checkpoint: User verifies notification delivery works
15. ✅ Git commits made with clear messages
16. ✅ Ready for D3 (Performance Optimization)
</success_criteria>

<output>
After completion, create `.planning/phases/D-advanced/D-02-SUMMARY.md` with:
- All 8 tasks completed with timing
- Checkpoint verification results
- Test results (counts, coverage percentages)
- Files created/modified listing
- Integration verification
- Git commit hash(es)
- Readiness statement for D3
</output>
