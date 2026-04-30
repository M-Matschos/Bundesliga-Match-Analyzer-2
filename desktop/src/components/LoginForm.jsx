import React, { useState, useCallback } from 'react'
import FormInputGroup from './FormInputGroup'
import './LoginForm.css'

// Validation helper (same as backend)
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'E-Mail ist erforderlich'
  if (email.length < 5) return 'E-Mail zu kurz (min 5 Zeichen)'
  if (!email.includes('@')) return 'E-Mail muss @ enthalten'
  if (!emailRegex.test(email)) return 'Ungültiges E-Mail-Format'
  return null
}

const validatePassword = (password) => {
  if (!password) return 'Passwort ist erforderlich'
  if (password.length < 6) return 'Passwort zu kurz (min 6 Zeichen)'
  if (password.includes(' ')) return 'Passwort darf keine Leerzeichen enthalten'
  return null
}

const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation) return 'Bitte bestätigen Sie Ihr Passwort'
  if (password !== confirmation) return 'Passwörter stimmen nicht überein'
  return null
}

function LoginForm({ onLogin, onRegister, loading, error }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')

  // Validation on blur
  const handleEmailBlur = useCallback(() => {
    setEmailError(validateEmail(email))
  }, [email])

  const handlePasswordBlur = useCallback(() => {
    setPasswordError(validatePassword(password))
  }, [password])

  const handlePasswordConfirmBlur = useCallback(() => {
    if (isRegister) {
      setPasswordConfirmError(validatePasswordConfirmation(password, passwordConfirm))
    }
  }, [password, passwordConfirm, isRegister])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    let passwordConfirmErr = null

    if (isRegister) {
      passwordConfirmErr = validatePasswordConfirmation(password, passwordConfirm)
    }

    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setPasswordConfirmError(passwordConfirmErr)

    // Stop if any errors
    if (emailErr || passwordErr || passwordConfirmErr) {
      return
    }

    // Call handler
    if (isRegister) {
      onRegister(email, password)
    } else {
      onLogin(email, password)
    }
  }

  const handleModeToggle = () => {
    setIsRegister(!isRegister)
    // Clear form
    setEmail('')
    setEmailError('')
    setPassword('')
    setPasswordError('')
    setPasswordConfirm('')
    setPasswordConfirmError('')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">⚽</div>
        <h1 className="title">Match Oracle</h1>
        <p className="subtitle">
          {isRegister ? 'Erstellen Sie ein neues Konto' : 'Melden Sie sich an'}
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error form-error-summary">{error}</div>}

          <FormInputGroup
            id="email"
            label="E-Mail"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={handleEmailBlur}
            error={emailError}
            hint="Wir teilen Ihre E-Mail nie"
            required
            placeholder="ihr@email.com"
            disabled={loading}
          />

          <FormInputGroup
            id="password"
            label="Passwort"
            type="password"
            value={password}
            onChange={setPassword}
            onBlur={handlePasswordBlur}
            error={passwordError}
            hint="Min 6 Zeichen, keine Leerzeichen"
            required
            placeholder="••••••••"
            disabled={loading}
          />

          {isRegister && (
            <FormInputGroup
              id="passwordConfirm"
              label="Passwort bestätigen"
              type="password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              onBlur={handlePasswordConfirmBlur}
              error={passwordConfirmError}
              success={passwordConfirm && !passwordConfirmError ? 'Passwörter stimmen überein' : undefined}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'Bitte warten...' : isRegister ? 'Konto erstellen' : 'Anmelden'}
          </button>
        </form>

        <div className="divider">oder</div>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleModeToggle}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {isRegister ? 'Ich habe bereits ein Konto' : 'Konto erstellen'}
        </button>

        <p className="info-text">
          {isRegister
            ? 'Wenn Sie ein Konto erstellen, stimmen Sie unseren Nutzungsbedingungen zu'
            : 'Demo: test@example.com / password123'}
        </p>
      </div>

      <div className="sidebar">
        <h2>Willkommen zu Match Oracle</h2>
        <ul className="features">
          <li>⚽ KI-gestützte Fußball-Prognosen</li>
          <li>📊 Live-Quoten und Analysen</li>
          <li>💡 Intelligente Tipps & Wetten</li>
          <li>📈 Professionelles Portfolio-Tracking</li>
        </ul>
        <p className="status">Version 1.0.0 (MVP)</p>
      </div>
    </div>
  )
}

export default LoginForm
