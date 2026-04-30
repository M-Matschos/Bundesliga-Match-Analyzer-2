/**
 * Object Utilities Tests
 * Common object manipulation patterns
 */

describe('Object Utilities', () => {
  it('should get object keys', () => {
    const obj = { name: 'John', age: 30 }
    const keys = Object.keys(obj)
    expect(keys.length).toBe(2)
    expect(keys).toContain('name')
  })

  it('should get object values', () => {
    const obj = { name: 'John', age: 30 }
    const values = Object.values(obj)
    expect(values.length).toBe(2)
    expect(values).toContain('John')
  })

  it('should merge objects', () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const merged = { ...obj1, ...obj2 }
    expect(merged.a).toBe(1)
    expect(merged.b).toBe(2)
  })

  it('should check object property exists', () => {
    const obj = { name: 'John' }
    expect('name' in obj).toBe(true)
    expect('age' in obj).toBe(false)
  })
})
