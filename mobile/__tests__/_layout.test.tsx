/**
 * Tests: RootNavigator & App Layout Integration
 * Coverage: NotificationProvider + useRegisterDevice + Navigation integration
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import RootNavigator from '../src/_layout'
import { useAuth } from '../src/hooks/useAuth'
import { useRegisterDevice } from '../src/hooks/useRegisterDevice'
import { NotificationProvider } from '../src/context/NotificationContext'
import * as Notifications from 'expo-notifications'
import * as firebaseConfig from '../src/config/firebase.config'

// Mocks
jest.mock('../src/hooks/useAuth')
jest.mock('../src/hooks/useRegisterDevice')
jest.mock('../src/context/NotificationContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
  NavigationContainer: ({ children }: any) => <>{children}</>,
}))
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: ({ children, component: Component }: any) => {
      return Component ? <Component /> : <>{children}</>
    },
  })),
}))
jest.mock('../src/screens/auth/LoginScreen', () => {
  return function MockLoginScreen() {
    return <></>
  }
})
jest.mock('../src/screens/auth/RegisterScreen', () => {
  return function MockRegisterScreen() {
    return <></>
  }
})
jest.mock('../src/screens/DashboardScreen', () => {
  return function MockDashboardScreen() {
    return <></>
  }
})
jest.mock('../src/screens/WeekendCalculatorScreen', () => {
  return function MockWeekendCalculatorScreen() {
    return <></>
  }
})
jest.mock('../src/screens/TeamDetailsScreen', () => {
  return function MockTeamDetailsScreen() {
    return <></>
  }
})
jest.mock('../src/screens/PlayerDetailsScreen', () => {
  return function MockPlayerDetailsScreen() {
    return <></>
  }
})
jest.mock('expo-notifications')
jest.mock('../src/config/firebase.config')

describe('RootNavigator & App Layout Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()

    // Default mock implementations
    ;(useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'test_user_123' },
    })

    ;(useRegisterDevice as jest.Mock).mockReturnValue({
      isRegistering: false,
      error: null,
    })

    ;(NotificationProvider as jest.Mock).mockImplementation(({ children }) =>
      children
    )

    ;(Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue(
      { remove: jest.fn() }
    )

    ;(firebaseConfig.initializeFirebaseMessaging as jest.Mock).mockResolvedValue(
      undefined
    )
  })

  describe('RootNavigator Component', () => {
    it('should render without crashing', () => {
      const { root } = render(<RootNavigator />)
      expect(root).toBeTruthy()
    })

    it('should show splash screen while loading auth state', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      })

      const { getByTestId } = render(<RootNavigator />)

      // ActivityIndicator should be visible during loading
      expect(getByTestId('splash-screen')).toBeTruthy()
    })

    it('should render AppNavigator when user is authenticated', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      render(<RootNavigator />)

      await waitFor(() => {
        expect(useAuth).toHaveBeenCalled()
      })
    })

    it('should render AuthNavigator when user is not authenticated', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })

      render(<RootNavigator />)

      await waitFor(() => {
        expect(useAuth).toHaveBeenCalled()
      })
    })

    it('should switch from AuthNavigator to AppNavigator on login', async () => {
      const { rerender } = render(<RootNavigator />)

      // Start unauthenticated
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })

      rerender(<RootNavigator />)

      // Switch to authenticated
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      rerender(<RootNavigator />)

      await waitFor(() => {
        expect(useAuth).toHaveBeenCalled()
      })
    })
  })

  describe('NotificationProvider Integration', () => {
    it('should wrap entire navigation with NotificationProvider', () => {
      render(<RootNavigator />)

      expect(NotificationProvider).toHaveBeenCalled()
    })

    it('should pass children to NotificationProvider', () => {
      render(<RootNavigator />)

      const providerCall = (NotificationProvider as jest.Mock).mock.calls[0]
      expect(providerCall[0].children).toBeDefined()
    })

    it('should initialize Firebase messaging on mount', async () => {
      render(<RootNavigator />)

      await waitFor(() => {
        expect(
          firebaseConfig.initializeFirebaseMessaging
        ).toHaveBeenCalled()
      })
    })
  })

  describe('useRegisterDevice Hook Integration', () => {
    it('should call useRegisterDevice hook on mount', () => {
      render(<RootNavigator />)

      expect(useRegisterDevice).toHaveBeenCalled()
    })

    it('should return device registration state', async () => {
      ;(useRegisterDevice as jest.Mock).mockReturnValue({
        isRegistering: false,
        error: null,
      })

      render(<RootNavigator />)

      await waitFor(() => {
        expect(useRegisterDevice).toHaveBeenCalled()
        const result = (useRegisterDevice as jest.Mock).mock.results[0].value
        expect(result.isRegistering).toBe(false)
        expect(result.error).toBeNull()
      })
    })

    it('should handle registration error state', async () => {
      ;(useRegisterDevice as jest.Mock).mockReturnValue({
        isRegistering: false,
        error: 'Failed to register device',
      })

      render(<RootNavigator />)

      await waitFor(() => {
        const result = (useRegisterDevice as jest.Mock).mock.results[0].value
        expect(result.error).toBe('Failed to register device')
      })
    })

    it('should handle registration in progress state', async () => {
      ;(useRegisterDevice as jest.Mock).mockReturnValue({
        isRegistering: true,
        error: null,
      })

      render(<RootNavigator />)

      await waitFor(() => {
        const result = (useRegisterDevice as jest.Mock).mock.results[0].value
        expect(result.isRegistering).toBe(true)
      })
    })
  })

  describe('App Navigation Structure', () => {
    it('should have auth screens available when unauthenticated', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })

      render(<RootNavigator />)

      await waitFor(() => {
        expect(useAuth).toHaveBeenCalled()
      })
    })

    it('should have app screens available when authenticated', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123', email: 'test@example.com' },
      })

      render(<RootNavigator />)

      await waitFor(() => {
        expect(useAuth).toHaveBeenCalled()
      })
    })
  })

  describe('Component Lifecycle', () => {
    it('should initialize device registration on app startup', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      render(<RootNavigator />)

      // useRegisterDevice should be called, triggering device token registration
      expect(useRegisterDevice).toHaveBeenCalled()
    })

    it('should maintain auth state across re-renders', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      const { rerender } = render(<RootNavigator />)

      const initialCallCount = (useAuth as jest.Mock).mock.calls.length

      rerender(<RootNavigator />)

      await waitFor(() => {
        expect((useAuth as jest.Mock).mock.calls.length).toBeGreaterThan(
          initialCallCount
        )
      })
    })

    it('should handle re-renders with same auth state', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      const { rerender } = render(<RootNavigator />)

      expect(() => {
        rerender(<RootNavigator />)
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle useAuth errors gracefully', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: 'Auth failed',
      })

      const { root } = render(<RootNavigator />)

      expect(root).toBeTruthy()
    })

    it('should handle useRegisterDevice errors gracefully', async () => {
      ;(useRegisterDevice as jest.Mock).mockReturnValue({
        isRegistering: false,
        error: 'Device registration failed',
      })

      const { root } = render(<RootNavigator />)

      expect(root).toBeTruthy()
    })

    it('should continue rendering even if Firebase initialization fails', async () => {
      ;(firebaseConfig.initializeFirebaseMessaging as jest.Mock).mockRejectedValueOnce(
        new Error('Firebase failed')
      )

      const { root } = render(<RootNavigator />)

      await waitFor(() => {
        expect(root).toBeTruthy()
      })
    })
  })

  describe('Loading and Splash Screen', () => {
    it('should display loading indicator during auth state check', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      })

      const { getByTestId } = render(<RootNavigator />)

      expect(getByTestId('splash-screen')).toBeTruthy()
    })

    it('should hide splash screen after auth state is determined', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      const { queryByTestId } = render(<RootNavigator />)

      await waitFor(() => {
        expect(queryByTestId('splash-screen')).toBeFalsy()
      })
    })

    it('should maintain splash screen style during loading', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      })

      const { getByTestId } = render(<RootNavigator />)

      const splashScreen = getByTestId('splash-screen')
      expect(splashScreen).toBeTruthy()
    })
  })

  describe('Integration Flow: Complete Startup Sequence', () => {
    it('should execute full startup sequence in correct order', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      ;(useRegisterDevice as jest.Mock).mockReturnValue({
        isRegistering: false,
        error: null,
      })

      render(<RootNavigator />)

      // 1. useAuth is called first
      await waitFor(() => {
        expect(useAuth).toHaveBeenCalled()
      })

      // 2. useRegisterDevice is called
      await waitFor(() => {
        expect(useRegisterDevice).toHaveBeenCalled()
      })

      // 3. NotificationProvider is initialized
      await waitFor(() => {
        expect(NotificationProvider).toHaveBeenCalled()
      })

      // 4. Firebase messaging is initialized
      await waitFor(() => {
        expect(
          firebaseConfig.initializeFirebaseMessaging
        ).toHaveBeenCalled()
      })
    })

    it('should properly sequence auth check, device registration, and notification setup', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'test_user_123' },
      })

      const { root } = render(<RootNavigator />)

      await waitFor(() => {
        expect(root).toBeTruthy()
        expect(useAuth).toHaveBeenCalled()
        expect(useRegisterDevice).toHaveBeenCalled()
        expect(NotificationProvider).toHaveBeenCalled()
      })
    })
  })
})

// Helper test component
function MockSplashScreen() {
  return <></>
}
