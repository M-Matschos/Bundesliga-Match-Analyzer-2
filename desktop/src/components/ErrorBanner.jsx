import React, { useState } from 'react'
import './ErrorBanner.css'

/**
 * ErrorBanner Component — Inline dismissible error message
 *
 * Use for API errors, validation errors, form submission errors
 * Features: dismissible, action button, icon
 */

export default function ErrorBanner({
  message,
  action = null,
  onDismiss = null,
  title = null,
  fullWidth = false,
}) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  const handleAction = () => {
    if (action && action.onClick) {
      action.onClick()
    }
  }

  if (!isVisible) return null

  const bannerClass = [
    'ErrorBanner',
    fullWidth && 'ErrorBanner--full-width',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={bannerClass} role="alert" aria-live="assertive">
      <span className="ErrorBanner__icon">⚠️</span>

      <div className="ErrorBanner__content">
        {title && <h3 className="ErrorBanner__title">{title}</h3>}
        <p className="ErrorBanner__message">{message}</p>
      </div>

      {action && (
        <button
          className="ErrorBanner__action"
          onClick={handleAction}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      <button
        className="ErrorBanner__close"
        onClick={handleDismiss}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  )
}
