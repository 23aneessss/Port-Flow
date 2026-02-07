"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import type { Driver } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"
import { DriverFormModal } from "@/components/driver-form-modal"
import { DriverDetailModal } from "@/components/driver-detail-modal"

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useAppStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [detailDriver, setDetailDriver] = useState<Driver | null>(null)

  const handleAdd = (data: Omit<Driver, "id">) => {
    addDriver(data)
  }

  const handleEdit = (data: Omit<Driver, "id">) => {
    if (editingDriver) {
      updateDriver(editingDriver.id, data)
      setEditingDriver(null)
    }
  }

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setFormOpen(true)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Drivers Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your fleet drivers and their credentials
          </p>
        </div>
        <Button
          className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          onClick={() => {
            setEditingDriver(null)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="animate-slide-up rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow
                key={driver.id}
                className="cursor-pointer transition-colors duration-150 hover:bg-muted/40"
                onClick={() => setDetailDriver(driver)}
              >
                <TableCell className="font-medium text-card-foreground">
                  {driver.fullName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {driver.phone}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {driver.truckNumber}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {driver.plateNumber}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      driver.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-50"
                        : "bg-red-50 text-red-500 border border-red-200/60 hover:bg-red-50"
                    }
                  >
                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                      driver.status === "Active" ? "bg-emerald-500" : "bg-red-400"
                    }`} />
                    {driver.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {drivers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  No drivers found. Add your first driver to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Modal */}
      <DriverFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingDriver(null)
        }}
        onSubmit={editingDriver ? handleEdit : handleAdd}
        initialData={editingDriver}
      />

      {/* Detail Modal */}
      <DriverDetailModal
        open={!!detailDriver}
        onClose={() => setDetailDriver(null)}
        driver={detailDriver}
        onEdit={handleOpenEdit}
        onDelete={deleteDriver}
      />
    </div>
  )
}
