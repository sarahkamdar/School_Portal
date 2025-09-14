import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Create = z.object({
  classId: z.string().min(1),
  type: z.enum(["admission","education","exam","term","utilities","other"]),
  amount: z.number().nonnegative(),
  applicableGender: z.enum(["Male","Female","Both"]).default("Male"),
  dueDate: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") || undefined
    const db = await getDb()
    const q = classId ? { classId } : {}
    const docs = await db.collection("fees").find(q).toArray()
    return NextResponse.json({ ok: true, data: docs })
  } catch (e: any) {
    console.warn("MongoDB not available for fees, using fallback data:", e.message)
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = Create.parse(await req.json())
    const id = `fee_${body.classId}_${body.type}`
    const db = await getDb()
    await db.collection("fees").updateOne({ id }, { $set: { ...body, id } }, { upsert: true })
    return NextResponse.json({ ok: true, data: { ...body, id } })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
