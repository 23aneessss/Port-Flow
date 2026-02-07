import { AdminHeader } from "@/components/admin-header"
import { OperatorTable } from "@/components/operators/operator-table"

export default function OperatorsPage() {
  return (
    <>
      <AdminHeader title="Operator Management" />
      <main className="flex-1 overflow-auto p-6">
        <OperatorTable />
      </main>
    </>
  )
}
