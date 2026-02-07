"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Power, Plus, Search, Loader2 } from "lucide-react"
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
import {
  type Terminal,
  listTerminals,
  createTerminal,
  updateTerminal as apiUpdateTerminal,
  deleteTerminal as apiDeleteTerminal,
} from "@/lib/api"

export function TerminalList() {
  const [terminalsList, setTerminalsList] = useState<Terminal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [showForm, setShowForm] = useState(false)
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    maxSlots: 100,
    availableSlots: 100,
    coordX: 0,
    coordY: 0,
  })

  async function fetchTerminals() {
    try {
      const data = await listTerminals()
      setTerminalsList(data)
    } catch (err) {
      console.error("Failed to fetch terminals:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTerminals()
  }, [])

  const filtered = terminalsList.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function openCreate() {
    setEditingTerminal(null)
    setFormData({ name: "", maxSlots: 100, availableSlots: 100, coordX: 0, coordY: 0 })
    setShowForm(true)
  }

  function openEdit(t: Terminal) {
    setEditingTerminal(t)
    setFormData({
      name: t.name,
      maxSlots: t.maxSlots,
      availableSlots: t.availableSlots,
      coordX: t.coordX,
      coordY: t.coordY,
    })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editingTerminal) {
        await apiUpdateTerminal(editingTerminal.id, {
          name: formData.name,
          maxSlots: formData.maxSlots,
          availableSlots: Math.min(formData.availableSlots, formData.maxSlots),
          coordX: formData.coordX,
          coordY: formData.coordY,
        })
      } else {
        await createTerminal({
          name: formData.name,
          maxSlots: formData.maxSlots,
          availableSlots: formData.availableSlots,
          coordX: formData.coordX,
          coordY: formData.coordY,
        })
      }
      await fetchTerminals()
      setShowForm(false)
    } catch (err) {
      console.error("Failed to save terminal:", err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(id: string) {
    const t = terminalsList.find((t) => t.id === id)
    if (!t) return
    try {
      await apiUpdateTerminal(id, {
        status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
      })
      await fetchTerminals()
    } catch (err) {
      console.error("Failed to toggle status:", err)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteTerminal(id)
      await fetchTerminals()
    } catch (err) {
      console.error("Failed to delete terminal:", err)
    }
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t, index) => {
              const used = t.maxSlots - t.availableSlots
              const percent = t.maxSlots > 0 ? Math.round((used / t.maxSlots) * 100) : 0
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
                        {used}/{t.maxSlots} ({percent}%)
                      </span>
                    </div>
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
                        onClick={() => handleDelete(t.id)}
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
        )}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Max Slots</Label>
                <Input type="number" value={formData.maxSlots} onChange={(e) => setFormData({ ...formData, maxSlots: Number(e.target.value) })} className="bg-secondary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Available Slots</Label>
                <Input type="number" value={formData.availableSlots} onChange={(e) => setFormData({ ...formData, availableSlots: Number(e.target.value) })} className="bg-secondary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Latitude (X)</Label>
                <Input type="number" step="0.0001" value={formData.coordX} onChange={(e) => setFormData({ ...formData, coordX: Number(e.target.value) })} className="bg-secondary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Longitude (Y)</Label>
                <Input type="number" step="0.0001" value={formData.coordY} onChange={(e) => setFormData({ ...formData, coordY: Number(e.target.value) })} className="bg-secondary" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="hover:bg-secondary transition-colors">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/20 transition-all duration-200 active:scale-95">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingTerminal ? "Save Changes" : "Create Terminal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
