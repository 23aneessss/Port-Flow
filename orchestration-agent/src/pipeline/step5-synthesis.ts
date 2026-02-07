/**
 * Step 5: Output Synthesis (Role-Based)
 * 
 * Responsibilities:
 * - Synthesize agent responses into role-appropriate output
 * - Carrier: Concise text with clear next steps
 * - Operator/Admin: Dashboard-friendly structured JSON
 */

import { generateObject } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { z } from 'zod';
import type {
  AggregatedResponse,
  SynthesizedOutput,
  CarrierOutput,
  DashboardOutput,
  UserRole,
  IntentType,
} from '../schemas.js';

/**
 * Schema for carrier output generation
 */
const CarrierSynthesisSchema = z.object({
  message: z.string().describe('Main response message in natural language'),
  summary: z.string().describe('Brief one-line summary'),
  nextSteps: z.array(z.string()).describe('Recommended next actions'),
  bookingDetails: z.object({
    bookingId: z.string().nullish(),
    status: z.string().nullish(),
    terminal: z.string().nullish(),
    timeSlot: z.string().nullish(),
  }).nullish(),
  warnings: z.array(z.string()).describe('Any warnings or important notices'),
});

/**
 * Schema for dashboard output generation
 */
const DashboardSynthesisSchema = z.object({
  title: z.string().describe('Dashboard section title'),
  kpis: z.array(z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    trend: z.enum(['up', 'down', 'stable']).optional(),
    unit: z.string().optional(),
  })),
  widgets: z.array(z.object({
    widgetType: z.enum(['kpi', 'table', 'chart', 'status', 'action_list']),
    title: z.string(),
    data: z.unknown(),
    priority: z.enum(['high', 'medium', 'low']),
  })),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    params: z.record(z.unknown()),
    priority: z.enum(['high', 'medium', 'low']),
  })),
  warnings: z.array(z.object({
    severity: z.enum(['critical', 'warning', 'info']),
    message: z.string(),
  })),
  summary: z.string(),
});

/**
 * Extract relevant data from tool call results
 */
function extractResultData(aggregatedResponse: AggregatedResponse): Record<string, unknown> {
  const extracted: Record<string, unknown> = {};
  
  for (const result of aggregatedResponse.results) {
    if (result.success && result.data) {
      extracted[result.toolName] = result.data;
    }
  }
  
  return extracted;
}

/**
 * Build context string from aggregated response
 */
function buildContextString(
  aggregatedResponse: AggregatedResponse,
  intent: IntentType
): string {
  const results = extractResultData(aggregatedResponse);
  
  let context = `Intent: ${intent}\n`;
  context += `Completed Tasks: ${aggregatedResponse.completedTasks.length}\n`;
  context += `Failed Tasks: ${aggregatedResponse.failedTasks.length}\n\n`;
  context += 'Results:\n';
  
  for (const [toolName, data] of Object.entries(results)) {
    context += `\n--- ${toolName} ---\n`;
    context += JSON.stringify(data, null, 2);
  }
  
  if (aggregatedResponse.failedTasks.length > 0) {
    context += '\n\n--- Errors ---\n';
    for (const result of aggregatedResponse.results) {
      if (!result.success) {
        context += `${result.toolName}: ${result.error}\n`;
      }
    }
  }
  
  return context;
}

/**
 * Generate carrier-focused output using LLM
 */
async function synthesizeCarrierOutput(
  aggregatedResponse: AggregatedResponse,
  intent: IntentType,
  model: string
): Promise<CarrierOutput> {
  const context = buildContextString(aggregatedResponse, intent);
  
  const systemPrompt = `You are synthesizing responses for a carrier (trucking company) user of a port terminal system.
Your output should be:
- Friendly and conversational
- Action-oriented with clear next steps
- Focused on what matters to the carrier (booking status, slot availability, what to do next)
- Concise but complete

If there were errors in the task execution, acknowledge them and suggest alternatives.`;

  const { object } = await generateObject({
    model: mistral(model),
    schema: CarrierSynthesisSchema,
    system: systemPrompt,
    prompt: `Based on the following task results, create a helpful response for the carrier:\n\n${context}`,
  });
  
  return {
    type: 'carrier',
    ...object,
  } as CarrierOutput;
}

/**
 * Generate dashboard-focused output using LLM
 */
async function synthesizeDashboardOutput(
  aggregatedResponse: AggregatedResponse,
  intent: IntentType,
  model: string
): Promise<DashboardOutput> {
  const context = buildContextString(aggregatedResponse, intent);
  
  const systemPrompt = `You are synthesizing responses for an operator or admin user of a port terminal system.
Your output should be structured for a dashboard UI:
- Include relevant KPIs (utilization rates, booking counts, etc.)
- Structure data in widgets (tables, charts, status indicators)
- Prioritize actionable items
- Include warnings for attention-requiring items
- Be data-rich and suitable for quick scanning

Widget types:
- kpi: Single metric display
- table: Tabular data
- chart: Data suitable for visualization
- status: Status indicator
- action_list: List of recommended actions

If there were errors in the task execution, include them as warnings.`;

  const { object } = await generateObject({
    model: mistral(model),
    schema: DashboardSynthesisSchema,
    system: systemPrompt,
    prompt: `Based on the following task results, create a dashboard-friendly response:\n\n${context}`,
  });
  
  return {
    type: 'dashboard',
    ...object,
  } as DashboardOutput;
}

/**
 * Fallback synthesis when LLM is unavailable
 */
function synthesizeFallback(
  aggregatedResponse: AggregatedResponse,
  userRole: UserRole
): SynthesizedOutput {
  const resultData = extractResultData(aggregatedResponse);
  
  if (userRole === 'CARRIER') {
    const carrierOutput: CarrierOutput = {
      type: 'carrier',
      message: aggregatedResponse.success
        ? 'Your request has been processed successfully.'
        : 'There was an issue processing your request. Please try again.',
      summary: `Completed ${aggregatedResponse.completedTasks.length} of ${aggregatedResponse.results.length} tasks`,
      nextSteps: aggregatedResponse.success
        ? ['Review the results below', 'Contact support if you have questions']
        : ['Try again later', 'Contact support if the issue persists'],
      warnings: aggregatedResponse.failedTasks.map(
        taskId => `Task ${taskId} failed`
      ),
    };
    
    return carrierOutput;
  }
  
  const dashboardOutput: DashboardOutput = {
    type: 'dashboard',
    title: 'Request Results',
    kpis: [
      {
        label: 'Tasks Completed',
        value: aggregatedResponse.completedTasks.length,
      },
      {
        label: 'Tasks Failed',
        value: aggregatedResponse.failedTasks.length,
      },
      {
        label: 'Success Rate',
        value: `${Math.round((aggregatedResponse.completedTasks.length / aggregatedResponse.results.length) * 100)}%`,
      },
    ],
    widgets: [
      {
        widgetType: 'table',
        title: 'Task Results',
        data: aggregatedResponse.results.map(r => ({
          task: r.toolName,
          status: r.success ? 'Success' : 'Failed',
          duration: `${r.duration}ms`,
        })),
        priority: 'high',
      },
      {
        widgetType: 'status',
        title: 'Raw Data',
        data: resultData,
        priority: 'medium',
      },
    ],
    actions: [],
    warnings: aggregatedResponse.failedTasks.map(taskId => ({
      severity: 'warning' as const,
      message: `Task ${taskId} failed to complete`,
    })),
    summary: `Processed ${aggregatedResponse.results.length} tasks with ${aggregatedResponse.completedTasks.length} successful and ${aggregatedResponse.failedTasks.length} failed.`,
  };
  
  return dashboardOutput;
}

export interface SynthesisOptions {
  model?: string;
  useLLM?: boolean;
  intent?: IntentType;
}

export interface SynthesisResult {
  success: boolean;
  output?: SynthesizedOutput;
  error?: string;
}

/**
 * Main synthesis function - Step 5 of the pipeline
 */
export async function synthesizeOutput(
  aggregatedResponse: AggregatedResponse,
  userRole: UserRole,
  options: SynthesisOptions = {}
): Promise<SynthesisResult> {
  const {
    model = 'mistral-large-latest',
    useLLM = true,
    intent = 'unknown',
  } = options;
  
  try {
    // Determine output type based on role
    const isCarrier = userRole === 'CARRIER';
    
    if (!useLLM) {
      // Use fallback synthesis
      return {
        success: true,
        output: synthesizeFallback(aggregatedResponse, userRole),
      };
    }
    
    // Use LLM for intelligent synthesis
    const output = isCarrier
      ? await synthesizeCarrierOutput(aggregatedResponse, intent, model)
      : await synthesizeDashboardOutput(aggregatedResponse, intent, model);
    
    return { success: true, output };
    
  } catch (error) {
    // Fall back to simple synthesis on error
    console.error('LLM synthesis failed, using fallback:', error);
    
    return {
      success: true,
      output: synthesizeFallback(aggregatedResponse, userRole),
    };
  }
}

/**
 * Creates an output synthesizer with preset options
 */
export function createOutputSynthesizer(defaultOptions: SynthesisOptions = {}) {
  return (
    aggregatedResponse: AggregatedResponse,
    userRole: UserRole,
    overrides: Partial<SynthesisOptions> = {}
  ) => {
    return synthesizeOutput(aggregatedResponse, userRole, { ...defaultOptions, ...overrides });
  };
}
