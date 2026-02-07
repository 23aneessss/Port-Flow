"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { operatorDistributionData } from "@/lib/mock-data"

export function OperatorDistributionChart() {
  return (
    <Card className="border-border bg-card hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Operators per Terminal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={operatorDistributionData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(214, 32%, 91%)"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
              />
              <YAxis
                type="category"
                dataKey="terminal"
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                width={70}
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
              <Bar
                dataKey="operators"
                fill="hsl(172, 66%, 50%)"
                radius={[0, 6, 6, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
