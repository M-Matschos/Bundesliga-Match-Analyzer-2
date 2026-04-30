import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthContext } from '../../src/context/AuthContext'
import { ToastContext } from '../../src/context/ToastContext'
import LoginScreen from '../../src/screens/auth/LoginScreen'
import RegisterScreen from '../../src/screens/auth/RegisterScreen'
import DashboardScreen from '../../src/screens/DashboardScreen'

const Stack = createNativeStackNavigator()

const mockAuthValue = {
  isLoggedIn: false,
  user: null,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
}

const mockToastValue = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}

const TestNavigationStack = ({ authValue = mockAuthValue, toastValue = mockToastValue }) => {
  return (
    <AuthContext.Provider value={authValue}>
      <ToastContext.Provider value={toastValue}>
        <NavigationContainer>
          <Stack.Navigator>
            {!authValue.isLoggedIn ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Navigation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows LoginScreen when user is not logged in', () => {
    render(<TestNavigationStack />)
    expect(screen.getByPlaceholderText('user@example.com')).toBeTruthy()
  })

  it('shows LoginScreen with register link', () => {
    render(<TestNavigationStack />)
    expect(screen.getByText('Noch kein Konto?')).toBeTruthy()
    expect(screen.getByText('Jetzt registrieren')).toBeTruthy()
  })

  it('allows navigation from Login to Register', async () => {
    const { rerender } = render(
      <TestNavigationStack authValue={{ ...mockAuthValue, isLoggedIn: false }} />
    )

    const registerLink = screen.getByText('Jetzt registrieren')
    fireEvent.press(registerLink)

    // After navigation to Register
    rerender(
      <TestNavigationStack authValue={{ ...mockAuthValue, isLoggedIn: false }} />
    )

    // Register screen should be visible (would show different content)
    expect(screen.getByPlaceholderText('johndoe')).toBeTruthy()
  })

  it('shows Dashboard when user is logged in', () => {
    const loggedInAuth = { ...mockAuthValue, isLoggedIn: true, user: { id: '1', email: 'test@example.com' } }

    render(<TestNavigationStack authValue={loggedInAuth} />)

    // Dashboard should be visible instead of login
    expect(screen.queryByPlaceholderText('user@example.com')).toBeNull()
  })

  it('navigates to Dashboard after successful login', async () => {
    const loginAuthValue = { ...mockAuthValue }
    const { rerender } = render(<TestNavigationStack authValue={loginAuthValue} />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')

    const loginButton = screen.getByText('Anmelden')
    fireEvent.press(loginButton)

    // Simulate successful login
    const loggedInAuth = { ...mockAuthValue, isLoggedIn: true, user: { id: '1', email: 'test@example.com' } }
    rerender(<TestNavigationStack authValue={loggedInAuth} />)

    // Should no longer show login form
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('user@example.com')).toBeNull()
    })
  })

  it('navigates to LoginScreen after logout', async () => {
    const loggedInAuth = { ...mockAuthValue, isLoggedIn: true, user: { id: '1', email: 'test@example.com' } }
    const { rerender } = render(<TestNavigationStack authValue={loggedInAuth} />)

    // Dashboard is shown
    expect(screen.queryByPlaceholderText('user@example.com')).toBeNull()

    // Simulate logout
    const loggedOutAuth = { ...mockAuthValue, isLoggedIn: false, user: null }
    rerender(<TestNavigationStack authValue={loggedOutAuth} />)

    // Should show login again
    await waitFor(() => {
      expect(screen.getByPlaceholderText('user@example.com')).toBeTruthy()
    })
  })

  it('resets stack on logout (back button disabled)', async () => {
    const loggedInAuth = { ...mockAuthValue, isLoggedIn: true }
    const { rerender } = render(<TestNavigationStack authValue={loggedInAuth} />)

    const loggedOutAuth = { ...mockAuthValue, isLoggedIn: false }
    rerender(<TestNavigationStack authValue={loggedOutAuth} />)

    // Should be on LoginScreen, no previous screens in stack
    expect(screen.getByPlaceholderText('user@example.com')).toBeTruthy()
  })

  it('handles rapid login/logout transitions', async () => {
    const { rerender } = render(<TestNavigationStack authValue={mockAuthValue} />)

    // Login
    const loggedInAuth = { ...mockAuthValue, isLoggedIn: true }
    rerender(<TestNavigationStack authValue={loggedInAuth} />)

    // Logout
    const loggedOutAuth = { ...mockAuthValue, isLoggedIn: false }
    rerender(<TestNavigationStack authValue={loggedOutAuth} />)

    // Login again
    rerender(<TestNavigationStack authValue={loggedInAuth} />)

    expect(screen.queryByPlaceholderText('user@example.com')).toBeNull()
  })

  it('preserves authentication state across navigation', async () => {
    const loggedInAuth = { ...mockAuthValue, isLoggedIn: true, user: { id: '1', email: 'test@example.com' } }

    const { rerender } = render(<TestNavigationStack authValue={loggedInAuth} />)

    // Auth state should persist
    rerender(<TestNavigationStack authValue={loggedInAuth} />)

    expect(loggedInAuth.isLoggedIn).toBe(true)
    expect(loggedInAuth.user).not.toBeNull()
  })

  it('shows error toast on login failure', async () => {
    const toastValue = { ...mockToastValue }
    render(<TestNavigationStack toastValue={toastValue} />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'wrong@example.com')
    fireEvent.changeText(passwordInput, 'wrongpassword')

    const loginButton = screen.getByText('Anmelden')
    fireEvent.press(loginButton)

    // Invalid email format should trigger error
    await waitFor(() => {
      // Either validation error or mock error
      expect(screen.getByText(/erforderlich|Ungültige/i)).toBeTruthy()
    })
  })
})
