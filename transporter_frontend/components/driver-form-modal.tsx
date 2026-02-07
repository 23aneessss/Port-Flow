"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Driver, DriverStatus } from "@/lib/data"

interface DriverFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Driver, "id">) => void
  initialData?: Driver | null
}

export function DriverFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: DriverFormModalProps) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<DriverStatus>("Active")
  const [truckNumber, setTruckNumber] = useState("")
  const [plateNumber, setPlateNumber] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseVerified, setLicenseVerified] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName)
      setPhone(initialData.phone)
      setStatus(initialData.status)
      setTruckNumber(initialData.truckNumber)
      setPlateNumber(initialData.plateNumber)
      setLicenseNumber(initialData.licenseNumber)
      setLicenseVerified(initialData.licenseVerified)
    } else {
      setFullName("")
      setPhone("")
      setStatus("Active")
      setTruckNumber("")
      setPlateNumber("")
      setLicenseNumber("")
      setLicenseVerified(false)
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ fullName, phone, status, truckNumber, plateNumber, licenseNumber, licenseVerified })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {initialData ? "Edit Driver" : "Add New Driver"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {initialData
              ? "Update the driver information below."
              : "Fill in the details to register a new driver."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="fullName" className="text-xs">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="h-8 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 6XX XXX XXX"
                className="h-8 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="status" className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DriverStatus)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="truckNumber" className="text-xs">Truck Number</Label>
              <Input
                id="truckNumber"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                placeholder="TRK-001"
                className="h-8 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="plateNumber" className="text-xs">Plate Number</Label>
              <Input
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="12345-A-1"
                className="h-8 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="licenseNumber" className="text-xs">License Number</Label>
            <Input
              id="licenseNumber"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="LIC-2024-001"
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="licenseVerified"
              checked={licenseVerified}
              onCheckedChange={(checked) => setLicenseVerified(checked === true)}
            />
            <Label htmlFor="licenseVerified" className="cursor-pointer text-xs">License Verified</Label>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
