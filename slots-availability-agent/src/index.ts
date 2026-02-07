// Main entry point for the slot availability agent
export {
  SlotAvailabilityAgent,
  createSlotAvailabilityAgent,
  type SlotAvailabilityAgentOptions,
  type AgentResponse,
} from './agent.js';

export {
  createConfig,
  hasAccess,
  ALLOWED_ROLES,
  type AgentConfig,
  type UserRole,
} from './config.js';

export { createSlotAvailabilityTools, type SlotAvailabilityTools } from './tools.js';

export { ApiClient, type ApiResponse, type HttpMethod } from './api-client.js';

export * from './schemas.js';
