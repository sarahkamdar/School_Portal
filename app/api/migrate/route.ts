import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST() {
  try {
    const db = await getDb()
    
    // Get all classes with embedded subjects and fees
    const classes = await db.collection("classes").find({}).toArray()
    
    for (const cls of classes) {
      // Migrate embedded subjects to subjects collection
      if (cls.subjects && Array.isArray(cls.subjects)) {
        for (const subjectName of cls.subjects) {
          const subjectId = `${cls.id}_${subjectName.replace(/\s+/g, '_').toLowerCase()}`
          await db.collection("subjects").updateOne(
            { id: subjectId },
            { 
              $set: { 
                id: subjectId,
                name: subjectName,
                code: subjectId.toUpperCase(),
                type: "Core",
                classId: cls.id
              } 
            },
            { upsert: true }
          )
        }
      }
      
      // Migrate embedded fees to fees collection
      if (cls.fees) {
        const feeTypes = ['exam', 'admission', 'term', 'utilities'] as const
        for (const feeType of feeTypes) {
          if (cls.fees[feeType]) {
            const feeId = `fee_${cls.id}_${feeType}`
            await db.collection("fees").updateOne(
              { id: feeId },
              { 
                $set: { 
                  id: feeId,
                  classId: cls.id,
                  type: feeType,
                  amount: cls.fees[feeType],
                  applicableGender: "Male" // Default from old system
                } 
              },
              { upsert: true }
            )
          }
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Migration completed successfully" })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Migration failed" }, { status: 500 })
  }
}