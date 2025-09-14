import TimetableWrapper from "@/components/TimetableWrapper"

export default function TimetablePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timetable Management</h1>
      </div>
      
      <TimetableWrapper />
    </div>
  )
}