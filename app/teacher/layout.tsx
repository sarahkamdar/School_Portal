"use client"

import type React from "react"

import { motion } from "framer-motion"
import { TeacherSidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { AuthProvider } from "@/components/auth-provider"
import { RequireRole } from "@/components/guard"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RequireRole role="teacher">
        <div className="flex h-screen">
          <TeacherSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar title="Teacher" />
            <motion.main
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-auto bg-card p-4"
            >
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </motion.main>
          </div>
        </div>
      </RequireRole>
    </AuthProvider>
  )
}
