/**
 * Step 6: Output Validation (Confidentiality)
 * 
 * Responsibilities:
 * - Final guardrail pass for confidential data
 * - Redact or omit sensitive fields
 * - Enforce confidentiality rules
 */

import type {
  SynthesizedOutput,
  ValidatedOutput,
  ConfidentialityViolation,
} from '../schemas.js';

/**
 * Categories of confidential data
 */
export enum ConfidentialityCategory {
  PII = 'PII',                       // Personally Identifiable Information
  FINANCIAL = 'FINANCIAL',           // Financial data
  CREDENTIALS = 'CREDENTIALS',       // Passwords, tokens, keys
  INTERNAL = 'INTERNAL',             // Internal system data
  CONTACT = 'CONTACT',               // Contact information
}

/**
 * Confidentiality rule definition
 */
interface ConfidentialityRule {
  category: ConfidentialityCategory;
  patterns: RegExp[];
  fields: string[];
  action: 'redacted' | 'removed' | 'masked';
  description: string;
}

/**
 * Predefined confidentiality rules
 */
const CONFIDENTIALITY_RULES: ConfidentialityRule[] = [
  // Credentials
  {
    category: ConfidentialityCategory.CREDENTIALS,
    patterns: [
      /password/i,
      /secret/i,
      /api[_-]?key/i,
      /auth[_-]?token/i,
      /bearer\s+[a-zA-Z0-9._-]+/gi,
      /jwt[_-]?token/i,
      /private[_-]?key/i,
      /access[_-]?token/i,
      /refresh[_-]?token/i,
    ],
    fields: ['password', 'secret', 'apiKey', 'authToken', 'token', 'privateKey'],
    action: 'removed',
    description: 'Authentication credentials and secrets',
  },
  // Personal Identifiable Information
  {
    category: ConfidentialityCategory.PII,
    patterns: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,                        // Phone
      /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,                          // SSN pattern
      /\b\d{16}\b/g,                                           // Credit card
    ],
    fields: ['email', 'phone', 'ssn', 'socialSecurityNumber', 'creditCard'],
    action: 'masked',
    description: 'Personal identifiable information',
  },
  // Internal system data
  {
    category: ConfidentialityCategory.INTERNAL,
    patterns: [
      /internal[_-]?id/i,
      /system[_-]?id/i,
      /database[_-]?connection/i,
      /connection[_-]?string/i,
      /server[_-]?address/i,
      /internal[_-]?ip/i,
    ],
    fields: [
      'internalId', 'systemId', 'connectionString', 'databaseUrl',
      'serverAddress', 'internalIp', 'decidedByOperatorUserId',
    ],
    action: 'removed',
    description: 'Internal system identifiers and configuration',
  },
  // Financial data
  {
    category: ConfidentialityCategory.FINANCIAL,
    patterns: [
      /\b(?:credit[_-]?card|cc)[_-]?(?:number|num)?\b/i,
      /\b(?:bank|account)[_-]?(?:number|no|num)\b/i,
      /\biban\b/i,
      /\bswift\b/i,
      /\brouting[_-]?number\b/i,
    ],
    fields: [
      'creditCardNumber', 'bankAccount', 'iban', 'swift',
      'routingNumber', 'accountNumber',
    ],
    action: 'removed',
    description: 'Financial account information',
  },
];

/**
 * Mask a string value (e.g., email -> j***@e***.com)
 */
function maskValue(value: string, type: 'email' | 'phone' | 'default' = 'default'): string {
  if (type === 'email') {
    const [local, domain] = value.split('@');
    if (!domain) return '***@***.***';
    const maskedLocal = local[0] + '***';
    const domainParts = domain.split('.');
    const maskedDomain = domainParts[0][0] + '***.' + domainParts.slice(1).join('.');
    return `${maskedLocal}@${maskedDomain}`;
  }
  
  if (type === 'phone') {
    return value.replace(/\d(?=\d{4})/g, '*');
  }
  
  // Default: show first and last char
  if (value.length <= 4) return '****';
  return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
}

/**
 * Redact a string by replacing with placeholder
 */
function redactValue(): string {
  return '[REDACTED]';
}

/**
 * Check if a field name matches any confidential rule
 */
function findMatchingRule(fieldPath: string): ConfidentialityRule | null {
  const fieldName = fieldPath.split('.').pop() || fieldPath;
  
  for (const rule of CONFIDENTIALITY_RULES) {
    // Check field name match
    if (rule.fields.some(f => fieldName.toLowerCase().includes(f.toLowerCase()))) {
      return rule;
    }
    
    // Check pattern match against field name
    for (const pattern of rule.patterns) {
      if (pattern.test(fieldName)) {
        pattern.lastIndex = 0;
        return rule;
      }
    }
  }
  
  return null;
}

/**
 * Check if a string value contains confidential patterns
 */
function findConfidentialPatternInValue(value: string): { rule: ConfidentialityRule; match: string } | null {
  for (const rule of CONFIDENTIALITY_RULES) {
    for (const pattern of rule.patterns) {
      const match = value.match(pattern);
      if (match) {
        pattern.lastIndex = 0;
        return { rule, match: match[0] };
      }
      pattern.lastIndex = 0;
    }
  }
  
  return null;
}

/**
 * Recursively scan and sanitize an object
 */
function sanitizeObject(
  obj: unknown,
  path: string = '',
  violations: ConfidentialityViolation[],
  debug: boolean = false
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // Check if the current path indicates a confidential field
    const fieldRule = findMatchingRule(path);
    if (fieldRule) {
      violations.push({
        field: path,
        reason: fieldRule.description,
        action: fieldRule.action,
        ...(debug && { originalValue: obj }),
      });
      
      if (fieldRule.action === 'removed') return undefined;
      if (fieldRule.action === 'redacted') return redactValue();
      if (fieldRule.action === 'masked') {
        if (path.toLowerCase().includes('email')) return maskValue(obj, 'email');
        if (path.toLowerCase().includes('phone')) return maskValue(obj, 'phone');
        return maskValue(obj);
      }
    }
    
    // Check if the value itself contains confidential patterns
    const patternMatch = findConfidentialPatternInValue(obj);
    if (patternMatch) {
      violations.push({
        field: path,
        reason: `Value contains ${patternMatch.rule.description}`,
        action: 'masked',
        ...(debug && { originalValue: patternMatch.match }),
      });
      
      // Replace the matched pattern in the string
      let sanitized = obj;
      for (const pattern of patternMatch.rule.patterns) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
        pattern.lastIndex = 0;
      }
      return sanitized;
    }
    
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, index) => 
      sanitizeObject(item, `${path}[${index}]`, violations, debug)
    ).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      const sanitizedValue = sanitizeObject(value, newPath, violations, debug);
      
      if (sanitizedValue !== undefined) {
        result[key] = sanitizedValue;
      }
    }
    
    return result;
  }
  
  return obj;
}

export interface ValidationOptions {
  debug?: boolean;
  additionalRules?: ConfidentialityRule[];
  strictMode?: boolean;
}

export interface ValidationResult {
  success: boolean;
  validatedOutput?: ValidatedOutput;
  error?: string;
}

/**
 * Main validation function - Step 6 of the pipeline
 */
export function validateOutput(
  output: SynthesizedOutput,
  requestId: string,
  pipelineSteps: string[],
  startTime: number,
  options: ValidationOptions = {}
): ValidationResult {
  const { debug = false, strictMode = false } = options;
  const violations: ConfidentialityViolation[] = [];
  
  try {
    // Deep clone the output to avoid mutating the original
    const outputCopy = JSON.parse(JSON.stringify(output));
    
    // Sanitize the output object
    const sanitizedOutput = sanitizeObject(
      outputCopy,
      '',
      violations,
      debug
    ) as SynthesizedOutput;
    
    // In strict mode, reject if any violations found
    if (strictMode && violations.length > 0) {
      return {
        success: false,
        error: `Confidentiality violations detected: ${violations.length} sensitive fields found`,
      };
    }
    
    const validatedOutput: ValidatedOutput = {
      output: sanitizedOutput,
      confidentialityCheck: {
        passed: violations.length === 0,
        violations,
        redactedFields: violations.map(v => v.field),
      },
      metadata: {
        requestId,
        processingTime: Date.now() - startTime,
        pipelineSteps,
        timestamp: new Date().toISOString(),
      },
    };
    
    return {
      success: true,
      validatedOutput,
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Output validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Quick check if a value contains confidential data (useful for pre-checks)
 */
export function containsConfidentialData(value: unknown): boolean {
  const violations: ConfidentialityViolation[] = [];
  sanitizeObject(value, '', violations);
  return violations.length > 0;
}

/**
 * Get list of all confidentiality rules (for documentation/testing)
 */
export function getConfidentialityRules(): Array<{
  category: string;
  fields: string[];
  action: string;
  description: string;
}> {
  return CONFIDENTIALITY_RULES.map(rule => ({
    category: rule.category,
    fields: rule.fields,
    action: rule.action,
    description: rule.description,
  }));
}

/**
 * Creates an output validator with preset options
 */
export function createOutputValidator(defaultOptions: ValidationOptions = {}) {
  return (
    output: SynthesizedOutput,
    requestId: string,
    pipelineSteps: string[],
    startTime: number,
    overrides: Partial<ValidationOptions> = {}
  ) => {
    return validateOutput(output, requestId, pipelineSteps, startTime, {
      ...defaultOptions,
      ...overrides,
    });
  };
}
