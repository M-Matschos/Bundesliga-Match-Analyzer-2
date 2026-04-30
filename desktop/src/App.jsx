import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE = 'http://localhost:8000/api/v1'

  // Check if already authenticated on mount
  useEffect(() => {
    if (authToken) {
      verifyToken(authToken)
    }
  }, [authToken])

  const verifyToken = async (token) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setIsAuthenticated(true)
      setError(null)
    } catch (err) {
      console.error('Token verification failed:', err)
      setAuthToken(null)
      localStorage.removeItem('authToken')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      })
      const token = response.data.access_token
      setAuthToken(token)
      localStorage.setItem('authToken', token)
      setIsAuthenticated(true)
      setUser(response.data.user || { email })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setAuthToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
  }

  const handleRegister = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
      })
      // Auto-login after registration
      await handleLogin(email, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verbindung wird hergestellt...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
          error={error}
        />
      ) : (
        <Dashboard
          user={user}
          authToken={authToken}
          apiBase={API_BASE}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
