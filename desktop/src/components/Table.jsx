import React, { useState, useMemo } from 'react'
import './Table.css'

/**
 * Table Component — Reusable table for match data, standings, stats
 *
 * Variants: basic, sortable, action, dense
 * States: default, hover, loading (skeletons), empty, error
 * Design tokens: colors, spacing, typography
 */

export default function Table({
  columns = [],
  data = [],
  sortable = false,
  striped = false,
  hover = false,
  dense = false,
  loading = false,
  empty = 'No data found',
  onRowClick = null,
  error = null,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc', // 'asc' | 'desc'
  })

  // Sort data if sortable
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return data

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      // String comparison
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      // Number comparison
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    })

    return sorted
  }, [data, sortConfig, sortable])

  const handleSort = (columnKey) => {
    if (!sortable) return

    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        // Toggle direction
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      // New column
      return { key: columnKey, direction: 'asc' }
    })
  }

  const tableClass = [
    'Table',
    striped && 'Table--striped',
    hover && 'Table--hover',
    dense && 'Table--dense',
  ]
    .filter(Boolean)
    .join(' ')

  // Loading state: show skeleton rows
  if (loading) {
    return (
      <div className={tableClass}>
        <thead className="Table__header">
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="Table__row Table__row--loading">
              {columns.map((col) => (
                <td key={col.key} className="Table__cell Table__cell--skeleton">
                  <div className="skeleton-line" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="Table__error">
        <div className="Table__error-icon">⚠️</div>
        <div className="Table__error-message">{error}</div>
      </div>
    )
  }

  // Empty state
  if (sortedData.length === 0) {
    return (
      <div className="Table__empty">
        <div className="Table__empty-icon">📊</div>
        <p>{empty}</p>
      </div>
    )
  }

  return (
    <table className={tableClass}>
      <thead className="Table__header">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`Table__header-cell ${col.align ? `Table__header-cell--${col.align}` : ''}`}
              style={{ width: col.width || 'auto' }}
              onClick={() => col.sortable && handleSort(col.key)}
              role={col.sortable ? 'button' : 'columnheader'}
              tabIndex={col.sortable ? 0 : -1}
              onKeyPress={(e) => {
                if (col.sortable && e.key === 'Enter') handleSort(col.key)
              }}
            >
              <div className="Table__header-content">
                <span>{col.label}</span>
                {col.sortable && sortConfig.key === col.key && (
                  <span className="Table__sort-indicator">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, rowIdx) => (
          <tr
            key={row.id || rowIdx}
            className="Table__row"
            onClick={() => onRowClick && onRowClick(row)}
            role={onRowClick ? 'button' : 'row'}
            tabIndex={onRowClick ? 0 : -1}
            onKeyPress={(e) => {
              if (onRowClick && e.key === 'Enter') onRowClick(row)
            }}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={`Table__cell ${col.align ? `Table__cell--${col.align}` : ''}`}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
