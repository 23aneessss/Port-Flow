/**
 * tRPC Client for the Slots Availability Agent
 * 
 * This file can be copied to your frontend projects to connect to the tRPC API.
 */
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../backend-express/src/trpc/index.js';

/**
 * Create a tRPC client for the slots availability agent
 */
export function createSlotsAgentClient(options: {
  baseUrl?: string;
  getAuthToken: () => string | null;
}) {
  const { baseUrl = 'http://localhost:4000', getAuthToken } = options;

  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        headers: () => {
          const token = getAuthToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

// ============ Example Usage ============
/*
import { createSlotsAgentClient } from './trpc-client';

// Create client with auth token
const client = createSlotsAgentClient({
  baseUrl: 'http://localhost:4000',
  getAuthToken: () => localStorage.getItem('token'),
});

// Send a message to the slots availability agent
const response = await client.slotsAgent.chat.mutate({
  message: 'What is the current availability at Terminal A?',
  sessionId: 'optional-session-id', // Pass same ID to continue conversation
});

console.log(response.text);
console.log(response.sessionId); // Save this to continue the conversation
console.log(response.toolCalls); // See what tools the agent used

// Clear a session
await client.slotsAgent.clearSession.mutate({ sessionId: 'session-id' });

// Get conversation history
const history = await client.slotsAgent.getHistory.query({ sessionId: 'session-id' });

// Get active sessions
const sessions = await client.slotsAgent.getActiveSessions.query();

// Example queries for the Slots Availability Agent:
// - "Show me all terminals with low utilization"
// - "What are the peak hours at Terminal B?"
// - "Find available slots for tomorrow morning"
// - "What equipment constraints affect Terminal A?"
// - "Recommend the best time to book a slot"
*/

export type { AppRouter };
