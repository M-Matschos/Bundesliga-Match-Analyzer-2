import React from 'react'
import './ErrorBoundary.css'

/**
 * ErrorBoundary Component — Catches React component errors
 *
 * Features:
 * - Catches errors in child components
 * - Displays error message with retry button
 * - Logs errors to external service (Sentry)
 * - Prevents entire app crash
 */

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })

    // Log to external error tracking (Sentry, etc.)
    if (window.__SENTRY__) {
      window.__SENTRY__.captureException(error, { contexts: errorInfo })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error)
      console.error('Error Info:', errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ErrorBoundary">
          <div className="ErrorBoundary__content">
            <div className="ErrorBoundary__icon">⚠️</div>
            <h2 className="ErrorBoundary__title">Something went wrong</h2>
            <p className="ErrorBoundary__message">
              An unexpected error occurred. Try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="ErrorBoundary__details">
                <summary>Error Details (Development Only)</summary>
                <pre className="ErrorBoundary__error-text">
                  {this.state.error && this.state.error.toString()}
                </pre>
                <pre className="ErrorBoundary__error-text">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              className="ErrorBoundary__button"
              onClick={this.handleRetry}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
