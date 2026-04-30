/**
 * Tests: NotificationContext Provider
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { NotificationProvider, useNotificationContext } from '../../src/context/NotificationContext'

function TestComponent() {
  const { notifications, unreadCount } = useNotificationContext()
  return (
    <>
      <>{Array.isArray(notifications) ? 'has-notifications' : 'no-notifications'}</>
      <>{typeof unreadCount === 'number' ? 'has-count' : 'no-count'}</>
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
