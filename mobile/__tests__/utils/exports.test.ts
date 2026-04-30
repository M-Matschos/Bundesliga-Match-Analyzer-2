/**
 * Utils Export Validation Tests
 * Verify all utility functions are properly exported and callable
 */

describe('Formatter Exports', () => {
  it('should export formatDate from formatters', () => {
    const formatDate = require('../../src/utils/formatters').formatDate
    expect(typeof formatDate).toBe('function')
  })

  it('should export formatTime from formatters', () => {
    const formatTime = require('../../src/utils/formatters').formatTime
    expect(typeof formatTime).toBe('function')
  })

  it('should export formatDateTime from formatters', () => {
    const formatDateTime = require('../../src/utils/formatters').formatDateTime
    expect(typeof formatDateTime).toBe('function')
  })
})

describe('Validator Exports', () => {
  it('should export validateEmail from validators', () => {
    const validateEmail = require('../../src/utils/validators').validateEmail
    expect(typeof validateEmail).toBe('function')
  })

  it('should export validatePassword from validators', () => {
    const validatePassword = require('../../src/utils/validators').validatePassword
    expect(typeof validatePassword).toBe('function')
  })

  it('should export validateBetAmount from validators', () => {
    const validateBetAmount = require('../../src/utils/validators').validateBetAmount
    expect(typeof validateBetAmount).toBe('function')
  })

  it('should export validateOdds from validators', () => {
    const validateOdds = require('../../src/utils/validators').validateOdds
    expect(typeof validateOdds).toBe('function')
  })

  it('should export validateUsername from validators', () => {
    const validateUsername = require('../../src/utils/validators').validateUsername
    expect(typeof validateUsername).toBe('function')
  })

  it('should export validateRequired from validators', () => {
    const validateRequired = require('../../src/utils/validators').validateRequired
    expect(typeof validateRequired).toBe('function')
  })
})
