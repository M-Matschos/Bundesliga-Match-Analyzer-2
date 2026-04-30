import React, { useState, useCallback } from 'react'
import axios from 'axios'
import './WeekendCalculator.css'

// Validation helper
const validateLeagueSelection = (selectedLeagues) => {
  const leagues = Object.keys(selectedLeagues).filter((l) => selectedLeagues[l])
  if (leagues.length === 0) {
    return 'Bitte wählen Sie mindestens eine Liga aus'
  }
  return null
}

function WeekendCalculator({ authToken, apiBase }) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [selectedLeagues, setSelectedLeagues] = useState({
    bundesliga: true,
    bundesliga2: false,
  })

  const handleLeagueChange = useCallback(
    (league) => {
      setSelectedLeagues((prev) => ({
        ...prev,
        [league]: !prev[league],
      }))
    },
    []
  )

  const handleCalculate = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)

      // Validate selection
      const validationError = validateLeagueSelection(selectedLeagues)
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      const leagues = Object.keys(selectedLeagues).filter((l) => selectedLeagues[l])

      const response = await axios.post(
        `${apiBase}/weekend/calculate`,
        { leagues },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      setResults(response.data)
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Fehler bei der Berechnung'
      setError(errorMessage)
      console.error('Calculate error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedLeagues, authToken, apiBase])

  const handleReset = useCallback(() => {
    setResults(null)
    setError(null)
    setSelectedLeagues({
      bundesliga: true,
      bundesliga2: false,
    })
  }, [])

  return (
    <div className="weekend-calculator">
      <div className="calculator-card">
        <h3>⚡ Wochenend-Berechnung</h3>

        <div className="league-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedLeagues.bundesliga}
              onChange={() => handleLeagueChange('bundesliga')}
              disabled={loading}
            />
            <span>Bundesliga (1. Liga)</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedLeagues.bundesliga2}
              onChange={() => handleLeagueChange('bundesliga2')}
              disabled={loading}
            />
            <span>2. Bundesliga</span>
          </label>
        </div>

        {error && (
          <div className="error form-error-summary" role="alert">
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleCalculate}
          disabled={loading}
          style={{ width: '100%', marginTop: '16px' }}
        >
          {loading ? 'Berechne Prognosen...' : '⚡ Berechnung starten'}
        </button>
      </div>

      {results && (
        <div className="results-card">
          <h3>Ergebnisse</h3>

          <div className="results-summary">
            <div className="result-item">
              <span className="result-label">Status:</span>
              <span className="result-value">{results.status || 'Abgeschlossen'}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Spiele analysiert:</span>
              <span className="result-value">{results.match_count || 0}</span>
            </div>
            {results.average_confidence && (
              <div className="result-item">
                <span className="result-label">Durchschn. Konfidenz:</span>
                <span className="result-value">
                  {(results.average_confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {results.message && (
            <p className="success-message">{results.message}</p>
          )}

          <button
            className="btn-secondary"
            onClick={handleReset}
            style={{ width: '100%', marginTop: '16px' }}
          >
            Neue Berechnung
          </button>
        </div>
      )}
    </div>
  )
}

export default WeekendCalculator
