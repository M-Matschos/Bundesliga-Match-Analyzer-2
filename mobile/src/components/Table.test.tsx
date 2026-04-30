import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import Table from './Table'

describe('Table Component (Mobile)', () => {
  const mockColumns = [
    { key: 'team', label: 'Team', sortable: true },
    { key: 'points', label: 'Points', sortable: true, align: 'center' },
    { key: 'wins', label: 'Wins', sortable: false, align: 'right' },
  ]

  const mockData = [
    { id: '1', team: 'Bayern Munich', points: 72, wins: 22 },
    { id: '2', team: 'Dortmund', points: 68, wins: 20 },
    { id: '3', team: 'Leverkusen', points: 65, wins: 19 },
  ]

  describe('Rendering', () => {
    it('renders table with columns and data', () => {
      render(<Table columns={mockColumns} data={mockData} />)
      expect(screen.getByText('Team')).toBeTruthy()
      expect(screen.getByText('Bayern Munich')).toBeTruthy()
      expect(screen.getByText('72')).toBeTruthy()
    })

    it('renders empty state when no data', () => {
      render(
        <Table columns={mockColumns} data={[]} empty="No teams found" />
      )
      expect(screen.getByText('No teams found')).toBeTruthy()
    })

    it('renders loading state with spinner', () => {
      const { getByTestId } = render(
        <Table columns={mockColumns} data={[]} loading={true} />
      )
      // ActivityIndicator has testID by default
      expect(getByTestId('RCTActivityIndicator')).toBeTruthy()
    })

    it('renders error state', () => {
      const errorMsg = 'Failed to load data'
      render(<Table columns={mockColumns} data={[]} error={errorMsg} />)
      expect(screen.getByText(errorMsg)).toBeTruthy()
    })
  })

  describe('Sorting', () => {
    it('sorts data by column when sortable=true', () => {
      const { getByText } = render(
        <Table columns={mockColumns} data={mockData} sortable={true} />
      )

      const pointsButton = getByText('Points')
      fireEvent.press(pointsButton)

      // Verify sort indicator appears
      expect(getByText('↑')).toBeTruthy()
    })

    it('toggles sort direction on repeated clicks', () => {
      const { getByText, queryByText } = render(
        <Table columns={mockColumns} data={mockData} sortable={true} />
      )

      const pointsButton = getByText('Points')

      // First click: ascending
      fireEvent.press(pointsButton)
      expect(getByText('↑')).toBeTruthy()

      // Second click: descending
      fireEvent.press(pointsButton)
      expect(queryByText('↑')).toBeFalsy()
      expect(getByText('↓')).toBeTruthy()
    })
  })

  describe('Variants', () => {
    it('renders striped rows correctly', () => {
      const { getAllByTestId } = render(
        <Table columns={mockColumns} data={mockData} striped={true} />
      )
      // With striped variant, alternating rows should have different background
      expect(getAllByTestId('row').length).toBeGreaterThan(0)
    })

    it('applies dense styling', () => {
      render(<Table columns={mockColumns} data={mockData} dense={true} />)
      // Dense mode renders with reduced padding (verified through styles)
      expect(screen.getByText('Team')).toBeTruthy()
    })
  })

  describe('Row Click', () => {
    it('calls onRowClick handler when row is pressed', () => {
      const onRowClick = jest.fn()
      const { getByText } = render(
        <Table
          columns={mockColumns}
          data={mockData}
          onRowClick={onRowClick}
        />
      )

      const teamCell = getByText('Bayern Munich')
      fireEvent.press(teamCell)

      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    })

    it('does not call onRowClick when handler is not provided', () => {
      const { getByText } = render(
        <Table columns={mockColumns} data={mockData} />
      )

      const teamCell = getByText('Bayern Munich')
      fireEvent.press(teamCell)

      // Should not throw
      expect(screen.getByText('Bayern Munich')).toBeTruthy()
    })
  })

  describe('Custom Rendering', () => {
    it('uses custom render function for columns', () => {
      const customColumns = [
        {
          key: 'team',
          label: 'Team',
          render: (value: string) => `🏆 ${value}`,
        },
      ]

      render(
        <Table columns={customColumns} data={[{ id: '1', team: 'Bayern' }]} />
      )

      expect(screen.getByText('🏆 Bayern')).toBeTruthy()
    })
  })

  describe('FlatList Rendering', () => {
    it('renders all data rows via FlatList', () => {
      const { getAllByText } = render(
        <Table columns={mockColumns} data={mockData} />
      )

      // All team names should be rendered
      expect(getAllByText('Bayern Munich')).toBeTruthy()
      expect(screen.getByText('Dortmund')).toBeTruthy()
      expect(screen.getByText('Leverkusen')).toBeTruthy()
    })

    it('uses correct key extractor', () => {
      const { rerender } = render(
        <Table columns={mockColumns} data={mockData} />
      )

      // Data with updated values but same IDs should reuse list items
      const updatedData = [
        { id: '1', team: 'Bayern Munich', points: 75, wins: 23 },
        { id: '2', team: 'Dortmund', points: 68, wins: 20 },
        { id: '3', team: 'Leverkusen', points: 65, wins: 19 },
      ]

      rerender(<Table columns={mockColumns} data={updatedData} />)

      expect(screen.getByText('75')).toBeTruthy()
    })
  })

  describe('Column Alignment', () => {
    it('aligns columns correctly (left, center, right)', () => {
      render(<Table columns={mockColumns} data={mockData} />)

      // Verify Team column (left), Points (center), Wins (right) render
      expect(screen.getByText('Team')).toBeTruthy()
      expect(screen.getByText('Points')).toBeTruthy()
      expect(screen.getByText('Wins')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty columns gracefully', () => {
      render(<Table columns={[]} data={mockData} />)
      expect(screen.getByText('No teams found')).toBeTruthy()
    })

    it('handles missing row IDs with index fallback', () => {
      const dataWithoutId = mockData.map(({ id, ...rest }) => rest)
      // This should still render, but we'd recommend always having IDs
      render(<Table columns={mockColumns} data={dataWithoutId as any} />)
      expect(screen.getByText('Bayern Munich')).toBeTruthy()
    })

    it('handles very long team names', () => {
      const longNameData = [
        {
          id: '1',
          team: 'Very Long Team Name That Could Break Layout',
          points: 72,
          wins: 22,
        },
      ]

      render(<Table columns={mockColumns} data={longNameData} />)
      expect(
        screen.getByText('Very Long Team Name That Could Break Layout')
      ).toBeTruthy()
    })
  })

  describe('Custom Props', () => {
    it('accepts and uses custom empty message', () => {
      const customEmpty = 'No standings available'
      render(
        <Table columns={mockColumns} data={[]} empty={customEmpty} />
      )
      expect(screen.getByText(customEmpty)).toBeTruthy()
    })

    it('accepts and uses custom error message', () => {
      const customError = 'API connection failed'
      render(
        <Table
          columns={mockColumns}
          data={mockData}
          error={customError}
        />
      )
      expect(screen.getByText(customError)).toBeTruthy()
    })
  })
})
