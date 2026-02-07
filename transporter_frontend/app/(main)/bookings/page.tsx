"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import type { Booking, Driver } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { BookingFormModal } from "@/components/booking-form-modal"

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-200/60 hover:bg-amber-50",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-50",
  REJECTED: "bg-red-50 text-red-500 border border-red-200/60 hover:bg-red-50",
  CONSUMED: "bg-sky-50 text-sky-600 border border-sky-200/60 hover:bg-sky-50",
  CANCELLED: "bg-slate-100 text-slate-500 border border-slate-200/60 hover:bg-slate-100",
}

export default function BookingsPage() {
  const { bookings, drivers, terminals, fetchBookings, fetchDrivers, fetchTerminals, addBooking, updateBooking, deleteBooking, isLoadingBookings } =
    useAppStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
    fetchDrivers()
    fetchTerminals()
  }, [])

  const getDriverName = (driverUserId: string | null) => {
    if (!driverUserId) return "—"
    const driver = drivers.find((d: Driver) => d.userId === driverUserId)
    return driver ? `${driver.firstName} ${driver.lastName}` : driverUserId
  }

  const getTerminalName = (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId)
    return terminal ? terminal.name : terminalId
  }

  const formatTimeSlot = (start: string, end: string) => {
    const s = new Date(start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    const e = new Date(end).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    return `${s} – ${e}`
  }

  const handleAdd = async (data: any) => {
    await addBooking(data)
  }

  const handleEdit = async (data: any) => {
    if (editingBooking) {
      await updateBooking(editingBooking.id, data)
      setEditingBooking(null)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteBooking(id)
  }

  const statusLabel = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Booking Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage terminal bookings and track their statuses
          </p>
        </div>
        <Button
          className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          onClick={() => {
            setEditingBooking(null)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Booking
        </Button>
      </div>

      {isLoadingBookings ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="animate-slide-up rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Terminal</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking: Booking) => (
                <TableRow key={booking.id} className="transition-colors duration-150 hover:bg-muted/40">
                  <TableCell className="font-medium text-card-foreground">
                    {getTerminalName(booking.terminalId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getDriverName(booking.driverUserId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimeSlot(booking.startTime, booking.endTime)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[booking.status] || statusStyles.CANCELLED}>
                      {statusLabel(booking.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {booking.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-all duration-150 hover:bg-sky-50 hover:text-sky-600"
                          onClick={() => {
                            setEditingBooking(booking)
                            setFormOpen(true)
                          }}
                          aria-label="Edit booking"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive transition-all duration-150 hover:bg-red-50 hover:text-destructive"
                        onClick={() => handleDelete(booking.id)}
                        aria-label="Delete booking"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No bookings found. Create your first booking to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <BookingFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingBooking(null)
        }}
        onSubmit={editingBooking ? handleEdit : handleAdd}
        initialData={editingBooking}
        drivers={drivers}
        terminals={terminals}
      />
    </div>
  )
}
