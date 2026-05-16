import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import RegisterScreen from '../../src/screens/auth/RegisterScreen'

// Mock navigation (RegisterScreen requires navigation prop)
const mockNavigate = jest.fn()
const mockNavigation = { navigate: mockNavigate } as any

const mockRegister = jest.fn()
const mockToastError = jest.fn()
const mockToastSuccess = jest.fn()

// Component imports from hooks/useAuth, not context/AuthContext
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}))
jest.mock('../../src/context/ToastContext', () => ({
  useToast: () => ({ error: mockToastError, success: mockToastSuccess }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockRegister.mockResolvedValue({})
})

describe('RegisterScreen', () => {
  it('renders email, username, and password inputs', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    expect(screen.getByPlaceholderText('max@example.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('max_mustermann')).toBeTruthy()
    // Two password fields: password + confirm password
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2)
  })

  it('renders register button', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    expect(screen.getByText('Konto erstellen')).toBeTruthy()
  })

  it('renders login link', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    expect(screen.getByText('Anmelden')).toBeTruthy()
  })

  it('disables register button when form is empty', () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    const registerButton = screen.getByLabelText('Registrierung bestätigen')
    expect(registerButton.props.accessibilityState?.disabled).toBe(true)
  })

  it('shows email validation error for invalid email', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'invalid-email')
    await waitFor(() => {
      expect(screen.getByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeTruthy()
    })
  })

  it('shows password validation error for short password', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'short')
    await waitFor(() => {
      expect(screen.getByText('Passwort muss mindestens 6 Zeichen lang sein')).toBeTruthy()
    })
  })

  it('shows password strength indicator when password is valid', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    await waitFor(() => {
      expect(screen.getByText(/stark genug/i)).toBeTruthy()
    })
  })

  it('enables register button when all fields are valid and match', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'password123')

    await waitFor(() => {
      expect(screen.getByLabelText('Registrierung bestätigen').props.accessibilityState?.disabled).toBe(false)
    })
  })

  it('shows passwords mismatch error', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'different456')
    await waitFor(() => {
      expect(screen.getByText(/Passwörter stimmen nicht überein/i)).toBeTruthy()
    })
  })

  it('calls register with valid data including username', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('max_mustermann'), 'testuser')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Registrierung bestätigen'))
    })

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser')
    })
  })

  it('calls register without username when field is empty', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Registrierung bestätigen'))
    })

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', undefined)
    })
  })

  it('shows success toast on successful registration', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Registrierung bestätigen'))
    })

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Registrierung erfolgreich! Sie werden angemeldet...',
        2000
      )
    })
  })

  it('shows error toast on registration failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'))
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'password123')

    await waitFor(() => {
      fireEvent.press(screen.getByLabelText('Registrierung bestätigen'))
    })

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  it('allows optional username field', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'test@example.com')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'password123')
    fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'password123')

    await waitFor(() => {
      expect(screen.getByLabelText('Registrierung bestätigen').props.accessibilityState?.disabled).toBe(false)
    })
  })

  it('clears email error when user fixes the input', async () => {
    render(<RegisterScreen navigation={mockNavigation} />)
    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'invalid-email')

    await waitFor(() => {
      expect(screen.getByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeTruthy()
    })

    fireEvent.changeText(screen.getByPlaceholderText('max@example.com'), 'valid@example.com')

    await waitFor(() => {
      expect(screen.queryByText('Bitte geben Sie eine gültige E-Mail-Adresse ein')).toBeNull()
    })
  })
})
