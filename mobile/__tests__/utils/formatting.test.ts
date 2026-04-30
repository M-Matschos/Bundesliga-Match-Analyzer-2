/**
 * Formatting Utilities Tests
 * Common data formatting patterns
 */

describe('Date Formatting', () => {
  it('should format date to ISO string', () => {
    const date = new Date('2024-04-29')
    const iso = date.toISOString()
    expect(typeof iso).toBe('string')
    expect(iso.length).toBeGreaterThan(0)
  })

  it('should extract year from date', () => {
    const date = new Date('2024-04-29')
    const year = date.getFullYear()
    expect(year).toBe(2024)
  })

  it('should extract month from date', () => {
    const date = new Date('2024-04-29')
    const month = date.getMonth()
    expect(month).toBe(3)
  })

  it('should extract day from date', () => {
    const date = new Date('2024-04-29')
    const day = date.getDate()
    expect(day).toBe(29)
  })

  it('should format currency values', () => {
    const amount = 100.50
    const formatted = amount.toFixed(2)
    expect(formatted).toBe('100.50')
  })

  it('should truncate long strings', () => {
    const text = 'This is a very long text that needs truncating'
    const truncated = text.substring(0, 20)
    expect(truncated.length).toBeLessThanOrEqual(20)
  })
})
