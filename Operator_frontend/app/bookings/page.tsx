'use client'

import { useState, useMemo, useEffect } from 'react'
import { Layout } from '@/components/layout'
import {
  listBookings,
  listTerminals,
  approveBooking,
  rejectBooking,
  type Booking,
  type Terminal,
} from '@/lib/api'
import { Search, Eye, QrCode, Clock, MapPin, User, Building2, CalendarDays, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CONSUMED' | 'CANCELLED'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    Promise.all([
      listBookings().catch(() => []),
      listTerminals().catch(() => []),
    ]).then(([bk, tm]) => {
      setBookings(bk as Booking[])
      setTerminals(tm as Terminal[])
      setIsLoading(false)
    })
  }, [])

  const getTerminalName = (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId)
    return terminal ? terminal.name : terminalId
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatTimeSlot = (start: string, end: string) => {
    const s = new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const e = new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return `${s} – ${e}`
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const carrierEmail = (booking.carrier?.email || '').toLowerCase()
      const driverEmail = (booking.driver?.email || '').toLowerCase()
      const searchMatch =
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrierEmail.includes(searchTerm.toLowerCase()) ||
        driverEmail.includes(searchTerm.toLowerCase())

      const statusMatch =
        statusFilter === 'all' || booking.status === statusFilter

      return searchMatch && statusMatch
    })
  }, [bookings, searchTerm, statusFilter])

  const handleConfirm = async (bookingId: string) => {
    try {
      await approveBooking(bookingId)
      const updated = await listBookings()
      setBookings(updated)
    } catch (err) {
      console.error('Failed to approve booking:', err)
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      await rejectBooking(bookingId)
      const updated = await listBookings()
      setBookings(updated)
    } catch (err) {
      console.error('Failed to reject booking:', err)
    }
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

  const stats = {
    pending: filteredBookings.filter((b) => b.status === 'PENDING').length,
    confirmed: filteredBookings.filter((b) => b.status === 'CONFIRMED').length,
    rejected: filteredBookings.filter((b) => b.status === 'REJECTED').length,
    consumed: filteredBookings.filter((b) => b.status === 'CONSUMED').length,
    cancelled: filteredBookings.filter((b) => b.status === 'CANCELLED').length,
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    )
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </div>
        </div>

        {/* Bookings Table */}
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm font-condensed">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carrier</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminal</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time Slot</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border/50 transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5 text-foreground font-medium">
                    {booking.carrier?.email || booking.carrierUserId}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {booking.driver?.email || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {getTerminalName(booking.terminalId)}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatTimeSlot(booking.startTime, booking.endTime)}
                  </td>
                  <td className="px-5 py-3.5">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {booking.status === 'PENDING' && (
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
              ))}
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
          {selectedBooking && (
            <div className="space-y-5">
              {/* Status header */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Carrier
                  </p>
                  <p className="text-sm font-medium text-foreground">{selectedBooking.carrier?.email || selectedBooking.carrierUserId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Driver
                  </p>
                  <p className="text-sm font-medium text-foreground">{selectedBooking.driver?.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Terminal
                  </p>
                  <p className="text-sm font-medium text-foreground">{getTerminalName(selectedBooking.terminalId)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Date
                  </p>
                  <p className="text-sm font-medium text-foreground">{formatDate(selectedBooking.date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Time Slot
                  </p>
                  <p className="text-sm font-medium text-foreground">{formatTimeSlot(selectedBooking.startTime, selectedBooking.endTime)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5" /> QR Payload
                  </p>
                  <p className="text-sm font-medium text-foreground">{selectedBooking.qrPayload || '—'}</p>
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
                  <span className="text-foreground">{formatDateTime(selectedBooking.createdAt)}</span>
                </div>
                {selectedBooking.decidedByOperatorUserId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Decided By</span>
                    <span className="text-foreground">{selectedBooking.decidedByOperatorUserId}</span>
                  </div>
                )}
              </div>

              {/* Action buttons in dialog */}
              {selectedBooking.status === 'PENDING' && (
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
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
