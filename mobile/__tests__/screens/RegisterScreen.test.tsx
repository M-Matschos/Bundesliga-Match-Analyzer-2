import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import RegisterScreen from '../../src/screens/auth/RegisterScreen'
import { useAuth } from '../../src/context/AuthContext'
import { useToast } from '../../src/context/ToastContext'

jest.mock('../../src/context/AuthContext')
jest.mock('../../src/context/ToastContext')

const mockRegister = jest.fn()
const mockToast = { error: jest.fn(), success: jest.fn() }

beforeEach(() => {
  ;(useAuth as jest.Mock).mockReturnValue({ register: mockRegister })
  ;(useToast as jest.Mock).mockReturnValue(mockToast)
  jest.clearAllMocks()
})

describe('RegisterScreen', () => {
  it('renders email, username, and password inputs', () => {
    render(<RegisterScreen />)
    expect(screen.getByPlaceholderText('user@example.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('johndoe')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
  })

  it('renders register button', () => {
    render(<RegisterScreen />)
    expect(screen.getByText('Registrieren')).toBeTruthy()
  })

  it('renders login link', () => {
    render(<RegisterScreen />)
    expect(screen.getByText('Anmelden')).toBeTruthy()
  })

  it('shows email validation error for empty email', async () => {
    render(<RegisterScreen />)
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(screen.getByText('E-Mail erforderlich')).toBeTruthy()
    })
  })

  it('shows email validation error for invalid email', async () => {
    render(<RegisterScreen />)
    const emailInput = screen.getByPlaceholderText('user@example.com')

    fireEvent.changeText(emailInput, 'invalid-email')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(screen.getByText('Ungültige E-Mail')).toBeTruthy()
    })
  })

  it('shows username validation error for invalid format', async () => {
    render(<RegisterScreen />)
    const usernameInput = screen.getByPlaceholderText('johndoe')

    fireEvent.changeText(usernameInput, 'ab') // Too short
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(screen.getByText(/Nur Buchstaben, Zahlen/i)).toBeTruthy()
    })
  })

  it('shows password validation error for short password', async () => {
    render(<RegisterScreen />)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(passwordInput, 'short')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(screen.getByText('Passwort mindestens 8 Zeichen')).toBeTruthy()
    })
  })

  it('displays password strength meter', async () => {
    render(<RegisterScreen />)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(passwordInput, 'password')

    await waitFor(() => {
      expect(screen.getByText(/Sicherheit:/i)).toBeTruthy()
    })
  })

  it('shows weak password strength for 8-11 chars', async () => {
    render(<RegisterScreen />)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(passwordInput, 'password')

    await waitFor(() => {
      expect(screen.getByText(/Schwach/i)).toBeTruthy()
    })
  })

  it('shows medium password strength for 12+ chars', async () => {
    render(<RegisterScreen />)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(passwordInput, 'password123')

    await waitFor(() => {
      expect(screen.getByText(/Mittel/i)).toBeTruthy()
    })
  })

  it('shows strong password strength with uppercase, number, special char', async () => {
    render(<RegisterScreen />)
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(passwordInput, 'Password123!')

    await waitFor(() => {
      expect(screen.getByText(/Stark/i)).toBeTruthy()
    })
  })

  it('calls register with valid data', async () => {
    mockRegister.mockResolvedValueOnce({})
    render(<RegisterScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const usernameInput = screen.getByPlaceholderText('johndoe')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(usernameInput, 'testuser')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser')
    })
  })

  it('calls register without username (optional field)', async () => {
    mockRegister.mockResolvedValueOnce({})
    render(<RegisterScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', undefined)
    })
  })

  it('shows success toast on successful registration', async () => {
    mockRegister.mockResolvedValueOnce({})
    render(<RegisterScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Account erstellt! Willkommen!')
    })
  })

  it('shows error toast on registration failure', async () => {
    const error = new Error('Email already exists')
    mockRegister.mockRejectedValueOnce(error)
    render(<RegisterScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled()
    })
  })

  it('disables button while loading', async () => {
    mockRegister.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)))
    render(<RegisterScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')

    const registerButton = screen.getByText('Registrieren')
    fireEvent.press(registerButton)

    expect(registerButton.props.disabled).toBe(true)
  })

  it('clears error when user starts typing', async () => {
    render(<RegisterScreen />)
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(screen.getByText('E-Mail erforderlich')).toBeTruthy()
    })

    const emailInput = screen.getByPlaceholderText('user@example.com')
    fireEvent.changeText(emailInput, 't')

    await waitFor(() => {
      expect(screen.queryByText('E-Mail erforderlich')).toBeNull()
    })
  })

  it('allows valid username with numbers and special chars', async () => {
    mockRegister.mockResolvedValueOnce({})
    render(<RegisterScreen />)

    const emailInput = screen.getByPlaceholderText('user@example.com')
    const usernameInput = screen.getByPlaceholderText('johndoe')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(usernameInput, 'test_user-123')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(screen.getByText('Registrieren'))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled()
    })
  })
})
