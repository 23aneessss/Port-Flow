/**
 * PORT FLOW DRIVER - API Client
 */

import { getToken } from '../utils/storage';
import {
    AuthResponse,
    Booking,
    BookingStatus,
    Driver,
    LoginCredentials,
    Notification,
    NotificationType,
} from '../types';

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

interface BackendAuthResponse {
    token: string;
    role: 'ADMIN' | 'OPERATOR' | 'CARRIER' | 'DRIVER';
    userId: string;
}

interface BackendDriverProfile {
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

interface BackendBooking {
    id: string;
    carrierUserId: string;
    driverUserId: string | null;
    terminalId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    qrPayload: string | null;
    createdAt: string;
    updatedAt: string;
    terminal?: {
        id: string;
        name: string;
    };
    carrier?: {
        id: string;
        carrierProfile?: {
            companyName: string;
        } | null;
    };
    driver?: {
        id: string;
        email: string;
        driverProfile?: {
            firstName: string;
            lastName: string;
            phone: string;
            truckNumber?: string;
            truckPlate?: string;
        } | null;
    } | null;
}

interface BackendNotification {
    id: string;
    type: 'BOOKING_CONFIRMED' | 'QR_READY' | 'GENERIC';
    message: string;
    relatedBookingId?: string | null;
    isRead: boolean;
    createdAt: string;
}

/**
 * Custom API error class
 */
export class ApiException extends Error {
    statusCode: number;
    code?: string;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ApiException';
    }
}

async function parseJsonSafely(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

async function getAuthHeaders(tokenOverride?: string): Promise<HeadersInit> {
    const token = tokenOverride ?? (await getToken());
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

interface ApiRequestOptions extends RequestInit {
    tokenOverride?: string;
}

async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { tokenOverride, ...fetchOptions } = options;
    const url = `${BASE_URL}${endpoint}`;
    const headers = await getAuthHeaders(tokenOverride);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                ...headers,
                ...fetchOptions.headers,
            },
        });

        const data = await parseJsonSafely(response);

        if (!response.ok) {
            throw new ApiException(
                data?.message || 'Une erreur est survenue',
                response.status,
                data?.code
            );
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiException) {
            throw error;
        }

        throw new ApiException(
            'Impossible de contacter le serveur. Vérifiez votre connexion.',
            0,
            'NETWORK_ERROR'
        );
    }
}

function bookingReference(bookingId: string): string {
    return `BKG-${bookingId.slice(0, 8).toUpperCase()}`;
}

function normalizeDriver(profile: BackendDriverProfile): Driver {
    return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        transporterId: profile.transporterId,
        transporterName: profile.transporterName,
        truckNumber: profile.truckNumber,
        truckPlate: profile.truckPlate,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    };
}

function mapBooking(raw: BackendBooking): Booking {
    const firstName = raw.driver?.driverProfile?.firstName || '';
    const lastName = raw.driver?.driverProfile?.lastName || '';
    const driverName = `${firstName} ${lastName}`.trim() || 'Chauffeur';
    const typeSafeStatus: BookingStatus = raw.status;

    return {
        id: raw.id,
        reference: bookingReference(raw.id),
        terminalName: raw.terminal?.name || `Terminal ${raw.terminalId.slice(0, 6).toUpperCase()}`,
        terminalId: raw.terminalId,
        startTime: raw.startTime,
        endTime: raw.endTime,
        status: typeSafeStatus,
        driverId: raw.driverUserId || '',
        driverName,
        driverPhone: raw.driver?.driverProfile?.phone || '',
        transporterName: raw.carrier?.carrierProfile?.companyName || 'Transporteur',
        vehiclePlate: raw.driver?.driverProfile?.truckPlate || undefined,
        qrPayload: raw.qrPayload || '',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

function mapNotification(raw: BackendNotification): Notification {
    const typeMap: Record<BackendNotification['type'], NotificationType> = {
        BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
        QR_READY: 'QR_READY',
        GENERIC: 'GENERIC',
    };

    const titleMap: Record<BackendNotification['type'], string> = {
        BOOKING_CONFIRMED: 'Trajet confirmé',
        QR_READY: 'QR Code disponible',
        GENERIC: 'Information',
    };

    return {
        id: raw.id,
        type: typeMap[raw.type],
        title: titleMap[raw.type],
        message: raw.message,
        bookingId: raw.relatedBookingId ?? undefined,
        isRead: raw.isRead,
        createdAt: raw.createdAt,
    };
}

async function getProfileWithToken(token: string): Promise<Driver> {
    const profile = await apiRequest<BackendDriverProfile>('/driver/profile', {
        tokenOverride: token,
    });
    return normalizeDriver(profile);
}

/**
 * POST /auth/login then GET /driver/profile
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const auth = await apiRequest<BackendAuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    if (auth.role !== 'DRIVER') {
        throw new ApiException(
            "Ce compte n'est pas un compte chauffeur.",
            403,
            'INVALID_ROLE'
        );
    }

    const driver = await getProfileWithToken(auth.token);
    return { token: auth.token, driver };
}

/**
 * GET /driver/bookings/mine
 */
export async function getMyBookings(): Promise<Booking[]> {
    const data = await apiRequest<BackendBooking[]>('/driver/bookings/mine');
    return data.map(mapBooking);
}

/**
 * Returns the next confirmed booking by start date
 */
export async function getCurrentMission(): Promise<Booking | null> {
    const bookings = await getMyBookings();
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');
    if (confirmed.length === 0) return null;

    const now = Date.now();
    const activeOrUpcoming = confirmed.find(
        (booking) => new Date(booking.endTime).getTime() >= now
    );
    return activeOrUpcoming || confirmed[0];
}

/**
 * Get a booking by id from current driver's bookings
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
    const bookings = await getMyBookings();
    return bookings.find((booking) => booking.id === bookingId) || null;
}

/**
 * GET /driver/bookings/:id/qr
 */
export async function getBookingQrPayload(bookingId: string): Promise<string> {
    const data = await apiRequest<{ qr_payload: string }>(`/driver/bookings/${bookingId}/qr`);
    return data.qr_payload;
}

/**
 * GET /driver/notifications
 */
export async function getNotifications(): Promise<Notification[]> {
    const data = await apiRequest<BackendNotification[]>('/driver/notifications');
    return data.map(mapNotification);
}

/**
 * POST /driver/notifications/:id/read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    await apiRequest(`/driver/notifications/${notificationId}/read`, {
        method: 'POST',
    });
}

/**
 * GET /driver/history
 */
export async function getHistory(): Promise<Booking[]> {
    const data = await apiRequest<BackendBooking[]>('/driver/history');
    return data.map(mapBooking);
}

/**
 * GET /driver/profile
 */
export async function getProfile(): Promise<Driver> {
    const data = await apiRequest<BackendDriverProfile>('/driver/profile');
    return normalizeDriver(data);
}

export default {
    login,
    getMyBookings,
    getCurrentMission,
    getBookingById,
    getBookingQrPayload,
    getNotifications,
    markNotificationAsRead,
    getHistory,
    getProfile,
};
