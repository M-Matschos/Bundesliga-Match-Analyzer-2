import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

/**
 * Toast Context — Global notification system
 *
 * Provides: toast.success(), toast.error(), toast.info(), toast.warning()
 * Features: auto-dismiss, custom duration, action button, stacking
 */

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const {
      duration = 3000, // auto-dismiss after 3s
      action = null,
    } = options

    const id = idRef.current++
    const toast = {
      id,
      message,
      type, // 'success' | 'error' | 'info' | 'warning'
      action,
      autoClose: duration,
    }

    setToasts((prev) => [...prev, toast])

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message, options) => addToast(message, 'success', options),
    [addToast]
  )

  const error = useCallback(
    (message, options) => addToast(message, 'error', options),
    [addToast]
  )

  const info = useCallback(
    (message, options) => addToast(message, 'info', options),
    [addToast]
  )

  const warning = useCallback(
    (message, options) => addToast(message, 'warning', options),
    [addToast]
  )

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
