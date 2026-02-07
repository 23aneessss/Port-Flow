import { AdminHeader } from "@/components/admin-header"
import { TransporterTable } from "@/components/transporters/transporter-table"

export default function TransportersPage() {
  return (
    <>
      <AdminHeader title="Transporter Validation" />
      <main className="flex-1 overflow-auto p-6">
        <TransporterTable />
      </main>
    </>
  )
}
