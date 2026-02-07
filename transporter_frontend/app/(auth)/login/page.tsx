"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Truck, Anchor } from "lucide-react"

export default function TransporterLoginPage() {
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
      const { loginApi } = await import("@/lib/api")
      const res = await loginApi(email, password)
      if (res.role !== "CARRIER") {
        setError("Access restricted to transporters only.")
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
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#38BDF8]/10 blur-3xl" />
        <div className="absolute bottom-16 right-8 h-56 w-56 rounded-full bg-[#38BDF8]/8 blur-2xl" />

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
            Logistics & Transport Platform
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight font-[family-name:var(--font-montserrat)]">
            Transporter<br />Portal
          </h1>
          <p className="max-w-md text-slate-300 text-base font-[family-name:var(--font-roboto-condensed)]">
            Book time-slots, manage your fleet of drivers, and track deliveries
            across port terminals — all in one place.
          </p>
          <div className="flex items-center gap-2 text-[#38BDF8]">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-medium font-[family-name:var(--font-roboto-condensed)]">
              For registered transport companies
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
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your transporter account
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
                    placeholder="you@company.com"
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

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
