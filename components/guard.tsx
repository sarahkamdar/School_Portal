"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

export function RequireRole({ role, children }: { role: "admin" | "teacher"; children: React.ReactNode }) {
  const { role: r } = useAuth()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (r === role) setOk(true)
    else router.replace("/login")
  }, [r, role, router])

  if (!ok) return null
  return <>{children}</>
}
