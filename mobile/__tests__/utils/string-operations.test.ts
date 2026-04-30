/**
 * String Operations Tests
 * Verify string manipulation
 */

describe('String Operations', () => {
  it('should concatenate strings', () => {
    const str1 = 'Hello'
    const str2 = 'World'
    const result = str1 + ' ' + str2
    expect(result).toBe('Hello World')
  })

  it('should get string length', () => {
    const str = 'Test'
    expect(str.length).toBe(4)
  })

  it('should convert to uppercase', () => {
    const str = 'hello'
    expect(str.toUpperCase()).toBe('HELLO')
  })

  it('should convert to lowercase', () => {
    const str = 'HELLO'
    expect(str.toLowerCase()).toBe('hello')
  })

  it('should trim whitespace', () => {
    const str = '  hello  '
    expect(str.trim()).toBe('hello')
  })

  it('should check if string includes substring', () => {
    const str = 'hello world'
    expect(str.includes('world')).toBe(true)
  })

  it('should replace substring', () => {
    const str = 'hello world'
    expect(str.replace('world', 'there')).toBe('hello there')
  })

  it('should get character at index', () => {
    const str = 'hello'
    expect(str.charAt(0)).toBe('h')
  })

  it('should split string into array', () => {
    const str = 'a,b,c'
    expect(str.split(',')).toEqual(['a', 'b', 'c'])
  })

  it('should get substring', () => {
    const str = 'hello'
    expect(str.substring(0, 3)).toBe('hel')
  })
})
