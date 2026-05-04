import { NativeStackScreenProps } from '@react-navigation/native-stack'

/**
 * Root Navigation Stack Parameter Types
 *
 * Defines all route parameters for the application's navigation structure
 * Used for type-safe navigation and deep linking
 */

/**
 * Authentication Stack Routes (when user is not authenticated)
 */
export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: { email?: string }
}

/**
 * App Stack Routes (when user is authenticated)
 */
export type AppStackParamList = {
  MainTabs: undefined
  Dashboard: undefined
  WeekendCalculator: undefined
  MatchDetails: { matchId: string }
  TeamDetails: { teamId: string }
  PlayerDetails: { playerId: string }
  NotificationHistory: undefined
  VirtualBetting: undefined
  Predictions: { matchId?: string }
  Profile: undefined
  Settings: undefined
  Help: undefined
  PerformanceDebug: undefined
}

/**
 * Root Stack combines both Auth and App stacks
 */
export type RootStackParamList = AuthStackParamList & AppStackParamList

/**
 * Navigation Props for screens
 */
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>
export type DashboardScreenProps = NativeStackScreenProps<AppStackParamList, 'Dashboard'>
export type WeekendCalculatorScreenProps = NativeStackScreenProps<AppStackParamList, 'WeekendCalculator'>
export type MatchDetailsScreenProps = NativeStackScreenProps<AppStackParamList, 'MatchDetails'>
export type TeamDetailsScreenProps = NativeStackScreenProps<AppStackParamList, 'TeamDetails'>
export type PlayerDetailsScreenProps = NativeStackScreenProps<AppStackParamList, 'PlayerDetails'>
export type NotificationHistoryScreenProps = NativeStackScreenProps<AppStackParamList, 'NotificationHistory'>
export type VirtualBettingScreenProps = NativeStackScreenProps<AppStackParamList, 'VirtualBetting'>
export type PredictionsScreenProps = NativeStackScreenProps<AppStackParamList, 'Predictions'>
export type ProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'Profile'>
export type SettingsScreenProps = NativeStackScreenProps<AppStackParamList, 'Settings'>
export type HelpScreenProps = NativeStackScreenProps<AppStackParamList, 'Help'>
export type PerformanceDebugScreenProps = NativeStackScreenProps<AppStackParamList, 'PerformanceDebug'>

/**
 * Deep Link Configuration
 *
 * Maps URLs to navigation routes for deep linking
 * Example: https://app.bundesliga-analyzer.de/match/12345
 */
export const linking = {
  prefixes: [
    'https://app.bundesliga-analyzer.de',
    'bundesliga://',
  ],
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password/:email',

      // App screens
      Dashboard: 'dashboard',
      WeekendCalculator: 'weekend',
      MatchDetails: 'match/:matchId',
      TeamDetails: 'team/:teamId',
      PlayerDetails: 'player/:playerId',
      NotificationHistory: 'notifications',
      VirtualBetting: 'betting',
      Predictions: 'predictions/:matchId',
      Profile: 'profile',
      Settings: 'settings',
      Help: 'help',
      PerformanceDebug: 'performance-debug',

      // Catch-all for unmatched routes
      NotFound: '*',
    },
  },
}

/**
 * Navigation utilities
 */
export const getRouteKey = (routeName: string): string => {
  return routeName
}
