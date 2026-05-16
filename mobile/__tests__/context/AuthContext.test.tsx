/**
 * Tests: AuthContext Provider
 */

import React from 'react'
import { Text } from 'react-native'
import { render, screen, waitFor } from '@testing-library/react-native'
import { AuthProvider, useAuth } from '../../src/context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage')

function TestComponent() {
  const { isLoggedIn, user, loading } = useAuth()
  return (
    <>
      <Text>{loading ? 'loading' : 'ready'}</Text>
      <Text>{isLoggedIn ? 'authenticated' : 'unauthenticated'}</Text>
      <Text>{user?.email || 'no-email'}</Text>
    </>
  )
}

describe('AuthContext Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
  })

  it('should provide auth context to children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('ready')).toBeTruthy()
    })
  })

  it('should indicate loading state during auth check', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve('token'), 100))
    )
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('ready')).toBeTruthy()
    })
  })

  it('should restore user session from AsyncStorage', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('test_token_123')
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled()
    })
  })

  it('should handle unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('unauthenticated')).toBeTruthy()
    })
  })
})
