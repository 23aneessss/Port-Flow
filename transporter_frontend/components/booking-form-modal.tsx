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
import type { Booking, TerminalOption } from "@/lib/data"
import type { Driver } from "@/lib/data"

interface BookingFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: Booking | null
  drivers: Driver[]
  terminals: TerminalOption[]
}

export function BookingFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  drivers,
  terminals,
}: BookingFormModalProps) {
  const [terminalId, setTerminalId] = useState("")
  const [driverUserId, setDriverUserId] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
    if (initialData) {
      setTerminalId(initialData.terminalId)
      setDriverUserId(initialData.driverUserId || "")
      setDate(initialData.date ? initialData.date.split("T")[0] : "")
      setStartTime(initialData.startTime ? new Date(initialData.startTime).toTimeString().slice(0, 5) : "")
      setEndTime(initialData.endTime ? new Date(initialData.endTime).toTimeString().slice(0, 5) : "")
    } else {
      setTerminalId("")
      setDriverUserId("")
      setDate("")
      setStartTime("")
      setEndTime("")
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dateStr = date
    onSubmit({
      terminalId,
      date: dateStr,
      startTime: `${dateStr}T${startTime}:00.000Z`,
      endTime: `${dateStr}T${endTime}:00.000Z`,
      driverUserId: driverUserId || undefined,
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
              : "Create a new terminal booking."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="terminal">Terminal</Label>
            <Select value={terminalId} onValueChange={setTerminalId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                {terminals.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver">Driver (optional)</Label>
            <Select value={driverUserId} onValueChange={setDriverUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No driver</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.userId} value={d.userId}>
                    {d.firstName} {d.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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
