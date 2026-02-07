"use client"

import { AdminHeader } from "@/components/admin-header"
import { TerminalList } from "@/components/terminals/terminal-list"
import { TerminalMap } from "@/components/terminals/terminal-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TerminalsPage() {
  return (
    <>
      <AdminHeader title="Terminal Management" />
      <main className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="list" className="flex flex-col gap-4">
          <TabsList className="w-fit bg-secondary">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <TerminalList />
          </TabsContent>
          <TabsContent value="map">
            <TerminalMap />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
