import { generateText, streamText, CoreMessage } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { z } from 'zod';
import { tool } from 'ai';

// ============ Types ============
interface BookingAgentConfig {
  apiBaseUrl: string;
  authToken?: string;
  userContext?: {
    userId: string;
    role: string;
  };
}

interface AgentResponse {
  text: string;
  toolCalls?: Array<{
    toolName: string;
    args: unknown;
    result: unknown;
  }>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ System Prompt ============
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

// ============ API Client ============
class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { success: false, error: error.message || `HTTP ${response.status}` };
      }

      const data = await response.json().catch(() => null);
      return { success: true, data: data as T };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  get<T>(path: string) { return this.request<T>('GET', path); }
  post<T>(path: string, body?: unknown) { return this.request<T>('POST', path, body); }
  put<T>(path: string, body?: unknown) { return this.request<T>('PUT', path, body); }
  delete<T>(path: string) { return this.request<T>('DELETE', path); }
}

// ============ Tool Definitions ============
function createTools(apiClient: ApiClient) {
  const getTerminals = tool({
    description: 'Get a list of all terminals in the port system. Returns terminal details including name, status, available slots, and coordinates.',
    parameters: z.object({}),
    execute: async () => {
      const response = await apiClient.get<unknown[]>('/admin/terminals');
      if (!response.success) return { error: response.error, terminals: [] };
      return { terminals: response.data || [], count: response.data?.length || 0 };
    },
  });

  const getTerminalById = tool({
    description: 'Get detailed information about a specific terminal by its ID.',
    parameters: z.object({
      terminalId: z.string().describe('The unique identifier of the terminal'),
    }),
    execute: async ({ terminalId }) => {
      const response = await apiClient.get<unknown>(`/admin/terminals/${terminalId}`);
      if (!response.success) return { error: response.error, terminal: null };
      return { terminal: response.data };
    },
  });

  const getOperatorBookings = tool({
    description: 'Get all bookings visible to operators. Can filter by status (PENDING, CONFIRMED, REJECTED, CANCELLED, CONSUMED).',
    parameters: z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'CONSUMED']).optional()
        .describe('Filter bookings by status'),
    }),
    execute: async ({ status }) => {
      const query = status ? `?status=${status}` : '';
      const response = await apiClient.get<unknown[]>(`/operator/bookings${query}`);
      if (!response.success) return { error: response.error, bookings: [] };
      return { bookings: response.data || [], count: response.data?.length || 0, filter: status || 'ALL' };
    },
  });

  const approveBooking = tool({
    description: 'Approve a pending booking request. Only works on bookings with PENDING status.',
    parameters: z.object({
      bookingId: z.string().describe('The unique identifier of the booking to approve'),
    }),
    execute: async ({ bookingId }) => {
      const response = await apiClient.post<unknown>(`/operator/bookings/${bookingId}/approve`);
      if (!response.success) return { success: false, error: response.error };
      return { success: true, message: `Booking ${bookingId} has been approved`, booking: response.data };
    },
  });

  const rejectBooking = tool({
    description: 'Reject a pending booking request. Only works on bookings with PENDING status.',
    parameters: z.object({
      bookingId: z.string().describe('The unique identifier of the booking to reject'),
    }),
    execute: async ({ bookingId }) => {
      const response = await apiClient.post<unknown>(`/operator/bookings/${bookingId}/reject`);
      if (!response.success) return { success: false, error: response.error };
      return { success: true, message: `Booking ${bookingId} has been rejected`, booking: response.data };
    },
  });

  const getCarrierBookings = tool({
    description: 'Get all bookings for a specific carrier by their carrier ID.',
    parameters: z.object({
      carrierId: z.string().describe('The unique identifier of the carrier'),
    }),
    execute: async ({ carrierId }) => {
      const response = await apiClient.get<unknown[]>(`/operator/carriers/${carrierId}/bookings`);
      if (!response.success) return { error: response.error, bookings: [] };
      return { bookings: response.data || [], count: response.data?.length || 0, carrierId };
    },
  });

  const createBooking = tool({
    description: 'Create a new booking request. Requires terminal ID, date, time slot, and driver assignment.',
    parameters: z.object({
      terminalId: z.string().describe('The terminal ID where the booking is made'),
      date: z.string().describe('The date of the booking (ISO 8601 format)'),
      startTime: z.string().describe('The start time of the booking slot (ISO 8601 format)'),
      endTime: z.string().describe('The end time of the booking slot (ISO 8601 format)'),
      driverUserId: z.string().describe('The driver user ID assigned to this booking'),
    }),
    execute: async ({ terminalId, date, startTime, endTime, driverUserId }) => {
      const response = await apiClient.post<unknown>('/carrier/bookings', {
        terminalId, date, startTime, endTime, driverUserId,
      });
      if (!response.success) return { success: false, error: response.error };
      return { success: true, message: 'Booking created and is pending approval', booking: response.data };
    },
  });

  const getMyBookings = tool({
    description: 'Get all bookings for the currently authenticated carrier.',
    parameters: z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'CONSUMED']).optional()
        .describe('Filter by booking status'),
    }),
    execute: async ({ status }) => {
      const query = status ? `?status=${status}` : '';
      const response = await apiClient.get<unknown[]>(`/carrier/bookings${query}`);
      if (!response.success) return { error: response.error, bookings: [] };
      return { bookings: response.data || [], count: response.data?.length || 0 };
    },
  });

  const updateBooking = tool({
    description: 'Update an existing booking. Only works on bookings with PENDING status.',
    parameters: z.object({
      bookingId: z.string().describe('The unique identifier of the booking to update'),
      terminalId: z.string().optional().describe('New terminal ID'),
      date: z.string().optional().describe('New date (ISO 8601 format)'),
      startTime: z.string().optional().describe('New start time (ISO 8601 format)'),
      endTime: z.string().optional().describe('New end time (ISO 8601 format)'),
      driverUserId: z.string().optional().describe('New driver user ID'),
    }),
    execute: async ({ bookingId, ...updates }) => {
      const updateData = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
      const response = await apiClient.put<unknown>(`/carrier/bookings/${bookingId}`, updateData);
      if (!response.success) return { success: false, error: response.error };
      return { success: true, message: `Booking ${bookingId} updated`, booking: response.data };
    },
  });

  const cancelBooking = tool({
    description: 'Cancel an existing booking. Only works on bookings with PENDING status.',
    parameters: z.object({
      bookingId: z.string().describe('The unique identifier of the booking to cancel'),
    }),
    execute: async ({ bookingId }) => {
      const response = await apiClient.delete<unknown>(`/carrier/bookings/${bookingId}`);
      if (!response.success) return { success: false, error: response.error };
      return { success: true, message: `Booking ${bookingId} has been cancelled` };
    },
  });

  const getBookingStatus = tool({
    description: 'Check the status of a specific booking by its ID. Useful for "Where is my booking?" queries.',
    parameters: z.object({
      bookingId: z.string().describe('The booking ID to check status for'),
    }),
    execute: async ({ bookingId }) => {
      // Try carrier bookings first
      let response = await apiClient.get<Array<{ id: string; status: string }>>('/carrier/bookings');
      if (response.success && Array.isArray(response.data)) {
        const booking = response.data.find(b => b.id === bookingId);
        if (booking) {
          return { found: true, booking, status: booking.status, message: `Booking ${bookingId} is currently ${booking.status}` };
        }
      }

      // Try operator bookings
      response = await apiClient.get<Array<{ id: string; status: string }>>('/operator/bookings');
      if (response.success && Array.isArray(response.data)) {
        const booking = response.data.find(b => b.id === bookingId);
        if (booking) {
          return { found: true, booking, status: booking.status, message: `Booking ${bookingId} is currently ${booking.status}` };
        }
      }

      return { found: false, message: `Could not find booking with ID ${bookingId}` };
    },
  });

  return {
    getTerminals,
    getTerminalById,
    getOperatorBookings,
    approveBooking,
    rejectBooking,
    getCarrierBookings,
    createBooking,
    getMyBookings,
    updateBooking,
    cancelBooking,
    getBookingStatus,
  };
}

// ============ Booking Agent Class ============
export class BookingAgent {
  private config: BookingAgentConfig;
  private apiClient: ApiClient;
  private tools: ReturnType<typeof createTools>;
  private conversationHistory: CoreMessage[] = [];

  constructor(config: BookingAgentConfig) {
    this.config = config;
    this.apiClient = new ApiClient(config.apiBaseUrl, config.authToken);
    this.tools = createTools(this.apiClient);
  }

  setAuthToken(token: string) {
    this.config.authToken = token;
    this.apiClient.setAuthToken(token);
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory(): CoreMessage[] {
    return [...this.conversationHistory];
  }

  async chat(userMessage: string): Promise<AgentResponse> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const model = process.env.MISTRAL_MODEL || 'mistral-large-latest';
    
    const { text, toolCalls, toolResults } = await generateText({
      model: mistral(model),
      system: SYSTEM_PROMPT,
      messages: this.conversationHistory,
      tools: this.tools,
      maxSteps: 5,
    });

    this.conversationHistory.push({ role: 'assistant', content: text });

    return {
      text,
      toolCalls: toolCalls?.map((call, index) => ({
        toolName: call.toolName,
        args: call.args,
        result: toolResults?.[index]?.result,
      })),
    };
  }

  async *chatStream(userMessage: string): AsyncGenerator<string, AgentResponse> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const model = process.env.MISTRAL_MODEL || 'mistral-large-latest';
    
    const result = streamText({
      model: mistral(model),
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

    const finalResult = await result;
    this.conversationHistory.push({ role: 'assistant', content: fullText });

    return {
      text: fullText,
      toolCalls: finalResult.toolCalls?.map((call, index) => ({
        toolName: call.toolName,
        args: call.args,
        result: finalResult.toolResults?.[index]?.result,
      })),
    };
  }
}
