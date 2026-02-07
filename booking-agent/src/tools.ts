import { tool } from 'ai';
import { ApiClient } from './api-client.js';
import {
  GetTerminalsInputSchema,
  GetTerminalByIdInputSchema,
  GetBookingsInputSchema,
  ApproveBookingInputSchema,
  RejectBookingInputSchema,
  GetCarrierBookingsInputSchema,
  CreateBookingInputSchema,
  UpdateBookingInputSchema,
  CancelBookingInputSchema,
  GetMyBookingsInputSchema,
  GetBookingStatusInputSchema,
  type Terminal,
  type Booking,
} from './schemas.js';

/**
 * Creates all booking agent tools bound to an API client
 */
export function createBookingTools(apiClient: ApiClient) {
  // ============ Admin/Terminal Tools ============

  const getTerminals = tool({
    description:
      'Get a list of all terminals in the port system. Returns terminal details including name, status, available slots, and coordinates.',
    parameters: GetTerminalsInputSchema,
    execute: async () => {
      const response = await apiClient.get<Terminal[]>('/admin/terminals');
      if (!response.success) {
        return { error: response.error, terminals: [] };
      }
      return {
        terminals: response.data || [],
        count: response.data?.length || 0,
      };
    },
  });

  const getTerminalById = tool({
    description:
      'Get detailed information about a specific terminal by its ID. Returns terminal name, status, capacity, and location.',
    parameters: GetTerminalByIdInputSchema,
    execute: async ({ terminalId }) => {
      const response = await apiClient.get<Terminal>(
        `/admin/terminals/${terminalId}`
      );
      if (!response.success) {
        return { error: response.error, terminal: null };
      }
      return { terminal: response.data };
    },
  });

  // ============ Operator Tools ============

  const getOperatorBookings = tool({
    description:
      'Get all bookings visible to operators. Can filter by status (PENDING, CONFIRMED, REJECTED, CANCELLED, CONSUMED). Used to review and manage booking requests.',
    parameters: GetBookingsInputSchema,
    execute: async ({ status }) => {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiClient.get<Booking[]>(
        `/operator/bookings${queryParams}`
      );
      if (!response.success) {
        return { error: response.error, bookings: [] };
      }
      return {
        bookings: response.data || [],
        count: response.data?.length || 0,
        filter: status || 'ALL',
      };
    },
  });

  const approveBooking = tool({
    description:
      'Approve a pending booking request. This will confirm the booking and notify the carrier. Only works on bookings with PENDING status.',
    parameters: ApproveBookingInputSchema,
    execute: async ({ bookingId }) => {
      const response = await apiClient.post<Booking>(
        `/operator/bookings/${bookingId}/approve`
      );
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          message: `Failed to approve booking: ${response.error}`,
        };
      }
      return {
        success: true,
        message: `Booking ${bookingId} has been approved successfully`,
        booking: response.data,
      };
    },
  });

  const rejectBooking = tool({
    description:
      'Reject a pending booking request. This will mark the booking as rejected and notify the carrier. Only works on bookings with PENDING status.',
    parameters: RejectBookingInputSchema,
    execute: async ({ bookingId }) => {
      const response = await apiClient.post<Booking>(
        `/operator/bookings/${bookingId}/reject`
      );
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          message: `Failed to reject booking: ${response.error}`,
        };
      }
      return {
        success: true,
        message: `Booking ${bookingId} has been rejected`,
        booking: response.data,
      };
    },
  });

  const getCarrierBookings = tool({
    description:
      'Get all bookings for a specific carrier by their carrier ID. Useful for operators to review a carrier\'s booking history.',
    parameters: GetCarrierBookingsInputSchema,
    execute: async ({ carrierId }) => {
      const response = await apiClient.get<Booking[]>(
        `/operator/carriers/${carrierId}/bookings`
      );
      if (!response.success) {
        return { error: response.error, bookings: [] };
      }
      return {
        bookings: response.data || [],
        count: response.data?.length || 0,
        carrierId,
      };
    },
  });

  // ============ Carrier Tools ============

  const createBooking = tool({
    description:
      'Create a new booking request for a carrier. Requires terminal ID, date, time slot, and driver assignment. The booking starts in PENDING status awaiting operator approval.',
    parameters: CreateBookingInputSchema,
    execute: async ({ terminalId, date, startTime, endTime, driverUserId }) => {
      const response = await apiClient.post<Booking>('/carrier/bookings', {
        terminalId,
        date,
        startTime,
        endTime,
        driverUserId,
      });
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          message: `Failed to create booking: ${response.error}`,
        };
      }
      return {
        success: true,
        message: 'Booking created successfully and is pending approval',
        booking: response.data,
      };
    },
  });

  const getMyBookings = tool({
    description:
      'Get all bookings for the currently authenticated carrier. Can optionally filter by status.',
    parameters: GetMyBookingsInputSchema,
    execute: async ({ status }) => {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiClient.get<Booking[]>(
        `/carrier/bookings${queryParams}`
      );
      if (!response.success) {
        return { error: response.error, bookings: [] };
      }
      return {
        bookings: response.data || [],
        count: response.data?.length || 0,
      };
    },
  });

  const updateBooking = tool({
    description:
      'Update an existing booking. Can modify terminal, date, time slot, or driver assignment. Only works on bookings with PENDING status.',
    parameters: UpdateBookingInputSchema,
    execute: async ({
      bookingId,
      terminalId,
      date,
      startTime,
      endTime,
      driverUserId,
    }) => {
      const updateData: Record<string, unknown> = {};
      if (terminalId) updateData.terminalId = terminalId;
      if (date) updateData.date = date;
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (driverUserId) updateData.driverUserId = driverUserId;

      const response = await apiClient.put<Booking>(
        `/carrier/bookings/${bookingId}`,
        updateData
      );
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          message: `Failed to update booking: ${response.error}`,
        };
      }
      return {
        success: true,
        message: `Booking ${bookingId} updated successfully`,
        booking: response.data,
      };
    },
  });

  const cancelBooking = tool({
    description:
      'Cancel an existing booking. This will mark the booking as cancelled. Only works on bookings with PENDING status.',
    parameters: CancelBookingInputSchema,
    execute: async ({ bookingId }) => {
      const response = await apiClient.delete<{ message: string }>(
        `/carrier/bookings/${bookingId}`
      );
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          message: `Failed to cancel booking: ${response.error}`,
        };
      }
      return {
        success: true,
        message: `Booking ${bookingId} has been cancelled`,
      };
    },
  });

  // ============ Utility Tools ============

  const getBookingStatus = tool({
    description:
      'Check the status of a specific booking by its ID. Returns the current status and all booking details. Useful for answering questions like "Where is my booking #5432?"',
    parameters: GetBookingStatusInputSchema,
    execute: async ({ bookingId }) => {
      // Try carrier endpoint first, fall back to operator endpoint
      let response = await apiClient.get<Booking>(
        `/carrier/bookings`
      );
      
      if (response.success && Array.isArray(response.data)) {
        const booking = response.data.find((b: Booking) => b.id === bookingId);
        if (booking) {
          return {
            found: true,
            booking,
            status: booking.status,
            message: `Booking ${bookingId} is currently ${booking.status}`,
          };
        }
      }

      // Try operator endpoint
      response = await apiClient.get<Booking[]>('/operator/bookings');
      if (response.success && Array.isArray(response.data)) {
        const booking = response.data.find((b: Booking) => b.id === bookingId);
        if (booking) {
          return {
            found: true,
            booking,
            status: booking.status,
            message: `Booking ${bookingId} is currently ${booking.status}`,
          };
        }
      }

      return {
        found: false,
        error: 'Booking not found',
        message: `Could not find booking with ID ${bookingId}`,
      };
    },
  });

  return {
    // Admin/Terminal tools
    getTerminals,
    getTerminalById,
    // Operator tools
    getOperatorBookings,
    approveBooking,
    rejectBooking,
    getCarrierBookings,
    // Carrier tools
    createBooking,
    getMyBookings,
    updateBooking,
    cancelBooking,
    // Utility tools
    getBookingStatus,
  };
}

export type BookingTools = ReturnType<typeof createBookingTools>;
