"use client"

import { Building2, CheckCircle, XCircle, Users, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { terminals, operators } from "@/lib/mock-data"

const kpis = [
  {
    title: "Total Terminals",
    value: terminals.length,
    icon: Building2,
    color: "bg-accent/10 text-accent",
    borderColor: "border-accent/20",
    trend: "+2",
    trendUp: true,
  },
  {
    title: "Active Terminals",
    value: terminals.filter((t) => t.status === "ACTIVE").length,
    icon: CheckCircle,
    color: "bg-success/10 text-success",
    borderColor: "border-success/20",
    trend: "+1",
    trendUp: true,
  },
  {
    title: "Suspended Terminals",
    value: terminals.filter((t) => t.status === "SUSPENDED").length,
    icon: XCircle,
    color: "bg-destructive/10 text-destructive",
    borderColor: "border-destructive/20",
    trend: "-1",
    trendUp: false,
  },
  {
    title: "Total Operators",
    value: operators.length,
    icon: Users,
    color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]",
    borderColor: "border-[hsl(var(--chart-4))]/20",
    trend: "+3",
    trendUp: true,
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="flex items-baseline gap-2">
                <p className="font-heading text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
                <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${kpi.trendUp ? "text-success" : "text-destructive"}`}>
                  {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
