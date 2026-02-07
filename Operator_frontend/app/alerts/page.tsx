'use client'

import { alerts } from '@/lib/mock-data'
import { Layout } from '@/components/layout'
import { AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AlertWithTimestamp {
  icon: any
  bgColor: string
  borderColor: string
  textColor: string
}

const AlertType = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
  default: 'default',
}

export default function AlertsPage() {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case AlertType.critical:
        return AlertCircle
      case AlertType.warning:
        return AlertTriangle
      case AlertType.info:
        return Info
      default:
        return Bell
    }
  }

  const getAlertStyles = (type: string) => {
    switch (type) {
      case AlertType.critical:
        return {
          bg: 'bg-red-50',
          border: 'ring-1 ring-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',
          icon: 'bg-red-100 text-red-500',
        }
      case AlertType.warning:
        return {
          bg: 'bg-amber-50',
          border: 'ring-1 ring-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
          icon: 'bg-amber-100 text-amber-500',
        }
      case AlertType.info:
        return {
          bg: 'bg-sky-50',
          border: 'ring-1 ring-sky-200',
          text: 'text-sky-700',
          badge: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
          icon: 'bg-sky-100 text-sky-500',
        }
      default:
        return {
          bg: 'bg-slate-50',
          border: 'ring-1 ring-slate-200',
          text: 'text-slate-700',
          badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
          icon: 'bg-slate-100 text-slate-500',
        }
    }
  }

  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const alertCounts = {
    critical: alerts.filter((a) => a.type === AlertType.critical).length,
    warning: alerts.filter((a) => a.type === AlertType.warning).length,
    info: alerts.filter((a) => a.type === AlertType.info).length,
  }

  return (
    <Layout>
      <div className="space-y-6 p-8">
        {/* Alert Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-red-50 ring-1 ring-red-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 font-condensed">Critical</p>
            <p className="mt-1 text-2xl font-extrabold text-red-700 tracking-tight">
              {alertCounts.critical}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 font-condensed">Warnings</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-700 tracking-tight">
              {alertCounts.warning}
            </p>
          </div>
          <div className="rounded-xl bg-sky-50 ring-1 ring-sky-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 font-condensed">Info</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-700 tracking-tight">
              {alertCounts.info}
            </p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {sortedAlerts.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center shadow-sm">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground font-condensed">No alerts at this time</p>
            </div>
          ) : (
            sortedAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              const styles = getAlertStyles(alert.type)

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl ${styles.border} ${styles.bg} p-5 transition-shadow hover:shadow-sm`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-bold ${styles.text}`}>
                            {alert.title}
                          </h3>
                          <p className={`mt-1 text-sm font-condensed ${styles.text} opacity-80`}>
                            {alert.message}
                          </p>
                        </div>

                        <div className="ml-4 flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              alert.type === 'critical' ? 'bg-red-500' :
                              alert.type === 'warning' ? 'bg-amber-500' :
                              'bg-sky-500'
                            }`} />
                            {alert.type.charAt(0).toUpperCase() +
                              alert.type.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground font-condensed">
                            {formatDistanceToNow(
                              new Date(alert.timestamp),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>

                      {(alert.related_terminal || alert.related_booking) && (
                        <div className="mt-3 flex gap-2">
                          {alert.related_terminal && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                              Terminal: {alert.related_terminal}
                            </span>
                          )}
                          {alert.related_booking && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                              Booking: {alert.related_booking}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}
