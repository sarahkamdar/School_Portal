import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Body = z.object({ date: z.string().min(1), present: z.record(z.boolean()) })

export async function PUT(req: Request, { params }: { params: { classId: string } }) {
  try {
    const { date, present } = Body.parse(await req.json())
    const db = await getDb()
    const students = await db.collection("students").find({ classId: params.classId }).toArray()
    for (const s of students) {
      const val = !!present[s.id]
      await db.collection("students").updateOne({ id: s.id }, { $set: { [`attendance.${date}`]: val } })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
