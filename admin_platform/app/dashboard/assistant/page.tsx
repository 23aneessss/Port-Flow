"use client"

import { useState, useRef, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Send, Bot, User, Building2, Users, Truck } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  terminals,
  operators,
  transporters,
} from "@/lib/mock-data"

type MessageContent =
  | { type: "text"; text: string }
  | { type: "kpi"; data: { label: string; value: string | number; icon: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "chart"; data: { name: string; value: number }[] }

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: MessageContent[]
}

function processQuery(query: string): MessageContent[] {
  const q = query.toLowerCase()

  if (q.includes("terminal") && (q.includes("capacity") || q.includes("status"))) {
    const chartData = terminals.map((t) => ({
      name: t.name.replace("Terminal ", ""),
      value: Math.round(((t.max_slots - t.available_slots) / t.max_slots) * 100),
    }))

    return [
      { type: "text", text: "Here is the current terminal capacity status across all terminals:" },
      {
        type: "kpi",
        data: [
          { label: "Total Terminals", value: terminals.length, icon: "building" },
          { label: "Active", value: terminals.filter((t) => t.status === "ACTIVE").length, icon: "check" },
          { label: "Suspended", value: terminals.filter((t) => t.status === "SUSPENDED").length, icon: "x" },
        ],
      },
      { type: "chart", data: chartData },
    ]
  }

  if (q.includes("suspended") && q.includes("transporter")) {
    const suspended = transporters.filter((t) => t.status === "SUSPENDED")
    return [
      { type: "text", text: `There ${suspended.length === 1 ? "is" : "are"} ${suspended.length} suspended transporter${suspended.length !== 1 ? "s" : ""}:` },
      {
        type: "table",
        headers: ["Name", "Phone", "Status"],
        rows: suspended.map((t) => [t.name, t.phone, t.status]),
      },
    ]
  }

  if (q.includes("operator") && q.includes("terminal")) {
    const terminalMatch = terminals.find((t) =>
      q.includes(t.name.toLowerCase())
    )
    if (terminalMatch) {
      const ops = terminalMatch.operators.map((id) => operators.find((o) => o.id === id)).filter(Boolean)
      return [
        { type: "text", text: `Operators assigned to ${terminalMatch.name}:` },
        {
          type: "table",
          headers: ["Name", "Email", "Status"],
          rows: ops.map((o) => [`${o!.first_name} ${o!.last_name}`, o!.email, o!.status]),
        },
      ]
    }
    // Show all terminal operator assignments
    return [
      { type: "text", text: "Here are all operator assignments per terminal:" },
      {
        type: "table",
        headers: ["Terminal", "Operators Count", "Operators"],
        rows: terminals.map((t) => {
          const ops = t.operators.map((id) => {
            const op = operators.find((o) => o.id === id)
            return op ? `${op.first_name} ${op.last_name}` : ""
          }).filter(Boolean)
          return [t.name, String(ops.length), ops.join(", ") || "None"]
        }),
      },
    ]
  }

  if (q.includes("operator")) {
    const activeOps = operators.filter((o) => o.status === "ACTIVE")
    const suspendedOps = operators.filter((o) => o.status === "SUSPENDED")
    return [
      { type: "text", text: "Here is the current operator overview:" },
      {
        type: "kpi",
        data: [
          { label: "Total Operators", value: operators.length, icon: "users" },
          { label: "Active", value: activeOps.length, icon: "check" },
          { label: "Suspended", value: suspendedOps.length, icon: "x" },
        ],
      },
      {
        type: "table",
        headers: ["Name", "Email", "Status", "Terminal"],
        rows: operators.map((o) => {
          const t = terminals.find((t) => t.id === o.terminal_id)
          return [`${o.first_name} ${o.last_name}`, o.email, o.status, t?.name || "Unassigned"]
        }),
      },
    ]
  }

  if (q.includes("transporter")) {
    return [
      { type: "text", text: "Here is the transporter overview:" },
      {
        type: "kpi",
        data: [
          { label: "Total", value: transporters.length, icon: "truck" },
          { label: "Active", value: transporters.filter((t) => t.status === "ACTIVE").length, icon: "check" },
          { label: "Pending", value: transporters.filter((t) => t.status === "PENDING").length, icon: "clock" },
          { label: "Suspended", value: transporters.filter((t) => t.status === "SUSPENDED").length, icon: "x" },
        ],
      },
      {
        type: "table",
        headers: ["Name", "Phone", "Drivers", "Status"],
        rows: transporters.map((t) => [t.name, t.phone, String(t.drivers.length), t.status]),
      },
    ]
  }

  return [
    {
      type: "text",
      text: "I can help you with the following queries:\n- \"Show terminal capacity status\"\n- \"List suspended transporters\"\n- \"Show operators of Terminal Nord\"\n- \"Show all operators\"\n- \"Show transporter overview\"\n\nTry asking one of these!",
    },
  ]
}

function KpiIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "building": return <Building2 className="h-4 w-4" />
    case "users": return <Users className="h-4 w-4" />
    case "truck": return <Truck className="h-4 w-4" />
    default: return <Building2 className="h-4 w-4" />
  }
}

function MessageRenderer({ content }: { content: MessageContent[] }) {
  return (
    <div className="flex flex-col gap-3">
      {content.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <p key={i} className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {block.text}
              </p>
            )
          case "kpi":
            return (
              <div key={i} className="flex flex-wrap gap-3">
                {block.data.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <KpiIcon icon={kpi.icon} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                      <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          case "table":
            return (
              <div key={i} className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      {block.headers.map((h) => (
                        <TableHead key={h} className="text-xs font-semibold text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.rows.map((row, ri) => (
                      <TableRow key={ri} className="hover:bg-secondary/20">
                        {row.map((cell, ci) => (
                          <TableCell key={ci} className="text-sm text-foreground">{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          case "chart":
            return (
              <div key={i} className="h-48 w-full rounded-lg border border-border bg-secondary/30 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={block.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 33%, 17%)",
                        borderRadius: "8px",
                        color: "hsl(213, 31%, 91%)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(199, 89%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

const suggestedQueries = [
  "Show terminal capacity status",
  "List suspended transporters",
  "Show all operators",
  "Show transporter overview",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Hello! I'm your Admin Copilot. I can help you explore data about terminals, operators, and transporters. Try asking me a question or click one of the suggestions below.",
        },
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function handleSend(query?: string) {
    const text = query || input.trim()
    if (!text) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: [{ type: "text", text }],
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = processQuery(text)
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 800)
  }

  return (
    <>
      <AdminHeader title="AI Assistant" />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col">
          {/* Chat area */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === "assistant"
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "assistant"
                        ? "bg-card border border-border"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <MessageRenderer content={msg.content} />
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="mx-auto flex max-w-3xl flex-wrap gap-2 px-6 pb-3">
              {suggestedQueries.map((sq) => (
                <Button
                  key={sq}
                  variant="outline"
                  size="sm"
                  className="text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                  onClick={() => handleSend(sq)}
                >
                  {sq}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border bg-card p-4">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <Input
                placeholder="Ask about terminals, operators, transporters..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend()
                }}
                className="bg-secondary"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
