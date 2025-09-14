"use client"

import { useMemo, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { actions, useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, CheckCircle, XCircle, Users } from "lucide-react"

export default function TeacherAttendancePage() {
  const { teacherId } = useAuth()
  const d = useAppData()
  const teacher = d.teachers.find((t) => t.id === teacherId)
  const classId = teacher?.isClassTeacher ? teacher.classId : undefined
  const classInfo = d.classes.find((c) => c.id === classId)

  const students = useMemo(() => d.students.filter((s) => s.classId === classId), [d.students, classId])
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [present, setPresent] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-initialize all students as present by default
  useEffect(() => {
    const initialPresence: Record<string, boolean> = {}
    students.forEach(student => {
      initialPresence[student.id] = true
    })
    setPresent(initialPresence)
  }, [students])

  if (!classId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Access Restricted</p>
          <p className="text-sm text-muted-foreground">Only class teachers can mark attendance.</p>
        </CardContent>
      </Card>
    )
  }

  const submit = async () => {
    setIsSubmitting(true)
    try {
      await actions.setAttendance(classId!, date, present)
      // Show success feedback could be added here
    } catch (error) {
      console.error('Failed to submit attendance:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const presentCount = Object.values(present).filter(Boolean).length
  const absentCount = students.length - presentCount

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mark Attendance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Class: {classInfo?.name} {classInfo?.section} • Total Students: {students.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Present:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {presentCount}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Absent:</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {absentCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-center w-32">Status</TableHead>
                <TableHead className="text-center w-24">Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const isPresent = present[student.id] || false
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.rollNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={isPresent ? "default" : "destructive"}
                        className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={isPresent}
                        onCheckedChange={(checked) =>
                          setPresent((prev) => ({ ...prev, [student.id]: checked }))
                        }
                        aria-label={`Mark ${student.name} as ${isPresent ? "absent" : "present"}`}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={submit} 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
        >
          {isSubmitting ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
    </div>
  )
}
