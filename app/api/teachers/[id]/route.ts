import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { z } from "zod"

const Update = z.object({
  name: z.string().optional(),
  gender: z.enum(["Male","Female","Other"]).optional(),
  dob: z.string().optional(),
  qualification: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  subject: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  photoUrl: z.string().optional(),
  password: z.string().optional(),
  isClassTeacher: z.boolean().optional(),
  classId: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const t = await db.collection("teachers").findOne({ id: params.id })
    if (!t) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true, data: t })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = Update.parse(await req.json())
    const db = await getDb()
    await db.collection("teachers").updateOne({ id: params.id }, { $set: body })
    // optional link class teacher
    if (typeof body.isClassTeacher !== "undefined" && body.classId) {
      await db.collection("classes").updateOne({ id: body.classId }, { $set: { classTeacherId: body.isClassTeacher ? params.id : undefined } })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    await db.collection("teachers").deleteOne({ id: params.id })
    await db.collection("classTimetables").updateMany({}, { $pull: { entries: { teacherId: params.id } } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}
