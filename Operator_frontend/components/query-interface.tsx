'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { listBookings, listTerminals, type Booking, type Terminal } from '@/lib/api'
import { Search, Send, Loader2 } from 'lucide-react'

type QueryResult =
  | {
      type: 'bookings'
      data: Booking[]
      query: string
    }
  | {
      type: 'terminals'
      data: Terminal[]
      query: string
    }
  | {
      type: 'stats'
      data: {
        totalBookings: number
        pendingBookings: number
        acceptedBookings: number
        totalCapacity: number
        totalLoad: number
        saturation: number
      }
      query: string
    }
  | null

export function QueryInterface() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult>(null)
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listBookings().catch(() => []),
      listTerminals().catch(() => []),
    ]).then(([bk, tm]) => {
      setBookings(bk as Booking[])
      setTerminals(tm as Terminal[])
      setDataLoading(false)
    })
  }, [])

  const getTerminalName = (terminalId: string) => {
    const t = terminals.find(t => t.id === terminalId)
    return t ? t.name : terminalId
  }

  const parseQuery = (input: string): QueryResult => {
    const lowerInput = input.toLowerCase()

    // Booking-related queries
    if (
      lowerInput.includes('booking') ||
      lowerInput.includes('order') ||
      lowerInput.includes('transport') ||
      lowerInput.includes('truck')
    ) {
      if (lowerInput.includes('pending')) {
        return { type: 'bookings', data: bookings.filter((b) => b.status === 'PENDING'), query: input }
      }
      if (lowerInput.includes('confirmed') || lowerInput.includes('accepted')) {
        return { type: 'bookings', data: bookings.filter((b) => b.status === 'CONFIRMED'), query: input }
      }
      if (lowerInput.includes('rejected')) {
        return { type: 'bookings', data: bookings.filter((b) => b.status === 'REJECTED'), query: input }
      }
      if (lowerInput.includes('consumed')) {
        return { type: 'bookings', data: bookings.filter((b) => b.status === 'CONSUMED'), query: input }
      }
      if (lowerInput.includes('cancelled')) {
        return { type: 'bookings', data: bookings.filter((b) => b.status === 'CANCELLED'), query: input }
      }
      return { type: 'bookings', data: bookings, query: input }
    }

    // Terminal-related queries
    if (
      lowerInput.includes('terminal') ||
      lowerInput.includes('location') ||
      lowerInput.includes('port')
    ) {
      return { type: 'terminals', data: terminals, query: input }
    }

    // Statistics queries
    if (
      lowerInput.includes('stat') ||
      lowerInput.includes('summary') ||
      lowerInput.includes('overview') ||
      lowerInput.includes('report')
    ) {
      const totalBookings = bookings.length
      const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length
      const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length
      const totalCapacity = terminals.reduce((acc, t) => acc + t.maxSlots, 0)
      const totalLoad = terminals.reduce((acc, t) => acc + (t.maxSlots - t.availableSlots), 0)
      const saturation = totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0

      return {
        type: 'stats',
        data: { totalBookings, pendingBookings, acceptedBookings: confirmedBookings, totalCapacity, totalLoad, saturation },
        query: input,
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setTimeout(() => {
      const parsedResult = parseQuery(query)
      setResult(parsedResult)
      setLoading(false)
    }, 300)
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about bookings, terminals, or statistics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground font-condensed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            Query
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Query Results
            </h3>

            {result.type === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-condensed">
                  <thead>
                    <tr className="border-b border-border bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Booking ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Carrier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Terminal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Driver
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border/50 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground font-mono text-xs">
                          {booking.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {booking.carrier?.email || booking.carrierUserId}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {getTerminalName(booking.terminalId)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {booking.driver?.email || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              booking.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                : booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                  : booking.status === 'REJECTED'
                                    ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                    : booking.status === 'CONSUMED'
                                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                      : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              booking.status === 'PENDING' ? 'bg-amber-500' :
                              booking.status === 'CONFIRMED' ? 'bg-emerald-500' :
                              booking.status === 'REJECTED' ? 'bg-red-500' :
                              booking.status === 'CONSUMED' ? 'bg-blue-500' : 'bg-slate-400'
                            }`} />
                            {booking.status.charAt(0) +
                              booking.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.type === 'terminals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.data.map((terminal) => {
                  const currentLoad = terminal.maxSlots - terminal.availableSlots
                  const saturation = terminal.maxSlots > 0 ? Math.round((currentLoad / terminal.maxSlots) * 100) : 0
                  return (
                    <div
                      key={terminal.id}
                      className="rounded-xl ring-1 ring-slate-200 p-4 bg-slate-50 transition-shadow hover:shadow-sm"
                    >
                      <h4 className="font-semibold text-foreground">
                        {terminal.name}
                      </h4>
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          Status: {terminal.status}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-border rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                saturation > 90
                                  ? 'bg-red-500'
                                  : saturation > 70
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${saturation}%` }}
                            />
                          </div>
                          <span className="font-medium text-foreground">
                            {saturation}%
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          Slots: {currentLoad}/{terminal.maxSlots} used
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {result.type === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-condensed">Total Bookings</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
                    {result.data.totalBookings}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 font-condensed">Pending Bookings</p>
                  <p className="text-3xl font-extrabold text-amber-700 mt-1 tracking-tight">
                    {result.data.pendingBookings}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 font-condensed">Confirmed Bookings</p>
                  <p className="text-3xl font-extrabold text-emerald-700 mt-1 tracking-tight">
                    {result.data.acceptedBookings}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-condensed">Total Capacity</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
                    {result.data.totalCapacity}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-condensed">Current Load</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
                    {result.data.totalLoad}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-5 ring-1 ${
                    result.data.saturation > 90
                      ? 'bg-red-50 ring-red-100'
                      : result.data.saturation > 70
                        ? 'bg-amber-50 ring-amber-100'
                        : 'bg-emerald-50 ring-emerald-100'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider font-condensed ${
                      result.data.saturation > 90
                        ? 'text-red-600'
                        : result.data.saturation > 70
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    Port Saturation
                  </p>
                  <p
                    className={`text-3xl font-extrabold mt-1 tracking-tight ${
                      result.data.saturation > 90
                        ? 'text-red-700'
                        : result.data.saturation > 70
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                    }`}
                  >
                    {result.data.saturation}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {result.data && (
            <p className="text-sm text-muted-foreground">
              Found {result.type === 'bookings' ? result.data.length : result.type === 'terminals' ? result.data.length : '6'} {result.type === 'stats' ? 'statistics' : result.type === 'bookings' ? 'booking(s)' : 'terminal(s)'}
              {' '}matching "{result.query}"
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
          <p className="mt-3 text-muted-foreground">Processing your query...</p>
        </div>
      )}
    </div>
  )
}
