import React from 'react'
import Toast from './Toast'
import { useToast } from '../context/ToastContext'
import './ToastContainer.css'

/**
 * Toast Container — Manages all active toasts
 *
 * Renders toast stack in top-right corner
 * Auto-positions and manages z-indexes
 */

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="ToastContainer">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
