# Mobile Root Navigation — Implementation Documentation

**Status:** ✅ Complete (Phase A3, Mobile Navigation)  
**Files:** \mobile/src/_layout.tsx\, \mobile/src/navigation/types.ts\  
**Test Coverage:** 5+ test cases

---

## 📋 Overview

The Root Navigation system provides the entry point for the Bundesliga Match Analyzer mobile app. It implements conditional rendering based on authentication state, allowing the app to display either the Auth Stack (login/register) or the App Stack (dashboard/features) without page reloads.

**Key Components:**
1. **RootNavigator** — Main navigation orchestrator
2. **AuthNavigator** — Stack for unauthenticated users
3. **AppNavigator** — Stack for authenticated users
4. **Navigation Types** — Type-safe route definitions

**Architecture:**
`
RootNavigator (Main Entry Point)
├─ useAuth() hook → Check isAuthenticated
├─ isLoading → Show SplashScreen
├─ !isAuthenticated → Show AuthNavigator
│  ├─ LoginScreen (initial)
│  └─ RegisterScreen
└─ isAuthenticated → Show AppNavigator
   ├─ Dashboard (initial)
   ├─ WeekendCalculator
   └─ Detail Screens (TODO Phase A3)
`

---

## 🚀 Quick Start

### Basic Setup

In your app entry point (e.g., \App.tsx\ or \pp.json\):

\\\	ypescript
import RootNavigator from './src/_layout'
import { AuthProvider } from './src/context/AuthContext'
import { ToastProvider } from './src/context/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ToastProvider>
  )
}
\\\

### Navigation Flow

**Unauthenticated User:**
1. App starts → useAuth() returns { isAuthenticated: false }
2. RootNavigator renders AuthNavigator
3. User sees LoginScreen (initial route)
4. User can navigate to RegisterScreen
5. After successful login → isAuthenticated becomes true
6. Navigation automatically switches to AppNavigator

**Authenticated User:**
1. App starts → useAuth() returns { isAuthenticated: true, user: {...} }
2. RootNavigator renders AppNavigator
3. User sees DashboardScreen (initial route)
4. User can navigate to other screens
5. After logout → isAuthenticated becomes false
6. Navigation automatically switches to AuthNavigator

---

## 📐 Component API

### RootNavigator

\\\	ypescript
<RootNavigator />
\\\

**Props:** None (consumes auth state from AuthContext via useAuth hook)

**Behavior:**
1. Checks auth state with useAuth()
2. If \isLoading = true\ → Shows SplashScreen (loading indicator)
3. If \isAuthenticated = false\ → Shows AuthNavigator
4. If \isAuthenticated = true\ → Shows AppNavigator
5. Uses NavigationContainer with deep linking configuration

**Internal Stack Components:**
- AuthStack: For login/register flows
- AppStack: For main app features
- NavigationContainer: Wraps both with linking config

### AuthNavigator

Routes for unauthenticated users:

| Route | Component | Purpose |
|-------|-----------|---------|
| Login | LoginScreen | User login form (initial) |
| Register | RegisterScreen | User registration form |
| ForgotPassword | TBD (Phase B) | Password reset flow |

**Header Behavior:**
- All screens: \headerShown: false\
- Reason: Full-screen auth forms with custom styling

**Animations:**
- Login → Register: Slide animation (customizable per route)
- Pop animation on logout (replace transition)

### AppNavigator

Routes for authenticated users:

| Route | Component | Purpose |
|-------|-----------|---------|
| Dashboard | DashboardScreen | Main dashboard (initial) |
| WeekendCalculator | WeekendCalculatorScreen | Weekend calculation |
| MatchDetails | TBD (Phase A3) | Match details/stats |
| TeamDetails | TBD (Phase A3) | Team details/form |
| PlayerDetails | TBD (Phase A3) | Player details/stats |
| VirtualBetting | TBD (Phase A3) | Virtual betting interface |
| Predictions | TBD (Phase A3) | Match predictions |
| Profile | TBD (Phase A3) | User profile/settings |
| Settings | TBD (Phase A3) | App settings |
| Help | TBD (Phase A3) | Help/FAQ |

**Header Behavior:**
- All screens: \headerShown: true\
- Header color: \ackgroundColor: COLORS.surface\
- Back button: Always visible (except Dashboard)
- Title: Localized German labels

---

## 📱 Navigation Types

### AuthStackParamList

\\\	ypescript
type AuthStackParamList = {
  Login: undefined                          // No params needed
  Register: undefined                       // No params needed
  ForgotPassword: { email?: string }        // Optional email pre-fill
}
\\\

### AppStackParamList

\\\	ypescript
type AppStackParamList = {
  MainTabs: undefined
  Dashboard: undefined                      // No params
  WeekendCalculator: undefined              // No params
  MatchDetails: { matchId: string }         // Requires match ID
  TeamDetails: { teamId: string }           // Requires team ID
  PlayerDetails: { playerId: string }       // Requires player ID
  VirtualBetting: undefined
  Predictions: { matchId?: string }         // Optional match filter
  Profile: undefined
  Settings: undefined
  Help: undefined
}
\\\

### RootStackParamList

Combines both AuthStackParamList and AppStackParamList for full type coverage.

---

## 🔗 Deep Linking

Configured in \	ypes.ts\ linking configuration:

**Prefixes:**
- \https://app.bundesliga-analyzer.de\ (Production)
- \undesliga://\ (Custom scheme)

**Routes:**
- \login\ → LoginScreen
- \egister\ → RegisterScreen
- \orgot-password/:email\ → ForgotPassword screen
- \dashboard\ → DashboardScreen
- \weekend\ → WeekendCalculator
- \match/:matchId\ → MatchDetails (e.g., \match/12345\)
- \	eam/:teamId\ → TeamDetails
- \player/:playerId\ → PlayerDetails
- \etting\ → VirtualBetting
- \predictions/:matchId\ → Predictions
- \profile\ → ProfileScreen
- \settings\ → SettingsScreen
- \help\ → HelpScreen

**Example Deep Link:**
`
bundesliga://match/12345
→ Opens MatchDetailsScreen with matchId="12345"
`

---

## 🎨 Design Token Integration

**AuthNavigator:**
- Background: \COLORS.background\
- Card style: Inherited from screen components
- No system header (fullscreen design)

**AppNavigator:**
- Header background: \COLORS.surface\
- Header tint: \COLORS.blue\ (back button)
- Title color: \COLORS.text\
- Elevation: 4 (Android shadow)
- Card background: \COLORS.background\

**SplashScreen:**
- Background: \COLORS.background\
- Loading indicator: \COLORS.blue\

---

## ♿ Accessibility Features

**Navigation Structure:**
- Keyboard navigation works automatically via React Navigation
- Back gesture (iOS) and back button (Android) functional
- Screen titles announced by screen readers
- Focus management handled by NavigationContainer

**Dynamic Stack Switching:**
- isLoading state prevents navigation before auth check
- SplashScreen provides clear visual feedback
- No flashing between stacks (smooth transition)
- Error states handled by toast notifications

---

## 🧪 Testing

\\\ash
npm test mobile/__tests__/navigation/ -v

# Test coverage:
# ✓ RootNavigator (5 tests)
# Total: 5 test cases
\\\

**Test Cases:**
1. Shows loading indicator while auth initializing
2. Shows AuthStack when not authenticated
3. Shows AppStack when authenticated
4. Switches from AuthStack to AppStack after login
5. Switches from AppStack to AuthStack after logout

**Testing Approach:**
- Mock useAuth() hook with different states
- Mock screens to avoid rendering full component trees
- Rerender RootNavigator to test state changes
- Test conditional rendering logic

---

## 🔄 State Management Integration

### AuthContext Dependency

RootNavigator reads from AuthContext:

\\\	ypescript
const { isAuthenticated, isLoading } = useAuth()
\\\

**AuthContext must provide:**
- \isAuthenticated: boolean\ — Current auth state
- \isLoading: boolean\ — Loading flag during initialization
- \user?: User\ — Current user object (when authenticated)

**Workflow:**
1. App starts → AuthContext initializes from AsyncStorage
2. \isLoading = true\ during token validation
3. If refresh token valid → \isAuthenticated = true\
4. If no valid token → \isAuthenticated = false\
5. RootNavigator re-renders with correct stack

### ToastContext Dependency

Auth screens use ToastContext for notifications:

\\\	ypescript
<ToastProvider>
  <AuthProvider>
    <RootNavigator />
  </AuthProvider>
</ToastProvider>
\\\

Must wrap RootNavigator so auth errors can show toasts.

---

## 🔀 Integration with Other Patterns

**Works great with:**
- **AuthContext** — Provides authentication state
- **ToastContext** — Displays auth-related notifications
- **LoginScreen** — Auth stack entry point
- **RegisterScreen** — Auth flow secondary route
- **DashboardScreen** — App stack entry point
- **WeekendCalculatorScreen** — Protected app feature
- **Error Boundary** — Catches navigation/screen errors

**Navigation Flow Diagram:**
\\\
App.tsx
  ↓
ToastProvider
  ↓
AuthProvider (reads from AsyncStorage)
  ↓
RootNavigator (conditional rendering)
  ├─ If not authenticated → AuthNavigator
  │  ├─ LoginScreen → login form
  │  └─ RegisterScreen → registration form
  │     ↓ (after login) → triggers AuthContext update
  │
  └─ If authenticated → AppNavigator
     ├─ DashboardScreen → main dashboard
     ├─ WeekendCalculatorScreen → calculations
     └─ Detail Screens → match/team/player info
        ↓ (after logout) → triggers AuthContext update
\\\

---

## ✅ Checklist

Root Navigation Implementation:
- [x] RootNavigator component with conditional stacks
- [x] AuthNavigator stack (Login, Register)
- [x] AppNavigator stack (Dashboard, WeekendCalculator)
- [x] Navigation type definitions (AuthStackParamList, AppStackParamList)
- [x] Deep linking configuration
- [x] Loading state during auth initialization
- [x] Smooth transitions between stacks
- [x] Design token integration
- [x] Accessibility support
- [x] 5 unit tests
- [x] Comprehensive documentation

---

## 🎯 Next Steps

1. **App Entry Point** (Immediate)
   - Create or update \App.tsx\ to wrap with providers
   - Import RootNavigator
   - Ensure AuthProvider wraps everything

2. **Protected Screens** (Phase A3)
   - Create DashboardScreen if not exists
   - Create WeekendCalculatorScreen if not exists
   - Verify screens receive correct navigation props

3. **Detail Screens** (Phase A3)
   - Create MatchDetailsScreen with matchId param
   - Create TeamDetailsScreen with teamId param
   - Create PlayerDetailsScreen with playerId param
   - Create VirtualBettingScreen
   - Create PredictionsScreen
   - Create ProfileScreen
   - Create SettingsScreen
   - Create HelpScreen

4. **Advanced Navigation** (Phase B)
   - Modal stacks for dialogs (share, settings, etc.)
   - Tab navigation if needed
   - Nested navigation for complex flows
   - Custom transitions

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-26  
**Author:** Claude Code  
**Status:** ✅ Complete & Ready for App Integration
