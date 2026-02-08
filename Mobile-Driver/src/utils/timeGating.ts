/**
 * PORT FLOW DRIVER - Time Gating Utilities
 * Critical security logic for QR code availability
 */

import { QRAvailabilityResult } from '../types';

const QR_AVAILABLE_MINUTES_BEFORE = 15;

/**
 * Check if QR code is available based on booking start time
 * QR becomes available 15 minutes before the slot start time
 * 
 * @param startTimeISO - ISO 8601 formatted start time
 * @param now - Current date (defaults to new Date())
 * @returns boolean - true if QR should be displayed
 */
export function isQrAvailable(startTimeISO: string, now: Date = new Date()): boolean {
    const startTime = new Date(startTimeISO);
    const qrAvailableTime = new Date(startTime.getTime() - QR_AVAILABLE_MINUTES_BEFORE * 60 * 1000);
    return now >= qrAvailableTime;
}

/**
 * Get detailed QR availability status with countdown
 * 
 * @param startTimeISO - ISO 8601 formatted start time
 * @param now - Current date (defaults to new Date())
 * @returns QRAvailabilityResult with availability and time remaining
 */
export function getQrAvailability(startTimeISO: string, now: Date = new Date()): QRAvailabilityResult {
    const startTime = new Date(startTimeISO);
    const qrAvailableTime = new Date(startTime.getTime() - QR_AVAILABLE_MINUTES_BEFORE * 60 * 1000);

    const isAvailable = now >= qrAvailableTime;

    if (isAvailable) {
        return {
            isAvailable: true,
            minutesRemaining: 0,
            secondsRemaining: 0,
        };
    }

    const diffMs = qrAvailableTime.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const minutesRemaining = Math.floor(totalSeconds / 60);
    const secondsRemaining = totalSeconds % 60;

    return {
        isAvailable: false,
        minutesRemaining,
        secondsRemaining,
    };
}

/**
 * Format countdown string for display
 * 
 * @param minutesRemaining - Minutes remaining
 * @param secondsRemaining - Seconds remaining
 * @returns Formatted string like "14:32"
 */
export function formatCountdown(minutesRemaining: number, secondsRemaining: number): string {
    const mins = minutesRemaining.toString().padStart(2, '0');
    const secs = secondsRemaining.toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

/**
 * Check if a booking has passed (ended)
 */
export function isBookingPast(endTimeISO: string, now: Date = new Date()): boolean {
    const endTime = new Date(endTimeISO);
    return now > endTime;
}

/**
 * Check if booking is currently active (between start and end)
 */
export function isBookingActive(startTimeISO: string, endTimeISO: string, now: Date = new Date()): boolean {
    const startTime = new Date(startTimeISO);
    const endTime = new Date(endTimeISO);
    return now >= startTime && now <= endTime;
}
