import React from 'react'
import './Spinner.css'

/**
 * Spinner Component — Loading indicator
 *
 * Variants: inline (in button), overlay (full screen)
 * Sizes: sm, md, lg
 */

export default function Spinner({
  size = 'md',
  variant = 'inline',
  label = null,
  color = 'primary',
}) {
  const spinnerClass = [
    'Spinner',
    `Spinner--${size}`,
    `Spinner--${color}`,
  ]
    .join(' ')

  return (
    <div className={`Spinner__container Spinner__container--${variant}`}>
      <div className={spinnerClass} role="status" aria-label={label || 'Loading'}>
        <span className="sr-only">{label || 'Loading'}</span>
      </div>
      {label && <p className="Spinner__label">{label}</p>}
    </div>
  )
}

/**
 * Overlay Spinner — Full-screen loading overlay
 */
export function OverlaySpinner({ label = 'Loading...' }) {
  return (
    <div className="OverlaySpinner">
      <Spinner variant="overlay" size="lg" label={label} />
    </div>
  )
}

/**
 * Button Spinner — Inline spinner for button loading state
 */
export function ButtonSpinner() {
  return <Spinner size="sm" variant="inline" />
}
