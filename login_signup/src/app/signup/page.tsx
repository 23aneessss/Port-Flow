"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { VALIDATION } from "@/lib/auth.types";
import PortBranding from "@/components/auth/PortBranding";
import FormInput from "@/components/auth/FormInput";
import StatusMessage from "@/components/auth/StatusMessage";
import LoadingSpinner from "@/components/auth/LoadingSpinner";

/* ═══════════════════════════════════════════════════
   Signup Page – TBMS (Interface only)
   ─────────────────────────────────────────────────
   Reserved for Carriers only.
   Operators & Admins do not have access to registration.
   ─────────────────────────────────────────────────
   Flow: Signup → (future validation) → Login
   ═══════════════════════════════════════════════════ */

export default function SignupPage() {
  // ── Form state ──
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // ── UI state ──
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{
    type: "error" | "success" | "warning";
    message: string;
  } | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 2-step form

  // ── Client-side validation ──
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!VALIDATION.EMAIL_REGEX.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (phone && !VALIDATION.PHONE_REGEX.test(phone)) {
      newErrors.phone = "Invalid phone format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!registrationNumber.trim())
      newErrors.registrationNumber = "Registration number is required";
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    } else if (!VALIDATION.PASSWORD_REGEX.test(password)) {
      newErrors.password =
        "Must contain uppercase, lowercase, digit and special character";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setStatus(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setStatus(null);
    setIsLoading(true);

    // Visual simulation only
    setTimeout(() => {
      setIsLoading(false);
      setStatus({
        type: "warning",
        message:
          "Your account has been created and is pending approval. An administrator will review your registration. You will be notified once your account is activated.",
      });
    }, 2000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-port-dark px-4 py-12">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full bg-port-cyan/[0.04] blur-[150px]" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Carte principale */}
        <div className="rounded-2xl border border-white/[0.06] bg-port-light p-8 shadow-2xl shadow-black/20">
          {/* Branding */}
          <div className="mb-6">
            <PortBranding />
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="font-heading text-2xl font-bold text-port-dark">
              Carrier Registration
            </h2>
            <p className="mt-1 font-body text-sm text-port-gray">
              Create your account to book your time slots
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3">
            {[1, 2].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold transition-all ${
                    step >= s
                      ? "bg-port-cyan text-port-dark shadow-md shadow-port-cyan/30"
                      : "bg-port-dark/5 text-port-gray"
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`font-body text-xs font-medium ${
                    step >= s ? "text-port-dark" : "text-port-gray/50"
                  }`}
                >
                  {s === 1 ? "Identity" : "Security"}
                </span>
                {s < 2 && (
                  <div
                    className={`h-0.5 flex-1 rounded ${
                      step > 1 ? "bg-port-cyan" : "bg-port-dark/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Status */}
          {status && (
            <div className="mb-6">
              <StatusMessage type={status.type} message={status.message} />
            </div>
          )}

          {/* Role notice */}
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-port-cyan/15 bg-port-cyan/5 p-3">
            <span className="text-lg">🚛</span>
            <p className="font-body text-xs text-port-gray leading-relaxed">
              Registration is available for{" "}
              <strong className="text-port-dark">carriers</strong> only.
              Operators and administrators receive their credentials from
              their manager.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ═══ STEP 1: Identity ═══ */}
            {step === 1 && (
              <div className="space-y-4">
                <FormInput
                  id="companyName"
                  label="Company Name"
                  placeholder="Acme Logistics LLC"
                  value={companyName}
                  onChange={setCompanyName}
                  error={errors.companyName}
                  required
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5Z" />
                    </svg>
                  }
                />

                <FormInput
                  id="fullName"
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={setFullName}
                  error={errors.fullName}
                  required
                  autoComplete="name"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  }
                />

                <FormInput
                  id="email"
                  label="Business Email"
                  type="email"
                  placeholder="contact@acme-logistics.com"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  required
                  autoComplete="email"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  }
                />

                <FormInput
                  id="phone"
                  label="Phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={setPhone}
                  error={errors.phone}
                  autoComplete="tel"
                  hint="Optional — used for SMS notifications"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  }
                />

                {/* Next step button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-port-cyan px-4 py-3 font-heading text-sm font-semibold text-port-dark shadow-lg shadow-port-cyan/25 transition-all hover:bg-port-cyan/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-port-cyan/50 focus:ring-offset-2"
                >
                  Continue
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}

            {/* ═══ STEP 2 : Security ═══ */}
            {step === 2 && (
              <div className="space-y-4">
                <FormInput
                  id="registrationNumber"
                  label="Carrier Registration Number"
                  placeholder="TRP-2026-XXXXX"
                  value={registrationNumber}
                  onChange={setRegistrationNumber}
                  error={errors.registrationNumber}
                  required
                  hint="Number issued by the port authority"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                    </svg>
                  }
                />

                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                  hint="Min. 8 chars · Uppercase · Lowercase · Digit · Special"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  }
                />

                {/* Indicateur de force du mot de passe */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength =
                          (password.length >= 8 ? 1 : 0) +
                          (/[A-Z]/.test(password) ? 1 : 0) +
                          (/\d/.test(password) ? 1 : 0) +
                          (/[@$!%*?&]/.test(password) ? 1 : 0);
                        const colors = [
                          "bg-error",
                          "bg-warning",
                          "bg-port-cyan",
                          "bg-success",
                        ];
                        return (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              level <= strength
                                ? colors[strength - 1]
                                : "bg-port-dark/10"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="font-body text-[10px] text-port-gray/60">
                      {(() => {
                        const s =
                          (password.length >= 8 ? 1 : 0) +
                          (/[A-Z]/.test(password) ? 1 : 0) +
                          (/\d/.test(password) ? 1 : 0) +
                          (/[@$!%*?&]/.test(password) ? 1 : 0);
                        return ["Weak", "Fair", "Good", "Excellent"][s - 1] || "Very weak";
                      })()}
                    </p>
                  </div>
                )}

                <FormInput
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  }
                />

                {/* Conditions d'utilisation */}
                <div className="space-y-1">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-port-dark/20 text-port-cyan focus:ring-port-cyan/50"
                    />
                    <span className="font-body text-xs leading-relaxed text-port-gray">
                      I agree to the{" "}
                      <button type="button" className="font-medium text-port-cyan hover:underline">
                        Terms of Service
                      </button>{" "}
                      and the{" "}
                      <button type="button" className="font-medium text-port-cyan hover:underline">
                        Privacy Policy
                      </button>{" "}
                      of the maritime port.
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="ml-7 font-body text-xs text-error">
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>

                {/* Step 2 buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrors({});
                    }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-port-dark/15 px-4 py-3 font-heading text-sm font-medium text-port-gray transition-all hover:bg-port-dark/5 focus:outline-none focus:ring-2 focus:ring-port-cyan/50 focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-port-cyan px-4 py-3 font-heading text-sm font-semibold text-port-dark shadow-lg shadow-port-cyan/25 transition-all hover:bg-port-cyan/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-port-cyan/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Creating account…</span>
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-port-dark/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-port-light px-3 font-body text-xs text-port-gray">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-body text-sm font-medium text-port-cyan hover:text-port-cyan/80 transition-colors"
            >
              Sign in to your account
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Security footer */}
        <p className="mt-6 text-center font-body text-xs text-port-gray/40">
          Your data is protected · GDPR Compliant · Maritime Port
        </p>
      </div>
    </div>
  );
}
