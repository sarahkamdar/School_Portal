"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { actions, presetAdmin } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const uname = username.trim()
      const adminId = (presetAdmin as any)?.id?.toLowerCase?.() || "admin"
      const adminPass = (presetAdmin as any)?.password || "admin123"

      if (uname.toLowerCase() === adminId && password === adminPass) {
        // Admin login only if BOTH id and password match preset
        await actions.loginAdminPreset()
        router.replace("/admin")
      } else {
        // Otherwise attempt teacher login
        await actions.loginTeacher(uname, password)
        router.replace("/teacher")
      }
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.message || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-0px)] items-center justify-center bg-card px-4 py-10">
      {/* Home redirection button */}
      <div className="fixed top-4 right-4 z-10">
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username / Teacher ID</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username or teacher ID"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
