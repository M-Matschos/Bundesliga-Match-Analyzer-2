import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Skeleton, { MatchCardSkeleton, TableRowSkeleton, ListItemSkeleton } from './Skeleton'
import Spinner, { OverlaySpinner, ButtonSpinner } from './Spinner'
import ErrorBoundary from './ErrorBoundary'
import ErrorBanner from './ErrorBanner'
import '@testing-library/jest-dom'

describe('Loading & Error States Pattern', () => {
  describe('Skeleton Component', () => {
    it('renders default text skeleton', () => {
      const { container } = render(<Skeleton />)
      expect(container.querySelector('.Skeleton')).toBeInTheDocument()
      expect(container.querySelector('.Skeleton--text')).toBeInTheDocument()
    })

    it('renders with custom variant', () => {
      const { container } = render(<Skeleton variant="button" />)
      expect(container.querySelector('.Skeleton--button')).toBeInTheDocument()
    })

    it('renders with custom width and height', () => {
      const { container } = render(
        <Skeleton width="200px" height="40px" />
      )
      const skeleton = container.querySelector('.Skeleton')
      expect(skeleton).toHaveStyle('width: 200px')
      expect(skeleton).toHaveStyle('height: 40px')
    })

    it('renders multiple skeletons when count > 1', () => {
      const { container } = render(<Skeleton count={3} />)
      const skeletons = container.querySelectorAll('.Skeleton')
      expect(skeletons.length).toBe(3)
    })

    it('renders MatchCardSkeleton with correct structure', () => {
      const { container } = render(<MatchCardSkeleton />)
      expect(container.querySelector('.MatchCardSkeleton')).toBeInTheDocument()
      expect(container.querySelector('.MatchCardSkeleton__header')).toBeInTheDocument()
      expect(container.querySelector('.MatchCardSkeleton__predictions')).toBeInTheDocument()
    })

    it('renders TableRowSkeleton with column count', () => {
      const { container } = render(<TableRowSkeleton columnCount={5} />)
      const cells = container.querySelectorAll('.TableRowSkeleton__cell')
      expect(cells.length).toBe(5)
    })

    it('renders ListItemSkeleton', () => {
      const { container } = render(<ListItemSkeleton />)
      expect(container.querySelector('.ListItemSkeleton')).toBeInTheDocument()
    })
  })

  describe('Spinner Component', () => {
    it('renders default spinner', () => {
      const { container } = render(<Spinner />)
      expect(container.querySelector('.Spinner')).toBeInTheDocument()
      expect(container.querySelector('.Spinner--md')).toBeInTheDocument()
    })

    it('renders spinner with different sizes', () => {
      const sizes = ['sm', 'md', 'lg']
      sizes.forEach((size) => {
        const { container } = render(<Spinner size={size} />)
        expect(container.querySelector(`.Spinner--${size}`)).toBeInTheDocument()
      })
    })

    it('renders spinner with custom color', () => {
      const { container } = render(<Spinner color="danger" />)
      expect(container.querySelector('.Spinner--danger')).toBeInTheDocument()
    })

    it('renders spinner with label', () => {
      render(<Spinner label="Loading predictions..." />)
      expect(screen.getByText('Loading predictions...')).toBeInTheDocument()
    })

    it('renders overlay spinner', () => {
      const { container } = render(<OverlaySpinner />)
      expect(container.querySelector('.OverlaySpinner')).toBeInTheDocument()
    })

    it('renders button spinner', () => {
      const { container } = render(<ButtonSpinner />)
      expect(container.querySelector('.Spinner--sm')).toBeInTheDocument()
    })

    it('has role="status" for accessibility', () => {
      render(<Spinner label="Loading" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('ErrorBoundary Component', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      console.error.mockRestore()
    })

    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders error UI when child component throws', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    })

    it('displays error icon', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('retry button resets error state', () => {
      let shouldThrow = true

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div>Content Loaded</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      shouldThrow = false
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
      rerender(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Content Loaded')).toBeInTheDocument()
    })

    it('displays error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const ThrowError = () => {
        throw new Error('Test error message')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const details = screen.getByText('Error Details (Development Only)')
      expect(details).toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('ErrorBanner Component', () => {
    it('renders error banner with message', () => {
      render(<ErrorBanner message="Something went wrong" />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders with title', () => {
      render(
        <ErrorBanner
          title="Error"
          message="Failed to load data"
        />
      )
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<ErrorBanner message="Error" />)
      expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument()
    })

    it('calls onDismiss when close button is clicked', () => {
      const onDismiss = jest.fn()
      render(
        <ErrorBanner message="Error" onDismiss={onDismiss} />
      )
      fireEvent.click(screen.getByLabelText('Dismiss error'))
      expect(onDismiss).toHaveBeenCalled()
    })

    it('hides banner when dismissed', () => {
      const { queryByText } = render(
        <ErrorBanner message="Error message" />
      )
      expect(queryByText('Error message')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Dismiss error'))
      expect(queryByText('Error message')).not.toBeInTheDocument()
    })

    it('renders action button when provided', () => {
      const action = { label: 'Retry', onClick: jest.fn() }
      render(
        <ErrorBanner message="Error" action={action} />
      )
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('calls action onClick when action button is clicked', () => {
      const onActionClick = jest.fn()
      const action = { label: 'Retry', onClick: onActionClick }
      render(
        <ErrorBanner message="Error" action={action} />
      )
      fireEvent.click(screen.getByText('Retry'))
      expect(onActionClick).toHaveBeenCalled()
    })

    it('renders with full-width class', () => {
      const { container } = render(
        <ErrorBanner message="Error" fullWidth={true} />
      )
      expect(container.querySelector('.ErrorBanner--full-width')).toBeInTheDocument()
    })

    it('has role="alert" for screen readers', () => {
      render(<ErrorBanner message="Error" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-live="assertive"', () => {
      render(<ErrorBanner message="Error" />)
      expect(screen.getByRole('alert')).toHaveAttribute(
        'aria-live',
        'assertive'
      )
    })
  })

  describe('Integration', () => {
    it('ErrorBoundary + ErrorBanner combination works', () => {
      const TestComponent = ({ hasError }) => {
        if (hasError) {
          throw new Error('Test error')
        }
        return (
          <ErrorBanner
            message="API failed"
            action={{ label: 'Retry', onClick: () => {} }}
          />
        )
      }

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent hasError={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('API failed')).toBeInTheDocument()

      rerender(
        <ErrorBoundary>
          <TestComponent hasError={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('Loading sequence: Skeleton → Content', () => {
      const { rerender } = render(<Skeleton count={3} />)
      expect(document.querySelectorAll('.Skeleton').length).toBe(3)

      rerender(<div>Loaded Content</div>)
      expect(document.querySelectorAll('.Skeleton').length).toBe(0)
      expect(screen.getByText('Loaded Content')).toBeInTheDocument()
    })
  })
})
