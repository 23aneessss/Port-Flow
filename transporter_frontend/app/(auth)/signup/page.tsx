"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, Truck, Anchor, ArrowRight, ArrowLeft } from "lucide-react"

export default function TransporterSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [proofDocumentUrl, setProofDocumentUrl] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleNext = () => {
    setError("")
    if (!firstName || !lastName || !companyName || !email || !phone || !gender || !birthDate) {
      setError("Please fill in all fields.")
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!proofDocumentUrl || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const { registerCarrier } = await import("@/lib/api")
      await registerCarrier({
        email,
        password,
        firstName,
        lastName,
        phone,
        gender,
        birthDate,
        companyName,
        proofDocumentUrl,
      })
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "Registration failed.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0F172A] text-white p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-32 -right-16 h-64 w-64 rounded-full bg-[#38BDF8]/10 blur-3xl" />
        <div className="absolute -bottom-12 left-20 h-48 w-48 rounded-full bg-[#38BDF8]/8 blur-2xl" />

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
            Join the<br />Network
          </h1>
          <p className="max-w-md text-slate-300 text-base font-[family-name:var(--font-roboto-condensed)]">
            Register your transport company to start booking time-slots,
            managing drivers, and streamlining your port logistics operations.
          </p>
          <div className="flex items-center gap-2 text-[#38BDF8]">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-medium font-[family-name:var(--font-roboto-condensed)]">
              Get started in minutes
            </span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500 font-[family-name:var(--font-roboto-condensed)]">
          © 2026 PortFlow. All rights reserved.
        </p>
      </div>

      {/* Right signup form */}
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
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                {step === 1 ? "Step 1 — Personal Information" : "Step 2 — Security & Documents"}
              </CardDescription>
              {/* Step indicator */}
              <div className="flex items-center gap-2 pt-2">
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="space-y-4">
                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Acme Transport Co."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        autoComplete="organization"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+213 6XX XXX XXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          autoComplete="tel"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Date of Birth</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 font-semibold text-base mt-2"
                    >
                      <span className="flex items-center gap-2">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="proofDocumentUrl">Proof Document URL</Label>
                      <Input
                        id="proofDocumentUrl"
                        type="url"
                        placeholder="https://example.com/document.pdf"
                        value={proofDocumentUrl}
                        onChange={(e) => setProofDocumentUrl(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11 font-semibold text-base"
                        onClick={() => { setError(""); setStep(1) }}
                      >
                        <span className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </span>
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-11 font-semibold text-base"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Creating…
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
