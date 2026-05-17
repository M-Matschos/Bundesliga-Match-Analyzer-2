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
    expect(getByText(/etwas ist schiefgelaufen/i)).toBeTruthy()
  })

  it('displays error message from thrown error', () => {
    const { getAllByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )
    expect(getAllByText(/Test error/i).length).toBeGreaterThan(0)
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
    // Use a controllable flag to switch children
    let shouldThrow = true
    const MaybeError = () => {
      if (shouldThrow) throw new Error('Test error')
      return <SafeComponent />
    }

    const { getByText, rerender } = render(
      <ErrorBoundary>
        <MaybeError />
      </ErrorBoundary>
    )

    const retryButton = getByText(/Erneut versuchen/i)

    // Switch to safe mode before pressing retry so the next render succeeds
    shouldThrow = false
    fireEvent.press(retryButton)

    // After retry the boundary clears hasError and re-renders children (SafeComponent)
    rerender(
      <ErrorBoundary>
        <MaybeError />
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

    expect(getByText(/etwas ist schiefgelaufen/i)).toBeTruthy()

    fireEvent.press(getByText(/Erneut versuchen/i))

    rerender(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(getByText(/etwas ist schiefgelaufen/i)).toBeTruthy()
  })
})
