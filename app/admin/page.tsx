"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppData, getPendingFeesFrom } from "@/lib/storage"
import { NoticeList } from "@/components/notice-list"
import { 
  Users, 
  GraduationCap, 
  School, 
  DollarSign, 
  UserCheck, 
  Bell,
  AlertTriangle
} from "lucide-react"
import { useMemo } from "react"

export default function AdminDashboard() {
  const d = useAppData()
  
  // Calculate pending fees
  const pendingFeesData = useMemo(() => getPendingFeesFrom(d), [d])
  const totalPendingAmount = useMemo(() => {
    let total = 0
    pendingFeesData.forEach(({ student, pending }) => {
      const classFees = (d.fees || []).filter(f => f.classId === student.classId)
      pending.forEach(feeType => {
        const fee = classFees.find(f => f.type === feeType)
        if (fee) total += fee.amount
      })
    })
    return total
  }, [pendingFeesData, d.fees])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">School Administration Dashboard</CardTitle>
          <p className="text-muted-foreground">
            Welcome to your comprehensive school management overview
          </p>
        </CardHeader>
      </Card>

      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{d.students.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {d.classes.length} classes
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                <p className="text-3xl font-bold text-green-600">{d.teachers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {d.teachers.filter(t => t.isClassTeacher).length} class teachers
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                <p className="text-3xl font-bold text-purple-600">{d.classes.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(d.subjects || []).length} subjects offered
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <School className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Notices</p>
                <p className="text-3xl font-bold text-orange-600">
                  {d.notices.filter(n => n.active).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently active
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Notices Display */}
      <div>
        <NoticeList 
          title="School Notices & Announcements"
          maxCount={10}
          showEmptyMessage={true}
          compact={false}
        />
      </div>

      {/* Pending Fees Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Fees Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of outstanding fee payments
              </p>
            </div>
            {pendingFeesData.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {pendingFeesData.length} Students
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingFeesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-green-600">All Fees Collected!</p>
              <p className="text-sm text-muted-foreground">No pending fee payments at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Students with Pending Fees</p>
                  <p className="text-2xl font-bold text-red-600">{pendingFeesData.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">Total Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">₹{totalPendingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Collection Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {((1 - pendingFeesData.length / d.students.length) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Recent Pending Fees (Top 5)</h4>
                <div className="space-y-2">
                  {pendingFeesData.slice(0, 5).map(({ student, pending }) => {
                    const studentClass = d.classes.find(c => c.id === student.classId)
                    const pendingAmount = pending.reduce((sum, feeType) => {
                      const fee = (d.fees || []).find(f => f.classId === student.classId && f.type === feeType)
                      return sum + (fee?.amount || 0)
                    }, 0)
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Class: {studentClass ? `${studentClass.name} ${studentClass.section}` : student.classId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">₹{pendingAmount.toLocaleString()}</p>
                          <div className="flex gap-1 mt-1">
                            {pending.slice(0, 3).map(feeType => (
                              <Badge key={feeType} variant="outline" className="text-xs">
                                {feeType}
                              </Badge>
                            ))}
                            {pending.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pending.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {pendingFeesData.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      And {pendingFeesData.length - 5} more students with pending fees...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
