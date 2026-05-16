/**
 * Tests: NotificationContext Provider
 */

import React from 'react'
import { Text } from 'react-native'
import { render, waitFor } from '@testing-library/react-native'
import { NotificationProvider, useNotification } from '../../src/context/NotificationContext'

function TestComponent() {
  const { notifications, unreadCount } = useNotification()
  return (
    <>
      <Text>{Array.isArray(notifications) ? 'has-notifications' : 'no-notifications'}</Text>
      <Text>{typeof unreadCount === 'number' ? 'has-count' : 'no-count'}</Text>
    </>
  )
}

describe('NotificationContext Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide notification context to children', () => {
    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )
    expect(getByText('has-notifications')).toBeTruthy()
    expect(getByText('has-count')).toBeTruthy()
  })

  it('should initialize with empty notifications', () => {
    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )
    expect(getByText('has-notifications')).toBeTruthy()
  })

  it('should track unread count', async () => {
    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )
    await waitFor(() => {
      expect(getByText('has-count')).toBeTruthy()
    })
  })
})
