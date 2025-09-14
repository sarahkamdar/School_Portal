"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const periods = [1, 2, 3, 4, 5, 6]

type TimetableEntry = {
  subject: string
  teacher: string
  teacherId: string
}

type TimetableData = {
  [day: string]: {
    [period: string]: TimetableEntry
  }
}

interface TimetableClientProps {
  initialData: any[]
}

export function TimetableClient({ initialData }: TimetableClientProps) {
  console.log('[TimetableClient] Client component mounted')
  
  const d = useAppData()
  const { toast } = useToast()
  const [classId, setClassId] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [timetableData, setTimetableData] = useState<TimetableData>({})
  const [originalData, setOriginalData] = useState<TimetableData>({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize classId client-side to avoid hydration mismatch
  useEffect(() => {
    console.log('[TimetableClient] useEffect - Setting initial classId')
    if (d.classes.length > 0) {
      setClassId(d.classes[0].id)
    }
  }, [d.classes])

  // Initialize empty timetable structure
  const initializeEmptyTimetable = useCallback((): TimetableData => {
    console.log('[TimetableClient] Initializing empty timetable')
    const emptyTimetable: TimetableData = {}
    days.forEach(day => {
      emptyTimetable[day] = {}
      periods.forEach(period => {
        // Use stable keys instead of Math.random()
        emptyTimetable[day][period] = {
          subject: "",
          teacher: "",
          teacherId: `${day}-${period}-empty`
        }
      })
    })
    return emptyTimetable
  }, [])

  // Load timetable data for selected class
  useEffect(() => {
    console.log('[TimetableClient] useEffect - Loading timetable data for class:', classId)
    if (!classId) return

    const existingTimetable = initialData.find(t => t.classId === classId)
    if (existingTimetable && existingTimetable.timetable) {
      console.log('[TimetableClient] Found existing timetable data')
      setTimetableData(existingTimetable.timetable)
      setOriginalData(existingTimetable.timetable)
    } else {
      console.log('[TimetableClient] No existing data, initializing empty timetable')
      const emptyData = initializeEmptyTimetable()
      setTimetableData(emptyData)
      setOriginalData(emptyData)
    }
  }, [classId, initialData, initializeEmptyTimetable])

  // Handle cell value changes during editing
  const handleCellChange = useCallback((day: string, period: number, field: "subject" | "teacherId", value: string) => {
    console.log('[TimetableClient] Cell change:', day, period, field, value)
    setTimetableData(prev => {
      const updated = { ...prev }
      if (!updated[day]) updated[day] = {}
      if (!updated[day][period]) {
        updated[day][period] = { subject: "", teacher: "", teacherId: "" }
      }

      if (field === "teacherId") {
        const selectedTeacher = d.teachers.find(t => t.id === value)
        updated[day][period] = {
          ...updated[day][period],
          teacherId: value,
          teacher: selectedTeacher ? selectedTeacher.name : ""
        }
      } else {
        updated[day][period] = {
          ...updated[day][period],
          [field]: value
        }
      }
      
      return updated
    })
  }, [d.teachers])

  // Save timetable
  const handleSave = async () => {
    console.log('[TimetableClient] Saving timetable')
    if (!classId) return

    // Validate that at least one cell has data
    const hasData = Object.values(timetableData).some(dayData =>
      Object.values(dayData).some(entry => entry.subject.trim() !== "")
    )

    if (!hasData) {
      toast({
        title: "Validation Error",
        description: "Please add at least one subject to the timetable",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/timetable/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timetable: timetableData })
      })

      const result = await response.json()
      if (result.ok) {
        setIsEditing(false)
        setOriginalData(timetableData)
        toast({
          title: "Success",
          description: "Timetable saved successfully"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save timetable",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('[TimetableClient] Save error:', error)
      toast({
        title: "Error",
        description: "Failed to save timetable",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    console.log('[TimetableClient] Canceling edit')
    setTimetableData(originalData)
    setIsEditing(false)
  }

  // Get available subjects for the selected class
  const availableSubjects = useMemo(() => {
    return (d.subjects || []).filter(subject => subject.classId === classId)
  }, [d.subjects, classId])

  const selectedClass = d.classes.find(c => c.id === classId)

  if (!classId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p>Loading classes...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle>Class Timetable</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Class:</span>
                <Select
                  value={classId}
                  onValueChange={setClassId}
                  disabled={isEditing}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {d.classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedClass && (
                <span className="text-sm text-muted-foreground">
                  {selectedClass.section} • {selectedClass.academicYear}
                </span>
              )}
            </div>
          </div>

          {/* Edit/Save/Cancel buttons in top-right */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead className="w-16">Period</TableHead>
                  {days.map(day => (
                    <TableHead key={day} className="text-center min-w-40">
                      {day}
                    </TableHead>
                  ))}
                </tr>
              </TableHeader>
              <TableBody>
                {periods.map(period => (
                  <tr key={period}>
                    <TableCell className="font-medium text-center bg-muted/50">
                      {period}
                    </TableCell>
                    {days.map(day => {
                      const cellKey = `${day}-${period}`
                      const entry = timetableData[day]?.[period] || { subject: "", teacher: "", teacherId: "" }
                      
                      return (
                        <TableCell key={cellKey} className="p-2">
                          {isEditing ? (
                            <div className="space-y-1">
                              <Select
                                value={entry.subject}
                                onValueChange={(value) => handleCellChange(day, period, "subject", value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No Subject</SelectItem>
                                  {availableSubjects.map(subject => (
                                    <SelectItem key={subject.id} value={subject.name}>
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {entry.subject && (
                                <Select
                                  value={entry.teacherId}
                                  onValueChange={(value) => handleCellChange(day, period, "teacherId", value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select teacher" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">No Teacher</SelectItem>
                                    {d.teachers.map(teacher => (
                                      <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs">
                              {entry.subject && (
                                <>
                                  <div className="font-medium">{entry.subject}</div>
                                  {entry.teacher && (
                                    <div className="text-muted-foreground">{entry.teacher}</div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!selectedClass && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>No Class Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please select a class to view or edit its timetable.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}