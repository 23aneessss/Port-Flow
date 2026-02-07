export type DriverStatus = "ACTIVE" | "SUSPENDED"

export interface Driver {
  userId: string
  carrierUserId: string
  firstName: string
  lastName: string
  phone: string
  gender: string
  birthDate: string
  truckNumber: string
  truckPlate: string
  drivingLicenseUrl: string
  status: DriverStatus
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    isActive: boolean
  }
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CONSUMED" | "CANCELLED"

export interface Booking {
  id: string
  carrierUserId: string
  driverUserId: string | null
  terminalId: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
  decidedByOperatorUserId: string | null
  qrPayload: string | null
  createdAt: string
  updatedAt: string
}

export interface TerminalOption {
  id: string
  name: string
}

export const initialDrivers: Driver[] = []
export const initialBookings: Booking[] = []
