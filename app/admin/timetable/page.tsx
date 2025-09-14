"use client"

import { useMemo, useState } from "react"
import { useAppData, actions } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const periods = [1, 2, 3, 4, 5, 6]

export default function TimetablePage() {
  const d = useAppData()
  const [classId, setClassId] = useState(d.classes[0]?.id || "")
  const [matrix, setMatrix] = useState<{ subject?: string; teacherId?: string }[][]>(
    Array.from({ length: days.length }, () => Array.from({ length: periods.length }, () => ({}))),
  )

  const submit = async () => {
    const entries = []
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < periods.length; j++) {
        const cell = matrix[i][j]
        if (cell.subject && cell.teacherId) {
          entries.push({ day: days[i], period: periods[j], subject: cell.subject, teacherId: cell.teacherId })
        }
      }
    }
    await actions.setClassTimetable(classId, entries as any)
  }

  const currentTT = useMemo(() => d.classTimetables.find((tt) => tt.classId === classId), [d.classTimetables, classId])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Timetable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={classId} onValueChange={(v) => setClassId(v)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {d.classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{`${c.name}-${c.section}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day \\ Period</TableHead>
                  {periods.map((p) => (
                    <TableHead key={p}>P{p}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((day, i) => (
                  <TableRow key={day}>
                    <TableCell className="font-medium">{day}</TableCell>
                    {periods.map((p, j) => (
                      <TableCell key={p}>
                        <div className="grid gap-2">
                          <Select
                            value={matrix[i][j].subject ?? ""}
                            onValueChange={(v) => {
                              const next = matrix.map((r) => r.map((c) => ({ ...c })))
                              next[i][j].subject = v
                              setMatrix(next)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {(d.subjects || [])
                                .filter((s) => s.classId === classId)
                                .map((s) => (
                                  <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={matrix[i][j].teacherId ?? ""}
                            onValueChange={(v) => {
                              const next = matrix.map((r) => r.map((c) => ({ ...c })))
                              next[i][j].teacherId = v
                              setMatrix(next)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {d.teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{`${t.name} (${t.subject})`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700" onClick={submit}>
            Save Timetable
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Timetable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {!currentTT ? (
            "No timetable yet."
          ) : (
            <ul className="list-inside list-disc">
              {currentTT.entries.map((e, idx) => (
                <li key={idx}>
                  {e.day} P{e.period}: {e.subject} — {d.teachers.find((t) => t.id === e.teacherId)?.name}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
