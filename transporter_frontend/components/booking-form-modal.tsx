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
import type { Booking, OperationType } from "@/lib/data"
import { terminals } from "@/lib/data"
import type { Driver } from "@/lib/data"

interface BookingFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Booking, "id">) => void
  initialData?: Booking | null
  drivers: Driver[]
}

export function BookingFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  drivers,
}: BookingFormModalProps) {
  const [terminalName, setTerminalName] = useState("")
  const [driverId, setDriverId] = useState("")
  const [operationType, setOperationType] = useState<OperationType>("Pick-up")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  useEffect(() => {
    if (initialData) {
      setTerminalName(initialData.terminalName)
      setDriverId(initialData.driverId)
      setOperationType(initialData.operationType)
      setDate(initialData.date)
      setTime(initialData.time)
    } else {
      setTerminalName("")
      setDriverId("")
      setOperationType("Pick-up")
      setDate("")
      setTime("")
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      terminalName,
      driverId,
      operationType,
      date,
      time,
      status: initialData?.status || "Pending",
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Booking" : "Add New Booking"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the booking details below."
              : "Create a new terminal booking for a driver."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="terminal">Terminal Name</Label>
            <Select value={terminalName} onValueChange={setTerminalName} required>
              <SelectTrigger>
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                {terminals.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver">Driver</Label>
            <Select value={driverId} onValueChange={setDriverId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="opType">Operation Type</Label>
            <Select
              value={operationType}
              onValueChange={(v) => setOperationType(v as OperationType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pick-up">Pick-up</SelectItem>
                <SelectItem value="Drop-off">Drop-off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Add Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
