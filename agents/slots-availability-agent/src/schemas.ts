import { z } from 'zod';

// ============ Terminal Schemas ============
export const TerminalStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);

export type TerminalStatus = z.infer<typeof TerminalStatusSchema>;

export const TerminalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: TerminalStatusSchema,
  maxSlots: z.number(),
  availableSlots: z.number(),
  coordX: z.number(),
  coordY: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Terminal = z.infer<typeof TerminalSchema>;

// ============ Booking Schemas ============
export const BookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'CONSUMED',
]);

export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  id: z.string().uuid(),
  carrierUserId: z.string().uuid(),
  driverUserId: z.string().uuid().nullable(),
  terminalId: z.string().uuid(),
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: BookingStatusSchema,
  decidedByOperatorUserId: z.string().uuid().nullable(),
  qrPayload: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  terminal: TerminalSchema.optional(),
  carrier: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      carrierProfile: z
        .object({
          companyName: z.string(),
          firstName: z.string(),
          lastName: z.string(),
        })
        .nullable(),
    })
    .optional(),
  driver: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      driverProfile: z
        .object({
          firstName: z.string(),
          lastName: z.string(),
          truckNumber: z.string(),
          truckPlate: z.string(),
        })
        .nullable(),
    })
    .nullable()
    .optional(),
});

export type Booking = z.infer<typeof BookingSchema>;

// ============ Tool Input Schemas ============

// Create Terminal (Admin only)
export const CreateTerminalInputSchema = z.object({
  name: z.string().describe('The name of the terminal'),
  status: TerminalStatusSchema.optional()
    .default('ACTIVE')
    .describe('Terminal status: ACTIVE or SUSPENDED'),
  maxSlots: z.number().int().positive().describe('Maximum number of slots at the terminal'),
  availableSlots: z.number().int().min(0).describe('Number of currently available slots'),
  coordX: z.number().describe('X coordinate (longitude) of the terminal location'),
  coordY: z.number().describe('Y coordinate (latitude) of the terminal location'),
});

export type CreateTerminalInput = z.infer<typeof CreateTerminalInputSchema>;

// Get Terminal by ID
export const GetTerminalByIdInputSchema = z.object({
  terminalId: z.string().uuid().describe('The unique identifier of the terminal'),
});

export type GetTerminalByIdInput = z.infer<typeof GetTerminalByIdInputSchema>;

// Get Carrier Bookings
export const GetCarrierBookingsInputSchema = z.object({
  status: BookingStatusSchema.optional().describe(
    'Filter bookings by status: PENDING, CONFIRMED, REJECTED, CANCELLED, or CONSUMED'
  ),
});

export type GetCarrierBookingsInput = z.infer<typeof GetCarrierBookingsInputSchema>;

// ============ Capacity Analysis Schemas ============
export const CapacityAnalysisSchema = z.object({
  terminalId: z.string().uuid(),
  terminalName: z.string(),
  maxSlots: z.number(),
  availableSlots: z.number(),
  utilizationPercentage: z.number(),
  status: TerminalStatusSchema,
});

export type CapacityAnalysis = z.infer<typeof CapacityAnalysisSchema>;

export const SlotAvailabilityQuerySchema = z.object({
  terminalId: z.string().uuid().optional().describe('Specific terminal ID to check'),
  date: z.string().optional().describe('Date to check availability for (YYYY-MM-DD format)'),
  timeSlot: z
    .enum(['MORNING', 'AFTERNOON', 'EVENING'])
    .optional()
    .describe('Time slot preference: MORNING (6-12), AFTERNOON (12-18), EVENING (18-22)'),
});

export type SlotAvailabilityQuery = z.infer<typeof SlotAvailabilityQuerySchema>;
