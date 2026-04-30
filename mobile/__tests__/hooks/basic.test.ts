/**
 * Basic Hook Import Tests
 * Verify all hooks export correctly and are callable
 */

describe('Hook Exports', () => {
  it('should export useAuth hook', () => {
    const useAuth = require('../../src/hooks/useAuth').useAuth
    expect(typeof useAuth).toBe('function')
  })

  it('should export useNotifications hook', () => {
    const useNotifications = require('../../src/hooks/useNotifications').useNotifications
    expect(typeof useNotifications).toBe('function')
  })

  it('should export useRegisterDevice hook', () => {
    const useRegisterDevice = require('../../src/hooks/useRegisterDevice').useRegisterDevice
    expect(typeof useRegisterDevice).toBe('function')
  })

  it('should export useWebSocket hook', () => {
    const useWebSocket = require('../../src/hooks/useWebSocket').useWebSocket
    expect(typeof useWebSocket).toBe('function')
  })

  it('should export useWeekendCache hook', () => {
    const useWeekendCache = require('../../src/hooks/useWeekendCache').useWeekendCache
    expect(typeof useWeekendCache).toBe('function')
  })

  it('should export from hooks barrel index', () => {
    const hooksIndex = require('../../src/hooks/index')
    expect(hooksIndex.useAuth).toBeDefined()
    expect(hooksIndex.useNotifications).toBeDefined()
  })

  it('should export theme barrel index', () => {
    const themeIndex = require('../../src/theme/index')
    expect(themeIndex.colors).toBeDefined()
    expect(themeIndex.SPACING).toBeDefined()
  })
})
