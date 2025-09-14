import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const AssignSchema = z.object({
  classId: z.string().min(1),
  teacherId: z.string().min(1),
})

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection("classTeacherMappings").find({}).toArray()
    const data = docs.map((mapping: any) => ({
      id: mapping.id || mapping._id?.toString(),
      classId: mapping.classId,
      teacherId: mapping.teacherId,
      assignedAt: mapping.assignedAt,
    }))
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    console.warn("MongoDB not available for class-teacher mappings, using fallback data:", e.message)
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = AssignSchema.parse(await req.json())
    
    // Auto-generate ID and timestamp
    const id = `ct_${body.classId}_${body.teacherId}`
    const now = new Date().toISOString()
    
    const mappingData = {
      ...body,
      id,
      assignedAt: now
    }
    
    const db = await getDb()
    
    // Check if this class already has a teacher assigned
    const existingMapping = await db.collection("classTeacherMappings").findOne({ classId: body.classId })
    
    if (existingMapping) {
      // If replacing an existing teacher, remove isClassTeacher flag from the old teacher
      if (existingMapping.teacherId !== body.teacherId) {
        await db.collection("teachers").updateOne(
          { id: existingMapping.teacherId },
          { $unset: { isClassTeacher: "", classId: "" } }
        )
      }
      
      // Update existing mapping
      await db.collection("classTeacherMappings").updateOne(
        { classId: body.classId },
        { $set: mappingData }
      )
    } else {
      // Create new mapping
      await db.collection("classTeacherMappings").insertOne(mappingData)
    }
    
    // Update the teacher record with isClassTeacher flag and classId
    await db.collection("teachers").updateOne(
      { id: body.teacherId },
      { $set: { isClassTeacher: true, classId: body.classId } }
    )
    
    return NextResponse.json({ ok: true, data: mappingData })
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    
    if (!classId) {
      return NextResponse.json({ ok: false, error: "classId is required" }, { status: 400 })
    }
    
    const db = await getDb()
    
    // Find the existing mapping to get the teacher ID
    const existingMapping = await db.collection("classTeacherMappings").findOne({ classId })
    
    if (existingMapping) {
      // Remove isClassTeacher flag from the teacher record
      await db.collection("teachers").updateOne(
        { id: existingMapping.teacherId },
        { $unset: { isClassTeacher: "", classId: "" } }
      )
    }
    
    // Delete the class-teacher mapping
    await db.collection("classTeacherMappings").deleteOne({ classId })
    
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 })
  }
}