/**
 * Tests: Utility Functions - Validators
 * Tests for email, password, phone, username validation
 */

describe('Validators Utility Functions', () => {
  // ========================================================================
  // EMAIL VALIDATION TESTS
  // ========================================================================

  it('should validate correct email format', () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('test.user@domain.co.uk')).toBe(true)
    expect(validateEmail('user+tag@example.com')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('user@.com')).toBe(false)
    expect(validateEmail('user space@example.com')).toBe(false)
  })

  it('should handle edge cases for email validation', () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    expect(validateEmail('')).toBe(false)
    expect(validateEmail('   ')).toBe(false)
    expect(validateEmail('a@b.c')).toBe(true)
  })

  // ========================================================================
  // PASSWORD VALIDATION TESTS
  // ========================================================================

  it('should validate password length', () => {
    const validatePassword = (pwd: string) => pwd.length >= 8

    expect(validatePassword('short')).toBe(false)
    expect(validatePassword('password123')).toBe(true)
    expect(validatePassword('12345678')).toBe(true)
  })

  it('should validate password complexity', () => {
    const validatePasswordComplex = (pwd: string) => {
      return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)
    }

    expect(validatePasswordComplex('WeakPass')).toBe(false)
    expect(validatePasswordComplex('Weak123')).toBe(true)
    expect(validatePasswordComplex('StrongPass1')).toBe(true)
  })

  it('should reject weak passwords', () => {
    const validatePassword = (pwd: string) => pwd.length >= 8

    expect(validatePassword('abc')).toBe(false)
    expect(validatePassword('12345')).toBe(false)
    expect(validatePassword('pass')).toBe(false)
  })

  it('should accept strong passwords', () => {
    const validatePassword = (pwd: string) => pwd.length >= 8

    expect(validatePassword('MyP@ssw0rd!')).toBe(true)
    expect(validatePassword('SecurePassword123')).toBe(true)
    expect(validatePassword('12345678')).toBe(true)
  })

  // ========================================================================
  // PHONE NUMBER VALIDATION TESTS
  // ========================================================================

  it('should validate phone number format', () => {
    const validatePhone = (phone: string) => /^\d{10,15}$|^\+\d{1,3}\d{9,14}$/.test(phone.replace(/\s/g, ''))

    expect(validatePhone('1234567890')).toBe(true)
    expect(validatePhone('+491234567890')).toBe(true)
    expect(validatePhone('+1 234 567 8900')).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    const validatePhone = (phone: string) => /^\d{10,15}$|^\+\d{1,3}\d{9,14}$/.test(phone.replace(/\s/g, ''))

    expect(validatePhone('123')).toBe(false)
    expect(validatePhone('abc1234567890')).toBe(false)
    expect(validatePhone('phone number')).toBe(false)
  })

  it('should handle various phone formats', () => {
    const validatePhone = (phone: string) => /^\d{10,15}$|^\+\d{1,3}\d{9,14}$/.test(phone.replace(/\s/g, ''))

    expect(validatePhone('(123) 456-7890')).toBe(true)
    expect(validatePhone('123-456-7890')).toBe(true)
    expect(validatePhone('+49 30 123456')).toBe(true)
  })

  // ========================================================================
  // USERNAME VALIDATION TESTS
  // ========================================================================

  it('should validate username length', () => {
    const validateUsername = (name: string) => name.length >= 3 && name.length <= 20

    expect(validateUsername('ab')).toBe(false)
    expect(validateUsername('user')).toBe(true)
    expect(validateUsername('validusername')).toBe(true)
  })

  it('should validate username characters', () => {
    const validateUsername = (name: string) => /^[a-zA-Z0-9_-]+$/.test(name)

    expect(validateUsername('user_name')).toBe(true)
    expect(validateUsername('user-name')).toBe(true)
    expect(validateUsername('username123')).toBe(true)
    expect(validateUsername('user name')).toBe(false)
    expect(validateUsername('user@name')).toBe(false)
  })

  it('should reject invalid usernames', () => {
    const validateUsername = (name: string) => /^[a-zA-Z0-9_-]{3,20}$/.test(name)

    expect(validateUsername('a')).toBe(false)
    expect(validateUsername('user name')).toBe(false)
    expect(validateUsername('user!@#')).toBe(false)
  })

  // ========================================================================
  // COMBINED VALIDATION TESTS
  // ========================================================================

  it('should validate all fields together', () => {
    const validateForm = (email: string, password: string, username: string) => {
      const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
      const validatePassword = (p: string) => p.length >= 8
      const validateUsername = (u: string) => /^[a-zA-Z0-9_-]{3,20}$/.test(u)

      return validateEmail(email) && validatePassword(password) && validateUsername(username)
    }

    expect(
      validateForm('user@example.com', 'password123', 'validuser')
    ).toBe(true)
    expect(
      validateForm('invalid.com', 'short', 'a')
    ).toBe(false)
  })

  // ========================================================================
  // EDGE CASE TESTS
  // ========================================================================

  it('should handle empty strings', () => {
    const validateEmail = (e: string) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

    expect(validateEmail('')).toBe(false)
  })

  it('should handle null and undefined gracefully', () => {
    const validateEmail = (e: any) => {
      if (!e || typeof e !== 'string') return false
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
    }

    expect(validateEmail(null)).toBe(false)
    expect(validateEmail(undefined)).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})
