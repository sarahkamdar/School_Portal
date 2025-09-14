import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Fees = z.object({ exam: z.number().optional(), admission: z.number().optional(), term: z.number().optional(), utilities: z.number().optional() })

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const fees = Fees.parse(await req.json())
    const db = await getDb()
    await db.collection("classes").updateOne({ id: params.id }, { $set: { fees } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
