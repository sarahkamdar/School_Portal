"use client"

import { useState } from "react"
import { useAppData, actions } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export default function ClassesPage() {
  const d = useAppData()
  
  // Class form fields
  const [className, setClassName] = useState("")
  const [section, setSection] = useState("")
  
  // Subject form fields
  const [subject, setSubject] = useState("")
  const [selectedClass, setSelectedClass] = useState<string | null>(d.classes[0]?.id || null)
  
  // Fee form fields
  const [selectedFeeClass, setSelectedFeeClass] = useState<string | null>(d.classes[0]?.id || null)
  const [feeType, setFeeType] = useState<"admission" | "education" | "exam" | "term" | "utilities" | "other">("exam")
  const [feeAmount, setFeeAmount] = useState<number>(0)
  const [feeGender, setFeeGender] = useState<"Male" | "Female" | "Both">("Both")
  const [feeDueDate, setFeeDueDate] = useState("")

  // Assign Teacher form fields
  const [assignClass, setAssignClass] = useState<string | null>(d.classes[0]?.id || null)
  const [assignTeacher, setAssignTeacher] = useState<string | null>(null)

  const { toast } = useToast()

  // Validation
  const classNameValid = /^[A-Za-z0-9\s]+$/.test(className.trim())
  const sectionValid = section.trim() === "" || /^[A-Za-z0-9\s]+$/.test(section.trim())
  const canAddClass = classNameValid && className.trim().length > 0 && sectionValid

  // Reset class form
  const resetClassForm = () => {
    setClassName("")
    setSection("")
  }

  // Submit class function
  const handleSubmitClass = async () => {
    if (!canAddClass) return
    
    try {
      await actions.addClass({ 
        name: className.trim(), 
        section: section.trim() || undefined 
      })
      
      toast({
        title: "Success",
        description: "Class added successfully",
      })
      
      resetClassForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add class",
        variant: "destructive",
      })
    }
  }

  // Reset subject form
  const resetSubjectForm = () => {
    setSubject("")
    setSelectedClass(d.classes[0]?.id || null)
  }

  // Submit subject function
  const handleSubmitSubject = async () => {
    if (!selectedClass || !subject.trim()) return
    
    try {
      await actions.addSubject({ name: subject.trim(), classId: selectedClass })
      
      toast({
        title: "Success",
        description: "Subject added successfully",
      })
      
      resetSubjectForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive",
      })
    }
  }

  // Reset fee form
  const resetFeeForm = () => {
    setSelectedFeeClass(d.classes[0]?.id || null)
    setFeeType("exam")
    setFeeAmount(0)
    setFeeGender("Both")
    setFeeDueDate("")
  }

  // Submit fee function
  const handleSubmitFee = async () => {
    if (!selectedFeeClass || !feeAmount || feeAmount <= 0) return
    
    try {
      await actions.addFee({ 
        classId: selectedFeeClass, 
        type: feeType, 
        amount: feeAmount, 
        applicableGender: feeGender,
        dueDate: feeDueDate || undefined
      })
      
      toast({
        title: "Success",
        description: "Fee added successfully",
      })
      
      resetFeeForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fee",
        variant: "destructive",
      })
    }
  }

  // Reset assign teacher form
  const resetAssignTeacherForm = () => {
    setAssignClass(d.classes[0]?.id || null)
    setAssignTeacher(null)
  }

  // Submit assign teacher function
  const handleAssignTeacher = async () => {
    if (!assignClass || !assignTeacher) return
    
    try {
      await actions.assignTeacherToClass(assignClass, assignTeacher)
      
      toast({
        title: "Success",
        description: "Teacher assigned to class successfully",
      })
      
      resetAssignTeacherForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign teacher",
        variant: "destructive",
      })
    }
  }

  // Unassign teacher function
  const handleUnassignTeacher = async (classId: string) => {
    try {
      await actions.unassignTeacherFromClass(classId)
      
      toast({
        title: "Success",
        description: "Teacher unassigned from class",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign teacher",
        variant: "destructive",
      })
    }
  }

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [targetClassId, setTargetClassId] = useState<string | null>(null)
  const [studentMode, setStudentMode] = useState<"reassign" | "delete">("reassign")
  const [newClassForStudents, setNewClassForStudents] = useState<string>("")
  const [teacherMode, setTeacherMode] = useState<"unassign" | "delete">("unassign")
  const [confirmPhrase, setConfirmPhrase] = useState("")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Add Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name *</Label>
            <Input 
              id="className"
              placeholder="e.g., 10, Grade 5, Kindergarten" 
              value={className} 
              onChange={(e) => setClassName(e.target.value)}
            />
            {className && !classNameValid && (
              <p className="text-sm text-destructive">Class name must contain only letters, numbers, and spaces</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section (Optional)</Label>
            <Input 
              id="section"
              placeholder="e.g., A, B, C, Alpha, Beta" 
              value={section} 
              onChange={(e) => setSection(e.target.value)}
            />
            {section && !sectionValid && (
              <p className="text-sm text-destructive">Section must contain only letters, numbers, and spaces</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitClass}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!canAddClass}
            >
              Add Class
            </Button>
            <Button
              variant="outline"
              onClick={resetClassForm}
            >
              Clear
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
            <p>Note: Class ID will be auto-generated based on name and section</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Subject Name</label>
            <Input 
              placeholder="e.g., Mathematics, English, Physics" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium">Class</label>
            <Select value={selectedClass ?? ""} onValueChange={(v) => setSelectedClass(v)}>
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
          <div className="flex gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedClass || !subject.trim()}
              onClick={handleSubmitSubject}
            >
              Add Subject
            </Button>
            <Button
              variant="outline"
              onClick={resetSubjectForm}
            >
              Clear
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Current subjects for selected class: {selectedClass ? (d.subjects || []).filter((s) => s.classId === selectedClass).map((s) => s.name).join(", ") || "None" : "Select a class"}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Add Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feeClass">Class *</Label>
            <Select value={selectedFeeClass ?? ""} onValueChange={(v) => setSelectedFeeClass(v)}>
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
            <Label htmlFor="feeType">Fee Type *</Label>
            <Select value={feeType} onValueChange={(v) => setFeeType(v as typeof feeType)}>
              <SelectTrigger>
                <SelectValue placeholder="Fee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="term">Term</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feeAmount">Amount *</Label>
            <Input
              id="feeAmount"
              type="number"
              placeholder="Enter fee amount"
              value={feeAmount || ""}
              onChange={(e) => setFeeAmount(Number(e.target.value))}
              min="0"
              step="1"
            />
          </div>

          <div className="space-y-3">
            <Label>Applicable Gender *</Label>
            <RadioGroup value={feeGender} onValueChange={(v) => setFeeGender(v as typeof feeGender)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="boys" />
                <Label htmlFor="boys">Boys</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="girls" />
                <Label htmlFor="girls">Girls</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Both" id="both" />
                <Label htmlFor="both">Both</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={feeDueDate}
              onChange={(e) => setFeeDueDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedFeeClass || !feeAmount || feeAmount <= 0}
              onClick={handleSubmitFee}
            >
              Add Fee
            </Button>
            <Button
              variant="outline"
              onClick={resetFeeForm}
            >
              Clear
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
            <p>Current fees for selected class: {selectedFeeClass ? (d.fees || []).filter((f) => f.classId === selectedFeeClass).map((f) => `${f.type}(₹${f.amount})`).join(", ") || "None" : "Select a class"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Assign Teacher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignClass">Class *</Label>
              <Select value={assignClass ?? ""} onValueChange={(v) => setAssignClass(v)}>
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
              <Label htmlFor="assignTeacher">Teacher *</Label>
              <Select value={assignTeacher ?? ""} onValueChange={(v) => setAssignTeacher(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {d.teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!assignClass || !assignTeacher}
              onClick={handleAssignTeacher}
            >
              Assign Teacher
            </Button>
            <Button
              variant="outline"
              onClick={resetAssignTeacherForm}
            >
              Clear
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
          </div>

          {/* Current Assignments Table */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Current Teacher Assignments</h4>
            {d.classTeacherMappings && d.classTeacherMappings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.classTeacherMappings.map((mapping: { classId: string; teacherId: string }) => {
                    const classInfo = d.classes.find(c => c.id === mapping.classId);
                    const teacherInfo = d.teachers.find(t => t.id === mapping.teacherId);
                    return (
                      <TableRow key={mapping.classId}>
                        <TableCell>
                          {classInfo ? `${classInfo.name}-${classInfo.section}` : 'Unknown Class'}
                        </TableCell>
                        <TableCell>{teacherInfo?.name || 'Unknown Teacher'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignTeacher(mapping.classId)}
                          >
                            Unassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No teacher assignments found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.section}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(d.subjects || []).filter((s) => s.classId === c.id).map((s) => s.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setTargetClassId(c.id)
                            setStudentMode("reassign")
                            setTeacherMode("unassign")
                            setConfirmPhrase("")
                            setNewClassForStudents(d.classes.find((x) => x.id !== c.id)?.id || "")
                            setDeleteOpen(true)
                          }}
                        >
                          Delete…
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Class Delete Dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Delete Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Deleting a class may affect students, teachers, timetables, exams, results, and attendance.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Students in this class</p>
                  <div className="flex items-center gap-2">
                    <input
                      id="c-reassign"
                      type="radio"
                      checked={studentMode === "reassign"}
                      onChange={() => setStudentMode("reassign")}
                    />
                    <Label htmlFor="c-reassign">Reassign to another class</Label>
                  </div>
                  {studentMode === "reassign" && (
                    <div className="pl-6">
                      <Label className="text-sm">New class</Label>
                      <Select value={newClassForStudents} onValueChange={(v) => setNewClassForStudents(v)}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.classes.map((x) => (
                            <SelectItem key={x.id} value={x.id} disabled={x.id === targetClassId}>
                              {x.name}-{x.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      id="c-delete-stu"
                      type="radio"
                      checked={studentMode === "delete"}
                      onChange={() => setStudentMode("delete")}
                    />
                    <Label htmlFor="c-delete-stu">Delete all students in this class</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Teachers assigned to this class</p>
                  <div className="flex items-center gap-2">
                    <input
                      id="c-unassign"
                      type="radio"
                      checked={teacherMode === "unassign"}
                      onChange={() => setTeacherMode("unassign")}
                    />
                    <Label htmlFor="c-unassign">Unassign class teachers from this class</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="c-delete-te"
                      type="radio"
                      checked={teacherMode === "delete"}
                      onChange={() => setTeacherMode("delete")}
                    />
                    <Label htmlFor="c-delete-te">Delete class teachers of this class</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Timetable entries and exams for this class will be removed automatically.
                  </p>
                </div>

                <div>
                  <Label className="text-sm">Type DELETE to confirm</Label>
                  <Input
                    value={confirmPhrase}
                    onChange={(e) => setConfirmPhrase(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={
                      confirmPhrase !== "DELETE" ||
                      !targetClassId ||
                      (studentMode === "reassign" && (!newClassForStudents || newClassForStudents === targetClassId))
                    }
                    onClick={async () => {
                      try {
                        if (!targetClassId) return
                        await actions.deleteClass(targetClassId, {
                          reassignStudentsTo: studentMode === "reassign" ? newClassForStudents : null,
                          deleteStudents: studentMode === "delete",
                          unassignTeachers: teacherMode === "unassign",
                          deleteTeachers: teacherMode === "delete",
                        })
                        toast({ title: "Class deleted", description: "Related timetables and exams were removed." })
                        setDeleteOpen(false)
                      } catch (e: any) {
                        toast({
                          title: "Action failed",
                          description: e?.message || "Please try again.",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
