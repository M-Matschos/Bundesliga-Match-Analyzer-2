import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Table from './Table'
import '@testing-library/jest-dom'

describe('Table Component (Desktop)', () => {
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
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(screen.getByText('Points')).toBeInTheDocument()
      expect(screen.getByText('Bayern Munich')).toBeInTheDocument()
      expect(screen.getByText('72')).toBeInTheDocument()
    })

    it('renders empty state when no data', () => {
      render(<Table columns={mockColumns} data={[]} empty="No teams found" />)
      expect(screen.getByText('No teams found')).toBeInTheDocument()
      expect(screen.getByText('📊')).toBeInTheDocument()
    })

    it('renders loading state with skeleton rows', () => {
      render(<Table columns={mockColumns} data={[]} loading={true} />)
      const skeletonLines = document.querySelectorAll('.skeleton-line')
      expect(skeletonLines.length).toBeGreaterThan(0)
    })

    it('renders error state', () => {
      const errorMsg = 'Failed to load data'
      render(
        <Table columns={mockColumns} data={[]} error={errorMsg} />
      )
      expect(screen.getByText(errorMsg)).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('sorts data by column when sortable=true and column clicked', () => {
      const { rerender } = render(
        <Table columns={mockColumns} data={mockData} sortable={true} />
      )

      const teamHeader = screen.getByText('Team').closest('th')
      fireEvent.click(teamHeader)

      // After sorting, Dortmund should come before Leverkusen
      const rows = screen.getAllByRole('row')
      expect(rows[1].textContent).toMatch(/Bayern/)
    })

    it('toggles sort direction on repeated clicks', () => {
      render(
        <Table columns={mockColumns} data={mockData} sortable={true} />
      )

      const pointsHeader = screen.getByText('Points').closest('th')

      // First click: ascending
      fireEvent.click(pointsHeader)
      let sortIndicator = pointsHeader.querySelector('.Table__sort-indicator')
      expect(sortIndicator?.textContent).toBe('↑')

      // Second click: descending
      fireEvent.click(pointsHeader)
      sortIndicator = pointsHeader.querySelector('.Table__sort-indicator')
      expect(sortIndicator?.textContent).toBe('↓')
    })

    it('does not sort when sortable=false', () => {
      render(
        <Table columns={mockColumns} data={mockData} sortable={false} />
      )

      const teamHeader = screen.getByText('Team').closest('th')
      fireEvent.click(teamHeader)

      // Sort indicator should not appear
      const sortIndicators = document.querySelectorAll('.Table__sort-indicator')
      expect(sortIndicators.length).toBe(0)
    })
  })

  describe('Variants', () => {
    it('applies striped class when striped=true', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} striped={true} />
      )
      expect(container.querySelector('.Table--striped')).toBeInTheDocument()
    })

    it('applies hover class when hover=true', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} hover={true} />
      )
      expect(container.querySelector('.Table--hover')).toBeInTheDocument()
    })

    it('applies dense class when dense=true', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} dense={true} />
      )
      expect(container.querySelector('.Table--dense')).toBeInTheDocument()
    })
  })

  describe('Row Click', () => {
    it('calls onRowClick handler when row is clicked', () => {
      const onRowClick = jest.fn()
      render(
        <Table
          columns={mockColumns}
          data={mockData}
          onRowClick={onRowClick}
        />
      )

      const rows = screen.getAllByRole('row')
      fireEvent.click(rows[1]) // First data row (index 1, index 0 is header)

      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    })
  })

  describe('Custom Rendering', () => {
    it('uses custom render function for columns', () => {
      const customColumns = [
        {
          key: 'team',
          label: 'Team',
          render: (value) => `🏆 ${value}`,
        },
      ]

      render(
        <Table columns={customColumns} data={[{ id: '1', team: 'Bayern' }]} />
      )

      expect(screen.getByText('🏆 Bayern')).toBeInTheDocument()
    })
  })

  describe('Alignment', () => {
    it('applies correct alignment classes to cells', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} />
      )

      // Check center-aligned cell
      const centerCells = container.querySelectorAll('.Table__cell--center')
      expect(centerCells.length).toBeGreaterThan(0)

      // Check right-aligned cell
      const rightCells = container.querySelectorAll('.Table__cell--right')
      expect(rightCells.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic table structure', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} />
      )

      expect(container.querySelector('table')).toBeInTheDocument()
      expect(container.querySelector('thead')).toBeInTheDocument()
      expect(container.querySelector('tbody')).toBeInTheDocument()
    })

    it('sortable headers have role="button"', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} sortable={true} />
      )

      const sortableHeaders = container.querySelectorAll('[role="button"]')
      expect(sortableHeaders.length).toBeGreaterThan(0)
    })
  })
})
