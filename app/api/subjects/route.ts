import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Create = z.object({ 
  name: z.string().min(1), 
  classId: z.string().min(1),
  code: z.string().optional(),
  type: z.enum(["Core","Elective","Co-curricular"]).optional()
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") || undefined
    const db = await getDb()
    const q = classId ? { classId } : {}
    const docs = await db.collection("subjects").find(q).toArray()
    return NextResponse.json({ ok: true, data: docs })
  } catch (e: any) {
    console.warn("MongoDB not available for subjects, using fallback data:", e.message)
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = Create.parse(await req.json())
    
    // Auto-generate code from name if not provided
    const code = body.code || body.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8)
    
    // Default type to "Core" if not provided
    const type = body.type || "Core"
    
    const id = `${body.classId}_${code}_${Date.now()}`
    const subjectData = { ...body, id, code, type }
    
    const db = await getDb()
    await db.collection("subjects").updateOne({ id }, { $set: subjectData }, { upsert: true })
    return NextResponse.json({ ok: true, data: subjectData })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
