"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listTerminals, type Terminal } from "@/lib/api"
import { Loader2 } from "lucide-react"

function getBarColor(usage: number, status: string) {
  if (status === "SUSPENDED") return "hsl(215, 16%, 47%)"
  if (usage >= 80) return "hsl(0, 84%, 60%)"
  if (usage >= 60) return "hsl(38, 92%, 50%)"
  return "hsl(199, 89%, 60%)"
}

export function CapacityChart() {
  const [data, setData] = useState<{ name: string; usage: number; status: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listTerminals()
      .then((terminals) => {
        setData(
          terminals.map((t) => ({
            name: t.name.replace("Terminal ", ""),
            usage: t.maxSlots > 0 ? Math.round(((t.maxSlots - t.availableSlots) / t.maxSlots) * 100) : 0,
            status: t.status,
          }))
        )
      })
      .catch((err) => console.error("Failed to load terminals:", err))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card className="border-border bg-card hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Terminal Capacity Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 30 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(214, 32%, 91%)"
              />
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 11%)",
                  borderColor: "hsl(217, 33%, 17%)",
                  borderRadius: "8px",
                  color: "hsl(213, 31%, 91%)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="usage" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getBarColor(entry.usage, entry.status)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
