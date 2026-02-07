"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Server,
  CheckCheck,
  Circle,
} from "lucide-react"
import { type Notification, notifications as initialNotifications } from "@/lib/mock-data"

function getTypeIcon(type: string) {
  switch (type) {
    case "TERMINAL_OVERLOAD":
      return AlertCircle
    case "SUSPICIOUS_ACTIVITY":
      return AlertTriangle
    case "EXTREME_DELAY":
      return Clock
    default:
      return Server
  }
}

function getPriorityClasses(priority: string) {
  switch (priority) {
    case "HIGH":
      return "border-destructive/20 bg-destructive/10 text-destructive"
    case "MEDIUM":
      return "border-warning/20 bg-warning/10 text-warning"
    default:
      return "border-muted-foreground/20 bg-muted text-muted-foreground"
  }
}

function getIconColor(type: string) {
  switch (type) {
    case "TERMINAL_OVERLOAD":
      return "text-destructive bg-destructive/10"
    case "SUSPICIOUS_ACTIVITY":
      return "text-warning bg-warning/10"
    case "EXTREME_DELAY":
      return "text-accent bg-accent/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications)
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  const filtered = notifs.filter((n) => {
    const matchesType = typeFilter === "ALL" || n.type === typeFilter
    const matchesPriority = priorityFilter === "ALL" || n.priority === priorityFilter
    return matchesType && matchesPriority
  })

  const unreadCount = notifs.filter((n) => !n.read).length

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markAsRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <>
      <AdminHeader title="Notifications" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          {/* Header actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 bg-card">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="TERMINAL_OVERLOAD">Terminal Overload</SelectItem>
                  <SelectItem value="SUSPICIOUS_ACTIVITY">Suspicious Activity</SelectItem>
                  <SelectItem value="EXTREME_DELAY">Extreme Delay</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36 bg-card">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="text-muted-foreground bg-transparent hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all duration-200"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read ({unreadCount})
              </Button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex flex-col gap-3">
            {filtered.map((n) => {
              const TypeIcon = getTypeIcon(n.type)
              const iconColor = getIconColor(n.type)
              return (
                <Card
                  key={n.id}
                  className={`cursor-pointer bg-card transition-all duration-200 hover:bg-secondary/30 hover:shadow-md animate-fade-in-up ${!n.read ? "border-l-4 border-l-accent" : ""}`}
                  style={{ animationDelay: `${filtered.indexOf(n) * 60}ms` }}
                  onClick={() => markAsRead(n.id)}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {!n.read && <Circle className="h-2 w-2 fill-accent text-accent" />}
                        <h3 className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </h3>
                        <Badge variant="outline" className={getPriorityClasses(n.priority)}>
                          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${n.priority === "HIGH" ? "bg-destructive animate-pulse" : n.priority === "MEDIUM" ? "bg-warning" : "bg-muted-foreground"}`} />
                          {n.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
