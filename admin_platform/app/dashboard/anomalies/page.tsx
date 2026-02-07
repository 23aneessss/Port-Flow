"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, AlertCircle, Info, Clock, Building2, ChevronRight } from "lucide-react"
import { anomalies, type Anomaly } from "@/lib/mock-data"

function getSeverityConfig(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return {
        classes: "border-destructive/20 bg-destructive/10 text-destructive",
        icon: AlertCircle,
        bgCard: "border-l-destructive",
      }
    case "WARNING":
      return {
        classes: "border-warning/20 bg-warning/10 text-warning",
        icon: AlertTriangle,
        bgCard: "border-l-warning",
      }
    default:
      return {
        classes: "border-accent/20 bg-accent/10 text-accent",
        icon: Info,
        bgCard: "border-l-accent",
      }
  }
}

export default function AnomaliesPage() {
  const [severityFilter, setSeverityFilter] = useState<string>("ALL")
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filtered = anomalies.filter((a) =>
    severityFilter === "ALL" || a.severity === severityFilter
  )

  const criticalCount = anomalies.filter((a) => a.severity === "CRITICAL").length
  const warningCount = anomalies.filter((a) => a.severity === "WARNING").length
  const infoCount = anomalies.filter((a) => a.severity === "INFO").length

  return (
    <>
      <AdminHeader title="Anomalies & Incidents" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Critical</p>
                  <p className="font-heading text-xl font-bold text-foreground">{criticalCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                  <p className="font-heading text-xl font-bold text-foreground">{warningCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Info className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Informational</p>
                  <p className="font-heading text-xl font-bold text-foreground">{infoCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anomaly Cards */}
          <div className="flex flex-col gap-3">
            {filtered.map((a) => {
              const config = getSeverityConfig(a.severity)
              const SeverityIcon = config.icon
              return (
                <Card
                  key={a.id}
                  className={`cursor-pointer border-l-4 bg-card transition-all duration-200 hover:bg-secondary/30 hover:shadow-md ${config.bgCard} animate-fade-in-up`}
                  style={{ animationDelay: `${filtered.indexOf(a) * 60}ms` }}
                  onClick={() => { setSelectedAnomaly(a); setShowDetail(true) }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.severity === "CRITICAL" ? "bg-destructive/10" : a.severity === "WARNING" ? "bg-warning/10" : "bg-accent/10"}`}>
                      <SeverityIcon className={`h-5 w-5 ${a.severity === "CRITICAL" ? "text-destructive" : a.severity === "WARNING" ? "text-warning" : "text-accent"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                        <Badge variant="outline" className={config.classes}>
                          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${a.severity === "CRITICAL" ? "bg-destructive animate-pulse" : a.severity === "WARNING" ? "bg-warning" : "bg-accent"}`} />
                          {a.severity}
                        </Badge>
                        <Badge variant="outline" className={a.status === "OPEN" ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-muted-foreground/20 bg-muted text-muted-foreground"}>
                          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${a.status === "OPEN" ? "bg-destructive animate-pulse" : "bg-muted-foreground"}`} />
                          {a.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {a.terminal_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(a.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Detail Modal */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-foreground">Anomaly Details</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Detailed incident information.
              </DialogDescription>
            </DialogHeader>
            {selectedAnomaly && (
              <div className="flex flex-col gap-3">
                {[
                  ["Title", selectedAnomaly.title],
                  ["Description", selectedAnomaly.description],
                  ["Terminal", selectedAnomaly.terminal_name],
                  ["Severity", selectedAnomaly.severity],
                  ["Status", selectedAnomaly.status],
                  ["Timestamp", new Date(selectedAnomaly.timestamp).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-secondary/50 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}
