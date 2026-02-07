'use client'

import { useState, useMemo } from 'react'
import { bookings, terminals, carrierNames, driverNames, BookingStatus } from '@/lib/mock-data'
import { Layout } from '@/components/layout'
import { Booking } from '@/lib/mock-data'
import { Search, Eye, X, QrCode, Clock, MapPin, Truck, User, Building2, CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all')
  const [operationFilter, setOperationFilter] = useState<'all' | 'DROP_OFF' | 'PICK_UP'>('all')
  const [carrierFilter, setCarrierFilter] = useState('all')
  const [bookingActions, setBookingActions] = useState<Record<string, BookingStatus>>({})
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const uniqueCarriers = [...new Set(bookings.map((b) => b.carrier_id))]

  const getTerminalName = (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId)
    return terminal ? terminal.name : terminalId
  }

  const formatScheduledAt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatTimeSlot = (start: string | null, end: string | null) => {
    if (!start) return '—'
    return end ? `${start} – ${end}` : start
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const carrierName = (carrierNames[booking.carrier_id] || '').toLowerCase()
      const driverName = (driverNames[booking.driver_id] || '').toLowerCase()
      const searchMatch =
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrierName.includes(searchTerm.toLowerCase()) ||
        driverName.includes(searchTerm.toLowerCase())

      const statusMatch =
        statusFilter === 'all' || getBookingStatus(booking) === statusFilter

      const carrierMatch =
        carrierFilter === 'all' || booking.carrier_id === carrierFilter

      const operationMatch =
        operationFilter === 'all' || booking.operation_type === operationFilter

      return searchMatch && statusMatch && carrierMatch && operationMatch
    })
  }, [searchTerm, statusFilter, carrierFilter, operationFilter])

  const handleConfirm = (bookingId: string) => {
    setBookingActions((prev) => ({ ...prev, [bookingId]: 'CONFIRMED' }))
  }

  const handleReject = (bookingId: string) => {
    setBookingActions((prev) => ({ ...prev, [bookingId]: 'REJECTED' }))
  }

  const getBookingStatus = (booking: Booking): BookingStatus => {
    return bookingActions[booking.id] || booking.status
  }

  const getStatusBadge = (status: BookingStatus) => {
    const config: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
      PENDING: { bg: 'bg-amber-50 ring-1 ring-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
      CONFIRMED: { bg: 'bg-emerald-50 ring-1 ring-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      REJECTED: { bg: 'bg-red-50 ring-1 ring-red-200', text: 'text-red-700', dot: 'bg-red-500' },
      CONSUMED: { bg: 'bg-blue-50 ring-1 ring-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
      CANCELLED: { bg: 'bg-slate-50 ring-1 ring-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
    }
    const c = config[status]
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const getOperationBadge = (type: 'DROP_OFF' | 'PICK_UP') => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      type === 'DROP_OFF'
        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
        : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
    }`}>
      {type === 'DROP_OFF' ? 'Drop Off' : 'Pick Up'}
    </span>
  )

  const stats = {
    pending: filteredBookings.filter((b) => getBookingStatus(b) === 'PENDING').length,
    confirmed: filteredBookings.filter((b) => getBookingStatus(b) === 'CONFIRMED').length,
    rejected: filteredBookings.filter((b) => getBookingStatus(b) === 'REJECTED').length,
    consumed: filteredBookings.filter((b) => getBookingStatus(b) === 'CONSUMED').length,
    cancelled: filteredBookings.filter((b) => getBookingStatus(b) === 'CANCELLED').length,
  }

  return (
    <Layout>
      <div className="space-y-6 p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 font-condensed">Pending</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-700 tracking-tight">{stats.pending}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 font-condensed">Confirmed</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700 tracking-tight">{stats.confirmed}</p>
          </div>
          <div className="rounded-xl bg-red-50 ring-1 ring-red-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 font-condensed">Rejected</p>
            <p className="mt-1 text-2xl font-extrabold text-red-700 tracking-tight">{stats.rejected}</p>
          </div>
          <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-condensed">Consumed</p>
            <p className="mt-1 text-2xl font-extrabold text-blue-700 tracking-tight">{stats.consumed}</p>
          </div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-condensed">Cancelled</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-600 tracking-tight">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by ID, carrier, driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm font-condensed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-condensed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CONSUMED">Consumed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value as any)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-condensed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Operations</option>
              <option value="DROP_OFF">Drop Off</option>
              <option value="PICK_UP">Pick Up</option>
            </select>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-condensed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Carriers</option>
              {uniqueCarriers.map((carrierId) => (
                <option key={carrierId} value={carrierId}>
                  {carrierNames[carrierId] || carrierId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings Table — compact columns */}
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm font-condensed">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carrier</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminal</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operation</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scheduled</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const status = getBookingStatus(booking)
                return (
                  <tr
                    key={booking.id}
                    className="border-b border-border/50 transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5 text-foreground font-medium">
                      {carrierNames[booking.carrier_id] || booking.carrier_id}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {getTerminalName(booking.terminal_id)}
                    </td>
                    <td className="px-5 py-3.5">
                      {getOperationBadge(booking.operation_type)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatScheduledAt(booking.scheduled_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(status)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleConfirm(booking.id)}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-all hover:shadow-md active:scale-95"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50 transition-all active:scale-95"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-all"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground font-condensed">No bookings found</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (() => {
            const status = getBookingStatus(selectedBooking)
            return (
              <div className="space-y-5">
                {/* Status + Operation header */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(status)}
                  {getOperationBadge(selectedBooking.operation_type)}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Carrier
                    </p>
                    <p className="text-sm font-medium text-foreground">{carrierNames[selectedBooking.carrier_id] || selectedBooking.carrier_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Driver
                    </p>
                    <p className="text-sm font-medium text-foreground">{driverNames[selectedBooking.driver_id] || selectedBooking.driver_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Terminal
                    </p>
                    <p className="text-sm font-medium text-foreground">{getTerminalName(selectedBooking.terminal_id)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> Scheduled At
                    </p>
                    <p className="text-sm font-medium text-foreground">{formatDateTime(selectedBooking.scheduled_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Time Slot
                    </p>
                    <p className="text-sm font-medium text-foreground">{formatTimeSlot(selectedBooking.time_start, selectedBooking.time_end)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5" /> QR Notified
                    </p>
                    <p className="text-sm font-medium text-foreground">{selectedBooking.qr_notified ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Additional details */}
                <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-mono text-xs text-foreground select-all">{selectedBooking.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created At</span>
                    <span className="text-foreground">{formatDateTime(selectedBooking.created_at)}</span>
                  </div>
                  {selectedBooking.decided_by_operator_user_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Decided By</span>
                      <span className="text-foreground">{selectedBooking.decided_by_operator_user_id}</span>
                    </div>
                  )}
                  {selectedBooking.reject_reason && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Reject Reason</span>
                      <p className="mt-1 text-red-600 font-medium">{selectedBooking.reject_reason}</p>
                    </div>
                  )}
                  {selectedBooking.qr_payload && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">QR Payload</span>
                      <span className="font-mono text-xs text-foreground">{selectedBooking.qr_payload}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons in dialog */}
                {status === 'PENDING' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { handleConfirm(selectedBooking.id); setSelectedBooking(null) }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-all hover:shadow-md active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Confirm Booking
                    </button>
                    <button
                      onClick={() => { handleReject(selectedBooking.id); setSelectedBooking(null) }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50 transition-all active:scale-[0.98]"
                    >
                      <XCircle className="h-4 w-4" /> Reject Booking
                    </button>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
