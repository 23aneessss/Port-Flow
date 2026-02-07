"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Bot,
  Users,
  CalendarCheck,
  LayoutDashboard,
  ChevronRight,
  UserPen,
  KeyRound,
  LogOut,
  MoreVertical,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfileModal } from "@/components/profile-modal"
import carrierLogo from "@/app/assets/carrier.webp"

const navItems = [
  { href: "/", label: "AI Assistant", icon: Bot },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { profile } = useAppStore()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
    <aside className="flex h-screen w-64 flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
      {/* Logo — big, centered, no bg/border */}
      <div className="flex flex-col items-center px-6 pt-7 pb-6">
        <Image
          src={carrierLogo}
          alt="Logo"
          width={160}
          height={160}
          className="h-[150px] w-auto object-contain"
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

      {/* Footer — Profile with dropdown */}
      <div className="mx-5 h-px bg-[hsl(var(--sidebar-border))]" />
      <div className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors duration-150 hover:bg-[hsl(var(--sidebar-accent))] focus:outline-none">
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))]/15 overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
                )}
              </div>
              {/* Name & email */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[hsl(var(--sidebar-primary-foreground))]">
                  {profile.name}
                </p>
                <p className="truncate text-[11px] text-[hsl(var(--sidebar-foreground))]/40">
                  {profile.email}
                </p>
              </div>
              <MoreVertical className="h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))]/40" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => setProfileOpen(true)}
            >
              <UserPen className="h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => setProfileOpen(true)}
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    {/* Profile edit modal */}
    <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
