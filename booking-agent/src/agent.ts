import { generateText, streamText, CoreMessage } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { createBookingTools, type BookingTools } from './tools.js';
import { ApiClient } from './api-client.js';
import { createConfig, type AgentConfig } from './config.js';

const SYSTEM_PROMPT = `You are the Booking Agent for Port Flow, a port terminal management system. Your role is to help users manage their booking appointments at port terminals.

You can:
1. **View Terminals**: List all terminals or get details about a specific terminal
2. **Manage Bookings**: Create, update, cancel, and check the status of bookings
3. **Review Bookings** (as operator): View pending bookings, approve or reject them
4. **Track Bookings**: Answer questions like "Where is my booking #5432?" or "What's the status of booking X?"

When helping users:
- Always confirm important actions before executing (like cancelling or rejecting)
- Provide clear status updates after each action
- If a booking ID is mentioned (e.g., "booking #5432" or "booking 5432"), extract the ID and use it
- For status queries, explain what each status means:
  - PENDING: Awaiting operator approval
  - CONFIRMED: Approved and scheduled
  - REJECTED: Declined by operator
  - CANCELLED: Cancelled by carrier
  - CONSUMED: Completed/used

Be helpful, concise, and professional. If you encounter errors, explain them clearly and suggest alternatives.`;

export interface BookingAgentOptions {
  config?: Partial<AgentConfig>;
  authToken?: string;
}

export interface AgentResponse {
  text: string;
  toolCalls?: Array<{
    toolName: string;
    args: unknown;
    result: unknown;
  }>;
}

/**
 * The Booking Agent handles the transactional lifecycle of appointments.
 * It can create, modify, or cancel bookings and communicate booking status.
 */
export class BookingAgent {
  private config: AgentConfig;
  private apiClient: ApiClient;
  private tools: BookingTools;
  private conversationHistory: CoreMessage[] = [];

  constructor(options: BookingAgentOptions = {}) {
    this.config = createConfig(options.config);
    
    if (options.authToken) {
      this.config.authToken = options.authToken;
    }

    this.apiClient = new ApiClient(this.config);
    this.tools = createBookingTools(this.apiClient);
  }

  /**
   * Set the authentication token for API requests
   */
  setAuthToken(token: string) {
    this.config.authToken = token;
    this.apiClient.setAuthToken(token);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get the conversation history
   */
  getHistory(): CoreMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Send a message to the agent and get a response (non-streaming)
   */
  async chat(userMessage: string): Promise<AgentResponse> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const { text, toolCalls, toolResults } = await generateText({
      model: mistral(this.config.model || 'mistral-large-latest'),
      system: SYSTEM_PROMPT,
      messages: this.conversationHistory,
      tools: this.tools,
      maxSteps: 5, // Allow multiple tool calls in sequence
    });

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: text,
    });

    return {
      text,
      toolCalls: toolCalls?.map((call, index) => ({
        toolName: call.toolName,
        args: call.args,
        result: toolResults?.[index]?.result,
      })),
    };
  }

  /**
   * Send a message and stream the response
   */
  async *chatStream(userMessage: string): AsyncGenerator<string, AgentResponse> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const result = streamText({
      model: mistral(this.config.model || 'mistral-large-latest'),
      system: SYSTEM_PROMPT,
      messages: this.conversationHistory,
      tools: this.tools,
      maxSteps: 5,
    });

    let fullText = '';

    for await (const chunk of result.textStream) {
      fullText += chunk;
      yield chunk;
    }

    // Wait for completion to get tool calls
    const finalResult = await result;
    const toolCalls = await finalResult.toolCalls;
    const toolResults = await finalResult.toolResults;

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: fullText,
    });

    return {
      text: fullText,
      toolCalls: toolCalls?.map((call: { toolName: string; args: unknown }, index: number) => ({
        toolName: call.toolName,
        args: call.args,
        result: toolResults?.[index]?.result,
      })),
    };
  }

  /**
   * Get the available tools (for tRPC integration)
   */
  getTools(): BookingTools {
    return this.tools;
  }

  /**
   * Get the API client (for direct API access if needed)
   */
  getApiClient(): ApiClient {
    return this.apiClient;
  }
}

/**
 * Create a new BookingAgent instance
 */
export function createBookingAgent(options: BookingAgentOptions = {}): BookingAgent {
  return new BookingAgent(options);
}

// Re-export types and utilities
export { createConfig, type AgentConfig } from './config.js';
export { createBookingTools, type BookingTools } from './tools.js';
export { ApiClient } from './api-client.js';
export * from './schemas.js';
