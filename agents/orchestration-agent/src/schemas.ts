import { z } from 'zod';

// ============ Core Orchestrator Schemas ============

/**
 * User roles in the system
 */
export const UserRoleSchema = z.enum(['ADMIN', 'OPERATOR', 'CARRIER', 'DRIVER']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Intent classification categories
 */
export const IntentTypeSchema = z.enum(['bookings', 'slots_availability', 'unknown']);
export type IntentType = z.infer<typeof IntentTypeSchema>;

/**
 * Sanitized input after Step 1
 */
export const SanitizedInputSchema = z.object({
  originalInput: z.string(),
  sanitizedText: z.string(),
  detectedLanguage: z.string().optional(),
  containedInjectionAttempt: z.boolean(),
  removedPatterns: z.array(z.string()),
  validationErrors: z.array(z.string()),
  metadata: z.object({
    userId: z.string().optional(),
    userRole: UserRoleSchema.optional(),
    sessionId: z.string().optional(),
    timestamp: z.string(),
  }),
});
export type SanitizedInput = z.infer<typeof SanitizedInputSchema>;

/**
 * Intent classification result (Step 2)
 */
export const IntentClassificationSchema = z.object({
  primaryIntent: IntentTypeSchema,
  confidence: z.number().min(0).max(1),
  secondaryIntent: IntentTypeSchema.optional(),
  requiresClarification: z.boolean(),
  clarificationQuestion: z.string().optional(),
  extractedEntities: z.object({
    terminalId: z.string().optional(),
    terminalName: z.string().optional(),
    bookingId: z.string().optional(),
    date: z.string().optional(),
    timeSlot: z.string().optional(),
    driverId: z.string().optional(),
    status: z.string().optional(),
  }),
  reasoning: z.string(),
});
export type IntentClassification = z.infer<typeof IntentClassificationSchema>;

/**
 * Task status in the plan
 */
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed', 'skipped']);

/**
 * Individual task in the task plan
 */
export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  agent: z.enum(['booking_agent', 'slots_agent', 'orchestrator']),
  toolName: z.string(),
  toolArgs: z.record(z.unknown()),
  dependencies: z.array(z.string()),
  status: TaskStatusSchema,
  result: z.unknown().optional(),
  error: z.string().optional(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
});
export type Task = z.infer<typeof TaskSchema>;

/**
 * Complete task plan (Step 3)
 */
export const TaskPlanSchema = z.object({
  planId: z.string(),
  intent: IntentTypeSchema,
  tasks: z.array(TaskSchema),
  executionOrder: z.array(z.string()),
  estimatedDuration: z.number(),
  createdAt: z.string(),
});
export type TaskPlan = z.infer<typeof TaskPlanSchema>;

/**
 * Tool call result wrapper
 */
export const ToolCallResultSchema = z.object({
  taskId: z.string(),
  toolName: z.string(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number(),
  retryAttempt: z.number(),
});
export type ToolCallResult = z.infer<typeof ToolCallResultSchema>;

/**
 * Aggregated agent response (Step 4)
 */
export const AggregatedResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(ToolCallResultSchema),
  partialFailure: z.boolean(),
  failedTasks: z.array(z.string()),
  completedTasks: z.array(z.string()),
});
export type AggregatedResponse = z.infer<typeof AggregatedResponseSchema>;

// ============ Role-Based Output Schemas (Step 5) ============

/**
 * Carrier-focused response (simple text)
 */
export const CarrierOutputSchema = z.object({
  type: z.literal('carrier'),
  message: z.string(),
  summary: z.string(),
  nextSteps: z.array(z.string()),
  bookingDetails: z
    .object({
      bookingId: z.string().optional(),
      status: z.string().optional(),
      terminal: z.string().optional(),
      timeSlot: z.string().optional(),
    })
    .optional(),
  warnings: z.array(z.string()),
});
export type CarrierOutput = z.infer<typeof CarrierOutputSchema>;

/**
 * Dashboard widget data for operator/admin
 */
export const DashboardWidgetSchema = z.object({
  widgetType: z.enum(['kpi', 'table', 'chart', 'status', 'action_list']),
  title: z.string(),
  data: z.unknown(),
  priority: z.enum(['high', 'medium', 'low']),
});

/**
 * Operator/Admin dashboard response
 */
export const DashboardOutputSchema = z.object({
  type: z.literal('dashboard'),
  title: z.string(),
  kpis: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      trend: z.enum(['up', 'down', 'stable']).optional(),
      unit: z.string().optional(),
    })
  ),
  widgets: z.array(DashboardWidgetSchema),
  actions: z.array(
    z.object({
      label: z.string(),
      action: z.string(),
      params: z.record(z.unknown()),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  warnings: z.array(
    z.object({
      severity: z.enum(['critical', 'warning', 'info']),
      message: z.string(),
    })
  ),
  summary: z.string(),
});
export type DashboardOutput = z.infer<typeof DashboardOutputSchema>;

/**
 * Union of all output types
 */
export const SynthesizedOutputSchema = z.discriminatedUnion('type', [
  CarrierOutputSchema,
  DashboardOutputSchema,
]);
export type SynthesizedOutput = z.infer<typeof SynthesizedOutputSchema>;

// ============ Confidentiality Validation (Step 6) ============

/**
 * Confidentiality violation record
 */
export const ConfidentialityViolationSchema = z.object({
  field: z.string(),
  reason: z.string(),
  action: z.enum(['redacted', 'removed', 'masked']),
  originalValue: z.string().optional(), // Only in debug mode
});
export type ConfidentialityViolation = z.infer<typeof ConfidentialityViolationSchema>;

/**
 * Validated final output
 */
export const ValidatedOutputSchema = z.object({
  output: SynthesizedOutputSchema,
  confidentialityCheck: z.object({
    passed: z.boolean(),
    violations: z.array(ConfidentialityViolationSchema),
    redactedFields: z.array(z.string()),
  }),
  metadata: z.object({
    requestId: z.string(),
    processingTime: z.number(),
    pipelineSteps: z.array(z.string()),
    timestamp: z.string(),
  }),
});
export type ValidatedOutput = z.infer<typeof ValidatedOutputSchema>;

// ============ Orchestrator Request/Response ============

/**
 * Input to the orchestrator
 */
export const OrchestratorRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  userId: z.string().optional(),
  userRole: UserRoleSchema.optional(),
  sessionId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
});
export type OrchestratorRequest = z.infer<typeof OrchestratorRequestSchema>;

/**
 * Final orchestrator response
 */
export const OrchestratorResponseSchema = z.object({
  success: z.boolean(),
  output: ValidatedOutputSchema.optional(),
  error: z.string().optional(),
  debug: z
    .object({
      sanitizedInput: SanitizedInputSchema.optional(),
      intentClassification: IntentClassificationSchema.optional(),
      taskPlan: TaskPlanSchema.optional(),
      aggregatedResponse: AggregatedResponseSchema.optional(),
    })
    .optional(),
});
export type OrchestratorResponse = z.infer<typeof OrchestratorResponseSchema>;

// ============ Agent Tool Schemas ============

/**
 * Booking Agent tool schemas
 */
export const BookingAgentToolSchemas = {
  createBooking: z.object({
    terminalId: z.string().uuid(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    driverUserId: z.string().uuid(),
  }),
  getBookingStatus: z.object({
    bookingId: z.string().uuid(),
  }),
  cancelBooking: z.object({
    bookingId: z.string().uuid(),
  }),
  updateBooking: z.object({
    bookingId: z.string().uuid(),
    updates: z.object({
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      driverUserId: z.string().uuid().optional(),
    }),
  }),
  listMyBookings: z.object({
    status: z.string().optional(),
  }),
  approveBooking: z.object({
    bookingId: z.string().uuid(),
  }),
  rejectBooking: z.object({
    bookingId: z.string().uuid(),
  }),
};

/**
 * Slots Availability Agent tool schemas
 */
export const SlotsAgentToolSchemas = {
  getSlotAvailability: z.object({
    terminalId: z.string().uuid().optional(),
    date: z.string().optional(),
  }),
  getTerminalById: z.object({
    terminalId: z.string().uuid(),
  }),
  getAllTerminals: z.object({}),
  getCapacityAnalysis: z.object({
    terminalId: z.string().uuid().optional(),
  }),
  getPeakHourAnalysis: z.object({
    terminalId: z.string().uuid().optional(),
    dateRange: z
      .object({
        start: z.string(),
        end: z.string(),
      })
      .optional(),
  }),
};
