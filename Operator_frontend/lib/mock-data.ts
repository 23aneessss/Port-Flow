export interface Terminal {
  id: string
  name: string
  capacity: number
  currentLoad: number
  pendingBookings: number
  latitude: number
  longitude: number
}

export type OperationType = 'DROP_OFF' | 'PICK_UP'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CONSUMED' | 'CANCELLED'

export interface Booking {
  id: string
  carrier_id: string
  terminal_id: string
  driver_id: string
  operation_type: OperationType
  status: BookingStatus
  decided_by_operator_user_id: string | null
  reject_reason: string | null
  qr_payload: string | null
  scheduled_at: string
  time_start: string | null
  time_end: string | null
  qr_notified: boolean
  created_at: string
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'critical'
  title: string
  message: string
  timestamp: string
  related_booking?: string
  related_terminal?: string
}

export const terminals: Terminal[] = [
  {
    id: 'T001',
    name: 'Terminal Conteneurs Alger',
    capacity: 50,
    currentLoad: 42,
    pendingBookings: 3,
    latitude: 36.7625,
    longitude: 3.0555,
  },
  {
    id: 'T002',
    name: 'Terminal Céréalier Alger',
    capacity: 60,
    currentLoad: 35,
    pendingBookings: 2,
    latitude: 36.7590,
    longitude: 3.0640,
  },
  {
    id: 'T003',
    name: 'Terminal Hydrocarbures Alger',
    capacity: 45,
    currentLoad: 44,
    pendingBookings: 5,
    latitude: 36.7560,
    longitude: 3.0710,
  },
  {
    id: 'T004',
    name: 'Terminal Passagers Alger',
    capacity: 55,
    currentLoad: 28,
    pendingBookings: 1,
    latitude: 36.7650,
    longitude: 3.0480,
  },
  {
    id: 'T005',
    name: 'Terminal RoRo Alger',
    capacity: 40,
    currentLoad: 32,
    pendingBookings: 4,
    latitude: 36.7680,
    longitude: 3.0420,
  },
]

// Lookup maps for display names
export const carrierNames: Record<string, string> = {
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6': 'TransportCo',
  'a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7': 'LogisticsPro',
  'b3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8': 'FastFreight',
}

export const driverNames: Record<string, string> = {
  'd1a2b3c4-0001-4a5b-8c9d-e1f2a3b4c5d6': 'Jean Dupont',
  'd1a2b3c4-0002-4a5b-8c9d-e1f2a3b4c5d6': 'Marie Martin',
  'd1a2b3c4-0003-4a5b-8c9d-e1f2a3b4c5d6': 'Pierre Leclerc',
  'd1a2b3c4-0004-4a5b-8c9d-e1f2a3b4c5d6': 'Sophie Bernard',
  'd1a2b3c4-0005-4a5b-8c9d-e1f2a3b4c5d6': 'Michel Renaud',
  'd1a2b3c4-0006-4a5b-8c9d-e1f2a3b4c5d6': 'Isabelle Gauthier',
  'd1a2b3c4-0007-4a5b-8c9d-e1f2a3b4c5d6': 'Luc Beaumont',
  'd1a2b3c4-0008-4a5b-8c9d-e1f2a3b4c5d6': 'Claire Fontaine',
}

export const bookings: Booking[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    carrier_id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    terminal_id: 'T001',
    driver_id: 'd1a2b3c4-0001-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'DROP_OFF',
    status: 'PENDING',
    decided_by_operator_user_id: null,
    reject_reason: null,
    qr_payload: null,
    scheduled_at: '2026-02-07T09:00:00Z',
    time_start: '09:00',
    time_end: '10:00',
    qr_notified: false,
    created_at: '2026-02-06T14:30:00Z',
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    carrier_id: 'a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    terminal_id: 'T002',
    driver_id: 'd1a2b3c4-0002-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'PICK_UP',
    status: 'PENDING',
    decided_by_operator_user_id: null,
    reject_reason: null,
    qr_payload: null,
    scheduled_at: '2026-02-07T10:30:00Z',
    time_start: '10:30',
    time_end: '11:30',
    qr_notified: false,
    created_at: '2026-02-06T15:00:00Z',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    carrier_id: 'b3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    terminal_id: 'T003',
    driver_id: 'd1a2b3c4-0003-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'DROP_OFF',
    status: 'CONFIRMED',
    decided_by_operator_user_id: 'op-user-001',
    reject_reason: null,
    qr_payload: 'QR-BK003-CONFIRMED',
    scheduled_at: '2026-02-07T11:00:00Z',
    time_start: '11:00',
    time_end: '12:00',
    qr_notified: true,
    created_at: '2026-02-06T10:00:00Z',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    carrier_id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    terminal_id: 'T004',
    driver_id: 'd1a2b3c4-0004-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'PICK_UP',
    status: 'PENDING',
    decided_by_operator_user_id: null,
    reject_reason: null,
    qr_payload: null,
    scheduled_at: '2026-02-07T13:45:00Z',
    time_start: '13:45',
    time_end: '14:45',
    qr_notified: false,
    created_at: '2026-02-06T16:00:00Z',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    carrier_id: 'a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    terminal_id: 'T001',
    driver_id: 'd1a2b3c4-0005-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'DROP_OFF',
    status: 'REJECTED',
    decided_by_operator_user_id: 'op-user-002',
    reject_reason: 'Terminal at full capacity during requested time slot',
    qr_payload: null,
    scheduled_at: '2026-02-07T14:15:00Z',
    time_start: null,
    time_end: null,
    qr_notified: false,
    created_at: '2026-02-06T11:00:00Z',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    carrier_id: 'b3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    terminal_id: 'T005',
    driver_id: 'd1a2b3c4-0006-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'DROP_OFF',
    status: 'CONSUMED',
    decided_by_operator_user_id: 'op-user-001',
    reject_reason: null,
    qr_payload: 'QR-BK006-CONSUMED',
    scheduled_at: '2026-02-07T15:30:00Z',
    time_start: '15:30',
    time_end: '16:15',
    qr_notified: true,
    created_at: '2026-02-05T09:00:00Z',
  },
  {
    id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    carrier_id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    terminal_id: 'T003',
    driver_id: 'd1a2b3c4-0007-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'PICK_UP',
    status: 'CONFIRMED',
    decided_by_operator_user_id: 'op-user-001',
    reject_reason: null,
    qr_payload: 'QR-BK007-CONFIRMED',
    scheduled_at: '2026-02-07T16:00:00Z',
    time_start: '16:00',
    time_end: '17:00',
    qr_notified: true,
    created_at: '2026-02-06T08:00:00Z',
  },
  {
    id: 'a7b8c9d0-e1f2-3456-0123-567890123456',
    carrier_id: 'a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    terminal_id: 'T001',
    driver_id: 'd1a2b3c4-0008-4a5b-8c9d-e1f2a3b4c5d6',
    operation_type: 'PICK_UP',
    status: 'CANCELLED',
    decided_by_operator_user_id: null,
    reject_reason: null,
    qr_payload: null,
    scheduled_at: '2026-02-07T16:45:00Z',
    time_start: null,
    time_end: null,
    qr_notified: false,
    created_at: '2026-02-06T12:00:00Z',
  },
]

export const alerts: Alert[] = [
  {
    id: 'A001',
    type: 'critical',
    title: 'Terminal Saturation Alert',
    message: 'Terminal Hydrocarbures Alger is operating at 97.8% capacity',
    timestamp: '2024-02-07T08:45:00Z',
    related_terminal: 'T003',
  },
  {
    id: 'A002',
    type: 'warning',
    title: 'High Pending Bookings',
    message: 'Terminal Hydrocarbures Alger has 5 pending booking requests',
    timestamp: '2024-02-07T08:30:00Z',
    related_terminal: 'T003',
  },
  {
    id: 'A003',
    type: 'info',
    title: 'New Booking Request',
    message: 'New booking BK006 received for Terminal RoRo Alger',
    timestamp: '2024-02-07T08:15:00Z',
    related_booking: 'BK006',
  },
  {
    id: 'A004',
    type: 'warning',
    title: 'Repeated Rejections',
    message: 'TransportCo has 2 rejected bookings today',
    timestamp: '2024-02-07T07:50:00Z',
  },
]

export function getSaturationLevel(terminal: Terminal): number {
  return Math.round((terminal.currentLoad / terminal.capacity) * 100)
}

export function getSaturationColor(percentage: number): string {
  if (percentage < 70) return 'bg-green-500'
  if (percentage < 90) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getSaturationColorText(percentage: number): string {
  if (percentage < 70) return 'text-green-700'
  if (percentage < 90) return 'text-amber-700'
  return 'text-red-700'
}

export function getSaturationBg(percentage: number): string {
  if (percentage < 70) return 'bg-green-50'
  if (percentage < 90) return 'bg-amber-50'
  return 'bg-red-50'
}
