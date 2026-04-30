import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Modal from './Modal'
import '@testing-library/jest-dom'

describe('Modal Component (Desktop)', () => {
  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      const { container } = render(
        <Modal isOpen={false} title="Test Modal">
          Content
        </Modal>
      )
      expect(container.querySelector('.Modal__overlay')).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
      const { container } = render(
        <Modal isOpen={true} title="Test Modal">
          Content
        </Modal>
      )
      expect(container.querySelector('.Modal__overlay')).toBeInTheDocument()
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} title="Delete Prediction">
          Are you sure?
        </Modal>
      )
      expect(screen.getByText('Delete Prediction')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Modal isOpen={true}>
          <p>Custom modal content</p>
        </Modal>
      )
      expect(screen.getByText('Custom modal content')).toBeInTheDocument()
    })

    it('renders footer buttons by default', () => {
      render(
        <Modal isOpen={true} onConfirm={() => {}}>
          Content
        </Modal>
      )
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('renders custom footer when provided', () => {
      const customFooter = <button>Custom Action</button>
      render(
        <Modal isOpen={true} footer={customFooter}>
          Content
        </Modal>
      )
      expect(screen.getByText('Custom Action')).toBeInTheDocument()
    })

    it('hides footer when footer={false}', () => {
      render(
        <Modal isOpen={true} footer={false}>
          Content
        </Modal>
      )
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
      expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={onClose} onConfirm={() => {}}>
          Content
        </Modal>
      )
      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onConfirm when Confirm button is clicked', () => {
      const onConfirm = jest.fn()
      render(
        <Modal isOpen={true} onConfirm={onConfirm}>
          Content
        </Modal>
      )
      fireEvent.click(screen.getByText('Confirm'))
      expect(onConfirm).toHaveBeenCalled()
    })

    it('calls onClose when close button (✕) is clicked', () => {
      const onClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={onClose} title="Modal">
          Content
        </Modal>
      )
      fireEvent.click(screen.getByLabelText('Close modal'))
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when overlay is clicked and closeOnOverlay=true', () => {
      const onClose = jest.fn()
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} closeOnOverlay={true}>
          Content
        </Modal>
      )
      const overlay = container.querySelector('.Modal__overlay')
      fireEvent.click(overlay)
      expect(onClose).toHaveBeenCalled()
    })

    it('does not close when overlay is clicked and closeOnOverlay=false', () => {
      const onClose = jest.fn()
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} closeOnOverlay={false}>
          Content
        </Modal>
      )
      const overlay = container.querySelector('.Modal__overlay')
      fireEvent.click(overlay)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Handling', () => {
    it('closes modal when Escape key is pressed', () => {
      const onClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={onClose} closeOnEscape={true}>
          Content
        </Modal>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })

    it('does not close when Escape key is pressed and closeOnEscape=false', () => {
      const onClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
          Content
        </Modal>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Size Variants', () => {
    it('applies sm size class', () => {
      const { container } = render(
        <Modal isOpen={true} size="sm">
          Content
        </Modal>
      )
      expect(container.querySelector('.Modal--sm')).toBeInTheDocument()
    })

    it('applies md size class (default)', () => {
      const { container } = render(
        <Modal isOpen={true}>
          Content
        </Modal>
      )
      expect(container.querySelector('.Modal--md')).toBeInTheDocument()
    })

    it('applies lg size class', () => {
      const { container } = render(
        <Modal isOpen={true} size="lg">
          Content
        </Modal>
      )
      expect(container.querySelector('.Modal--lg')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows spinner when loading=true', () => {
      render(
        <Modal isOpen={true} loading={true} onConfirm={() => {}}>
          Content
        </Modal>
      )
      expect(screen.getByText(/Processing/)).toBeInTheDocument()
      const spinner = document.querySelector('.Modal__spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('disables buttons when loading=true', () => {
      render(
        <Modal isOpen={true} loading={true} onConfirm={() => {}}>
          Content
        </Modal>
      )
      const cancelBtn = screen.getByText('Cancel')
      const confirmBtn = screen.getByText(/Processing/)
      expect(cancelBtn).toBeDisabled()
      expect(confirmBtn).toBeDisabled()
    })

    it('does not call onConfirm when loading=true', () => {
      const onConfirm = jest.fn()
      render(
        <Modal isOpen={true} loading={true} onConfirm={onConfirm}>
          Content
        </Modal>
      )
      fireEvent.click(screen.getByRole('button', { name: /Processing/ }))
      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Error State', () => {
    it('displays error message when error prop is provided', () => {
      const errorMsg = 'Failed to save changes'
      render(
        <Modal isOpen={true} error={errorMsg}>
          Content
        </Modal>
      )
      expect(screen.getByText(errorMsg)).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('does not show error when error is null', () => {
      render(
        <Modal isOpen={true} error={null}>
          Content
        </Modal>
      )
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument()
    })
  })

  describe('Custom Text', () => {
    it('uses custom confirmText', () => {
      render(
        <Modal
          isOpen={true}
          confirmText="Place Bet"
          onConfirm={() => {}}
        >
          Content
        </Modal>
      )
      expect(screen.getByText('Place Bet')).toBeInTheDocument()
    })

    it('uses custom cancelText', () => {
      render(
        <Modal
          isOpen={true}
          cancelText="Not Now"
          onConfirm={() => {}}
        >
          Content
        </Modal>
      )
      expect(screen.getByText('Not Now')).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('has focus trap with role="dialog"', () => {
      const { container } = render(
        <Modal isOpen={true}>
          Content
        </Modal>
      )
      const modal = container.querySelector('[role="dialog"]')
      expect(modal).toBeInTheDocument()
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('has proper aria-labelledby for title', () => {
      const { container } = render(
        <Modal isOpen={true} title="Test Modal">
          Content
        </Modal>
      )
      const modal = container.querySelector('[role="dialog"]')
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      const { container } = render(
        <Modal isOpen={true}>
        </Modal>
      )
      expect(container.querySelector('.Modal')).toBeInTheDocument()
    })

    it('handles very long content with scrolling', () => {
      const longContent = Array.from({ length: 100 }, (_, i) => (
        <p key={i}>Line {i + 1}</p>
      ))
      render(
        <Modal isOpen={true}>
          {longContent}
        </Modal>
      )
      const modal = document.querySelector('.Modal')
      expect(modal).toHaveStyle('max-height: 80vh')
      expect(modal).toHaveStyle('overflow-y: auto')
    })

    it('handles both onConfirm and custom footer', () => {
      const onConfirm = jest.fn()
      const customFooter = <button>Custom</button>
      render(
        <Modal isOpen={true} onConfirm={onConfirm} footer={customFooter}>
          Content
        </Modal>
      )
      // Should show custom footer, not default buttons
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { container } = render(
        <Modal isOpen={true} title="Confirm Action">
          Are you sure?
        </Modal>
      )
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
    })

    it('close button has aria-label', () => {
      render(
        <Modal isOpen={true} title="Modal">
          Content
        </Modal>
      )
      const closeBtn = screen.getByLabelText('Close modal')
      expect(closeBtn).toBeInTheDocument()
    })
  })
})
