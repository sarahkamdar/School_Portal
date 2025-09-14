"use client"

// DEPRECATED: This page is no longer used in the application.
// The "Enter Marks" functionality has been moved to /teacher/marks
// which provides a better user experience with proper validation,
// subject filtering, and error handling.
// The class teacher result overview is available in /teacher/view-results

import { useMemo, useRef, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { actions, useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ResultsPage() {
  const { teacherId } = useAuth()
  const d = useAppData()
  const teacher = d.teachers.find((t) => t.id === teacherId)
  const isClassTeacher = !!teacher?.isClassTeacher && !!teacher?.classId

  const [examId, setExamId] = useState<string>(d.exams[0]?.id || "")
  const [classId, setClassId] = useState<string>(d.exams[0]?.classId || "")
  const [subject, setSubject] = useState<string>(teacher?.subject || "")

  const students = useMemo(() => d.students.filter((s) => s.classId === classId), [d.students, classId])
  const exam = d.exams.find((e) => e.id === examId)
  const total = exam?.totalMarks || 100

  const [marks, setMarks] = useState<Record<string, number>>({})

  const printRef = useRef<HTMLDivElement>(null)

  const addAllMarks = async () => {
    for (const s of students) {
      await actions.addMarks(s.id, examId, subject, marks[s.id] ?? 0, total)
    }
  }

  const downloadMarksheet = () => {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const w = window.open("", "PRINT", "height=600,width=800")
    if (!w) return
    w.document.write(`<html><head><title>Marksheet</title></head><body>${html}</body></html>`)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Marks (Subject Teacher)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Select
            value={examId}
            onValueChange={(v) => {
              setExamId(v)
              setClassId(d.exams.find((e) => e.id === v)?.classId || "")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {d.exams.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classId} onValueChange={(v) => setClassId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {d.classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{`${c.name}-${c.section}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={(v) => setSubject(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {(d.classes.find((c) => c.id === classId)?.subjects || []).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div />
          <div className="md:col-span-4 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Marks ({total})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-32"
                        value={marks[s.id] ?? ""}
                        onChange={(e) => setMarks((m) => ({ ...m, [s.id]: Number(e.target.value) }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:col-span-4">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={addAllMarks}>
              Save Marks
            </Button>
          </div>
        </CardContent>
      </Card>

      {isClassTeacher && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Class Result Overview (Class Teacher)</CardTitle>
            <Button variant="outline" onClick={downloadMarksheet}>
              Download Marksheet
            </Button>
          </CardHeader>
          <CardContent>
            <div ref={printRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subjects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.students
                    .filter((s) => s.classId === teacher!.classId)
                    .map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>
                          {Object.keys(s.marks).length === 0 ? "—" : Object.keys(s.marks).join(", ")}
                        </TableCell>
                        <TableCell>
                          {Object.keys(s.marks).length === 0
                            ? "—"
                            : Object.entries(s.marks)
                                .map(
                                  ([eid, data]) =>
                                    `${eid}: ` +
                                    Object.entries(data.subjects)
                                      .map(([sub, val]) => `${sub} ${val}`)
                                      .join(", "),
                                )
                                .join(" | ")}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
