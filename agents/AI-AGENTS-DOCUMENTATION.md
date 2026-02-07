# Port Flow AI Agents Documentation

> Comprehensive documentation for the AI agent system powering Port Flow's intelligent port terminal management.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Agents](#agents)
  - [1. Orchestration Agent](#1-orchestration-agent)
  - [2. Booking Agent](#2-booking-agent)
  - [3. Slots Availability Agent](#3-slots-availability-agent)
- [Configuration](#configuration)
- [Access Control](#access-control)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)

---

## Overview

Port Flow's AI system consists of three specialized agents that work together to provide intelligent port terminal management:

| Agent | Purpose | Tech Stack |
|-------|---------|------------|
| **Orchestration Agent** | Coordinates and routes requests to specialized agents | Vercel AI SDK, Mistral LLM |
| **Booking Agent** | Handles booking lifecycle (create, modify, cancel) | Vercel AI SDK, Mistral LLM |
| **Slots Availability Agent** | Provides capacity insights and terminal analytics | Vercel AI SDK, Mistral LLM |

All agents use **Mistral LLM** via the Vercel AI SDK and communicate with the Express backend through REST APIs and tRPC.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATION AGENT                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    6-STEP SECURE PIPELINE                              │ │
│  │                                                                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │  │ Step 1   │─▶│ Step 2   │─▶│ Step 3   │─▶│ Step 4   │─▶│ Step 5   │ │ │
│  │  │Sanitize  │  │Classify  │  │Decompose │  │Tool Call │  │Synthesize│ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │ │
│  │                                                               │        │ │
│  │                                                               ▼        │ │
│  │                                                         ┌──────────┐   │ │
│  │                                                         │ Step 6   │   │ │
│  │                                                         │ Validate │   │ │
│  │                                                         └──────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                         ┌──────────┴──────────┐                             │
│                         ▼                     ▼                             │
│                 ┌──────────────┐      ┌──────────────┐                      │
│                 │BOOKING AGENT │      │ SLOTS AGENT  │                      │
│                 └──────────────┘      └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Express + Prisma)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Agents

### 1. Orchestration Agent

**Location:** `agents/orchestration-agent/`

The Orchestration Agent is the main entry point that coordinates multiple specialized agents through a secure, deterministic 6-step pipeline.

#### 6-Step Pipeline

| Step | Name | Purpose |
|------|------|---------|
| **1** | Sanitization | Normalize input, detect prompt injection, validate constraints |
| **2** | Classification | Intent detection (booking vs. slots) with entity extraction |
| **3** | Decomposition | Task planning with dependency resolution |
| **4** | Tool Calling | Execute tasks via Agent Bridge with retry/timeout handling |
| **5** | Synthesis | Role-based output formatting (carrier text vs. operator dashboard) |
| **6** | Validation | Confidentiality guardrails (PII detection, credential scanning) |

#### Pipeline Details

**Step 1: Input Sanitization**
- Normalizes text (whitespace, unicode)
- Detects prompt injection patterns (50+ patterns)
- Removes unsafe HTML/scripts
- Validates required fields

**Step 2: Intent Classification**
- Heuristic classification (fast, deterministic)
- LLM classification (for ambiguous cases)
- Entity extraction (terminal, booking ID, dates)
- Confidence scoring

**Step 3: Task Decomposition**
- Maps intent to task templates
- Resolves dependencies between tasks
- Computes execution order (topological sort)
- Estimates duration

**Step 4: Tool Calling**
- Executes tasks in dependency order
- Parallel execution where possible
- Retry with exponential backoff
- Timeout handling

**Step 5: Output Synthesis**
- **CARRIER**: Concise text + next steps
- **OPERATOR/ADMIN**: Dashboard JSON (KPIs, widgets, actions)
- Handles partial failures gracefully

**Step 6: Output Validation**
- Scans for PII (email, phone, SSN)
- Detects credentials (passwords, API keys, tokens)
- Removes internal system data
- Masks or redacts sensitive fields

#### Usage

```typescript
import { Orchestrator } from 'orchestration-agent';

const orchestrator = new Orchestrator({
  config: {
    apiBaseUrl: 'http://localhost:4000',
    mistralApiKey: process.env.MISTRAL_API_KEY,
  },
  userRole: 'CARRIER',
  debug: true,
});

await orchestrator.initialize();

const response = await orchestrator.process({
  message: 'Show me available slots at Terminal A',
  userRole: 'CARRIER',
});
```

#### Schemas

```typescript
// Intent Types
type IntentType = 'bookings' | 'slots_availability' | 'unknown';

// Orchestrator Request
interface OrchestratorRequest {
  message: string;
  userId?: string;
  userRole?: UserRole;
  sessionId?: string;
}

// Orchestrator Response
interface OrchestratorResponse {
  success: boolean;
  output?: SynthesizedOutput;
  error?: string;
  debug?: object;
}
```

---

### 2. Booking Agent

**Location:** `agents/booking-agent/`

The Booking Agent handles the transactional lifecycle of port terminal appointments.

#### Capabilities

| Action | Description |
|--------|-------------|
| **View Terminals** | List all terminals or get details about a specific terminal |
| **Create Booking** | Create new booking requests with terminal, date, time, and driver |
| **Update Booking** | Modify existing bookings (pending status only) |
| **Cancel Booking** | Cancel bookings |
| **Check Status** | Answer questions like "Where is my booking #5432?" |
| **Approve/Reject** | Review bookings (operator role) |

#### Available Tools

| Tool | Endpoint | Description | Role |
|------|----------|-------------|------|
| `getTerminals` | `GET /admin/terminals` | List all terminals | All |
| `getTerminalById` | `GET /admin/terminals/:id` | Get terminal details | All |
| `getOperatorBookings` | `GET /operator/bookings` | Get all bookings (filterable) | Operator |
| `approveBooking` | `POST /operator/bookings/:id/approve` | Approve pending booking | Operator |
| `rejectBooking` | `POST /operator/bookings/:id/reject` | Reject pending booking | Operator |
| `getCarrierBookings` | `GET /operator/carriers/:id/bookings` | Get carrier's bookings | Operator |
| `createBooking` | `POST /carrier/bookings` | Create new booking | Carrier |
| `updateBooking` | `PUT /carrier/bookings/:id` | Update pending booking | Carrier |
| `cancelBooking` | `POST /carrier/bookings/:id/cancel` | Cancel booking | Carrier |
| `getMyBookings` | `GET /carrier/bookings` | Get my bookings | Carrier |
| `getBookingStatus` | `GET /carrier/bookings/:id` | Get specific booking status | Carrier |

#### Booking Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting operator approval |
| `CONFIRMED` | Approved and scheduled |
| `REJECTED` | Declined by operator |
| `CANCELLED` | Cancelled by carrier |
| `CONSUMED` | Completed/used |

#### Usage

```typescript
import { BookingAgent } from 'booking-agent';

const agent = new BookingAgent({
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

#### tRPC Integration

```typescript
import { AgentSessionManager, createAgentProcedures } from 'booking-agent/trpc';

const sessionManager = new AgentSessionManager({
  apiBaseUrl: 'http://localhost:4000',
});

const agentProcedures = createAgentProcedures(sessionManager);

export const agentRouter = router({
  chat: protectedProcedure
    .input(ChatInputSchema)
    .mutation(async ({ input, ctx }) => {
      return agentProcedures.chat(input, ctx.token);
    }),
});
```

---

### 3. Slots Availability Agent

**Location:** `agents/slots-availability-agent/`

The Slots Availability Agent provides deep knowledge of the capacity engine's current state and can answer nuanced questions about terminal space, equipment constraints, and peak-hour restrictions.

#### Capabilities

| Feature | Description |
|---------|-------------|
| **Terminal Capacity Analysis** | Real-time slot availability and utilization rates |
| **Booking Intelligence** | Analyze booking patterns and slot utilization |
| **Smart Recommendations** | Suggest optimal time slots based on current capacity |
| **Equipment Constraints** | Consider terminal-specific equipment limitations |
| **Peak-Hour Awareness** | Understand and communicate peak-hour restrictions |

#### Available Tools

| Tool | Endpoint | Description | Role |
|------|----------|-------------|------|
| `createTerminal` | `POST /admin/terminals` | Create new terminal | Admin |
| `getTerminalById` | `GET /admin/terminals/:id` | Get terminal with capacity info | All |
| `getCarrierBookings` | `GET /carrier/bookings` | Analyze slot utilization patterns | Carrier |
| `checkSlotAvailability` | Internal | Check availability across terminals | All |

#### Utilization Levels

| Level | Percentage | Description |
|-------|------------|-------------|
| **LOW** | < 50% | Many slots available, ideal booking time |
| **MODERATE** | 50-80% | Good availability, book within 24 hours recommended |
| **HIGH** | > 80% | Limited slots, book immediately or consider alternatives |
| **FULL** | 100% | No slots available, suggest alternatives |

#### Terminal Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Terminal is operational and accepting bookings |
| `SUSPENDED` | Terminal is temporarily unavailable |

#### Usage

```typescript
import { SlotAvailabilityAgent } from 'slots-availability-agent';

const agent = new SlotAvailabilityAgent({
  authToken: 'your-jwt-token',
  userRole: 'CARRIER',
});

await agent.initialize();

// Chat with the agent
const response = await agent.chat('What terminals have available slots right now?');
console.log(response.text);

// Stream responses
for await (const chunk of agent.chatStream('Check capacity for Terminal A')) {
  process.stdout.write(chunk);
}
```

#### Example Queries

- "What's the current availability at Terminal A?"
- "Which terminals have the most free slots?"
- "Are there any peak-hour restrictions I should know about?"
- "What's the capacity utilization across all terminals?"
- "Can I book a slot at Terminal B for tomorrow morning?"
- "Which time slots are typically less busy?"

---

## Configuration

### Environment Variables

All agents share common environment variables:

```env
# Required
MISTRAL_API_KEY=your_mistral_api_key

# Backend API
API_BASE_URL=http://localhost:4000

# Optional: Auto-login credentials
AUTO_LOGIN_EMAIL=user@example.com
AUTO_LOGIN_PASSWORD=password123

# Optional: Pre-set auth token
AUTH_TOKEN=jwt-token-here
```

### Configuration Object

```typescript
interface AgentConfig {
  apiBaseUrl: string;           // Backend API URL
  authToken?: string;           // JWT token for authentication
  mistralApiKey: string;        // Mistral API key for LLM
  model?: string;               // Model name (default: mistral-large-latest)
  userRole?: UserRole;          // User role for access control
  timeout?: number;             // Request timeout in ms (default: 30000)
  maxRetries?: number;          // Max retry attempts (default: 3)
  debug?: boolean;              // Enable debug logging
  autoLogin?: {                 // Auto-login credentials
    email: string;
    password: string;
  };
}
```

---

## Access Control

### Role-Based Access

| Agent | ADMIN | OPERATOR | CARRIER | DRIVER |
|-------|:-----:|:--------:|:-------:|:------:|
| Orchestration Agent | ✅ | ✅ | ✅ | ✅ |
| Booking Agent | ✅ | ✅ | ✅ | ❌ |
| Slots Availability Agent | ✅ | ✅ | ✅ | ❌ |

### Role Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all agents and terminal management |
| **OPERATOR** | View terminal availability, manage booking approvals |
| **CARRIER** | Check slot availability, create/manage own bookings |
| **DRIVER** | Limited access (no agent interaction) |

---

## API Reference

### Orchestrator API

```typescript
class Orchestrator {
  constructor(options: OrchestratorOptions);
  
  // Initialize the orchestrator (required before use)
  initialize(): Promise<{ success: boolean; error?: string }>;
  
  // Process a request through the 6-step pipeline
  process(request: OrchestratorRequest): Promise<OrchestratorResponse>;
  
  // Set authentication token
  setAuthToken(token: string): void;
  
  // Set user role for output formatting
  setUserRole(role: UserRole): void;
  
  // Get the agent bridge for direct access
  getAgentBridge(): AgentBridge;
}
```

### Booking Agent API

```typescript
class BookingAgent {
  constructor(options: BookingAgentOptions);
  
  // Send a message and get response (non-streaming)
  chat(userMessage: string): Promise<AgentResponse>;
  
  // Send a message and stream the response
  chatStream(userMessage: string): AsyncGenerator<string, AgentResponse>;
  
  // Set authentication token
  setAuthToken(token: string): void;
  
  // Clear conversation history
  clearHistory(): void;
  
  // Get conversation history
  getHistory(): CoreMessage[];
}
```

### Slots Availability Agent API

```typescript
class SlotAvailabilityAgent {
  constructor(options: SlotAvailabilityAgentOptions);
  
  // Initialize agent (handles auto-login)
  initialize(): Promise<{ success: boolean; error?: string }>;
  
  // Check if authenticated
  isAuthenticated(): boolean;
  
  // Send a message and get response
  chat(userMessage: string): Promise<AgentResponse>;
  
  // Send a message and stream the response
  chatStream(userMessage: string): AsyncGenerator<string, AgentResponse>;
  
  // Set authentication token
  setAuthToken(token: string): void;
  
  // Set user role for access control
  setUserRole(role: UserRole): void;
  
  // Clear conversation history
  clearHistory(): void;
}
```

---

## Getting Started

### 1. Installation

```bash
# Install all agents (from project root)
cd agents/booking-agent && npm install
cd ../slots-availability-agent && npm install
cd ../orchestration-agent && npm install
```

### 2. Configure Environment

Create `.env` files in each agent directory:

```env
MISTRAL_API_KEY=your_mistral_api_key
API_BASE_URL=http://localhost:4000
AUTO_LOGIN_EMAIL=carrier@portflow.com
AUTO_LOGIN_PASSWORD=carrier123
```

### 3. Start Backend

```bash
cd backend-express
npm run dev
```

### 4. Test Individual Agents

```bash
# Test Booking Agent (from project root)
cd agents/booking-agent
npm run test

# Test Slots Agent (from project root)
cd agents/slots-availability-agent
npm run dev

# Test Orchestrator (from project root)
cd agents/orchestration-agent
npx tsx test-orchestrator.ts
```

### 5. Use in Application

```typescript
import { Orchestrator } from 'orchestration-agent';

// Create and initialize orchestrator
const orchestrator = new Orchestrator({
  userRole: 'CARRIER',
  debug: true,
});

await orchestrator.initialize();

// Process natural language requests
const response = await orchestrator.process({
  message: 'Book a slot at Terminal A for tomorrow at 10 AM',
  userRole: 'CARRIER',
});

if (response.success) {
  console.log(response.output);
} else {
  console.error(response.error);
}
```

---

## Project Structure

```
agents/
├── AI-AGENTS-DOCUMENTATION.md   # This documentation file
│
├── orchestration-agent/
│   ├── src/
│   │   ├── orchestrator.ts      # Main orchestrator class
│   │   ├── config.ts            # Configuration management
│   │   ├── schemas.ts           # Zod schemas for type safety
│   │   ├── agents/
│   │   │   └── agent-bridge.ts  # Connects to Booking & Slots agents
│   │   └── pipeline/
│   │       ├── step1-sanitization.ts
│   │       ├── step2-classification.ts
│   │       ├── step3-decomposition.ts
│   │       ├── step4-tool-calling.ts
│   │       ├── step5-synthesis.ts
│   │       └── step6-validation.ts
│   └── package.json
│
├── booking-agent/
│   ├── src/
│   │   ├── agent.ts             # Main booking agent class
│   │   ├── api-client.ts        # HTTP client for backend
│   │   ├── config.ts            # Configuration
│   │   ├── schemas.ts           # Zod schemas
│   │   ├── tools.ts             # AI SDK tool definitions
│   │   └── trpc.ts              # tRPC integration
│   └── package.json
│
└── slots-availability-agent/
    ├── src/
    │   ├── agent.ts             # Main slots agent class
    │   ├── api-client.ts        # HTTP client for backend
    │   ├── config.ts            # Configuration with access control
    │   ├── schemas.ts           # Zod schemas
    │   └── tools.ts             # AI SDK tool definitions
    └── package.json
```

---

## Security Features

### Prompt Injection Protection

The orchestration agent includes comprehensive prompt injection detection:

- Direct instruction overrides detection
- System prompt extraction attempts
- Role manipulation detection
- Delimiter injection detection
- Data exfiltration attempt detection

### Confidentiality Guardrails

Step 6 validation includes:

- **PII Detection**: Email, phone, SSN, credit cards
- **Credential Detection**: Passwords, API keys, tokens
- **Internal Data Removal**: System internals, debug info
- **Sensitive Field Masking**: Automatic redaction

---

## License

MIT

---

*Documentation generated for Port Flow AI Agents v1.0*
