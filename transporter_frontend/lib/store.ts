import { create } from "zustand"
import type { Driver, Booking, DriverStatus, BookingStatus, TerminalOption } from "./data"
import * as api from "./api"

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
  terminals: TerminalOption[]
  profile: UserProfile
  isLoadingDrivers: boolean
  isLoadingBookings: boolean
  isLoadingTerminals: boolean

  fetchDrivers: () => Promise<void>
  fetchBookings: () => Promise<void>
  fetchTerminals: () => Promise<void>
  addDriver: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    gender: string
    birthDate: string
    truckNumber: string
    truckPlate: string
    drivingLicenseUrl: string
  }) => Promise<void>
  updateDriver: (id: string, data: Partial<Driver>) => Promise<void>
  deleteDriver: (id: string) => Promise<void>
  addBooking: (data: {
    terminalId: string
    date: string
    startTime: string
    endTime: string
    driverUserId?: string
  }) => Promise<void>
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>
  deleteBooking: (id: string) => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  drivers: [],
  bookings: [],
  terminals: [],
  isLoadingDrivers: false,
  isLoadingBookings: false,
  isLoadingTerminals: false,
  profile: {
    name: "",
    email: "",
    phone: "",
    role: "Transporteur",
    avatarUrl: null,
  },

  fetchDrivers: async () => {
    set({ isLoadingDrivers: true })
    try {
      const drivers = await api.listDrivers()
      set({ drivers, isLoadingDrivers: false })
    } catch {
      set({ isLoadingDrivers: false })
    }
  },

  fetchBookings: async () => {
    set({ isLoadingBookings: true })
    try {
      const bookings = await api.listBookings()
      set({ bookings, isLoadingBookings: false })
    } catch {
      set({ isLoadingBookings: false })
    }
  },

  fetchTerminals: async () => {
    set({ isLoadingTerminals: true })
    try {
      const terminals = await api.listTerminals()
      set({ terminals, isLoadingTerminals: false })
    } catch {
      set({ isLoadingTerminals: false })
    }
  },

  addDriver: async (data) => {
    await api.createDriver(data)
    await get().fetchDrivers()
  },

  updateDriver: async (id, updates) => {
    await api.updateDriver(id, updates)
    await get().fetchDrivers()
  },

  deleteDriver: async (id) => {
    await api.deleteDriver(id)
    await get().fetchDrivers()
  },

  addBooking: async (data) => {
    await api.createBooking(data)
    await get().fetchBookings()
  },

  updateBooking: async (id, updates) => {
    await api.updateBooking(id, updates)
    await get().fetchBookings()
  },

  deleteBooking: async (id) => {
    await api.deleteBooking(id)
    await get().fetchBookings()
  },

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),
}))

export type { Driver, Booking, DriverStatus, BookingStatus, TerminalOption }
