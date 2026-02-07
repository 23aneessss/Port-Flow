/**
 * PORT FLOW DRIVER - Mock Data for Development
 * Use this when API is unavailable
 */

import { Booking, Notification, Driver, AuthResponse } from '../types';

// Mock driver profile
export const mockDriver: Driver = {
    id: 'drv-001',
    email: 'jean.dupont@transport.fr',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+33 6 12 34 56 78',
    transporterId: 'trp-001',
    transporterName: 'Transport Express SARL',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
};

// Helper to create a booking at a specific time offset
function createMockBooking(
    id: string,
    hoursFromNow: number,
    status: 'CONFIRMED' | 'CONSUMED' = 'CONFIRMED'
): Booking {
    const now = new Date();
    const startTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour slot

    return {
        id,
        reference: `BKG-${id.toUpperCase()}`,
        terminalName: 'Terminal Maritime Nord',
        terminalId: 'term-001',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status,
        driverId: mockDriver.id,
        driverName: `${mockDriver.firstName} ${mockDriver.lastName}`,
        driverPhone: mockDriver.phone,
        transporterName: mockDriver.transporterName,
        vehiclePlate: 'AB-123-CD',
        containerReference: 'MSKU-1234567',
        qrPayload: JSON.stringify({
            bookingId: id,
            reference: `BKG-${id.toUpperCase()}`,
            driverId: mockDriver.id,
            validFrom: startTime.toISOString(),
            validUntil: endTime.toISOString(),
            hash: 'MOCK_SECURITY_HASH_' + id,
        }),
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
    };
}

// Current/upcoming booking (starts in 10 minutes - QR should be available)
export const mockCurrentBooking: Booking = createMockBooking('001', 0.167); // 10 minutes from now

// Future booking (starts in 2 hours - QR NOT available yet)
export const mockFutureBooking: Booking = createMockBooking('002', 2);

// Mock bookings array
export const mockBookings: Booking[] = [
    mockCurrentBooking,
    mockFutureBooking,
];

// Mock history (consumed bookings)
export const mockHistory: Booking[] = [
    createMockBooking('hist-001', -48, 'CONSUMED'),
    createMockBooking('hist-002', -72, 'CONSUMED'),
    createMockBooking('hist-003', -120, 'CONSUMED'),
];

// Mock notifications
export const mockNotifications: Notification[] = [
    {
        id: 'notif-001',
        type: 'REMINDER_15M',
        title: 'QR Code disponible',
        message: 'Votre QR code est maintenant accessible pour le trajet de 14h00 - Terminal Maritime Nord',
        bookingId: '001',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    },
    {
        id: 'notif-002',
        type: 'BOOKING_CONFIRMED',
        title: 'Trajet confirmé',
        message: 'Trajet confirmé le 06/02 à 14:00 — Terminal Maritime Nord',
        bookingId: '001',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: 'notif-003',
        type: 'BOOKING_CONFIRMED',
        title: 'Nouveau trajet assigné',
        message: 'Un nouveau trajet vous a été assigné pour le 07/02 à 10:00',
        bookingId: '002',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
        id: 'notif-004',
        type: 'SYSTEM',
        title: 'Bienvenue sur PORT FLOW',
        message: 'Votre compte chauffeur a été créé avec succès.',
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    },
];

// Mock auth response
export const mockAuthResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_for_development',
    driver: mockDriver,
};

export default {
    mockDriver,
    mockBookings,
    mockCurrentBooking,
    mockFutureBooking,
    mockHistory,
    mockNotifications,
    mockAuthResponse,
};
