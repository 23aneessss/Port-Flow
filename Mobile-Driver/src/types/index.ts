/**
 * PORT FLOW DRIVER - Type Definitions
 */

// Booking status types
export type BookingStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'REJECTED'
    | 'CONSUMED'
    | 'CANCELLED'
    | 'EXPIRED';

// Driver profile from API
export interface Driver {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    transporterId: string;
    transporterName: string;
    truckNumber?: string;
    truckPlate?: string;
    createdAt: string;
    updatedAt: string;
}

// Booking/Mission data
export interface Booking {
    id: string;
    reference: string;
    terminalName: string;
    terminalId: string;
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    status: BookingStatus;
    driverId: string;
    driverName: string;
    driverPhone: string;
    transporterName: string;
    vehiclePlate?: string;
    containerReference?: string;
    qrPayload: string; // Used to generate QR code
    createdAt: string;
    updatedAt: string;
}

// Notification types
export type NotificationType =
    | 'BOOKING_CONFIRMED'
    | 'QR_READY'
    | 'GENERIC'
    | 'REMINDER_15M'
    | 'BOOKING_CANCELLED'
    | 'BOOKING_UPDATED'
    | 'SYSTEM';

// Notification from API
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    bookingId?: string;
    isRead: boolean;
    createdAt: string;
}

// Auth response
export interface AuthResponse {
    token: string;
    driver: Driver;
}

// API error response
export interface ApiError {
    message: string;
    code?: string;
    statusCode: number;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Navigation param types
export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Main: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    QRCode: { bookingId?: string } | undefined;
    Notifications: undefined;
    History: undefined;
    Profile: undefined;
};

// QR availability result
export interface QRAvailabilityResult {
    isAvailable: boolean;
    minutesRemaining: number;
    secondsRemaining: number;
}
