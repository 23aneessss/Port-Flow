/**
 * tRPC Client for the Booking Agent
 * 
 * This file can be copied to your frontend projects to connect to the tRPC API.
 */
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../backend-express/src/trpc/index.js';

/**
 * Create a tRPC client for the booking agent
 */
export function createAgentClient(options: {
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
import { createAgentClient } from './trpc-client';

// Create client with auth token
const client = createAgentClient({
  baseUrl: 'http://localhost:4000',
  getAuthToken: () => localStorage.getItem('token'),
});

// Send a message to the agent
const response = await client.agent.chat.mutate({
  message: 'Show me all pending bookings',
  sessionId: 'optional-session-id', // Pass same ID to continue conversation
});

console.log(response.text);
console.log(response.sessionId); // Save this to continue the conversation
console.log(response.toolCalls); // See what tools the agent used

// Clear a session
await client.agent.clearSession.mutate({ sessionId: 'session-id' });

// Get conversation history
const history = await client.agent.getHistory.query({ sessionId: 'session-id' });

// Get active sessions
const sessions = await client.agent.getActiveSessions.query();
*/

export type { AppRouter };
