/**
 * tRPC Adapter for the Booking Agent
 * 
 * This module provides utilities to integrate the BookingAgent with tRPC
 * in the backend-express application.
 */
import { z } from 'zod';
import { BookingAgent, createBookingAgent } from './agent.js';
import type { AgentConfig } from './config.js';

// Input schema for chat endpoint
export const ChatInputSchema = z.object({
  message: z.string().min(1).describe('The user message to send to the agent'),
  sessionId: z.string().optional().describe('Optional session ID for conversation continuity'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

// Output schema for chat endpoint
export const ChatOutputSchema = z.object({
  text: z.string(),
  toolCalls: z.array(z.object({
    toolName: z.string(),
    args: z.unknown(),
    result: z.unknown(),
  })).optional(),
  sessionId: z.string(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

/**
 * Session manager for maintaining conversation state across requests
 */
export class AgentSessionManager {
  private sessions: Map<string, BookingAgent> = new Map();
  private sessionTimeout: number;
  private config: Partial<AgentConfig>;

  constructor(config: Partial<AgentConfig> = {}, sessionTimeoutMs = 30 * 60 * 1000) {
    this.config = config;
    this.sessionTimeout = sessionTimeoutMs;
  }

  /**
   * Get or create an agent for a session
   */
  getAgent(sessionId: string, authToken?: string): BookingAgent {
    let agent = this.sessions.get(sessionId);

    if (!agent) {
      agent = createBookingAgent({
        config: this.config,
        authToken,
      });
      this.sessions.set(sessionId, agent);
    } else if (authToken) {
      agent.setAuthToken(authToken);
    }

    return agent;
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions.clear();
  }

  /**
   * Get all active session IDs
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create tRPC procedure handlers for the booking agent
 * 
 * Usage in your tRPC router:
 * ```typescript
 * import { createAgentProcedures } from 'booking-agent/trpc';
 * 
 * const sessionManager = new AgentSessionManager({ apiBaseUrl: 'http://localhost:4000' });
 * const agentProcedures = createAgentProcedures(sessionManager);
 * 
 * export const agentRouter = router({
 *   chat: publicProcedure
 *     .input(ChatInputSchema)
 *     .mutation(async ({ input, ctx }) => {
 *       return agentProcedures.chat(input, ctx.authToken);
 *     }),
 *   clearSession: publicProcedure
 *     .input(z.object({ sessionId: z.string() }))
 *     .mutation(async ({ input }) => {
 *       return agentProcedures.clearSession(input.sessionId);
 *     }),
 * });
 * ```
 */
export function createAgentProcedures(sessionManager: AgentSessionManager) {
  return {
    /**
     * Handle a chat message
     */
    async chat(input: ChatInput, authToken?: string): Promise<ChatOutput> {
      const sessionId = input.sessionId || generateSessionId();
      const agent = sessionManager.getAgent(sessionId, authToken);

      const response = await agent.chat(input.message);

      return {
        text: response.text,
        toolCalls: response.toolCalls,
        sessionId,
      };
    },

    /**
     * Clear a session's conversation history
     */
    clearSession(sessionId: string): { success: boolean } {
      sessionManager.removeSession(sessionId);
      return { success: true };
    },

    /**
     * Get conversation history for a session
     */
    getHistory(sessionId: string) {
      const agent = sessionManager.getAgent(sessionId);
      return {
        sessionId,
        messages: agent.getHistory(),
      };
    },
  };
}

export { BookingAgent, createBookingAgent } from './agent.js';
