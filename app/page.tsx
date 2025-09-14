"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <main>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Image src="/school-logo.jpg" alt="School logo" width={40} height={40} />
            <div>
              <p className="text-lg font-semibold leading-tight">SHREE SARVAJANIK HIGHSCHOOL</p>
              <p className="text-sm text-muted-foreground leading-tight">"Knowledge, Discipline, Excellence – Since 2001"</p>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
          </Link>
        </div>
      </header>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-balance text-3xl font-semibold md:text-4xl">Welcome to SHREE SARVAJANIK HIGHSCHOOL</h1>
            <p className="mt-3 text-pretty text-muted-foreground">
              Established in 2001, SHREE SARVAJANIK HIGHSCHOOL is a Pvt. Aided institution located in Umbergaon, Valsad (Gujarat). We are committed to holistic education, discipline, and nurturing future-ready students.
            </p>
            <div className="mt-6">
              <a href="mailto:sarvajanikhs@gmail.com">
                <Button className="bg-blue-600 hover:bg-blue-700">Contact Us</Button>
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Image src="/school-campus.jpg" alt="School campus" width={720} height={420} className="w-full" />
          </div>
        </div>
      </motion.section>

      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "Instruction Medium", value: "Gujarati" },
            { label: "Classes", value: "6 to 12" },
            { label: "Male Teachers", value: "9" },
            { label: "Female Teachers", value: "10" },
            { label: "Head Teacher", value: "Puspa A Patel" },
            { label: "Principal", value: "Hiteshkumar Dodiya" },
            { label: "Total Teachers", value: "19" },
            { label: "Board", value: "State Board" },
            { label: "Establishment Year", value: "2001" },
            { label: "School Type", value: "Co-educational" },
            { label: "Management", value: "Pvt. Aided" },
            { label: "Meal Provided", value: "No" }
          ].map((item) => (
            <Card key={item.label} className="border">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-medium">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto grid max-w-6xl gap-2 px-4 py-6 md:grid-cols-3">
          <div>
            <p className="font-semibold">Address</p>
            <p className="text-sm text-muted-foreground">SHREE SARVAJANIK HIGHSCHOOL, Umbergaon, Valsad, Gujarat</p>
          </div>
          <div>
            <p className="font-semibold">Phone</p>
            <p className="text-sm text-muted-foreground">+91 98765 43210</p>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">sarvajanikhs@gmail.com</p>
          </div>
        </div>
      </footer>
    </main>
  )
}