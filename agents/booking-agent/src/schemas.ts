import { z } from 'zod';

// ============ Terminal Schemas ============
export const TerminalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
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
  // Included relations
  terminal: TerminalSchema.optional(),
  carrier: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    carrierProfile: z.object({
      companyName: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    }).nullable(),
  }).optional(),
  driver: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    driverProfile: z.object({
      firstName: z.string(),
      lastName: z.string(),
      truckNumber: z.string(),
      truckPlate: z.string(),
    }).nullable(),
  }).nullable().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;

// ============ Tool Input Schemas ============
export const GetTerminalsInputSchema = z.object({});

export const GetTerminalByIdInputSchema = z.object({
  terminalId: z.string().uuid().describe('The unique identifier of the terminal'),
});

export const GetBookingsInputSchema = z.object({
  status: BookingStatusSchema.optional().describe(
    'Filter bookings by status: PENDING, CONFIRMED, REJECTED, CANCELLED, or CONSUMED'
  ),
});

export const ApproveBookingInputSchema = z.object({
  bookingId: z.string().uuid().describe('The unique identifier of the booking to approve'),
});

export const RejectBookingInputSchema = z.object({
  bookingId: z.string().uuid().describe('The unique identifier of the booking to reject'),
});

export const GetCarrierBookingsInputSchema = z.object({
  carrierId: z.string().uuid().describe('The unique identifier of the carrier'),
});

export const CreateBookingInputSchema = z.object({
  terminalId: z.string().uuid().describe('The terminal ID where the booking is made'),
  date: z.string().describe('The date of the booking (ISO 8601 format)'),
  startTime: z.string().describe('The start time of the booking slot (ISO 8601 format)'),
  endTime: z.string().describe('The end time of the booking slot (ISO 8601 format)'),
  driverUserId: z.string().uuid().describe('The driver user ID assigned to this booking'),
});

export const UpdateBookingInputSchema = z.object({
  bookingId: z.string().uuid().describe('The unique identifier of the booking to update'),
  terminalId: z.string().uuid().optional().describe('New terminal ID'),
  date: z.string().optional().describe('New date (ISO 8601 format)'),
  startTime: z.string().optional().describe('New start time (ISO 8601 format)'),
  endTime: z.string().optional().describe('New end time (ISO 8601 format)'),
  driverUserId: z.string().uuid().optional().describe('New driver user ID'),
});

export const CancelBookingInputSchema = z.object({
  bookingId: z.string().uuid().describe('The unique identifier of the booking to cancel'),
});

export const GetMyBookingsInputSchema = z.object({
  status: BookingStatusSchema.optional().describe('Filter by booking status'),
});

export const GetBookingStatusInputSchema = z.object({
  bookingId: z.string().uuid().describe('The booking ID to check status for'),
});
