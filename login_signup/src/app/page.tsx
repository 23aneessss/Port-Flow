import Link from "next/link";
import Image from "next/image";
import carrierLogo from "@/assets/carrier.webp";

/* ═══════════════════════════════════════════════════
   Home Page – Entry point
   ─────────────────────────────────────────────────
   • No backend: static navigation
   • Presents 2 paths: Login / Signup
   ═══════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-port-dark">
      {/* Grille décorative de fond */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Lueur cyan */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-port-cyan/[0.07] blur-[120px]" />

      <main className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Logo & branding */}
        <div className="flex flex-col items-center gap-6">
          <Image
            src={carrierLogo}
            alt="Carrier Logo"
            width={260}
            height={260}
            className="h-44 w-auto object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]"
            priority
          />
        </div>

        {/* Subtitle */}
        <p className="max-w-lg font-body text-base leading-relaxed text-port-gray">
          Truck booking management platform for the maritime port.
          Sign in or create an account to access the system.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-port-cyan px-8 font-heading text-sm font-semibold text-port-dark shadow-lg shadow-port-cyan/25 transition-all hover:bg-port-cyan/90 hover:shadow-xl hover:shadow-port-cyan/30 focus:outline-none focus:ring-2 focus:ring-port-cyan/50 focus:ring-offset-2 focus:ring-offset-port-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-port-cyan/30 px-8 font-heading text-sm font-semibold text-port-cyan transition-all hover:border-port-cyan/60 hover:bg-port-cyan/5 focus:outline-none focus:ring-2 focus:ring-port-cyan/50 focus:ring-offset-2 focus:ring-offset-port-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
            Create Account
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center gap-2 text-xs text-port-gray/50">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
          </svg>
          <span>Secure Connection · RBAC · Maritime Port</span>
        </div>
      </main>
    </div>
  );
}
