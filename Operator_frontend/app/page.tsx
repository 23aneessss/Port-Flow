'use client'

import { terminals, bookings, getSaturationLevel, carrierNames, driverNames } from '@/lib/mock-data'
import { Layout } from '@/components/layout'
import { StatCard } from '@/components/stat-card'
import { Map } from '@/components/map'
import { Truck, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function DashboardPage() {
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null)
  
  const todayBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length
  const totalCapacity = terminals.reduce((acc, t) => acc + t.capacity, 0)
  const totalLoad = terminals.reduce((acc, t) => acc + t.currentLoad, 0)
  const portSaturation = Math.round((totalLoad / totalCapacity) * 100)

  return (
    <Layout>
      <div className="space-y-8 p-8">
        {/* Global Statistics */}
        <div>
          <h2 className="mb-4 text-lg font-extrabold text-foreground tracking-tight">
            Global Statistics
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
              <StatCard
                label="Total Terminals"
                value={terminals.length}
                icon={Truck}
                color="blue"
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              <StatCard
                label="Trucks Processed Today"
                value={totalLoad}
                icon={Truck}
                color="green"
                trend={{ value: 12, label: 'vs yesterday', positive: true }}
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
              <StatCard
                label="Pending Bookings"
                value={pendingBookings}
                icon={Clock}
                color="amber"
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '240ms' }}>
              <StatCard
                label="Port Saturation"
                value={`${portSaturation}%`}
                icon={AlertTriangle}
                color={portSaturation > 90 ? 'red' : portSaturation > 70 ? 'amber' : 'green'}
              />
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <h2 className="mb-4 text-lg font-extrabold text-foreground tracking-tight">
            Terminal Locations
          </h2>
          <Map onTerminalSelect={setSelectedTerminal} />
        </div>

        {/* Recent Bookings Summary */}
        <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
          <h2 className="mb-4 text-lg font-extrabold text-foreground tracking-tight">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-condensed">
                <thead>
                  <tr className="border-b border-border bg-slate-50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Booking ID
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Carrier
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Terminal
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Operation
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="animate-fade-in-row border-b border-border/50 transition-colors hover:bg-slate-50/60"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <td className="px-6 py-3.5 font-medium text-foreground font-mono text-xs">
                        {booking.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {carrierNames[booking.carrier_id] || booking.carrier_id}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {terminals.find(t => t.id === booking.terminal_id)?.name || booking.terminal_id}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          booking.operation_type === 'DROP_OFF'
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                        }`}>
                          {booking.operation_type === 'DROP_OFF' ? 'Drop Off' : 'Pick Up'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
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
                            booking.status === 'PENDING' ? 'bg-amber-500 animate-pulse-dot'
                              : booking.status === 'CONFIRMED' ? 'bg-emerald-500'
                                : booking.status === 'REJECTED' ? 'bg-red-500'
                                  : booking.status === 'CONSUMED' ? 'bg-blue-500'
                                    : 'bg-slate-400'
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
          </div>
        </div>
      </div>
    </Layout>
  )
}
