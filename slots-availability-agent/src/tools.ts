import { tool } from 'ai';
import { ApiClient } from './api-client.js';
import {
  CreateTerminalInputSchema,
  GetTerminalByIdInputSchema,
  GetCarrierBookingsInputSchema,
  SlotAvailabilityQuerySchema,
  type Terminal,
  type Booking,
  type CapacityAnalysis,
} from './schemas.js';
import { z } from 'zod';

/**
 * Creates all slot availability agent tools bound to an API client
 */
export function createSlotAvailabilityTools(apiClient: ApiClient) {
  // ============ Terminal Management Tools ============

  const createTerminal = tool({
    description: `Create a new terminal in the port system. This tool is for ADMIN users only.
    Use this when setting up new terminal capacity or expanding port operations.
    The terminal will be created with the specified slot capacity and location.`,
    parameters: CreateTerminalInputSchema,
    execute: async ({ name, status, maxSlots, availableSlots, coordX, coordY }) => {
      const response = await apiClient.post<Terminal>('/admin/terminals', {
        name,
        status: status || 'ACTIVE',
        maxSlots,
        availableSlots,
        coordX,
        coordY,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error,
          message: `Failed to create terminal: ${response.error}`,
        };
      }

      return {
        success: true,
        message: `Terminal "${name}" created successfully with ${maxSlots} total slots`,
        terminal: response.data,
        capacityInfo: {
          maxSlots,
          availableSlots,
          utilizationPercentage: ((maxSlots - availableSlots) / maxSlots) * 100,
        },
      };
    },
  });

  const getTerminalById = tool({
    description: `Get detailed information about a specific terminal including its current capacity state.
    Returns terminal name, status, max slots, available slots, utilization rate, and location coordinates.
    Use this to understand the current capacity state of a specific terminal.`,
    parameters: GetTerminalByIdInputSchema,
    execute: async ({ terminalId }) => {
      const response = await apiClient.get<Terminal>(`/admin/terminals/${terminalId}`);

      if (!response.success) {
        return {
          error: response.error,
          terminal: null,
          message: `Failed to get terminal: ${response.error}`,
        };
      }

      const terminal = response.data!;
      const utilizationPercentage =
        ((terminal.maxSlots - terminal.availableSlots) / terminal.maxSlots) * 100;

      const capacityAnalysis: CapacityAnalysis = {
        terminalId: terminal.id,
        terminalName: terminal.name,
        maxSlots: terminal.maxSlots,
        availableSlots: terminal.availableSlots,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        status: terminal.status,
      };

      // Determine capacity status
      let capacityStatus: string;
      if (terminal.availableSlots === 0) {
        capacityStatus = 'FULL - No slots available';
      } else if (utilizationPercentage >= 80) {
        capacityStatus = 'HIGH UTILIZATION - Limited slots available';
      } else if (utilizationPercentage >= 50) {
        capacityStatus = 'MODERATE UTILIZATION - Good availability';
      } else {
        capacityStatus = 'LOW UTILIZATION - Many slots available';
      }

      return {
        terminal,
        capacityAnalysis,
        capacityStatus,
        recommendations:
          terminal.availableSlots === 0
            ? 'Consider checking other terminals or off-peak hours'
            : utilizationPercentage >= 80
              ? 'Book soon as slots are filling up quickly'
              : 'Good time to book with plenty of availability',
      };
    },
  });

  // ============ Booking Analysis Tools ============

  const getCarrierBookings = tool({
    description: `Get all bookings for the current carrier to analyze slot utilization patterns.
    Can filter by status (PENDING, CONFIRMED, REJECTED, CANCELLED, CONSUMED).
    Use this to understand booking patterns, peak times, and slot demand.`,
    parameters: GetCarrierBookingsInputSchema,
    execute: async ({ status }) => {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiClient.get<Booking[]>(`/carrier/bookings${queryParams}`);

      if (!response.success) {
        return {
          error: response.error,
          bookings: [],
          message: `Failed to get bookings: ${response.error}`,
        };
      }

      const bookings = response.data || [];

      // Analyze booking patterns
      const terminalUsage: Record<string, number> = {};
      const timeSlotUsage: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};

      bookings.forEach((booking) => {
        // Count by terminal
        const terminalName = booking.terminal?.name || booking.terminalId;
        terminalUsage[terminalName] = (terminalUsage[terminalName] || 0) + 1;

        // Count by status
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;

        // Analyze time slots
        const startHour = new Date(booking.startTime).getHours();
        let timeSlot: string;
        if (startHour >= 6 && startHour < 12) {
          timeSlot = 'MORNING (6-12)';
        } else if (startHour >= 12 && startHour < 18) {
          timeSlot = 'AFTERNOON (12-18)';
        } else {
          timeSlot = 'EVENING (18-22)';
        }
        timeSlotUsage[timeSlot] = (timeSlotUsage[timeSlot] || 0) + 1;
      });

      // Find peak and off-peak patterns
      const sortedTimeSlots = Object.entries(timeSlotUsage).sort((a, b) => b[1] - a[1]);
      const peakTimeSlot = sortedTimeSlots[0]?.[0] || 'N/A';
      const offPeakTimeSlot = sortedTimeSlots[sortedTimeSlots.length - 1]?.[0] || 'N/A';

      return {
        bookings,
        count: bookings.length,
        filter: status || 'ALL',
        analysis: {
          terminalUsage,
          timeSlotUsage,
          statusCounts,
          peakTimeSlot,
          offPeakTimeSlot,
          recommendations:
            bookings.length > 0
              ? `Peak demand is during ${peakTimeSlot}. Consider booking during ${offPeakTimeSlot} for better availability.`
              : 'No booking history available for analysis.',
        },
      };
    },
  });

  // ============ Capacity Analysis Tools ============

  const analyzeSlotAvailability = tool({
    description: `Analyze slot availability across terminals with optional filters.
    Can check availability for a specific terminal, date, or time slot preference.
    Provides recommendations based on current capacity state and typical usage patterns.`,
    parameters: SlotAvailabilityQuerySchema,
    execute: async ({ terminalId, date, timeSlot }) => {
      // If specific terminal requested, get its details
      if (terminalId) {
        const terminalResponse = await apiClient.get<Terminal>(
          `/admin/terminals/${terminalId}`
        );

        if (!terminalResponse.success) {
          return {
            error: terminalResponse.error,
            message: `Failed to analyze terminal: ${terminalResponse.error}`,
          };
        }

        const terminal = terminalResponse.data!;
        const utilizationPercentage =
          ((terminal.maxSlots - terminal.availableSlots) / terminal.maxSlots) * 100;

        return {
          terminal: {
            id: terminal.id,
            name: terminal.name,
            status: terminal.status,
            maxSlots: terminal.maxSlots,
            availableSlots: terminal.availableSlots,
            utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
          },
          requestedDate: date || 'Not specified',
          requestedTimeSlot: timeSlot || 'Not specified',
          availability: terminal.availableSlots > 0 ? 'AVAILABLE' : 'FULL',
          peakHourInfo: getPeakHourInfo(timeSlot),
          recommendations: getRecommendations(terminal, timeSlot),
        };
      }

      // Get all terminals for overview
      const terminalsResponse = await apiClient.get<Terminal[]>('/admin/terminals');

      if (!terminalsResponse.success) {
        return {
          error: terminalsResponse.error,
          message: `Failed to get terminals: ${terminalsResponse.error}`,
        };
      }

      const terminals = terminalsResponse.data || [];

      const capacityOverview = terminals.map((terminal) => {
        const utilizationPercentage =
          ((terminal.maxSlots - terminal.availableSlots) / terminal.maxSlots) * 100;
        return {
          id: terminal.id,
          name: terminal.name,
          status: terminal.status,
          maxSlots: terminal.maxSlots,
          availableSlots: terminal.availableSlots,
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
          availability:
            terminal.availableSlots === 0
              ? 'FULL'
              : utilizationPercentage >= 80
                ? 'LIMITED'
                : 'AVAILABLE',
        };
      });

      // Sort by availability (most available first)
      capacityOverview.sort((a, b) => b.availableSlots - a.availableSlots);

      const totalSlots = terminals.reduce((sum, t) => sum + t.maxSlots, 0);
      const totalAvailable = terminals.reduce((sum, t) => sum + t.availableSlots, 0);
      const overallUtilization = totalSlots > 0 ? ((totalSlots - totalAvailable) / totalSlots) * 100 : 0;

      return {
        requestedDate: date || 'Not specified',
        requestedTimeSlot: timeSlot || 'Not specified',
        overallCapacity: {
          totalTerminals: terminals.length,
          activeTerminals: terminals.filter((t) => t.status === 'ACTIVE').length,
          totalSlots,
          totalAvailable,
          overallUtilization: Math.round(overallUtilization * 100) / 100,
        },
        terminals: capacityOverview,
        peakHourInfo: getPeakHourInfo(timeSlot),
        recommendations: getOverallRecommendations(capacityOverview, timeSlot),
      };
    },
  });

  const getCapacityConstraints = tool({
    description: `Get information about capacity constraints, equipment limitations, and peak-hour restrictions.
    This provides context about operational constraints that affect slot availability.`,
    parameters: z.object({}),
    execute: async () => {
      // This provides general constraint information
      // In a real implementation, this could fetch from a configuration API
      return {
        equipmentConstraints: {
          description: 'Equipment availability may limit certain operations during specific hours',
          factors: [
            'Crane availability for container operations',
            'Loading/unloading equipment maintenance windows',
            'Personnel shift changes',
          ],
        },
        peakHourRestrictions: {
          morningPeak: {
            hours: '07:00 - 10:00',
            description: 'High demand period - book early for guaranteed slots',
            expectedUtilization: '80-95%',
          },
          afternoonPeak: {
            hours: '14:00 - 17:00',
            description: 'Moderate to high demand - good availability if booked 24h ahead',
            expectedUtilization: '60-80%',
          },
          offPeak: {
            hours: '10:00 - 14:00, 17:00 - 20:00',
            description: 'Lower demand - best time for flexible bookings',
            expectedUtilization: '30-60%',
          },
        },
        bookingRules: {
          minimumAdvanceBooking: '2 hours',
          maximumAdvanceBooking: '30 days',
          slotDuration: '1 hour minimum',
          cancellationPolicy: 'Free cancellation up to 2 hours before slot time',
        },
        recommendations: [
          'Book morning slots at least 24 hours in advance',
          'Off-peak hours offer the best availability',
          'Check terminal-specific constraints for specialized equipment needs',
          'Consider alternative terminals during peak hours',
        ],
      };
    },
  });

  return {
    createTerminal,
    getTerminalById,
    getCarrierBookings,
    analyzeSlotAvailability,
    getCapacityConstraints,
  };
}

// ============ Helper Functions ============

function getPeakHourInfo(timeSlot?: string): {
  isPeakHour: boolean;
  description: string;
  recommendation: string;
} {
  if (!timeSlot) {
    return {
      isPeakHour: false,
      description: 'No time slot specified',
      recommendation: 'Specify a time slot for peak hour analysis',
    };
  }

  switch (timeSlot) {
    case 'MORNING':
      return {
        isPeakHour: true,
        description: 'Morning hours (6-12) typically have high demand',
        recommendation: 'Book at least 24 hours in advance for morning slots',
      };
    case 'AFTERNOON':
      return {
        isPeakHour: true,
        description: 'Afternoon hours (12-18) have moderate to high demand',
        recommendation: 'Good availability if booked 12-24 hours ahead',
      };
    case 'EVENING':
      return {
        isPeakHour: false,
        description: 'Evening hours (18-22) typically have lower demand',
        recommendation: 'Best time for flexible bookings with good availability',
      };
    default:
      return {
        isPeakHour: false,
        description: 'Unknown time slot',
        recommendation: 'Use MORNING, AFTERNOON, or EVENING for time slot preference',
      };
  }
}

function getRecommendations(terminal: Terminal, timeSlot?: string): string[] {
  const recommendations: string[] = [];
  const utilizationPercentage =
    ((terminal.maxSlots - terminal.availableSlots) / terminal.maxSlots) * 100;

  if (terminal.status === 'SUSPENDED') {
    recommendations.push('This terminal is currently suspended. Please check other terminals.');
    return recommendations;
  }

  if (terminal.availableSlots === 0) {
    recommendations.push('No slots available. Consider off-peak hours or alternative terminals.');
  } else if (utilizationPercentage >= 80) {
    recommendations.push('Limited availability. Book soon to secure your slot.');
  } else {
    recommendations.push('Good availability. Optimal time to book.');
  }

  if (timeSlot === 'MORNING') {
    recommendations.push('Morning slots are in high demand. Book at least 24 hours ahead.');
  } else if (timeSlot === 'EVENING') {
    recommendations.push('Evening slots typically have better availability.');
  }

  return recommendations;
}

function getOverallRecommendations(
  capacityOverview: Array<{
    name: string;
    availableSlots: number;
    availability: string;
  }>,
  timeSlot?: string
): string[] {
  const recommendations: string[] = [];

  const bestTerminal = capacityOverview[0];
  if (bestTerminal && bestTerminal.availableSlots > 0) {
    recommendations.push(
      `Best availability at ${bestTerminal.name} with ${bestTerminal.availableSlots} slots`
    );
  }

  const fullTerminals = capacityOverview.filter((t) => t.availability === 'FULL');
  if (fullTerminals.length > 0) {
    recommendations.push(
      `${fullTerminals.length} terminal(s) are currently full: ${fullTerminals.map((t) => t.name).join(', ')}`
    );
  }

  if (timeSlot === 'MORNING') {
    recommendations.push('Morning slots fill up quickly. Book early for best selection.');
  } else if (timeSlot === 'EVENING') {
    recommendations.push('Evening slots typically have the best availability.');
  }

  return recommendations;
}

export type SlotAvailabilityTools = ReturnType<typeof createSlotAvailabilityTools>;
