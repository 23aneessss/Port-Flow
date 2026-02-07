/**
 * tRPC Client for the Orchestration Agent
 * 
 * This file provides a tRPC client that can be used by frontend applications
 * to communicate with the orchestrator.
 */
import { createTRPCClient, httpBatchLink } from '@trpc/client';

/**
 * Create an orchestrator tRPC client
 */
export function createOrchestratorClient(options: {
  baseUrl?: string;
  getAuthToken: () => string | null;
}) {
  const { baseUrl = 'http://localhost:4000', getAuthToken } = options;

  return createTRPCClient<any>({
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
import { createOrchestratorClient } from './trpc-client';

// Create client with auth token
const client = createOrchestratorClient({
  baseUrl: 'http://localhost:4000',
  getAuthToken: () => localStorage.getItem('token'),
});

// Send a message to the orchestrator
const response = await client.orchestrator.process.mutate({
  message: 'Book a slot at Terminal A tomorrow at 10 AM',
  userRole: 'CARRIER',
  sessionId: 'optional-session-id',
});

console.log(response.success);
console.log(response.output);

// For operators/admins, the response will be dashboard-friendly
const dashboardResponse = await client.orchestrator.process.mutate({
  message: 'Show me all pending bookings',
  userRole: 'OPERATOR',
});

if (dashboardResponse.output?.output.type === 'dashboard') {
  const dashboard = dashboardResponse.output.output;
  console.log('KPIs:', dashboard.kpis);
  console.log('Widgets:', dashboard.widgets);
  console.log('Actions:', dashboard.actions);
}

// Example queries for the Orchestrator:
// 
// Booking Intent:
// - "Book a slot at Terminal A tomorrow at 10:00 AM"
// - "Cancel my booking #12345"
// - "What's the status of my booking?"
// - "Approve booking BK-001" (operator)
// - "Show me all pending bookings" (operator)
// 
// Slots Availability Intent:
// - "What slots are available at Terminal B?"
// - "Show me the capacity utilization"
// - "When are the peak hours?"
// - "Find available slots for next week"
// - "Recommend the best time to book"
*/
