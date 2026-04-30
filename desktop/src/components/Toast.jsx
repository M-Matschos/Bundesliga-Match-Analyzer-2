import React, { useState } from 'react'
import './Toast.css'

/**
 * Toast Component — Individual notification
 *
 * Types: success, error, info, warning
 * Features: auto-dismiss, action button, icons, animations
 */

const TOAST_ICONS = {
  success: '✓',
  error: '⚠️',
  info: 'ℹ️',
  warning: '⚡',
}

export default function Toast({
  id,
  message,
  type = 'info',
  action = null,
  autoClose = 3000,
  onClose = () => {},
}) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose(id)
    }, 300) // Wait for animation
  }

  const handleAction = () => {
    if (action && action.onClick) {
      action.onClick()
      handleClose()
    }
  }

  if (!isVisible) return null

  const toastClass = [
    'Toast',
    `Toast--${type}`,
  ].join(' ')

  return (
    <div className={toastClass} role="status" aria-live="polite">
      <span className="Toast__icon">{TOAST_ICONS[type]}</span>

      <span className="Toast__content">{message}</span>

      {action && (
        <button
          className="Toast__action"
          onClick={handleAction}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      <button
        className="Toast__close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}
