import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import LoginScreen from '../../../src/screens/auth/LoginScreen'

// Mock navigation
const mockNavigate = jest.fn()
const mockNavigation = {
  navigate: mockNavigate,
} as any

// Mock hooks
jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(async (email: string, password: string) => {
      if (email === 'error@example.com') {
        throw new Error('Anmeldung fehlgeschlagen')
      }
      return { access_token: 'token123' }
    }),
  }),
}))

jest.mock('../../../src/context/ToastContext', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}))

describe('LoginScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders login form with email and password inputs', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    expect(screen.getByPlaceholderText('max@example.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
  })

  it('renders login button', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    expect(screen.getByText('Anmelden')).toBeTruthy()
  })

  it('renders register link', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    expect(screen.getByText('Registrieren')).toBeTruthy()
  })

  it('disables login button when form is invalid', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    // TouchableOpacity exposes disabled via accessibilityState
    const loginButton = screen.getByLabelText('Anmeldung bestätigen')
    expect(loginButton.props.accessibilityState?.disabled).toBe(true)
  })

  it('enables login button when form is valid', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')

    await waitFor(() => {
      const loginButton = screen.getByLabelText('Anmeldung bestätigen')
      expect(loginButton.props.accessibilityState?.disabled).toBe(false)
    })
  })

  it('validates email format', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')

    fireEvent.changeText(emailInput, 'invalid-email')
    expect(screen.getByText(/gültige E-Mail-Adresse/i)).toBeTruthy()
  })

  it('validates password minimum length', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(passwordInput, '123')
    expect(screen.getByText(/mindestens 6 Zeichen/i)).toBeTruthy()
  })

  it('navigates to register screen on link click', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const registerLink = screen.getByText('Registrieren')

    fireEvent.press(registerLink)
    expect(mockNavigate).toHaveBeenCalledWith('Register')
  })

  it('shows forgot password link', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    expect(screen.getByText('Passwort vergessen?')).toBeTruthy()
  })

  it('clears password on error', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')

    fireEvent.changeText(emailInput, 'error@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'password123')

    // Wait for button to become enabled, then press via the TouchableOpacity
    await waitFor(() => {
      expect(screen.getByLabelText('Anmeldung bestätigen').props.accessibilityState?.disabled).toBe(false)
    })
    fireEvent.press(screen.getByLabelText('Anmeldung bestätigen'))

    await waitFor(() => {
      // Re-query after state update so we get fresh props
      expect(screen.getByPlaceholderText('••••••••').props.value).toBe('')
    })
  })

  it('has accessibility labels', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')
    // FormInputGroup sets accessibilityLabel from its own `label` prop, not the parent-passed prop
    expect(emailInput.props.accessibilityLabel).toBe('E-Mail-Adresse')
  })
})
