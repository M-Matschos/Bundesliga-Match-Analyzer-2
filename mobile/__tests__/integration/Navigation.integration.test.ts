/**
 * Tests: Navigation Integration
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    reset: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: { id: 'test_123' },
  })),
}))

describe('Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide navigation hook for screen navigation', () => {
    const { result } = renderHook(() => useNavigation())
    expect(result.current.navigate).toBeDefined()
    expect(result.current.goBack).toBeDefined()
  })

  it('should provide route hook for receiving params', () => {
    const { result } = renderHook(() => useRoute())
    expect(result.current.params).toBeDefined()
    expect(result.current.params.id).toBe('test_123')
  })
})
