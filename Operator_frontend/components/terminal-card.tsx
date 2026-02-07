'use client'

import { useState } from 'react'
import { Terminal } from '@/lib/mock-data'
import {
  getSaturationLevel,
  getSaturationColor,
  getSaturationColorText,
  getSaturationBg,
} from '@/lib/mock-data'
import { ChevronDown } from 'lucide-react'

interface TerminalCardProps {
  terminal: Terminal
}

export function TerminalCard({ terminal }: TerminalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const saturation = getSaturationLevel(terminal)
  const satColor = getSaturationColor(saturation)
  const satColorText = getSaturationColorText(saturation)
  const satBg = getSaturationBg(saturation)

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground">
            {terminal.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Capacity: {terminal.capacity} trucks
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div className={`mt-4 rounded-lg ${satBg} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${satColorText}`}>
              Saturation Level
            </p>
            <p className={`mt-1 text-2xl font-bold ${satColorText}`}>
              {saturation}%
            </p>
          </div>
          <div className={`rounded-full ${satColor} h-12 w-12 flex items-center justify-center text-white font-bold text-lg`}>
            {saturation}
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/50">
          <div
            className={`h-full ${satColor} transition-all`}
            style={{ width: `${saturation}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className={satColorText}>
            {terminal.currentLoad} / {terminal.capacity} trucks
          </span>
          {terminal.pendingBookings > 0 && (
            <span className="font-medium text-blue-600">
              {terminal.pendingBookings} pending
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Current Load
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {terminal.currentLoad}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Available Capacity
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {terminal.capacity - terminal.currentLoad}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Pending Requests
              </p>
              <p className="mt-1 text-xl font-bold text-blue-600">
                {terminal.pendingBookings}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Coordinates
              </p>
              <p className="mt-1 text-xs font-mono text-foreground">
                {terminal.latitude.toFixed(2)}, {terminal.longitude.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
