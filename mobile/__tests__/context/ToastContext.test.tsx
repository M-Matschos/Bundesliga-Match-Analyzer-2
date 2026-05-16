/**
 * Tests: ToastContext Provider
 */

import React from 'react'
import { Text } from 'react-native'
import { render, waitFor } from '@testing-library/react-native'
import { ToastProvider, useToast } from '../../src/context/ToastContext'

function TestComponent() {
  const { success, error, info } = useToast()
  return (
    <>
      <Text>{typeof success === 'function' ? 'has-success' : 'no-success'}</Text>
      <Text>{typeof error === 'function' ? 'has-error' : 'no-error'}</Text>
      <Text>{typeof info === 'function' ? 'has-info' : 'no-info'}</Text>
    </>
  )
}

describe('ToastContext Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide toast functions to children', () => {
    const { getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    expect(getByText('has-success')).toBeTruthy()
    expect(getByText('has-error')).toBeTruthy()
    expect(getByText('has-info')).toBeTruthy()
  })

  it('should handle success toast call', async () => {
    const { getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    await waitFor(() => {
      expect(getByText('has-success')).toBeTruthy()
    })
  })

  it('should handle error toast call', async () => {
    const { getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    await waitFor(() => {
      expect(getByText('has-error')).toBeTruthy()
    })
  })
})
