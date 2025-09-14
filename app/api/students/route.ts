import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Create = z.object({
  name: z.string().min(1),
  gender: z.enum(["Male","Female","Other"]),
  dob: z.string().optional(),
  classId: z.string().min(1),
  section: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  photoUrl: z.string().optional(),
})

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection("students").find({}).toArray()
    const data = docs.map((s: any) => ({
      id: s.id,
      name: s.name,
      gender: s.gender,
      dob: s.dob,
      admissionNo: s.admissionNo,
      classId: s.classId,
      section: s.section,
      rollNo: s.rollNo,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      address: s.address,
      email: s.email,
      photoUrl: s.photoUrl,
      attendance: s.attendance || {},
      feesPaid: s.feesPaid || {},
      marks: s.marks || {},
    }))
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = Create.parse(await req.json())
    const db = await getDb()
    const id = `s${Date.now()}`
    // auto admission number
    const admissionNo = `ADM${Date.now()}`
    // auto roll number: next per class+section
    const where: any = { classId: body.classId }
    if (body.section) where.section = body.section
    const prev = await db.collection("students").find(where).project({ rollNo: 1 }).toArray()
    const nextRoll = prev.length ? Math.max(...prev.map((p: any) => p.rollNo || 0)) + 1 : 1
    const doc = {
      id,
      name: body.name,
      gender: body.gender,
      dob: body.dob,
      admissionNo,
      classId: body.classId,
      section: body.section,
      rollNo: nextRoll,
      guardianName: body.guardianName,
      guardianPhone: body.guardianPhone,
      address: body.address,
      email: body.email,
      photoUrl: body.photoUrl,
      attendance: {},
      feesPaid: {},
      marks: {},
    }
    await db.collection("students").insertOne(doc)
    return NextResponse.json({ ok: true, data: doc })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
