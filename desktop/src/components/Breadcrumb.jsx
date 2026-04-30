import React from 'react'
import './Breadcrumb.css'

/**
 * Breadcrumb Component — Shows navigation hierarchy
 *
 * Example: Home > Matches > Match Details
 * Features: links clickable (except last), custom separator
 */

export default function Breadcrumb({
  items = [],
  onNavigate = null,
  separator = '/',
}) {
  if (items.length === 0) return null

  return (
    <nav className="Breadcrumb" aria-label="Breadcrumb">
      <ol className="Breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.id || index} className="Breadcrumb__item">
              {isLast ? (
                <span className="Breadcrumb__text Breadcrumb__text--active">
                  {item.label}
                </span>
              ) : (
                <button
                  className="Breadcrumb__link"
                  onClick={() => onNavigate && onNavigate(item)}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <span className="Breadcrumb__separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
