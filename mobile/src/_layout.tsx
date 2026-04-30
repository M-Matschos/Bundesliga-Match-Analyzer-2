import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from './hooks/useAuth'
import { useRegisterDevice } from './hooks/useRegisterDevice'
import { useNotification } from './context/NotificationContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import NotificationToast, { ToastNotification } from './components/NotificationToast'
import { getColors } from './theme/colors'
import { linking } from './navigation/types'

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen'
import RegisterScreen from './screens/auth/RegisterScreen'

// App Screens
import DashboardScreen from './screens/DashboardScreen'
import WeekendCalculatorScreen from './screens/WeekendCalculatorScreen'
import TeamDetailsScreen from './screens/TeamDetailsScreen'
import PlayerDetailsScreen from './screens/PlayerDetailsScreen'
import NotificationHistoryScreen from './screens/NotificationHistoryScreen'

// Navigation Types
import type { AuthStackParamList, AppStackParamList } from './navigation/types'

const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()

/**
 * AuthNavigator — Routes for unauthenticated users
 *
 * Stack:
 * - LoginScreen (initial)
 * - RegisterScreen
 * - ForgotPasswordScreen (TODO in Phase B)
 */
function AuthNavigator() {
  const { mode } = useTheme()
  const colors = getColors(mode)

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </AuthStack.Navigator>
  )
}

/**
 * AppNavigator — Routes for authenticated users
 *
 * Stack:
 * - DashboardScreen (initial)
 * - WeekendCalculatorScreen
 * - Other detail screens (TODO in Phase A3)
 */
function AppNavigator() {
  const { mode } = useTheme()
  const colors = getColors(mode)

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.blue,
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AppStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Übersicht',
          headerShown: true,
        }}
      />
      <AppStack.Screen
        name="WeekendCalculator"
        component={WeekendCalculatorScreen}
        options={{
          title: 'Wochenend-Kalkulation',
          headerShown: true,
        }}
      />
      <AppStack.Screen
        name="TeamDetails"
        component={TeamDetailsScreen}
        options={{
          title: 'Team-Details',
        }}
      />
      <AppStack.Screen
        name="PlayerDetails"
        component={PlayerDetailsScreen}
        options={{
          title: 'Spieler-Details',
        }}
      />
      <AppStack.Screen
        name="NotificationHistory"
        component={NotificationHistoryScreen}
        options={{
          title: 'Benachrichtigungen',
        }}
      />
    </AppStack.Navigator>
  )
}

/**
 * NavigationWithNotifications — Inner component that uses NotificationContext hooks
 * Wraps navigation with global NotificationToast
 */
function NavigationWithNotifications() {
  const { mode } = useTheme()
  const colors = getColors(mode)
  const { isAuthenticated } = useAuth()
  const { lastNotification } = useNotification()
  const [currentToast, setCurrentToast] = useState<ToastNotification | null>(null)

  // Update current toast when new notification arrives
  useEffect(() => {
    if (lastNotification) {
      setCurrentToast({
        id: lastNotification.id || 'notification-' + Date.now(),
        title: lastNotification.title || 'Benachrichtigung',
        body: lastNotification.body || '',
        matchId: lastNotification.matchId,
        screen: lastNotification.screen,
        action: lastNotification.action,
        type: 'info',
      })
    }
  }, [lastNotification])

  const handleToastPress = (notification: ToastNotification) => {
    // If notification has a screen/matchId, could navigate here
    // Example: navigate to MatchDetails with matchId
    console.log('Toast pressed:', notification)
  }

  return (
    <>
      <NavigationContainer linking={linking} fallback={<SplashScreen />}>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>

      {/* Global Toast Notification */}
      <NotificationToast
        notification={currentToast}
        onDismiss={() => setCurrentToast(null)}
        onPress={handleToastPress}
        duration={4000}
      />
    </>
  )
}

/**
 * RootNavigatorContent — Root navigation logic (uses hooks)
 *
 * Conditional rendering:
 * - If user is NOT authenticated → Show AuthStack
 * - If user is authenticated → Show AppStack
 * - If loading → Show splash screen
 *
 * Integrations:
 * - NotificationProvider: Manages push notifications and notification history
 * - useRegisterDevice: Registers device token with backend on app startup
 * - NotificationToast: Global toast for incoming notifications
 */
function RootNavigatorContent() {
  const { mode } = useTheme()
  const colors = getColors(mode)
  const { isAuthenticated, isLoading } = useAuth()

  // Initialize device token registration (Firebase Cloud Messaging)
  const { isRegistering, error: registerError } = useRegisterDevice()

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    )
  }

  return (
    <NotificationProvider>
      <NavigationWithNotifications />
    </NotificationProvider>
  )
}

/**
 * RootNavigator — Wraps app with ThemeProvider for Dark Mode support
 */
export default function RootNavigator() {
  return (
    <ThemeProvider>
      <RootNavigatorContent />
    </ThemeProvider>
  )
}

/**
 * SplashScreen — Loading indicator while app initializes
 */
function SplashScreen() {
  const { mode } = useTheme()
  const colors = getColors(mode)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.blue} />
    </View>
  )
}
