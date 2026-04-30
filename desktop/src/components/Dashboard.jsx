import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'
import Header from './Header'
import MatchList from './MatchList'
import WeekendCalculator from './WeekendCalculator'

function Dashboard({ user, authToken, apiBase, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchUpcomingMatches()
    }
  }, [activeTab])

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${apiBase}/matches`, {
        params: { limit: 12 },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setMatches(response.data || [])
    } catch (err) {
      setError('Fehler beim Laden der Spiele')
      console.error('Fetch matches error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} />

      <div className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'weekend' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekend')}
        >
          ⚡ Weekend-Berechnung
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      <main className="dashboard-content">
        {error && <div className="error">{error}</div>}

        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Kommende Spiele</h2>
            {loading ? (
              <div className="loading">Lädt...</div>
            ) : (
              <MatchList
                matches={matches}
                authToken={authToken}
                apiBase={apiBase}
              />
            )}
          </div>
        )}

        {activeTab === 'weekend' && (
          <div className="tab-content">
            <h2>Weekend-Prognose-Berechnung</h2>
            <WeekendCalculator
              authToken={authToken}
              apiBase={apiBase}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h2>Analytics & Statistiken</h2>
            <p style={{ color: '#94a3b8' }}>
              Analysen werden in zukünftigen Versionen hinzugefügt
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
