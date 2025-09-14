"use client"

import type React from "react"

import { createContext, useContext, useMemo } from "react"
import { actions, useSession } from "@/lib/storage"

type AuthValue = {
  role: "admin" | "teacher" | null
  teacherId?: string
  logout: () => Promise<void>
}
const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const s = useSession()
  const value = useMemo<AuthValue>(
    () => ({
      role: s.role,
      teacherId: s.teacherId,
      logout: async () => actions.logout(),
    }),
    [s.role, s.teacherId],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
