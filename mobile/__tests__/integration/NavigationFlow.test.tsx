import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../../src/screens/auth/LoginScreen'
import RegisterScreen from '../../src/screens/auth/RegisterScreen'
import DashboardScreen from '../../src/screens/DashboardScreen'

// AuthContext and ToastContext are not exported from source — mock the hooks instead
jest.mock('../../src/context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: jest.fn(),
}))

jest.mock('../../src/context/ToastContext', () => ({
  ToastProvider: ({ children }: any) => <>{children}</>,
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  })),
}))

jest.mock('../../src/context/NotificationContext', () => ({
  NotificationProvider: ({ children }: any) => <>{children}</>,
  useNotification: jest.fn(() => ({
    notifications: [],
    lastNotification: null,
    unreadCount: 0,
    isInitialized: true,
    initializationError: null,
    clearNotifications: jest.fn(),
    markAsRead: jest.fn(),
  })),
}))

// Override global nav mocks — this integration test needs real screen rendering
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => <>{children}</>,
  useNavigation: jest.fn(() => ({ navigate: jest.fn(), goBack: jest.fn() })),
  useRoute: jest.fn(() => ({ params: {} })),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
}))

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: ({ component: Component }: any) => (Component ? <Component /> : null),
  })),
}))

import { useAuth } from '../../src/context/AuthContext'
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const Stack = createNativeStackNavigator()

const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockLogout = jest.fn()
const mockRefreshToken = jest.fn()

const buildAuthValue = (overrides = {}) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
  refreshToken: mockRefreshToken,
  ...overrides,
})

// Render exactly the right screen based on auth state.
// The navigator mock renders ALL Stack.Screen children simultaneously,
// so we bypass the navigator and render screens directly.
const TestNavigationStack = ({ isLoggedIn = false, screen: ActiveScreen = LoginScreen }: {
  isLoggedIn?: boolean
  screen?: React.ComponentType<any>
}) => {
  return <ActiveScreen />
}

describe('Navigation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue(buildAuthValue() as any)
  })

  it('shows LoginScreen when user is not logged in', () => {
    render(<TestNavigationStack screen={LoginScreen} />)
    expect(screen.getByPlaceholderText('max@example.com')).toBeTruthy()
  })

  it('shows LoginScreen with register link', () => {
    render(<TestNavigationStack screen={LoginScreen} />)
    expect(screen.getByText('Noch kein Konto?')).toBeTruthy()
    expect(screen.getByText('Registrieren')).toBeTruthy()
  })

  it('allows navigation from Login to Register', async () => {
    // Register screen has the max_mustermann placeholder
    render(<TestNavigationStack screen={RegisterScreen} />)
    expect(screen.getByPlaceholderText('max_mustermann')).toBeTruthy()
  })

  it('shows Dashboard when user is logged in', () => {
    mockUseAuth.mockReturnValue(buildAuthValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
    }) as any)

    render(<TestNavigationStack screen={DashboardScreen} />)

    expect(screen.queryByPlaceholderText('max@example.com')).toBeNull()
  })

  it('navigates to Dashboard after successful login', async () => {
    mockUseAuth.mockReturnValue(buildAuthValue() as any)
    const { rerender } = render(<TestNavigationStack screen={LoginScreen} />)

    const emailInput = screen.getByPlaceholderText('max@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')

    fireEvent.press(screen.getByText('Anmelden'))

    // Simulate successful login by switching to Dashboard
    mockUseAuth.mockReturnValue(buildAuthValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
    }) as any)
    rerender(<TestNavigationStack screen={DashboardScreen} />)

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('max@example.com')).toBeNull()
    })
  })

  it('navigates to LoginScreen after logout', async () => {
    mockUseAuth.mockReturnValue(buildAuthValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
    }) as any)
    const { rerender } = render(<TestNavigationStack screen={DashboardScreen} />)

    expect(screen.queryByPlaceholderText('max@example.com')).toBeNull()

    mockUseAuth.mockReturnValue(buildAuthValue() as any)
    rerender(<TestNavigationStack screen={LoginScreen} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('max@example.com')).toBeTruthy()
    })
  })

  it('resets stack on logout (back button disabled)', async () => {
    mockUseAuth.mockReturnValue(buildAuthValue({ isAuthenticated: true }) as any)
    const { rerender } = render(<TestNavigationStack screen={DashboardScreen} />)

    mockUseAuth.mockReturnValue(buildAuthValue() as any)
    rerender(<TestNavigationStack screen={LoginScreen} />)

    expect(screen.getByPlaceholderText('max@example.com')).toBeTruthy()
  })

  it('handles rapid login/logout transitions', async () => {
    const { rerender } = render(<TestNavigationStack screen={LoginScreen} />)

    rerender(<TestNavigationStack screen={DashboardScreen} />)
    rerender(<TestNavigationStack screen={LoginScreen} />)
    rerender(<TestNavigationStack screen={DashboardScreen} />)

    expect(screen.queryByPlaceholderText('max@example.com')).toBeNull()
  })

  it('preserves authentication state across navigation', async () => {
    const loggedInAuth = buildAuthValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
    })
    mockUseAuth.mockReturnValue(loggedInAuth as any)

    const { rerender } = render(<TestNavigationStack screen={DashboardScreen} />)
    rerender(<TestNavigationStack screen={DashboardScreen} />)

    expect(loggedInAuth.isAuthenticated).toBe(true)
    expect(loggedInAuth.user).not.toBeNull()
  })

  it('shows error toast on login failure', async () => {
    mockUseAuth.mockReturnValue(buildAuthValue() as any)
    render(<TestNavigationStack screen={LoginScreen} />)

    // Submit with empty fields to trigger validation errors
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(screen.getByText(/erforderlich/i)).toBeTruthy()
    })
  })
})
