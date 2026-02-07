import { create } from "zustand"
import type {
  Driver,
  Booking,
  DriverStatus,
  BookingStatus,
  OperationType,
} from "./data"
import { initialDrivers, initialBookings } from "./data"

export interface UserProfile {
  name: string
  email: string
  phone: string
  role: string
  avatarUrl: string | null
}

interface AppStore {
  drivers: Driver[]
  bookings: Booking[]
  profile: UserProfile
  addDriver: (driver: Omit<Driver, "id">) => void
  updateDriver: (id: string, driver: Partial<Driver>) => void
  deleteDriver: (id: string) => void
  addBooking: (booking: Omit<Booking, "id">) => void
  updateBooking: (id: string, booking: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  updateProfile: (profile: Partial<UserProfile>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  drivers: initialDrivers,
  bookings: initialBookings,
  profile: {
    name: "Moham Roudj",
    email: "om_roudj@esi.dz",
    phone: "+213 555 123 456",
    role: "Transporteur",
    avatarUrl: null,
  },

  addDriver: (driver) =>
    set((state) => ({
      drivers: [
        ...state.drivers,
        { ...driver, id: `d${Date.now()}` },
      ],
    })),

  updateDriver: (id, updates) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  deleteDriver: (id) =>
    set((state) => ({
      drivers: state.drivers.filter((d) => d.id !== id),
    })),

  addBooking: (booking) =>
    set((state) => ({
      bookings: [
        ...state.bookings,
        { ...booking, id: `b${Date.now()}` },
      ],
    })),

  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),

  deleteBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),
}))

export type { Driver, Booking, DriverStatus, BookingStatus, OperationType }
