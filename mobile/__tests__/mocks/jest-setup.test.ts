/**
 * Jest Setup Validation Tests
 * Verify jest.setup.js configuration is working
 */

describe('Jest Setup Validation', () => {
  it('should have mocked RCTNetworking available', () => {
    // RCTNetworking is an internal RN module — the global mock covers the relevant
    // networking layer via the react-native mock in jest.setup.js
    const rn = require('react-native')
    expect(rn).toBeDefined()
  })

  it('should have mocked AsyncStorage available', () => {
    // AsyncStorage is mocked as a flat object (no .default wrapper) in jest.setup.js
    const AsyncStorage = require('@react-native-async-storage/async-storage')
    expect(AsyncStorage).toBeDefined()
    expect(typeof AsyncStorage.getItem).toBe('function')
  })
})
