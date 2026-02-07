"use client"

import { useState } from "react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { BookingFormModal } from "@/components/booking-form-modal"

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600 border border-amber-200/60 hover:bg-amber-50",
  Confirmed: "bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-50",
  Rejected: "bg-red-50 text-red-500 border border-red-200/60 hover:bg-red-50",
  Consumed: "bg-sky-50 text-sky-600 border border-sky-200/60 hover:bg-sky-50",
  Cancelled: "bg-slate-100 text-slate-500 border border-slate-200/60 hover:bg-slate-100",
}

export default function BookingsPage() {
  const { bookings, drivers, addBooking, updateBooking, deleteBooking } =
    useAppStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d: Driver) => d.id === driverId)
    return driver?.fullName ?? "Unknown"
  }

  const handleAdd = (data: Omit<Booking, "id">) => {
    addBooking(data)
  }

  const handleEdit = (data: Omit<Booking, "id">) => {
    if (editingBooking) {
      updateBooking(editingBooking.id, data)
      setEditingBooking(null)
    }
  }

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

      <div className="animate-slide-up rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Terminal</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TooltipProvider>
              {bookings.map((booking: Booking) => (
                <TableRow key={booking.id} className="transition-colors duration-150 hover:bg-muted/40">
                  <TableCell className="font-medium text-card-foreground">
                    {booking.terminalName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getDriverName(booking.driverId)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        booking.operationType === "Pick-up"
                          ? "border-sky-300/50 bg-sky-50/50 text-sky-600"
                          : "border-slate-300/50 bg-slate-50/50 text-slate-600"
                      }
                    >
                      {booking.operationType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at {booking.time}
                  </TableCell>
                  <TableCell>
                    {booking.status === "Rejected" && booking.rejectionReason ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={statusStyles[booking.status]}>
                            {booking.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs bg-popover text-popover-foreground"
                        >
                          <p className="text-xs font-medium">Rejection Reason:</p>
                          <p className="text-xs">{booking.rejectionReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge className={statusStyles[booking.status]}>
                        {booking.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {booking.status === "Pending" && (
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
                        onClick={() => deleteBooking(booking.id)}
                        aria-label="Delete booking"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TooltipProvider>
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

      <BookingFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingBooking(null)
        }}
        onSubmit={editingBooking ? handleEdit : handleAdd}
        initialData={editingBooking}
        drivers={drivers}
      />
    </div>
  )
}
