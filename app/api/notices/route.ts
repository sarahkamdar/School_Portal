import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const NoticeSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  audience: z.enum(["Admin", "Teachers", "Both"]).optional().default("Both"),
  eventDate: z.string().optional(),
  expiryDate: z.string().optional(),
  active: z.boolean().optional().default(true),
})

function toNotice(doc: any) {
  return {
    id: String(doc._id ?? doc.id),
    title: doc.title,
    message: doc.message,
    createdAt: doc.createdAt ?? new Date().toISOString(),
    active: doc.active ?? true,
    audience: doc.audience ?? "Both",
    eventDate: doc.eventDate,
    expiryDate: doc.expiryDate,
  }
}

export async function GET() {
  try {
    const db = await getDb()
    const col = db.collection("notices")
    const now = new Date().toISOString()
    const docs = await col
      .find({ $and: [{ active: { $ne: false } }, { $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }] }] })
      .sort({ createdAt: -1 })
      .toArray()
    const data = docs.map((d) => toNotice(d))
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    console.warn("MongoDB not available for notices, using fallback data:", e.message)
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = NoticeSchema.parse(body)
    const now = new Date().toISOString()

    const db = await getDb()
    const col = db.collection("notices")
    const doc = { ...parsed, createdAt: now }
    const res = await col.insertOne(doc)

    return NextResponse.json({ ok: true, data: toNotice({ ...doc, _id: res.insertedId }) })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
