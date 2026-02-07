# Slot Availability Agent

An AI-powered agent that provides deep knowledge of the capacity engine's current state. It can answer nuanced questions about terminal space, equipment constraints, and peak-hour restrictions.

## Features

- **Terminal Capacity Analysis**: Get real-time information about terminal slots and availability
- **Booking Intelligence**: Analyze booking patterns and slot utilization
- **Smart Recommendations**: Suggest optimal time slots based on current capacity
- **Equipment Constraints**: Consider terminal-specific equipment limitations
- **Peak-Hour Awareness**: Understand and communicate peak-hour restrictions

## Access Control

This agent is accessible by:
- **ADMIN**: Full access to terminal management and availability data
- **OPERATOR**: View terminal availability and booking information
- **CARRIER**: Check slot availability for booking purposes

**Note**: DRIVER role does not have access to this agent.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
API_BASE_URL=http://localhost:4000
```

## Usage

### As a Module

```typescript
import { SlotAvailabilityAgent } from 'slots-availability-agent';

const agent = new SlotAvailabilityAgent({
  authToken: 'your-jwt-token',
});

// Chat with the agent
const response = await agent.chat('What terminals have available slots right now?');
console.log(response.text);

// Stream responses
for await (const chunk of agent.chatStream('Check capacity for Terminal A')) {
  process.stdout.write(chunk);
}
```

### Running the Test CLI

```bash
npm run dev
```

## API Tools

The agent uses the following backend API endpoints:

| Tool | Endpoint | Description |
|------|----------|-------------|
| `createTerminal` | `POST /admin/terminals` | Create a new terminal (Admin only) |
| `getTerminalById` | `GET /admin/terminals/:id` | Get terminal details with capacity info |
| `getCarrierBookings` | `GET /carrier/bookings` | Get bookings to analyze slot utilization |

## Architecture

```
src/
├── agent.ts        # Main agent class with Mistral AI integration
├── api-client.ts   # HTTP client for backend communication
├── config.ts       # Configuration management
├── schemas.ts      # Zod schemas for type safety
├── tools.ts        # AI SDK tool definitions
├── index.ts        # Main exports
└── test.ts         # Interactive test CLI
```

## Example Queries

- "What's the current availability at Terminal A?"
- "Which terminals have the most free slots?"
- "Are there any peak-hour restrictions I should know about?"
- "What's the capacity utilization across all terminals?"
- "Can I book a slot at Terminal B for tomorrow morning?"
- "Which time slots are typically less busy?"

## License

MIT
