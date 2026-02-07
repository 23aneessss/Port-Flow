"use client"

import { AppShell } from "@/components/app-shell"
import { AuthGuard } from "@/lib/auth"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="CARRIER">
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
