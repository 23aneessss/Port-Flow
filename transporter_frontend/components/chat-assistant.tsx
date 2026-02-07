"use client"

import { useState, useRef, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { terminals } from "@/lib/data"
import type { Driver, Booking, DriverStatus, OperationType } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  action?: string
}

function parseCommand(text: string, drivers: Driver[], bookings: Booking[]) {
  const lower = text.toLowerCase().trim()

  // List drivers
  if (
    lower.includes("list driver") ||
    lower.includes("show driver") ||
    lower.includes("all driver") ||
    lower.includes("les chauffeurs") ||
    lower.includes("tableau de chauffeur")
  ) {
    return { type: "list_drivers" as const }
  }

  // List bookings
  if (
    lower.includes("list booking") ||
    lower.includes("show booking") ||
    lower.includes("all booking") ||
    lower.includes("les reservations") ||
    lower.includes("les réservations")
  ) {
    return { type: "list_bookings" as const }
  }

  // Delete booking
  if (
    (lower.includes("delete booking") || lower.includes("remove booking") || lower.includes("cancel booking")) &&
    lower.match(/b\d+|#\d+/)
  ) {
    const match = lower.match(/b(\d+)|#(\d+)/)
    if (match) {
      const id = `b${match[1] || match[2]}`
      return { type: "delete_booking" as const, bookingId: id }
    }
  }

  // Delete driver
  if (
    lower.includes("delete driver") ||
    lower.includes("remove driver") ||
    lower.includes("supprimer")
  ) {
    const nameMatch = drivers.find((d) =>
      lower.includes(d.fullName.toLowerCase())
    )
    if (nameMatch) {
      return { type: "delete_driver" as const, driverId: nameMatch.id, driverName: nameMatch.fullName }
    }
  }

  // Create driver
  if (
    lower.includes("add driver") ||
    lower.includes("create driver") ||
    lower.includes("new driver") ||
    lower.includes("ajouter chauffeur")
  ) {
    // Try to parse name, phone, email from the text
    const nameMatch = text.match(
      /(?:name[d:]?\s*|driver\s+)([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+)*)/
    )
    const phoneMatch = text.match(/(?:phone[:]?\s*)([\+\d\s\-]+)/)
    const emailMatch = text.match(
      /(?:email[:]?\s*)([\w.+-]+@[\w.-]+\.\w+)/
    )

    return {
      type: "create_driver" as const,
      name: nameMatch ? nameMatch[1] : undefined,
      phone: phoneMatch ? phoneMatch[1].trim() : undefined,
      email: emailMatch ? emailMatch[1] : undefined,
    }
  }

  // Create booking
  if (
    lower.includes("add booking") ||
    lower.includes("create booking") ||
    lower.includes("new booking") ||
    lower.includes("book a") ||
    lower.includes("réserver")
  ) {
    const terminalMatch = terminals.find((t) =>
      lower.includes(t.toLowerCase())
    ) || terminals.find((t) => lower.includes(t.split(" - ")[0].toLowerCase()))

    const driverMatch = drivers.find((d) =>
      lower.includes(d.fullName.toLowerCase())
    )

    const opType: OperationType = lower.includes("drop") ? "Drop-off" : "Pick-up"

    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/)
    const timeMatch = text.match(/(\d{2}:\d{2})/)

    return {
      type: "create_booking" as const,
      terminal: terminalMatch,
      driverId: driverMatch?.id,
      driverName: driverMatch?.fullName,
      opType,
      date: dateMatch ? dateMatch[1] : undefined,
      time: timeMatch ? timeMatch[1] : undefined,
    }
  }

  // Stats / dashboard
  if (
    lower.includes("stat") ||
    lower.includes("overview") ||
    lower.includes("summary") ||
    lower.includes("dashboard") ||
    lower.includes("how many")
  ) {
    return { type: "stats" as const }
  }

  // Help
  if (lower.includes("help") || lower.includes("what can you do") || lower.includes("aide")) {
    return { type: "help" as const }
  }

  return { type: "unknown" as const }
}

export function ChatAssistant() {
  const {
    drivers,
    bookings,
    addDriver,
    deleteDriver,
    addBooking,
    deleteBooking,
  } = useAppStore()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        'Welcome to PortFlow AI Assistant! I can help you manage drivers and bookings. Try saying "list drivers", "add a new driver", "create a booking", or "show stats". Type "help" for all available commands.',
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const processMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsProcessing(true)

    // Simulate a small delay
    await new Promise((r) => setTimeout(r, 600))

    const cmd = parseCommand(text, drivers, bookings)
    let response = ""
    let action = ""

    switch (cmd.type) {
      case "list_drivers": {
        if (drivers.length === 0) {
          response = "No drivers found in the system."
        } else {
          const list = drivers
            .map(
              (d, i) =>
                `${i + 1}. **${d.fullName}** - ${d.phone} (${d.status})`
            )
            .join("\n")
          response = `Here are all ${drivers.length} drivers:\n\n${list}`
        }
        action = "Listed drivers"
        break
      }

      case "list_bookings": {
        if (bookings.length === 0) {
          response = "No bookings found in the system."
        } else {
          const list = bookings
            .map((b, i) => {
              const driverName =
                drivers.find((d) => d.id === b.driverId)?.fullName ?? "Unknown"
              return `${i + 1}. **${b.terminalName}** - ${driverName} - ${b.operationType} - ${b.date} ${b.time} [${b.status}]`
            })
            .join("\n")
          response = `Here are all ${bookings.length} bookings:\n\n${list}`
        }
        action = "Listed bookings"
        break
      }

      case "create_driver": {
        if (cmd.name) {
          addDriver({
            fullName: cmd.name,
            phone: cmd.phone || "+212 600 000 000",
            status: "Active" as DriverStatus,
            truckNumber: "",
            plateNumber: "",
            licenseNumber: "",
            licenseVerified: false,
          })
          response = `Driver **${cmd.name}** has been successfully added to the system with status Active.${!cmd.phone ? " (Default phone used - update in Drivers page)" : ""}`
          action = "Created driver"
        } else {
          response =
            'I can create a driver for you! Please include the name, like: "Add driver named Ahmed Zaki phone: +212 661 111 222"'
        }
        break
      }

      case "create_booking": {
        if (cmd.terminal && cmd.driverId && cmd.date && cmd.time) {
          addBooking({
            terminalName: cmd.terminal,
            driverId: cmd.driverId,
            operationType: cmd.opType!,
            date: cmd.date,
            time: cmd.time,
            status: "Pending",
          })
          response = `Booking created for **${cmd.driverName}** at **${cmd.terminal}** (${cmd.opType}) on ${cmd.date} at ${cmd.time}. Status: Pending.`
          action = "Created booking"
        } else {
          const missing = []
          if (!cmd.terminal) missing.push("terminal name")
          if (!cmd.driverId) missing.push("driver name")
          if (!cmd.date) missing.push("date (YYYY-MM-DD)")
          if (!cmd.time) missing.push("time (HH:MM)")
          response = `I can create a booking! Please provide: ${missing.join(", ")}.\n\nExample: "Create booking at Terminal A - North Gate for Ahmed Benali pick-up 2026-02-10 09:00"`
        }
        break
      }

      case "delete_driver": {
        deleteDriver(cmd.driverId!)
        response = `Driver **${cmd.driverName}** has been deleted from the system.`
        action = "Deleted driver"
        break
      }

      case "delete_booking": {
        const booking = bookings.find((b) => b.id === cmd.bookingId)
        if (booking) {
          deleteBooking(cmd.bookingId!)
          response = `Booking #${cmd.bookingId} at ${booking.terminalName} has been deleted.`
          action = "Deleted booking"
        } else {
          response = `Booking #${cmd.bookingId} was not found.`
        }
        break
      }

      case "stats": {
        const active = drivers.filter((d) => d.status === "Active").length
        const pending = bookings.filter((b) => b.status === "Pending").length
        const confirmed = bookings.filter(
          (b) => b.status === "Confirmed"
        ).length
        const rejected = bookings.filter(
          (b) => b.status === "Rejected"
        ).length
        response = `Here is a quick overview:\n\n- **${drivers.length}** total drivers (${active} active)\n- **${bookings.length}** total bookings\n  - ${pending} Pending\n  - ${confirmed} Confirmed\n  - ${rejected} Rejected\n\nVisit the Dashboard page for charts and detailed analytics.`
        action = "Showed stats"
        break
      }

      case "help": {
        response = `Here are the commands I understand:\n\n- **"List drivers"** - Show all drivers\n- **"List bookings"** - Show all bookings\n- **"Add driver named [Name] phone: [Phone] email: [Email]"** - Create a new driver\n- **"Create booking at [Terminal] for [Driver] pick-up/drop-off [Date] [Time]"** - Create a booking\n- **"Delete driver [Name]"** - Remove a driver\n- **"Delete booking #[ID]"** - Remove a booking\n- **"Stats"** / **"Overview"** - Show system statistics\n- **"Help"** - Show this message`
        break
      }

      default: {
        response =
          "I didn't quite understand that. Try commands like \"list drivers\", \"add driver named John Doe\", \"create booking at Terminal A for Ahmed Benali pick-up 2026-02-10 09:00\", or \"show stats\". Type \"help\" for all commands."
        break
      }
    }

    const assistantMsg: ChatMessage = {
      id: `a${Date.now()}`,
      role: "assistant",
      content: response,
      action,
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsProcessing(false)
  }

  const handleSend = () => {
    if (!input.trim() || isProcessing) return
    processMessage(input.trim())
    setInput("")
  }

  const renderContent = (content: string) => {
    // Simple markdown-like bold
    const parts = content.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      // Handle newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 p-2">
            <Bot className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-card-foreground">
              AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage drivers and bookings with natural language
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                  <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-card border text-card-foreground"
                }`}
              >
                {renderContent(msg.content)}
                {msg.action && (
                  <div className="mt-2">
                    <Badge className="bg-sky-50 text-sky-600 border border-sky-200/60 text-[10px] hover:bg-sky-50">
                      ✓ {msg.action}
                    </Badge>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="mx-auto flex max-w-3xl gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a command... e.g. "List drivers" or "Add booking"'
            className="flex-1"
            disabled={isProcessing}
          />
          <Button type="submit" disabled={isProcessing || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
