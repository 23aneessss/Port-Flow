/**
 * Configuration for the Booking Agent
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
}

export const defaultConfig: Partial<AgentConfig> = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  model: 'mistral-large-latest',
};

export function createConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  const mistralApiKey = overrides.mistralApiKey || process.env.MISTRAL_API_KEY;
  
  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY is required');
  }

  return {
    ...defaultConfig,
    ...overrides,
    mistralApiKey,
  } as AgentConfig;
}
