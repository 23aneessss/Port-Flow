/**
 * PORT FLOW DRIVER - API Export
 */

export * from './client';
export { default as mockData } from './mockData';

// Export mock data individually for convenience
export {
    mockDriver,
    mockBookings,
    mockCurrentBooking,
    mockHistory,
    mockNotifications,
    mockAuthResponse,
} from './mockData';
