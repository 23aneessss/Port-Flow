"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { terminalUtilizationData } from "@/lib/mock-data"

const terminalColors: Record<string, string> = {
  nord: "hsl(199, 89%, 60%)",
  sud: "hsl(172, 66%, 50%)",
  ouest: "hsl(38, 92%, 50%)",
  central: "hsl(215, 16%, 47%)",
  maritime: "hsl(0, 84%, 60%)",
}

export function TerminalUtilizationChart() {
  return (
    <Card className="border-border bg-card hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Terminal Utilization (Real-Time)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={terminalUtilizationData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(214, 32%, 91%)"
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
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
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
              />
              {Object.entries(terminalColors).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  name={`Terminal ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
