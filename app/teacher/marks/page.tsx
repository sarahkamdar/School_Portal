"use client"

import { useMemo, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpenCheck, AlertCircle, Check } from "lucide-react"

export default function EnterMarksPage() {
  const { teacherId } = useAuth()
  const d = useAppData()
  
  // Get current teacher info
  const teacher = useMemo(() => d.teachers.find((t) => t.id === teacherId), [d.teachers, teacherId])
  
  // Form states
  const [examId, setExamId] = useState<string>("")
  const [classId, setClassId] = useState<string>("")
  const [subjectId, setSubjectId] = useState<string>("")
  const [marks, setMarks] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Get teacher's subjects (from their expertise or assigned subjects)
  const teacherSubjects = useMemo(() => {
    if (!teacher) return []
    return d.subjects?.filter(subject => {
      // Check if teacher teaches this subject (can be by expertise or assigned classes)
      const teacherExpertise = teacher.expertise || []
      const teacherSubject = teacher.subject || ""
      return teacherExpertise.includes(subject.name) || 
             teacherSubject === subject.name ||
             (teacher.classId && subject.classId === teacher.classId)
    }) || []
  }, [teacher, d.subjects])

  // Get exams for the selected class
  const availableExams = useMemo(() => {
    if (!classId) return []
    return d.exams.filter(exam => exam.classId === classId)
  }, [d.exams, classId])

  // Get subjects for the selected class, filtered by teacher's subjects
  const availableSubjects = useMemo(() => {
    if (!classId) return []
    const classSubjects = d.subjects?.filter(subject => subject.classId === classId) || []
    // Filter to only include subjects the teacher can teach
    return classSubjects.filter(subject => 
      teacherSubjects.some(ts => ts.name === subject.name)
    )
  }, [d.subjects, classId, teacherSubjects])

  // Get students for the selected class
  const students = useMemo(() => {
    if (!classId) return []
    return d.students.filter((s) => s.classId === classId).sort((a, b) => a.rollNo - b.rollNo)
  }, [d.students, classId])

  // Get selected exam details
  const selectedExam = useMemo(() => {
    return d.exams.find(exam => exam.id === examId)
  }, [d.exams, examId])

  // Get selected subject details
  const selectedSubject = useMemo(() => {
    return d.subjects?.find(subject => subject.id === subjectId)
  }, [d.subjects, subjectId])

  // Reset dependent dropdowns when parent selections change
  useEffect(() => {
    setExamId("")
    setMarks({})
  }, [classId])

  useEffect(() => {
    setMarks({})
  }, [examId, subjectId])

  // Load existing marks for the selected exam and subject
  useEffect(() => {
    if (examId && subjectId && students.length > 0) {
      const existingMarks: Record<string, number> = {}
      students.forEach(student => {
        const studentMarks = student.marks[examId]
        if (studentMarks && selectedSubject) {
          const subjectMark = studentMarks.subjects[selectedSubject.name]
          if (subjectMark !== undefined) {
            existingMarks[student.id] = subjectMark
          }
        }
      })
      setMarks(existingMarks)
    }
  }, [examId, subjectId, students, selectedSubject])

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    const maxMarks = selectedExam?.totalMarks || 100
    
    // Validate marks range
    if (numValue < 0 || numValue > maxMarks) return
    
    setMarks(prev => ({
      ...prev,
      [studentId]: numValue
    }))
  }

  const handleSaveMarks = async () => {
    if (!examId || !selectedSubject || !selectedExam) {
      alert("Please select exam and subject first")
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      // Save marks for each student
      for (const student of students) {
        const studentMark = marks[student.id] || 0
        
        const response = await fetch(`/api/marks/${encodeURIComponent(student.id)}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            examId,
            subject: selectedSubject.name,
            score: studentMark,
            total: selectedExam.totalMarks || 100
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to save marks for ${student.name}`)
        }
      }

      setSuccess(true)
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving marks:", error)
      alert(`Failed to save marks: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = examId && classId && subjectId && students.length > 0
  const maxMarks = selectedExam?.totalMarks || 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpenCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Enter Marks</h1>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam, Class & Subject</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {/* Class Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Class</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {d.classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.section && `- ${cls.section}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Exam</label>
            <Select 
              value={examId} 
              onValueChange={setExamId}
              disabled={!classId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} {exam.totalMarks && `(${exam.totalMarks} marks)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Select 
              value={subjectId} 
              onValueChange={setSubjectId}
              disabled={!classId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Marks have been saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Teacher Info */}
      {teacher && teacherSubjects.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No subjects assigned to you. Please contact admin to assign subjects.
          </AlertDescription>
        </Alert>
      )}

      {/* Students Marks Entry */}
      {isFormValid && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Enter Marks for Students</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedExam?.name} - {selectedSubject?.name} (Max: {maxMarks} marks)
              </p>
            </div>
            <Button 
              onClick={handleSaveMarks}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save All Marks"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks (out of {maxMarks})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.rollNo}
                      </TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={maxMarks}
                          className="w-24"
                          value={marks[student.id] || ""}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No students message */}
      {classId && students.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No students found in the selected class.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}