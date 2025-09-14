"use client"

import { useState } from "react"
import { useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, CheckCircle, XCircle, BarChart3 } from "lucide-react"

export default function AttendancePage() {
  const d = useAppData()
  const [classId, setClassId] = useState(d.classes[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [viewMode, setViewMode] = useState<"daily" | "summary">("daily")
  
  const selectedClass = d.classes.find(c => c.id === classId)
  const students = d.students.filter((s) => s.classId === classId)

  // For daily view - get attendance for specific date
  const dailyAttendance = students.map(student => ({
    ...student,
    isPresent: student.attendance[selectedDate] === true,
    hasRecord: selectedDate in student.attendance
  }))

  const presentCount = dailyAttendance.filter(s => s.isPresent).length
  const absentCount = dailyAttendance.filter(s => s.hasRecord && !s.isPresent).length
  const noRecordCount = dailyAttendance.filter(s => !s.hasRecord).length

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View attendance records for different classes and dates
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("daily")}
                >
                  Daily View
                </Button>
                <Button
                  variant={viewMode === "summary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("summary")}
                >
                  Summary View
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Class:</label>
              <Select value={classId} onValueChange={(v) => setClassId(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {d.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {viewMode === "daily" && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Date:</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily View */}
      {viewMode === "daily" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No Record</p>
                  <p className="text-2xl font-bold text-gray-600">{noRecordCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Attendance for {selectedClass?.name} {selectedClass?.section} - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center w-32">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyAttendance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">
                        {!student.hasRecord ? (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            No Record
                          </Badge>
                        ) : student.isPresent ? (
                          <Badge className="bg-green-600 hover:bg-green-700">
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Absent
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Summary View */}
      {viewMode === "summary" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Attendance Summary for {selectedClass?.name} {selectedClass?.section}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Total Records</TableHead>
                  <TableHead className="text-center">Present Days</TableHead>
                  <TableHead className="text-center">Absent Days</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const records = Object.keys(student.attendance)
                  const presentDays = records.filter((date) => student.attendance[date]).length
                  const absentDays = records.length - presentDays
                  const attendancePercent = records.length > 0 ? ((presentDays / records.length) * 100).toFixed(1) : "0.0"
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">{records.length}</TableCell>
                      <TableCell className="text-center text-green-600">{presentDays}</TableCell>
                      <TableCell className="text-center text-red-600">{absentDays}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={parseFloat(attendancePercent) >= 75 ? "default" : "destructive"}
                          className={parseFloat(attendancePercent) >= 75 ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {attendancePercent}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
