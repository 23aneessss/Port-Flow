import { generateText, streamText, CoreMessage } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { createSlotAvailabilityTools, type SlotAvailabilityTools } from './tools.js';
import { ApiClient } from './api-client.js';
import { createConfig, hasAccess, type AgentConfig, type UserRole } from './config.js';

const SYSTEM_PROMPT = `You are the Slot Availability Agent for Port Flow, a port terminal management system. You possess deep knowledge of the capacity engine's current state and can answer nuanced questions about terminal space, equipment constraints, and peak-hour restrictions.

Your Expertise:
1. **Terminal Capacity**: Understand current slot availability, utilization rates, and capacity trends
2. **Equipment Constraints**: Know about operational limitations like crane availability, equipment maintenance windows, and personnel shifts
3. **Peak-Hour Analysis**: Identify high-demand periods and provide recommendations for optimal booking times
4. **Slot Optimization**: Help users find the best available slots based on their requirements

What You Can Do:
- Check real-time slot availability across all terminals or specific terminals
- Analyze booking patterns to identify peak and off-peak hours
- Provide capacity utilization insights and trends
- Recommend optimal booking times based on current and historical data
- Explain equipment constraints and their impact on availability
- Help understand terminal-specific restrictions and requirements
- Create new terminals (Admin only)

When Answering Questions:
- Always provide context about capacity utilization (percentage, status)
- Explain peak hour implications when relevant
- Offer practical recommendations for better slot availability
- If a terminal is full, suggest alternatives (other terminals, off-peak times)
- Be specific with numbers and percentages when discussing capacity

Status Meanings:
- ACTIVE: Terminal is operational and accepting bookings
- SUSPENDED: Terminal is temporarily unavailable

Utilization Levels:
- LOW (< 50%): Many slots available, ideal booking time
- MODERATE (50-80%): Good availability, book within 24 hours recommended
- HIGH (> 80%): Limited slots, book immediately or consider alternatives
- FULL (100%): No slots available, suggest alternatives

Be helpful, data-driven, and provide actionable insights. When equipment constraints or peak-hour restrictions apply, explain them clearly.`;

export interface SlotAvailabilityAgentOptions {
  config?: Partial<AgentConfig>;
  authToken?: string;
  userRole?: UserRole;
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
 * The Slot Availability Agent provides deep knowledge of the capacity engine's current state.
 * It can answer nuanced questions about terminal space, equipment constraints, and peak-hour restrictions.
 * 
 * Accessible by: ADMIN, OPERATOR, CARRIER
 * Not accessible by: DRIVER
 */
export class SlotAvailabilityAgent {
  private config: AgentConfig;
  private apiClient: ApiClient;
  private tools: SlotAvailabilityTools;
  private conversationHistory: CoreMessage[] = [];
  private userRole?: UserRole;
  private initialized: boolean = false;

  constructor(options: SlotAvailabilityAgentOptions = {}) {
    this.config = createConfig(options.config);
    this.userRole = options.userRole || options.config?.userRole;

    // Check access control
    if (this.userRole && !hasAccess(this.userRole)) {
      throw new Error(
        `Access denied: Role "${this.userRole}" is not allowed to use the Slot Availability Agent. ` +
        `Allowed roles: ADMIN, OPERATOR, CARRIER`
      );
    }

    if (options.authToken) {
      this.config.authToken = options.authToken;
    }

    this.apiClient = new ApiClient(this.config);
    this.tools = createSlotAvailabilityTools(this.apiClient);
  }

  /**
   * Initialize the agent - performs auto-login if configured and no token is present
   * Call this before using the agent to ensure authentication is set up
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    if (this.initialized) {
      return { success: true };
    }

    // If we already have a token, we're good
    if (this.apiClient.getAuthToken()) {
      this.initialized = true;
      return { success: true };
    }

    // Try auto-login if configured
    if (this.config.autoLogin) {
      const { email, password } = this.config.autoLogin;
      const result = await this.apiClient.login(email, password);
      
      if (result.success) {
        this.initialized = true;
        return { success: true };
      } else {
        return { success: false, error: `Auto-login failed: ${result.error}` };
      }
    }

    // No token and no auto-login configured
    this.initialized = true;
    return { success: true };
  }

  /**
   * Check if the agent is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.apiClient.getAuthToken();
  }

  /**
   * Set the authentication token for API requests
   */
  setAuthToken(token: string) {
    this.config.authToken = token;
    this.apiClient.setAuthToken(token);
  }

  /**
   * Set the user role for access control
   */
  setUserRole(role: UserRole) {
    if (!hasAccess(role)) {
      throw new Error(
        `Access denied: Role "${role}" is not allowed to use the Slot Availability Agent. ` +
        `Allowed roles: ADMIN, OPERATOR, CARRIER`
      );
    }
    this.userRole = role;
  }

  /**
   * Get the current user role
   */
  getUserRole(): UserRole | undefined {
    return this.userRole;
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
    // Validate access before processing
    if (this.userRole && !hasAccess(this.userRole)) {
      return {
        text: `Access denied: Role "${this.userRole}" is not allowed to use the Slot Availability Agent.`,
      };
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Add role context to the system prompt if available
    const contextualizedPrompt = this.userRole
      ? `${SYSTEM_PROMPT}\n\nCurrent user role: ${this.userRole}. ${this.getRoleContext()}`
      : SYSTEM_PROMPT;

    const { text, toolCalls, toolResults } = await generateText({
      model: mistral(this.config.model || 'mistral-large-latest'),
      system: contextualizedPrompt,
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
    // Validate access before processing
    if (this.userRole && !hasAccess(this.userRole)) {
      const errorMessage = `Access denied: Role "${this.userRole}" is not allowed to use the Slot Availability Agent.`;
      yield errorMessage;
      return { text: errorMessage };
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Add role context to the system prompt if available
    const contextualizedPrompt = this.userRole
      ? `${SYSTEM_PROMPT}\n\nCurrent user role: ${this.userRole}. ${this.getRoleContext()}`
      : SYSTEM_PROMPT;

    const result = streamText({
      model: mistral(this.config.model || 'mistral-large-latest'),
      system: contextualizedPrompt,
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
   * Get role-specific context for the system prompt
   */
  private getRoleContext(): string {
    switch (this.userRole) {
      case 'ADMIN':
        return 'As an Admin, you have full access including creating terminals and viewing all capacity data.';
      case 'OPERATOR':
        return 'As an Operator, you can view terminal availability and help manage booking capacity.';
      case 'CARRIER':
        return 'As a Carrier, you can check slot availability to plan your bookings effectively.';
      default:
        return '';
    }
  }
}

/**
 * Factory function to create a new Slot Availability Agent
 */
export function createSlotAvailabilityAgent(
  options: SlotAvailabilityAgentOptions = {}
): SlotAvailabilityAgent {
  return new SlotAvailabilityAgent(options);
}
