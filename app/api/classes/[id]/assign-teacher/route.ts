import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Body = z.object({ teacherId: z.string().min(1), academicYear: z.string().optional() })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { teacherId, academicYear } = Body.parse(await req.json())
    const db = await getDb()
    await db.collection("classes").updateOne({ id: params.id }, { $set: { classTeacherId: teacherId, academicYear } })
    await db.collection("teachers").updateOne({ id: teacherId }, { $set: { isClassTeacher: true, classId: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
