/**
 * Security Audit Test Suite
 * Tests for security.ts, environment.ts, and SecurityAuditService.ts
 *
 * Covers:
 * - Input validation (email, password, username, phone)
 * - String sanitization (XSS prevention)
 * - JWT token handling
 * - Error message sanitization
 * - Environment configuration
 * - Security audit checklist
 */

import * as security from '../../config/security';
import * as environment from '../../config/environment';
import * as auditService from '../../services/SecurityAuditService';

// ============================================================================
// Test Suite 1: Email Validation (4 tests)
// ============================================================================

describe('Email Validation', () => {
  test('validateEmail accepts valid emails', () => {
    expect(security.validateEmail('user@example.com')).toBe(true);
    expect(security.validateEmail('test.user+tag@domain.co.uk')).toBe(true);
    expect(security.validateEmail('valid_email@subdomain.example.com')).toBe(true);
  });

  test('validateEmail rejects invalid formats', () => {
    expect(security.validateEmail('invalid')).toBe(false);
    expect(security.validateEmail('user@')).toBe(false);
    expect(security.validateEmail('@domain.com')).toBe(false);
    expect(security.validateEmail('user@domain')).toBe(false);
    expect(security.validateEmail('user @example.com')).toBe(false);
  });

  test('validateEmail rejects emails over 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@domain.com';
    expect(security.validateEmail(longEmail)).toBe(false);
  });

  test('validateEmail rejects null and non-string inputs', () => {
    expect(security.validateEmail(null as unknown as string)).toBe(false);
    expect(security.validateEmail(undefined as unknown as string)).toBe(false);
    expect(security.validateEmail('')).toBe(false);
  });
});

// ============================================================================
// Test Suite 2: Password Validation (3 tests)
// ============================================================================

describe('Password Validation', () => {
  test('validatePassword enforces requirements (8+ chars, uppercase, digit, special)', () => {
    expect(security.validatePassword('Valid@Pass123')).toBe(true);
    expect(security.validatePassword('StrongP@ssw0rd')).toBe(true);
    expect(security.validatePassword('MyP@ss1!')).toBe(true);
  });

  test('validatePassword rejects weak passwords', () => {
    expect(security.validatePassword('weak')).toBe(false);           // Too short
    expect(security.validatePassword('weakpassword')).toBe(false);   // No uppercase, digit, special
    expect(security.validatePassword('WeakPassword')).toBe(false);   // No digit or special
    expect(security.validatePassword('Weak@1')).toBe(false);         // Too short (7 chars)
    expect(security.validatePassword('weakpass123')).toBe(false);    // No uppercase or special
  });

  test('validatePassword rejects null and non-string inputs', () => {
    expect(security.validatePassword(null as unknown as string)).toBe(false);
    expect(security.validatePassword(undefined as unknown as string)).toBe(false);
    expect(security.validatePassword('')).toBe(false);
  });
});

// ============================================================================
// Test Suite 3: Username Validation (2 tests)
// ============================================================================

describe('Username Validation', () => {
  test('validateUsername allows alphanumeric and underscore', () => {
    expect(security.validateUsername('valid_user')).toBe(true);
    expect(security.validateUsername('user123')).toBe(true);
    expect(security.validateUsername('USER')).toBe(true);
    expect(security.validateUsername('a_b_c')).toBe(true);
  });

  test('validateUsername rejects invalid formats', () => {
    expect(security.validateUsername('ab')).toBe(false);             // Too short
    expect(security.validateUsername('user-name')).toBe(false);      // Hyphen not allowed
    expect(security.validateUsername('user name')).toBe(false);      // Space not allowed
    expect(security.validateUsername('_user')).toBe(false);          // Cannot start with underscore
    expect(security.validateUsername('user@domain')).toBe(false);    // @ not allowed
  });
});

// ============================================================================
// Test Suite 4: Phone Number Validation (2 tests)
// ============================================================================

describe('Phone Number Validation', () => {
  test('validatePhoneNumber accepts international formats', () => {
    expect(security.validatePhoneNumber('+49 123 456789')).toBe(true);
    expect(security.validatePhoneNumber('+1 (555) 123-4567')).toBe(true);
    expect(security.validatePhoneNumber('123-456-7890')).toBe(true);
    expect(security.validatePhoneNumber('+491234567890')).toBe(true);
  });

  test('validatePhoneNumber rejects invalid formats', () => {
    expect(security.validatePhoneNumber('123')).toBe(false);         // Too short
    expect(security.validatePhoneNumber('abc-def-ghij')).toBe(false); // Letters
    expect(security.validatePhoneNumber('')).toBe(false);            // Empty
    expect(security.validatePhoneNumber('user@domain.com')).toBe(false); // Not a phone
  });
});

// ============================================================================
// Test Suite 5: String Sanitization (4 tests)
// ============================================================================

describe('String Sanitization', () => {
  test('sanitizeString removes XSS payloads', () => {
    expect(security.sanitizeString('<script>alert("xss")</script>')).toBe(
      'scriptalert(xss)/script'
    );
    expect(security.sanitizeString('"><script>alert(1)</script>')).toBe(
      'scriptalert(1)/script'
    );
    expect(security.sanitizeString('<img src=x onerror="alert(1)">')).toBe(
      'img src=x onerror=alert(1)'
    );
  });

  test('sanitizeString truncates to 1000 characters', () => {
    const longString = 'a'.repeat(2000);
    const sanitized = security.sanitizeString(longString);
    expect(sanitized.length).toBe(1000);
  });

  test('sanitizeEmail normalizes to lowercase', () => {
    expect(security.sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    expect(security.sanitizeEmail('  UPPERCASE  ')).toBe('uppercase');
  });

  test('escapeJson escapes dangerous characters', () => {
    expect(security.escapeJson('test"quote')).toBe('test\\"quote');
    expect(security.escapeJson('test\nline')).toBe('test\\nline');
    expect(security.escapeJson('tab\there')).toBe('tab\\there');
    expect(security.escapeJson('return\rcarriage')).toBe('return\\rcarriage');
  });
});

// ============================================================================
// Test Suite 6: HTTPS & Security Connection (1 test)
// ============================================================================

describe('HTTPS & Connection Security', () => {
  test('isSecureConnection validates HTTPS', () => {
    expect(security.isSecureConnection('https://api.example.com')).toBe(true);
    expect(security.isSecureConnection('https://secure.site.org')).toBe(true);
    expect(security.isSecureConnection('http://localhost:8000')).toBe(false);
    expect(security.isSecureConnection('http://api.example.com')).toBe(false);
    expect(security.isSecureConnection('ftp://files.example.com')).toBe(false);
  });
});

// ============================================================================
// Test Suite 7: JWT Token Handling (5 tests)
// ============================================================================

describe('JWT Token Handling', () => {
  // Valid JWT: header.payload.signature
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.wkjsJk89sAUhidhUL5m5TmjMJ2Q7z5d8q7VwVuM8pqc';
  const expiredToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.signature';
  const invalidToken = 'not.a.token.structure';
  const malformedToken = 'onlyonepart';

  test('isValidJWT validates token structure', () => {
    expect(security.isValidJWT(validToken)).toBe(true);
    expect(security.isValidJWT(expiredToken)).toBe(true);
    expect(security.isValidJWT(invalidToken)).toBe(false);
    expect(security.isValidJWT(malformedToken)).toBe(false);
    expect(security.isValidJWT('')).toBe(false);
  });

  test('decodeJWT parses JWT payload correctly', () => {
    const payload = security.decodeJWT(validToken);
    expect(payload).not.toBeNull();
    expect(payload?.name).toBe('John Doe');
    expect(payload?.sub).toBe('1234567890');
  });

  test('getTokenExpiry parses expiration correctly', () => {
    const expiry = security.getTokenExpiry(validToken);
    expect(expiry).not.toBeNull();
    expect(expiry?.getTime()).toBe(9999999999 * 1000);
  });

  test('isTokenExpired checks expiration status', () => {
    expect(security.isTokenExpired(validToken)).toBe(false);
    expect(security.isTokenExpired(expiredToken)).toBe(true);
    expect(security.isTokenExpired('invalid.token.here')).toBe(true);
  });

  test('shouldRefreshToken checks refresh threshold', () => {
    // Valid token with future expiry should not need refresh
    expect(security.shouldRefreshToken(validToken)).toBe(false);
    // Expired token should need refresh
    expect(security.shouldRefreshToken(expiredToken)).toBe(true);
  });
});

// ============================================================================
// Test Suite 8: Error Message Sanitization (2 tests)
// ============================================================================

describe('Error Message Sanitization', () => {
  test('sanitizeErrorMessage hides sensitive info', () => {
    const msg401 = security.sanitizeErrorMessage({ response: { status: 401 } });
    expect(msg401).toBe('Authentifizierung erforderlich');

    const msg403 = security.sanitizeErrorMessage({ response: { status: 403 } });
    expect(msg403).toBe('Zugriff verweigert');

    const msg500 = security.sanitizeErrorMessage({ response: { status: 500 } });
    expect(msg500).toBe('Server-Fehler — bitte später versuchen');
  });

  test('sanitizeErrorMessage returns default for unknown errors', () => {
    const defaultMsg = security.sanitizeErrorMessage(null);
    expect(defaultMsg).toBe('Ein Fehler ist aufgetreten');

    const unknownMsg = security.sanitizeErrorMessage({ message: 'Unknown error' });
    expect(unknownMsg).toBe('Ein Fehler ist aufgetreten');
  });
});

// ============================================================================
// Test Suite 9: Rate Limiting (2 tests)
// ============================================================================

describe('Rate Limiting', () => {
  test('isLoginRateLimited checks lockout status', () => {
    const now = Date.now();
    const recentAttempt = now - 1000; // 1 second ago
    const oldAttempt = now - 20 * 60 * 1000; // 20 minutes ago

    // Under limit: no lockout
    expect(security.isLoginRateLimited(recentAttempt, 2)).toBe(false);

    // At limit but within lockout window: locked out
    expect(security.isLoginRateLimited(recentAttempt, 5)).toBe(true);

    // Over limit but outside lockout window: not locked out
    expect(security.isLoginRateLimited(oldAttempt, 5)).toBe(false);
  });

  test('getLoginLockoutRemaining calculates remaining time', () => {
    const now = Date.now();
    const recentAttempt = now - 1000; // 1 second ago

    const remaining = security.getLoginLockoutRemaining(recentAttempt);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(security.SECURITY_CONSTANTS.lockoutDurationMs / 1000);
  });
});

// ============================================================================
// Test Suite 10: Environment Configuration (4 tests)
// ============================================================================

describe('Environment Configuration', () => {
  test('getCurrentEnvironment detects current environment', () => {
    const env = environment.getCurrentEnvironment();
    expect(['development', 'staging', 'production']).toContain(env);
  });

  test('isProduction() returns correct value', () => {
    const isProd = environment.isProduction();
    expect(typeof isProd).toBe('boolean');
  });

  test('isDevelopment() returns correct value', () => {
    const isDev = environment.isDevelopment();
    expect(typeof isDev).toBe('boolean');
  });

  test('getConfig returns environment-specific config', () => {
    const config = environment.getConfig();
    expect(config.environment).toBeDefined();
    expect(config.apiBaseUrl).toBeDefined();
    expect(config.apiTimeout).toBeGreaterThan(0);
    expect(typeof config.debugLogging).toBe('boolean');
    expect(typeof config.analyticsEnabled).toBe('boolean');
    expect(typeof config.sentryEnabled).toBe('boolean');
  });
});

// ============================================================================
// Test Suite 11: Configuration Validation (3 tests)
// ============================================================================

describe('Configuration Validation', () => {
  test('validateConfig enforces production rules', () => {
    // Create a test config
    const testConfig: environment.AppConfig = {
      environment: 'production',
      apiBaseUrl: 'https://api.example.com',
      apiTimeout: 10000,
      debugLogging: false,
      analyticsEnabled: true,
      sentryEnabled: true,
    };

    const report = environment.validateConfig(testConfig);
    expect(report.allValid).toBe(true);
    expect(report.httpsEnabled).toBe(true);
  });

  test('validateConfig detects insecure HTTP in production', () => {
    const insecureConfig: environment.AppConfig = {
      environment: 'production',
      apiBaseUrl: 'http://api.example.com',
      apiTimeout: 10000,
      debugLogging: false,
      analyticsEnabled: true,
      sentryEnabled: true,
    };

    const report = environment.validateConfig(insecureConfig);
    expect(report.allValid).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  test('validateConfig reports missing apiBaseUrl', () => {
    const missingUrlConfig: environment.AppConfig = {
      environment: 'development',
      apiBaseUrl: '',
      apiTimeout: 10000,
      debugLogging: true,
      analyticsEnabled: false,
      sentryEnabled: false,
    };

    const report = environment.validateConfig(missingUrlConfig);
    expect(report.allValid).toBe(false);
    expect(report.errors).toContain('apiBaseUrl is required');
  });
});

// ============================================================================
// Test Suite 12: Security Audit Service (3 tests)
// ============================================================================

describe('Security Audit Service', () => {
  test('getSecurityChecklist returns all OWASP items', () => {
    const checklist = auditService.getSecurityChecklist();
    expect(checklist.length).toBe(10);
    expect(checklist.map((item) => item.id)).toContain('OWASP-1');
    expect(checklist.map((item) => item.id)).toContain('OWASP-10');
  });

  test('generateSecurityAuditReport includes timestamp', () => {
    const report = auditService.generateSecurityAuditReport();
    expect(report.timestamp).toBeDefined();
    expect(report.totalChecks).toBe(10);
    expect(report.passedChecks).toBeGreaterThanOrEqual(0);
    expect(report.failedChecks).toBeGreaterThanOrEqual(0);
    expect(report.warningChecks).toBeGreaterThanOrEqual(0);
    expect(['pass', 'fail', 'warning']).toContain(report.overallStatus);
  });

  test('validateApplicationConfig returns validation results', () => {
    const result = auditService.validateApplicationConfig();
    expect(result.isValid).toBeDefined();
    expect(result.environment).toBeDefined();
    expect(typeof result.httpsEnabled).toBe('boolean');
    expect(typeof result.debugLoggingDisabled).toBe('boolean');
    expect(typeof result.sentryEnabled).toBe('boolean');
    expect(Array.isArray(result.errors)).toBe(true);
  });
});

// ============================================================================
// Test Suite 13: Security Constants (1 test)
// ============================================================================

describe('Security Constants', () => {
  test('SECURITY_CONSTANTS has all required values', () => {
    expect(security.SECURITY_CONSTANTS.maxLoginAttempts).toBeGreaterThan(0);
    expect(security.SECURITY_CONSTANTS.lockoutDurationMs).toBeGreaterThan(0);
    expect(security.SECURITY_CONSTANTS.sessionTimeoutMs).toBeGreaterThan(0);
    expect(security.SECURITY_CONSTANTS.tokenRefreshThresholdMs).toBeGreaterThan(0);
    expect(security.SECURITY_CONSTANTS.maxStringLength).toBeGreaterThan(0);
  });
});
