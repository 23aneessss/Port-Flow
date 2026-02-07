"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import adminLogo from "@/app/assets/admin.webp"
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  AlertTriangle,
  Bell,
  Bot,
  ChevronRight,
  UserPen,
  KeyRound,
  LogOut,
  MoreVertical,
  User,
  X,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Operators", href: "/dashboard/operators", icon: Users },
  { title: "Terminals", href: "/dashboard/terminals", icon: Building2 },
  { title: "Transporters", href: "/dashboard/transporters", icon: Truck },
  { title: "Anomalies", href: "/dashboard/anomalies", icon: AlertTriangle },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
]

const toolItems = [
  { title: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
]

interface AdminProfile {
  name: string
  email: string
  avatarUrl: string
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Admin User",
    email: "admin@portflow.com",
    avatarUrl: "",
  })
  const [formData, setFormData] = useState({ ...profile })
  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirm: "",
  })

  function handleProfileSave() {
    setProfile({ ...formData })
    setProfileOpen(false)
  }

  function handlePasswordSave() {
    setPasswordData({ current: "", newPass: "", confirm: "" })
    setPasswordOpen(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Sidebar className="border-r-0">
        {/* Logo — centered, large */}
        <SidebarHeader className="px-6 pt-4 pb-3">
          <div className="flex flex-col items-center">
            <Image
              src={adminLogo}
              alt="Port Flow Admin"
              width={180}
              height={180}
              className="h-[140px] w-auto object-contain drop-shadow-lg"
              priority
            />
          </div>
        </SidebarHeader>

        {/* Divider */}
        <div className="mx-5 h-px bg-sidebar-border" />

        {/* Navigation */}
        <div className="flex-1 px-3 pt-3 pb-2">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Navigation
          </p>
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <li
                  key={item.href}
                  className="animate-slide-in-left"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm shadow-sidebar-primary/10"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
                        isActive && "text-sidebar-primary"
                      )}
                    />
                    <span className="flex-1">{item.title}</span>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 animate-fade-in text-sidebar-primary/60" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Tools */}
          <div className="mt-4">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
              Tools
            </p>
            <ul className="flex flex-col gap-0.5">
              {toolItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <li
                    key={item.href}
                    className="animate-slide-in-left"
                    style={{ animationDelay: `${(navItems.length + index) * 60}ms` }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm shadow-sidebar-primary/10"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
                          isActive && "text-sidebar-primary"
                        )}
                      />
                      <span className="flex-1">{item.title}</span>
                      {isActive && (
                        <ChevronRight className="h-3.5 w-3.5 animate-fade-in text-sidebar-primary/60" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Footer — Profile with dropdown */}
        <div className="mx-5 h-px bg-sidebar-border" />
        <SidebarFooter className="px-3 py-3">
          {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors duration-150 hover:bg-sidebar-accent focus:outline-none">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-sidebar-primary" />
                  )}
                </div>
                {/* Name & email */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {profile.name}
                  </p>
                  <p className="truncate text-[11px] text-sidebar-foreground/40">
                    {profile.email}
                  </p>
                </div>
                <MoreVertical className="h-4 w-4 shrink-0 text-sidebar-foreground/40" />
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
                onClick={() => {
                  setFormData({ ...profile })
                  setProfileOpen(true)
                }}
              >
                <UserPen className="h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => {
                  setPasswordData({ current: "", newPass: "", confirm: "" })
                  setPasswordOpen(true)
                }}
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
          ) : (
            <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15">
                <User className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{profile.name}</p>
                <p className="truncate text-[11px] text-sidebar-foreground/40">{profile.email}</p>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Profile Edit Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your admin profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary"
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary"
                placeholder="your@email.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Avatar URL</Label>
              <Input
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="bg-secondary"
                placeholder="https://... (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleProfileSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Current Password</Label>
              <Input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="bg-secondary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">New Password</Label>
              <Input
                type="password"
                value={passwordData.newPass}
                onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                className="bg-secondary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="bg-secondary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handlePasswordSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <KeyRound className="mr-2 h-4 w-4" />
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
