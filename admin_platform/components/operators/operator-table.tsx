"use client"

import { useState } from "react"
import { Eye, EyeOff, Pencil, Trash2, UserX, UserCheck, Plus, Search } from "lucide-react"
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
import { type Operator, operators as initialOperators, terminals } from "@/lib/mock-data"

export function OperatorTable() {
  const [operators, setOperators] = useState<Operator[]>(initialOperators)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    gender: "MALE" as "MALE" | "FEMALE",
    birth_date: "",
  })

  const filtered = operators.filter((op) => {
    const matchesSearch =
      op.first_name.toLowerCase().includes(search.toLowerCase()) ||
      op.last_name.toLowerCase().includes(search.toLowerCase()) ||
      op.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || op.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function togglePassword(id: string) {
    setVisiblePasswords((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openCreate() {
    setEditingOperator(null)
    setFormData({ email: "", password: "", first_name: "", last_name: "", phone: "", gender: "MALE", birth_date: "" })
    setShowForm(true)
  }

  function openEdit(op: Operator) {
    setEditingOperator(op)
    setFormData({
      email: op.email,
      password: op.password,
      first_name: op.first_name,
      last_name: op.last_name,
      phone: op.phone,
      gender: op.gender,
      birth_date: op.birth_date,
    })
    setShowForm(true)
  }

  function handleSave() {
    if (editingOperator) {
      setOperators((prev) =>
        prev.map((op) =>
          op.id === editingOperator.id
            ? { ...op, ...formData }
            : op
        )
      )
    } else {
      const newOp: Operator = {
        id: `op-${String(operators.length + 1).padStart(3, "0")}`,
        ...formData,
        status: "ACTIVE",
      }
      setOperators((prev) => [...prev, newOp])
    }
    setShowForm(false)
  }

  function toggleStatus(id: string) {
    setOperators((prev) =>
      prev.map((op) =>
        op.id === id
          ? { ...op, status: op.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : op
      )
    )
  }

  function deleteOperator(id: string) {
    setOperators((prev) => prev.filter((op) => op.id !== id))
  }

  function getTerminalName(terminalId?: string) {
    if (!terminalId) return "Unassigned"
    return terminals.find((t) => t.id === terminalId)?.name ?? "Unknown"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search operators..."
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
          Add Operator
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminal</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((op, index) => (
              <TableRow
                key={op.id}
                className="cursor-pointer hover:bg-secondary/30 transition-colors duration-150 animate-fade-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => { setSelectedOperator(op); setShowDetail(true) }}
              >
                <TableCell className="font-medium text-foreground">
                  {op.first_name} {op.last_name}
                </TableCell>
                <TableCell className="text-muted-foreground">{op.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {visiblePasswords.has(op.id) ? op.password : "••••••••"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={(e) => { e.stopPropagation(); togglePassword(op.id) }}
                    >
                      {visiblePasswords.has(op.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{op.phone}</TableCell>
                <TableCell className="text-muted-foreground">{getTerminalName(op.terminal_id)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      op.status === "ACTIVE"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }
                  >
                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${op.status === "ACTIVE" ? "bg-success animate-pulse" : "bg-destructive"}`} />
                    {op.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-150 rounded-full"
                      onClick={(e) => { e.stopPropagation(); openEdit(op) }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 transition-all duration-150 rounded-full ${op.status === "ACTIVE" ? "text-muted-foreground hover:text-warning hover:bg-warning/10" : "text-muted-foreground hover:text-success hover:bg-success/10"}`}
                      onClick={(e) => { e.stopPropagation(); toggleStatus(op.id) }}
                    >
                      {op.status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 rounded-full"
                      onClick={(e) => { e.stopPropagation(); deleteOperator(op.id) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Operator Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Viewing details for the selected operator.
            </DialogDescription>
          </DialogHeader>
          {selectedOperator && (
            <div className="flex flex-col gap-3">
              {[
                ["Name", `${selectedOperator.first_name} ${selectedOperator.last_name}`],
                ["Email", selectedOperator.email],
                ["Phone", selectedOperator.phone],
                ["Gender", selectedOperator.gender],
                ["Date of Birth", selectedOperator.birth_date],
                ["Status", selectedOperator.status],
                ["Terminal", getTerminalName(selectedOperator.terminal_id)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">
              {editingOperator ? "Edit Operator" : "Create Operator"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingOperator ? "Update operator information." : "Fill in the details to create a new operator."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">First Name</Label>
                <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="bg-secondary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Last Name</Label>
                <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="bg-secondary" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-secondary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Gender</Label>
                <Select value={formData.gender} onValueChange={(val: "MALE" | "FEMALE") => setFormData({ ...formData, gender: val })}>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Birth Date</Label>
                <Input type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="bg-secondary" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="hover:bg-secondary transition-colors">Cancel</Button>
            <Button onClick={handleSave} className="bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/20 transition-all duration-200 active:scale-95">
              {editingOperator ? "Save Changes" : "Create Operator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
