import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Body = z.object({ name: z.string().min(1), code: z.string().min(1), type: z.enum(["Core","Elective","Co-curricular"]) })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, code, type } = Body.parse(await req.json())
    const db = await getDb()
    await db.collection("subjects").updateOne({ id: code }, { $set: { id: code, name, code, type, classId: params.id } }, { upsert: true })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
