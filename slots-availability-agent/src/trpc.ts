/**
 * tRPC Adapter for the Slots Availability Agent
 * 
 * This module provides utilities to integrate the SlotAvailabilityAgent with tRPC
 * in the backend-express application.
 */
import { z } from 'zod';
import { SlotAvailabilityAgent, createSlotAvailabilityAgent } from './agent.js';
import type { AgentConfig, UserRole } from './config.js';

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
export class SlotsAgentSessionManager {
  private sessions: Map<string, SlotAvailabilityAgent> = new Map();
  private sessionTimeout: number;
  private config: Partial<AgentConfig>;

  constructor(config: Partial<AgentConfig> = {}, sessionTimeoutMs = 30 * 60 * 1000) {
    this.config = config;
    this.sessionTimeout = sessionTimeoutMs;
  }

  /**
   * Get or create an agent for a session
   */
  getAgent(sessionId: string, authToken?: string, userRole?: UserRole): SlotAvailabilityAgent {
    let agent = this.sessions.get(sessionId);

    if (!agent) {
      agent = createSlotAvailabilityAgent({
        config: this.config,
        authToken,
        userRole,
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
  return `slots_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create tRPC procedure handlers for the slots availability agent
 * 
 * Usage in your tRPC router:
 * ```typescript
 * import { createSlotsAgentProcedures, SlotsAgentSessionManager } from 'slots-availability-agent/trpc';
 * 
 * const sessionManager = new SlotsAgentSessionManager({ apiBaseUrl: 'http://localhost:4000' });
 * const slotsAgentProcedures = createSlotsAgentProcedures(sessionManager);
 * 
 * export const slotsAgentRouter = router({
 *   chat: protectedProcedure
 *     .input(ChatInputSchema)
 *     .mutation(async ({ input, ctx }) => {
 *       return slotsAgentProcedures.chat(input, ctx.authToken, ctx.user.role);
 *     }),
 *   clearSession: protectedProcedure
 *     .input(z.object({ sessionId: z.string() }))
 *     .mutation(async ({ input }) => {
 *       return slotsAgentProcedures.clearSession(input.sessionId);
 *     }),
 *   getHistory: protectedProcedure
 *     .input(z.object({ sessionId: z.string() }))
 *     .query(async ({ input }) => {
 *       return slotsAgentProcedures.getHistory(input.sessionId);
 *     }),
 *   getActiveSessions: protectedProcedure
 *     .query(async () => {
 *       return slotsAgentProcedures.getActiveSessions();
 *     }),
 * });
 * ```
 */
export function createSlotsAgentProcedures(sessionManager: SlotsAgentSessionManager) {
  return {
    /**
     * Handle a chat message
     * Note: userRole is checked for access control (only ADMIN, OPERATOR, CARRIER allowed)
     */
    async chat(input: ChatInput, authToken?: string, userRole?: UserRole): Promise<ChatOutput> {
      const sessionId = input.sessionId || generateSessionId();
      const agent = sessionManager.getAgent(sessionId, authToken, userRole);

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

    /**
     * Get all active session IDs
     */
    getActiveSessions() {
      return {
        sessions: sessionManager.getActiveSessions(),
      };
    },
  };
}

// Re-export agent for convenience
export { SlotAvailabilityAgent, createSlotAvailabilityAgent } from './agent.js';
export type { AgentConfig, UserRole } from './config.js';
