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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function TeachersPage() {
  const d = useAppData()
  
  // Extended form fields
  const [fullName, setFullName] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male")
  const [dob, setDob] = useState("")
  const [qualification, setQualification] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [isAutoPassword, setIsAutoPassword] = useState(true)
  const [isCT, setIsCT] = useState<"no" | "yes">("no")
  const [classId, setClassId] = useState<string | undefined>(undefined)
  
  const { toast } = useToast()

  // Validation
  const nameValid = /^[A-Za-z ]+$/.test(fullName.trim())
  const emailValid = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const phoneValid = contact.trim() === "" || /^[\d\+\-\s\(\)]{10,}$/.test(contact.trim())
  const canAdd = nameValid && fullName.trim() && emailValid && phoneValid

  // Reset form function
  const resetForm = () => {
    setFullName("")
    setTeacherId("")
    setGender("Male")
    setDob("")
    setQualification("")
    setContact("")
    setEmail("")
    setAddress("")
    setPassword("")
    setIsAutoPassword(true)
    setIsCT("no")
    setClassId(undefined)
  }

  // Submit function
  const handleSubmit = async () => {
    if (!canAdd) return
    
    try {
      await actions.addTeacher({
        name: fullName.trim(),
        id: teacherId.trim() || undefined,
        gender,
        dob: dob || undefined,
        qualification: qualification.trim() || undefined,
        contactNumber: contact.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        password: isAutoPassword ? undefined : password.trim(),
        isClassTeacher: isCT === "yes",
        classId: isCT === "yes" ? classId : undefined,
      })
      
      toast({
        title: "Success",
        description: "Teacher added successfully",
      })
      
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive",
      })
    }
  }

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [targetTeacherId, setTargetTeacherId] = useState<string | null>(null)
  const [choice, setChoice] = useState<"unassign" | "reassign" | "delete">("unassign")
  const [reassignTo, setReassignTo] = useState<string>("")
  const [confirmPhrase, setConfirmPhrase] = useState("")

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Teacher</CardTitle>
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
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input 
                id="teacherId"
                placeholder="Auto-generated if empty" 
                value={teacherId} 
                onChange={(e) => setTeacherId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave empty for auto-generation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as "Male" | "Female" | "Other")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="qualification">Qualification</Label>
              <Input 
                id="qualification"
                placeholder="e.g., M.Sc., B.Ed." 
                value={qualification} 
                onChange={(e) => setQualification(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input 
                id="contact"
                placeholder="Phone number" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)}
              />
              {contact && !phoneValid && (
                <p className="text-sm text-destructive">Please enter a valid phone number</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="teacher@example.com" 
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

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoPassword"
                  checked={isAutoPassword}
                  onCheckedChange={(checked) => setIsAutoPassword(!!checked)}
                />
                <Label htmlFor="autoPassword">Auto-generate password</Label>
              </div>
              {!isAutoPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Enter password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Class Teacher Assignment</Label>
              <Select value={isCT} onValueChange={(v) => setIsCT(v as "no" | "yes")}>
                <SelectTrigger>
                  <SelectValue placeholder="Is Class Teacher?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCT === "yes" && (
              <div className="space-y-2">
                <Label>Assign Class</Label>
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
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!canAdd}
            >
              Add Teacher
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
            <p>Note: Teacher ID and password will be auto-generated if not provided</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Teacher ID", "Email", "Class Teacher", "Actions"].map((label) => (
                  <TableHead key={label}>{label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.teachers.map((t) => {
                const cells = [
                  <TableCell key="name">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      {t.qualification && <div className="text-sm text-muted-foreground">{t.qualification}</div>}
                    </div>
                  </TableCell>,
                  <TableCell key="id">{t.id}</TableCell>,
                  <TableCell key="email">{t.email || "—"}</TableCell>,
                  <TableCell key="ct">{t.isClassTeacher ? `Yes (${t.classId})` : "No"}</TableCell>,
                  <TableCell key="actions">
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
                            setTargetTeacherId(t.id)
                            setChoice("unassign")
                            setReassignTo(d.teachers.find((x) => x.id !== t.id)?.id || "")
                            setConfirmPhrase("")
                            setDeleteOpen(true)
                          }}
                        >
                          Delete…
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>,
                ]
                return <TableRow key={t.id}>{cells}</TableRow>
              })}
            </TableBody>
          </Table>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delete Teacher</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose what to do with this teacher’s assignments and timetable entries:
                </p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="t-unassign"
                      type="radio"
                      checked={choice === "unassign"}
                      onChange={() => setChoice("unassign")}
                    />
                    <Label htmlFor="t-unassign">Unassign from all classes and remove timetable entries</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="t-reassign"
                      type="radio"
                      checked={choice === "reassign"}
                      onChange={() => setChoice("reassign")}
                    />
                    <Label htmlFor="t-reassign">Reassign all timetable entries to another teacher</Label>
                  </div>
                  {choice === "reassign" && (
                    <div className="pl-6">
                      <Label className="text-sm">Reassign to</Label>
                      <Select value={reassignTo} onValueChange={(v) => setReassignTo(v)}>
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.teachers.map((x) => (
                            <SelectItem key={x.id} value={x.id} disabled={x.id === targetTeacherId}>
                              {x.name} ({x.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      id="t-delete"
                      type="radio"
                      checked={choice === "delete"}
                      onChange={() => setChoice("delete")}
                    />
                    <Label htmlFor="t-delete">Delete permanently</Label>
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
                    disabled={confirmPhrase !== "DELETE" || !targetTeacherId || (choice === "reassign" && !reassignTo)}
                    onClick={async () => {
                      try {
                        if (!targetTeacherId) return
                        if (choice === "unassign") {
                          await actions.unassignTeacher(targetTeacherId)
                          await actions.deleteTeacherPermanent(targetTeacherId)
                          toast({
                            title: "Teacher deleted",
                            description: "Teacher removed and unassigned from all classes.",
                          })
                        } else if (choice === "reassign") {
                          await actions.reassignTeacherSubjects(targetTeacherId, reassignTo)
                          await actions.deleteTeacherPermanent(targetTeacherId)
                          toast({
                            title: "Teacher deleted",
                            description: "Timetable entries reassigned to selected teacher.",
                          })
                        } else {
                          await actions.deleteTeacherPermanent(targetTeacherId)
                          toast({ title: "Teacher deleted", description: "Teacher and timetable entries removed." })
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
