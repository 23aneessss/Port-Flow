"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Eye, Search, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { type Transporter, transporters as initialTransporters } from "@/lib/mock-data"

function getStatusConfig(status: string) {
  switch (status) {
    case "ACTIVE":
      return { classes: "border-success/30 bg-success/10 text-success", dot: "bg-success animate-pulse" }
    case "SUSPENDED":
      return { classes: "border-destructive/30 bg-destructive/10 text-destructive", dot: "bg-destructive" }
    case "PENDING":
      return { classes: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning animate-pulse" }
    default:
      return { classes: "", dot: "" }
  }
}

export function TransporterTable() {
  const [transporters, setTransporters] = useState<Transporter[]>(initialTransporters)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filtered = transporters.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = transporters.filter((t) => t.status === "PENDING").length

  function validateTransporter(id: string) {
    setTransporters((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "ACTIVE" as const } : t))
    )
  }

  function toggleStatus(id: string) {
    setTransporters((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "ACTIVE" ? ("SUSPENDED" as const) : ("ACTIVE" as const) }
          : t
      )
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
            <CheckCircle className="h-4 w-4 text-warning" />
          </div>
          <p className="text-sm text-foreground">
            <span className="font-semibold">{pendingCount}</span> transporter registration{pendingCount > 1 ? "s" : ""} pending validation.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transporters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drivers</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} className="hover:bg-secondary/30 transition-colors duration-150 animate-fade-in-up" style={{ animationDelay: `${filtered.indexOf(t) * 40}ms` }}>
                <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.phone}</TableCell>
                <TableCell className="text-muted-foreground">{t.drivers.length}</TableCell>
                <TableCell className="text-muted-foreground">{t.registered_at}</TableCell>
                <TableCell>
                  {(() => { const config = getStatusConfig(t.status); return (
                    <Badge variant="outline" className={config.classes}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {t.status}
                    </Badge>
                  ) })()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-150 rounded-full"
                      onClick={() => { setSelectedTransporter(t); setShowDetail(true) }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {t.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success hover:text-success/80 hover:bg-success/10 transition-all duration-150 rounded-full"
                        onClick={() => validateTransporter(t.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {t.status !== "PENDING" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 transition-all duration-150 rounded-full ${t.status === "ACTIVE" ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-success hover:bg-success/10"}`}
                        onClick={() => toggleStatus(t.id)}
                      >
                        {t.status === "ACTIVE" ? <XCircle className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Transporter Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Viewing transporter information and associated drivers.
            </DialogDescription>
          </DialogHeader>
          {selectedTransporter && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {[
                  ["Name", selectedTransporter.name],
                  ["Phone", selectedTransporter.phone],
                  ["Status", selectedTransporter.status],
                  ["Registered", selectedTransporter.registered_at],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="mb-2 font-heading text-sm font-semibold text-foreground">
                  Drivers ({selectedTransporter.drivers.length})
                </h4>
                {selectedTransporter.drivers.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedTransporter.drivers.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.phone}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{d.license_number}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No drivers registered.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
