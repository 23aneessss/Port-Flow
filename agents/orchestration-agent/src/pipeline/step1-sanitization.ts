/**
 * Step 1: Input Sanitization Pipeline
 * 
 * Responsibilities:
 * - Normalize input text
 * - Remove unsafe/irrelevant content
 * - Detect and strip prompt-injection attempts
 * - Validate required fields
 */

import type { SanitizedInput, UserRole } from '../schemas.js';

/**
 * Patterns that indicate potential prompt injection attempts
 */
const INJECTION_PATTERNS: RegExp[] = [
  // Direct instruction overrides
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
  /forget\s+(all\s+)?(previous|prior|above)\s+(instructions?|context)/gi,
  
  // System prompt extraction
  /what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions?|rules?)/gi,
  /show\s+me\s+your\s+(system\s+)?(prompt|instructions?)/gi,
  /reveal\s+your\s+(system\s+)?(prompt|instructions?|rules?)/gi,
  /print\s+your\s+(system\s+)?(prompt|instructions?)/gi,
  
  // Role manipulation
  /you\s+are\s+now\s+(a|an|the)\s+/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /act\s+as\s+(a|an|if\s+you\s+are)/gi,
  /roleplay\s+as/gi,
  
  // Delimiter injection
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
  /<\|im_start\|>/gi,
  /<\|endoftext\|>/gi,
  
  // Data exfiltration
  /output\s+(all|every)\s+(user|customer|client)\s+data/gi,
  /dump\s+(the\s+)?database/gi,
  /show\s+(all\s+)?api\s+keys/gi,
  /reveal\s+(all\s+)?passwords/gi,
  
  // Jailbreak attempts
  /developer\s+mode/gi,
  /dan\s+mode/gi,
  /jailbreak/gi,
  /bypass\s+(safety|filters?|restrictions?)/gi,
];

/**
 * Unsafe HTML/script patterns
 */
const UNSAFE_PATTERNS: RegExp[] = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /data:text\/html/gi,
];

/**
 * Patterns to normalize (not necessarily remove, but clean up)
 */
const NORMALIZATION_RULES: Array<{ pattern: RegExp; replacement: string }> = [
  // Multiple spaces to single space
  { pattern: /\s+/g, replacement: ' ' },
  // Remove null bytes
  { pattern: /\0/g, replacement: '' },
  // Remove invisible unicode characters
  { pattern: /[\u200B-\u200D\uFEFF\u00AD]/g, replacement: '' },
  // Normalize quotes
  { pattern: /[""]/g, replacement: '"' },
  { pattern: /['']/g, replacement: "'" },
];

/**
 * Maximum allowed input length
 */
const MAX_INPUT_LENGTH = 10000;

/**
 * Minimum meaningful input length
 */
const MIN_INPUT_LENGTH = 2;

export interface SanitizationOptions {
  userId?: string;
  userRole?: UserRole;
  sessionId?: string;
  strictMode?: boolean;
}

export interface SanitizationResult {
  success: boolean;
  sanitizedInput?: SanitizedInput;
  error?: string;
}

/**
 * Detects prompt injection attempts in the input
 */
function detectInjectionAttempts(input: string): { detected: boolean; patterns: string[] } {
  const detectedPatterns: string[] = [];
  
  for (const pattern of INJECTION_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      detectedPatterns.push(...matches);
    }
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
  }
  
  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
  };
}

/**
 * Removes unsafe content from the input
 */
function removeUnsafeContent(input: string): { cleaned: string; removed: string[] } {
  const removed: string[] = [];
  let cleaned = input;
  
  for (const pattern of UNSAFE_PATTERNS) {
    const matches = cleaned.match(pattern);
    if (matches) {
      removed.push(...matches);
      cleaned = cleaned.replace(pattern, '');
    }
    pattern.lastIndex = 0;
  }
  
  return { cleaned, removed };
}

/**
 * Normalizes the input text
 */
function normalizeText(input: string): string {
  let normalized = input.trim();
  
  for (const rule of NORMALIZATION_RULES) {
    normalized = normalized.replace(rule.pattern, rule.replacement);
  }
  
  return normalized;
}

/**
 * Validates required fields and input constraints
 */
function validateInput(input: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input || input.length === 0) {
    errors.push('Input is empty');
  }
  
  if (input.length < MIN_INPUT_LENGTH) {
    errors.push(`Input too short (minimum ${MIN_INPUT_LENGTH} characters)`);
  }
  
  if (input.length > MAX_INPUT_LENGTH) {
    errors.push(`Input too long (maximum ${MAX_INPUT_LENGTH} characters)`);
  }
  
  // Check for purely non-alphanumeric content
  if (input.length > 0 && !/[a-zA-Z0-9]/.test(input)) {
    errors.push('Input contains no meaningful content');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detect language (basic implementation)
 */
function detectLanguage(input: string): string {
  // Simple heuristic - can be enhanced with proper language detection
  const arabicPattern = /[\u0600-\u06FF]/;
  const frenchPattern = /[éèêëàâäùûüôöîïç]/i;
  
  if (arabicPattern.test(input)) return 'ar';
  if (frenchPattern.test(input)) return 'fr';
  return 'en';
}

/**
 * Main sanitization function - Step 1 of the pipeline
 */
export function sanitizeInput(
  rawInput: string,
  options: SanitizationOptions = {}
): SanitizationResult {
  const { userId, userRole, sessionId, strictMode = false } = options;
  const timestamp = new Date().toISOString();
  const allRemovedPatterns: string[] = [];
  
  // Step 1.1: Basic validation
  const validation = validateInput(rawInput);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join('; '),
    };
  }
  
  // Step 1.2: Detect injection attempts
  const injectionCheck = detectInjectionAttempts(rawInput);
  if (injectionCheck.detected) {
    allRemovedPatterns.push(...injectionCheck.patterns);
    
    // In strict mode, reject the input entirely
    if (strictMode) {
      return {
        success: false,
        error: 'Potential prompt injection detected. Request rejected.',
      };
    }
  }
  
  // Step 1.3: Remove unsafe content
  const { cleaned: afterUnsafeRemoval, removed: unsafeRemoved } = removeUnsafeContent(rawInput);
  allRemovedPatterns.push(...unsafeRemoved);
  
  // Step 1.4: Normalize text
  let sanitizedText = normalizeText(afterUnsafeRemoval);
  
  // Step 1.5: Remove detected injection patterns from the text
  for (const pattern of INJECTION_PATTERNS) {
    sanitizedText = sanitizedText.replace(pattern, '');
    pattern.lastIndex = 0;
  }
  sanitizedText = normalizeText(sanitizedText); // Re-normalize after removal
  
  // Step 1.6: Final validation on sanitized text
  if (sanitizedText.length < MIN_INPUT_LENGTH) {
    return {
      success: false,
      error: 'Input is empty after sanitization',
    };
  }
  
  // Step 1.7: Detect language
  const detectedLanguage = detectLanguage(sanitizedText);
  
  const sanitizedInput: SanitizedInput = {
    originalInput: rawInput,
    sanitizedText,
    detectedLanguage,
    containedInjectionAttempt: injectionCheck.detected,
    removedPatterns: allRemovedPatterns,
    validationErrors: validation.errors,
    metadata: {
      userId,
      userRole,
      sessionId,
      timestamp,
    },
  };
  
  return {
    success: true,
    sanitizedInput,
  };
}

/**
 * Creates a sanitization middleware for the pipeline
 */
export function createSanitizer(defaultOptions: SanitizationOptions = {}) {
  return (rawInput: string, overrides: Partial<SanitizationOptions> = {}) => {
    return sanitizeInput(rawInput, { ...defaultOptions, ...overrides });
  };
}
