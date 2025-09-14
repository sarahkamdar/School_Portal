"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <h1 className="text-base font-serif font-semibold text-balance">{title}</h1>
      <Link href="/">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          Go to Home
        </Button>
      </Link>
    </header>
  )
}
