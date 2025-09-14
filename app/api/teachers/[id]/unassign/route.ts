import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    await db.collection("teachers").updateOne({ id: params.id }, { $set: { isClassTeacher: false }, $unset: { classId: "" } })
    await db.collection("classTimetables").updateMany({}, { $pull: { entries: { teacherId: params.id } } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}
