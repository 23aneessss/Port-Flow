'use client'

import { useEffect, useRef, useState } from 'react'
import { listTerminals, type Terminal } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface MapProps {
  onTerminalSelect?: (terminalId: string) => void
}

export function Map({ onTerminalSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [terminalsData, setTerminalsData] = useState<Terminal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listTerminals()
      .then(setTerminalsData)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance.current) return

    const initializeMap = async () => {
      if (mapInstance.current) return

      const L = await import('leaflet')

      if (mapInstance.current || !mapRef.current) return

      // Remove any existing map on the container (strict mode double-mount)
      const container = mapRef.current as any
      if (container._leaflet_id) {
        container._leaflet_id = null
      }

      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      L.Marker.prototype.options.icon = DefaultIcon

      const map = L.map(mapRef.current).setView([36.762, 3.055], 14)

      // Styled map tile — CartoDB light style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add location pin markers
      terminalsData.forEach((terminal) => {
        const currentLoad = terminal.maxSlots - terminal.availableSlots
        const saturation = terminal.maxSlots > 0 ? Math.round((currentLoad / terminal.maxSlots) * 100) : 0

        let pinColor = '#10b981'
        let pulseColor = 'rgba(16, 185, 129, 0.3)'
        if (saturation >= 90) {
          pinColor = '#ef4444'
          pulseColor = 'rgba(239, 68, 68, 0.3)'
        } else if (saturation >= 70) {
          pinColor = '#f59e0b'
          pulseColor = 'rgba(245, 158, 11, 0.3)'
        }

        // Use coordX as latitude, coordY as longitude
        const lat = terminal.coordX
        const lng = terminal.coordY

        // Location pin icon SVG
        const customIcon = L.divIcon({
          html: `
            <div style="position:relative;width:40px;height:52px;">
              <!-- Pulse ring -->
              <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:16px;height:8px;background:${pulseColor};border-radius:50%;animation:pulse 2s ease-in-out infinite;"></div>
              <!-- Pin SVG -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="48" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${pinColor}" stroke="#fff" stroke-width="1.5"/>
                <circle cx="12" cy="9" r="3" fill="#fff" opacity="0.9"/>
              </svg>
              <!-- Label -->
              <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#0F172A;color:#F8FAFC;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;white-space:nowrap;font-family:'Roboto Condensed',sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                ${terminal.name.replace('Terminal ', '')}
              </div>
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
                50% { transform: translateX(-50%) scale(2.5); opacity: 0; }
              }
            </style>
          `,
          iconSize: [40, 52],
          iconAnchor: [20, 52],
          popupAnchor: [0, -52],
          className: '',
        })

        const marker = L.marker([lat, lng], {
          icon: customIcon,
        }).addTo(map)

        marker.bindPopup(`
          <div style="font-family:'Roboto Condensed',sans-serif;min-width:180px;padding:4px;">
            <h3 style="font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;color:#0F172A;margin:0 0 10px 0;">${terminal.name}</h3>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:12px;color:#64748B;">Saturation</span>
              <span style="font-size:14px;font-weight:700;color:${pinColor};">${saturation}%</span>
            </div>
            <div style="background:#E2E8F0;border-radius:99px;height:6px;overflow:hidden;margin-bottom:8px;">
              <div style="height:100%;width:${saturation}%;background:${pinColor};border-radius:99px;transition:width 0.3s;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748B;">
              <span>${currentLoad} / ${terminal.maxSlots} slots used</span>
            </div>
          </div>
        `, { className: 'custom-popup' })

        marker.on('click', () => {
          onTerminalSelect?.(terminal.id)
        })
      })

      mapInstance.current = map
    }

    initializeMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [isLoading, terminalsData, onTerminalSelect])

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm flex items-center justify-center h-[420px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div ref={mapRef} className="h-[420px] w-full" />
    </div>
  )
}
