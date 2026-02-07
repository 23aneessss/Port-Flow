"use client"

import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { anomalies } from "@/lib/mock-data"

function getSeverityConfig(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return {
        classes: "border-destructive/30 bg-destructive/10 text-destructive",
        icon: AlertCircle,
        dot: "bg-destructive",
      }
    case "WARNING":
      return {
        classes: "border-warning/30 bg-warning/10 text-warning",
        icon: AlertTriangle,
        dot: "bg-warning",
      }
    default:
      return {
        classes: "border-accent/30 bg-accent/10 text-accent",
        icon: Info,
        dot: "bg-accent",
      }
  }
}

export function RecentAnomalies() {
  const recent = anomalies.slice(0, 4)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          Recent Anomalies
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]" variant="outline">
            {anomalies.filter(a => a.status === "OPEN").length} open
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {recent.map((a, index) => {
            const config = getSeverityConfig(a.severity)
            const SeverityIcon = config.icon
            return (
              <div
                key={a.id}
                className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all duration-200 hover:bg-secondary/80 hover:shadow-sm animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.severity === "CRITICAL" ? "bg-destructive/10" : a.severity === "WARNING" ? "bg-warning/10" : "bg-accent/10"}`}>
                  <SeverityIcon className={`h-4 w-4 ${a.severity === "CRITICAL" ? "text-destructive" : a.severity === "WARNING" ? "text-warning" : "text-accent"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.terminal_name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className={`${config.classes} text-[10px]`}
                  >
                    <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
                    {a.severity}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
