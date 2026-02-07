import { AdminHeader } from "@/components/admin-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { TerminalUtilizationChart } from "@/components/dashboard/terminal-utilization-chart"
import { CapacityChart } from "@/components/dashboard/capacity-chart"
import { OperatorDistributionChart } from "@/components/dashboard/operator-distribution-chart"
import { RecentAnomalies } from "@/components/dashboard/recent-anomalies"

export default function DashboardPage() {
  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <KpiCards />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TerminalUtilizationChart />
            <CapacityChart />
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <OperatorDistributionChart />
            <RecentAnomalies />
          </div>
        </div>
      </main>
    </>
  )
}
