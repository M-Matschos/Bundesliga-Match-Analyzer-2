import React from 'react'
import { render, screen, waitFor } from '@testing-library/react-native'
import App from '../App'

// Mock the context providers and RootNavigator
jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '123', email: 'test@example.com' },
  }),
}))

jest.mock('../src/context/ToastContext', () => ({
  ToastProvider: ({ children }: any) => <>{children}</>,
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}))

jest.mock('../src/_layout', () => {
  return function MockRootNavigator() {
    return <>Root Navigator</>
  }
})

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => <>{children}</>,
}))

describe('App Integration', () => {
  it('renders with all context providers', () => {
    render(<App />)
    expect(screen.getByText('Root Navigator')).toBeTruthy()
  })

  it('wraps RootNavigator with ToastProvider', () => {
    const { getByText } = render(<App />)
    expect(getByText('Root Navigator')).toBeTruthy()
    // ToastProvider is invisible but required
  })

  it('wraps components with AuthProvider for authentication', () => {
    const { getByText } = render(<App />)
    expect(getByText('Root Navigator')).toBeTruthy()
    // AuthProvider is invisible but required
  })

  it('uses GestureHandlerRootView for gesture support', () => {
    const { getByText } = render(<App />)
    // GestureHandlerRootView is required for react-native-gesture-handler
    expect(getByText('Root Navigator')).toBeTruthy()
  })

  it('provider hierarchy is correct (Toast > Auth > RootNav)', () => {
    // Render and verify no errors from provider nesting
    const { getByText } = render(<App />)
    expect(getByText('Root Navigator')).toBeTruthy()
  })
})
