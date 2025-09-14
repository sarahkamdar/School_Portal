import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Body = z.object({ toTeacherId: z.string().min(1) })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { toTeacherId } = Body.parse(await req.json())
    const db = await getDb()
    await db.collection("classTimetables").updateMany({}, { $set: { "entries.$[e].teacherId": toTeacherId } }, { arrayFilters: [{ "e.teacherId": params.id }] })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
