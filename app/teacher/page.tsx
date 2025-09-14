"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NoticeList } from "@/components/notice-list"
import { useAuth } from "@/components/auth-provider"
import { getTeacherTimetable, useAppData } from "@/lib/storage"
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  ClipboardCheck, 
  AlertTriangle,
  Bell,
  ChevronRight,
  GraduationCap,
  Users
} from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"

export default function TeacherDashboard() {
  const { teacherId } = useAuth()
  const d = useAppData()
  
  if (!teacherId) return null
  
  const teacher = d.teachers.find(t => t.id === teacherId)
  const entries = getTeacherTimetable(teacherId)
  
  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  
  // Get today's classes
  const todayClasses = useMemo(() => {
    return entries
      .filter(entry => entry.day === today)
      .sort((a, b) => a.period - b.period)
      .map(entry => {
        const cls = d.classes.find(c => c.id === entry.classId)
        return {
          ...entry,
          className: cls ? `${cls.name} ${cls.section}` : entry.classId
        }
      })
  }, [entries, today, d.classes])
  
  // Get pending marks (exams without submitted marks)
  const pendingMarks = useMemo(() => {
    const teacherExams = d.exams.filter(exam => {
      const examClass = d.classes.find(c => c.id === exam.classId)
      if (!examClass) return false
      
      // Check if this teacher teaches any subject in this class
      const teachesInClass = entries.some(entry => entry.classId === exam.classId)
      return teachesInClass
    })
    
    // Filter exams that don't have marks submitted for all students in the class
    return teacherExams.filter(exam => {
      const classStudents = d.students.filter(s => s.classId === exam.classId)
      return classStudents.some(student => !student.marks[exam.id])
    })
  }, [d.exams, d.classes, d.students, entries])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome, {teacher?.name || 'Teacher'}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {teacher?.subject ? `${teacher.subject} Teacher` : 'Multi-Subject Teacher'} • 
                {teacher?.isClassTeacher ? ' Class Teacher' : ' Subject Teacher'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Notices Display */}
      <NoticeList 
        title="Latest Notices"
        maxCount={5}
        showEmptyMessage={true}
        compact={true}
      />

      {/* Today's Timetable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule - {today}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your classes for today
              </p>
            </div>
            <Link href="/teacher/timetable">
              <Button variant="outline" size="sm" className="gap-2">
                Full Week
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <p className="font-medium text-gray-600">No Classes Today</p>
              <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <div key={`${cls.day}-${cls.period}`} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <span className="text-sm font-bold text-blue-600">{cls.period}</span>
                    </div>
                    <div>
                      <p className="font-medium">{cls.subject}</p>
                      <p className="text-sm text-muted-foreground">Class {cls.className}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Period {cls.period}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Marks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Pending Marks Entry
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Exams waiting for mark submission
              </p>
            </div>
            {pendingMarks.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {pendingMarks.length} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingMarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-green-600">All Marks Updated!</p>
              <p className="text-sm text-muted-foreground">No pending mark entries at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMarks.slice(0, 5).map((exam) => {
                const examClass = d.classes.find(c => c.id === exam.classId)
                const classStudents = d.students.filter(s => s.classId === exam.classId)
                const pendingStudents = classStudents.filter(s => !s.marks[exam.id]).length
                
                return (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Class {examClass ? `${examClass.name} ${examClass.section}` : exam.classId} • 
                          {pendingStudents} students pending
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-700">
                        {exam.totalMarks} marks
                      </Badge>
                      <Link href="/teacher/marks">
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Enter Marks
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
              {pendingMarks.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  And {pendingMarks.length - 5} more exams requiring marks...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
