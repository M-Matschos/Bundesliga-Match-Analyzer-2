import React from 'react'
import './MatchList.css'

function MatchList({ matches, authToken, apiBase }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="empty-state">
        <p>Keine Spiele gefunden</p>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
          Starten Sie die Weekend-Berechnung, um Prognosen zu erhalten
        </p>
      </div>
    )
  }

  return (
    <div className="match-list">
      {matches.map((match, idx) => (
        <div key={idx} className="match-card">
          <div className="match-header">
            <div className="team">
              <span className="team-name">{match.home_team || 'Team A'}</span>
              <span className="team-short">(H)</span>
            </div>
            <div className="vs">vs</div>
            <div className="team">
              <span className="team-short">(A)</span>
              <span className="team-name">{match.away_team || 'Team B'}</span>
            </div>
          </div>

          <div className="match-info">
            <span className="date">
              {match.kickoff ? new Date(match.kickoff).toLocaleDateString('de-DE') : 'TBD'}
            </span>
            <span className="league">{match.league || 'Bundesliga'}</span>
          </div>

          <div className="match-predictions">
            <div className="prediction">
              <span className="label">Heimsieg</span>
              <span className="value">{match.home_prob ? (match.home_prob * 100).toFixed(1) : '-'}%</span>
            </div>
            <div className="prediction">
              <span className="label">Unentschieden</span>
              <span className="value">{match.draw_prob ? (match.draw_prob * 100).toFixed(1) : '-'}%</span>
            </div>
            <div className="prediction">
              <span className="label">Auswärtssieg</span>
              <span className="value">{match.away_prob ? (match.away_prob * 100).toFixed(1) : '-'}%</span>
            </div>
          </div>

          {match.confidence && (
            <div className="confidence">
              <span className="label">Konfidenz:</span>
              <span className="value">{(match.confidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MatchList
