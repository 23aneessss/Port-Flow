/**
 * Step 4: Tool Calling via Agent Bridge
 * 
 * Responsibilities:
 * - Execute tasks by calling appropriate AI agents directly
 * - Handle retries, timeouts, and error handling
 * - Aggregate multi-agent responses
 * - Maintain idempotency where possible
 */

import type { TaskPlan, Task, ToolCallResult, AggregatedResponse } from '../schemas.js';
import type { OrchestratorConfig } from '../config.js';
import { AgentBridge } from '../agents/agent-bridge.js';

/**
 * Tool execution context
 */
interface ExecutionContext {
  config: OrchestratorConfig;
  agentBridge: AgentBridge;
  sessionId: string;
  results: Map<string, ToolCallResult>;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: string): boolean {
  const retryablePatterns = [
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'network',
    'fetch failed',
    '503',
    '502',
    '500',
  ];
  
  return retryablePatterns.some(pattern => 
    error.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Execute a single task with retry logic
 */
async function executeTaskWithRetry(
  task: Task,
  context: ExecutionContext,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<ToolCallResult> {
  const startTime = Date.now();
  let lastError: string = '';
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Execute via agent bridge
      const result = await context.agentBridge.executeTask(task);
      
      if (result.success) {
        return {
          taskId: task.id,
          toolName: task.toolName,
          success: true,
          data: result.data,
          duration: Date.now() - startTime,
          retryAttempt: attempt,
        };
      }
      
      lastError = result.error || 'Unknown error';
      
      // Check if we should retry
      if (attempt < retryConfig.maxRetries && isRetryableError(lastError)) {
        const delay = calculateBackoff(attempt, retryConfig);
        if (context.config.debug) {
          console.log(`[Orchestrator] Task ${task.id} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`);
        }
        await sleep(delay);
      } else if (!isRetryableError(lastError)) {
        // Non-retryable error, return immediately
        break;
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (!isRetryableError(lastError) || attempt >= retryConfig.maxRetries) {
        break;
      }
      
      const delay = calculateBackoff(attempt, retryConfig);
      await sleep(delay);
    }
  }
  
  return {
    taskId: task.id,
    toolName: task.toolName,
    success: false,
    error: lastError,
    duration: Date.now() - startTime,
    retryAttempt: retryConfig.maxRetries,
  };
}

/**
 * Check if all dependencies of a task are completed
 */
function areDependenciesSatisfied(
  task: Task,
  results: Map<string, ToolCallResult>
): boolean {
  return task.dependencies.every(depId => {
    const result = results.get(depId);
    return result && result.success;
  });
}

/**
 * Execute tasks in dependency order with parallelization where possible
 */
async function executeTasksInOrder(
  taskPlan: TaskPlan,
  context: ExecutionContext,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = [];
  const taskMap = new Map(taskPlan.tasks.map(t => [t.id, t]));
  const completed = new Set<string>();
  const inProgress = new Set<string>();
  
  // Process tasks until all are completed or failed
  while (completed.size < taskPlan.tasks.length) {
    // Find tasks that are ready to execute
    const readyTasks = taskPlan.tasks.filter(task => 
      !completed.has(task.id) &&
      !inProgress.has(task.id) &&
      areDependenciesSatisfied(task, context.results)
    );
    
    if (readyTasks.length === 0 && inProgress.size === 0) {
      // No more tasks can be executed - some dependencies failed
      break;
    }
    
    // Execute ready tasks in parallel
    const promises = readyTasks.map(async task => {
      inProgress.add(task.id);
      
      const result = await executeTaskWithRetry(task, context, retryConfig);
      
      context.results.set(task.id, result);
      results.push(result);
      completed.add(task.id);
      inProgress.delete(task.id);
      
      return result;
    });
    
    if (promises.length > 0) {
      await Promise.all(promises);
    } else {
      // Wait for in-progress tasks to complete
      await sleep(100);
    }
  }
  
  return results;
}

export interface ToolCallingOptions {
  timeout?: number;
  maxRetries?: number;
  parallelExecution?: boolean;
  agentBridge?: AgentBridge;
}

export interface ToolCallingResult {
  success: boolean;
  aggregatedResponse?: AggregatedResponse;
  error?: string;
}

// Module-level agent bridge (will be set by orchestrator)
let globalAgentBridge: AgentBridge | null = null;

/**
 * Set the global agent bridge for tool execution
 */
export function setAgentBridge(bridge: AgentBridge): void {
  globalAgentBridge = bridge;
}

/**
 * Get the global agent bridge
 */
export function getAgentBridge(): AgentBridge | null {
  return globalAgentBridge;
}

/**
 * Main tool calling function - Step 4 of the pipeline
 */
export async function executeToolCalls(
  taskPlan: TaskPlan,
  config: OrchestratorConfig,
  options: ToolCallingOptions = {}
): Promise<ToolCallingResult> {
  const {
    timeout = config.timeout || 30000,
    maxRetries = config.maxRetries || 3,
    agentBridge = globalAgentBridge,
  } = options;
  
  if (!agentBridge) {
    return {
      success: false,
      error: 'Agent bridge is required for tool execution. Call setAgentBridge() first.',
    };
  }
  
  try {
    // Initialize agent bridge if needed
    const initResult = await agentBridge.initialize();
    if (!initResult.success) {
      return {
        success: false,
        error: `Agent initialization failed: ${initResult.error}`,
      };
    }
    
    // Create execution context
    const context: ExecutionContext = {
      config,
      agentBridge,
      sessionId: `orch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      results: new Map(),
    };
    
    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Tool execution timed out')), timeout);
    });
    
    // Execute tasks
    const retryConfig: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxRetries,
    };
    
    const results = await Promise.race([
      executeTasksInOrder(taskPlan, context, retryConfig),
      timeoutPromise,
    ]);
    
    // Aggregate results
    const failedTasks = results.filter(r => !r.success).map(r => r.taskId);
    const completedTasks = results.filter(r => r.success).map(r => r.taskId);
    
    const aggregatedResponse: AggregatedResponse = {
      success: failedTasks.length === 0,
      results,
      partialFailure: failedTasks.length > 0 && completedTasks.length > 0,
      failedTasks,
      completedTasks,
    };
    
    return {
      success: true,
      aggregatedResponse,
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Creates a tool executor with preset options
 */
export function createToolExecutor(config: OrchestratorConfig, defaultOptions: ToolCallingOptions = {}) {
  return (taskPlan: TaskPlan, overrides: Partial<ToolCallingOptions> = {}) => {
    return executeToolCalls(taskPlan, config, { ...defaultOptions, ...overrides });
  };
}
