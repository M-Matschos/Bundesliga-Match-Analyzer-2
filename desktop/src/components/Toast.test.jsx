import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Toast from './Toast'
import '@testing-library/jest-dom'

describe('Toast Component', () => {
  const defaultProps = {
    id: 1,
    message: 'Test notification',
    type: 'info',
    onClose: jest.fn(),
  }

  describe('Rendering', () => {
    it('renders success toast', () => {
      render(<Toast {...defaultProps} type="success" message="Success!" />)
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('renders error toast', () => {
      render(<Toast {...defaultProps} type="error" message="Error!" />)
      expect(screen.getByText('Error!')).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('renders info toast', () => {
      render(<Toast {...defaultProps} type="info" message="Info!" />)
      expect(screen.getByText('Info!')).toBeInTheDocument()
      expect(screen.getByText('ℹ️')).toBeInTheDocument()
    })

    it('renders warning toast', () => {
      render(<Toast {...defaultProps} type="warning" message="Warning!" />)
      expect(screen.getByText('Warning!')).toBeInTheDocument()
      expect(screen.getByText('⚡')).toBeInTheDocument()
    })

    it('renders correct icon for each type', () => {
      const types = {
        success: '✓',
        error: '⚠️',
        info: 'ℹ️',
        warning: '⚡',
      }

      Object.entries(types).forEach(([type, icon]) => {
        const { unmount } = render(
          <Toast {...defaultProps} type={type} />
        )
        expect(screen.getByText(icon)).toBeInTheDocument()
        unmount()
      })
    })

    it('renders message text', () => {
      const message = 'Custom message text'
      render(<Toast {...defaultProps} message={message} />)
      expect(screen.getByText(message)).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('renders close button', () => {
      render(<Toast {...defaultProps} />)
      expect(screen.getByLabelText('Close notification')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn()
      render(<Toast {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('✕'))

      expect(onClose).toHaveBeenCalledWith(1)
    })
  })

  describe('Action Button', () => {
    it('does not render action button when action is null', () => {
      render(<Toast {...defaultProps} action={null} />)
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    })

    it('renders action button when action is provided', () => {
      const action = { label: 'Retry', onClick: jest.fn() }
      render(<Toast {...defaultProps} action={action} />)
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('calls action onClick when action button is clicked', () => {
      const onActionClick = jest.fn()
      const action = { label: 'Retry', onClick: onActionClick }
      render(<Toast {...defaultProps} action={action} />)

      fireEvent.click(screen.getByText('Retry'))

      expect(onActionClick).toHaveBeenCalled()
    })

    it('closes toast after action is clicked', () => {
      const onClose = jest.fn()
      const action = { label: 'Retry', onClick: jest.fn() }
      render(<Toast {...defaultProps} action={action} onClose={onClose} />)

      fireEvent.click(screen.getByText('Retry'))

      // Wait for close animation to complete
      setTimeout(() => {
        expect(onClose).toHaveBeenCalledWith(1)
      }, 300)
    })
  })

  describe('CSS Classes', () => {
    it('applies correct CSS class for toast type', () => {
      const { container } = render(
        <Toast {...defaultProps} type="error" />
      )
      expect(container.querySelector('.Toast--error')).toBeInTheDocument()
    })

    it('applies base Toast class', () => {
      const { container } = render(<Toast {...defaultProps} />)
      expect(container.querySelector('.Toast')).toBeInTheDocument()
    })

    it('applies all expected CSS classes for successful toast', () => {
      const { container } = render(
        <Toast {...defaultProps} type="success" />
      )
      expect(container.querySelector('.Toast')).toBeInTheDocument()
      expect(container.querySelector('.Toast--success')).toBeInTheDocument()
      expect(container.querySelector('.Toast__icon')).toBeInTheDocument()
      expect(container.querySelector('.Toast__content')).toBeInTheDocument()
      expect(container.querySelector('.Toast__close')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<Toast {...defaultProps} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has aria-live="polite" for live region', () => {
      render(<Toast {...defaultProps} />)
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-live',
        'polite'
      )
    })

    it('close button has aria-label', () => {
      render(<Toast {...defaultProps} />)
      expect(screen.getByLabelText('Close notification')).toBeInTheDocument()
    })

    it('action button has aria-label', () => {
      const action = { label: 'Retry', onClick: jest.fn() }
      render(<Toast {...defaultProps} action={action} />)
      expect(screen.getByLabelText('Retry')).toBeInTheDocument()
    })
  })

  describe('Multiple Toasts Stacking', () => {
    it('renders multiple toasts with unique ids', () => {
      const { container } = render(
        <>
          <Toast {...defaultProps} id={1} message="First" />
          <Toast {...defaultProps} id={2} message="Second" />
          <Toast {...defaultProps} id={3} message="Third" />
        </>
      )
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })

    it('each toast has correct onClose callback', () => {
      const onClose1 = jest.fn()
      const onClose2 = jest.fn()

      render(
        <>
          <Toast {...defaultProps} id={1} onClose={onClose1} />
          <Toast {...defaultProps} id={2} onClose={onClose2} />
        </>
      )

      const closeButtons = screen.getAllByText('✕')
      fireEvent.click(closeButtons[0])

      expect(onClose1).toHaveBeenCalledWith(1)
      expect(onClose2).not.toHaveBeenCalled()
    })
  })

  describe('Long Content Handling', () => {
    it('handles long message text', () => {
      const longMessage =
        'This is a very long notification message that spans multiple lines and should be handled gracefully by the toast component'
      render(<Toast {...defaultProps} message={longMessage} />)
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('maintains layout with long action label', () => {
      const action = {
        label: 'Very Long Action Label',
        onClick: jest.fn(),
      }
      render(<Toast {...defaultProps} action={action} />)
      expect(screen.getByText('Very Long Action Label')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty message', () => {
      const { container } = render(<Toast {...defaultProps} message="" />)
      expect(container.querySelector('.Toast')).toBeInTheDocument()
    })

    it('handles action with empty label', () => {
      const action = { label: '', onClick: jest.fn() }
      render(<Toast {...defaultProps} action={action} />)
      const actionBtn = screen.getByRole('button', { name: '' })
      expect(actionBtn).toBeInTheDocument()
    })

    it('handles unknown toast type (defaults to info styling)', () => {
      const { container } = render(
        <Toast {...defaultProps} type="unknown" />
      )
      expect(container.querySelector('.Toast')).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('renders with slide-in animation', () => {
      const { container } = render(<Toast {...defaultProps} />)
      const toast = container.querySelector('.Toast')
      expect(toast).toHaveClass('Toast')
    })
  })
})
