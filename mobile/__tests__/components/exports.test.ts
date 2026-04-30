/**
 * Components Export Validation Tests
 * Verify all components are properly exported and callable
 */

describe('Component Exports', () => {
  it('should export FormInputGroup component', () => {
    const FormInputGroup = require('../../src/components/FormInputGroup').default
    expect(typeof FormInputGroup).toBe('function')
  })

  it('should export Modal component', () => {
    const Modal = require('../../src/components/Modal').default
    expect(typeof Modal).toBe('function')
  })

  it('should export MatchPredictionCard component', () => {
    const MatchPredictionCard = require('../../src/components/MatchPredictionCard').default
    expect(typeof MatchPredictionCard).toBe('function')
  })

  it('should export AccuracyCard component', () => {
    const AccuracyCard = require('../../src/components/AccuracyCard').default
    expect(typeof AccuracyCard).toBe('function')
  })

  it('should export KellyStakingCalculator component', () => {
    const KellyStakingCalculator = require('../../src/components/KellyStakingCalculator').default
    expect(typeof KellyStakingCalculator).toBe('function')
  })

  it('should export SummaryBar component', () => {
    const SummaryBar = require('../../src/components/SummaryBar').default
    expect(typeof SummaryBar).toBe('function')
  })

  it('should export Toast component', () => {
    const Toast = require('../../src/components/Toast').default
    expect(typeof Toast).toBe('function')
  })

  it('should export Table component', () => {
    const Table = require('../../src/components/Table').default
    expect(typeof Table).toBe('function')
  })

  it('should export NotificationToast component', () => {
    const NotificationToast = require('../../src/components/NotificationToast').default
    expect(typeof NotificationToast).toBe('function')
  })

  it('should export Spinner component', () => {
    const Spinner = require('../../src/components/Spinner').default
    expect(typeof Spinner).toBe('function')
  })
})
