import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import LoginScreen from '../../src/screens/auth/LoginScreen'

// Mock navigation (LoginScreen requires navigation prop)
const mockNavigate = jest.fn()
const mockNavigation = { navigate: mockNavigate } as any

const mockLogin = jest.fn()
const mockToastError = jest.fn()
const mockToastSuccess = jest.fn()

// Component imports from hooks/useAuth, not context/AuthContext
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))
jest.mock('../../src/context/ToastContext', () => ({
  useToast: () => ({ error: mockToastError, success: mockToastSuccess }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockLogin.mockResolvedValue({})
})

describe('LoginScreen', () => {
  it('renders email and password inputs', () => {
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

  it('disables login button when email and password are empty', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    const loginButton = screen.getByLabelText('Anmeldung bestätigen')
    expect(loginButton.props.accessibilityState?.disabled).toBe(true)
  })

  it('shows email validation error for invalid email', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'invalid-email')
    await waitFor(() => {
      expect(screen.getByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeTruthy()
    })
  })

  it('shows password validation error for short password', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'short')
    await waitFor(() => {
      expect(screen.getByText('Passwort muss mindestens 6 Zeichen lang sein')).toBeTruthy()
    })
  })

  it('calls login with valid credentials', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Anmeldung bestätigen'))
    })

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows success toast on successful login', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Anmeldung bestätigen'))
    })

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Erfolgreich angemeldet!', 2000)
    })
  })

  it('shows error toast on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'))
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Anmeldung bestätigen'))
    })

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  it('disables button while loading', async () => {
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)))
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Anmeldung bestätigen'))
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Anmeldung bestätigen').props.accessibilityState?.disabled).toBe(true)
    })
  })

  it('clears email error when user fixes the input', async () => {
    render(<LoginScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'invalid-email')

    await waitFor(() => {
      expect(screen.getByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeTruthy()
    })

    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'valid@example.com')

    await waitFor(() => {
      expect(screen.queryByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeNull()
    })
  })

  it('shows forgot password link', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    expect(screen.getByText('Passwort vergessen?')).toBeTruthy()
  })

  it('shows register section text', () => {
    render(<LoginScreen navigation={mockNavigation} />)
    expect(screen.getByText('Noch kein Konto?')).toBeTruthy()
  })
})
