/**
 * AI Agent Orchestrator - Main Entry Point
 * 
 * Coordinates multiple AI agents (Booking, Slots Availability) through
 * a robust 6-step pipeline with security, retry logic, and role-based outputs.
 */

// Configuration
export { createConfig, type OrchestratorConfig, type UserRole } from './config.js';

// Main orchestrator
export { Orchestrator, createOrchestrator, type OrchestratorOptions } from './orchestrator.js';

// Agent Bridge
export { AgentBridge, createAgentBridge } from './agents/agent-bridge.js';

// Schemas
export * from './schemas.js';

// Pipeline steps (for advanced usage)
export {
  // Step 1
  sanitizeInput,
  createSanitizer,
  type SanitizationOptions,
  type SanitizationResult,
  // Step 2
  classifyIntent,
  createIntentClassifier,
  type ClassificationOptions,
  type ClassificationResult,
  // Step 3
  decomposeTasks,
  createTaskDecomposer,
  type DecompositionOptions,
  type DecompositionResult,
  // Step 4
  executeToolCalls,
  createToolExecutor,
  setAgentBridge,
  getAgentBridge,
  type ToolCallingOptions,
  type ToolCallingResult,
  // Step 5
  synthesizeOutput,
  createOutputSynthesizer,
  type SynthesisOptions,
  type SynthesisResult,
  // Step 6
  validateOutput,
  createOutputValidator,
  containsConfidentialData,
  getConfidentialityRules,
  ConfidentialityCategory,
  type ValidationOptions,
  type ValidationResult,
} from './pipeline/index.js';
