/**
 * Step 3: Task Decomposition Pipeline
 * 
 * Responsibilities:
 * - Break intent into explicit sub-tasks with dependencies
 * - Create execution plan with proper ordering
 * - Define expected inputs/outputs for each task
 */

import type { IntentClassification, TaskPlan, Task, IntentType } from '../schemas.js';

/**
 * Task template definitions for each agent
 */
interface TaskTemplate {
  name: string;
  description: string;
  agent: 'booking_agent' | 'slots_agent' | 'orchestrator';
  toolName: string;
  requiredEntities: string[];
  optionalEntities: string[];
  estimatedDuration: number; // milliseconds
}

/**
 * Predefined task templates for booking operations
 */
const BOOKING_TASKS: Record<string, TaskTemplate> = {
  createBooking: {
    name: 'Create Booking',
    description: 'Create a new booking reservation at a terminal',
    agent: 'booking_agent',
    toolName: 'createBooking',
    requiredEntities: ['terminalId', 'date', 'startTime', 'endTime', 'driverUserId'],
    optionalEntities: [],
    estimatedDuration: 2000,
  },
  getBookingStatus: {
    name: 'Get Booking Status',
    description: 'Retrieve the current status of a booking',
    agent: 'booking_agent',
    toolName: 'getBookingStatus',
    requiredEntities: ['bookingId'],
    optionalEntities: [],
    estimatedDuration: 1000,
  },
  listBookings: {
    name: 'List Bookings',
    description: 'List all bookings, optionally filtered by status',
    agent: 'booking_agent',
    toolName: 'listMyBookings',
    requiredEntities: [],
    optionalEntities: ['status'],
    estimatedDuration: 1500,
  },
  cancelBooking: {
    name: 'Cancel Booking',
    description: 'Cancel an existing booking',
    agent: 'booking_agent',
    toolName: 'cancelBooking',
    requiredEntities: ['bookingId'],
    optionalEntities: [],
    estimatedDuration: 1500,
  },
  updateBooking: {
    name: 'Update Booking',
    description: 'Modify an existing booking',
    agent: 'booking_agent',
    toolName: 'updateBooking',
    requiredEntities: ['bookingId'],
    optionalEntities: ['date', 'startTime', 'endTime', 'driverUserId'],
    estimatedDuration: 1500,
  },
  approveBooking: {
    name: 'Approve Booking',
    description: 'Approve a pending booking (operator only)',
    agent: 'booking_agent',
    toolName: 'approveBooking',
    requiredEntities: ['bookingId'],
    optionalEntities: [],
    estimatedDuration: 1000,
  },
  rejectBooking: {
    name: 'Reject Booking',
    description: 'Reject a pending booking (operator only)',
    agent: 'booking_agent',
    toolName: 'rejectBooking',
    requiredEntities: ['bookingId'],
    optionalEntities: [],
    estimatedDuration: 1000,
  },
};

/**
 * Predefined task templates for slots/availability operations
 */
const SLOTS_TASKS: Record<string, TaskTemplate> = {
  getSlotAvailability: {
    name: 'Get Slot Availability',
    description: 'Check available slots at terminals',
    agent: 'slots_agent',
    toolName: 'getSlotAvailability',
    requiredEntities: [],
    optionalEntities: ['terminalId', 'date'],
    estimatedDuration: 1500,
  },
  getTerminalById: {
    name: 'Get Terminal Details',
    description: 'Get detailed information about a specific terminal',
    agent: 'slots_agent',
    toolName: 'getTerminalById',
    requiredEntities: ['terminalId'],
    optionalEntities: [],
    estimatedDuration: 1000,
  },
  getAllTerminals: {
    name: 'Get All Terminals',
    description: 'List all terminals in the system',
    agent: 'slots_agent',
    toolName: 'getAllTerminals',
    requiredEntities: [],
    optionalEntities: [],
    estimatedDuration: 1500,
  },
  getCapacityAnalysis: {
    name: 'Capacity Analysis',
    description: 'Analyze terminal capacity and utilization',
    agent: 'slots_agent',
    toolName: 'getCapacityAnalysis',
    requiredEntities: [],
    optionalEntities: ['terminalId'],
    estimatedDuration: 2000,
  },
  getPeakHourAnalysis: {
    name: 'Peak Hour Analysis',
    description: 'Analyze peak and off-peak hours',
    agent: 'slots_agent',
    toolName: 'getPeakHourAnalysis',
    requiredEntities: [],
    optionalEntities: ['terminalId', 'dateRange'],
    estimatedDuration: 2500,
  },
};

/**
 * Intent to task mapping rules
 */
const INTENT_TASK_MAPPINGS: Record<IntentType, (classification: IntentClassification) => string[]> = {
  bookings: (classification) => {
    const text = classification.reasoning.toLowerCase();
    const entities = classification.extractedEntities;
    const tasks: string[] = [];
    
    // Determine which booking tasks are needed based on context
    if (text.includes('create') || text.includes('book') || text.includes('reserve')) {
      tasks.push('createBooking');
    }
    if (text.includes('status') || text.includes('where') || text.includes('track')) {
      tasks.push('getBookingStatus');
    }
    if (text.includes('cancel')) {
      tasks.push('cancelBooking');
    }
    if (text.includes('update') || text.includes('modify') || text.includes('change') || text.includes('reschedule')) {
      tasks.push('updateBooking');
    }
    if (text.includes('approve') || text.includes('confirm')) {
      tasks.push('approveBooking');
    }
    if (text.includes('reject') || text.includes('decline')) {
      tasks.push('rejectBooking');
    }
    if (text.includes('list') || text.includes('all') || text.includes('my booking')) {
      tasks.push('listBookings');
    }
    
    // Default: if we have a booking ID, get its status
    if (tasks.length === 0 && entities.bookingId) {
      tasks.push('getBookingStatus');
    }
    
    // Default: list bookings if nothing specific
    if (tasks.length === 0) {
      tasks.push('listBookings');
    }
    
    return tasks;
  },
  
  slots_availability: (classification) => {
    const text = classification.reasoning.toLowerCase();
    const entities = classification.extractedEntities;
    const tasks: string[] = [];
    
    // Determine which slots tasks are needed
    if (text.includes('peak') || text.includes('off-peak') || text.includes('busy')) {
      tasks.push('getPeakHourAnalysis');
    }
    if (text.includes('capacity') || text.includes('utilization') || text.includes('usage')) {
      tasks.push('getCapacityAnalysis');
    }
    if (entities.terminalId || entities.terminalName) {
      tasks.push('getTerminalById');
    }
    if (text.includes('available') || text.includes('slot') || text.includes('free')) {
      tasks.push('getSlotAvailability');
    }
    if (text.includes('all terminal') || text.includes('every terminal')) {
      tasks.push('getAllTerminals');
    }
    
    // Default: get slot availability
    if (tasks.length === 0) {
      tasks.push('getSlotAvailability');
    }
    
    return tasks;
  },
  
  unknown: () => {
    // For unknown intent, try to gather general information
    return ['getAllTerminals', 'listBookings'];
  },
};

/**
 * Generate a unique plan ID
 */
function generatePlanId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `plan_${timestamp}_${random}`;
}

/**
 * Generate a unique task ID
 */
function generateTaskId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `task_${timestamp}_${random}`;
}

/**
 * Build tool arguments from extracted entities
 */
function buildToolArgs(
  template: TaskTemplate,
  entities: IntentClassification['extractedEntities']
): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  
  // Map from entity keys (step 2) to tool arg names
  // Key: entity key from IntentClassification.extractedEntities
  // Value: corresponding tool argument name
  const entityToToolArg: Record<string, string> = {
    terminalId: 'terminalId',
    terminalName: 'terminalName',
    bookingId: 'bookingId',
    date: 'date',
    timeSlot: 'timeSlot',
    driverId: 'driverUserId',
    status: 'status',
  };
  
  // Reverse mapping for required/optional entity lookup
  const toolArgToEntity: Record<string, string> = {
    terminalId: 'terminalId',
    terminalName: 'terminalName',
    bookingId: 'bookingId',
    date: 'date',
    timeSlot: 'timeSlot',
    driverUserId: 'driverId',
    status: 'status',
    startTime: 'timeSlot', // timeSlot may contain start time
    endTime: 'timeSlot',   // timeSlot may contain end time
  };
  
  // Copy all extracted entities to args with proper mapping
  for (const [entityKey, value] of Object.entries(entities)) {
    if (value !== undefined && value !== null && value !== '') {
      const toolArgName = entityToToolArg[entityKey] || entityKey;
      args[toolArgName] = value;
    }
  }
  
  return args;
}

/**
 * Determine task dependencies based on the task graph
 */
function determineDependencies(tasks: Task[], currentIndex: number): string[] {
  // Simple dependency logic:
  // - Update/cancel operations depend on getting the booking status first
  // - Booking creation might depend on checking slot availability
  
  const current = tasks[currentIndex];
  const dependencies: string[] = [];
  
  if (current.toolName === 'cancelBooking' || current.toolName === 'updateBooking') {
    const statusTask = tasks.find(t => t.toolName === 'getBookingStatus');
    if (statusTask) {
      dependencies.push(statusTask.id);
    }
  }
  
  if (current.toolName === 'createBooking') {
    const availabilityTask = tasks.find(t => t.toolName === 'getSlotAvailability');
    if (availabilityTask) {
      dependencies.push(availabilityTask.id);
    }
  }
  
  return dependencies;
}

/**
 * Compute execution order using topological sort
 */
function computeExecutionOrder(tasks: Task[]): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  
  function visit(taskId: string) {
    if (visited.has(taskId)) return;
    visited.add(taskId);
    
    const task = taskMap.get(taskId);
    if (!task) return;
    
    // Visit dependencies first
    for (const dep of task.dependencies) {
      visit(dep);
    }
    
    order.push(taskId);
  }
  
  // Visit all tasks
  for (const task of tasks) {
    visit(task.id);
  }
  
  return order;
}

export interface DecompositionOptions {
  maxTasks?: number;
  includePreflightChecks?: boolean;
}

export interface DecompositionResult {
  success: boolean;
  taskPlan?: TaskPlan;
  error?: string;
}

/**
 * Main task decomposition function - Step 3 of the pipeline
 */
export function decomposeTasks(
  classification: IntentClassification,
  options: DecompositionOptions = {}
): DecompositionResult {
  const { maxTasks = 10, includePreflightChecks = true } = options;
  
  try {
    // Step 3.1: Get task names from intent mapping
    const taskNames = INTENT_TASK_MAPPINGS[classification.primaryIntent](classification);
    
    // Step 3.2: Limit tasks if needed
    const limitedTaskNames = taskNames.slice(0, maxTasks);
    
    // Step 3.3: Build task objects
    const tasks: Task[] = [];
    let totalDuration = 0;
    
    for (const taskName of limitedTaskNames) {
      // Find task template
      const template = BOOKING_TASKS[taskName] || SLOTS_TASKS[taskName];
      if (!template) {
        console.warn(`Unknown task template: ${taskName}`);
        continue;
      }
      
      const task: Task = {
        id: generateTaskId(),
        name: template.name,
        description: template.description,
        agent: template.agent,
        toolName: template.toolName,
        toolArgs: buildToolArgs(template, classification.extractedEntities),
        dependencies: [],
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
      };
      
      tasks.push(task);
      totalDuration += template.estimatedDuration;
    }
    
    // Step 3.4: Determine dependencies
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].dependencies = determineDependencies(tasks, i);
    }
    
    // Step 3.5: Compute execution order
    const executionOrder = computeExecutionOrder(tasks);
    
    // Step 3.6: Build task plan
    const taskPlan: TaskPlan = {
      planId: generatePlanId(),
      intent: classification.primaryIntent,
      tasks,
      executionOrder,
      estimatedDuration: totalDuration,
      createdAt: new Date().toISOString(),
    };
    
    return { success: true, taskPlan };
    
  } catch (error) {
    return {
      success: false,
      error: `Task decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Creates a task decomposer with preset options
 */
export function createTaskDecomposer(defaultOptions: DecompositionOptions = {}) {
  return (classification: IntentClassification, overrides: Partial<DecompositionOptions> = {}) => {
    return decomposeTasks(classification, { ...defaultOptions, ...overrides });
  };
}
