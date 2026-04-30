import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import { ErrorBoundary } from '../../src/components/ErrorBoundary'

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error')
}

// Component that renders normally
const SafeComponent = () => <Text>Safe content</Text>

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Safe content')).toBeTruthy()
  })

  it('catches errors and displays error UI', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )
    expect(getByText(/etwas ist schief gelaufen/i)).toBeTruthy()
  })

  it('displays error message from thrown error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )
    expect(getByText(/Test error/i)).toBeTruthy()
  })

  it('provides retry button', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )
    const retryButton = getByText(/Erneut versuchen/i)
    expect(retryButton).toBeTruthy()
  })

  it('resets error state on retry', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    const retryButton = getByText(/Erneut versuchen/i)
    fireEvent.press(retryButton)

    // After retry, should show safe component
    rerender(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Safe content')).toBeTruthy()
  })

  it('handles multiple consecutive errors', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(getByText(/etwas ist schief gelaufen/i)).toBeTruthy()

    fireEvent.press(getByText(/Erneut versuchen/i))

    rerender(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(getByText(/etwas ist schief gelaufen/i)).toBeTruthy()
  })
})
