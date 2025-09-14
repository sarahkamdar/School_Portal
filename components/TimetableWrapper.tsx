import { TimetableClient } from "./TimetableClient"
import { getDb } from "@/lib/mongodb"

// Server component that fetches timetable data directly from database
async function fetchTimetableData() {
  try {
    console.log('[TimetableWrapper] Server - Fetching timetable data from database')
    const db = await getDb()
    const docs = await db.collection("classTimetables").find({}).toArray()
    
    // Convert MongoDB ObjectIds to strings for JSON serialization
    const serializedDocs = docs.map(doc => ({
      ...doc,
      _id: doc._id.toString()
    }))
    
    console.log(`[TimetableWrapper] Server - Found ${serializedDocs.length} timetable records`)
    return { ok: true, data: serializedDocs }
  } catch (error) {
    console.error('[TimetableWrapper] Server - Error fetching timetable data:', error)
    return { ok: false, data: [] }
  }
}

export default async function TimetableWrapper() {
  console.log('[TimetableWrapper] Server component rendering')
  
  const timetableData = await fetchTimetableData()
  
  return (
    <TimetableClient 
      initialData={timetableData.ok ? timetableData.data : []}
    />
  )
}