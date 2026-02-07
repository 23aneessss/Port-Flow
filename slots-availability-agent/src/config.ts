/**
 * Configuration for the Slot Availability Agent
 */
export interface AgentConfig {
  /** Base URL of the backend API */
  apiBaseUrl: string;
  /** JWT token for authentication */
  authToken?: string;
  /** Mistral API key */
  mistralApiKey: string;
  /** Model to use (default: mistral-large-latest) */
  model?: string;
  /** User role for access control */
  userRole?: UserRole;
  /** Auto-login credentials (optional) */
  autoLogin?: {
    email: string;
    password: string;
  };
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'CARRIER' | 'DRIVER';

export const ALLOWED_ROLES: UserRole[] = ['ADMIN', 'OPERATOR', 'CARRIER'];

/**
 * Get default config - reads env vars at call time (after dotenv is loaded)
 */
function getDefaultConfig(): Partial<AgentConfig> {
  return {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
    authToken: process.env.AUTH_TOKEN,
    model: 'mistral-large-latest',
    autoLogin: process.env.AUTO_LOGIN_EMAIL && process.env.AUTO_LOGIN_PASSWORD
      ? {
          email: process.env.AUTO_LOGIN_EMAIL,
          password: process.env.AUTO_LOGIN_PASSWORD,
        }
      : undefined,
  };
}

export function createConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  const defaults = getDefaultConfig();
  const mistralApiKey = overrides.mistralApiKey || process.env.MISTRAL_API_KEY;
  const authToken = overrides.authToken || process.env.AUTH_TOKEN;
  const autoLogin = overrides.autoLogin || defaults.autoLogin;

  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY is required');
  }

  return {
    ...defaults,
    ...overrides,
    mistralApiKey,
    authToken,
    autoLogin,
  } as AgentConfig;
}

/**
 * Check if a user role has access to the Slot Availability Agent
 */
export function hasAccess(role?: UserRole): boolean {
  if (!role) return false;
  return ALLOWED_ROLES.includes(role);
}
