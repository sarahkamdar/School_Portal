import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const ClassSchema = z.object({
  name: z.string().min(1),
  section: z.string().optional().default(""),
  academicYear: z.string().optional(),
  maxStrength: z.number().int().nonnegative().optional(),
  classTeacherId: z.string().optional(),
})

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection("classes").find({}).toArray()
    const data = docs.map((c: any) => ({
      id: c.id ?? `c${c.name}${c.section ?? ""}`,
      name: c.name,
      section: c.section ?? "",
      academicYear: c.academicYear,
      maxStrength: c.maxStrength,
      classTeacherId: c.classTeacherId,
      subjects: c.subjects || [],
      fees: c.fees || {},
    }))
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const parsed = ClassSchema.parse(await req.json())
    const id = `c${parsed.name}${parsed.section ?? ""}`
    const db = await getDb()
    await db.collection("classes").updateOne(
      { id },
      { $set: { id, ...parsed, subjects: [] } },
      { upsert: true },
    )
    return NextResponse.json({ ok: true, data: { id, ...parsed, subjects: [] } })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
