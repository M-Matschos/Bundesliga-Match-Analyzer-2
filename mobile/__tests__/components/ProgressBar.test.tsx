import React from 'react'
import { render, screen } from '@testing-library/react-native'
import ProgressBar from '../../src/components/ProgressBar'

describe('ProgressBar Component', () => {
  it('renders with progress prop (0-100)', () => {
    const { getByTestId } = render(<ProgressBar progress={65} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView).toBeTruthy()
  })

  it('displays 0% progress correctly', () => {
    const { getByTestId } = render(<ProgressBar progress={0} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.width).toBe('0%')
  })

  it('displays 100% progress correctly', () => {
    const { getByTestId } = render(<ProgressBar progress={100} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.width).toBe('100%')
  })

  it('displays 50% progress correctly', () => {
    const { getByTestId } = render(<ProgressBar progress={50} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.width).toBe('50%')
  })

  it('supports current/total interface', () => {
    const { getByTestId } = render(<ProgressBar current={7} total={10} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.width).toBe('70%')
  })

  it('shows red color for <33% progress', () => {
    const { getByTestId } = render(<ProgressBar progress={30} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.backgroundColor).toBe('#EF4444') // red
  })

  it('shows yellow color for 33-66% progress', () => {
    const { getByTestId } = render(<ProgressBar progress={50} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.backgroundColor).toBe('#EABB16') // yellow
  })

  it('shows green color for >66% progress', () => {
    const { getByTestId } = render(<ProgressBar progress={80} />)
    const progressView = getByTestId('progress-bar-fill')
    expect(progressView.props.style.backgroundColor).toBe('#22C55E') // green
  })

  it('handles edge case: progress > 100', () => {
    const { getByTestId } = render(<ProgressBar progress={150} />)
    const progressView = getByTestId('progress-bar-fill')
    // Should clamp to 100%
    expect(progressView.props.style.width).toBe('100%')
  })

  it('handles edge case: negative progress', () => {
    const { getByTestId } = render(<ProgressBar progress={-10} />)
    const progressView = getByTestId('progress-bar-fill')
    // Should clamp to 0%
    expect(progressView.props.style.width).toBe('0%')
  })
})
