/**
 * Environment Configuration Module
 * Handles dev/staging/production configuration separation
 *
 * Provides:
 * - Environment-specific API URLs
 * - Feature flags per environment
 * - Debug/logging configuration
 * - Secure defaults for production
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  apiBaseUrl: string;
  apiTimeout: number;
  debugLogging: boolean;
  analyticsEnabled: boolean;
  sentryEnabled: boolean;
}

export interface ConfigValidationReport {
  environment: Environment;
  httpsEnabled: boolean;
  debugLoggingDisabled: boolean;
  sentryEnabled: boolean;
  allValid: boolean;
  errors: string[];
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Detects current environment from process.env
 *
 * Fallback: 'development' if not set or invalid
 *
 * @returns Current environment
 */
function getEnvironment(): Environment {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

  if (env === 'staging' || env === 'production') {
    return env as Environment;
  }

  return 'development';
}

// ============================================================================
// Environment-Specific Configurations
// ============================================================================

const CONFIG: Record<Environment, AppConfig> = {
  development: {
    environment: 'development',
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    apiTimeout: 10000,
    debugLogging: true,
    analyticsEnabled: false,
    sentryEnabled: false,
  },
  staging: {
    environment: 'staging',
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://staging-api.bundesliga.local',
    apiTimeout: 10000,
    debugLogging: false,
    analyticsEnabled: true,
    sentryEnabled: true,
  },
  production: {
    environment: 'production',
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.bundesliga-match-analyzer.de',
    apiTimeout: 10000,
    debugLogging: false,
    analyticsEnabled: true,
    sentryEnabled: true,
  },
};

// ============================================================================
// Configuration Export Functions
// ============================================================================

/**
 * Gets current environment configuration
 *
 * @returns AppConfig for current environment
 */
export function getConfig(): AppConfig {
  const env = getEnvironment();
  return CONFIG[env];
}

/**
 * Gets current environment name
 *
 * @returns Environment: 'development' | 'staging' | 'production'
 */
export function getCurrentEnvironment(): Environment {
  return getEnvironment();
}

/**
 * Checks if running in production
 *
 * @returns true if environment is 'production'
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Checks if running in staging
 *
 * @returns true if environment is 'staging'
 */
export function isStaging(): boolean {
  return getEnvironment() === 'staging';
}

/**
 * Checks if running in development
 *
 * @returns true if environment is 'development'
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

// ============================================================================
// Configuration Validation
// ============================================================================

/**
 * Validates environment configuration
 *
 * Rules:
 * - All environments: apiBaseUrl is required
 * - Production: must use HTTPS, debugLogging must be false
 * - Staging: must use HTTPS
 *
 * @param config - Configuration to validate (uses current if not provided)
 * @returns Validation report with errors array
 */
export function validateConfig(config?: AppConfig): ConfigValidationReport {
  const cfg = config || getConfig();
  const errors: string[] = [];

  // Check required fields
  if (!cfg.apiBaseUrl) {
    errors.push('apiBaseUrl is required');
  }

  // HTTPS validation
  const httpsEnabled = cfg.apiBaseUrl.startsWith('https://');

  if (cfg.environment === 'production') {
    // Production must use HTTPS
    if (!httpsEnabled) {
      errors.push('apiBaseUrl must use HTTPS in production');
    }

    // Production must disable debug logging
    if (cfg.debugLogging) {
      errors.push('debugLogging must be false in production');
    }

    // Production should enable Sentry
    if (!cfg.sentryEnabled) {
      errors.push('sentryEnabled should be true in production');
    }
  }

  if (cfg.environment === 'staging') {
    // Staging should use HTTPS
    if (!httpsEnabled) {
      errors.push('apiBaseUrl should use HTTPS in staging');
    }
  }

  return {
    environment: cfg.environment,
    httpsEnabled,
    debugLoggingDisabled: !cfg.debugLogging,
    sentryEnabled: cfg.sentryEnabled,
    allValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates configuration and throws error if invalid (production only)
 *
 * In development/staging, logs warnings but does not throw.
 * In production, throws Error if validation fails.
 *
 * @param config - Configuration to validate
 * @throws Error if production config is invalid
 */
export function validateConfigStrict(config?: AppConfig): void {
  const cfg = config || getConfig();
  const report = validateConfig(cfg);

  if (!report.allValid) {
    const errorMessage = `Configuration validation failed:\n${report.errors.join('\n')}`;

    if (isProduction()) {
      throw new Error(errorMessage);
    } else {
      console.warn('Configuration validation warnings:\n' + errorMessage);
    }
  }
}

// ============================================================================
// Export default configuration object
// ============================================================================

export default {
  getConfig,
  getCurrentEnvironment,
  isProduction,
  isStaging,
  isDevelopment,
  validateConfig,
  validateConfigStrict,
};
