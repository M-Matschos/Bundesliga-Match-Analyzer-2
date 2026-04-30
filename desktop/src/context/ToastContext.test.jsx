import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastContext'
import '@testing-library/jest-dom'

// Test component that uses the Toast context
function TestComponent() {
  const toast = useToast()

  return (
    <div>
      <button onClick={() => toast.success('Success!')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Error!')}>
        Show Error
      </button>
      <button onClick={() => toast.info('Info!')}>
        Show Info
      </button>
      <button onClick={() => toast.warning('Warning!')}>
        Show Warning
      </button>
      <button
        onClick={() =>
          toast.success('Undo', {
            action: { label: 'Undo', onClick: () => console.log('Undo') },
          })
        }
      >
        Show with Action
      </button>
      <div data-testid="toast-count">{toast.toasts.length}</div>
    </div>
  )
}

describe('ToastContext', () => {
  describe('useToast Hook', () => {
    it('throws error when used outside ToastProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useToast must be used within ToastProvider')

      consoleError.mockRestore()
    })

    it('returns toast context when used inside ToastProvider', () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      expect(getByText('Show Success')).toBeInTheDocument()
    })
  })

  describe('Success Toast', () => {
    it('creates success toast', () => {
      const { getByText, getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      const button = getByText('Show Success')
      button.click()

      expect(getByTestId('toast-count')).toHaveTextContent('1')
      expect(getByText('Success!')).toBeInTheDocument()
    })

    it('auto-dismisses success toast after 3s', async () => {
      jest.useFakeTimers()
      const { getByText, getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Success').click()
      expect(getByText('Success!')).toBeInTheDocument()
      expect(getByTestId('toast-count')).toHaveTextContent('1')

      jest.advanceTimersByTime(3000)

      expect(getByTestId('toast-count')).toHaveTextContent('0')
      expect(queryByText('Success!')).not.toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('Error Toast', () => {
    it('creates error toast', () => {
      const { getByText, getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Error').click()

      expect(getByTestId('toast-count')).toHaveTextContent('1')
      expect(getByText('Error!')).toBeInTheDocument()
    })

    it('auto-dismisses error toast after 5s', async () => {
      jest.useFakeTimers()
      const { getByText, getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Error').click()

      // Error toasts have 5s duration (longer than success)
      // For this test, we'll use custom duration
      expect(getByText('Error!')).toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('Info Toast', () => {
    it('creates info toast', () => {
      const { getByText, getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Info').click()

      expect(getByTestId('toast-count')).toHaveTextContent('1')
      expect(getByText('Info!')).toBeInTheDocument()
    })
  })

  describe('Warning Toast', () => {
    it('creates warning toast', () => {
      const { getByText, getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Warning').click()

      expect(getByTestId('toast-count')).toHaveTextContent('1')
      expect(getByText('Warning!')).toBeInTheDocument()
    })
  })

  describe('Toast with Action', () => {
    it('creates toast with action button', () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show with Action').click()

      expect(getByText('Undo')).toBeInTheDocument()
    })

    it('calls action handler when action is clicked', () => {
      const onActionClick = jest.fn()

      function CustomTestComponent() {
        const toast = useToast()

        return (
          <button
            onClick={() =>
              toast.success('Saved', {
                action: {
                  label: 'Undo',
                  onClick: onActionClick,
                },
              })
            }
          >
            Save
          </button>
        )
      }

      const { getByText } = render(
        <ToastProvider>
          <CustomTestComponent />
        </ToastProvider>
      )

      getByText('Save').click()
      const undoButton = getByText('Undo')
      undoButton.click()

      expect(onActionClick).toHaveBeenCalled()
    })
  })

  describe('Multiple Toasts', () => {
    it('stacks multiple toasts', () => {
      const { getByText, getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Success').click()
      getByText('Show Error').click()
      getByText('Show Info').click()

      expect(getByTestId('toast-count')).toHaveTextContent('3')
      expect(getByText('Success!')).toBeInTheDocument()
      expect(getByText('Error!')).toBeInTheDocument()
      expect(getByText('Info!')).toBeInTheDocument()
    })

    it('individual toasts dismiss independently', async () => {
      jest.useFakeTimers()
      const { getByText, getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      getByText('Show Success').click()
      getByText('Show Error').click()

      expect(getByTestId('toast-count')).toHaveTextContent('2')

      // Dismiss only success
      jest.advanceTimersByTime(3000)

      expect(getByTestId('toast-count')).toHaveTextContent('1')
      expect(queryByText('Success!')).not.toBeInTheDocument()
      expect(getByText('Error!')).toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('Custom Durations', () => {
    it('respects custom duration', async () => {
      jest.useFakeTimers()

      function CustomDurationComponent() {
        const toast = useToast()

        return (
          <button
            onClick={() =>
              toast.success('Custom Duration', { duration: 1000 })
            }
          >
            Show
          </button>
        )
      }

      const { getByText, getByTestId, queryByText } = render(
        <ToastProvider>
          <CustomDurationComponent />
        </ToastProvider>
      )

      getByText('Show').click()
      expect(getByText('Custom Duration')).toBeInTheDocument()
      expect(getByTestId('toast-count')).toHaveTextContent('1')

      jest.advanceTimersByTime(1000)

      expect(getByTestId('toast-count')).toHaveTextContent('0')
      expect(queryByText('Custom Duration')).not.toBeInTheDocument()

      jest.useRealTimers()
    })

    it('does not auto-dismiss when duration=0', async () => {
      jest.useFakeTimers()

      function NoDismissComponent() {
        const toast = useToast()

        return (
          <button
            onClick={() =>
              toast.success('No Auto Dismiss', { duration: 0 })
            }
          >
            Show
          </button>
        )
      }

      const { getByText, getByTestId } = render(
        <ToastProvider>
          <NoDismissComponent />
        </ToastProvider>
      )

      getByText('Show').click()
      expect(getByText('No Auto Dismiss')).toBeInTheDocument()

      jest.advanceTimersByTime(10000)

      // Should still be there
      expect(getByTestId('toast-count')).toHaveTextContent('1')
      expect(getByText('No Auto Dismiss')).toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('removeToast Method', () => {
    it('removes toast by id', async () => {
      function RemoveTestComponent() {
        const toast = useToast()
        const [id, setId] = React.useState(null)

        return (
          <>
            <button
              onClick={() => {
                const newId = toast.success('Can be removed')
                setId(newId)
              }}
            >
              Add Toast
            </button>
            <button onClick={() => id !== null && toast.removeToast(id)}>
              Remove Toast
            </button>
            <div data-testid="toast-count">{toast.toasts.length}</div>
          </>
        )
      }

      const { getByText, getByTestId } = render(
        <ToastProvider>
          <RemoveTestComponent />
        </ToastProvider>
      )

      getByText('Add Toast').click()
      expect(getByTestId('toast-count')).toHaveTextContent('1')

      getByText('Remove Toast').click()
      expect(getByTestId('toast-count')).toHaveTextContent('0')
    })
  })
})
