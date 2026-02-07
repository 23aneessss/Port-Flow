/**
 * Step 2: Intent Classification Pipeline
 * 
 * Responsibilities:
 * - Classify user request into: bookings | slots_availability | unknown
 * - Extract relevant entities (terminal, booking ID, dates, etc.)
 * - Determine if clarification is needed
 * - Provide confidence scores
 */

import { generateObject } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { z } from 'zod';
import type { SanitizedInput, IntentClassification, IntentType } from '../schemas.js';

/**
 * Intent classification result schema for structured generation
 */
const ClassificationResultSchema = z.object({
  primaryIntent: z.enum(['bookings', 'slots_availability', 'unknown']),
  confidence: z.number().min(0).max(1),
  secondaryIntent: z.enum(['bookings', 'slots_availability', 'unknown']).optional(),
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

/**
 * Keywords and patterns for each intent category
 */
const INTENT_PATTERNS: Record<IntentType, { keywords: string[]; patterns: RegExp[] }> = {
  bookings: {
    keywords: [
      'book', 'booking', 'reservation', 'reserve', 'schedule', 'appointment',
      'cancel', 'modify', 'update', 'reschedule', 'confirm', 'reject', 'approve',
      'my bookings', 'booking status', 'create booking', 'delete booking',
    ],
    patterns: [
      /\b(book|booking|booked)\b/i,
      /\b(reserv(e|ation|ed))\b/i,
      /\b(cancel|cancelled|cancellation)\b/i,
      /\b(schedul(e|ed|ing))\b/i,
      /\b(appointment)\b/i,
      /\b(confirm|reject|approve)\s*(a\s+)?booking\b/i,
      /booking\s*#?\s*\d+/i,
      /\bwhere\s+is\s+my\b/i,
      /\bstatus\s+of\s+(my\s+)?booking\b/i,
    ],
  },
  slots_availability: {
    keywords: [
      'availability', 'available', 'slots', 'capacity', 'utilization',
      'terminal', 'space', 'peak hours', 'off-peak', 'equipment',
      'when can I', 'best time', 'recommended time', 'free slots',
    ],
    patterns: [
      /\b(availab(le|ility))\b/i,
      /\b(slot|slots)\b/i,
      /\b(capacity|utilization)\b/i,
      /\b(peak|off-peak)\s*(hours?|times?)?\b/i,
      /\b(terminal\s+)?space\b/i,
      /\bwhen\s+(can|should)\s+I\b/i,
      /\bbest\s+time\s+to\b/i,
      /\bhow\s+(many|much)\s+(slots?|capacity|space)\b/i,
      /\bfind\s+available\b/i,
      /\brecommend(ed)?\s+(time|slot)\b/i,
    ],
  },
  unknown: {
    keywords: [],
    patterns: [],
  },
};

/**
 * Entity extraction patterns
 */
const ENTITY_PATTERNS = {
  bookingId: /\b(?:booking\s*#?\s*|reservation\s*#?\s*)([a-f0-9-]{36}|\d+)\b/i,
  terminalName: /\b(?:terminal|port)\s+([A-Za-z0-9]+)\b/i,
  date: /\b(\d{4}-\d{2}-\d{2}|tomorrow|today|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
  timeSlot: /\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:am|pm)?)\b/i,
  status: /\b(pending|confirmed|rejected|cancelled|consumed)\b/i,
};

export interface ClassificationOptions {
  model?: string;
  useHeuristics?: boolean;
  confidenceThreshold?: number;
}

export interface ClassificationResult {
  success: boolean;
  classification?: IntentClassification;
  error?: string;
}

/**
 * Heuristic-based intent classification (fast, deterministic)
 */
function classifyWithHeuristics(text: string): {
  intent: IntentType;
  confidence: number;
  entities: Record<string, string | undefined>;
} {
  const lowerText = text.toLowerCase();
  let bookingsScore = 0;
  let slotsScore = 0;
  
  // Count keyword matches
  for (const keyword of INTENT_PATTERNS.bookings.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      bookingsScore += 1;
    }
  }
  
  for (const keyword of INTENT_PATTERNS.slots_availability.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      slotsScore += 1;
    }
  }
  
  // Count pattern matches (weighted higher)
  for (const pattern of INTENT_PATTERNS.bookings.patterns) {
    if (pattern.test(text)) {
      bookingsScore += 2;
    }
    pattern.lastIndex = 0;
  }
  
  for (const pattern of INTENT_PATTERNS.slots_availability.patterns) {
    if (pattern.test(text)) {
      slotsScore += 2;
    }
    pattern.lastIndex = 0;
  }
  
  // Extract entities
  const entities: Record<string, string | undefined> = {};
  
  const bookingIdMatch = text.match(ENTITY_PATTERNS.bookingId);
  if (bookingIdMatch) entities.bookingId = bookingIdMatch[1];
  
  const terminalMatch = text.match(ENTITY_PATTERNS.terminalName);
  if (terminalMatch) entities.terminalName = terminalMatch[1];
  
  const dateMatch = text.match(ENTITY_PATTERNS.date);
  if (dateMatch) entities.date = dateMatch[1];
  
  const timeMatch = text.match(ENTITY_PATTERNS.timeSlot);
  if (timeMatch) entities.timeSlot = `${timeMatch[1]} - ${timeMatch[2]}`;
  
  const statusMatch = text.match(ENTITY_PATTERNS.status);
  if (statusMatch) entities.status = statusMatch[1].toUpperCase();
  
  // Determine intent
  const totalScore = bookingsScore + slotsScore;
  
  if (totalScore === 0) {
    return { intent: 'unknown', confidence: 0.3, entities };
  }
  
  if (bookingsScore > slotsScore) {
    const confidence = Math.min(0.9, 0.5 + (bookingsScore / totalScore) * 0.4);
    return { intent: 'bookings', confidence, entities };
  }
  
  if (slotsScore > bookingsScore) {
    const confidence = Math.min(0.9, 0.5 + (slotsScore / totalScore) * 0.4);
    return { intent: 'slots_availability', confidence, entities };
  }
  
  // Equal scores - ambiguous
  return { intent: 'bookings', confidence: 0.5, entities };
}

/**
 * LLM-based intent classification (accurate, but slower)
 */
async function classifyWithLLM(
  sanitizedInput: SanitizedInput,
  model: string
): Promise<IntentClassification> {
  const systemPrompt = `You are an intent classifier for a port terminal management system.
Your job is to analyze user requests and classify them into one of two categories:

1. **bookings**: Requests related to creating, modifying, cancelling, viewing, or managing booking appointments.
   Examples: "Book a slot", "Cancel my reservation", "Where is my booking #123?", "Approve the pending booking"

2. **slots_availability**: Requests about terminal capacity, available slots, peak hours, equipment constraints, or finding optimal booking times.
   Examples: "Show available slots", "What's the capacity at Terminal A?", "When is the best time to book?", "Peak hours analysis"

3. **unknown**: If you cannot determine the intent with reasonable confidence.

Also extract any relevant entities from the request:
- terminalId/terminalName: Which terminal is being referenced
- bookingId: Any booking reference numbers
- date: Mentioned dates (normalize to ISO format if possible)
- timeSlot: Mentioned time ranges
- driverId: Any driver references
- status: Booking status mentions (PENDING, CONFIRMED, etc.)

Be precise with confidence scores:
- 0.9+ : Very clear, unambiguous intent
- 0.7-0.9: Clear intent with good confidence
- 0.5-0.7: Likely intent but some ambiguity
- <0.5: Unclear, may need clarification`;

  const { object } = await generateObject({
    model: mistral(model),
    schema: ClassificationResultSchema,
    system: systemPrompt,
    prompt: `Classify this request:\n\n"${sanitizedInput.sanitizedText}"\n\nUser role: ${sanitizedInput.metadata.userRole || 'unknown'}`,
  });
  
  return object as IntentClassification;
}

/**
 * Hybrid classification combining heuristics and LLM
 */
export async function classifyIntent(
  sanitizedInput: SanitizedInput,
  options: ClassificationOptions = {}
): Promise<ClassificationResult> {
  const {
    model = 'mistral-large-latest',
    useHeuristics = true,
    confidenceThreshold = 0.7,
  } = options;
  
  try {
    // Step 2.1: Fast heuristic classification
    const heuristicResult = classifyWithHeuristics(sanitizedInput.sanitizedText);
    
    // Step 2.2: If heuristics are confident enough, use them
    if (useHeuristics && heuristicResult.confidence >= confidenceThreshold) {
      const classification: IntentClassification = {
        primaryIntent: heuristicResult.intent,
        confidence: heuristicResult.confidence,
        requiresClarification: false,
        extractedEntities: heuristicResult.entities as IntentClassification['extractedEntities'],
        reasoning: `Heuristic classification with ${Math.round(heuristicResult.confidence * 100)}% confidence`,
      };
      
      return { success: true, classification };
    }
    
    // Step 2.3: Fall back to LLM for complex/ambiguous cases
    const llmClassification = await classifyWithLLM(sanitizedInput, model);
    
    // Step 2.4: Merge heuristic entities with LLM classification
    const mergedEntities = {
      ...llmClassification.extractedEntities,
      // Prefer heuristic entities for structured data (more reliable regex extraction)
      ...(heuristicResult.entities.bookingId && { bookingId: heuristicResult.entities.bookingId }),
      ...(heuristicResult.entities.terminalName && !llmClassification.extractedEntities.terminalName && 
          { terminalName: heuristicResult.entities.terminalName }),
    };
    
    const classification: IntentClassification = {
      ...llmClassification,
      extractedEntities: mergedEntities,
      // Determine if clarification is needed
      requiresClarification: llmClassification.confidence < 0.5,
      clarificationQuestion: llmClassification.confidence < 0.5
        ? generateClarificationQuestion(llmClassification)
        : undefined,
    };
    
    return { success: true, classification };
    
  } catch (error) {
    return {
      success: false,
      error: `Intent classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate a clarification question when intent is ambiguous
 */
function generateClarificationQuestion(classification: IntentClassification): string {
  if (classification.primaryIntent === 'unknown') {
    return 'I\'m not sure what you\'d like to do. Are you looking to:\n' +
           '1. Create, view, or manage a booking?\n' +
           '2. Check slot availability or terminal capacity?\n\n' +
           'Please provide more details.';
  }
  
  if (classification.secondaryIntent) {
    return `I detected your request might be about ${classification.primaryIntent} or ${classification.secondaryIntent}. ` +
           `Could you clarify which one you need help with?`;
  }
  
  return 'Could you please provide more details about your request?';
}

/**
 * Creates an intent classifier with preset options
 */
export function createIntentClassifier(defaultOptions: ClassificationOptions = {}) {
  return (sanitizedInput: SanitizedInput, overrides: Partial<ClassificationOptions> = {}) => {
    return classifyIntent(sanitizedInput, { ...defaultOptions, ...overrides });
  };
}
