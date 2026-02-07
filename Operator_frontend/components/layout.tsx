'use client'

import React from "react"
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Search,
  CalendarCheck,
  AlertCircle,
  ChevronRight,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import operatorLogo from '@/assets/operator.webp'

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/query', label: 'Query', icon: Search },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/alerts', label: 'Alerts', icon: AlertCircle },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — dark navy style */}
      <aside className="flex h-screen w-64 flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
        {/* Logo */}
        <div className="flex flex-col items-center px-6 pt-7 pb-6">
          <Image
            src={operatorLogo}
            alt="Operator Logo"
            width={180}
            height={180}
            className="h-[180px] w-auto object-contain animate-scale-in"
            priority
          />
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-[hsl(var(--sidebar-border))]" />

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-5 pb-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/30">
            Menu
          </p>
          <ul className="flex flex-col gap-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href} className="animate-slide-in-left" style={{ animationDelay: `${index * 60}ms` }}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[hsl(var(--sidebar-primary))]/15 text-[hsl(var(--sidebar-primary))] shadow-sm shadow-[hsl(var(--sidebar-primary))]/10"
                        : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                    )}
                  >
                    <item.icon className={cn(
                      "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
                      isActive && "text-[hsl(var(--sidebar-primary))]"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 animate-fade-in text-[hsl(var(--sidebar-primary))]/60" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mx-5 h-px bg-[hsl(var(--sidebar-border))]" />
        <div className="px-3 py-3">
          <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))]/15">
              <User className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[hsl(var(--sidebar-foreground))]">
                Operator
              </p>
              <p className="truncate text-[11px] text-[hsl(var(--sidebar-foreground))]/40">
                admin@portops.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-white px-8 py-5">
          <h2 className="animate-slide-in-right text-xl font-extrabold text-foreground tracking-tight">Port Operations</h2>
          <p className="animate-slide-in-right mt-0.5 text-sm font-condensed text-muted-foreground" style={{ animationDelay: '80ms' }}>
            Real-time terminal management and booking system
          </p>
        </div>
        <div>{children}</div>
      </main>
    </div>
  )
}
