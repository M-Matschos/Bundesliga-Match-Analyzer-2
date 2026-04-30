import React, { useState, useRef, useEffect } from 'react'
import './Tabs.css'

/**
 * Tabs Component — Horizontal tab bar with content switching
 *
 * Example: Dashboard | Weekend | Betting | Profile
 * Features: keyboard navigation, active indicator, disabled tabs
 */

export default function Tabs({
  tabs = [],
  defaultActiveId = null,
  onTabChange = null,
  variant = 'default', // 'default' | 'pills' | 'underline'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  className = '',
}) {
  const activeId = defaultActiveId || (tabs.length > 0 ? tabs[0].id : null)
  const [selected, setSelected] = useState(activeId)
  const tabRefs = useRef({})

  // Handle tab change
  const handleTabClick = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab && !tab.disabled) {
      setSelected(tabId)
      if (onTabChange) {
        onTabChange(tabId)
      }
    }
  }

  // Keyboard navigation: Arrow Left/Right, Home, End
  const handleKeyDown = (event) => {
    const enabledTabs = tabs.filter((t) => !t.disabled)
    const currentIndex = enabledTabs.findIndex((t) => t.id === selected)

    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = enabledTabs.length - 1
        break
      default:
        return
    }

    const nextTabId = enabledTabs[nextIndex].id
    setSelected(nextTabId)
    if (onTabChange) {
      onTabChange(nextTabId)
    }

    // Focus the newly selected tab
    if (tabRefs.current[nextTabId]) {
      tabRefs.current[nextTabId].focus()
    }
  }

  // Auto-scroll active tab into view
  useEffect(() => {
    if (tabRefs.current[selected]) {
      tabRefs.current[selected].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [selected])

  const tabListClass = [
    'Tabs__list',
    `Tabs__list--${variant}`,
    `Tabs__list--${size}`,
    fullWidth && 'Tabs__list--full-width',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`Tabs ${className}`} role="tablist">
      <div className={tabListClass} onKeyDown={handleKeyDown}>
        {tabs.map((tab) => {
          const isActive = tab.id === selected
          const isDisabled = tab.disabled

          const tabClass = [
            'Tabs__tab',
            `Tabs__tab--${variant}`,
            `Tabs__tab--${size}`,
            isActive && 'Tabs__tab--active',
            isDisabled && 'Tabs__tab--disabled',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[tab.id] = el
              }}
              className={tabClass}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              onClick={() => handleTabClick(tab.id)}
              disabled={isDisabled}
              aria-label={tab.label}
            >
              {tab.icon && <span className="Tabs__tab-icon">{tab.icon}</span>}
              <span className="Tabs__tab-label">{tab.label}</span>
              {tab.badge && <span className="Tabs__tab-badge">{tab.badge}</span>}
            </button>
          )
        })}
      </div>

      {/* Tab content panes */}
      <div className="Tabs__content">
        {tabs.map((tab) => {
          const isActive = tab.id === selected

          return (
            <div
              key={tab.id}
              role="tabpanel"
              aria-labelledby={tab.id}
              className={`Tabs__pane ${isActive ? 'Tabs__pane--active' : ''}`}
              hidden={!isActive}
            >
              {tab.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * TabPanel Component — For manual tab management
 * Use when you want full control over tab state
 */
export function TabPanel({ id, children, hidden = false }) {
  return (
    <div id={id} role="tabpanel" className={hidden ? 'hidden' : ''}>
      {children}
    </div>
  )
}
