import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Reassign = z.object({ classId: z.string().min(1) })

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { classId } = Reassign.parse(await req.json())
    const db = await getDb()
    await db.collection("students").updateOne({ id: params.id }, { $set: { classId } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    await db.collection("students").deleteOne({ id: params.id })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}
