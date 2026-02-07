"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AuthGuard } from "@/lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
