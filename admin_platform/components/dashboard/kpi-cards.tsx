"use client"

import { useEffect, useState } from "react"
import { Building2, CheckCircle, Clock, Users, Truck, Package, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getDashboardOverview, type DashboardOverview } from "@/lib/api"

export function KpiCards() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDashboardOverview()
      .then(setOverview)
      .catch((err) => console.error("Failed to load dashboard:", err))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const kpis = [
    {
      title: "Total Terminals",
      value: overview?.totalTerminals ?? 0,
      icon: Building2,
      color: "bg-accent/10 text-accent",
      borderColor: "border-accent/20",
    },
    {
      title: "Total Bookings",
      value: overview?.totalBookings ?? 0,
      icon: Package,
      color: "bg-success/10 text-success",
      borderColor: "border-success/20",
    },
    {
      title: "Pending Bookings",
      value: overview?.pendingBookings ?? 0,
      icon: Clock,
      color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]",
      borderColor: "border-[hsl(var(--chart-3))]/20",
    },
    {
      title: "Total Carriers",
      value: overview?.totalCarriers ?? 0,
      icon: Truck,
      color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]",
      borderColor: "border-[hsl(var(--chart-4))]/20",
    },
    {
      title: "Pending Carriers",
      value: overview?.carriersPending ?? 0,
      icon: CheckCircle,
      color: "bg-warning/10 text-warning",
      borderColor: "border-warning/20",
    },
    {
      title: "Total Drivers",
      value: overview?.totalDrivers ?? 0,
      icon: Users,
      color: "bg-destructive/10 text-destructive",
      borderColor: "border-destructive/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <Card
          key={kpi.title}
          className={`group border bg-card hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up ${kpi.borderColor}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.color} transition-transform duration-300 group-hover:scale-110`}
            >
              <kpi.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {kpi.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
