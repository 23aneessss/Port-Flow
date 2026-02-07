"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import type { Driver } from "@/lib/data"

interface DriverDetailModalProps {
  open: boolean
  onClose: () => void
  driver: Driver | null
  onEdit: (driver: Driver) => void
  onDelete: (id: string) => void
}

export function DriverDetailModal({
  open,
  onClose,
  driver,
  onEdit,
  onDelete,
}: DriverDetailModalProps) {
  if (!driver) return null

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Driver Details</DialogTitle>
          <DialogDescription>
            View driver information and manage their account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Full Name
            </span>
            <span className="text-sm font-semibold text-card-foreground">
              {driver.firstName} {driver.lastName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Email
            </span>
            <span className="text-sm text-card-foreground">{driver.user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Phone
            </span>
            <span className="text-sm text-card-foreground">{driver.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Gender
            </span>
            <span className="text-sm text-card-foreground">{driver.gender}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Date of Birth
            </span>
            <span className="text-sm text-card-foreground">
              {new Date(driver.birthDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Status
            </span>
            <Badge
              className={
                driver.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-50"
                  : "bg-red-50 text-red-500 border border-red-200/60 hover:bg-red-50"
              }
            >
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                driver.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-400"
              }`} />
              {driver.status === "ACTIVE" ? "Active" : "Suspended"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Truck Number
            </span>
            <span className="text-sm text-card-foreground">{driver.truckNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Truck Plate
            </span>
            <span className="text-sm text-card-foreground">{driver.truckPlate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Driving License
            </span>
            <a
              href={driver.drivingLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Document
            </a>
          </div>

          <div className="mt-2 flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                onEdit(driver)
              }}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(driver.userId)
                onClose()
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
