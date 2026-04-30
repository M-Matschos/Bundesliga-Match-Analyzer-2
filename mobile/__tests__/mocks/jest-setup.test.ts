/**
 * Jest Setup Validation Tests
 * Verify jest.setup.js configuration is working
 */

describe('Jest Setup Validation', () => {
  it('should have mocked RCTNetworking available', () => {
    const RCTNetworking = require('react-native').RCTNetworking
    expect(RCTNetworking).toBeDefined()
  })

  it('should have mocked AsyncStorage available', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    expect(AsyncStorage).toBeDefined()
    expect(typeof AsyncStorage.getItem).toBe('function')
  })
})
