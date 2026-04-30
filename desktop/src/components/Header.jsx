import React from 'react'
import './Header.css'

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-small">⚽</div>
        <h1>Match Oracle</h1>
      </div>
      <div className="header-right">
        <span className="user-email">{user?.email || 'Nutzer'}</span>
        <button className="btn-logout" onClick={onLogout}>
          Abmelden
        </button>
      </div>
    </header>
  )
}

export default Header
