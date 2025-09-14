import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const Create = z.object({
  classId: z.string().min(1),
  name: z.string().min(1),
  totalMarks: z.number().int().positive(),
  passingMarks: z.number().int().nonnegative(),
  // Keep backward compatibility with existing fields
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalPerSubject: z.number().int().positive().optional(),
})

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection("exams").find({}).toArray()
    const data = docs.map((e: any) => ({ 
      id: e.id, 
      classId: e.classId, 
      name: e.name, 
      totalMarks: e.totalMarks || e.totalPerSubject, // Backward compatibility
      passingMarks: e.passingMarks,
      startDate: e.startDate, 
      endDate: e.endDate, 
      totalPerSubject: e.totalPerSubject 
    }))
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    console.warn("MongoDB not available for exams, using fallback data:", e.message)
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = Create.parse(await req.json())
    
    // Auto-generate ID
    const id = `exam_${body.classId}_${Date.now()}`
    
    // Ensure backward compatibility 
    const doc = { 
      ...body, 
      id,
      totalPerSubject: body.totalMarks // For backward compatibility
    }
    
    const db = await getDb()
    await db.collection("exams").insertOne(doc)
    return NextResponse.json({ ok: true, data: doc })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}
