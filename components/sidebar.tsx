"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarClock,
  ClipboardCheck,
  Receipt,
  Megaphone,
  BookOpenCheck,
  LogOut,
  Home,
  Table2,
  PenTool,
  ChartLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

export function AdminSidebar() {
  const items: Item[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/classes", label: "Classes", icon: Table2 },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
    { href: "/admin/timetable", label: "Timetable", icon: CalendarClock },
    { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/admin/fees", label: "Fees", icon: Receipt },
    { href: "/admin/notices", label: "Notices", icon: Megaphone },
    { href: "/admin/exams", label: "Exams", icon: BookOpenCheck },
  ]
  return <SidebarBase items={items} />
}

export function TeacherSidebar() {
  const items: Item[] = [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/timetable", label: "Timetable", icon: CalendarClock },
    { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/teacher/marks", label: "Enter Marks", icon: PenTool },
    { href: "/teacher/view-results", label: "View Results", icon: ChartLine },
  ]
  return <SidebarBase items={items} />
}

function SidebarBase({ items }: { items: Item[] }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  
  // Helper function to determine if a menu item should be active
  const isActive = (href: string) => {
    // For exact matches (like dashboard pages)
    if (pathname === href) return true
    
    // For nested routes, only highlight if it's not the root dashboard path
    // and the pathname starts with the href followed by a slash
    if (href.endsWith('/admin') || href.endsWith('/teacher')) {
      // Dashboard pages should only be active for exact matches
      return pathname === href
    }
    
    // For other pages, check if pathname starts with href followed by a slash
    return pathname.startsWith(`${href}/`)
  }
  
  return (
    <motion.aside
      initial={{ x: -14, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="h-full w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground"
    >
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Home className="h-5 w-5 text-primary" />
        <span className="font-semibold">School Portal</span>
      </div>
      <nav className="p-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <div
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-sidebar-accent text-foreground ring-1 ring-sidebar-border" : "hover:bg-sidebar-accent"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-pretty">{label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto p-3">
        <Button variant="outline" className="w-full bg-transparent" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </motion.aside>
  )
}
