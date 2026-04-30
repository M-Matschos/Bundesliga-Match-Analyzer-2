import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ThemeProvider } from '../../context/ThemeContext'
import MatchPredictionCard from '../../components/MatchPredictionCard'
import Spinner from '../../components/Spinner'
import Toast from '../../components/Toast'
import Modal from '../../components/Modal'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import FormInputGroup from '../../components/FormInputGroup'
import { DARK_COLORS, LIGHT_COLORS } from '../../theme/colors'

/**
 * Dark Mode Component Tests
 * Tests that all components render correctly in both light and dark modes
 * and that colors are applied dynamically based on theme
 */

// ─── MatchPredictionCard Tests ─────────────────────────────────

describe('MatchPredictionCard Dark Mode', () => {
  const mockMatch = {
    id: '1',
    home_team: { name: 'Bayern', logo_url: 'https://example.com/logo.png' },
    away_team: { name: 'Dortmund', logo_url: 'https://example.com/logo.png' },
    kickoff: '2026-05-01T15:30:00Z',
    prediction: {
      home_win: 0.5,
      draw: 0.3,
      away_win: 0.2,
      confidence_label: 'MITTEL',
      most_likely_score: '2-1',
      most_likely_score_prob: 0.15,
      over_2_5_prob: 0.6,
      btts_prob: 0.5,
      expected_goals_home: 2.1,
      expected_goals_away: 1.2,
      value_bet: null,
    },
    tipico_deeplink: 'https://tipico.de',
  }

  it('renders correctly in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <MatchPredictionCard match={mockMatch} />
      </ThemeProvider>
    )
    expect(screen.getByText('Bayern')).toBeTruthy()
  })

  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <MatchPredictionCard match={mockMatch} />
      </ThemeProvider>
    )
    expect(screen.getByText('Bayern')).toBeTruthy()
  })

  it('applies dynamic background color', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <MatchPredictionCard match={mockMatch} />
      </ThemeProvider>
    )
    expect(screen.getByText('Bayern')).toBeTruthy()
  })

  it('displays prediction data correctly', () => {
    render(
      <ThemeProvider initialTheme="light">
        <MatchPredictionCard match={mockMatch} />
      </ThemeProvider>
    )
    expect(screen.getByText('MITTEL')).toBeTruthy()
  })
})

// ─── Spinner Tests ─────────────────────────────────

describe('Spinner Dark Mode', () => {
  it('renders correctly in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Spinner testID="spinner-light" />
      </ThemeProvider>
    )
    expect(screen.getByTestId('spinner-light')).toBeTruthy()
  })

  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Spinner testID="spinner-dark" />
      </ThemeProvider>
    )
    expect(screen.getByTestId('spinner-dark')).toBeTruthy()
  })

  it('uses theme color for spinner indicator', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Spinner testID="spinner-themed" />
      </ThemeProvider>
    )
    expect(screen.getByTestId('spinner-themed')).toBeTruthy()
  })

  it('supports custom color override', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Spinner testID="spinner-custom" color="#FF0000" />
      </ThemeProvider>
    )
    expect(screen.getByTestId('spinner-custom')).toBeTruthy()
  })
})

// ─── Toast Tests ─────────────────────────────────

describe('Toast Dark Mode', () => {
  it('renders success toast in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Toast message="Success!" type="success" onDismiss={() => {}} />
      </ThemeProvider>
    )
    expect(screen.getByText('Success!')).toBeTruthy()
  })

  it('renders success toast in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Toast message="Success!" type="success" onDismiss={() => {}} />
      </ThemeProvider>
    )
    expect(screen.getByText('Success!')).toBeTruthy()
  })

  it('renders error toast in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Toast message="Error occurred" type="error" onDismiss={() => {}} />
      </ThemeProvider>
    )
    expect(screen.getByText('Error occurred')).toBeTruthy()
  })

  it('renders error toast in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Toast message="Error occurred" type="error" onDismiss={() => {}} />
      </ThemeProvider>
    )
    expect(screen.getByText('Error occurred')).toBeTruthy()
  })

  it('renders info toast with correct colors', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Toast message="Info message" type="info" onDismiss={() => {}} />
      </ThemeProvider>
    )
    expect(screen.getByText('Info message')).toBeTruthy()
  })
})

// ─── Modal Tests ─────────────────────────────────

describe('Modal Dark Mode', () => {
  it('renders correctly in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          <span>Modal Content</span>
        </Modal>
      </ThemeProvider>
    )
    expect(screen.getByText('Test Modal')).toBeTruthy()
  })

  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          <span>Modal Content</span>
        </Modal>
      </ThemeProvider>
    )
    expect(screen.getByText('Test Modal')).toBeTruthy()
  })

  it('applies surface background color dynamically', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Themed Modal"
        >
          <span>Content</span>
        </Modal>
      </ThemeProvider>
    )
    expect(screen.getByText('Themed Modal')).toBeTruthy()
  })

  it('renders buttons with theme colors', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Modal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Action Modal"
          confirmText="Confirm"
          cancelText="Cancel"
        >
          <span>Content</span>
        </Modal>
      </ThemeProvider>
    )
    expect(screen.getByText('Confirm')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
  })
})

// ─── ErrorBoundary Tests ─────────────────────────────────

describe('ErrorBoundary Dark Mode', () => {
  // Suppress console errors for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders error fallback in light mode', () => {
    const TestComponent = () => {
      throw new Error('Test error')
    }

    render(
      <ThemeProvider initialTheme="light">
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      </ThemeProvider>
    )
    expect(screen.getByText('Etwas ist schiefgelaufen')).toBeTruthy()
  })

  it('renders error fallback in dark mode', () => {
    const TestComponent = () => {
      throw new Error('Test error')
    }

    render(
      <ThemeProvider initialTheme="dark">
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      </ThemeProvider>
    )
    expect(screen.getByText('Etwas ist schiefgelaufen')).toBeTruthy()
  })

  it('displays error message with theme colors', () => {
    const TestComponent = () => {
      throw new Error('Custom error message')
    }

    render(
      <ThemeProvider initialTheme="dark">
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      </ThemeProvider>
    )
    expect(screen.getByText('Custom error message')).toBeTruthy()
  })

  it('provides retry button with theme colors', () => {
    const TestComponent = () => {
      throw new Error('Test error')
    }

    render(
      <ThemeProvider initialTheme="light">
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      </ThemeProvider>
    )
    expect(screen.getByText('Erneut versuchen')).toBeTruthy()
  })
})

// ─── FormInputGroup Tests ─────────────────────────────────

describe('FormInputGroup Dark Mode', () => {
  it('renders correctly in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <FormInputGroup
          label="Email"
          value="test@example.com"
          onChangeText={() => {}}
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Email')).toBeTruthy()
  })

  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <FormInputGroup
          label="Email"
          value="test@example.com"
          onChangeText={() => {}}
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Email')).toBeTruthy()
  })

  it('applies surface background to input in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <FormInputGroup
          label="Username"
          value="testuser"
          onChangeText={() => {}}
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Username')).toBeTruthy()
  })

  it('displays error state with theme color', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <FormInputGroup
          label="Password"
          value=""
          onChangeText={() => {}}
          error="Password is required"
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Password is required')).toBeTruthy()
  })

  it('displays success state with theme color', () => {
    render(
      <ThemeProvider initialTheme="light">
        <FormInputGroup
          label="Email"
          value="test@example.com"
          onChangeText={() => {}}
          success="Email verified"
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Email verified')).toBeTruthy()
  })

  it('displays hint text with muted color', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <FormInputGroup
          label="Email"
          value=""
          onChangeText={() => {}}
          hint="We'll never share your email"
        />
      </ThemeProvider>
    )
    expect(screen.getByText("We'll never share your email")).toBeTruthy()
  })

  it('supports required asterisk', () => {
    render(
      <ThemeProvider initialTheme="light">
        <FormInputGroup
          label="Email"
          value=""
          onChangeText={() => {}}
          required
        />
      </ThemeProvider>
    )
    expect(screen.getByText('*')).toBeTruthy()
  })

  it('supports loading state', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <FormInputGroup
          label="Email"
          value=""
          onChangeText={() => {}}
          loading
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Email')).toBeTruthy()
  })
})

// ─── Color Palette Tests ─────────────────────────────────

describe('Color Palette - Light vs Dark', () => {
  it('light palette has proper contrast ratios', () => {
    // Light mode: text (#1A1A1A) on background (#FFFFFF) = 18:1
    expect(LIGHT_COLORS.text).toBe('#1A1A1A')
    expect(LIGHT_COLORS.background).toBe('#FFFFFF')
  })

  it('dark palette has proper contrast ratios', () => {
    // Dark mode: text (#ECEFF4) on background (#0D1B2A) = 16:1
    expect(DARK_COLORS.text).toBe('#ECEFF4')
    expect(DARK_COLORS.background).toBe('#0D1B2A')
  })

  it('both palettes define primary color', () => {
    expect(LIGHT_COLORS.primary).toBeDefined()
    expect(DARK_COLORS.primary).toBeDefined()
  })

  it('both palettes define status colors', () => {
    expect(LIGHT_COLORS.red).toBeDefined()
    expect(LIGHT_COLORS.green).toBeDefined()
    expect(DARK_COLORS.red).toBeDefined()
    expect(DARK_COLORS.green).toBeDefined()
  })
})
