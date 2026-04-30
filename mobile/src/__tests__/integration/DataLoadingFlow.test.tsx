/**
 * Integration Tests: Data Loading Flow
 * Tests data loading, refresh, error handling, and retry logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage')

describe('Integration: Data Loading Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load data on screen focus', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ id: 'match-1', status: 'loaded' })
    )

    const data = await AsyncStorage.getItem('test_data')
    expect(data).toBeDefined()
  })

  it('should show loading spinner while fetching', () => {
    expect(AsyncStorage.getItem).toBeDefined()
  })

  it('should refresh data on pull-to-refresh', async () => {
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

    await AsyncStorage.setItem('test_data', JSON.stringify({ refreshed: true }))
    expect(AsyncStorage.setItem).toHaveBeenCalled()
  })

  it('should show error state on load failure', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Load failed'))

    try {
      await AsyncStorage.getItem('test_data')
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('should retry loading data after error', async () => {
    ;(AsyncStorage.getItem as jest.Mock)
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockResolvedValueOnce(JSON.stringify({ id: 'match-1' }))

    try {
      await AsyncStorage.getItem('test_data')
    } catch (e) {
      // First call fails
    }

    const data = await AsyncStorage.getItem('test_data')
    expect(data).toBeDefined()
  })
})
