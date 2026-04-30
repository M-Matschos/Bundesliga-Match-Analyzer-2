/**
 * Array Utilities Tests
 * Common array manipulation patterns
 */

describe('Array Utilities', () => {
  it('should filter array items', () => {
    const items = [1, 2, 3, 4, 5]
    const filtered = items.filter((n) => n > 2)
    expect(filtered.length).toBe(3)
  })

  it('should map array items', () => {
    const items = [1, 2, 3]
    const doubled = items.map((n) => n * 2)
    expect(doubled[0]).toBe(2)
    expect(doubled[2]).toBe(6)
  })

  it('should find item in array', () => {
    const items = ['apple', 'banana', 'cherry']
    const found = items.find((item) => item === 'banana')
    expect(found).toBe('banana')
  })

  it('should check array includes item', () => {
    const items = [1, 2, 3, 4, 5]
    expect(items.includes(3)).toBe(true)
    expect(items.includes(6)).toBe(false)
  })

  it('should sort array items', () => {
    const items = [3, 1, 2]
    const sorted = items.sort((a, b) => a - b)
    expect(sorted[0]).toBe(1)
    expect(sorted[2]).toBe(3)
  })
})
