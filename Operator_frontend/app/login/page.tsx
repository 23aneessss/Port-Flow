"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Ship, Anchor } from "lucide-react"

export default function OperatorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const { login } = await import("@/lib/api")
      const res = await login(email, password)
      if (res.role !== "OPERATOR") {
        setError("Access restricted to operators only.")
        setLoading(false)
        return
      }
      localStorage.setItem("pf_token", res.token)
      localStorage.setItem("pf_role", res.role)
      localStorage.setItem("pf_userId", res.userId)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Invalid credentials.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0F172A] text-white p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#38BDF8]/10 blur-3xl" />
        <div className="absolute bottom-16 left-8 h-48 w-48 rounded-full bg-[#38BDF8]/8 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#38BDF8]">
              <Anchor className="h-6 w-6 text-[#0F172A]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-montserrat)]">
              PortFlow
            </span>
          </div>
          <p className="text-sm text-slate-400 font-[family-name:var(--font-roboto-condensed)]">
            Terminal Operations Platform
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight font-[family-name:var(--font-montserrat)]">
            Operator<br />Dashboard
          </h1>
          <p className="max-w-md text-slate-300 text-base font-[family-name:var(--font-roboto-condensed)]">
            Manage bookings, monitor terminal load in real-time, and coordinate
            truck arrivals across all your port terminals.
          </p>
          <div className="flex items-center gap-2 text-[#38BDF8]">
            <Ship className="h-5 w-5" />
            <span className="text-sm font-medium font-[family-name:var(--font-roboto-condensed)]">
              Port terminal operator access
            </span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500 font-[family-name:var(--font-roboto-condensed)]">
          © 2026 PortFlow. All rights reserved.
        </p>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38BDF8]">
              <Anchor className="h-5 w-5 text-[#0F172A]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">PortFlow</span>
          </div>

          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Operator Sign In</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access your terminal operations dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="operator@portflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in…
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Contact your port administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  )
}
