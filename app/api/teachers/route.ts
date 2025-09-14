import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Create = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") || undefined
    const isCT = searchParams.get("isClassTeacher")
    const subject = searchParams.get("subject") || undefined
    const q: any = {}
    if (classId) q.classId = classId
    if (subject) q.subject = subject
    if (isCT === "true") q.isClassTeacher = true
    if (isCT === "false") q.isClassTeacher = { $ne: true }

    const db = await getDb()
    const docs = await db.collection("teachers").find(q).toArray()
    const data = docs.map((t: any) => ({
      id: t.id,
      name: t.name,
      gender: t.gender,
      dob: t.dob,
      qualification: t.qualification,
      expertise: t.expertise || [],
      subject: t.subject,
      contactNumber: t.contactNumber,
      email: t.email,
      address: t.address,
      photoUrl: t.photoUrl,
      password: t.password,
      isClassTeacher: !!t.isClassTeacher,
      classId: t.classId,
    }))
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}

function genId() {
  return `T${Date.now()}`
}
function genPassword() {
  return Math.random().toString(36).slice(2, 10)
}

export async function POST(req: Request) {
  try {
    const body = Create.parse(await req.json())
    const db = await getDb()
    const id = body.id && body.id.trim() ? body.id : genId()
    const password = body.password && body.password.trim() ? body.password : genPassword()
    const doc = { ...body, id, password }

    await db.collection("teachers").updateOne({ id }, { $set: doc }, { upsert: true })
    return NextResponse.json({ ok: true, data: doc })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
