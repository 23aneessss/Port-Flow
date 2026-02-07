"use client"

import { useAppStore } from "@/lib/store"
import type { Driver, Booking } from "@/lib/data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts"
import {
  Users,
  UserCheck,
  CalendarCheck,
  Hourglass,
  CircleCheckBig,
  CircleX,
  TrendingUp,
  Container,
} from "lucide-react"

const statusColors: Record<string, string> = {
  Pending: "#f59e0b",
  Confirmed: "#22c55e",
  Rejected: "#ef4444",
  Consumed: "#38BDF8",
  Cancelled: "#64748B",
}

export default function DashboardPage() {
  const { drivers, bookings } = useAppStore()

  const totalDrivers = drivers.length
  const activeDrivers = drivers.filter((d: Driver) => d.status === "Active").length
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b: Booking) => b.status === "Pending").length
  const confirmedBookings = bookings.filter((b: Booking) => b.status === "Confirmed").length
  const rejectedBookings = bookings.filter((b: Booking) => b.status === "Rejected").length

  const statusData = [
    { name: "Pending", value: bookings.filter((b: Booking) => b.status === "Pending").length, fill: statusColors.Pending },
    { name: "Confirmed", value: bookings.filter((b: Booking) => b.status === "Confirmed").length, fill: statusColors.Confirmed },
    { name: "Rejected", value: bookings.filter((b: Booking) => b.status === "Rejected").length, fill: statusColors.Rejected },
    { name: "Consumed", value: bookings.filter((b: Booking) => b.status === "Consumed").length, fill: statusColors.Consumed },
    { name: "Cancelled", value: bookings.filter((b: Booking) => b.status === "Cancelled").length, fill: statusColors.Cancelled },
  ].filter((d) => d.value > 0)

  const terminalMap: Record<string, number> = {}
  for (const b of bookings) {
    const short = b.terminalName.split(" - ")[0]
    terminalMap[short] = (terminalMap[short] || 0) + 1
  }
  const terminalData = Object.entries(terminalMap).map(([name, count]) => ({
    name,
    bookings: count,
  }))

  const stats = [
    {
      label: "Total Drivers",
      value: totalDrivers,
      icon: Users,
      color: "text-sky-500",
      bg: "bg-sky-50",
      ring: "ring-sky-100",
    },
    {
      label: "Active Drivers",
      value: activeDrivers,
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: CalendarCheck,
      color: "text-sky-400",
      bg: "bg-sky-50",
      ring: "ring-sky-100",
    },
    {
      label: "Pending",
      value: pendingBookings,
      icon: Hourglass,
      color: "text-amber-500",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
    },
    {
      label: "Confirmed",
      value: confirmedBookings,
      icon: CircleCheckBig,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
    {
      label: "Rejected",
      value: rejectedBookings,
      icon: CircleX,
      color: "text-red-400",
      bg: "bg-red-50",
      ring: "ring-red-100",
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your logistics operations
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className="animate-slide-up border-transparent bg-card ring-1 ring-border/50 transition-all duration-300 hover:shadow-md hover:ring-[hsl(var(--primary))]/20 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${stat.bg} ring-1 ${stat.ring}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="animate-count-up text-2xl font-bold text-card-foreground" style={{ animationDelay: `${i * 80 + 200}ms` }}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings by Status - Pie Chart */}
        <Card className="animate-slide-up bg-card ring-1 ring-border/50 border-transparent delay-400">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Container className="h-4 w-4 text-[hsl(var(--primary))]" />
              <CardTitle className="text-card-foreground">Bookings by Status</CardTitle>
            </div>
            <CardDescription>Distribution of booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Pending: { label: "Pending", color: statusColors.Pending },
                Confirmed: { label: "Confirmed", color: statusColors.Confirmed },
                Rejected: { label: "Rejected", color: statusColors.Rejected },
                Consumed: { label: "Consumed", color: statusColors.Consumed },
                Cancelled: { label: "Cancelled", color: statusColors.Cancelled },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Operations by Terminal - Bar Chart */}
        <Card className="animate-slide-up bg-card ring-1 ring-border/50 border-transparent overflow-hidden delay-500">
          <CardHeader>
            <CardTitle className="text-card-foreground">Operations by Terminal</CardTitle>
            <CardDescription>Number of bookings per terminal</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ChartContainer
              config={{
                bookings: {
                  label: "Bookings",
                  color: "#38BDF8",
                },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={terminalData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickMargin={8}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    allowDecimals={false}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="bookings"
                    fill="#38BDF8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
