/**
 * Validation Utilities
 *
 * Shared validation functions for form inputs across the mobile app
 */

/**
 * Validate email format using regex pattern
 * 
 * @param email - Email string to validate
 * @returns true if email format is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password minimum requirements
 * 
 * Requirements:
 * - Minimum 6 characters
 * - Can contain letters, numbers, and special characters
 *
 * @param password - Password string to validate
 * @returns true if password meets minimum requirements
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6
}

/**
 * Validate bet amount (positive number, max 2 decimal places)
 * 
 * @param amount - Amount string to validate
 * @returns true if amount is valid for betting
 */
export function validateBetAmount(amount: string): boolean {
  const numAmount = parseFloat(amount)
  return !isNaN(numAmount) && numAmount > 0 && /^\d+(\.\d{1,2})?$/.test(amount)
}

/**
 * Validate odds format (decimal, minimum 1.01)
 * 
 * @param odds - Odds string to validate
 * @returns true if odds are valid
 */
export function validateOdds(odds: string): boolean {
  const numOdds = parseFloat(odds)
  return !isNaN(numOdds) && numOdds >= 1.01
}

/**
 * Validate username format
 * 
 * Requirements:
 * - Minimum 3 characters
 * - Maximum 20 characters
 * - Only letters, numbers, and underscores
 * - Must start with a letter
 *
 * @param username - Username string to validate
 * @returns true if username format is valid
 */
export function validateUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 20) {
    return false
  }
  // Must start with letter, can contain letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return usernameRegex.test(username)
}

/**
 * Validate form field is not empty
 * 
 * @param value - Value to check
 * @returns true if value is not empty
 */
export function validateRequired(value: string): boolean {
  return value && value.trim().length > 0
}
