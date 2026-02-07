/**
 * Pipeline Module Exports
 * 
 * This module exports all pipeline steps for the orchestrator.
 */

// Re-export schemas with proper path
export * from '../schemas.js';

// Step 1: Input Sanitization
export {
  sanitizeInput,
  createSanitizer,
  type SanitizationOptions,
  type SanitizationResult,
} from './step1-sanitization.js';

// Step 2: Intent Classification
export {
  classifyIntent,
  createIntentClassifier,
  type ClassificationOptions,
  type ClassificationResult,
} from './step2-classification.js';

// Step 3: Task Decomposition
export {
  decomposeTasks,
  createTaskDecomposer,
  type DecompositionOptions,
  type DecompositionResult,
} from './step3-decomposition.js';

// Step 4: Tool Calling
export {
  executeToolCalls,
  createToolExecutor,
  setAgentBridge,
  getAgentBridge,
  type ToolCallingOptions,
  type ToolCallingResult,
} from './step4-tool-calling.js';

// Step 5: Output Synthesis
export {
  synthesizeOutput,
  createOutputSynthesizer,
  type SynthesisOptions,
  type SynthesisResult,
} from './step5-synthesis.js';

// Step 6: Output Validation
export {
  validateOutput,
  createOutputValidator,
  containsConfidentialData,
  getConfidentialityRules,
  ConfidentialityCategory,
  type ValidationOptions,
  type ValidationResult,
} from './step6-validation.js';
