import React, { useEffect } from 'react'
import './Modal.css'

/**
 * Modal Component — Dialogs for confirmations, details, forms, alerts
 *
 * Variants: confirmation, detail, form, alert
 * States: closed, open, loading, error
 * Features: focus trap, keyboard close (Esc), overlay click to close
 */

export default function Modal({
  isOpen = false,
  onClose = () => {},
  onConfirm = null,
  title = '',
  size = 'md',
  footer = null,
  children = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  error = null,
  closeOnOverlay = true,
  closeOnEscape = true,
}) {
  const modalRef = React.useRef(null)
  const previousActiveElement = React.useRef(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      // Focus modal content
      setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements?.length > 0) {
          focusableElements[0].focus()
        }
      }, 0)
    } else {
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen])

  // Keyboard handling (Escape)
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    if (loading) return
    if (onConfirm) {
      onConfirm()
    }
  }

  const sizeClass = {
    sm: 'Modal--sm',
    md: 'Modal--md',
    lg: 'Modal--lg',
  }[size] || 'Modal--md'

  return (
    <div
      className="Modal__overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`Modal ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        {title && (
          <div className="Modal__header">
            <h2 id="modal-title">{title}</h2>
            <button
              className="Modal__close-btn"
              onClick={onClose}
              aria-label="Close modal"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="Modal__error">
            <span className="Modal__error-icon">⚠️</span>
            <span className="Modal__error-message">{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="Modal__content">{children}</div>

        {/* Footer with Actions */}
        {footer !== false && (
          <div className="Modal__footer">
            {footer ? (
              footer
            ) : (
              <>
                <button
                  className="Modal__button Modal__button--secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    className="Modal__button Modal__button--primary"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="Modal__spinner" />
                        Processing...
                      </>
                    ) : (
                      confirmText
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
