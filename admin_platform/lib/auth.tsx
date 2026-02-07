"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

interface AuthState {
  token: string | null
  role: string | null
  userId: string | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  token: null,
  role: null,
  userId: null,
  isLoading: true,
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole: string
}) {
  const router = useRouter()
  const [state, setState] = useState<{
    token: string | null
    role: string | null
    userId: string | null
    isLoading: boolean
  }>({ token: null, role: null, userId: null, isLoading: true })

  useEffect(() => {
    const t = localStorage.getItem("pf_token")
    const r = localStorage.getItem("pf_role")
    const u = localStorage.getItem("pf_userId")
    if (!t || r !== requiredRole) {
      router.replace("/login")
      return
    }
    setState({ token: t, role: r, userId: u, isLoading: false })
  }, [requiredRole, router])

  const logout = useCallback(() => {
    localStorage.removeItem("pf_token")
    localStorage.removeItem("pf_role")
    localStorage.removeItem("pf_userId")
    setState({ token: null, role: null, userId: null, isLoading: true })
    router.replace("/login")
  }, [router])

  if (state.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ ...state, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
