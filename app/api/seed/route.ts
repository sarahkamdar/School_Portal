import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { initialData } from "@/lib/data"

export async function POST() {
  try {
    const db = await getDb()
    // classes
    for (const c of initialData.classes) {
      await db.collection("classes").updateOne({ id: c.id }, { $set: c }, { upsert: true })
    }
    // students
    for (const s of initialData.students) {
      await db.collection("students").updateOne({ id: s.id }, { $set: s }, { upsert: true })
    }
    // teachers
    for (const t of initialData.teachers) {
      await db.collection("teachers").updateOne({ id: t.id }, { $set: t }, { upsert: true })
    }
    // timetables
    for (const tt of initialData.classTimetables) {
      await db.collection("classTimetables").updateOne({ classId: tt.classId }, { $set: tt }, { upsert: true })
    }
    // notices
    for (const n of initialData.notices) {
      await db.collection("notices").updateOne({ id: n.id }, { $set: n }, { upsert: true })
    }
    // exams
    for (const e of initialData.exams) {
      await db.collection("exams").updateOne({ id: e.id }, { $set: e }, { upsert: true })
    }
    // subjects
    for (const s of initialData.subjects || []) {
      await db.collection("subjects").updateOne({ id: s.id }, { $set: s }, { upsert: true })
    }
    // fees
    for (const f of initialData.fees || []) {
      await db.collection("fees").updateOne({ id: f.id }, { $set: f }, { upsert: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}
