import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = Math.random().toString(36).substr(2, 9)
      const toast: ToastMessage = { id, message, type, duration }

      setToasts(prev => [...prev, toast])

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
      }
    },
    []
  )

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration ?? 3000)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration ?? 4000)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration ?? 3000)
  }, [showToast])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Container (renders all active toasts)
import { View } from 'react-native'

interface ContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ContainerProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
        justifyContent: 'flex-end',
        paddingBottom: 20,
        paddingHorizontal: 12,
        zIndex: 9999,
      }}
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onRemove(toast.id)}
        />
      ))}
    </View>
  )
}
