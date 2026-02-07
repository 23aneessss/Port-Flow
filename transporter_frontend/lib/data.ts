export type DriverStatus = "Active" | "Suspended"

export interface Driver {
  id: string
  fullName: string
  phone: string
  status: DriverStatus
  truckNumber: string
  plateNumber: string
  licenseNumber: string
  licenseVerified: boolean
}

export type BookingStatus = "Pending" | "Confirmed" | "Rejected" | "Consumed" | "Cancelled"
export type OperationType = "Pick-up" | "Drop-off"

export interface Booking {
  id: string
  terminalName: string
  driverId: string
  operationType: OperationType
  date: string
  time: string
  status: BookingStatus
  rejectionReason?: string
}

export const terminals = [
  "Terminal A - North Gate",
  "Terminal B - South Gate",
  "Terminal C - East Dock",
  "Terminal D - West Dock",
  "Terminal E - Container Yard",
]

export const initialDrivers: Driver[] = [
  {
    id: "d1",
    fullName: "Ahmed Benali",
    phone: "+212 661 234 567",
    status: "Active",
    truckNumber: "TRK-001",
    plateNumber: "12345-A-1",
    licenseNumber: "LIC-2024-001",
    licenseVerified: true,
  },
  {
    id: "d2",
    fullName: "Karim Haddad",
    phone: "+212 662 345 678",
    status: "Active",
    truckNumber: "TRK-002",
    plateNumber: "23456-B-2",
    licenseNumber: "LIC-2024-002",
    licenseVerified: true,
  },
  {
    id: "d3",
    fullName: "Youssef El Amrani",
    phone: "+212 663 456 789",
    status: "Suspended",
    truckNumber: "TRK-003",
    plateNumber: "34567-C-3",
    licenseNumber: "LIC-2024-003",
    licenseVerified: false,
  },
  {
    id: "d4",
    fullName: "Omar Tazi",
    phone: "+212 664 567 890",
    status: "Active",
    truckNumber: "TRK-004",
    plateNumber: "45678-D-4",
    licenseNumber: "LIC-2024-004",
    licenseVerified: true,
  },
  {
    id: "d5",
    fullName: "Rachid Fassi",
    phone: "+212 665 678 901",
    status: "Active",
    truckNumber: "TRK-005",
    plateNumber: "56789-E-5",
    licenseNumber: "LIC-2024-005",
    licenseVerified: true,
  },
  {
    id: "d6",
    fullName: "Hassan Moujahid",
    phone: "+212 666 789 012",
    status: "Suspended",
    truckNumber: "TRK-006",
    plateNumber: "67890-F-6",
    licenseNumber: "LIC-2024-006",
    licenseVerified: false,
  },
]

export const initialBookings: Booking[] = [
  {
    id: "b1",
    terminalName: "Terminal A - North Gate",
    driverId: "d1",
    operationType: "Pick-up",
    date: "2026-02-07",
    time: "08:00",
    status: "Confirmed",
  },
  {
    id: "b2",
    terminalName: "Terminal B - South Gate",
    driverId: "d2",
    operationType: "Drop-off",
    date: "2026-02-07",
    time: "10:30",
    status: "Pending",
  },
  {
    id: "b3",
    terminalName: "Terminal C - East Dock",
    driverId: "d3",
    operationType: "Pick-up",
    date: "2026-02-06",
    time: "14:00",
    status: "Rejected",
    rejectionReason: "Driver license expired. Please renew before rebooking.",
  },
  {
    id: "b4",
    terminalName: "Terminal D - West Dock",
    driverId: "d4",
    operationType: "Drop-off",
    date: "2026-02-05",
    time: "09:15",
    status: "Consumed",
  },
  {
    id: "b5",
    terminalName: "Terminal E - Container Yard",
    driverId: "d5",
    operationType: "Pick-up",
    date: "2026-02-08",
    time: "07:00",
    status: "Pending",
  },
  {
    id: "b6",
    terminalName: "Terminal A - North Gate",
    driverId: "d1",
    operationType: "Drop-off",
    date: "2026-02-04",
    time: "16:00",
    status: "Cancelled",
  },
  {
    id: "b7",
    terminalName: "Terminal B - South Gate",
    driverId: "d4",
    operationType: "Pick-up",
    date: "2026-02-09",
    time: "11:00",
    status: "Confirmed",
  },
  {
    id: "b8",
    terminalName: "Terminal C - East Dock",
    driverId: "d2",
    operationType: "Drop-off",
    date: "2026-02-06",
    time: "13:30",
    status: "Rejected",
    rejectionReason: "Terminal C is under maintenance until Feb 10.",
  },
]
