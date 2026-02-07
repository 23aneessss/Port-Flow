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
import type { Driver, DriverStatus } from "@/lib/data"

interface DriverFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: Driver | null
}

export function DriverFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: DriverFormModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [status, setStatus] = useState<DriverStatus>("ACTIVE")
  const [truckNumber, setTruckNumber] = useState("")
  const [truckPlate, setTruckPlate] = useState("")
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState("")

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.user?.email || "")
      setPassword("")
      setFirstName(initialData.firstName)
      setLastName(initialData.lastName)
      setPhone(initialData.phone)
      setGender(initialData.gender)
      setBirthDate(initialData.birthDate ? initialData.birthDate.split("T")[0] : "")
      setStatus(initialData.status)
      setTruckNumber(initialData.truckNumber)
      setTruckPlate(initialData.truckPlate)
      setDrivingLicenseUrl(initialData.drivingLicenseUrl)
    } else {
      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
      setPhone("")
      setGender("")
      setBirthDate("")
      setStatus("ACTIVE")
      setTruckNumber("")
      setTruckPlate("")
      setDrivingLicenseUrl("")
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (initialData) {
      // Update — only send profile fields
      onSubmit({
        firstName,
        lastName,
        phone,
        gender,
        birthDate,
        status,
        truckNumber,
        truckPlate,
        drivingLicenseUrl,
      })
    } else {
      // Create — send all required fields
      onSubmit({
        email,
        password,
        firstName,
        lastName,
        phone,
        gender,
        birthDate,
        truckNumber,
        truckPlate,
        drivingLicenseUrl,
      })
    }
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
          {!initialData && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@email.com"
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-8 text-sm"
                  required
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-8 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-8 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 6XX XXX XXX"
                className="h-8 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="gender" className="text-xs">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="birthDate" className="text-xs">Date of Birth</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="h-8 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DriverStatus)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="truckPlate" className="text-xs">Truck Plate</Label>
              <Input
                id="truckPlate"
                value={truckPlate}
                onChange={(e) => setTruckPlate(e.target.value)}
                placeholder="12345-A-1"
                className="h-8 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="drivingLicenseUrl" className="text-xs">Driving License URL</Label>
            <Input
              id="drivingLicenseUrl"
              value={drivingLicenseUrl}
              onChange={(e) => setDrivingLicenseUrl(e.target.value)}
              placeholder="https://example.com/license.pdf"
              className="h-8 text-sm"
              required
            />
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
