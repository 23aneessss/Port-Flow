/**
 * Slots Availability Agent Client
 * 
 * NOTE: The Slots Availability Agent is now orchestrated through the Orchestration Agent.
 * For frontend integration, use the Orchestration Agent which coordinates
 * both Booking and Slots Availability agents through a unified 6-step pipeline.
 * 
 * This file provides direct access to the SlotAvailabilityAgent class for advanced use cases.
 */

import {
  SlotAvailabilityAgent,
  createSlotAvailabilityAgent,
  createAndInitializeAgent,
  type SlotAvailabilityAgentOptions,
  type UserRole,
} from './src/index.js';

// Re-export the agent for direct usage
export {
  SlotAvailabilityAgent,
  createSlotAvailabilityAgent,
  createAndInitializeAgent,
  type SlotAvailabilityAgentOptions,
  type UserRole,
};

/**
 * Create a slots availability agent instance with configuration
 */
export function createSlotsAgentClient(options: {
  apiBaseUrl?: string;
  authToken?: string;
  mistralApiKey: string;
  userRole?: UserRole;
  autoLogin?: { email: string; password: string };
}) {
  return createSlotAvailabilityAgent({
    config: {
      apiBaseUrl: options.apiBaseUrl || 'http://localhost:4000',
      mistralApiKey: options.mistralApiKey,
      userRole: options.userRole,
      autoLogin: options.autoLogin,
    },
    authToken: options.authToken,
    userRole: options.userRole,
  });
}

// ============ Recommended: Use Orchestration Agent ============
/*
The Slots Availability Agent is now part of a multi-agent orchestration system.
For frontend integration, use the Orchestration Agent instead:

import { createOrchestrator } from '../orchestration-agent/src/index.js';

const orchestrator = createOrchestrator({
  config: {
    apiBaseUrl: 'http://localhost:4000',
    mistralApiKey: process.env.MISTRAL_API_KEY,
    autoLogin: {
      email: 'user@example.com',
      password: 'password',
    },
  },
  userRole: 'CARRIER',
});

await orchestrator.initialize();

// The orchestrator automatically routes slot queries to the slots agent
const response = await orchestrator.process({
  message: 'What slots are available at Terminal A?',
  userRole: 'CARRIER',
});

console.log(response.output); // Role-appropriate formatted response

// The orchestrator handles:
// - Input sanitization (prompt injection protection)
// - Intent classification (bookings vs slots_availability)
// - Task decomposition and execution
// - Role-based output synthesis
// - Confidentiality validation
*/

// ============ Direct Agent Usage (Advanced) ============
/*
import { createSlotsAgentClient, createAndInitializeAgent } from './trpc-client';

// Option 1: Manual initialization
const agent = createSlotsAgentClient({
  apiBaseUrl: 'http://localhost:4000',
  authToken: 'your-jwt-token',
  mistralApiKey: process.env.MISTRAL_API_KEY!,
  userRole: 'CARRIER',
});

// Option 2: Auto-initialize with login
const agent = await createAndInitializeAgent({
  config: {
    apiBaseUrl: 'http://localhost:4000',
    mistralApiKey: process.env.MISTRAL_API_KEY!,
    autoLogin: { email: 'user@example.com', password: 'password' },
  },
  userRole: 'CARRIER',
});

// Direct chat with the slots agent
const response = await agent.chat('What is the current availability at Terminal A?');
console.log(response.text);
console.log(response.toolCalls); // See what tools the agent used

// Example queries:
// - "Show me all terminals with low utilization"
// - "What are the peak hours at Terminal B?"
// - "Find available slots for tomorrow morning"
// - "What equipment constraints affect Terminal A?"
// - "Recommend the best time to book a slot"

// Clear conversation history
agent.clearHistory();
*/
