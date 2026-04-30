import React, { useState } from 'react'
import './Sidebar.css'

/**
 * Sidebar Component — Vertical navigation menu
 *
 * Example: Dashboard, Matches, Teams, Settings
 * Features: icons + labels, collapse on mobile, active highlighting
 */

export default function Sidebar({
  items = [],
  defaultActiveId = null,
  onItemClick = null,
  collapsed = false,
  onCollapsedChange = null,
  variant = 'default', // 'default' | 'compact' | 'floating'
  className = '',
}) {
  const activeId = defaultActiveId || (items.length > 0 ? items[0].id : null)
  const [selected, setSelected] = useState(activeId)
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const handleItemClick = (itemId) => {
    const item = items.find((i) => i.id === itemId)
    if (item && !item.disabled) {
      setSelected(itemId)
      if (onItemClick) {
        onItemClick(itemId)
      }
    }
  }

  const handleCollapsedToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    }
  }

  const sidebarClass = [
    'Sidebar',
    `Sidebar--${variant}`,
    isCollapsed && 'Sidebar--collapsed',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={`${sidebarClass} ${className}`} role="navigation" aria-label="Sidebar navigation">
      <div className="Sidebar__header">
        {!isCollapsed && <h2 className="Sidebar__title">Navigation</h2>}
        <button
          className="Sidebar__toggle"
          onClick={handleCollapsedToggle}
          aria-expanded={!isCollapsed}
          aria-label="Toggle sidebar"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="Sidebar__nav">
        {items.map((item) => {
          const isActive = item.id === selected
          const isDisabled = item.disabled

          const itemClass = [
            'Sidebar__item',
            isActive && 'Sidebar__item--active',
            isDisabled && 'Sidebar__item--disabled',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={item.id}
              className={itemClass}
              onClick={() => handleItemClick(item.id)}
              disabled={isDisabled}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon && <span className="Sidebar__item-icon">{item.icon}</span>}
              {!isCollapsed && (
                <span className="Sidebar__item-label">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="Sidebar__item-badge">{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {!isCollapsed && (
        <div className="Sidebar__footer">
          <p className="Sidebar__footer-text">v1.0.0</p>
        </div>
      )}
    </aside>
  )
}

/**
 * SidebarGroup — Group of related sidebar items
 */
export function SidebarGroup({ label, items = [], collapsed = false }) {
  return (
    <div className={`Sidebar__group ${collapsed ? 'Sidebar__group--collapsed' : ''}`}>
      {label && <h3 className="Sidebar__group-label">{label}</h3>}
      <div className="Sidebar__group-items">
        {items.map((item) => (
          <button
            key={item.id}
            className="Sidebar__group-item"
            disabled={item.disabled}
            title={item.label}
          >
            {item.icon && <span className="Sidebar__group-item-icon">{item.icon}</span>}
            <span className="Sidebar__group-item-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
