/**
 * Screens Export Validation Tests
 * Verify all screens are properly exported and callable
 */

describe('Screen Exports', () => {
  it('should export DashboardScreen', () => {
    const DashboardScreen = require('../../src/screens/DashboardScreen').default
    expect(typeof DashboardScreen).toBe('function')
  })

  it('should export NotificationHistoryScreen', () => {
    const NotificationHistoryScreen = require('../../src/screens/NotificationHistoryScreen').default
    expect(typeof NotificationHistoryScreen).toBe('function')
  })

  it('should export MatchDetailsScreen', () => {
    const MatchDetailsScreen = require('../../src/screens/MatchDetailsScreen').default
    expect(typeof MatchDetailsScreen).toBe('function')
  })

  it('should export TeamDetailsScreen', () => {
    const TeamDetailsScreen = require('../../src/screens/TeamDetailsScreen').default
    expect(typeof TeamDetailsScreen).toBe('function')
  })

  it('should export PlayerDetailsScreen', () => {
    const PlayerDetailsScreen = require('../../src/screens/PlayerDetailsScreen').default
    expect(typeof PlayerDetailsScreen).toBe('function')
  })

  it('should export AlertsScreen', () => {
    const AlertsScreen = require('../../src/screens/AlertsScreen').default
    expect(typeof AlertsScreen).toBe('function')
  })

  it('should export MetricsScreen', () => {
    const MetricsScreen = require('../../src/screens/MetricsScreen').default
    expect(typeof MetricsScreen).toBe('function')
  })

  it('should export ProfileScreen', () => {
    const ProfileScreen = require('../../src/screens/ProfileScreen').default
    expect(typeof ProfileScreen).toBe('function')
  })

  it('should export VirtualBettingScreen', () => {
    const VirtualBettingScreen = require('../../src/screens/VirtualBettingScreen').default
    expect(typeof VirtualBettingScreen).toBe('function')
  })

  it('should export LoginScreen from auth folder', () => {
    const LoginScreen = require('../../src/screens/auth/LoginScreen').default
    expect(typeof LoginScreen).toBe('function')
  })

  it('should export RegisterScreen from auth folder', () => {
    const RegisterScreen = require('../../src/screens/auth/RegisterScreen').default
    expect(typeof RegisterScreen).toBe('function')
  })
})
