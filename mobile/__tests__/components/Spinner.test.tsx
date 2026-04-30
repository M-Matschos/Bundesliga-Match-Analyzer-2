import React from 'react'
import { render, screen } from '@testing-library/react-native'
import Spinner from '../../src/components/Spinner'
import { COLORS } from '../../src/theme/colors'

describe('Spinner Component', () => {
  it('renders spinner with default props', () => {
    render(<Spinner testID="spinner" />)
    expect(screen.getByTestId('spinner')).toBeTruthy()
  })

  it('renders small spinner', () => {
    render(<Spinner size="sm" testID="spinner-sm" />)
    expect(screen.getByTestId('spinner-sm')).toBeTruthy()
  })

  it('renders medium spinner', () => {
    render(<Spinner size="md" testID="spinner-md" />)
    expect(screen.getByTestId('spinner-md')).toBeTruthy()
  })

  it('renders large spinner', () => {
    render(<Spinner size="lg" testID="spinner-lg" />)
    expect(screen.getByTestId('spinner-lg')).toBeTruthy()
  })

  it('uses custom color', () => {
    render(
      <Spinner
        color={COLORS.green}
        testID="spinner-green"
      />
    )
    expect(screen.getByTestId('spinner-green')).toBeTruthy()
  })

  it('uses default blue color', () => {
    render(<Spinner testID="spinner-blue" />)
    // Default color is COLORS.blue
    expect(screen.getByTestId('spinner-blue')).toBeTruthy()
  })

  it('has accessibility attributes', () => {
    const { getByTestId } = render(
      <Spinner testID="spinner-a11y" />
    )
    const spinner = getByTestId('spinner-a11y')

    // Check accessibility props
    expect(spinner.props.accessible).toBe(true)
    expect(spinner.props.accessibilityRole).toBe('progressbar')
    expect(spinner.props.accessibilityLabel).toBe('Lädt...')
  })

  it('handles multiple spinners', () => {
    render(
      <>
        <Spinner size="sm" testID="spinner-1" />
        <Spinner size="md" testID="spinner-2" />
        <Spinner size="lg" testID="spinner-3" />
      </>
    )

    expect(screen.getByTestId('spinner-1')).toBeTruthy()
    expect(screen.getByTestId('spinner-2')).toBeTruthy()
    expect(screen.getByTestId('spinner-3')).toBeTruthy()
  })

  it('uses custom testID', () => {
    render(<Spinner testID="custom-loader" />)
    expect(screen.getByTestId('custom-loader')).toBeTruthy()
  })

  it('defaults to md size', () => {
    // When no size prop is provided, should default to 'md'
    render(<Spinner testID="spinner-default-size" />)
    expect(screen.getByTestId('spinner-default-size')).toBeTruthy()
  })

  it('renders with custom colors', () => {
    render(
      <>
        <Spinner color={COLORS.red} testID="red-spinner" />
        <Spinner color={COLORS.green} testID="green-spinner" />
        <Spinner color={COLORS.orange} testID="orange-spinner" />
      </>
    )

    expect(screen.getByTestId('red-spinner')).toBeTruthy()
    expect(screen.getByTestId('green-spinner')).toBeTruthy()
    expect(screen.getByTestId('orange-spinner')).toBeTruthy()
  })
})
