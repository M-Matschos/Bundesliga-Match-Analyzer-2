/**
 * Security Configuration Module
 * Provides validation, sanitization, and security utilities
 *
 * Handles:
 * - Input validation (email, password, username, phone)
 * - String sanitization (XSS prevention)
 * - HTTPS & token security
 * - Error message sanitization
 * - JWT token manipulation
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  sessionTimeoutMs: number;
  tokenRefreshThresholdMs: number;
  maxStringLength: number;
}

// ============================================================================
// Security Constants
// ============================================================================

export const SECURITY_CONSTANTS: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000,          // 15 minutes
  sessionTimeoutMs: 30 * 60 * 1000,           // 30 minutes
  tokenRefreshThresholdMs: 5 * 60 * 1000,    // 5 minutes before expiry
  maxStringLength: 1000,
};

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validates email address format and length
 *
 * @param email - Email address to validate
 * @returns true if email is valid
 *
 * Pattern: basic RFC 5322 compliance
 * - Contains @ symbol
 * - Has domain with at least one dot
 * - Max 255 characters (RFC standard)
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Validates password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 digit (0-9)
 * - At least 1 special character (!@#$%^&*)
 *
 * @param password - Password to validate
 * @returns true if password meets all requirements
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return hasMinLength && hasUppercase && hasDigit && hasSpecialChar;
}

// ============================================================================
// Username Validation
// ============================================================================

/**
 * Validates username format
 *
 * Requirements:
 * - 3-20 characters
 * - Only alphanumeric characters and underscore
 * - Cannot start with underscore
 *
 * @param username - Username to validate
 * @returns true if username is valid
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }

  return /^[a-zA-Z0-9_]{3,20}$/.test(username) && !username.startsWith('_');
}

// ============================================================================
// Phone Number Validation
// ============================================================================

/**
 * Validates international phone number format
 *
 * Supports:
 * - E.164 format: +{country_code}{number}
 * - International: +49 123 456789
 * - Local: 123-456-7890, (123) 456-7890
 *
 * @param phone - Phone number to validate
 * @returns true if phone number appears valid
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // E.164 format or international variations
  const phoneRegex = /^(\+)?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

// ============================================================================
// String Sanitization (XSS Prevention)
// ============================================================================

/**
 * Sanitizes string to prevent XSS attacks
 *
 * Removes:
 * - HTML tags: < > "
 * - Script indicators
 * - Excess whitespace
 * - Truncates to max length
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>"'&]/g, '')  // Remove HTML dangerous characters
    .trim()
    .substring(0, SECURITY_CONSTANTS.maxStringLength);
}

/**
 * Sanitizes email for storage and comparison
 * - Lowercase
 * - Trim whitespace
 * - Basic XSS sanitization
 *
 * @param email - Email to sanitize
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return sanitizeString(email).toLowerCase();
}

/**
 * Escapes JSON special characters
 * Prevents JSON injection attacks
 *
 * @param input - String to escape
 * @returns Escaped string safe for JSON
 */
export function escapeJson(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\\/g, '\\\\')  // Backslash (must be first)
    .replace(/"/g, '\\"')    // Quote
    .replace(/\n/g, '\\n')   // Newline
    .replace(/\r/g, '\\r')   // Carriage return
    .replace(/\t/g, '\\t')   // Tab
    .replace(/\f/g, '\\f');  // Form feed
}

// ============================================================================
// HTTPS & Connection Security
// ============================================================================

/**
 * Validates that URL uses secure HTTPS connection
 *
 * @param url - URL to check
 * @returns true if URL starts with https://
 */
export function isSecureConnection(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return url.startsWith('https://');
}

// ============================================================================
// JWT Token Handling
// ============================================================================

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Validates JWT token structure
 *
 * A valid JWT has 3 parts separated by dots:
 * header.payload.signature
 *
 * @param token - JWT token to validate
 * @returns true if token has valid structure
 */
export function isValidJWT(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

/**
 * Decodes JWT and returns payload (without verification)
 *
 * WARNING: This only decodes, does NOT verify signature.
 * Signature verification must be done by backend.
 *
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!isValidJWT(token)) {
      return null;
    }

    const payload = token.split('.')[1];
    // Decode base64url (replace URL-safe chars)
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Gets token expiry time
 *
 * @param token - JWT token
 * @returns Expiry date or null if token invalid/no exp claim
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp || typeof payload.exp !== 'number') {
      return null;
    }

    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Checks if token is expired
 *
 * @param token - JWT token
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true;
  }

  return new Date() >= expiry;
}

/**
 * Checks if token should be refreshed
 * Refreshes if within threshold of expiry
 *
 * @param token - JWT token
 * @returns true if token should be refreshed soon
 */
export function shouldRefreshToken(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true;
  }

  const now = new Date();
  const timeUntilExpiry = expiry.getTime() - now.getTime();

  return timeUntilExpiry < SECURITY_CONSTANTS.tokenRefreshThresholdMs;
}

// ============================================================================
// Error Message Sanitization
// ============================================================================

/**
 * Sanitizes error messages for user display
 *
 * Removes sensitive information:
 * - Stack traces
 * - Database errors
 * - API paths
 * - Backend error details
 *
 * Returns user-friendly generic message
 *
 * @param error - Error object or message
 * @returns Safe error message for user display
 */
export function sanitizeErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'Ein Fehler ist aufgetreten';
  }

  // Handle Axios/HTTP errors
  if (typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    if (response?.status === 401) {
      return 'Authentifizierung erforderlich';
    }
    if (response?.status === 403) {
      return 'Zugriff verweigert';
    }
    if (response?.status === 404) {
      return 'Ressource nicht gefunden';
    }
    if (response && response.status >= 500) {
      return 'Server-Fehler — bitte später versuchen';
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for known safe error messages
    if (error.message.includes('Network')) {
      return 'Netzwerkverbindung fehlgeschlagen';
    }
    if (error.message.includes('timeout')) {
      return 'Anfrage hat zu lange gedauert';
    }
  }

  // Default safe message
  return 'Ein Fehler ist aufgetreten';
}

// ============================================================================
// Rate Limiting Helpers
// ============================================================================

/**
 * Checks if login should be rate-limited
 *
 * @param lastAttemptTime - Timestamp of last login attempt
 * @param attemptCount - Number of failed attempts
 * @returns true if user should be locked out
 */
export function isLoginRateLimited(lastAttemptTime: number, attemptCount: number): boolean {
  if (attemptCount < SECURITY_CONSTANTS.maxLoginAttempts) {
    return false;
  }

  const now = Date.now();
  const timeSinceLastAttempt = now - lastAttemptTime;

  return timeSinceLastAttempt < SECURITY_CONSTANTS.lockoutDurationMs;
}

/**
 * Calculates lockout remaining time in seconds
 *
 * @param lastAttemptTime - Timestamp of last login attempt
 * @returns Remaining lockout seconds, or 0 if lockout expired
 */
export function getLoginLockoutRemaining(lastAttemptTime: number): number {
  const now = Date.now();
  const timeSinceLastAttempt = now - lastAttemptTime;
  const remaining = SECURITY_CONSTANTS.lockoutDurationMs - timeSinceLastAttempt;

  return Math.max(0, Math.ceil(remaining / 1000));
}

// ============================================================================
// Export all security utilities
// ============================================================================

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  sanitizeString,
  sanitizeEmail,
  escapeJson,
  isSecureConnection,
  isValidJWT,
  decodeJWT,
  getTokenExpiry,
  isTokenExpired,
  shouldRefreshToken,
  sanitizeErrorMessage,
  isLoginRateLimited,
  getLoginLockoutRemaining,
  SECURITY_CONSTANTS,
};
