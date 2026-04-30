import React, { useState, useCallback } from 'react'
import './FormInputGroup.css'

/**
 * FormInputGroup Component
 *
 * Reusable form input with label, error/success messages, and validation states.
 * Implements accessibility best practices (ARIA labels, role="alert" for errors).
 *
 * Usage:
 * <FormInputGroup
 *   id="email"
 *   label="E-Mail"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 *   hint="We'll never share your email"
 *   required
 * />
 */
export default function FormInputGroup({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  success,
  disabled = false,
  loading = false,
  required = false,
  placeholder,
  autoComplete,
  className = '',
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error
  const showSuccess = success && !hasError

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const inputClasses = [
    'form-input',
    isFocused && 'form-input--focus',
    hasError && 'form-input--error',
    showSuccess && 'form-input--success',
    disabled && 'form-input--disabled',
    loading && 'form-input--loading',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-group ${className}`.trim()}>
      {/* Label */}
      <label htmlFor={id} className="form-label">
        {label}
        {required && (
          <span className="form-label__required" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Input Container */}
      <div className="form-input-wrapper">
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClasses}
          required={required}
          disabled={disabled || loading}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={`${id}-error ${id}-hint`}
        />

        {/* Loading Spinner */}
        {loading && <div className="form-input__spinner" />}
      </div>

      {/* Error Message */}
      {hasError && (
        <div
          id={`${id}-error`}
          className="form-message form-message--error"
          role="alert"
        >
          <span className="form-message__icon">❌</span>
          <span className="form-message__text">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="form-message form-message--success">
          <span className="form-message__icon">✅</span>
          <span className="form-message__text">{success}</span>
        </div>
      )}

      {/* Hint Text */}
      {hint && !hasError && (
        <div id={`${id}-hint`} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  )
}
