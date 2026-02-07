'use client'

import { Layout } from '@/components/layout'
import { QueryInterface } from '@/components/query-interface'

export default function QueryPage() {
  return (
    <Layout>
      <div className="space-y-8 p-8">
        <div>
          <h2 className="mb-2 text-xl font-extrabold text-foreground tracking-tight">
            Intelligent Query Assistant
          </h2>
          <p className="text-muted-foreground font-condensed">
            Ask natural language questions about your port operations, bookings, and terminals.
            The system will return relevant dashboards and data visualizations.
          </p>
        </div>

        <QueryInterface />

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Example Queries</h3>
          <ul className="space-y-2 text-sm text-muted-foreground font-condensed">
            <li>• <span className="text-foreground font-medium">"Show pending bookings"</span> — Display all pending transport orders</li>
            <li>• <span className="text-foreground font-medium">"Terminal status"</span> — View all terminals with saturation levels</li>
            <li>• <span className="text-foreground font-medium">"Port statistics"</span> — Get comprehensive overview and statistics</li>
            <li>• <span className="text-foreground font-medium">"Accepted bookings"</span> — List all confirmed bookings</li>
            <li>• <span className="text-foreground font-medium">"Terminal locations"</span> — View all terminal information</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
