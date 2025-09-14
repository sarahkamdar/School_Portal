import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Opts = z.object({
  reassignStudentsTo: z.string().nullable().optional(),
  deleteStudents: z.boolean().optional(),
  unassignTeachers: z.boolean().optional(),
  deleteTeachers: z.boolean().optional(),
})

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const opts = Opts.parse(await req.json())
    const db = await getDb()
    const classId = params.id

    // students
    if (opts.deleteStudents) {
      await db.collection("students").deleteMany({ classId })
    } else if (opts.reassignStudentsTo) {
      await db.collection("students").updateMany({ classId }, { $set: { classId: opts.reassignStudentsTo } })
    }

    // teachers for this class
    const teachers = await db.collection("teachers").find({ classId }).toArray()
    const teacherIds = teachers.map((t: any) => t.id)
    if (opts.deleteTeachers) {
      await db.collection("teachers").deleteMany({ classId })
      await db.collection("classTimetables").updateMany({}, { $pull: { entries: { teacherId: { $in: teacherIds } } } })
    } else if (opts.unassignTeachers) {
      await db.collection("teachers").updateMany({ classId }, { $set: { isClassTeacher: false }, $unset: { classId: "" } })
      await db.collection("classTimetables").updateOne({ classId }, { $set: { entries: [] } })
    }

    // remove timetable and exams for class
    await db.collection("classTimetables").deleteOne({ classId })
    await db.collection("exams").deleteMany({ classId })
    // finally remove class
    await db.collection("classes").deleteOne({ id: classId })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
