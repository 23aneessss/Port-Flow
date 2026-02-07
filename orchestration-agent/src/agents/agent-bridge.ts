/**
 * Agent Bridge - Connects the Orchestrator to the actual AI Agents
 * 
 * This module provides the integration layer between the orchestrator
 * and the Booking Agent + Slots Availability Agent.
 */

// Import from linked sibling packages
import { BookingAgent, type BookingAgentOptions } from 'booking-agent';
import { SlotAvailabilityAgent, type SlotAvailabilityAgentOptions } from 'slots-availability-agent';
import type { OrchestratorConfig, UserRole } from '../config.js';
import type { Task, ToolCallResult } from '../schemas.js';

/**
 * Agent response type
 */
interface AgentResponse {
  text: string;
  toolCalls?: Array<{
    toolName: string;
    args: unknown;
    result: unknown;
  }>;
}

/**
 * Agent Bridge manages the lifecycle and communication with AI agents
 */
export class AgentBridge {
  private bookingAgent: BookingAgent | null = null;
  private slotsAgent: SlotAvailabilityAgent | null = null;
  private config: OrchestratorConfig;
  private initialized: boolean = false;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  /**
   * Initialize the agents with authentication
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    if (this.initialized) {
      return { success: true };
    }

    try {
      // Create Booking Agent
      this.bookingAgent = new BookingAgent({
        config: {
          apiBaseUrl: this.config.apiBaseUrl,
          mistralApiKey: this.config.mistralApiKey,
          model: this.config.model,
        },
        authToken: this.config.authToken,
      });

      // Create Slots Availability Agent
      this.slotsAgent = new SlotAvailabilityAgent({
        config: {
          apiBaseUrl: this.config.apiBaseUrl,
          mistralApiKey: this.config.mistralApiKey,
          model: this.config.model,
          userRole: this.config.userRole,
          autoLogin: this.config.autoLogin,
        },
        authToken: this.config.authToken,
        userRole: this.config.userRole,
      });

      // Initialize slots agent (handles auto-login)
      const slotsInit = await this.slotsAgent.initialize();
      if (!slotsInit.success) {
        return { success: false, error: slotsInit.error };
      }

      // Share the auth token with booking agent if obtained via auto-login
      if (this.slotsAgent.isAuthenticated()) {
        // Get token from slots agent and set it on booking agent
        const apiClient = (this.slotsAgent as any).apiClient;
        const token = apiClient?.getAuthToken?.();
        if (token) {
          this.bookingAgent.setAuthToken(token);
          this.config.authToken = token;
        }
      }

      this.initialized = true;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Agent initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set authentication token on all agents
   */
  setAuthToken(token: string) {
    this.config.authToken = token;
    if (this.bookingAgent) {
      this.bookingAgent.setAuthToken(token);
    }
    if (this.slotsAgent) {
      this.slotsAgent.setAuthToken(token);
    }
  }

  /**
   * Set user role on agents that support it
   */
  setUserRole(role: UserRole) {
    this.config.userRole = role;
    if (this.slotsAgent) {
      this.slotsAgent.setUserRole(role);
    }
  }

  /**
   * Execute a task using the appropriate agent
   */
  async executeTask(task: Task): Promise<ToolCallResult> {
    const startTime = Date.now();

    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return {
          taskId: task.id,
          toolName: task.toolName,
          success: false,
          error: initResult.error,
          duration: Date.now() - startTime,
          retryAttempt: task.retryCount,
        };
      }
    }

    try {
      let response: AgentResponse;

      // Build message from task
      const message = this.buildTaskMessage(task);

      if (task.agent === 'booking_agent') {
        if (!this.bookingAgent) {
          throw new Error('Booking agent not initialized');
        }
        response = await this.bookingAgent.chat(message);
      } else if (task.agent === 'slots_agent') {
        if (!this.slotsAgent) {
          throw new Error('Slots agent not initialized');
        }
        response = await this.slotsAgent.chat(message);
      } else {
        throw new Error(`Unknown agent type: ${task.agent}`);
      }

      // Extract relevant tool call result
      const relevantToolCall = response.toolCalls?.find(
        tc => tc.toolName === task.toolName || this.isRelatedTool(tc.toolName, task.toolName)
      );

      return {
        taskId: task.id,
        toolName: task.toolName,
        success: true,
        data: relevantToolCall?.result || { 
          text: response.text,
          toolCalls: response.toolCalls,
        },
        duration: Date.now() - startTime,
        retryAttempt: task.retryCount,
      };

    } catch (error) {
      return {
        taskId: task.id,
        toolName: task.toolName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        retryAttempt: task.retryCount,
      };
    }
  }

  /**
   * Build a natural language message from a task
   */
  private buildTaskMessage(task: Task): string {
    const args = task.toolArgs;
    let message = task.description;

    // Add all available parameters to the message
    if (args.terminalId) {
      message += `. Terminal ID: ${args.terminalId}`;
    }
    if (args.terminalName) {
      message += `. Terminal: ${args.terminalName}`;
    }
    if (args.bookingId) {
      message += `. Booking ID: ${args.bookingId}`;
    }
    if (args.date) {
      message += `. Date: ${args.date}`;
    }
    if (args.timeSlot) {
      message += `. Time slot: ${args.timeSlot}`;
    }
    if (args.startTime) {
      message += `. Start time: ${args.startTime}`;
    }
    if (args.endTime) {
      message += `. End time: ${args.endTime}`;
    }
    if (args.driverUserId) {
      message += `. Driver ID: ${args.driverUserId}`;
    }
    if (args.status) {
      message += `. Filter by status: ${args.status}`;
    }
    
    // Add any other args that haven't been handled explicitly
    const handledKeys = ['terminalId', 'terminalName', 'bookingId', 'date', 'timeSlot', 'startTime', 'endTime', 'driverUserId', 'status'];
    for (const [key, value] of Object.entries(args)) {
      if (!handledKeys.includes(key) && value !== undefined && value !== null) {
        message += `. ${key}: ${value}`;
      }
    }

    return message;
  }

  /**
   * Check if tool names are related (for matching results)
   */
  private isRelatedTool(actual: string, expected: string): boolean {
    const toolMappings: Record<string, string[]> = {
      getSlotAvailability: ['getAllTerminals', 'getTerminalById', 'getCarrierBookings'],
      getTerminalById: ['getAllTerminals'],
      listBookings: ['getMyBookings', 'getCarrierBookings', 'getOperatorBookings'],
      listMyBookings: ['getMyBookings', 'getCarrierBookings'],
    };

    return toolMappings[expected]?.includes(actual) || false;
  }

  /**
   * Clear conversation history on all agents
   */
  clearHistory() {
    if (this.bookingAgent) {
      this.bookingAgent.clearHistory();
    }
    if (this.slotsAgent) {
      this.slotsAgent.clearHistory();
    }
  }

  /**
   * Get the booking agent instance (for direct access)
   */
  getBookingAgent(): BookingAgent | null {
    return this.bookingAgent;
  }

  /**
   * Get the slots agent instance (for direct access)
   */
  getSlotsAgent(): SlotAvailabilityAgent | null {
    return this.slotsAgent;
  }
}

/**
 * Create an agent bridge instance
 */
export function createAgentBridge(config: OrchestratorConfig): AgentBridge {
  return new AgentBridge(config);
}
