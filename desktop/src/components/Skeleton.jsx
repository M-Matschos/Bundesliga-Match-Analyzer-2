import React from 'react'
import './Skeleton.css'

/**
 * Skeleton Component — Placeholder during data loading
 *
 * Types: text, card, table-row, match-card
 * Features: shimmer animation, custom width/height
 */

const VARIANTS = {
  text: 'Skeleton--text',
  'text-sm': 'Skeleton--text-sm',
  'text-lg': 'Skeleton--text-lg',
  card: 'Skeleton--card',
  button: 'Skeleton--button',
  avatar: 'Skeleton--avatar',
  'table-row': 'Skeleton--table-row',
  'match-card': 'Skeleton--match-card',
}

export default function Skeleton({
  variant = 'text',
  width = '100%',
  height = null,
  count = 1,
  className = '',
}) {
  const skeletonClass = [
    'Skeleton',
    VARIANTS[variant] || VARIANTS.text,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    width,
    height: height || (variant === 'text' ? '16px' : undefined),
  }

  if (count > 1) {
    return (
      <div className="Skeleton__group">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={skeletonClass} style={style} />
        ))}
      </div>
    )
  }

  return <div className={skeletonClass} style={style} />
}

/**
 * Match Card Skeleton — Skeleton for match prediction cards
 */
export function MatchCardSkeleton() {
  return (
    <div className="MatchCardSkeleton">
      {/* Header: Teams */}
      <div className="MatchCardSkeleton__header">
        <div className="MatchCardSkeleton__team">
          <Skeleton variant="avatar" width="40px" height="40px" />
          <Skeleton variant="text-sm" width="80px" />
        </div>
        <Skeleton variant="text-sm" width="20px" />
        <div className="MatchCardSkeleton__team">
          <Skeleton variant="text-sm" width="80px" />
          <Skeleton variant="avatar" width="40px" height="40px" />
        </div>
      </div>

      {/* Info: Date & League */}
      <div className="MatchCardSkeleton__info">
        <Skeleton variant="text-sm" width="100px" />
        <Skeleton variant="text-sm" width="60px" />
      </div>

      {/* Predictions: Home/Draw/Away */}
      <div className="MatchCardSkeleton__predictions">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="MatchCardSkeleton__prediction">
            <Skeleton variant="text-sm" width="100%" height="14px" />
            <Skeleton variant="text-lg" width="100%" height="20px" />
          </div>
        ))}
      </div>

      {/* Confidence */}
      <div className="MatchCardSkeleton__confidence">
        <Skeleton variant="text-sm" width="80px" />
        <Skeleton variant="text-sm" width="50px" />
      </div>
    </div>
  )
}

/**
 * Table Row Skeleton — Skeleton for table rows
 */
export function TableRowSkeleton({ columnCount = 4 }) {
  return (
    <div className="TableRowSkeleton">
      {Array.from({ length: columnCount }).map((_, i) => (
        <div key={i} className="TableRowSkeleton__cell">
          <Skeleton variant="text" width="100%" height="16px" />
        </div>
      ))}
    </div>
  )
}

/**
 * List Item Skeleton — Generic skeleton for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="ListItemSkeleton">
      <Skeleton variant="avatar" width="48px" height="48px" />
      <div className="ListItemSkeleton__content">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text-sm" width="40%" />
      </div>
    </div>
  )
}
