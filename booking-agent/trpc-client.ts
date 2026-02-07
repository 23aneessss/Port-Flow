/**
 * Booking Agent Client
 * 
 * NOTE: The Booking Agent is now orchestrated through the Orchestration Agent.
 * For frontend integration, use the Orchestration Agent which coordinates
 * both Booking and Slots Availability agents through a unified 6-step pipeline.
 * 
 * This file provides direct access to the BookingAgent class for advanced use cases.
 */

import { BookingAgent, createBookingAgent, type BookingAgentOptions } from './src/index.js';

// Re-export the agent for direct usage
export { BookingAgent, createBookingAgent, type BookingAgentOptions };

/**
 * Create a booking agent instance with configuration
 */
export function createBookingAgentClient(options: {
  apiBaseUrl?: string;
  authToken?: string;
  mistralApiKey: string;
}) {
  return createBookingAgent({
    config: {
      apiBaseUrl: options.apiBaseUrl || 'http://localhost:4000',
      mistralApiKey: options.mistralApiKey,
    },
    authToken: options.authToken,
  });
}

// ============ Recommended: Use Orchestration Agent ============
/*
The Booking Agent is now part of a multi-agent orchestration system.
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

// The orchestrator automatically routes to the correct agent
const response = await orchestrator.process({
  message: 'Show me all pending bookings',
  userRole: 'CARRIER',
});

console.log(response.output); // Role-appropriate formatted response

// Or use the simple chat interface
const reply = await orchestrator.chat('Create a booking at Terminal A tomorrow');
console.log(reply);
*/

// ============ Direct Agent Usage (Advanced) ============
/*
import { createBookingAgentClient } from './trpc-client';

const agent = createBookingAgentClient({
  apiBaseUrl: 'http://localhost:4000',
  authToken: 'your-jwt-token',
  mistralApiKey: process.env.MISTRAL_API_KEY!,
});

// Direct chat with the booking agent
const response = await agent.chat('Show me all pending bookings');
console.log(response.text);
console.log(response.toolCalls); // See what tools the agent used

// Clear conversation history
agent.clearHistory();
*/
