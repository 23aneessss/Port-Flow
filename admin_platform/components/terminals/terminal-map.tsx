"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { terminals, operators } from "@/lib/mock-data"

export function TerminalMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    async function initMap() {
      const L = await import("leaflet")
      await import("leaflet/dist/leaflet.css")

      if (!mapRef.current || cancelled || mapInstanceRef.current) return

      const map = L.map(mapRef.current).setView([36.76, 3.06], 14)
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      terminals.forEach((terminal) => {
        const used = terminal.max_slots - terminal.available_slots
        const percent = Math.round((used / terminal.max_slots) * 100)
        const isActive = terminal.status === "ACTIVE"
        const markerColor = !isActive ? "#64748B" : percent >= 80 ? "#ef4444" : percent >= 60 ? "#eab308" : "#38BDF8"

        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${markerColor};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const linkedOps = terminal.operators
          .map((id) => {
            const op = operators.find((o) => o.id === id)
            return op ? `${op.first_name} ${op.last_name}` : ""
          })
          .filter(Boolean)

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #0F172A;">${terminal.name}</h3>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="
                display: inline-block;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
                background: ${isActive ? "#dcfce7" : "#fde8e8"};
                color: ${isActive ? "#16a34a" : "#dc2626"};
              ">${terminal.status}</span>
            </div>
            <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
              <strong>Slots:</strong> ${used}/${terminal.max_slots} (${percent}% used)
            </div>
            <div style="
              background: #e2e8f0;
              border-radius: 999px;
              height: 6px;
              overflow: hidden;
              margin-bottom: 6px;
            ">
              <div style="
                height: 100%;
                width: ${percent}%;
                background: ${markerColor};
                border-radius: 999px;
              "></div>
            </div>
            ${linkedOps.length > 0 ? `
              <div style="font-size: 12px; color: #64748B;">
                <strong>Operators:</strong> ${linkedOps.join(", ")}
              </div>
            ` : '<div style="font-size: 12px; color: #94a3b8;">No operators assigned</div>'}
          </div>
        `

        L.marker([terminal.coordinates.x, terminal.coordinates.y], { icon })
          .addTo(map)
          .bindPopup(popupContent)
      })
    }

    initMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Terminal Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="h-96 w-full overflow-hidden rounded-lg"
          style={{ zIndex: 0 }}
        />
      </CardContent>
    </Card>
  )
}
