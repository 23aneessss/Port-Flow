import { z } from 'zod';
import { router, protectedProcedure } from './trpc.js';
import { BookingAgent } from './booking-agent.js';
import type { AuthUser } from './trpc.js';

// Session storage for agents (in production, consider Redis)
const agentSessions = new Map<string, { agent: BookingAgent; lastAccess: number }>();

// Session timeout: 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Generate a unique session ID
 */
function generateSessionId(userId: string): string {
  return `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create an agent for a user session
 */
function getAgent(sessionId: string, user: AuthUser, token: string): BookingAgent {
  const existing = agentSessions.get(sessionId);
  
  if (existing) {
    existing.lastAccess = Date.now();
    existing.agent.setAuthToken(token);
    return existing.agent;
  }

  const agent = new BookingAgent({
    apiBaseUrl: `http://localhost:${process.env.PORT || 4000}`,
    authToken: token,
    userContext: {
      userId: user.id,
      role: user.role,
    },
  });

  agentSessions.set(sessionId, { agent, lastAccess: Date.now() });
  return agent;
}

/**
 * Clean up expired sessions periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of agentSessions.entries()) {
    if (now - session.lastAccess > SESSION_TIMEOUT) {
      agentSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Input/Output schemas
const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sessionId: z.string().optional(),
});

const ChatOutputSchema = z.object({
  text: z.string(),
  sessionId: z.string(),
  toolCalls: z.array(z.object({
    toolName: z.string(),
    args: z.unknown(),
    result: z.unknown(),
  })).optional(),
});

export const agentRouter = router({
  /**
   * Send a message to the booking agent
   */
  chat: protectedProcedure
    .input(ChatInputSchema)
    .output(ChatOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const sessionId = input.sessionId || generateSessionId(ctx.user.id);
      const agent = getAgent(sessionId, ctx.user, ctx.token);

      try {
        const response = await agent.chat(input.message);

        return {
          text: response.text,
          sessionId,
          toolCalls: response.toolCalls,
        };
      } catch (error) {
        console.error('Agent chat error:', error);
        return {
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          sessionId,
          toolCalls: [],
        };
      }
    }),

  /**
   * Clear a chat session
   */
  clearSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => {
      agentSessions.delete(input.sessionId);
      return { success: true };
    }),

  /**
   * Get conversation history for a session
   */
  getHistory: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const session = agentSessions.get(input.sessionId);
      if (!session) {
        return { messages: [] };
      }
      return { messages: session.agent.getHistory() };
    }),

  /**
   * Get active sessions for current user
   */
  getActiveSessions: protectedProcedure
    .query(({ ctx }) => {
      const userSessions: string[] = [];
      for (const sessionId of agentSessions.keys()) {
        if (sessionId.startsWith(ctx.user.id)) {
          userSessions.push(sessionId);
        }
      }
      return { sessions: userSessions };
    }),
});

export type AgentRouter = typeof agentRouter;
