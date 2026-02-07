# Booking Agent

AI-powered booking agent for Port Flow using Vercel AI SDK with Mistral LLM.

## Overview

The Booking Agent handles the transactional lifecycle of port terminal appointments. It can:

- **Create** new booking requests
- **Modify** existing bookings (pending status only)
- **Cancel** bookings
- **Check status** of specific bookings (e.g., "Where is my booking #5432?")
- **List terminals** and their availability
- **Approve/Reject** bookings (for operators)

## Installation

```bash
cd booking-agent
npm install
```

## Configuration

Create a `.env` file (already exists):

```env
MISTRAL_API_KEY=your_mistral_api_key
API_BASE_URL=http://localhost:4000
```

## Usage

### Standalone Test

```bash
npm run test
```

### Integration with Backend Express (tRPC)

```typescript
// In your tRPC router file
import { 
  AgentSessionManager, 
  createAgentProcedures, 
  ChatInputSchema 
} from 'booking-agent/trpc';

// Create session manager
const sessionManager = new AgentSessionManager({
  apiBaseUrl: 'http://localhost:4000',
});

const agentProcedures = createAgentProcedures(sessionManager);

// Add to your router
export const agentRouter = router({
  chat: protectedProcedure
    .input(ChatInputSchema)
    .mutation(async ({ input, ctx }) => {
      return agentProcedures.chat(input, ctx.token);
    }),
    
  clearSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      return agentProcedures.clearSession(input.sessionId);
    }),
});
```

### Direct Usage

```typescript
import { createBookingAgent } from 'booking-agent';

const agent = createBookingAgent({
  config: {
    apiBaseUrl: 'http://localhost:4000',
  },
  authToken: 'jwt-token-here',
});

// Non-streaming
const response = await agent.chat('Show me all pending bookings');
console.log(response.text);

// Streaming
for await (const chunk of agent.chatStream('List all terminals')) {
  process.stdout.write(chunk);
}
```

## Available Tools

The agent has access to these tools (mapped to API endpoints):

| Tool | Endpoint | Description |
|------|----------|-------------|
| `getTerminals` | GET /admin/terminals | List all terminals |
| `getTerminalById` | GET /admin/terminals/:id | Get terminal details |
| `getOperatorBookings` | GET /operator/bookings | Get bookings (with status filter) |
| `approveBooking` | POST /operator/bookings/:id/approve | Approve a booking |
| `rejectBooking` | POST /operator/bookings/:id/reject | Reject a booking |
| `getCarrierBookings` | GET /operator/carriers/:id/bookings | Get carrier's bookings |
| `createBooking` | POST /carrier/bookings | Create a new booking |
| `getMyBookings` | GET /carrier/bookings | Get current carrier's bookings |
| `updateBooking` | PUT /carrier/bookings/:id | Update a booking |
| `cancelBooking` | DELETE /carrier/bookings/:id | Cancel a booking |
| `getBookingStatus` | (searches bookings) | Check status of a booking |

## Booking Status Flow

```
PENDING → CONFIRMED → CONSUMED
    ↓         ↓
REJECTED  CANCELLED
```

- **PENDING**: Awaiting operator approval
- **CONFIRMED**: Approved and scheduled
- **REJECTED**: Declined by operator
- **CANCELLED**: Cancelled by carrier
- **CONSUMED**: Completed/used

## Example Conversations

**User**: "Show me all available terminals"
**Agent**: Lists terminals with their names, status, and available slots

**User**: "Where is my booking #abc123?"
**Agent**: Finds the booking and reports its current status

**User**: "Create a booking for Terminal A tomorrow at 10am"
**Agent**: Creates a booking request (if properly authenticated)

**User**: "Approve booking #xyz789"
**Agent**: Approves the booking (operator role required)
