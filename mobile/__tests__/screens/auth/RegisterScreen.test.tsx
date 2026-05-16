import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import RegisterScreen from '../../../src/screens/auth/RegisterScreen'

// Mock navigation
const mockNavigate = jest.fn()
const mockNavigation = {
  navigate: mockNavigate,
} as any

// Mock hooks
jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    register: jest.fn(async (email: string, password: string, username?: string) => {
      if (email === 'existing@example.com') {
        throw new Error('Diese E-Mail-Adresse wird bereits verwendet')
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

describe('RegisterScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders registration form', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    expect(screen.getByPlaceholderText('max@example.com')).toBeTruthy()
    // Two password fields exist (password + confirm password)
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2)
  })

  it('renders username input as optional', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    expect(screen.getByPlaceholderText('max_mustermann')).toBeTruthy()
  })

  it('renders register button', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    expect(screen.getByText('Konto erstellen')).toBeTruthy()
  })

  it('disables register button when form is invalid', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    // TouchableOpacity exposes disabled via accessibilityState
    const registerButton = screen.getByLabelText('Registrierung bestätigen')
    expect(registerButton.props.accessibilityState?.disabled).toBe(true)
  })

  it('validates email format', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')

    fireEvent.changeText(emailInput, 'invalid-email')
    expect(screen.getByText(/gültige E-Mail-Adresse/i)).toBeTruthy()
  })

  it('validates password minimum length', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const passwordInput = screen.getAllByPlaceholderText('••••••••')[0]

    fireEvent.changeText(passwordInput, '123')
    expect(screen.getByText(/mindestens 6 Zeichen/i)).toBeTruthy()
  })

  it('validates password confirmation match', () => {
    render(<RegisterScreen navigation={mockNavigation} />)

    const inputs = screen.getAllByPlaceholderText('••••••••')
    fireEvent.changeText(inputs[0], 'password123')
    fireEvent.changeText(inputs[1], 'different123')

    expect(screen.getByText(/Passwörter stimmen nicht überein/i)).toBeTruthy()
  })

  it('shows password strength indicator when password is valid', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const passwordInput = screen.getAllByPlaceholderText('••••••••')[0]

    fireEvent.changeText(passwordInput, 'password123')
    expect(screen.getByText(/stark genug/i)).toBeTruthy()
  })

  it('enables register button when all fields are valid and match', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)

    const emailInput = screen.getByPlaceholderText('max@example.com')
    const inputs = screen.getAllByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(inputs[0], 'password123')
    fireEvent.changeText(inputs[1], 'password123')

    await waitFor(() => {
      const registerButton = screen.getByLabelText('Registrierung bestätigen')
      expect(registerButton.props.accessibilityState?.disabled).toBe(false)
    })
  })

  it('navigates to login screen on link click', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const loginLink = screen.getByText('Anmelden')

    fireEvent.press(loginLink)
    expect(mockNavigate).toHaveBeenCalledWith('Login')
  })

  it('allows optional username field', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const inputs = screen.getAllByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(inputs[0], 'password123')
    fireEvent.changeText(inputs[1], 'password123')

    // Button should be enabled even without username
    await waitFor(() => {
      const registerButton = screen.getByLabelText('Registrierung bestätigen')
      expect(registerButton.props.accessibilityState?.disabled).toBe(false)
    })
  })

  it('has accessibility labels', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const emailInput = screen.getByPlaceholderText('max@example.com')
    // FormInputGroup sets accessibilityLabel from its own `label` prop
    expect(emailInput.props.accessibilityLabel).toBe('E-Mail-Adresse')
  })
})
