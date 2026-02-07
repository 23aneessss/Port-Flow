/**
 * AI Agent Orchestrator for Port Flow
 * 
 * This orchestrator coordinates multiple AI agents (Booking Agent, Slots Availability Agent)
 * through a 6-step pipeline:
 * 
 * 1. Input Sanitization - Normalize, validate, detect prompt injection
 * 2. Intent Classification - Classify into bookings/slots_availability
 * 3. Task Decomposition - Break into sub-tasks with dependencies
 * 4. Tool Calling - Execute via Agent Bridge with retry/timeout handling
 * 5. Output Synthesis - Role-based response formatting
 * 6. Output Validation - Confidentiality guardrails
 */

import { createConfig, type OrchestratorConfig, type UserRole } from './config.js';
import { AgentBridge, createAgentBridge } from './agents/agent-bridge.js';
import {
  sanitizeInput,
  classifyIntent,
  decomposeTasks,
  executeToolCalls,
  synthesizeOutput,
  validateOutput,
  setAgentBridge,
  type OrchestratorRequest,
  type OrchestratorResponse,
  type ValidatedOutput,
  type SanitizedInput,
  type IntentClassification,
  type TaskPlan,
  type AggregatedResponse,
} from './pipeline/index.js';

/**
 * Pipeline step tracking
 */
interface PipelineState {
  requestId: string;
  startTime: number;
  steps: string[];
  sanitizedInput?: SanitizedInput;
  classification?: IntentClassification;
  taskPlan?: TaskPlan;
  aggregatedResponse?: AggregatedResponse;
}

/**
 * Orchestrator options
 */
export interface OrchestratorOptions {
  config?: Partial<OrchestratorConfig>;
  authToken?: string;
  userRole?: UserRole;
  debug?: boolean;
}

/**
 * The main AI Agent Orchestrator class
 */
export class Orchestrator {
  private config: OrchestratorConfig;
  private userRole: UserRole;
  private debug: boolean;
  private initialized: boolean = false;
  private agentBridge: AgentBridge;

  constructor(options: OrchestratorOptions = {}) {
    this.config = createConfig(options.config);
    this.userRole = options.userRole || options.config?.userRole || 'CARRIER';
    this.debug = options.debug ?? options.config?.debug ?? false;

    if (options.authToken) {
      this.config.authToken = options.authToken;
    }
    
    // Create agent bridge
    this.agentBridge = createAgentBridge(this.config);
    
    // Set the global agent bridge for the pipeline
    setAgentBridge(this.agentBridge);
  }

  /**
   * Initialize the orchestrator (perform auto-login if configured)
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    if (this.initialized) {
      return { success: true };
    }

    try {
      // Initialize the agent bridge (handles auto-login via slots agent)
      const bridgeInit = await this.agentBridge.initialize();
      if (!bridgeInit.success) {
        return { success: false, error: bridgeInit.error };
      }

      this.initialized = true;
      if (this.debug) {
        console.log('[Orchestrator] Initialized successfully with agent bridge');
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set the authentication token
   */
  setAuthToken(token: string) {
    this.config.authToken = token;
    this.agentBridge.setAuthToken(token);
  }

  /**
   * Set the user role for output formatting
   */
  setUserRole(role: UserRole) {
    this.userRole = role;
    this.agentBridge.setUserRole(role);
  }

  /**
   * Get the agent bridge for direct access
   */
  getAgentBridge(): AgentBridge {
    return this.agentBridge;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
  }

  /**
   * Log debug information
   */
  private log(step: string, data: unknown) {
    if (this.debug) {
      console.log(`[Orchestrator] ${step}:`, JSON.stringify(data, null, 2));
    }
  }

  /**
   * Main orchestration method - processes a request through the full pipeline
   */
  async process(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const state: PipelineState = {
      requestId: this.generateRequestId(),
      startTime: Date.now(),
      steps: [],
    };

    try {
      // Ensure initialized
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return {
            success: false,
            error: initResult.error,
          };
        }
      }

      // Get user role from request or use default
      const userRole = request.userRole || this.userRole;

      // ============ STEP 1: Input Sanitization ============
      state.steps.push('sanitization');
      this.log('Step 1', { input: request.message });

      const sanitizationResult = sanitizeInput(request.message, {
        userId: request.userId,
        userRole,
        sessionId: request.sessionId,
        strictMode: false,
      });

      if (!sanitizationResult.success || !sanitizationResult.sanitizedInput) {
        return {
          success: false,
          error: sanitizationResult.error || 'Sanitization failed',
          debug: this.debug ? { sanitizedInput: undefined } : undefined,
        };
      }

      state.sanitizedInput = sanitizationResult.sanitizedInput;
      this.log('Step 1 Complete', {
        containedInjection: state.sanitizedInput.containedInjectionAttempt,
        removedPatterns: state.sanitizedInput.removedPatterns,
      });

      // ============ STEP 2: Intent Classification ============
      state.steps.push('classification');
      this.log('Step 2', { text: state.sanitizedInput.sanitizedText });

      const classificationResult = await classifyIntent(state.sanitizedInput, {
        model: this.config.model,
        useHeuristics: true,
        confidenceThreshold: 0.7,
      });

      if (!classificationResult.success || !classificationResult.classification) {
        return {
          success: false,
          error: classificationResult.error || 'Classification failed',
          debug: this.debug
            ? {
                sanitizedInput: state.sanitizedInput,
                intentClassification: undefined,
              }
            : undefined,
        };
      }

      state.classification = classificationResult.classification;
      this.log('Step 2 Complete', {
        intent: state.classification.primaryIntent,
        confidence: state.classification.confidence,
        entities: state.classification.extractedEntities,
      });

      // Handle clarification if needed
      if (state.classification.requiresClarification) {
        // Return a clarification response without proceeding
        const clarificationOutput: ValidatedOutput = {
          output: {
            type: 'carrier',
            message: state.classification.clarificationQuestion || 'Could you please clarify your request?',
            summary: 'Clarification needed',
            nextSteps: ['Please provide more details about what you need'],
            warnings: [],
          },
          confidentialityCheck: {
            passed: true,
            violations: [],
            redactedFields: [],
          },
          metadata: {
            requestId: state.requestId,
            processingTime: Date.now() - state.startTime,
            pipelineSteps: state.steps,
            timestamp: new Date().toISOString(),
          },
        };

        return {
          success: true,
          output: clarificationOutput,
          debug: this.debug
            ? {
                sanitizedInput: state.sanitizedInput,
                intentClassification: state.classification,
              }
            : undefined,
        };
      }

      // ============ STEP 3: Task Decomposition ============
      state.steps.push('decomposition');
      this.log('Step 3', { intent: state.classification.primaryIntent });

      const decompositionResult = decomposeTasks(state.classification, {
        maxTasks: 10,
        includePreflightChecks: true,
      });

      if (!decompositionResult.success || !decompositionResult.taskPlan) {
        return {
          success: false,
          error: decompositionResult.error || 'Task decomposition failed',
          debug: this.debug
            ? {
                sanitizedInput: state.sanitizedInput,
                intentClassification: state.classification,
                taskPlan: undefined,
              }
            : undefined,
        };
      }

      state.taskPlan = decompositionResult.taskPlan;
      this.log('Step 3 Complete', {
        planId: state.taskPlan.planId,
        taskCount: state.taskPlan.tasks.length,
        executionOrder: state.taskPlan.executionOrder,
      });

      // ============ STEP 4: Tool Calling via tRPC ============
      state.steps.push('tool_calling');
      this.log('Step 4', { tasks: state.taskPlan.tasks.map(t => t.name) });

      const toolCallingResult = await executeToolCalls(state.taskPlan, this.config, {
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
      });

      if (!toolCallingResult.success || !toolCallingResult.aggregatedResponse) {
        return {
          success: false,
          error: toolCallingResult.error || 'Tool calling failed',
          debug: this.debug
            ? {
                sanitizedInput: state.sanitizedInput,
                intentClassification: state.classification,
                taskPlan: state.taskPlan,
                aggregatedResponse: undefined,
              }
            : undefined,
        };
      }

      state.aggregatedResponse = toolCallingResult.aggregatedResponse;
      this.log('Step 4 Complete', {
        success: state.aggregatedResponse.success,
        completed: state.aggregatedResponse.completedTasks.length,
        failed: state.aggregatedResponse.failedTasks.length,
      });

      // ============ STEP 5: Output Synthesis ============
      state.steps.push('synthesis');
      this.log('Step 5', { userRole, intent: state.classification.primaryIntent });

      const synthesisResult = await synthesizeOutput(
        state.aggregatedResponse,
        userRole,
        {
          model: this.config.model,
          useLLM: true,
          intent: state.classification.primaryIntent,
        }
      );

      if (!synthesisResult.success || !synthesisResult.output) {
        return {
          success: false,
          error: synthesisResult.error || 'Output synthesis failed',
          debug: this.debug
            ? {
                sanitizedInput: state.sanitizedInput,
                intentClassification: state.classification,
                taskPlan: state.taskPlan,
                aggregatedResponse: state.aggregatedResponse,
              }
            : undefined,
        };
      }

      this.log('Step 5 Complete', { outputType: synthesisResult.output.type });

      // ============ STEP 6: Output Validation ============
      state.steps.push('validation');
      this.log('Step 6', { checking: 'confidentiality' });

      const validationResult = validateOutput(
        synthesisResult.output,
        state.requestId,
        state.steps,
        state.startTime,
        {
          debug: this.debug,
          strictMode: false,
        }
      );

      if (!validationResult.success || !validationResult.validatedOutput) {
        return {
          success: false,
          error: validationResult.error || 'Output validation failed',
          debug: this.debug
            ? {
                sanitizedInput: state.sanitizedInput,
                intentClassification: state.classification,
                taskPlan: state.taskPlan,
                aggregatedResponse: state.aggregatedResponse,
              }
            : undefined,
        };
      }

      this.log('Step 6 Complete', {
        passed: validationResult.validatedOutput.confidentialityCheck.passed,
        redacted: validationResult.validatedOutput.confidentialityCheck.redactedFields.length,
      });

      // ============ SUCCESS ============
      return {
        success: true,
        output: validationResult.validatedOutput,
        debug: this.debug
          ? {
              sanitizedInput: state.sanitizedInput,
              intentClassification: state.classification,
              taskPlan: state.taskPlan,
              aggregatedResponse: state.aggregatedResponse,
            }
          : undefined,
      };

    } catch (error) {
      this.log('Pipeline Error', { error: error instanceof Error ? error.message : error });

      return {
        success: false,
        error: `Orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        debug: this.debug
          ? {
              sanitizedInput: state.sanitizedInput,
              intentClassification: state.classification,
              taskPlan: state.taskPlan,
              aggregatedResponse: state.aggregatedResponse,
            }
          : undefined,
      };
    }
  }

  /**
   * Simplified chat interface
   */
  async chat(message: string): Promise<string> {
    const response = await this.process({ message });

    if (!response.success) {
      return `Error: ${response.error}`;
    }

    if (response.output?.output.type === 'carrier') {
      return response.output.output.message;
    }

    // For dashboard output, return a summary
    if (response.output?.output.type === 'dashboard') {
      return response.output.output.summary;
    }

    return 'Request processed successfully.';
  }
}

/**
 * Create a new orchestrator instance
 */
export function createOrchestrator(options: OrchestratorOptions = {}): Orchestrator {
  return new Orchestrator(options);
}
