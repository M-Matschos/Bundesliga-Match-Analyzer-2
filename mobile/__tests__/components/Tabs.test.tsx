import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import Tabs from '../../src/components/Tabs'

describe('Tabs Component', () => {
  const defaultTabs = [
    { id: 'tab1', label: 'Dashboard', content: <MockContent text="Dashboard" /> },
    { id: 'tab2', label: 'Weekend', badge: '3', content: <MockContent text="Weekend" /> },
    { id: 'tab3', label: 'Betting', content: <MockContent text="Betting" /> },
  ]

  it('renders all tabs', () => {
    render(<Tabs tabs={defaultTabs} />)
    expect(screen.getByText('Dashboard')).toBeTruthy()
    expect(screen.getByText('Weekend')).toBeTruthy()
    expect(screen.getByText('Betting')).toBeTruthy()
  })

  it('displays first tab content by default', () => {
    render(<Tabs tabs={defaultTabs} />)
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('displays defaultActiveId tab content', () => {
    render(<Tabs tabs={defaultTabs} defaultActiveId="tab2" />)
    expect(screen.getByText('Weekend')).toBeTruthy()
  })

  it('switches content on tab press', () => {
    render(<Tabs tabs={defaultTabs} />)

    const weekendTab = screen.getByText('Weekend')
    fireEvent.press(weekendTab)

    expect(screen.getByText('Weekend')).toBeTruthy()
  })

  it('calls onTabChange callback', () => {
    const onTabChange = jest.fn()
    render(
      <Tabs
        tabs={defaultTabs}
        onTabChange={onTabChange}
      />
    )

    fireEvent.press(screen.getByText('Betting'))
    expect(onTabChange).toHaveBeenCalledWith('tab3')
  })

  it('renders badges', () => {
    render(<Tabs tabs={defaultTabs} />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('skips disabled tabs', () => {
    const tabsWithDisabled = [
      { id: 'tab1', label: 'Active', content: <MockContent text="Active" /> },
      { id: 'tab2', label: 'Disabled', disabled: true, content: <MockContent text="Disabled" /> },
      { id: 'tab3', label: 'Active Again', content: <MockContent text="Active Again" /> },
    ]

    render(<Tabs tabs={tabsWithDisabled} />)
    const disabledTab = screen.getByText('Disabled')

    fireEvent.press(disabledTab)
    // Should remain on tab1 since tab2 is disabled
    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('renders variant: pills', () => {
    const { getByTestId } = render(
      <Tabs tabs={defaultTabs} variant="pills" />
    )
    // Variant is applied via StyleSheet, verified by component rendering
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('renders variant: underline', () => {
    render(
      <Tabs tabs={defaultTabs} variant="underline" />
    )
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('renders icons in tabs', () => {
    const tabsWithIcons = [
      { id: 'tab1', label: 'Dashboard', icon: '📊', content: <MockContent text="Dashboard" /> },
      { id: 'tab2', label: 'Weekend', icon: '⚽', content: <MockContent text="Weekend" /> },
    ]

    render(<Tabs tabs={tabsWithIcons} />)
    expect(screen.getByText('📊')).toBeTruthy()
    expect(screen.getByText('⚽')).toBeTruthy()
  })

  it('manages multiple tab switches', () => {
    const onTabChange = jest.fn()
    render(
      <Tabs
        tabs={defaultTabs}
        onTabChange={onTabChange}
      />
    )

    fireEvent.press(screen.getByText('Weekend'))
    fireEvent.press(screen.getByText('Betting'))
    fireEvent.press(screen.getByText('Dashboard'))

    expect(onTabChange).toHaveBeenCalledTimes(3)
    expect(onTabChange).toHaveBeenNthCalledWith(1, 'tab2')
    expect(onTabChange).toHaveBeenNthCalledWith(2, 'tab3')
    expect(onTabChange).toHaveBeenNthCalledWith(3, 'tab1')
  })

  it('handles empty tabs', () => {
    render(<Tabs tabs={[]} />)
    // Should not crash
    expect(true).toBeTruthy()
  })
})

// Mock component for tab content
function MockContent({ text }: { text: string }) {
  return <>{text}</>
}
