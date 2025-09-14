import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const [classes, students, teachers, classTimetables, notices, exams, subjects, fees, classTeacherMappings] = await Promise.all([
      db.collection("classes").find({}).toArray(),
      db.collection("students").find({}).toArray(),
      db.collection("teachers").find({}).toArray(),
      db.collection("classTimetables").find({}).toArray(),
      db.collection("notices").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("exams").find({}).toArray(),
      db.collection("subjects").find({}).toArray(),
      db.collection("fees").find({}).toArray(),
      db.collection("classTeacherMappings").find({}).toArray(),
    ])
    return NextResponse.json({ ok: true, data: { classes, students, teachers, classTimetables, notices, exams, subjects, fees, classTeacherMappings } })
  } catch (e: any) {
    // Fallback data when MongoDB is not available
    console.warn("MongoDB not available, using fallback data:", e.message)
    const fallbackData = {
      classes: [],
      students: [],
      teachers: [],
      classTimetables: [],
      notices: [],
      exams: [],
      subjects: [],
      fees: [],
      classTeacherMappings: [],
    }
    return NextResponse.json({ ok: true, data: fallbackData })
  }
}
