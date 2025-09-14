"use client"

import { useState } from "react"
import { useAppData, actions } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ExamsPage() {
  const d = useAppData()
  
  // Exam form fields
  const [examName, setExamName] = useState("")
  const [classId, setClassId] = useState<string | null>(d.classes[0]?.id || null)
  const [totalMarks, setTotalMarks] = useState<number>(100)
  const [passingMarks, setPassingMarks] = useState<number>(40)
  
  const { toast } = useToast()
  
  // Validation
  const examNameValid = examName.trim().length > 0
  const totalMarksValid = totalMarks > 0 && totalMarks <= 1000
  const passingMarksValid = passingMarks >= 0 && passingMarks <= totalMarks
  const canCreateExam = examNameValid && classId && totalMarksValid && passingMarksValid

  // Reset exam form
  const resetExamForm = () => {
    setExamName("")
    setClassId(d.classes[0]?.id || null)
    setTotalMarks(100)
    setPassingMarks(40)
  }

  // Submit exam function
  const handleSubmitExam = async () => {
    if (!canCreateExam) return
    
    try {
      await actions.createExam({ 
        classId: classId!, 
        name: examName.trim(), 
        totalMarks, 
        passingMarks 
      })
      
      toast({
        title: "Success",
        description: "Exam created successfully",
      })
      
      resetExamForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      })
    }
  }

  const exams = d.exams

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examName">Exam Name *</Label>
            <Input 
              id="examName"
              placeholder="e.g., Mid-term, Final, Unit Test 1" 
              value={examName} 
              onChange={(e) => setExamName(e.target.value)} 
            />
            {examName && !examNameValid && (
              <p className="text-sm text-destructive">Exam name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="examClass">Class *</Label>
            <Select value={classId ?? ""} onValueChange={(v) => setClassId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {d.classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{`${c.name}-${c.section}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalMarks">Total Marks *</Label>
            <Input
              id="totalMarks"
              type="number"
              placeholder="e.g., 100, 50, 200"
              value={totalMarks || ""}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              min="1"
              max="1000"
            />
            {!totalMarksValid && (
              <p className="text-sm text-destructive">Total marks must be between 1 and 1000</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingMarks">Passing Marks *</Label>
            <Input
              id="passingMarks"
              type="number"
              placeholder="e.g., 40, 33, 60"
              value={passingMarks || ""}
              onChange={(e) => setPassingMarks(Number(e.target.value))}
              min="0"
              max={totalMarks}
            />
            {!passingMarksValid && (
              <p className="text-sm text-destructive">Passing marks must be between 0 and total marks</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!canCreateExam}
              onClick={handleSubmitExam}
            >
              Create Exam
            </Button>
            <Button
              variant="outline"
              onClick={resetExamForm}
            >
              Clear
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
            <p>Note: Exam ID will be auto-generated based on class and timestamp</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exams Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Passing Marks</TableHead>
                <TableHead>Students with Results</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((ex) => {
                const cls = d.classes.find((c) => c.id === ex.classId)
                const count = d.students.filter((s) => s.classId === ex.classId && s.marks[ex.id]).length
                return (
                  <TableRow key={ex.id}>
                    <TableCell className="font-medium">{ex.name}</TableCell>
                    <TableCell>{cls ? `${cls.name}-${cls.section}` : "-"}</TableCell>
                    <TableCell>{ex.totalMarks || ex.totalPerSubject}</TableCell>
                    <TableCell>{ex.passingMarks !== undefined && ex.passingMarks !== null ? ex.passingMarks : "-"}</TableCell>
                    <TableCell>{count}</TableCell>
                  </TableRow>
                )
              })}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No exams created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
