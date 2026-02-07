"use client"

import { useState } from "react"
import { Pencil, Trash2, Power, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { type Terminal, terminals as initialTerminals, operators } from "@/lib/mock-data"

export function TerminalList() {
  const [terminalsList, setTerminalsList] = useState<Terminal[]>(initialTerminals)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [showForm, setShowForm] = useState(false)
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    max_slots: 100,
    x: 0,
    y: 0,
  })

  const filtered = terminalsList.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function openCreate() {
    setEditingTerminal(null)
    setFormData({ name: "", max_slots: 100, x: 0, y: 0 })
    setShowForm(true)
  }

  function openEdit(t: Terminal) {
    setEditingTerminal(t)
    setFormData({
      name: t.name,
      max_slots: t.max_slots,
      x: t.coordinates.x,
      y: t.coordinates.y,
    })
    setShowForm(true)
  }

  function handleSave() {
    if (editingTerminal) {
      setTerminalsList((prev) =>
        prev.map((t) =>
          t.id === editingTerminal.id
            ? {
                ...t,
                name: formData.name,
                max_slots: formData.max_slots,
                available_slots: Math.min(t.available_slots, formData.max_slots),
                coordinates: { x: formData.x, y: formData.y },
              }
            : t
        )
      )
    } else {
      const newTerminal: Terminal = {
        id: `t-${String(terminalsList.length + 1).padStart(3, "0")}`,
        name: formData.name,
        status: "ACTIVE",
        max_slots: formData.max_slots,
        available_slots: formData.max_slots,
        coordinates: { x: formData.x, y: formData.y },
        operators: [],
      }
      setTerminalsList((prev) => [...prev, newTerminal])
    }
    setShowForm(false)
  }

  function toggleStatus(id: string) {
    setTerminalsList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : t
      )
    )
  }

  function deleteTerminal(id: string) {
    setTerminalsList((prev) => prev.filter((t) => t.id !== id))
  }

  function getOperatorNames(opIds: string[]) {
    return opIds
      .map((id) => {
        const op = operators.find((o) => o.id === id)
        return op ? `${op.first_name} ${op.last_name}` : ""
      })
      .filter(Boolean)
      .join(", ") || "None"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search terminals..."
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
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all duration-200 active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Add Terminal
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Operators</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t, index) => {
              const used = t.max_slots - t.available_slots
              const percent = Math.round((used / t.max_slots) * 100)
              return (
                <TableRow key={t.id} className="hover:bg-secondary/30 transition-colors duration-150 animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
                  <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        t.status === "ACTIVE"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }
                    >
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${t.status === "ACTIVE" ? "bg-success animate-pulse" : "bg-destructive"}`} />
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={percent}
                        className="h-2 w-24"
                      />
                      <span className="text-xs text-muted-foreground">
                        {used}/{t.max_slots} ({percent}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {getOperatorNames(t.operators)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-150 rounded-full"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 transition-all duration-150 rounded-full ${t.status === "ACTIVE" ? "text-muted-foreground hover:text-warning hover:bg-warning/10" : "text-muted-foreground hover:text-success hover:bg-success/10"}`}
                        onClick={() => toggleStatus(t.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 rounded-full"
                        onClick={() => deleteTerminal(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">
              {editingTerminal ? "Edit Terminal" : "Add Terminal"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingTerminal ? "Update terminal configuration." : "Create a new terminal entry."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Terminal Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Max Slots</Label>
              <Input type="number" value={formData.max_slots} onChange={(e) => setFormData({ ...formData, max_slots: Number(e.target.value) })} className="bg-secondary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Latitude (X)</Label>
                <Input type="number" step="0.0001" value={formData.x} onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })} className="bg-secondary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Longitude (Y)</Label>
                <Input type="number" step="0.0001" value={formData.y} onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })} className="bg-secondary" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="hover:bg-secondary transition-colors">Cancel</Button>
            <Button onClick={handleSave} className="bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/20 transition-all duration-200 active:scale-95">
              {editingTerminal ? "Save Changes" : "Create Terminal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
