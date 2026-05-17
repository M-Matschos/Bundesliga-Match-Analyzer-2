import React from 'react'
import { StyleSheet } from 'react-native'
import { render } from '@testing-library/react-native'
import { MatchCardSkeleton } from '../../src/components/skeletons/MatchCardSkeleton'

describe('MatchCardSkeleton Component', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    expect(getByTestId('match-card-skeleton')).toBeTruthy()
  })

  it('has shimmer animation container', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const shimmer = getByTestId('skeleton-shimmer')
    expect(shimmer).toBeTruthy()
  })

  it('displays placeholder for match header', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const header = getByTestId('skeleton-header')
    expect(header).toBeTruthy()
  })

  it('displays placeholders for team sections', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const teamHome = getByTestId('skeleton-team-home')
    const teamAway = getByTestId('skeleton-team-away')
    expect(teamHome).toBeTruthy()
    expect(teamAway).toBeTruthy()
  })

  it('displays placeholder for stats', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const stats = getByTestId('skeleton-stats')
    expect(stats).toBeTruthy()
  })

  it('has correct height/layout dimensions', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const skeleton = getByTestId('match-card-skeleton')
    const style = StyleSheet.flatten(skeleton.props.style)
    expect(style.minHeight).toBeGreaterThan(150)
  })

  it('mimics match card layout structure', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const container = getByTestId('match-card-skeleton')

    // Should have nested structure like MatchPredictionCard
    expect(container.props.children).toBeTruthy()
  })

  it('is visually distinct with gray tones', () => {
    const { getByTestId } = render(<MatchCardSkeleton />)
    const placeholders = getByTestId('skeleton-header')
    const style = StyleSheet.flatten(placeholders.props.style)
    const bgColor = style.backgroundColor as string
    // Skeleton block should have a muted background color (dark or light mode)
    expect(typeof bgColor).toBe('string')
    expect(bgColor.length).toBeGreaterThan(0)
  })
})
