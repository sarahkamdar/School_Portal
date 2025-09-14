import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Body = z.object({ key: z.enum(["exam","admission","term","utilities","education","other"]), paid: z.boolean() })

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { key, paid } = Body.parse(await req.json())
    const db = await getDb()
    await db.collection("students").updateOne({ id: params.id }, { $set: { [`feesPaid.${key}`]: paid } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
