"use client"

import { useMemo, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { FileDown, AlertCircle, ChartBar, GraduationCap } from "lucide-react"

export default function ViewResultsPage() {
  const { teacherId } = useAuth()
  const d = useAppData()
  
  // Get current teacher info
  const teacher = useMemo(() => d.teachers.find((t) => t.id === teacherId), [d.teachers, teacherId])
  
  // Form states
  const [examId, setExamId] = useState<string>("")
  const [classId, setClassId] = useState<string>("")
  
  // Print reference for marksheet
  const printRef = useRef<HTMLDivElement>(null)

  // Get classes that the teacher can view (class teacher's class + any classes they teach)
  const availableClasses = useMemo(() => {
    if (!teacher) return []
    
    const classes = new Set<string>()
    
    // Add class teacher's class
    if (teacher.isClassTeacher && teacher.classId) {
      classes.add(teacher.classId)
    }
    
    // Add classes where teacher teaches subjects
    d.subjects?.forEach(subject => {
      if (teacher.expertise?.includes(subject.name) || teacher.subject === subject.name) {
        classes.add(subject.classId)
      }
    })
    
    return d.classes.filter(cls => classes.has(cls.id))
  }, [teacher, d.classes, d.subjects])

  // Get exams for the selected class
  const availableExams = useMemo(() => {
    if (!classId) return []
    return d.exams.filter(exam => exam.classId === classId)
  }, [d.exams, classId])

  // Get students for the selected class
  const students = useMemo(() => {
    if (!classId) return []
    return d.students
      .filter(s => s.classId === classId)
      .sort((a, b) => a.rollNo - b.rollNo)
  }, [d.students, classId])

  // Get subjects for the selected class
  const classSubjects = useMemo(() => {
    if (!classId) return []
    return d.subjects?.filter(subject => subject.classId === classId) || []
  }, [d.subjects, classId])

  // Get selected exam details
  const selectedExam = useMemo(() => {
    return d.exams.find(exam => exam.id === examId)
  }, [d.exams, examId])

  // Get selected class details
  const selectedClass = useMemo(() => {
    return d.classes.find(cls => cls.id === classId)
  }, [d.classes, classId])

  // Process student results for the selected exam
  const processedResults = useMemo(() => {
    if (!examId || !classId) return []
    
    return students.map(student => {
      const examMarks = student.marks[examId]
      const subjectMarks: Record<string, number> = {}
      let totalObtained = 0
      let subjectsWithMarks = 0
      
      if (examMarks) {
        // Get marks for each subject
        classSubjects.forEach(subject => {
          const mark = examMarks.subjects[subject.name]
          if (mark !== undefined) {
            subjectMarks[subject.name] = mark
            totalObtained += mark
            subjectsWithMarks++
          }
        })
      }
      
      const totalPossible = (selectedExam?.totalMarks || 100) * classSubjects.length
      const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0
      
      // Determine grade based on percentage
      let grade = "F"
      if (percentage >= 90) grade = "A+"
      else if (percentage >= 80) grade = "A"
      else if (percentage >= 70) grade = "B+"
      else if (percentage >= 60) grade = "B"
      else if (percentage >= 50) grade = "C+"
      else if (percentage >= 40) grade = "C"
      else if (percentage >= 33) grade = "D"

      return {
        student,
        subjectMarks,
        totalObtained,
        totalPossible,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        hasMarks: subjectsWithMarks > 0
      }
    })
  }, [students, examId, classId, classSubjects, selectedExam])

  // Calculate class statistics
  const classStats = useMemo(() => {
    const studentsWithMarks = processedResults.filter(r => r.hasMarks)
    if (studentsWithMarks.length === 0) return null
    
    const totalStudents = studentsWithMarks.length
    const averagePercentage = studentsWithMarks.reduce((sum, r) => sum + r.percentage, 0) / totalStudents
    const highestPercentage = Math.max(...studentsWithMarks.map(r => r.percentage))
    const lowestPercentage = Math.min(...studentsWithMarks.map(r => r.percentage))
    const passCount = studentsWithMarks.filter(r => r.percentage >= 33).length
    const passPercentage = (passCount / totalStudents) * 100

    return {
      totalStudents,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      highestPercentage,
      lowestPercentage,
      passCount,
      passPercentage: Math.round(passPercentage * 100) / 100
    }
  }, [processedResults])

  // Download/Print functionality
  const downloadMarksheet = () => {
    if (!printRef.current) return
    
    const printWindow = window.open("", "_blank", "width=1200,height=800")
    if (!printWindow) {
      alert("Please allow pop-ups to download the marksheet")
      return
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Marksheet - ${selectedClass?.name} ${selectedClass?.section} - ${selectedExam?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .school-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .marksheet-title { font-size: 18px; margin-bottom: 20px; }
          .class-info { font-size: 14px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #333; padding: 8px; text-align: center; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .student-name { text-align: left; }
          .stats { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .stat-title { font-weight: bold; margin-bottom: 10px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printRef.current.innerHTML}
      </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    
    // Trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const isDataReady = examId && classId && processedResults.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">View Results</h1>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Exam</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* Class Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Class</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.section && `- ${cls.section}`}
                    {teacher?.isClassTeacher && teacher?.classId === cls.id && (
                      <Badge variant="secondary" className="ml-2 text-xs">Class Teacher</Badge>
                    )}
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
        </CardContent>
      </Card>

      {/* No access message */}
      {availableClasses.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have access to any classes. Please contact admin if you are a class teacher or teach any subjects.
          </AlertDescription>
        </Alert>
      )}

      {/* Class Statistics */}
      {isDataReady && classStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5" />
              Class Performance Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{classStats.averagePercentage}%</div>
                <div className="text-sm text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{classStats.highestPercentage}%</div>
                <div className="text-sm text-muted-foreground">Highest</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{classStats.passPercentage}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {isDataReady && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student Results</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedClass?.name} {selectedClass?.section && `- ${selectedClass.section}`} | {selectedExam?.name}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={downloadMarksheet}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download Marksheet
            </Button>
          </CardHeader>
          <CardContent>
            {/* Printable content */}
            <div ref={printRef}>
              {/* Header for print */}
              <div className="header hidden print:block">
                <div className="school-name">School Portal</div>
                <div className="marksheet-title">Student Marksheet</div>
                <div className="class-info">
                  Class: {selectedClass?.name} {selectedClass?.section && `- ${selectedClass.section}`} | 
                  Exam: {selectedExam?.name} | 
                  Total Marks: {selectedExam?.totalMarks || 100} per subject
                </div>
              </div>
              
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      {classSubjects.map(subject => (
                        <TableHead key={subject.id} className="text-center">
                          {subject.name}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            ({selectedExam?.totalMarks || 100})
                          </span>
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedResults.map(({ student, subjectMarks, totalObtained, totalPossible, percentage, grade, hasMarks }) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-center font-medium">
                          {student.rollNo}
                        </TableCell>
                        <TableCell className="student-name">{student.name}</TableCell>
                        {classSubjects.map(subject => (
                          <TableCell key={subject.id} className="text-center">
                            {subjectMarks[subject.name] !== undefined ? (
                              <span className={subjectMarks[subject.name] < (selectedExam?.passingMarks || 33) ? "text-red-600" : "text-green-600"}>
                                {subjectMarks[subject.name]}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">
                          {hasMarks ? `${totalObtained}/${totalPossible}` : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasMarks ? (
                            <span className={percentage < 33 ? "text-red-600" : "text-green-600"}>
                              {percentage}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasMarks ? (
                            <Badge variant={grade === "F" ? "destructive" : "secondary"}>
                              {grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Statistics for print */}
              {classStats && (
                <div className="stats hidden print:block">
                  <div className="stat-card">
                    <div className="stat-title">Performance Summary</div>
                    <div>Total Students: {classStats.totalStudents}</div>
                    <div>Class Average: {classStats.averagePercentage}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Pass/Fail Analysis</div>
                    <div>Students Passed: {classStats.passCount}</div>
                    <div>Pass Percentage: {classStats.passPercentage}%</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {classId && examId && processedResults.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No students found in the selected class.
          </AlertDescription>
        </Alert>
      )}

      {/* No marks entered message */}
      {isDataReady && processedResults.every(r => !r.hasMarks) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No marks have been entered for this exam yet. Please use the "Enter Marks" page to add student marks.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}