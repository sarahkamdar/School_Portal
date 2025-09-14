import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Body = z.object({ examId: z.string().min(1), subject: z.string().min(1), score: z.number().nonnegative(), total: z.number().positive() })

export async function POST(req: Request, { params }: { params: { studentId: string } }) {
  try {
    const { examId, subject, score, total } = Body.parse(await req.json())
    const db = await getDb()
    await db.collection("students").updateOne(
      { id: params.studentId },
      { $set: { [`marks.${examId}.total`]: total, [`marks.${examId}.subjects.${subject}`]: score } },
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
