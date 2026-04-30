import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import LoginScreen from '../../src/screens/auth/LoginScreen'
import { useAuth } from '../../src/context/AuthContext'
import { useToast } from '../../src/context/ToastContext'

jest.mock('../../src/context/AuthContext')
jest.mock('../../src/context/ToastContext')

const mockLogin = jest.fn()
const mockToast = { error: jest.fn(), success: jest.fn() }

beforeEach(() => {
  ;(useAuth as jest.Mock).mockReturnValue({ login: mockLogin })
  ;(useToast as jest.Mock).mockReturnValue(mockToast)
  jest.clearAllMocks()
})

describe('LoginScreen', () => {
  it('renders email and password inputs', () => {
    render(<LoginScreen />)
    expect(screen.getByPlaceholderText('user@example.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
  })

  it('renders login button', () => {
    render(<LoginScreen />)
    expect(screen.getByText('Anmelden')).toBeTruthy()
  })

  it('renders register link', () => {
    render(<LoginScreen />)
    expect(screen.getByText('Jetzt registrieren')).toBeTruthy()
  })

  it('shows email validation error for empty email', async () => {
    render(<LoginScreen />)
    const loginButton = screen.getByText('Anmelden')

    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(screen.getByText('E-Mail erforderlich')).toBeTruthy()
    })
  })

  it('shows email validation error for invalid email', async () => {
    render(<LoginScreen />)
    const emailInput = screen.getByPlaceholderText('user@example.com')

    fireEvent.changeText(emailInput, 'invalid-email')
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(screen.getByText('Ungültige E-Mail')).toBeTruthy()
    })
  })

  it('shows password validation error for empty password', async () => {
    render(<LoginScreen />)
    const emailInput = screen.getByPlaceholderText('user@example.com')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(screen.getByText('Passwort erforderlich')).toBeTruthy()
    })
  })

  it('shows password validation error for short password', async () => {
    render(<LoginScreen />)
    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'short')
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(screen.getByText('Passwort mindestens 8 Zeichen')).toBeTruthy()
    })
  })

  it('calls login with valid credentials', async () => {
    mockLogin.mockResolvedValueOnce({})
    render(<LoginScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows success toast on successful login', async () => {
    mockLogin.mockResolvedValueOnce({})
    render(<LoginScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Erfolgreich angemeldet!')
    })
  })

  it('shows error toast on login failure', async () => {
    const error = new Error('Login failed')
    mockLogin.mockRejectedValueOnce(error)
    render(<LoginScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Anmelden'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled()
    })
  })

  it('disables button while loading', async () => {
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)))
    render(<LoginScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')

    const loginButton = screen.getByText('Anmelden')
    fireEvent.press(loginButton)

    expect(loginButton.props.disabled).toBe(true)
  })

  it('clears error when user starts typing', async () => {
    render(<LoginScreen />)
    const loginButton = screen.getByText('Anmelden')

    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(screen.getByText('E-Mail erforderlich')).toBeTruthy()
    })

    const emailInput = screen.getByPlaceholderText('user@example.com')
    fireEvent.changeText(emailInput, 't')

    await waitFor(() => {
      expect(screen.queryByText('E-Mail erforderlich')).toBeNull()
    })
  })

  it('handles terms of service links', () => {
    render(<LoginScreen />)
    expect(screen.getByText('Nutzungsbedingungen')).toBeTruthy()
    expect(screen.getByText('Datenschutzrichtlinie')).toBeTruthy()
  })
})
