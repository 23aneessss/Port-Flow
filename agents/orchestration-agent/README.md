# AI Agent Orchestrator for Port Flow

A robust AI orchestration layer that coordinates multiple specialized agents (Booking Agent, Slots Availability Agent) through a secure, deterministic 6-step pipeline.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Pipeline Specification](#pipeline-specification)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Example Payloads](#example-payloads)
- [Testing](#testing)
- [Security](#security)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│   │  Step 1  │──▶│  Step 2  │──▶│  Step 3  │──▶│  Step 4  │──▶│  Step 5  │ │
│   │Sanitize  │   │Classify  │   │Decompose │   │Tool Call │   │Synthesize│ │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│                                                      │              │        │
│                                                      ▼              ▼        │
│                                              ┌──────────────┐  ┌──────────┐ │
│                                              │  tRPC Layer  │  │  Step 6  │ │
│                                              └──────────────┘  │ Validate │ │
│                                                      │         └──────────┘ │
│                                         ┌────────────┴────────────┐         │
│                                         ▼                         ▼         │
│                                 ┌──────────────┐         ┌──────────────┐   │
│                                 │Booking Agent │         │Slots Agent   │   │
│                                 │   (tRPC)     │         │   (tRPC)     │   │
│                                 └──────────────┘         └──────────────┘   │
│                                         │                         │         │
│                                         └────────────┬────────────┘         │
│                                                      ▼                      │
│                                              ┌──────────────┐               │
│                                              │   Backend    │               │
│                                              │   (Express)  │               │
│                                              └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Responsibility |
|-----------|---------------|
| **Orchestrator** | Main entry point, coordinates pipeline execution |
| **Sanitizer** | Input normalization, injection detection |
| **Classifier** | Intent detection (hybrid heuristics + LLM) |
| **Decomposer** | Task planning with dependency resolution |
| **Tool Executor** | tRPC calls with retry/timeout handling |
| **Synthesizer** | Role-based output formatting |
| **Validator** | Confidentiality guardrails |

### Data Flow

```
User Request
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Sanitization                                        │
│ - Normalize text (whitespace, unicode)                      │
│ - Detect prompt injection patterns (50+ patterns)           │
│ - Remove unsafe HTML/scripts                                │
│ - Validate required fields                                  │
│ Output: SanitizedInput                                      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Intent Classification                               │
│ - Heuristic classification (fast, deterministic)            │
│ - LLM classification (accurate, for ambiguous cases)        │
│ - Entity extraction (terminal, booking ID, dates)           │
│ - Confidence scoring                                        │
│ Output: IntentClassification                                │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Task Decomposition                                  │
│ - Map intent to task templates                              │
│ - Resolve dependencies between tasks                        │
│ - Compute execution order (topological sort)                │
│ - Estimate duration                                         │
│ Output: TaskPlan                                            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Tool Calling via tRPC                               │
│ - Execute tasks in dependency order                         │
│ - Parallel execution where possible                         │
│ - Retry with exponential backoff                            │
│ - Timeout handling                                          │
│ - Aggregate results from multiple agents                    │
│ Output: AggregatedResponse                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Output Synthesis (Role-Based)                       │
│ - CARRIER: Concise text + next steps                        │
│ - OPERATOR/ADMIN: Dashboard JSON (KPIs, widgets, actions)   │
│ - Handle partial failures gracefully                        │
│ Output: SynthesizedOutput                                   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Output Validation (Confidentiality)                 │
│ - Scan for PII (email, phone, SSN)                          │
│ - Detect credentials (passwords, API keys, tokens)          │
│ - Remove internal system data                               │
│ - Mask or redact sensitive fields                           │
│ Output: ValidatedOutput                                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Final Response to User
```

---

## Pipeline Specification

### Step 1: Input Sanitization

**Purpose:** Normalize input, detect attacks, validate constraints.

**Injection Detection Patterns:**
- Direct instruction overrides: `ignore previous instructions`, `disregard all rules`
- System prompt extraction: `what is your system prompt`, `reveal your instructions`
- Role manipulation: `you are now a hacker`, `pretend to be`
- Delimiter injection: `[SYSTEM]`, `<<SYS>>`, `<|im_start|>`
- Data exfiltration: `dump the database`, `show all api keys`

**Output Schema:**
```typescript
interface SanitizedInput {
  originalInput: string;
  sanitizedText: string;
  detectedLanguage: string;
  containedInjectionAttempt: boolean;
  removedPatterns: string[];
  validationErrors: string[];
  metadata: {
    userId?: string;
    userRole?: UserRole;
    sessionId?: string;
    timestamp: string;
  };
}
```

### Step 2: Intent Classification

**Purpose:** Classify request into `bookings` or `slots_availability`.

**Classification Strategy:**
1. **Heuristic Pass** (fast, deterministic):
   - Pattern matching with weighted keywords
   - Confidence threshold: 0.7
   - If confident, return immediately

2. **LLM Pass** (accurate, for edge cases):
   - Structured output generation
   - Entity extraction
   - Reasoning chain

**Output Schema:**
```typescript
interface IntentClassification {
  primaryIntent: 'bookings' | 'slots_availability' | 'unknown';
  confidence: number; // 0.0 - 1.0
  secondaryIntent?: IntentType;
  requiresClarification: boolean;
  clarificationQuestion?: string;
  extractedEntities: {
    terminalId?: string;
    terminalName?: string;
    bookingId?: string;
    date?: string;
    timeSlot?: string;
    driverId?: string;
    status?: string;
  };
  reasoning: string;
}
```

### Step 3: Task Decomposition

**Purpose:** Break intent into executable sub-tasks with dependencies.

**Task Templates:**

| Intent | Tasks Available |
|--------|----------------|
| `bookings` | createBooking, getBookingStatus, listBookings, cancelBooking, updateBooking, approveBooking, rejectBooking |
| `slots_availability` | getSlotAvailability, getTerminalById, getAllTerminals, getCapacityAnalysis, getPeakHourAnalysis |

**Output Schema:**
```typescript
interface TaskPlan {
  planId: string;
  intent: IntentType;
  tasks: Task[];
  executionOrder: string[]; // Topologically sorted
  estimatedDuration: number;
  createdAt: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  agent: 'booking_agent' | 'slots_agent' | 'orchestrator';
  toolName: string;
  toolArgs: Record<string, unknown>;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  retryCount: number;
  maxRetries: number;
}
```

### Step 4: Tool Calling via tRPC

**Purpose:** Execute tasks against AI agents with robust error handling.

**tRPC Tool Schema Examples:**

```typescript
// Booking Agent - Create Booking
{
  toolName: 'createBooking',
  schema: z.object({
    terminalId: z.string().uuid(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    driverUserId: z.string().uuid(),
  })
}

// Slots Agent - Get Availability
{
  toolName: 'getSlotAvailability',
  schema: z.object({
    terminalId: z.string().uuid().optional(),
    date: z.string().optional(),
  })
}
```

**Retry Policy:**
```typescript
{
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 10000,      // 10 seconds
  backoffMultiplier: 2, // Exponential backoff
  retryableErrors: ['TIMEOUT', 'INTERNAL_SERVER_ERROR', 'SERVICE_UNAVAILABLE']
}
```

**Request/Response Payloads:**
```typescript
// Request to Agent
{
  message: "Create a booking at Terminal A for tomorrow at 10:00 AM",
  sessionId: "orch_abc123_xyz789"
}

// Response from Agent
{
  text: "Booking created successfully",
  sessionId: "orch_abc123_xyz789",
  toolCalls: [{
    toolName: "createBooking",
    args: { terminalId: "...", date: "...", ... },
    result: { bookingId: "...", status: "PENDING", ... }
  }]
}
```

**Aggregated Response:**
```typescript
interface AggregatedResponse {
  success: boolean;
  results: ToolCallResult[];
  partialFailure: boolean;
  failedTasks: string[];
  completedTasks: string[];
}
```

### Step 5: Output Synthesis

**Purpose:** Format output based on user role.

**Carrier Output (Text-based):**
```typescript
interface CarrierOutput {
  type: 'carrier';
  message: string;           // Natural language response
  summary: string;           // One-line summary
  nextSteps: string[];       // Action items
  bookingDetails?: {
    bookingId?: string;
    status?: string;
    terminal?: string;
    timeSlot?: string;
  };
  warnings: string[];
}
```

**Operator/Admin Output (Dashboard-friendly):**
```typescript
interface DashboardOutput {
  type: 'dashboard';
  title: string;
  kpis: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    unit?: string;
  }>;
  widgets: Array<{
    widgetType: 'kpi' | 'table' | 'chart' | 'status' | 'action_list';
    title: string;
    data: unknown;
    priority: 'high' | 'medium' | 'low';
  }>;
  actions: Array<{
    label: string;
    action: string;
    params: Record<string, unknown>;
    priority: 'high' | 'medium' | 'low';
  }>;
  warnings: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  summary: string;
}
```

### Step 6: Output Validation (Confidentiality)

**Purpose:** Final security pass to prevent data leaks.

**Confidentiality Rules:**

| Category | Fields/Patterns | Action |
|----------|----------------|--------|
| CREDENTIALS | password, secret, api_key, auth_token, bearer token, jwt_token | REMOVE |
| PII | email, phone, SSN, credit card | MASK |
| INTERNAL | internal_id, system_id, database_connection, server_address | REMOVE |
| FINANCIAL | bank_account, iban, swift, routing_number | REMOVE |

**Validation Output:**
```typescript
interface ValidatedOutput {
  output: SynthesizedOutput;
  confidentialityCheck: {
    passed: boolean;
    violations: ConfidentialityViolation[];
    redactedFields: string[];
  };
  metadata: {
    requestId: string;
    processingTime: number;
    pipelineSteps: string[];
    timestamp: string;
  };
}
```

---

## Installation

```bash
cd orchestration-agent
npm install
```

## Usage

### Basic Usage

```typescript
import { createOrchestrator } from './src/index.js';

const orchestrator = createOrchestrator({
  authToken: 'your-jwt-token',
  userRole: 'CARRIER',
  debug: true,
});

// Initialize (auto-login if configured)
await orchestrator.initialize();

// Process a request
const response = await orchestrator.process({
  message: 'Book a slot at Terminal A tomorrow at 10:00 AM',
  userRole: 'CARRIER',
});

console.log(response.output);
```

### With Auto-Login

```typescript
const orchestrator = createOrchestrator({
  config: {
    apiBaseUrl: 'http://localhost:4000',
    autoLogin: {
      email: 'carrier@example.com',
      password: 'password123',
    },
  },
  userRole: 'CARRIER',
});

await orchestrator.initialize();
```

### Simple Chat Interface

```typescript
const message = await orchestrator.chat('What slots are available?');
console.log(message);
```

---

## Example Payloads

### 1. Carrier Booking Request

**Input:**
```json
{
  "message": "I need to book a slot at Terminal A for tomorrow at 10:00 AM. Driver ID is abc-123.",
  "userId": "carrier-user-001",
  "userRole": "CARRIER"
}
```

**Output:**
```json
{
  "success": true,
  "output": {
    "output": {
      "type": "carrier",
      "message": "Great news! I've submitted your booking request for Terminal A tomorrow at 10:00 AM. Your booking is currently PENDING approval.",
      "summary": "Booking request submitted for Terminal A",
      "nextSteps": [
        "Wait for operator approval (typically 2-4 hours)",
        "Check your booking status in the dashboard"
      ],
      "bookingDetails": {
        "bookingId": "booking-uuid-12345",
        "status": "PENDING",
        "terminal": "Terminal A",
        "timeSlot": "10:00 AM - 11:00 AM"
      },
      "warnings": []
    },
    "confidentialityCheck": {
      "passed": true,
      "violations": [],
      "redactedFields": []
    }
  }
}
```

### 2. Carrier Slots Availability Request

**Input:**
```json
{
  "message": "What slots are available at Terminal B next week?",
  "userRole": "CARRIER"
}
```

**Output:**
```json
{
  "success": true,
  "output": {
    "output": {
      "type": "carrier",
      "message": "I found several available morning slots at Terminal B for next week...",
      "summary": "15 morning slots available at Terminal B",
      "nextSteps": [
        "Choose your preferred date and time",
        "Book early - morning slots are in high demand"
      ],
      "warnings": ["Terminal B is at 65% capacity"]
    }
  }
}
```

### 3. Operator Dashboard Request

**Input:**
```json
{
  "message": "Show me all pending bookings and current capacity",
  "userRole": "OPERATOR"
}
```

**Output:**
```json
{
  "success": true,
  "output": {
    "output": {
      "type": "dashboard",
      "title": "Operations Overview",
      "kpis": [
        { "label": "Pending Bookings", "value": 12, "trend": "up" },
        { "label": "Overall Utilization", "value": "72%", "unit": "%" }
      ],
      "widgets": [
        {
          "widgetType": "table",
          "title": "Pending Booking Requests",
          "data": [
            { "id": "BK001", "carrier": "ABC Logistics", "terminal": "Terminal A" }
          ],
          "priority": "high"
        }
      ],
      "actions": [
        { "label": "Review Pending Bookings", "action": "navigate", "priority": "high" }
      ],
      "warnings": [
        { "severity": "warning", "message": "Terminal C is at 82% capacity" }
      ],
      "summary": "You have 12 pending bookings awaiting review."
    }
  }
}
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Test Categories

| Category | Focus | Key Tests |
|----------|-------|-----------|
| **Sanitization** | Input safety | Injection detection, XSS prevention, normalization |
| **Classification** | Intent accuracy | Booking vs slots, entity extraction, confidence |
| **Decomposition** | Task planning | Dependency resolution, execution order |
| **Tool Calling** | tRPC correctness | Retry logic, timeout handling, aggregation |
| **Synthesis** | Output formatting | Role-based output, LLM fallback |
| **Validation** | Confidentiality | PII detection, credential masking, redaction |

### Test Plan Outline

```
1. Unit Tests (per step)
   ├── step1-sanitization.test.ts
   │   ├── Valid input processing
   │   ├── Prompt injection detection (50+ patterns)
   │   ├── XSS/HTML removal
   │   └── Edge cases (empty, too long, special chars)
   │
   ├── step2-classification.test.ts
   │   ├── Booking intent accuracy (>95%)
   │   ├── Slots intent accuracy (>95%)
   │   ├── Ambiguous case handling
   │   └── Entity extraction correctness
   │
   ├── step3-decomposition.test.ts
   │   ├── Task generation correctness
   │   ├── Dependency resolution
   │   └── Execution order (topological)
   │
   ├── step4-tool-calling.test.ts (mocked tRPC)
   │   ├── Successful tool calls
   │   ├── Retry on failure
   │   ├── Timeout handling
   │   └── Partial failure aggregation
   │
   ├── step5-synthesis.test.ts
   │   ├── Carrier output format
   │   ├── Dashboard output format
   │   └── Fallback on LLM failure
   │
   └── step6-validation.test.ts
       ├── PII detection (email, phone, SSN)
       ├── Credential detection (passwords, tokens)
       ├── Masking correctness
       └── Clean data pass-through

2. Integration Tests
   ├── Full pipeline (mocked agents)
   ├── Real tRPC calls (staging)
   └── Role-based output verification

3. Security Tests
   ├── Prompt injection resistance
   ├── Confidentiality leak prevention
   └── Rate limiting / abuse prevention
```

---

## Security

### Prompt Injection Resistance

The orchestrator implements multiple layers of defense:

1. **Pattern Detection:** 50+ regex patterns for known injection techniques
2. **Strict Mode:** Optional rejection of any request with detected injection
3. **Input Normalization:** Removes invisible unicode, delimiter markers
4. **LLM Sandboxing:** Agents operate with restricted system prompts

### Confidentiality Guarantees

1. **Field-Level Scanning:** Recursive object traversal
2. **Pattern Matching:** Detect sensitive data in text values
3. **Automatic Redaction:** Mask or remove based on category
4. **Audit Trail:** Log all violations for review

### Best Practices

- Always use authentication tokens
- Enable `strictMode: true` for high-security environments
- Review `confidentialityCheck.violations` in responses
- Regularly update injection patterns

---

## Configuration

```typescript
interface OrchestratorConfig {
  apiBaseUrl: string;        // Default: 'http://localhost:4000'
  authToken?: string;        // JWT token
  mistralApiKey: string;     // Required for LLM calls
  model?: string;            // Default: 'mistral-large-latest'
  userRole?: UserRole;       // ADMIN | OPERATOR | CARRIER | DRIVER
  timeout?: number;          // Default: 30000ms
  maxRetries?: number;       // Default: 3
  debug?: boolean;           // Default: false
  autoLogin?: {
    email: string;
    password: string;
  };
}
```

---

## License

MIT
