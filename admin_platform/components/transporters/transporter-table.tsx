"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Eye, Search, Power, Loader2 } from "lucide-react"
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
import {
  type CarrierProfile,
  listCarriers,
  approveCarrier,
  rejectCarrier,
  listCarrierDrivers,
} from "@/lib/api"

function getStatusConfig(status: string) {
  switch (status) {
    case "APPROVED":
      return { classes: "border-success/30 bg-success/10 text-success", dot: "bg-success animate-pulse" }
    case "SUSPENDED":
      return { classes: "border-destructive/30 bg-destructive/10 text-destructive", dot: "bg-destructive" }
    case "PENDING":
      return { classes: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning animate-pulse" }
    case "REJECTED":
      return { classes: "border-destructive/30 bg-destructive/10 text-destructive", dot: "bg-destructive" }
    default:
      return { classes: "", dot: "" }
  }
}

interface DriverInfo {
  userId: string
  firstName: string
  lastName: string
  phone: string
  truckPlate: string
}

export function TransporterTable() {
  const [carriers, setCarriers] = useState<CarrierProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierProfile | null>(null)
  const [carrierDrivers, setCarrierDrivers] = useState<DriverInfo[]>([])
  const [showDetail, setShowDetail] = useState(false)
  const [loadingDrivers, setLoadingDrivers] = useState(false)

  async function fetchCarriers() {
    try {
      const data = await listCarriers()
      setCarriers(data)
    } catch (err) {
      console.error("Failed to fetch carriers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCarriers()
  }, [])

  const filtered = carriers.filter((c) => {
    const name = `${c.firstName} ${c.lastName} ${c.companyName}`.toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = carriers.filter((c) => c.status === "PENDING").length

  async function handleApprove(id: string) {
    try {
      await approveCarrier(id)
      await fetchCarriers()
    } catch (err) {
      console.error("Failed to approve carrier:", err)
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectCarrier(id)
      await fetchCarriers()
    } catch (err) {
      console.error("Failed to reject carrier:", err)
    }
  }

  async function openDetail(c: CarrierProfile) {
    setSelectedCarrier(c)
    setShowDetail(true)
    setLoadingDrivers(true)
    try {
      const drivers = await listCarrierDrivers(c.userId)
      setCarrierDrivers(drivers)
    } catch {
      setCarrierDrivers([])
    } finally {
      setLoadingDrivers(false)
    }
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
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, index) => (
              <TableRow key={c.userId} className="hover:bg-secondary/30 transition-colors duration-150 animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
                <TableCell className="font-medium text-foreground">{c.firstName} {c.lastName}</TableCell>
                <TableCell className="text-muted-foreground">{c.companyName}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {(() => { const config = getStatusConfig(c.status); return (
                    <Badge variant="outline" className={config.classes}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {c.status}
                    </Badge>
                  ) })()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-150 rounded-full"
                      onClick={() => openDetail(c)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {c.status === "PENDING" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success hover:text-success/80 hover:bg-success/10 transition-all duration-150 rounded-full"
                          onClick={() => handleApprove(c.userId)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-all duration-150 rounded-full"
                          onClick={() => handleReject(c.userId)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
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
          {selectedCarrier && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {[
                  ["Name", `${selectedCarrier.firstName} ${selectedCarrier.lastName}`],
                  ["Company", selectedCarrier.companyName],
                  ["Email", selectedCarrier.user.email],
                  ["Phone", selectedCarrier.phone],
                  ["Status", selectedCarrier.status],
                  ["Registered", new Date(selectedCarrier.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
                {selectedCarrier.proofDocumentUrl && (
                  <div className="flex justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">Proof Document</span>
                    <a href={selectedCarrier.proofDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">
                      View Document
                    </a>
                  </div>
                )}
              </div>
              <div>
                <h4 className="mb-2 font-heading text-sm font-semibold text-foreground">
                  Drivers
                </h4>
                {loadingDrivers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : carrierDrivers.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {carrierDrivers.map((d) => (
                      <div
                        key={d.userId}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.firstName} {d.lastName}</p>
                          <p className="text-xs text-muted-foreground">{d.phone}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{d.truckPlate}</span>
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
