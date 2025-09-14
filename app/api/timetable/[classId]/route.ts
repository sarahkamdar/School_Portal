import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Entry = z.object({ day: z.string().min(1), period: z.number().int().positive(), subject: z.string().min(1), teacherId: z.string().min(1) })
const Body = z.object({ entries: z.array(Entry) })

export async function GET(_req: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params
    const db = await getDb()
    const doc = await db.collection("classTimetables").findOne({ classId })
    return NextResponse.json({ ok: true, data: doc || { classId, entries: [] } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params
    const { entries } = Body.parse(await req.json())
    const db = await getDb()
    await db.collection("classTimetables").updateOne(
      { classId },
      { $set: { classId, entries } },
      { upsert: true },
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
