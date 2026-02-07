"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Search,
  Sparkles,
  X,
  Clock,
  Circle,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  Server,
  Building2,
  Users,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  notifications as initialNotifications,
  operators,
  terminals,
  transporters,
  anomalies,
  type Notification,
} from "@/lib/mock-data"

interface SearchResult {
  type: "operator" | "terminal" | "transporter" | "anomaly"
  label: string
  sub: string
  href: string
}

function getTypeIcon(type: string) {
  switch (type) {
    case "TERMINAL_OVERLOAD": return AlertCircle
    case "SUSPICIOUS_ACTIVITY": return AlertTriangle
    case "EXTREME_DELAY": return Clock
    default: return Server
  }
}

function getPriorityDot(priority: string) {
  switch (priority) {
    case "HIGH": return "bg-destructive"
    case "MEDIUM": return "bg-warning"
    default: return "bg-muted-foreground"
  }
}

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AdminHeader({ title }: { title: string }) {
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifs.filter((n) => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Search across all data
  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.toLowerCase().trim()
    if (q.length < 2) return []
    const results: SearchResult[] = []

    operators.forEach((op) => {
      const full = `${op.first_name} ${op.last_name} ${op.email}`.toLowerCase()
      if (full.includes(q)) {
        results.push({
          type: "operator",
          label: `${op.first_name} ${op.last_name}`,
          sub: op.email,
          href: "/dashboard/operators",
        })
      }
    })

    terminals.forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        results.push({
          type: "terminal",
          label: t.name,
          sub: `${t.status} — ${t.max_slots - t.available_slots}/${t.max_slots} slots used`,
          href: "/dashboard/terminals",
        })
      }
    })

    transporters.forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        results.push({
          type: "transporter",
          label: t.name,
          sub: `${t.status} — ${t.drivers.length} drivers`,
          href: "/dashboard/transporters",
        })
      }
    })

    anomalies.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.terminal_name.toLowerCase().includes(q)) {
        results.push({
          type: "anomaly",
          label: a.title,
          sub: `${a.severity} — ${a.terminal_name}`,
          href: "/dashboard/anomalies",
        })
      }
    })

    return results.slice(0, 8)
  }, [searchQuery])

  function markAsRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function getResultIcon(type: string) {
    switch (type) {
      case "operator": return Users
      case "terminal": return Building2
      case "transporter": return Truck
      case "anomaly": return AlertTriangle
      default: return Search
    }
  }

  return (
    <header className="relative z-50 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur-sm animate-fade-in">
      <SidebarTrigger className="text-muted-foreground hover:text-accent transition-colors" />

      {/* Page title with subtle accent */}
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        <Sparkles className="h-4 w-4 text-accent/40" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Search with live results */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
          <Input
            placeholder="Search operators, terminals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="h-9 w-72 rounded-full bg-secondary/70 pl-9 pr-8 text-sm border-transparent focus:border-accent/30 focus:bg-secondary transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search results dropdown */}
          {searchFocused && searchQuery.length >= 2 && (
            <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card shadow-xl shadow-black/10 z-50 overflow-hidden animate-scale-in">
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto py-1">
                  {searchResults.map((r, i) => {
                    const Icon = getResultIcon(r.type)
                    return (
                      <button
                        key={`${r.type}-${i}`}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/60 transition-colors"
                        onClick={() => {
                          router.push(r.href)
                          setSearchQuery("")
                          setSearchFocused(false)
                        }}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <Icon className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{r.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{r.type}</Badge>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Search className="h-5 w-5" />
                  <p className="text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification bell with dropdown */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200 rounded-full"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-accent p-0 text-[10px] font-bold text-white animate-pulse-glow rounded-full border-2 border-card">
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card shadow-xl shadow-black/10 z-50 overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]" variant="outline">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifs.map((n) => {
                  const TypeIcon = getTypeIcon(n.type)
                  return (
                    <button
                      key={n.id}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${!n.read ? "bg-accent/[0.03]" : ""}`}
                      onClick={() => {
                        markAsRead(n.id)
                        router.push("/dashboard/notifications")
                        setNotifOpen(false)
                      }}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        n.type === "TERMINAL_OVERLOAD" ? "bg-destructive/10 text-destructive" :
                        n.type === "SUSPICIOUS_ACTIVITY" ? "bg-warning/10 text-warning" :
                        n.type === "EXTREME_DELAY" ? "bg-accent/10 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.read && <Circle className="h-2 w-2 shrink-0 fill-accent text-accent" />}
                          <p className={`truncate text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <Clock className="h-3 w-3" />
                            {timeAgo(n.timestamp)}
                          </span>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${getPriorityDot(n.priority)}`} />
                          <span className="text-[11px] text-muted-foreground/60">{n.priority}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2.5">
                <button
                  onClick={() => {
                    router.push("/dashboard/notifications")
                    setNotifOpen(false)
                  }}
                  className="w-full text-center text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
