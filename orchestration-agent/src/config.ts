/**
 * Orchestration Agent Configuration
 */

export type UserRole = 'ADMIN' | 'OPERATOR' | 'CARRIER' | 'DRIVER';

export interface OrchestratorConfig {
  /** Base URL of the backend API */
  apiBaseUrl: string;
  /** JWT token for authentication */
  authToken?: string;
  /** Mistral API key for LLM calls */
  mistralApiKey: string;
  /** Model to use (default: mistral-large-latest) */
  model?: string;
  /** User role for access control and output formatting */
  userRole?: UserRole;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retry attempts for failed requests */
  maxRetries?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Auto-login credentials (optional) */
  autoLogin?: {
    email: string;
    password: string;
  };
}

export const DEFAULT_CONFIG: Partial<OrchestratorConfig> = {
  apiBaseUrl: 'http://localhost:4000',
  model: 'mistral-large-latest',
  timeout: 30000,
  maxRetries: 3,
  debug: false,
};

export function createConfig(overrides: Partial<OrchestratorConfig> = {}): OrchestratorConfig {
  const mistralApiKey = overrides.mistralApiKey || process.env.MISTRAL_API_KEY;
  const authToken = overrides.authToken || process.env.AUTH_TOKEN;
  const apiBaseUrl = overrides.apiBaseUrl || process.env.API_BASE_URL || DEFAULT_CONFIG.apiBaseUrl;

  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY is required');
  }

  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    apiBaseUrl: apiBaseUrl!,
    mistralApiKey,
    authToken,
    autoLogin:
      overrides.autoLogin ||
      (process.env.AUTO_LOGIN_EMAIL && process.env.AUTO_LOGIN_PASSWORD
        ? {
            email: process.env.AUTO_LOGIN_EMAIL,
            password: process.env.AUTO_LOGIN_PASSWORD,
          }
        : undefined),
  } as OrchestratorConfig;
}
