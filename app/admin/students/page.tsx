"use client"

import { useMemo, useState } from "react"
import { useAppData, actions } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

export default function StudentsPage() {
  const d = useAppData()
  
  // Extended form fields
  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male")
  const [dob, setDob] = useState("")
  const [classId, setClassId] = useState(d.classes[0]?.id || "")
  const [guardianName, setGuardianName] = useState("")
  const [guardianContact, setGuardianContact] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  
  // Filter states
  const [filterClass, setFilterClass] = useState<string>("all")
  const [q, setQ] = useState<string>("")

  const { toast } = useToast()

  // Validation
  const nameValid = /^[A-Za-z ]+$/.test(fullName.trim())
  const emailValid = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const phoneValid = guardianContact.trim() === "" || /^[\d\+\-\s\(\)]{10,}$/.test(guardianContact.trim())
  const canAdd = nameValid && fullName.trim() && classId && emailValid && phoneValid

  // Reset form function
  const resetForm = () => {
    setFullName("")
    setGender("Male")
    setDob("")
    setClassId(d.classes[0]?.id || "")
    setGuardianName("")
    setGuardianContact("")
    setAddress("")
    setEmail("")
  }

  // Submit function
  const handleSubmit = async () => {
    if (!canAdd) return
    
    try {
      await actions.addStudent({
        name: fullName.trim(),
        gender,
        dob: dob || undefined,
        classId,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianContact.trim() || undefined,
        address: address.trim() || undefined,
        email: email.trim() || undefined,
      })
      
      toast({
        title: "Success",
        description: "Student added successfully",
      })
      
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      })
    }
  }

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null)
  const [mode, setMode] = useState<"reassign" | "delete">("reassign")
  const [newClassForStudent, setNewClassForStudent] = useState<string>("")
  const [confirmPhrase, setConfirmPhrase] = useState("")

  const filtered = useMemo(() => {
    const byClass = d.students.filter((s) => (filterClass === "all" ? true : s.classId === filterClass))
    const query = q.trim().toLowerCase()
    if (!query) return byClass
    return byClass.filter((s) => {
      const byName = s.name.toLowerCase().includes(query)
      const byRoll = String(s.rollNo).includes(query)
      return byName || byRoll
    })
  }, [d.students, filterClass, q])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName"
                placeholder="Enter full name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
              />
              {fullName && !nameValid && (
                <p className="text-sm text-destructive">Name must contain only letters and spaces</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <UiSelect value={gender} onValueChange={(v) => setGender(v as "Male" | "Female" | "Other")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </UiSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input 
                id="dob"
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <UiSelect value={classId} onValueChange={(v) => setClassId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {d.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{`${c.name}-${c.section}`}</SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input 
                id="guardianName"
                placeholder="Guardian's full name" 
                value={guardianName} 
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <Input 
                id="guardianContact"
                placeholder="Phone number" 
                value={guardianContact} 
                onChange={(e) => setGuardianContact(e.target.value)}
              />
              {guardianContact && !phoneValid && (
                <p className="text-sm text-destructive">Please enter a valid phone number</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email"
                type="email"
                placeholder="student@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && !emailValid && (
                <p className="text-sm text-destructive">Please enter a valid email address</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address"
                placeholder="Full address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!canAdd}
            >
              Add Student
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
            >
              Clear Form
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
            <p>Note: Roll number and admission number will be auto-generated</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Students</CardTitle>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or roll no"
              className="w-full md:w-64"
            />
            <UiSelect value={filterClass} onValueChange={(v) => setFilterClass(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {d.classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{`${c.name}-${c.section}`}</SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const cls = d.classes.find((c) => c.id === s.classId)
                return (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>{cls ? `${cls.name}-${cls.section}` : "-"}</TableCell>
                    <TableCell>{s.rollNo}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{s.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium">Attendance</p>
                              <p className="text-muted-foreground">{Object.keys(s.attendance).length} days recorded</p>
                            </div>
                            <div>
                              <p className="font-medium">Marks</p>
                              {Object.entries(s.marks).length === 0 ? (
                                <p className="text-muted-foreground">No marks yet</p>
                              ) : (
                                <ul className="list-inside list-disc">
                                  {Object.entries(s.marks).map(([examId, m]) => (
                                    <li key={examId}>
                                      {examId}:{" "}
                                      {Object.entries(m.subjects)
                                        .map(([sub, val]) => `${sub} ${val}`)
                                        .join(", ")}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Fees</p>
                              <p className="text-muted-foreground">
                                Exam: {s.feesPaid.exam ? "Paid" : "Pending"}, Admission:{" "}
                                {s.feesPaid.admission ? "Paid" : "Pending"}, Term:{" "}
                                {s.feesPaid.term ? "Paid" : "Pending"}, Utilities:{" "}
                                {s.feesPaid.utilities ? "Paid" : "Pending"}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                                setTargetStudentId(s.id)
                                setMode("reassign")
                                setNewClassForStudent(d.classes.find((c) => c.id !== s.classId)?.id || "")
                                setConfirmPhrase("")
                                setDeleteOpen(true)
                              }}
                            >
                              Delete…
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delete Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This may remove attendance, fees, and results for this student. Choose an option:
                </p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="reassign"
                      type="radio"
                      checked={mode === "reassign"}
                      onChange={() => setMode("reassign")}
                    />
                    <Label htmlFor="reassign">Reassign to another class</Label>
                  </div>
                  {mode === "reassign" && (
                    <div className="pl-6">
                      <Label className="text-sm">New class</Label>
                      <UiSelect value={newClassForStudent} onValueChange={(v) => setNewClassForStudent(v)}>
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{`${c.name}-${c.section}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </UiSelect>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input id="delete" type="radio" checked={mode === "delete"} onChange={() => setMode("delete")} />
                    <Label htmlFor="delete">Delete permanently</Label>
                  </div>
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
                      confirmPhrase !== "DELETE" || !targetStudentId || (mode === "reassign" && !newClassForStudent)
                    }
                    onClick={async () => {
                      try {
                        if (!targetStudentId) return
                        if (mode === "reassign") {
                          await actions.reassignStudent(targetStudentId, newClassForStudent)
                          toast({
                            title: "Student reassigned",
                            description: "The student was moved to the selected class.",
                          })
                        } else {
                          await actions.deleteStudentPermanent(targetStudentId)
                          toast({
                            title: "Student deleted",
                            description: "The student and their records were removed.",
                          })
                        }
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
