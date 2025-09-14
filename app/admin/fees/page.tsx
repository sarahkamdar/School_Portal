"use client"

import { useMemo, useState } from "react"
import { getPendingFeesFrom, actions, useAppData } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Users, AlertTriangle, CheckCircle, Filter } from "lucide-react"

export default function FeesPage() {
  const d = useAppData()
  const [q, setQ] = useState("")
  const [classNameFilter, setClassNameFilter] = useState<string>("all")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("Male") // Default to boys only

  const allClassNames = useMemo(() => Array.from(new Set(d.classes.map((c) => c.name))), [d.classes])
  const allSections = useMemo(() => Array.from(new Set(d.classes.map((c) => c.section))), [d.classes])

  const pending = getPendingFeesFrom(d)
  
  // Filter for boys with unpaid fees as requested
  const rows = useMemo(() => {
    return pending.filter(({ student }) => {
      const cls = d.classes.find((c) => c.id === student.classId)
      const matchesGender = genderFilter === "all" ? true : student.gender === genderFilter
      const matchesClass = classNameFilter === "all" ? true : cls?.name === classNameFilter
      const matchesSection = sectionFilter === "all" ? true : cls?.section === sectionFilter
      const matchesSearch = q.trim() ? student.name.toLowerCase().includes(q.trim().toLowerCase()) : true
      return matchesGender && matchesClass && matchesSection && matchesSearch
    })
  }, [pending, d.classes, classNameFilter, sectionFilter, genderFilter, q])

  // Calculate total pending amount for filtered boys
  const totalPendingAmount = useMemo(() => {
    let total = 0
    rows.forEach(({ student, pending: pendingTypes }) => {
      const classFees = (d.fees || []).filter(f => f.classId === student.classId)
      pendingTypes.forEach(feeType => {
        const fee = classFees.find(f => f.type === feeType)
        if (fee) total += fee.amount
      })
    })
    return total
  }, [rows, d.fees])

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Fees Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage outstanding fee payments
              </p>
            </div>
            {rows.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {rows.length} Students
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Students with Pending Fees</p>
                  <p className="text-2xl font-bold text-red-600">{rows.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Total Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">₹{totalPendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Collection Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {d.students.length > 0 ? ((1 - rows.length / d.students.length) * 100).toFixed(1) : "0"}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Fees Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Pending Fees List
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Filter and manage student fee payments
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student name"
              className="w-full md:w-56"
            />
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Male">Boys</SelectItem>
                <SelectItem value="Female">Girls</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classNameFilter} onValueChange={setClassNameFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {allClassNames.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {allSections.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-lg font-medium text-green-600">All Fees Collected!</p>
              <p className="text-sm text-muted-foreground">
                {genderFilter === "Male" ? "No boys have" : genderFilter === "Female" ? "No girls have" : "No students have"} pending fee payments.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Pending Fees</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ student, pending: p }) => {
                  const cls = d.classes.find((c) => c.id === student.classId)
                  const pendingAmount = p.reduce((sum, feeType) => {
                    const fee = (d.fees || []).find(f => f.classId === student.classId && f.type === feeType)
                    return sum + (fee?.amount || 0)
                  }, 0)
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant={student.gender === "Male" ? "default" : "secondary"}>
                          {student.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>{cls ? `${cls.name} ${cls.section}` : "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.map(feeType => (
                            <Badge key={feeType} variant="outline" className="text-xs">
                              {feeType}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        ₹{pendingAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {p.length ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Mark as Paid
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {p.map((feeType) => {
                                const fee = (d.fees || []).find(f => f.classId === student.classId && f.type === feeType)
                                return (
                                  <DropdownMenuItem 
                                    key={feeType} 
                                    onClick={() => actions.markFeePaid(student.id, feeType)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark {feeType} paid (₹{fee?.amount || 0})
                                  </DropdownMenuItem>
                                )
                              })}
                              <DropdownMenuItem 
                                onClick={() => {
                                  p.forEach(feeType => actions.markFeePaid(student.id, feeType))
                                }}
                                className="font-medium"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark All Paid (₹{pendingAmount})
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
