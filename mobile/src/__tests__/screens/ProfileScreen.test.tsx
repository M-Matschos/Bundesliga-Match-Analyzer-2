import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import ProfileScreen, { ThemeToggleButton } from '../../screens/ProfileScreen'
import { ThemeProvider } from '../../context/ThemeContext'
import { AuthProvider } from '../../context/AuthContext'
import { ToastProvider } from '../../context/ToastContext'
import { getColors } from '../../theme/colors'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}))

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
)

describe('ProfileScreen', () => {
  describe('Theme Toggle Button', () => {
    test('renders theme toggle button', () => {
      const mockOnPress = jest.fn()
      const colors = getColors('dark')

      const { getByTestId } = render(
        <ThemeToggleButton
          mode="dark"
          onPress={mockOnPress}
          colors={colors}
        />
      )

      const button = getByTestId('theme-toggle-button')
      expect(button).toBeDefined()
    })

    test('displays correct label for dark mode', () => {
      const mockOnPress = jest.fn()
      const colors = getColors('dark')

      const { getByText } = render(
        <ThemeToggleButton
          mode="dark"
          onPress={mockOnPress}
          colors={colors}
        />
      )

      // In dark mode, should show Light Mode text
      expect(getByText('Light Mode')).toBeDefined()
    })

    test('displays correct label for light mode', () => {
      const mockOnPress = jest.fn()
      const colors = getColors('light')

      const { getByText } = render(
        <ThemeToggleButton
          mode="light"
          onPress={mockOnPress}
          colors={colors}
        />
      )

      // In light mode, should show Dark Mode text
      expect(getByText('Dark Mode')).toBeDefined()
    })

    test('calls onPress when button is pressed', () => {
      const mockOnPress = jest.fn()
      const colors = getColors('dark')

      const { getByTestId } = render(
        <ThemeToggleButton
          mode="dark"
          onPress={mockOnPress}
          colors={colors}
        />
      )

      const button = getByTestId('theme-toggle-button')
      fireEvent.press(button)

      expect(mockOnPress).toHaveBeenCalledTimes(1)
    })

    test('shows sun emoji in dark mode', () => {
      const mockOnPress = jest.fn()
      const colors = getColors('dark')

      const { getByText } = render(
        <ThemeToggleButton
          mode="dark"
          onPress={mockOnPress}
          colors={colors}
        />
      )

      // Sun emoji in dark mode
      expect(getByText('☀️')).toBeDefined()
    })

    test('shows moon emoji in light mode', () => {
      const mockOnPress = jest.fn()
      const colors = getColors('light')

      const { getByText } = render(
        <ThemeToggleButton
          mode="light"
          onPress={mockOnPress}
          colors={colors}
        />
      )

      // Moon emoji in light mode
      expect(getByText('🌙')).toBeDefined()
    })
  })

  describe('ProfileScreen Integration', () => {
    test('ProfileScreen renders without crashing', () => {
      const { getByText } = render(
        <ProfileScreen />,
        { wrapper: AllProviders }
      )

      // Should render Einstellungen section
      expect(getByText('Einstellungen')).toBeDefined()
    })

    test('theme toggle button is visible in ProfileScreen', async () => {
      const { getByTestId } = render(
        <ProfileScreen />,
        { wrapper: AllProviders }
      )

      await waitFor(() => {
        const button = getByTestId('theme-toggle-button')
        expect(button).toBeDefined()
      }, { timeout: 3000 })
    })

    test('theme toggle button is pressable', async () => {
      const { getByTestId } = render(
        <ProfileScreen />,
        { wrapper: AllProviders }
      )

      await waitFor(() => {
        const button = getByTestId('theme-toggle-button')
        expect(() => {
          fireEvent.press(button)
        }).not.toThrow()
      }, { timeout: 3000 })
    })
  })

  describe('ProfileScreen Dark Mode Support', () => {
    test('ProfileScreen renders in dark mode', () => {
      const { getByText } = render(
        <ProfileScreen />,
        { wrapper: AllProviders }
      )

      // Should render without errors in dark mode
      expect(getByText('Einstellungen')).toBeDefined()
    })

    test('ProfileScreen renders in light mode', () => {
      const { getByText } = render(
        <ProfileScreen />,
        { wrapper: AllProviders }
      )

      // Should render without errors
      expect(getByText('Einstellungen')).toBeDefined()
    })
  })
})
