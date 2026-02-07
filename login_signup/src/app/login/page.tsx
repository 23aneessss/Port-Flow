"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import PortBranding from "@/components/auth/PortBranding";
import FormInput from "@/components/auth/FormInput";
import StatusMessage from "@/components/auth/StatusMessage";
import LoadingSpinner from "@/components/auth/LoadingSpinner";

/* ═══════════════════════════════════════════════════
   Login Page – Role-based redirect
   ─────────────────────────────────────────────────
   Email + password only.
   Role is determined server-side after auth,
   then redirects to the corresponding platform.
   ═══════════════════════════════════════════════════ */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    // Visual simulation (no backend)
    // In production, the server detects the role and returns the redirect URL
    setTimeout(() => {
      setIsLoading(false);
      setStatus({
        type: "success",
        message: "Welcome! Redirecting to your platform…",
      });
    }, 1800);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-port-dark px-4 py-12">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-port-cyan/[0.04] blur-[150px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Main card */}
        <div className="rounded-2xl border border-white/[0.06] bg-port-light p-8 shadow-2xl shadow-black/20">
          {/* Branding */}
          <div className="mb-8">
            <PortBranding />
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="font-heading text-2xl font-bold text-port-dark">
              Sign In
            </h2>
            <p className="mt-1 font-body text-sm text-port-gray">
              Access your account to continue
            </p>
          </div>

          {/* Status */}
          {status && (
            <div className="mb-6">
              <StatusMessage type={status.type} message={status.message} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              }
            />

            {/* Password */}
            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              }
            />

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-port-dark/20 text-port-cyan focus:ring-port-cyan/50"
                />
                <span className="font-body text-sm text-port-gray">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="font-body text-sm font-medium text-port-cyan hover:text-port-cyan/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-port-cyan px-4 py-3 font-heading text-sm font-semibold text-port-dark shadow-lg shadow-port-cyan/25 transition-all hover:bg-port-cyan/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-port-cyan/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-port-dark/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-port-light px-3 font-body text-xs text-port-gray">
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 font-body text-sm font-medium text-port-cyan hover:text-port-cyan/80 transition-colors"
            >
              Create a new account
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Security footer */}
        <p className="mt-6 text-center font-body text-xs text-port-gray/40">
          Secure connection · All sessions are logged
        </p>
      </div>
    </div>
  );
}
